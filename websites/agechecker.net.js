/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Docs at https://agechecker.net/account/install/custom/client

console.log("agechecker.net bypass script is running");
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        filter.onstop = async () => {
            // Replace the original age verif popup with this one
            const modifiedResponse = encoder.encode(`(function (w) {
  const config = w.AgeCheckerConfig || {};

  function complete() {

    // fire status changed event
    if (typeof config.onstatuschanged === 'function') {
      config.onstatuschange({"uuid"; crypto.randomUUID(), "status": "accepted"}); // Simulate user accepted
    }
    // Redirect takes priority
    if (config.redirect_url) {
      w.location.href = config.redirect_url;
      return;
    }

    // Otherwise trigger onClose then onclosed callback
    if (typeof config.onclose === 'function') {
      config.onclose(); // Simulate user accepted
    }
    if (typeof config.onclosed === 'function') {
      config.onclosed(); // Simulate popup finished closing animation
    }
  }

  // Expose API expected by the loader
  w.AgeCheckerAPI = {
    show: function () {
      complete();
    },

    close: function () {
      complete();
    }
  };

  // Notify loader that the script is ready
  if (typeof config.onready === 'function') {
    config.onready();
  }
})(window);`);
            filter.write(modifiedResponse);
            filter.close()
        }

    },
    { urls: ["https://cdn.agechecker.net/static/popup/v1/popup.js"]},
    ["blocking"]
);