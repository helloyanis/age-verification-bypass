console.log("Ageverif bypass script is running");
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);
        const data = {
            uuid: crypto.randomUUID().replace(/-/g, ""),
            status: "accepted"
        };
        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        filter.onstop = async () => {
            const modifiedResponse = encoder.encode(JSON.stringify(data));
            filter.write(modifiedResponse);
            filter.close()
        }

    },
    { urls: ["https://api.agechecker.net/v1/status/*", "https://api.agechecker.net/v1/create"] },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("info request intercepted:", details.url);
        const data = {
            settings: {
                text: "!!READ THIS!! Please fill the form with some dummy data, and select a country that is NOT the United States or Canada, if asked. Do not fill in your real info! You can also allow scripts from the browser popup to do this all for you.",
                success_text: "LOL EZ bypass",
                workflow: {
                    us: {
                        min_age: 21
                    },
                    states: {
                    },
                    ca: {
                        min_age: 21
                    },
                    ca_provinces: {
                    },
                    international: {
                        min_age: 21
                    }, countries: {
                    }
                }
            },
            store_name: "NOW BYPASSING AGE CHECKER, READ CAREFULLY!!"
        }
        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        filter.onstop = async () => {
            const modifiedResponse = encoder.encode(JSON.stringify(data));
            filter.write(modifiedResponse);
            filter.close()
        }

    },
    { urls: ["https://api.agechecker.net/v1/info/*"] },
    ["blocking"]
);

browser.webRequest.onHeadersReceived.addListener(
    function (details) {
        console.log("Got headers",details)
        details.statusCode = 200
        details.statusLine = "HTTP/2.0 200 "
        return { statusCode: details.statusCode, statusLine: details.statusLine };
    },
    { urls: ["https://api.agechecker.net/v1/create"] },
    ["blocking"]
)
