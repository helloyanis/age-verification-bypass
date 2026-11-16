/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Initialize and update the extension's settings

//Sets the settings to the default values
async function initializeSettings() {
    // Bluesky
    let bskySetting = await browser.storage.local.get('bskySetting').then((result) => result['bskySetting']);
    if(!bskySetting){
        browser.storage.local.set({ 'bskySetting': "media" }); //Default to blurring media on bluesky
    }

    // Discord
    let discordSetting = await browser.storage.local.get('discordSetting').then((result) => result['discordSetting']);
    if(!discordSetting){
        browser.storage.local.set({ 'discordSetting': "fullVersionSpoof" }); //Default to spoofing version on all requests
    }

    // Reddit
    let redditSetting = await browser.storage.local.get('redditSetting').then((result) => result['redditSetting']);
    if(!redditSetting){
        browser.storage.local.set({ 'redditSetting': "blur" }); //Default to blurring media on reddit
    }

    // Twitter
    let twitterSetting = await browser.storage.local.get('twitterSetting').then((result) => result['twitterSetting']);
    if(!twitterSetting){
        browser.storage.local.set({ 'twitterSetting': "home&following&search&bookmarks&profile" }); //Default to unblurring everything
    }
}

initializeSettings();

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'updateSetting') {
        await browser.storage.local.set({ [message.key]: message.value });
        console.log(`Setting ${message.key} updated to ${message.value}`);
        return true; // Indicate that the response will be sent asynchronously
    }
});