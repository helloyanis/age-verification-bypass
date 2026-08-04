/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log("Realeyes VerifEye bypass script is running");

function _extractSessionId(details) {
    let sessionId = crypto.randomUUID();
    try {
        const raw = details.requestBody?.raw?.[0]?.bytes;
        if (raw) {
            const body = JSON.parse(new TextDecoder().decode(raw));
            if (body.verificationSessionId) {
                sessionId = body.verificationSessionId;
            }
        }
    } catch {
        // keep generated UUID when request body is missing or malformed.
    }
    return sessionId;
}

// Rewrites both SDK JS and init-session response using one listener to keep interception logic centralized.
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);
        const filter = browser.webRequest.filterResponseData(details.requestId);
        const encoder = new TextEncoder();

        if (details.url.includes("faceDetectionService-")) {
            // MediaPipe scans for a face at 90% confidence for 2s before capture-image; stub skips that check.
            filter.onstop = function () {
                filter.write(encoder.encode(`const faceDetectionService = {
    initialize: async () => {},
    findBestFaceFrame: async () => ({
        hasFace: true,
        base64Image: "x"
    })
};
export { faceDetectionService };`));
                filter.close();
            };
            return;
        }

        // Strips livenessCheckConfig from init-session so the SDK uses MediaPipe instead of AWS Amplify liveness.
        const sessionId = _extractSessionId(details);
        filter.onstop = function () {
            filter.write(encoder.encode(JSON.stringify({
                verificationSessionId: sessionId,
                livenessCheckType: "disabled",
                kinesisConfig: null,
                accountHash: ""
            })));
            filter.close();
        };
    },
    {
        urls: [
            "*://*/*faceDetectionService-*",
            "*://verifeye-service-eu.realeyes.ai/api/v1/verification/init-session*",
            "*://verifeye-service-us.realeyes.ai/api/v1/verification/init-session*"
        ]
    },
    ["blocking", "requestBody"]
);

// normalizes verification endpoints to 200 so fake payloads are accepted by the SDK flow
browser.webRequest.onHeadersReceived.addListener(
    function (details) {
        if (details.statusCode >= 200 && details.statusCode < 300) {
            return {};
        }
        console.log("Normalizing status code:", details.url, details.statusCode);
        return {
            responseHeaders: details.responseHeaders || [],
            statusLine: "HTTP/1.1 200 OK"
        };
    },
    {
        urls: [
            "*://verifeye-service-eu.realeyes.ai/api/v1/verification/*",
            "*://verifeye-service-us.realeyes.ai/api/v1/verification/*"
        ]
    },
    ["blocking", "responseHeaders"]
);