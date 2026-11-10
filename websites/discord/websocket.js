/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(() => {
    if (window.__discordGatewayInterceptorInstalled) return;
    window.__discordGatewayInterceptorInstalled = true;

    if (!window.pako) {
        console.error("[Age verification bypass] Pako is missing!");
        return;
    }

    const NativeWebSocket = window.WebSocket;
    const states = new WeakMap();

    const Z_SYNC_FLUSH = 2;

    // Join output chunks from Pako.
    function joinChunks(chunks) {
        const length = chunks.reduce(
            (total, chunk) => total + chunk.length, 0
        );

        const output = new Uint8Array(length);
        let offset = 0;

        for (const chunk of chunks) {
            output.set(chunk, offset);
            offset += chunk.length;
        }

        return output;
    }

    // Feed data into a persistent Pako stream and collect its output.
    function pushAndCollect(stream, input) {
        const chunks = [];
        const previousOnData = stream.onData;

        stream.onData = chunk => chunks.push(chunk);

        let success;

        try {
            success = stream.push(input, Z_SYNC_FLUSH);
        } finally {
            stream.onData = previousOnData;
        }

        if (!success || stream.err) {
            throw new Error(
                stream.msg || "[Age verification bypass] Pako stream processing failed"
            );
        }

        return joinChunks(chunks);
    }

    // Append byte arrays.
    function appendBytes(a, b) {
        const output = new Uint8Array(a.length + b.length);
        output.set(a, 0);
        output.set(b, a.length);
        return output;
    }

    // Check for the Discord Z_SYNC_FLUSH suffix.
    function hasFlushSuffix(data) {
        const n = data.length;

        return n >= 4 &&
            data[n - 4] === 0x00 &&
            data[n - 3] === 0x00 &&
            data[n - 2] === 0xff &&
            data[n - 1] === 0xff;
    }

    // Convert incoming WebSocket data into bytes.
    async function toBytes(data) {
        if (data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        }

        if (ArrayBuffer.isView(data)) {
            return new Uint8Array(
                data.buffer,
                data.byteOffset,
                data.byteLength
            );
        }

        if (data instanceof Blob) {
            return new Uint8Array(await data.arrayBuffer());
        }

        throw new Error("[Age verification bypass] Unsupported WebSocket message type");
    }

    // Modify the appropriate Gateway events.
    function modifyGatewayPayload(packet) {
        if (!packet || packet.op !== 0) return;

        const d = packet.d;

        switch (packet.t) {
            case "READY":
                d.user.age_verification_status = 3;
                d.user.nsfw_allowed = true;
                console.log("[Age verification bypass] READY event modified:", d.user);
                break;
            case "USER_UPDATE":
                d.age_verification_status = 3;
                d.nsfw_allowed = true;
                console.log("[Age verification bypass] USER_UPDATE event modified:", d);
                break;
            default:
                break;
        }
    }

    // Create an event containing the replacement message.
    function dispatchReplacement(socket, originalEvent, data, state) {
        const replacement = new MessageEvent("message", {
            data,
            origin: originalEvent.origin,
            lastEventId: originalEvent.lastEventId,
            source: originalEvent.source,
            ports: originalEvent.ports
        });

        // Prevent our own capture listener from processing it again.
        state.forwarded.add(replacement);

        socket.dispatchEvent(replacement);
    }

    // Process an incoming message.
    async function processIncoming(socket, event, state) {
        const originalData = event.data;

        // Convert compressed message data into bytes.
        const chunk = await toBytes(originalData);

        // Accumulate compressed bytes until Z_SYNC_FLUSH.
        state.pending = appendBytes(state.pending, chunk);

        if (!hasFlushSuffix(state.pending)) {
            return;
        }

        const compressed = state.pending;
        state.pending = new Uint8Array(0);

        // Decompress with the persistent connection inflater.
        const decodedBytes = pushAndCollect(
            state.inflater,
            compressed
        );

        const decodedText = new TextDecoder().decode(decodedBytes);

        let outputText = decodedText;

        const packet = JSON.parse(decodedText);

        // Log the original decoded payload (debug)
        // console.log("incoming", packet);

        modifyGatewayPayload(packet);

        outputText = JSON.stringify(packet);

        // Recompress using a separate persistent zlib context.
        const modifiedCompressed = pushAndCollect(
            state.deflater,
            outputText
        );

        // Preserve the original WebSocket binary type.
        const outputData = originalData instanceof Blob
            ? new Blob([modifiedCompressed], {
                type: originalData.type
            })
            : modifiedCompressed.buffer.slice(
                modifiedCompressed.byteOffset,
                modifiedCompressed.byteOffset +
                    modifiedCompressed.byteLength
            );

        dispatchReplacement(socket, event, outputData, state);
    }

    // Replacement WebSocket constructor.
    class InterceptedWebSocket extends NativeWebSocket {
        constructor(url, protocols) {
            if (protocols === undefined) {
                super(url);
            } else {
                super(url, protocols);
            }

            let parsedUrl;

            try {
                parsedUrl = new URL(String(url), location.href);
            } catch {
                return;
            }
            
            // Only intercept Discord's JSON zlib-stream connection.
            if (
                parsedUrl.hostname !== "gateway.discord.gg" ||
                parsedUrl.protocol !== "wss:" ||
                parsedUrl.searchParams.get("encoding") !== "json" ||
                parsedUrl.searchParams.get("compress") !== "zlib-stream"
            ) {
                return console.log("[Age verification bypass] Found non-matching URL socket. Skipping.", parsedUrl.hostname);
            }

            console.log("[Age verification bypass] Intercepted gateway connection:", parsedUrl.href);

            // Each connection MUST have independent compression contexts.
            const state = {
                inflater: new pako.Inflate(),
                deflater: new pako.Deflate(),

                pending: new Uint8Array(0),

                queue: Promise.resolve(),

                forwarded: new WeakSet()
            };

            states.set(this, state);

            // Intercept before Discord's own message listeners.
            this.addEventListener("message", event => {
                if (state.forwarded.has(event)) return;

                // Prevent Discord from receiving the original event.
                event.stopImmediatePropagation();

                // Process messages in order.
                state.queue = state.queue
                    .then(() => processIncoming(this, event, state))
                    .catch(error => {

                        console.error(
                            "[Age verification bypass] Processing error:",
                            error
                        );

                        // // Avoid feeding a potentially corrupted stream
                        // // to Discord. A reconnect creates fresh contexts.
                        // try {
                        //     this.close(1011, "Gateway interceptor error");
                        // } catch {}
                    });

            }, { capture: true });
        }
    }

    // Replace the page's original WebSocket constructor.
    window.WebSocket = InterceptedWebSocket;

    console.log("[Age verification bypass] WebSocket replacement installed.");
})();
