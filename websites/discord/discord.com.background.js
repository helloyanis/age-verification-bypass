/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log("Discord bypass script is running");

browser.webRequest.onBeforeSendHeaders.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        // For discord to send messages, need to spoof header to an old version that dodn't have age checks

        for (const header of details.requestHeaders) {
            if (header.name.toLowerCase() === "x-super-properties") {
                let decodedHeader = JSON.parse(atob(header.value))
                // Spoof client to old version, credit to https://github.com/etsycom/Discord-Age-Verification-Bypass for finding!
                decodedHeader.client_build_number = 6000
                header.value = btoa(JSON.stringify(decodedHeader))
            }
        }
        return { requestHeaders: details.requestHeaders };
    },
    { urls: ["*://discord.com/api/*"] },
    ["blocking", "requestHeaders"]
);