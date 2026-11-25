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

    // Add an event listener for the website selector to show the correct site
    const websiteSelect = document.getElementById("websiteSelect");
    websiteSelect.addEventListener("change", (event) => {
        document.querySelector(".setting.active")?.classList.remove("active")
        document.getElementById(event.target.value).classList.add("active")
    })

    // Initiate website select state based on the last loaded website
    const mostRecentSite = await browser.storage.local.get('mostRecentSite').then((result) => result['mostRecentSite']);
    websiteSelect.value = `${mostRecentSite}Setting`
    document.querySelector(".setting.active")?.classList.remove("active")
    document.getElementById(`${mostRecentSite}Setting`).classList.add("active")

    // Initialize the settings in the popup based on stored values
    initSettingUI()

    const twitterSetting = await browser.storage.local.get('twitter').then((result) => result['twitter']);
    if (twitterSetting) {
        twitterSetting.split("&").forEach(value => {
            const option = document.querySelector(`select[name='twitter'] option[value='${value}']`);
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
            key: 'twitter',
            value: Array.from(twitterSelect.selectedOptions).map(option => option.value).join("&")
        });
    });

    document.getElementById("blurAllTwitterOptions").addEventListener("click", async () => {
        const twitterSelect = document.getElementById("twitterBehaviorSelect");
        Array.from(twitterSelect.options).forEach(option => option.selected = false);
        await browser.runtime.sendMessage({
            action: 'updateSetting',
            key: 'twitter',
            value: ''
        });
    });
})

async function initSettingUI(){
    const settings = ['agechecker', 'agego', 'ageverif', 'ageverification.org', 'aliexpress', 'angelogodshackxxx', 'bsky', 'cosxplay', 'discord', 'erome', 'freshnewfaces', 'latinaspy', 'mewe', 'pimpbunny', 'reddit', 'redgifs', 'spankbang', 'veriff', 'watchpeopledie'];
    await browser.storage.local.get(settings).then((result) => {
        settings.forEach(setting => {
            const value = result[setting];
            if (value) {
                document.querySelector(`select[name='${setting}']`).value = value;
            }
        });
    });
}