/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Initialize and update the extension's settings

const loadableContentScripts = []

//Sets the settings to the default values
async function initializeSettings() {
    const defaultValues = {
        'agechecker': "on",
        'agego': "on",
        'ageverif': "on",
        'ageverification.org': "on",
        'aliexpress': "on",
        "angelogodshackxxx": "on",
        'bsky': "media",
        'cosxplay': "on",
        'discord': "fullVersionSpoof",
        'erome': "on",
        'freshnewfaces': "on",
        'latinaspy': "on",
        'mewe': "on",
        'pimpbunny': "on",
        'reddit': "blur",
        'redgifs': "on",
        'spankbang': "on",
        'veriff': "on",
        'watchpeopledie': "on",
        'twitter': "home&following&search&bookmarks&profile",
        'mostRecentSite': "agechecker"
    };
    browser.storage.local.get(Object.keys(defaultValues)).then((result) => {
        Object.keys(defaultValues).forEach(setting => {
            if (!result[setting]) {
                browser.storage.local.set({ [setting]: defaultValues[setting] });
            }
        });
    });
}

// Register the content scripts after initialization or update
async function initializeContentScripts(){
    // TODO run this at the end
    const registeredContentScripts = await browser.scripting.getRegisteredContentScripts({
        ids: loadableContentScripts.map(script => script.id)
    });
    const settings = await browser.storage.local.get(loadableContentScripts.map(script => script.id.split('-')[0]));
    let scriptsToRegister = []
    let scriptsToUnregister = []
    loadableContentScripts.forEach(script => {
        const settingKey = script.id.split('-')[0];
        const settingValue = settings[settingKey];
        const isRegistered = registeredContentScripts.some(registeredScript => registeredScript.id === script.id);
        if (settingValue !== "off" && !isRegistered) {
            scriptsToRegister.push(script);
        } else if (settingValue === "off" && isRegistered) {
            scriptsToUnregister.push(script);
        }
    });
    if (scriptsToRegister.length > 0) {
        console.log("Registering content scripts:", scriptsToRegister.map(s => s.id));
        await browser.scripting.registerContentScripts(scriptsToRegister);
    }
    if (scriptsToUnregister.length > 0) {
        console.log("Unregistering content scripts:", scriptsToUnregister.map(s => s.id));
        await browser.scripting.unregisterContentScripts({ ids: scriptsToUnregister.map(s => s.id) });
    }
}
// Watch for changes
browser.storage.onChanged.addListener((changes, area) =>{
    if (area !== 'local') return;
    const changedItems = Object.keys(changes);
    if (changedItems.some(item => loadableContentScripts.some(script => script.id.split('-')[0] === item))) {
        console.log("Settings changed, updating this content script...");
        if (changedItems.includes("mostRecentSite")) return; // Ignore changes to mostRecentSite
        initializeContentScripts()
    }
});

initializeSettings()

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'updateSetting') {
        await browser.storage.local.set({ [message.key]: message.value });
        console.log(`Setting ${message.key} updated to ${message.value}`);
        return true; // Indicate that the response will be sent asynchronously
    }
});

function setMostRecentSite(site, tabId) {
    console.log("Setting most recent site", site, tabId)
    browser.storage.local.get(site).then((result) => {
        const setting = result[site];
        // Save the most recently loaded site, to help with opening the popup page at the right site.
        browser.storage.local.set({ ["mostRecentSite"]: site });
        // Also set the badge to "OK"
        setting === "off" ? browser.action.setBadgeText({ text: "OFF", tabId: tabId }) : browser.action.setBadgeText({ text: "OK", tabId: tabId });
    })
}