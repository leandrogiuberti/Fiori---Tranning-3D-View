// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

let aPostMessages = [];

window.sendPostMessageToParent = function (vMessage) {
    "use strict";

    window.parent.postMessage(vMessage, "*");
};

window.sendPostMessageToTop = function (vMessage) {
    "use strict";

    window.top.postMessage(vMessage, "*");
};

window.formatNextResponse = function (fnFormatter) {
    "use strict";

    window.nextResponseFormatter = fnFormatter;
};

window.getPostMessages = function () {
    "use strict";

    return aPostMessages;
};

window.clearPostMessages = function () {
    "use strict";

    aPostMessages = [];
};

// add a generic reply for request messages
window.addEventListener("message", (oEvent) => {
    "use strict";

    let oMessage;
    try {
        oMessage = JSON.parse(oEvent.data);
    } catch {
        oMessage = oEvent.data;
    }

    if (oMessage.type !== "request") {
        // Ignore non-request messages
        return;
    }

    // Store the message for later inspection
    aPostMessages.push(oMessage);

    const oReply = {
        request_id: oMessage.request_id,
        service: oMessage.service || "MockIframeResponse",
        type: "response",
        status: "success"
    };

    let vReply = JSON.stringify(oReply); // default just stringify

    if (typeof window.nextResponseFormatter === "function") {
        vReply = window.nextResponseFormatter(oReply);
        window.nextResponseFormatter = null; // Reset the formatter after use
    }

    oEvent.source.postMessage(vReply, oEvent.origin);
});
