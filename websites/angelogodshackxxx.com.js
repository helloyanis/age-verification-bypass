/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log("AngeloGodsHack bypass script is running");
browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log("Request intercepted:", details.url);
        const filter = browser.webRequest.filterResponseData(details.requestId);

        const decoder = new TextDecoder("utf-8");
        const encoder = new TextEncoder();

        const chunks = [];

        filter.ondata = (event) => {
            chunks.push(event.data);
        };

        filter.onstop = () => {
            try {
                // Combine all chunks
                const totalLength = chunks.reduce(
                    (sum, chunk) => sum + chunk.byteLength,
                    0
                );

                const merged = new Uint8Array(totalLength);

                let offset = 0;
                for (const chunk of chunks) {
                    merged.set(new Uint8Array(chunk), offset);
                    offset += chunk.byteLength;
                }

                const html = decoder.decode(merged);

                // Parse HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                // Remove element with age-gate class
                const ageGateElement = doc.querySelector(".age-gate-modal");
                if (ageGateElement) {
                    ageGateElement.remove();
                    console.log("Removed age-gate-modal element");
                }

                // Serialize back to HTML
                const modifiedHtml =
                    "<!DOCTYPE html>\n" +
                    doc.documentElement.outerHTML;

                filter.write(
                    encoder.encode(modifiedHtml)
                );
            } catch (err) {
                console.error(err);

                // Fallback: pass original response through
                filter.write(merged);
            }

            filter.close();
        };
    },
    {
        urls: ["*://*.angelogodshackxxx.com/*"], types: ["main_frame"]
    },
    ["blocking"]
);