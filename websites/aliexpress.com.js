/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// This one is super clunky but works. It gets runned every time a new product is in view because they get loaded with the age restriction elements so I need to re-run the code every time to remove them (the whole page isn't rendered if you don't scroll)
console.log("Aliexpress bypass script is running");

browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        await browser.scripting.executeScript({
        target: {
            tabId: details.tabId,
        },
        func: () => {
            console.log("INIT")
            // If the element is already there, just remove it
            document.querySelectorAll(".ls_ke, .ho_g9, img[src='https://ae-pic-a1.aliexpress-media.com/kf/S082ae95bce89462b9548a1d53f222ab4p/72x72.png'], .J_SAFETY_FILER_MODAL, ._1FlkA").forEach(elt=>elt.remove())
            document.querySelectorAll("img.nf_bj").forEach(elt=>elt.classList.remove("nf_bj"))
            document.querySelectorAll(".card-dsa-wrapper").forEach(elt=>elt.classList.remove("card-dsa-wrapper"))
            document.querySelectorAll(".dsa--visible--wrapper").forEach(elt=>elt.classList.remove("dsa--visible--wrapper"))
        }})


    },
    { urls: ["https://aplus.aliexpress.com/Product.Exposure.Event*","https://assets.aliexpress-media.com/g/AWSC/fireyejs/*/fireyejs.js"] },
    []
)