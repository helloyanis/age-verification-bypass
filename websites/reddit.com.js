/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("Reddit bypass script is running");
browser.webRequest.onCompleted.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        await browser.scripting.insertCSS({
            target: {
                tabId: details.tabId,
            },
            css:
                // 18+ popup & login upsell
                `#configured-xpromo-blocking_xpromo_nsfw_blocking_desktop, #configured-xpromo-blocking_xpromo_nsfw_blocking, #desktop-dynamic-upsell-dialog{
                    display: none !important
                }
                `,
            origin: "USER" // Prevent reddit from overriding it
            
        })
        await browser.scripting.executeScript({
            target: {
                tabId: details.tabId
             },
            func: () => {
                document.querySelector("xpromo-nsfw-blocking-container")?.shadowRoot.querySelector?.(".prompt").remove()
                document.body.classList.remove("rpl-scroll-lock")
            },
            world: "MAIN"
        });
        // If should unblur media on reddit, remove the style that blurs media
        browser.storage.local.get('redditSetting').then((result) => {
            if (result['redditSetting'] === "unblur") {
                browser.scripting.executeScript({
                    target: {
                        tabId: details.tabId,
                    },
                    func: () => {
                        Array.from(document.querySelectorAll("shreddit-blurred-container[blurred]")).forEach(container => {
                            container.removeAttribute("blurred");
                        });
                        // Unblur right rail

                        document.querySelectorAll("reddit-pdp-right-rail-post").forEach(post=>{
                            post.querySelector("div[data-testid='post-thumbnail'")?.querySelector("img")?.setAttribute("style","")
                            //18+ shadow
                            post.querySelector("div[data-testid='post-thumbnail'")?.querySelector("div")?.remove()
                        })
                    }
                })

                // Unblur search results

                browser.scripting.insertCSS({
                    target: {
                        tabId: details.tabId,
                    },
                    css:
                        // 18+ popup & login upsell
                        `.thumbnail-blur{
                            filter: none !important
                        }
                        `,
                    origin: "USER" // Prevent reddit from overriding it
                    
                })
            }
        });


    },
    { urls: ["*://*.reddit.com/svc/shreddit/events"] },
    []
);