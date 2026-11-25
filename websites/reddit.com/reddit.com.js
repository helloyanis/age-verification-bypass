/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log("Reddit bypass script is running");

let cssToInject = ["websites/reddit.com/content-script-basic.css"];
let jsToInject = ["websites/reddit.com/content-script-basic.js"];

browser.storage.local.get('reddit').then((result) => {
    const redditSetting = result['reddit'];
    if (redditSetting === "unblur") {
        cssToInject = ["websites/reddit.com/content-script-basic.css", "websites/reddit.com/content-script-unblur.css"];
        jsToInject = ["websites/reddit.com/content-script-basic.js", "websites/reddit.com/content-script-unblur.js"];
    }
    else if (redditSetting === "blur") {   
        cssToInject = ["websites/reddit.com/content-script-basic.css"];
        jsToInject = ["websites/reddit.com/content-script-basic.js"];
    }
    loadableContentScripts.push({
        id: "reddit-contentScript",
        css: cssToInject,
        js: jsToInject,
        cssOrigin: "user",
        matches: ["*://*.reddit.com/*"],
        runAt: "document_idle"
    });
});

browser.webRequest.onCompleted.addListener(
    async function (details) {
        if(details.tabId === -1) return; // Ignore requests not associated with a tab
        setMostRecentSite("reddit", details.tabId)
    },
    { urls: ["*://*.reddit.com/*"] },
    []
);

browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.reddit) {
        const newSetting = changes.reddit.newValue;
        if (newSetting === "unblur") {
            browser.scripting.updateContentScripts([{
                id: "reddit-contentScript",
                css: ["websites/reddit.com/content-script-basic.css", "websites/reddit.com/content-script-unblur.css"],
                js: ["websites/reddit.com/content-script-basic.js", "websites/reddit.com/content-script-unblur.js"]
            }])
            // Also change it in the loadableContentScripts array
            loadableContentScripts.find(script => script.id === "reddit-contentScript").css = ["websites/reddit.com/content-script-basic.css", "websites/reddit.com/content-script-unblur.css"];
            loadableContentScripts.find(script => script.id === "reddit-contentScript").js = ["websites/reddit.com/content-script-basic.js", "websites/reddit.com/content-script-unblur.js"];
        }
        else if (newSetting === "blur") {   
            browser.scripting.updateContentScripts([{
                id: "reddit-contentScript",
                css: ["websites/reddit.com/content-script-basic.css"],
                js: ["websites/reddit.com/content-script-basic.js"]
            }])
            // Also change it in the loadableContentScripts array
            loadableContentScripts.find(script => script.id === "reddit-contentScript").css = ["websites/reddit.com/content-script-basic.css"];
            loadableContentScripts.find(script => script.id === "reddit-contentScript").js = ["websites/reddit.com/content-script-basic.js"];
        }
    }
});