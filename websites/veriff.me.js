/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// This is extremely hacky and SHOULD NEVER WORK unless the website literally does not care about the response from the API and just redirects to the callback URL.
console.log("Veriff bypass script is running");
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
                console.log("Original JSON data:", jsonData);
                browser.tabs.update(details.tabId, { url: jsonData.vendorIntegration.callback });
            } catch (error) {
                console.error("Error parsing JSON:", error);
            } finally {
                filter.write(encoder.encode(response));
                filter.close();
            }

        }

    },
    { urls: ["https://saas.veriff.com/api/v2/sessions"]}, 
    ["blocking"]
);

// This is also hacky, it spoofs the JS sdk to just call the onSession callback with a fake response. Websites should usually check again in their back-end, but some websites don't care and just redirect to the callback URL. This is also currently incompatible with redirect URLs since you get those from the API response, which is blocked by the first listener.
browser.webRequest.onBeforeRequest.addListener(
        function (details) {
                console.log("Request intercepted:", details.url);

                const filter = browser.webRequest.filterResponseData(details.requestId);
                const encoder = new TextEncoder();

                filter.onstop = function () {
                        const modifiedResponse = encoder.encode(`(function (w) {
    function createResponse() {
        return {
            status: "success",
            verification: {
                id: crypto.randomUUID(),
                url: "",
                host: w.location.hostname,
                status: "approved",
                sessionToken: ""
            }
        };
    }

    w.Veriff = function (config) {
        config = config || {};

        return {
            setParams: function () {},

            mount: function () {
                if (typeof config.onSession === 'function') {
                    config.onSession(null, createResponse());
                }
            }
        };
    };
})(window);`);
                        filter.write(modifiedResponse);
                        filter.close();
                };
        },
        { urls: ["https://cdn.veriff.me/sdk/js/1.5/veriff.min.js"] }, //JS SDK
        ["blocking"]
);

// Pretty much the same as the previous listener, but for the incontext SDK. It just calls the onEvent callback with the events that would normally be fired during a normal verification flow.
browser.webRequest.onBeforeRequest.addListener(
        function (details) {
                console.log("Request intercepted:", details.url);

                const filter = browser.webRequest.filterResponseData(details.requestId);
                const encoder = new TextEncoder();

                filter.onstop = function () {
                        const modifiedResponse = encoder.encode(`const MESSAGES = {
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  SUBMITTED: "SUBMITTED",
};

window.veriffSDK = {
  createVeriffFrame({ onEvent }) {
    if (typeof onEvent !== "function") {
      return;
    }

    // Fire the events one after another
    onEvent(MESSAGES.STARTED);
    onEvent(MESSAGES.FINISHED);
    onEvent(MESSAGES.SUBMITTED);
  },
};`);
                        filter.write(modifiedResponse);
                        filter.close();
                };
        },
        { urls: ["https://cdn.veriff.me/incontext/js/v2.5.0/veriff.js"] }, //Incontext SDK
        ["blocking"]
);