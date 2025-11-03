// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component"
], (Component) => {
    "use strict";

    let oPostMessageInterface;

    return Component.extend("sap.ushell.demo.BootstrapPluginSample.CFLPPluginsSample.WikiBasicSample.BlueBoxPlugin.Component", {
        init: function () {
            // get the post message api interface
            oPostMessageInterface = this.getComponentData().oPostMessageInterface;

            // register the agent plugin supported apis
            this.registerPostMessages();

            // inform the parent plugin we are alive
            this.informParentPluginWeStarted();
        },

        registerPostMessages: function () {
            oPostMessageInterface.registerPostMessageAPIs({
                "user.postapi.sample": {
                    inCalls: {
                        add2Numbers: {
                            executeServiceCallFn: function (oServiceParams) {
                                const x = oServiceParams.oMessageData.body.x;
                                const y = oServiceParams.oMessageData.body.y;

                                const sum = x + y;
                                return oPostMessageInterface.createPostMessageResult({ sum: sum });
                            }
                        },
                        getIframeDetails: {
                            executeServiceCallFn: function (oServiceParams) {
                                const oDetails = {
                                    url: document.URL,
                                    userName: "<user-name>",
                                    appName: "my application",
                                    appVersion: 1.2
                                };
                                return oPostMessageInterface.createPostMessageResult(oDetails);
                            }
                        }
                    }
                }
            });
        },

        informParentPluginWeStarted: function () {
            oPostMessageInterface.postMessageToFlp(
                "user.postapi.sample",
                "agentStarted",
                {
                    startTime: new Date()
                }
            ).done(() => {
                console.log("BB - user.postapi.sample.agentStarted sent successfully");
            });
        },

        getBrowserURL: function () {
            oPostMessageInterface.postMessageToFlp(
                "user.postapi.sample",
                "getUrl"
            ).done((oResult) => {
                console.log(`BB - browser url is: ${oResult.sUrl}`);
            });
        },

        exit: function () {
            // do exit actions
        }
    });
});
