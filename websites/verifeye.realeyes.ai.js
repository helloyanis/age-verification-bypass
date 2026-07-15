/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log("Realeyes VerifEye bypass script is running");

// patches window.fetch to intercept all verification API calls before they reach the server.
// verify returns 500 when the server rejects our fake image and filterResponseData can't change the status code.
function _injectPatcher(details) {
    if (details.tabId < 0) return;
    browser.scripting.executeScript({
        target: { tabId: details.tabId, allFrames: true },
        world: "MAIN",
        func: function () {
            if (window.__verifeyeBypassInstalled) return;
            window.__verifeyeBypassInstalled = true;
            const _origFetch = window.fetch;
            window.fetch = async function (resource, options) {
                const url = resource instanceof Request ? resource.url : String(resource);
                if (url.includes("verifeye-service-") && url.includes("/api/v1/verification/")) {
                    if (url.includes("/init-session")) {
                        let sid;
                        try { sid = JSON.parse(options?.body || "{}").verificationSessionId; } catch { }
                        return new Response(JSON.stringify({
                            verificationSessionId: sid || crypto.randomUUID(),
                            livenessCheckType: "disabled",
                            kinesisConfig: null,
                            accountHash: ""
                        }), { status: 200, headers: { "Content-Type": "application/json" } });
                    }
                    return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
                }
                return _origFetch.apply(this, arguments);
            };
        }
    }).catch(e => console.warn("[verifeye bypass] executeScript failed:", e));
}
// inject into all frames (including iframes). two triggers: faceDetectionService and init-session as a fallback if it was cached.
browser.webRequest.onBeforeRequest.addListener(_injectPatcher, { urls: ["*://*/*faceDetectionService-CohHJWWF*"] }, []);
browser.webRequest.onBeforeRequest.addListener(_injectPatcher, { urls: ["*://verifeye-service-eu.realeyes.ai/api/v1/verification/init-session*", "*://verifeye-service-us.realeyes.ai/api/v1/verification/init-session*"] }, []);

// MediaPipe scans for a face at 90% confidence for 2s before calling capture-image. stub skips that entirely.
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);
        const filter = browser.webRequest.filterResponseData(details.requestId);
        const encoder = new TextEncoder();
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
    },
    { urls: ["*://*/*faceDetectionService-CohHJWWF*"] },
    ["blocking"]
);

// strips livenessCheckConfig from init-session so the SDK uses MediaPipe instead of AWS Amplify liveness.
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);
        const filter = browser.webRequest.filterResponseData(details.requestId);
        const encoder = new TextEncoder();
        let sessionId = crypto.randomUUID();
        try {
            const raw = details.requestBody?.raw?.[0]?.bytes;
            if (raw) {
                const body = JSON.parse(new TextDecoder().decode(raw));
                if (body.verificationSessionId) sessionId = body.verificationSessionId;
            }
        } catch { }
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
            "*://verifeye-service-eu.realeyes.ai/api/v1/verification/init-session*",
            "*://verifeye-service-us.realeyes.ai/api/v1/verification/init-session*"
        ]
    },
    ["blocking", "requestBody"]
);