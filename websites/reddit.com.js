/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("Reddit bypass script is running");
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        await browser.scripting.executeScript({
            target: {
                tabId: details.tabId,
            },
            func: () => {
                const blockedId = "configured-xpromo-blocking_xpromo_nsfw_blocking_desktop"; //Subreddit popup
                const promptContainerTagName = "xpromo-nsfw-blocking-container" //Standalone post popup

                // Check if the popup gets added to the page
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType !== Node.ELEMENT_NODE) continue;

                            // Check the node itself

                            if (node.id === blockedId) {
                                node.remove();
                                continue;
                            }

                            // Standalone posts
                            if (node.tagName === promptContainerTagName) {

                                node.shadowRoot.querySelector?.(".prompt").remove()
                            }


                            // Check descendants
                            const target = node.querySelector?.(`#${CSS.escape(blockedId)}`);
                            if (target) {
                                target.remove();
                            }
                            const target2 = node.querySelector?.(promptContainerTagName)
                            if (target2 && target2.shadowRoot) {
                                target2.shadowRoot.querySelector?.(".prompt").remove()
                            }

                        }
                    }
                });

                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true
                });

                // If the element is already there, just remove it
                if (document.getElementById(blockedId)) {
                    document.getElementById(blockedId).remove()
                }
                if (document.querySelector(promptContainerTagName)) {
                    document.querySelector(promptContainerTagName).shadowRoot.querySelector(".prompt").remove()
                }
                Array.from(document.querySelectorAll("style")).filter(item => item.innerText?.includes(".rpl-scroll-lock"))[0]?.remove()

            },
        });

    },
    { urls: ["*://*.redditstatic.com/*"] },
    []
);


const TEST_IDS_TO_REMOVE = [
    "nsfw-bypassable-modal-client-css",
    "experiences-client-css"
];

browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log("Main subreddit request intercepted:", details.url);
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

                // Remove matching style tags
                doc.head
                    .querySelectorAll("style[data-testid]")
                    .forEach((styleEl) => {
                        if (
                            TEST_IDS_TO_REMOVE.includes(
                                styleEl.getAttribute("data-testid")
                            )
                        ) {
                            console.log("Removing from response", styleEl)
                            styleEl.remove();
                        }
                    });

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
        urls: ["*://*.reddit.com/r/*"], types: ["main_frame"]
    },
    ["blocking"]
);