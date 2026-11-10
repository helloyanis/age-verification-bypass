/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

console.log("ageverif.com bypass script is running");
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        filter.onstop = async () => {
            // Replace the original age verif popup with this one
            const modifiedResponse = encoder.encode(`(function () {

  function parseQuery(url) {
    const params = {};
    const queryString = url.split("?")[1] || "";
    queryString.split("&").forEach(part => {
      if (!part) return;
      const [key, value] = part.split("=");
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : true;
    });
    return params;
  }

  function safeCall(fnName, payload) {
    if (!fnName) return;

    const fn = window[fnName];
    if (typeof fn === "function") {
      try {
        fn(payload);
      } catch (e) {
        console.error("[ageverif] callback error:", e);
      }
    }
  }

  function emit(eventName, detail) {
    // DOM event
    window.dispatchEvent(new CustomEvent(eventName, { detail }));

    // legacy global handlers
    const legacyMap = {
      "ageverif:load": window.ageverifLoaded,
      "ageverif:ready": window.ageverifReady,
      "ageverif:success": window.ageverifSuccess
    };

    if (legacyMap[eventName]) {
      try {
        legacyMap[eventName](detail);
      } catch (e) {
        console.error("[ageverif] legacy handler error:", e);
      }
    }
  }

  function randomString(len = 24) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function createVerification() {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 100 * 365 * 24 * 60 * 60; // 100 years

    return {
      uid: randomString(),
      country: "FR",
      countrySubdivision: null,
      assuranceLevel: "STRICT",
      ageThreshold: 0,
      reused: false,
      expiresAt: now + expiresIn,
      expiresIn,
      token: randomString(48)
    };
  }

  // ---------------------------
  // Setup
  // ---------------------------

  const scriptEl = document.currentScript;
  const src = scriptEl ? scriptEl.src : "";
  const params = parseQuery(src);

  const hasNoStart = Object.prototype.hasOwnProperty.call(params, "nostart");

  const config = {
    onload: params.onload,
    onready: params.onready,
    onsuccess: params.onsuccess,
    onclose: params.onclose,
    onerror: params.onerror
  };

  // ---------------------------
  // Core object
  // ---------------------------

  const ageverif = {
    started: false,
    events: {},

    on(event, handler) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(handler);
    },

    emitLocal(event, payload) {
      const list = this.events[event] || [];
      list.forEach(fn => {
        try {
          fn(payload);
        } catch (e) {
          console.error("[ageverif] local handler error:", e);
        }
      });
    },

    start() {
      if (this.started) return;
      this.started = true;

      const verification = createVerification();

      // READY
      const readyPayload = { verification };
      this.emitLocal("ready", readyPayload);
      emit("ageverif:ready", readyPayload);

      safeCall(config.onready, readyPayload);

      // SUCCESS
      const successPayload = { verification };
      this.emitLocal("success", successPayload);
      emit("ageverif:success", successPayload);

      safeCall(config.onsuccess, successPayload);

      // CLOSE
      this.emitLocal("close", {});
      safeCall(config.onclose, {});
    },

    getPortableVerification() {
      return randomString(48);
    }
  };

  // expose early
  window.ageverif = ageverif;

  // ---------------------------
  // LOAD phase
  // ---------------------------

  let verificationForLoad = createVerification();

  const loadPayload = { verified: true, verification: verificationForLoad };

  emit("ageverif:load", loadPayload);
  safeCall(config.onload, loadPayload);

  // ---------------------------
  // ageverif compatibility hook
  // ---------------------------
  if (window.ageverif && typeof window.ageverif.on === "function") {
    try {
      window.ageverif.on("ready", () => {
        ageverif.start();
      });
    } catch (e) {
      console.warn("[ageverif] ageverif hook failed", e);
    }
  }

  // ---------------------------
  // Auto-start
  // ---------------------------

  if (!hasNoStart) {
    ageverif.start();
  }
})();`);
            filter.write(modifiedResponse);
            filter.close()
        }

    },
    { urls: ["https://www.ageverif.com/checker.js?*"]},
    ["blocking"]
);