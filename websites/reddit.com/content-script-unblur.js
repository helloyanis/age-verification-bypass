/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
Array.from(document.querySelectorAll("shreddit-blurred-container[blurred]")).forEach(container => {
    container.removeAttribute("blurred");
});
// Unblur right rail
document.querySelectorAll("div[data-testid='post-thumbnail'")?.forEach(thumbnail=>{
    thumbnail.querySelector("img")?.setAttribute("style","")
    thumbnail.querySelector("div")?.remove()
})

// Add mutation observer to detect when the NSFW content is loaded and remove the blur
const observer2 = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            Array.from(document.querySelectorAll("shreddit-blurred-container[blurred]")).forEach(container => {
                container.removeAttribute("blurred");
            });
            document.querySelectorAll("div[data-testid='post-thumbnail'")?.forEach(thumbnail=>{
                thumbnail.querySelector("img")?.setAttribute("style","")
                thumbnail.querySelector("div")?.remove()
            })
        }
    }
});

// Start observing the document body for changes
observer2.observe(document.body, { childList: true, subtree: true });