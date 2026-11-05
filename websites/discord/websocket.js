/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("[Extension] Injected into:", location.href);

(() => {
    if (window.__gatewayPacketRewriteInstalled) {
        return;
    }

    window.__gatewayPacketRewriteInstalled = true;
    const originalParse = JSON.parse;

    // Let the diagnostic WebSocket listener parse packets without
    // invoking the transformer a second time.
    window.__gatewayOriginalJSONParse = originalParse;

    function transformReadyPacket(packet) {
        // Only modify READY dispatches.
        if (
            !packet ||
            packet.op !== 0 ||
            packet.t !== "READY" ||
            !packet.d ||
            !Array.isArray(packet.d.guilds)
        ) {
            return;
        }

        console.debug("[Age Verification Bypass] READY packet detected", packet);
        
        let changedChannels = 0;
        let changedServers = 0;

        for (const guild of packet.d.guilds) {
            if(guild.properties.nsfw === true) {
                guild.properties.nsfw = false
                guild.properties.nsfw_level = 0
                guild.properties.owner_configured_content_level = 0
                changedServers++
            }
            if (!Array.isArray(guild.channels)) {
                continue;
            }

            for (const channel of guild.channels) {
                if (
                    !channel ||
                    typeof channel.id !== "string" ||
                    typeof channel.name !== "string"
                ) {
                    continue;
                }

                if (channel.nsfw === true) {
                    channel.nsfw = false;
                    changedChannels++;
                }
            }
        }

        if (changedChannels > 0 || changedServers > 0) {
            console.debug(
                `[Age Verification Bypass] READY: set ${changedChannels} channel(s) and ${changedServers} servers to not be NSFW`
            );
        }
    }

    JSON.parse = function (text, reviver) {
        const result = originalParse.call(this, text, reviver);

        try {
            transformReadyPacket(result);
        } catch (error) {
            console.warn(
                "[Age Verification Bypass] READY transformation failed:",
                error
            );
        }

        return result;
    };

    console.log("[Gateway rewrite] READY-only parser hook installed");
})();



// Decode and log zlib-stream packets from Discord's gateway.
(() => {
    // Prevent duplicate installation in the same page world.
    if (window.__gatewayHookInstalled) {
        console.warn("[Gateway] Hook already installed");
        return;
    }

    window.__gatewayHookInstalled = true;

    const OriginalWebSocket = window.WebSocket;
    const Z_SYNC_FLUSH = 2;

    function hex(bytes, count = 12) {
        return Array.from(bytes.slice(0, count), b =>
            b.toString(16).padStart(2, "0")
        ).join(" ");
    }

    function endsWithSuffix(bytes) {
        const n = bytes.length;

        return n >= 4 &&
            bytes[n - 4] === 0x00 &&
            bytes[n - 3] === 0x00 &&
            bytes[n - 2] === 0xff &&
            bytes[n - 1] === 0xff;
    }

    function appendBuffer(a, b) {
        const result = new Uint8Array(a.length + b.length);
        result.set(a);
        result.set(b, a.length);
        return result;
    }

    function joinChunks(chunks) {
        const totalLength = chunks.reduce(
            (total, chunk) => total + chunk.length,
            0
        );

        const result = new Uint8Array(totalLength);
        let offset = 0;

        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result;
    }

    function toBytes(data) {
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

        return null;
    }

    function WrappedWebSocket(url, protocols) {
        const ws = protocols === undefined
            ? new OriginalWebSocket(url)
            : new OriginalWebSocket(url, protocols);

        // Only inspect connections explicitly using zlib-stream.
        let parsedUrl;

        try {
            parsedUrl = new URL(String(url));
        } catch {
            return ws;
        }

        if (
            parsedUrl.hostname !== "gateway.discord.gg" ||
            parsedUrl.searchParams.get("compress") !== "zlib-stream"
        ) {
            return ws;
        }

        // Request binary messages as ArrayBuffers, not Blobs.
        ws.binaryType = "arraybuffer";

        // All stream state belongs to this connection.
        let buffer = new Uint8Array(0);
        let outputChunks = [];
        let pending = Promise.resolve();
        let decodeFailed = false;
        let flushCount = 0;

        // Exactly one inflater for the lifetime of this connection.
        const inflater = new window.pako.Inflate();

        inflater.onData = chunk => {
            outputChunks.push(chunk);
        };

        console.debug("[Age Verification Bypass] Monitoring zlib-stream connection", {
            url: parsedUrl.href
        });

        // Exactly one message listener. Do not nest another listener here.
        ws.addEventListener("message", event => {
            pending = pending.then(async () => {
                if (decodeFailed) return;

                let bytes;

                if (event.data instanceof Blob) {
                    bytes = new Uint8Array(
                        await event.data.arrayBuffer()
                    );
                } else {
                    bytes = toBytes(event.data);
                }

                if (!bytes) {
                    console.warn(
                        "[Age Verification Bypass] Unexpected WebSocket data type",
                        typeof event.data
                    );
                    return;
                }

                // Keep all bytes until we reach a flush boundary.
                buffer = appendBuffer(buffer, bytes);

                if (!endsWithSuffix(buffer)) {
                    return;
                }

                const compressed = buffer;
                buffer = new Uint8Array(0);
                outputChunks = [];

                const blockNumber = ++flushCount;


                const ok = inflater.push(
                    compressed,
                    Z_SYNC_FLUSH
                );

                if (!ok || inflater.err !== 0) {
                    decodeFailed = true;

                    console.error(
                        "[Age Verification Bypass] Decompression failed. " +
                        "Further processing stopped for this connection.",
                        {
                            block: blockNumber,
                            error: inflater.err,
                            message: inflater.msg
                        }
                    );

                    return;
                }

                const decodedBytes = joinChunks(outputChunks);

                if (decodedBytes.length === 0) {
                    return;
                }

                const text = new TextDecoder("utf-8")
                    .decode(decodedBytes);

                try {
                    const parseForLogging =
                    window.__gatewayOriginalJSONParse || JSON.parse;

                // console.log("[Age Verification Bypass] Gateway packet observer]", packet);
                } catch (error) {
                    console.warn(
                        "[Age Verification Bypass] Output was not valid JSON",
                        { text, error }
                    );
                }
            }).catch(error => {
                console.error("[Age Verification Bypass] Processing error:", error);
            });
        });

        return ws;
    }

    // Preserve the WebSocket constructor's prototype and static inheritance.
    Object.setPrototypeOf(WrappedWebSocket, OriginalWebSocket);
    WrappedWebSocket.prototype = OriginalWebSocket.prototype;

    window.WebSocket = WrappedWebSocket;
})();