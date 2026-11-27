/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("X.com bypass script is running");

// Single post view
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
                // API v1
                jsonData?.data?.tweet?.result && (jsonData.data.tweet.result = unblurTweet(jsonData.data.tweet.result, details.tabId));
                jsonData?.data?.tweetResult?.result && (jsonData.data.tweetResult.result = unblurTweet(jsonData.data.tweetResult.result, details.tabId));

                // API v2
                jsonData?.data?.tweet_result_by_rest_id?.result && (jsonData.data.tweet_result_by_rest_id.result = unblurTweet(jsonData.data.tweet_result_by_rest_id.result, details.tabId));

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
    { urls: ["https://x.com/i/api/graphql/*/TweetResultByRestId?*", "https://api.x.com/graphql/*/TweetResultByRestId?*"] },
    ["blocking"]
);

// Single post view part 2 : Electric bogaloo

// Apparently single post pages do 2 requests and you have to change them both to bypass age checks.

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
            browser.storage.local.get('twitter').then((result) => {
                const twitterSetting = result['twitter'];
                if (twitterSetting &&
                    twitterSetting.includes("home") && details.url.includes("HomeTimeline") || //DONE
                    twitterSetting.includes("following") && details.url.includes("HomeLatestTimeline") || //DONE
                    twitterSetting.includes("search") && (details.url.includes("SearchTimeline") || details.url.includes("SearchByRawQuery")) ||
                    twitterSetting.includes("bookmarks") && (details.url.includes("Bookmarks") || details.url.includes("BookmarkTimeline")) || //DONE
                    twitterSetting.includes("profile") && (details.url.includes("UserOriginalsTimeline") || details.url.includes("UserTweets") || details.url.includes("UserRepliesTimeline") || details.url.includes("UserRepostsTimeline")) ||
                    details.url.includes("TweetDetail") || details.url.includes("tweetMediaViewerQuery")
                ) {
                    try {
                        let jsonData = JSON.parse(response);
                        // Thread posts
                        jsonData?.data?.threaded_conversation_with_injections_v2?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries" || instruction?.__typename === "TimelineAddEntries") {
                                instruction.entries?.forEach(entry => {
                                    // API v1 of the twitter api
                                    if (entry.content?.itemContent?.tweet_results?.result) {
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result, details.tabId);
                                    }


                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item.item?.itemContent?.tweet_results?.result) {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result, details.tabId);
                                        }
                                    });

                                    // API v2 of the twitter api
                                    if (entry.content?.content?.tweet_results?.result) {
                                        entry.content.content.tweet_results.result = unblurTweet(entry.content.content.tweet_results.result, details.tabId);
                                    }

                                });
                            }
                        });
                        // In API v2 sometimes there's some data here too
                        if (jsonData?.data?.tweet_result_by_rest_id?.result) {
                            jsonData.data.tweet_result_by_rest_id.result = unblurTweet(jsonData.data.tweet_result_by_rest_id.result, details.tabId);
                        }

                        // Search results
                        // API v1 of the twitter api
                        jsonData?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries?.forEach(entry => {
                                    // Remove the visibility results and set the tweet result to the tweet itself
                                    if (entry.content?.itemContent?.tweet_results?.result) {
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result, details.tabId);
                                    }
                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item.item?.itemContent?.tweet_results?.result) {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result, details.tabId);
                                        }
                                    });
                                });
                            }
                            // API v2 of the twitter api
                            unblurInstructionEntriesV2(instruction);
                        });

                        // Home & following timeline
                        // API v1 of the twitter api
                        jsonData?.data?.home?.home_timeline_urt?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries?.forEach(entry => {
                                    // Remove the visibility results and set the tweet result to the tweet itself
                                    if (entry.content?.itemContent?.tweet_results?.result) {
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result, details.tabId);
                                    }
                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item.item?.itemContent?.tweet_results?.result) {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result, details.tabId);
                                        }
                                    });
                                });
                            }
                        });
                        // API v2 of the twitter api
                        jsonData?.data?.home_timeline?.home_timeline_urt?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries?.forEach(entry => {
                                    // Remove the visibility results and set the tweet result to the tweet itself
                                    if (entry.content?.content?.tweet_results?.result) {
                                        entry.content.content.tweet_results.result = unblurTweet(entry.content.content.tweet_results.result, details.tabId);
                                    }
                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item.item?.content?.tweet_results?.result) {
                                            item.item.content.tweet_results.result = unblurTweet(item.item.content.tweet_results.result, details.tabId);
                                        }
                                    });
                                });
                            }
                        });

                        // Bookmarks
                        jsonData?.data?.bookmark_timeline_v2?.timeline?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries" || instruction?.__typename === "TimelineAddEntries") {
                                instruction.entries?.forEach(entry => {
                                    // Remove the visibility results and set the tweet result to the tweet itself
                                    //v1 of the twitter api
                                    if (entry.content?.itemContent?.tweet_results?.result) {
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result, details.tabId);
                                    }
                                    //v2 of the twitter api
                                    if (entry.content?.content?.tweet_results?.result) {
                                        entry.content.content.tweet_results.result = unblurTweet(entry.content.content.tweet_results.result, details.tabId);
                                    }
                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item.item?.itemContent?.tweet_results?.result) {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result, details.tabId);
                                        }
                                    });
                                });
                            }
                        });

                        // Profile pages
                        // API v1 of the twitter api
                        jsonData?.data?.user?.result?.timeline?.timeline?.instructions?.forEach(instruction => {
                            if (instruction?.type === "TimelineAddEntries") {
                                instruction.entries?.forEach(entry => {
                                    // Basic posts
                                    if (entry.content?.itemContent?.tweet_results?.result) {
                                        entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result, details.tabId);
                                    }

                                    // Replies in threads
                                    entry?.content?.items?.forEach(item => {
                                        if (item.item?.itemContent?.tweet_results?.result) {
                                            item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result, details.tabId);
                                        }
                                    });
                                });
                            }

                            if (instruction?.type === "TimelinePinEntry") {
                                // This one has a single entry instead of an array of entries
                                const entry = instruction.entry;
                                // Basic posts
                                // Remove the visibility results and set the tweet result to the tweet itself
                                if (entry.content?.itemContent?.tweet_results?.result) {
                                    entry.content.itemContent.tweet_results.result = unblurTweet(entry.content.itemContent.tweet_results.result, details.tabId);
                                }

                                // Replies
                                entry?.content?.items?.forEach(item => {
                                    if (item.item?.itemContent?.tweet_results?.result) {
                                        item.item.itemContent.tweet_results.result = unblurTweet(item.item.itemContent.tweet_results.result, details.tabId);
                                    }
                                });
                            }
                        })

                        // API v2 of the twitter api
                        jsonData?.data?.user_result_by_screen_name?.result?.profile_user_originals_timeline?.timeline?.instructions?.forEach(instruction => {
                            instruction = unblurInstructionEntriesV2(instruction, details.tabId);
                        });
                        // Tweets and replies
                        jsonData?.data?.user_result_by_screen_name?.result?.profile_with_replies_timeline_v2?.timeline?.instructions?.forEach(instruction => {
                            instruction = unblurInstructionEntriesV2(instruction, details.tabId);
                        });

                        // Replies
                        jsonData?.data?.user_result_by_screen_name?.result?.profile_user_replies_timeline?.timeline?.instructions?.forEach(instruction => {
                            instruction = unblurInstructionEntriesV2(instruction, details.tabId);
                        });
                        console.log("Modified JSON data:", jsonData);
                        filter.write(encoder.encode(JSON.stringify(jsonData)));
                        filter.close();

                        // Reposts
                        jsonData?.data?.user_result_by_screen_name?.result?.profile_user_reposts_timeline?.timeline?.instructions?.forEach(instruction => {
                            instruction = unblurInstructionEntriesV2(instruction, details.tabId);
                        });
                    } catch (error) {
                        console.warn("Data is not valid JSON:", error);
                        filter.write(encoder.encode(response));
                        filter.close();
                    }
                } else {
                    console.log("Twitter setting does not match this request, passing through unmodified.");
                    setMostRecentSite("twitter", details.tabId, "OFF")
                    filter.write(encoder.encode(response));
                    filter.close();
                }
            })
        }

    },
    { urls: ["https://x.com/i/api/graphql/*/TweetDetail?*", "https://api.x.com/graphql/*/TweetDetail?*", "https://x.com/i/api/graphql/*/SearchTimeline?*", "https://api.x.com/graphql/*/SearchByRawQuery?*", "https://x.com/i/api/graphql/*/HomeTimeline", "https://api.x.com/graphql/*/HomeTimeline", "https://x.com/i/api/graphql/*/HomeLatestTimeline", "https://api.x.com/graphql/*/HomeLatestTimelineQuery?*", "https://x.com/i/api/graphql/*/Bookmarks?*", "https://api.x.com/graphql/*/BookmarkTimeline?*", "https://x.com/i/api/graphql/*/UserOriginalsTimeline?*", "https://api.x.com/graphql/*/UserOriginalsTimeline?*", "https://api.x.com/graphql/*/UserTweets?*", "https://x.com/i/api/graphql/*/UserTweetsAndReplies?*", "https://api.x.com/graphql/*/UserTweets?*", "https://x.com/i/api/graphql/*/UserRepliesTimeline?*", "https://api.x.com/graphql/*/UserRepliesTimeline?*", "https://x.com/i/api/graphql/*/UserRepostsTimeline?*", "https://api.x.com/graphql/*/UserRepostsTimeline?*", "https://api.x.com/graphql/*/tweetMediaViewerQuery?*"] },
    ["blocking"]
);

function unblurTweet(tweet, tabId = null) {
    tabId && setMostRecentSite("twitter", tabId)
    if (tweet?.__typename === "TweetWithVisibilityResults") {
        console.log("Unblurring tweet:", tweet);
        tweet = { ...tweet.tweet };
        tweet.__typename = "Tweet";
        tweet.__isTimelineTimelineItemContent && (tweet.__isTimelineTimelineItemContent = "Tweet");
        tweet.core?.user_results?.result?.profile_metadata?.profile_interstitial_type && (tweet.core.user_results.result.profile_metadata.profile_interstitial_type = "");
        tweet.legacy && (tweet.legacy.possibly_sensitive = false);
        delete tweet.tweet;
        console.log("Tweet unblurred:", tweet);
    }

    // Quoted posts can also be blurred, so we need to check for that as well
    if (tweet?.quoted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
        tweet.quoted_status_result.result = unblurTweet(tweet.quoted_status_result.result, tabId);
    }
    if (tweet?.quotedRefResult?.result?.__typename === "TweetWithVisibilityResults") {
        tweet.quotedRefResult.result = unblurTweet(tweet.quotedRefResult.result, tabId);
    }
    if (tweet?.nested_quoted_tweet_results?.result?.__typename === "TweetWithVisibilityResults") {
        tweet.nested_quoted_tweet_results.result = unblurTweet(tweet.nested_quoted_tweet_results.result, tabId);
    }
    if (tweet?.legacy?.retweeted_status_result?.result?.__typename === "TweetWithVisibilityResults") {
        tweet.legacy.retweeted_status_result.result = unblurTweet(tweet.legacy.retweeted_status_result.result, tabId);
    }
    if (tweet?.legacy?.retweeted_status_results?.result?.__typename === "TweetWithVisibilityResults") {
        tweet.legacy.retweeted_status_results.result = unblurTweet(tweet.legacy.retweeted_status_results.result, tabId);
    }
    if (tweet?.quotedRefResult?.result?.__typename === "TweetWithVisibilityResults") {
        tweet.quotedRefResult.result.__typename = "Tweet";
    }
    if(tweet?.media_entities2) {
        tweet.media_entities2 .forEach(media => {
            if(media?.sensitive_media_warning) {
                // Remove this key to prevent the warning from showing up
                delete media.sensitive_media_warning;
            }
        });
    }
    if(tweet?.legacy?.extended_entities?.media) {
        tweet.legacy.extended_entities.media.forEach(media => {
            if(media?.sensitive_media_warning) {
                // Remove this key to prevent the warning from showing up
                delete media.sensitive_media_warning;
            }
        });
    }
    return tweet;
}

function unblurInstructionEntriesV2(instruction, tabId = null) {
    if (instruction?.__typename === "TimelineAddEntries") {
        instruction.entries?.forEach(entry => {
            // Basic posts
            if (entry.content?.content?.tweet_results?.result) {
                entry.content.content.tweet_results.result = unblurTweet(entry.content.content.tweet_results.result, tabId);
            }

            // Replies in threads
            entry?.content?.items?.forEach(item => {
                if (item.item?.content?.tweet_results?.result) {
                    item.item.content.tweet_results.result = unblurTweet(item.item.content.tweet_results.result, tabId);
                }
            });
        });
    }
    if (instruction?.__typename === "TimelinePinEntry") {
        // This one has a single entry instead of an array of entries
        const entry = instruction.entry;
        // Basic posts
        if (entry.content?.content?.tweet_results?.result) {
            entry.content.content.tweet_results.result = unblurTweet(entry.content.content.tweet_results.result, tabId);
        }

        // Replies in threads
        entry?.content?.items?.forEach(item => {
            if (item.item?.content?.tweet_results?.result) {
                item.item.content.tweet_results.result = unblurTweet(item.item.content.tweet_results.result, tabId);
            }
        });
    }
    return instruction;
}