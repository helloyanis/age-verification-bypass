/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("xhamster script is running");
// Add button click listeners to the notification buttons
if(browser.notifications){ // Check if the notifications API is available
    browser.notifications.onClicked.addListener(async (notificationId) => {
        if (notificationId === "xhamster-bypass-notification") {
            browser.tabs.create({url: "https://www.torproject.org/download/"})
        }
    });
}

browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);
        // Not actually a bypass, but a notification to let people know they can use tor to bypass it because it's just a geographical ip block

        const hasPermission = await browser.permissions.contains({
            permissions: ["notifications"]
        });

        if (hasPermission) {
            const notificationId = "xhamster-bypass-notification";
            const notificationOptions = {
                type: "basic",
                title: "You can bypass this age verification",
                message: "You can use the Tor browser to bypass the age verification on this site. Click this notification to download Tor.",
                contextMessage: "This notification was shown by the Age Verification Bypass extension. To disable them, click the extension icon and uncheck the 'Show notification when a bypass is known for a site you visit' option.",
            };

            const notification = await browser.notifications.create(notificationId, notificationOptions);
        }

    },
    { urls: ["https://collector.xhamster.com/?log=user-age-verification"] }
);

// Everything loaded, register the content scripts
initializeContentScripts()