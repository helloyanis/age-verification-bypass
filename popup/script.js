/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Script of the add-on's popup page

document.addEventListener("DOMContentLoaded", async () => {
    // Remove the "nojs" element and remove the style that hides the "main" element
    document.getElementById("nojs").remove();
    document.getElementById("main").removeAttribute("style");

    // Initiate checkbox state based on permission
    const checkbox = document.getElementById("bypassNotificationCheckbox");
    const permissionStatus = await browser.permissions.contains({ permissions: ["notifications"] });
    // Set the checkbox state based on the current permission status
    checkbox.checked = permissionStatus;

    // Add an event listener to handle checkbox changes
    checkbox.addEventListener("change", async (event) => {
        if (event.target.checked) {
            // Request permission when the checkbox is checked
            const granted = await browser.permissions.request({ permissions: ["notifications"] });
            if (!granted) {
                // If permission is not granted, uncheck the checkbox
                checkbox.checked = false;
            }
        } else {
            // Remove permission when the checkbox is unchecked
            await browser.permissions.remove({ permissions: ["notifications"] });
        }
    });

    // Optional access to all websites, needed for third-party age verification providers embedded on other sites
    const allSites = { origins: ["<all_urls>"] };
    const allSitesCheckbox = document.getElementById("allSitesCheckbox");
    allSitesCheckbox.checked = await browser.permissions.contains(allSites);
    allSitesCheckbox.addEventListener("change", async (event) => {
        if (event.target.checked) {
            // permissions.request must be called synchronously from the user action
            const granted = await browser.permissions.request(allSites);
            if (!granted) {
                allSitesCheckbox.checked = false;
            }
        } else {
            await browser.permissions.remove(allSites);
        }
    });

    // Initialize the settings in the popup based on stored values
    const bskySetting = await browser.storage.local.get('bskySetting').then((result) => result['bskySetting']);
    if (bskySetting) {
        document.querySelector("select[name='bskySetting']").value = bskySetting;
    }

    const redditSetting = await browser.storage.local.get('redditSetting').then((result) => result['redditSetting']);
    if (redditSetting) {
        document.querySelector("select[name='redditSetting']").value = redditSetting;
    }

    const twitterSetting = await browser.storage.local.get('twitterSetting').then((result) => result['twitterSetting']);
    if (twitterSetting) {
        twitterSetting.split("&").forEach(value => {
            const option = document.querySelector(`select[name='twitterSetting'] option[value='${value}']`);
            if (option) {
                option.selected = true;
            }
        });
    }

    // Add event listeners to the select elements to update settings when changed
    document.querySelectorAll("select[settingChange]").forEach(setting => {
        setting.addEventListener("change", async (event) => {
            await browser.runtime.sendMessage({
                action: 'updateSetting',
                key: event.target.getAttribute("name"),
                value: event.target.hasAttribute("multiple") ? Array.from(event.target.selectedOptions).map(option => option.value).join("&") : event.target.value
            });
        });
    });

    // Add event listeners to the "Unblur all" and "Blur all" buttons for Twitter settings
    document.getElementById("unblurAllTwitterOptions").addEventListener("click", async () => {
        const twitterSelect = document.getElementById("twitterBehaviorSelect");
        Array.from(twitterSelect.options).forEach(option => option.selected = true);
        await browser.runtime.sendMessage({
            action: 'updateSetting',
            key: 'twitterSetting',
            value: Array.from(twitterSelect.selectedOptions).map(option => option.value).join("&")
        });
    });

    document.getElementById("blurAllTwitterOptions").addEventListener("click", async () => {
        const twitterSelect = document.getElementById("twitterBehaviorSelect");
        Array.from(twitterSelect.options).forEach(option => option.selected = false);
        await browser.runtime.sendMessage({
            action: 'updateSetting',
            key: 'twitterSetting',
            value: ''
        });
    });
})