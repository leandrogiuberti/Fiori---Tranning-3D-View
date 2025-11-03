// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

let bUseService = false;
let oParentWindow;

function setValue (id, val) {
    "use strict";
    document.getElementById(id).value = val;
}

function getValue (id) {
    "use strict";
    return document.getElementById(id).value;
}

/**
 * present msg in log list
 * @param {string} sMessage - message to log
 * @param {string} [sData] - optional data to log
 */
function addToLog (sMessage, sData) {
    "use strict";

    if (sData === undefined) {
        setValue("txtLog", `${getValue("txtLog") + sMessage}\r\r`);
    } else {
        sData = sData
            .replace("\"body\":", "\n\"body\":")
            .replace("\"appIntent\":", "\n\"appIntent\":")
            .replace("\"technicalAppComponentId\":", "\n\"technicalAppComponentId\":");

        setValue("txtLog", `${getValue("txtLog") + sMessage} ${sData}\r\r`);
    }
}

function sendMessageToBroker (oMessageData) {
    "use strict";

    const sMessage = JSON.stringify(oMessageData);

    oParentWindow.postMessage(sMessage);
    addToLog("Sent:", sMessage);
}

function getBrokerService () {
    "use strict";
    return oParentWindow.sap.ushell.Container.getServiceAsync("MessageBroker");
}

/**
 * connect to msg broker channel
 */
function connectToMessageBroker () {
    "use strict";

    let oMessageData;

    document.getElementById("txtStatusId").innerHTML = "";
    if (bUseService) {
        addToLog("'MessageBroker::connect' called");
        getBrokerService().then((oService) => {
            oService.connect(getValue("txtClientId"))
                .then(() => {
                    addToLog("'MessageBroker::connect' response: success");
                    document.getElementById("txtStatusId").innerHTML = "Connected";
                })
                .catch((oError) => {
                    addToLog(`'MessageBroker::connect' called, response: failed, error: ${oError.message}`);
                    document.getElementById("txtStatusId").innerHTML = "Not Connected";
                });
        });
    } else {
        oMessageData = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            request_id: getValue("txtMessageId") || Date.now().toString(),
            body: {
                channelId: "sap.ushell.MessageBroker",
                clientId: getValue("txtClientId"),
                messageName: "connect"
            }
        };

        sendMessageToBroker(oMessageData);
    }
}

/**
 * disconnect from msg broker channel
 */
function disconnectFromMessageBroker () {
    "use strict";

    let oMessageData;

    if (bUseService) {
        addToLog("'MessageBroker::disconnect' called");
        getBrokerService()
            .then((oService) => {
                oService.disconnect(getValue("txtClientId"));
                addToLog("'MessageBroker::disconnect' response: success");
                document.getElementById("txtStatusId").innerHTML = "Not Connected";
            })
            .catch((oError) => {
                addToLog(`'MessageBroker::disconnect' called, response: failed, error: ${oError.message}`);
            });
    } else {
        oMessageData = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            request_id: getValue("txtMessageId") || Date.now().toString(),
            body: {
                channelId: "sap.ushell.MessageBroker",
                clientId: getValue("txtClientId"),
                messageName: "disconnect"
            }
        };

        sendMessageToBroker(oMessageData);
    }
}

function UnsubscribeChannels () {
    "use strict";

    let oMessageData;
    const channelIds = getValue("txtChannels").split(",");
    const subscribedChannels = [];

    channelIds.forEach((sChannelId) => {
        subscribedChannels.push({
            channelId: sChannelId,
            version: "1.0"
        });
    });

    if (bUseService) {
        getBrokerService().then((oService) => {
            oMessageData = {
                clientId: getValue("txtClientId"),
                subscribedChannels: subscribedChannels
            };
            addToLog("'MessageBroker::unsubscribe' called: ", JSON.stringify(oMessageData));
            oService.unsubscribe(
                getValue("txtClientId"),
                subscribedChannels
            )
                .then(() => {
                    addToLog("'MessageBroker::unsubscribe' response: success");
                })
                .catch((oError) => {
                    addToLog(`'MessageBroker::unsubscribe' called, response: failed, error: ${oError.message}`);
                });
        });
    } else {
        oMessageData = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            request_id: getValue("txtMessageId") || Date.now().toString(),
            body: {
                channelId: "sap.ushell.MessageBroker",
                clientId: getValue("txtClientId"),
                messageName: "unsubscribe",
                subscribedChannels: subscribedChannels
            }
        };

        sendMessageToBroker(oMessageData);
    }
}

function doPublishMessage (sClientId, sChannelId, sMessageId, sTargetClients, sMessageName, sMessageData) {
    "use strict";

    let oMessage;
    const oMessageData = JSON.parse(sMessageData);

    if (bUseService) {
        getBrokerService().then((oService) => {
            oService.publish(
                sChannelId,
                sClientId,
                sMessageId,
                sMessageName,
                sTargetClients.split(","),
                oMessageData
            ).then(() => {
                oMessage = {
                    channelId: sChannelId,
                    clientId: sClientId,
                    messageId: sMessageId,
                    messageName: sMessageName,
                    targetClientIds: sTargetClients.split(","),
                    data: oMessageData
                };

                addToLog("'MessageBroker::publish' called:", JSON.stringify(oMessage));
            }).catch((oError) => {
                addToLog("'MessageBroker::publish' failed:", oError.message);
            });
        });
    } else {
        oMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            request_id: sMessageId,
            body: {
                clientId: sClientId,
                channelId: sChannelId,
                targetClientIds: sTargetClients.split(","),
                messageName: sMessageName,
                data: oMessageData
            }
        };

        sendMessageToBroker(oMessage);
    }
}

/**
 * transfer msg
 */
function publishMessage () {
    "use strict";

    doPublishMessage(
        getValue("txtClientId"),
        getValue("txtChannelId"),
        getValue("txtMessageId") || Date.now().toString(),
        getValue("txtTargetClientId"),
        getValue("txtMessageName"),
        getValue("txtMessage"));
}

function sendResponse () {
    "use strict";

    doPublishMessage(
        getValue("txtClientId"),
        getValue("txtFromChannelId"),
        getValue("txtFromMessageId"),
        getValue("txtFromClientId"),
        getValue("txtFromMessageName"),
        getValue("txtResponse"));
}

function showRequest (oMessageData) {
    "use strict";

    setValue("txtFromMessageId", oMessageData.request_id || Date.now().toString());
    setValue("txtFromClientId", oMessageData.body.clientId);
    setValue("txtFromChannelId", oMessageData.body.channelId);
    setValue("txtFromMessageName", oMessageData.body.messageName);
    setValue("txtFromMessage", JSON.stringify(oMessageData.body.data));
}

function respondWithAppContext (oMessage) {
    "use strict";

    const sChannelId = oMessage.body.channelId;
    const oMessageData = oMessage.body.data;

    if (sChannelId === "app.context" && oMessageData.messageType
        && oMessageData.messageType === "request") {
        const sMessageId = oMessage.request_id || Date.now().toString();
        const sTargetClientId = oMessage.body.clientId;
        const sClientId = getValue("txtClientId");
        const sMessageName = oMessage.body.messageName;
        const sMessageData = JSON.stringify({
            theme: "sap_horizon",
            languageTag: "en",
            appIntent: "AppNav-SAP1?sap-ui-app-id-hint=sap.ushell.demo.AppSample",
            appFrameworkId: "UI5",
            appSupportInfo: "CA-FLP-FE-UI",
            technicalAppComponentId: "sap.ushell.demo.AppSample",
            appId: "F6407",
            appVersion: "1.1.0",
            productName: "",
            "sap-fiori-id": "F6407",
            "sap-ach": "CA-FLP-FE-UI"
        });

        doPublishMessage(sClientId, sChannelId, sMessageId, sTargetClientId, sMessageName, sMessageData);
    }
}

function processMessages (oMessage) {
    "use strict";

    let oMessageData;
    if (typeof oMessage.data === "string" && oMessage.data.indexOf("sap.ushell.services.MessageBroker") > 0) {
        try {
            oMessageData = JSON.parse(oMessage.data);
            if (oMessageData.service === "sap.ushell.services.MessageBroker") {
                addToLog("Received:", oMessage.data);
                if (oMessageData.body.channelId !== "sap.ushell.MessageBroker") {
                    if (oMessageData.type === "request") {
                        showRequest(oMessageData);
                        respondWithAppContext(oMessageData);
                    }
                }
            }
        } catch (oError) {
            return;
        }
    }
}

function ServiceMessageCallback (sClientId, sChannelId, sMessageName, data) {
    "use strict";

    const oMessageData = {
        clientId: sClientId,
        channelId: sChannelId,
        messageName: sMessageName,
        data: data
    };

    showRequest({ body: oMessageData });

    addToLog("Received message:", JSON.stringify(oMessageData));

    respondWithAppContext({ body: oMessageData });
}

function ServiceClientConnectionCallback (sMessageName, sClientId, aSubscribedChannels) {
    "use strict";

    const oMessageData = {
        messageName: sMessageName,
        clientId: sClientId,
        subscribedChannels: aSubscribedChannels
    };

    addToLog("Received event:", JSON.stringify(oMessageData));
}

function SubscribeChannels () {
    "use strict";

    let oMessageData;
    const channelIds = getValue("txtChannels").split(",");
    const subscribedChannels = [];

    channelIds.forEach((sChannelId) => {
        subscribedChannels.push({
            channelId: sChannelId,
            version: "1.0"
        });
    });

    if (bUseService) {
        getBrokerService().then((oService) => {
            oMessageData = {
                clientId: getValue("txtClientId"),
                subscribedChannels: subscribedChannels
            };
            addToLog("'MessageBroker::subscribe' called: ", JSON.stringify(oMessageData));
            oService.subscribe(
                getValue("txtClientId"),
                subscribedChannels,
                ServiceMessageCallback,
                ServiceClientConnectionCallback
            )
                .then(() => {
                    addToLog("'MessageBroker::subscribe' response: success");
                })
                .catch((oError) => {
                    addToLog(`'MessageBroker::subscribe' called, response: failed, error: ${oError.message}`);
                });
        });
    } else {
        oMessageData = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            request_id: getValue("txtMessageId") || Date.now().toString(),
            body: {
                channelId: "sap.ushell.MessageBroker",
                clientId: getValue("txtClientId"),
                messageName: "subscribe",
                subscribedChannels: subscribedChannels
            }
        };

        sendMessageToBroker(oMessageData);
    }
}

function onLoad () {
    "use strict";

    const wrapper = document.getElementById("wrapper");
    const channelId = document.getElementById("txtChannelId");
    const oParams = new URLSearchParams(window.location.search);
    const sClient = oParams.get("client");
    const sTarget = oParams.get("target");

    window.addEventListener("message", processMessages);
    oParentWindow = window.parent;
    setValue("txtClientId", sClient);
    setValue("txtTargetClientId", sTarget);
    bUseService = (sClient === "AppUI5");

    wrapper.addEventListener("click", (event) => {
        if (event.target.id === "btnBrokerConnect") {
            connectToMessageBroker();
        } else if (event.target.id === "btnBrokerDisconnect") {
            disconnectFromMessageBroker();
        } else if (event.target.id === "btnSubscribe") {
            SubscribeChannels();
        } else if (event.target.id === "btnUnsubscribe") {
            UnsubscribeChannels();
        } else if (event.target.id === "btnSendMessage") {
            publishMessage();
        } else if (event.target.id === "btnSendResponse") {
            sendResponse();
        } else if (event.target.id === "btnClearLog") {
            setValue("txtLog", "");
        }
    });

    channelId.addEventListener("keyup", (event) => {
        if (event.target.value === "app.context") {
            setValue("txtMessageName", "get-context");
            setValue("txtMessage", '{"messageType": "request"}');
        }
    });
}

window.onload = onLoad;
