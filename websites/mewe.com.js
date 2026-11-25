/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("Mewe.com bypass script is running");

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
                setMostRecentSite("mewe", details.tabId)
                const meweSetting = await browser.storage.local.get('mewe').then((result) => result['mewe']);
                setMostRecentSite("mewe", details.tabId)
                if (meweSetting == "off") {
                    filter.write(encoder.encode(response)); // Send back original response
                    filter.close()
                }
                else {
                    let jsonData = JSON.parse(response);
                    jsonData.ageVerificationData.verificationStatus = "not_needed";
                    filter.write(encoder.encode(JSON.stringify(jsonData)));
                    filter.close()
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
                filter.write(encoder.encode(response));
                filter.close();
            }
        }

    },
    { urls: ["*://*.mewe.com/api/v2/me/info"] },
    ["blocking"]
);