/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// THIS IS CURRENTLY NOT FUNCTIONAL AND IS A WORK IN PROGRESS!!! This file is not yet linked to the manifest or ran anywhere.

console.log("X.com bypass script is running");

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
                let jsonData = JSON.parse(response);
                if (jsonData?.data?.tweetResult?.result?.mediaVisibilityResults) {
                    console.log("Detected NSFW post :", jsonData);
                    jsonData.data.tweetResult.result = { ...jsonData.data.tweetResult.result.tweet };
                    jsonData.data.tweetResult.result.__typename = "Tweet";
                    jsonData.data.tweetResult.result.core.user_results.result.profile_metadata.profile_interstitial_type = "";
                    jsonData.data.tweetResult.result.legacy.possibly_sensitive = false;
                    delete jsonData.data.tweetResult.result.tweet;
                }
                console.log("Modified JSON data:", jsonData);
                filter.write(encoder.encode(JSON.stringify(jsonData)));
                filter.close();
            } catch (error) {
                console.warn("Data is not valid JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }
        
    },
    { urls: ["https://x.com/i/api/graphql/*/TweetResultByRestId?*"] },
    ["blocking"]
);

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
                let jsonData = JSON.parse(response);
                jsonData?.data?.threaded_conversation_with_injections_v2?.instructions?.forEach(instruction => {
                    if (instruction?.type === "TimelineAddEntries") {
                        instruction.entries.forEach(entry => {
                            if (entry?.content?.itemContent?.tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
                                // Remove the visibility results and set the tweet result to the tweet itself
                                entry.content.itemContent.tweet_results.result = { ...entry.content.itemContent.tweet_results.result.tweet };
                                entry.content.itemContent.tweet_results.result.__typename = "Tweet";
                                entry.content.itemContent.tweet_results.result.core.user_results.result.profile_metadata.profile_interstitial_type = "";
                                entry.content.itemContent.tweet_results.result.legacy.possibly_sensitive = false;
                                delete entry.content.itemContent.tweet_results.result.tweet;
                            }
                        });
                    }
                });
                console.log("Modified JSON data:", jsonData);
                filter.write(encoder.encode(JSON.stringify(jsonData)));
                filter.close();
            } catch (error) {
                console.warn("Data is not valid JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }
        
    },
    { urls: ["https://x.com/i/api/graphql/*/TweetDetail?*"] },
    ["blocking"]
);
