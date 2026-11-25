/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


console.log("Bluesky bypass script is running");

// Sensitive posts (auto mod)
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let response = '';
        filter.ondata = event => {
            response += decoder.decode(event.data, { stream: true });
        };

        filter.onstop = async () => {
            setMostRecentSite("bsky", details.tabId)
            try {
                let jsonData = JSON.parse(response);
                const blurSetting = await browser.storage.local.get('bsky').then((result) => result['bsky']);
                if(blurSetting == "off"){
                    filter.write(encoder.encode(response)); // Send back original response
                    filter.close()
                    return
                }
                jsonData.views.forEach(view => {
                    view.policies.labelValueDefinitions = []
                    view.policies.labelValues.forEach(label => {
                        view.policies.labelValueDefinitions.push({
                            adultOnly: false,
                            blurs: blurSetting,
                            defaultSetting: "show",
                            identifier: label,
                            locales: [{
                                description: `This content is labeled as ${label} and was caught by age-verification bypass. If it contains media, click on "show" to view it.`,
                                lang: "en",
                                name: label
                            }],
                            severity: "inform"
                        })
                    })
                })
                filter.write(encoder.encode(JSON.stringify(jsonData)));
                filter.close()
                console.log("Modified JSON data:", jsonData);
            } catch (error) {
                console.warn("Data is not valid JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }

    },
    { urls: ["*://public.api.bsky.app/xrpc/app.bsky.labeler.getServices?*"] },
    ["blocking"]
);

// Sensitive posts (self labeling)

browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let response = '';
        filter.ondata = event => {
            response += decoder.decode(event.data, { stream: true });
        };

        filter.onstop = async () => {
            try {
                setMostRecentSite("bsky", details.tabId)
                const blurSetting = await browser.storage.local.get('bsky').then((result) => result['bsky']);
                if(blurSetting == "off"){
                    filter.write(encoder.encode(response)); // Send back original response
                    filter.close()
                    return
                }
                let jsonData = JSON.parse(response);
                if (details.url.includes("getPostThreadV2")) {
                    // Single post view
                    jsonData?.thread?.forEach(thread => {
                        thread.value.post = spoofBlueskyAutomod(thread.value.post)
                    });
                } else if (details.url.includes("getAuthorFeed")) {
                    // Author feed view
                    jsonData?.feed?.forEach(feed => {
                        feed.post = spoofBlueskyAutomod(feed.post)
                    });
                } else if (details.url.includes("getProfile")) {
                    // Profile view
                    jsonData = { ...jsonData, labels: [] } // Remove labels from profile view. Posts are usually labelled individually, so you are still warned about nsfw content in the feed, but the profile view doesn't need to have labels on it.
                } else if (details.url.includes("getFeed")) {
                    // Feed view
                    jsonData?.feed?.forEach(feed => {
                        feed.post = spoofBlueskyAutomod(feed.post)
                    });
                } else {
                    console.warn("Unknown request URL:", details.url);
                }
                filter.write(encoder.encode(JSON.stringify(jsonData)));
                filter.close()
                console.log("Modified JSON data:", jsonData);
            } catch (error) {
                console.warn("Data is not valid JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }

    },
    { urls: ["*://public.api.bsky.app/xrpc/app.bsky.unspecced.getPostThreadV2?*", "*://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?*", "*://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?*", "https://api.bsky.app/xrpc/app.bsky.feed.getFeed?*"] },
    ["blocking"]
);


// Age assurance config request (the one that completely blocks the site)
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let response = '';
        filter.ondata = event => {
            response += decoder.decode(event.data, { stream: true });
        };


        filter.onstop = async () => {
            try {
                setMostRecentSite("bsky", details.tabId)
                const blurSetting = await browser.storage.local.get('bsky').then((result) => result['bsky']);
                if(blurSetting == "off"){
                    filter.write(encoder.encode(response)); // Send back original response
                    filter.close()
                    return
                }
                let jsonData = JSON.parse(response);
                jsonData.regions = []
                filter.write(encoder.encode(JSON.stringify(jsonData)));
                filter.close()
            } catch (error) {
                console.error("Error parsing JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }

    },
    { urls: ["*://public.api.bsky.app/xrpc/app.bsky.ageassurance.getConfig"] },
    ["blocking"]
);

// Usually, self labels (when people chose to make their content 18+) can't be seen by people who are not logged in. This function spoofs the label source to make it look like it's from bluesky's automod, which allows people to see it even if they are not logged in, due to how I rewrite the response from the getServices labeler earlier in this file..
function spoofBlueskyAutomod(post) {
    if (post?.labels) {
        post.labels.forEach(label => {
            label.src = "did:plc:ar7c4by46qjdydhdevvrndac" // Spoof bluesky's automoderation to let people see it
        })
    }
    return post
}