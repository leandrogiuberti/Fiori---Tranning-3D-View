// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery"
], (Component, hasher, jQuery) => {
    "use strict";

    let oPostMessageInterface;
    let bInit = false;

    return Component.extend("sap.ushell.demo.BootstrapPluginSample.CFLPPluginsSample.blueBoxPlugin.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.CFLPPluginsSample.blueBoxPlugin"
        },

        init: function () {
            // eslint-disable-next-line prefer-const
            let iIntervalID;
            oPostMessageInterface = this.getComponentData().oPostMessageInterface;

            oPostMessageInterface.registerPostMessageAPIs({
                "user.postapi.bbactions": {
                    inCalls: {
                        helloFromParent: {
                            executeServiceCallFn: function (oServiceParams) {
                                if (!bInit) {
                                    jQuery("<div id='idHelloFromParent'></div>").appendTo("body");
                                    bInit = true;
                                    clearInterval(iIntervalID);
                                }
                                return new jQuery.Deferred().resolve({ result: "Response from Plugin 1234" }).promise();
                            }
                        }
                    }
                }
            });

            // Repeat sending the message in case the YellowBoxPlugin is not ready yet
            let iAttempts = 0;
            iIntervalID = setInterval(async () => {
                const sResult = await oPostMessageInterface.postMessageToFlp("user.postapi.ybactions", "agentStarted");
                if (sResult) {
                    oPostMessageInterface.postMessageToFlp(
                        "user.postapi.ybactions",
                        "writeLog",
                        {
                            sMsg: sResult
                        }
                    );
                }

                // Stop trying after some time
                iAttempts++;
                if (iAttempts > 60) {
                    clearInterval(iIntervalID);
                }
            }, 1000);

            function treatHashChanged (newHash/* , oldHash */) {
                if (newHash && typeof newHash === "string" && newHash.length > 0) {
                    oPostMessageInterface.postMessageToFlp(
                        "user.postapi.ybactions",
                        "writeLog",
                        {
                            sMsg: newHash
                        }
                    );
                }
            }
            hasher.changed.add(treatHashChanged.bind(this), this);
        },

        exit: function () { }
    });
});
