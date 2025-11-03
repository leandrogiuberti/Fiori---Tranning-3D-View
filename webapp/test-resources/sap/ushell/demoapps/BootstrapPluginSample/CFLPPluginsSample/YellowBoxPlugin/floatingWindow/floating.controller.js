// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container"
], (EventBus, Controller, JSONModel, jQuery, Container) => {
    "use strict";

    const oRenderer = Container.getRendererInternal("fiori2");
    let oPostMessageInterface;

    return Controller.extend("sap.ushell.demo.CFLPPluginsSample.yellowBoxPlugin.floating.controller", {
        onInit: function (oEvent) {
            this.oModel = new JSONModel();
            this.oModel.setData([]);
            this.getView().setModel(this.oModel);
            this.waitForCommEstablished();
            EventBus.getInstance().subscribe("ybplugin", "registerPostMessages", this.registerPostMessages, this);
        },

        onClose: function () {
            oRenderer.setFloatingContainerVisibility(false);
        },

        registerPostMessages: function (oEvent, sChannel, oData) {
            oPostMessageInterface = oData;

            oPostMessageInterface.registerPostMessageAPIs({
                "user.postapi.ybactions": {
                    inCalls: {
                        agentStarted: {
                            executeServiceCallFn: function (oServiceParams) {
                                this.checkConnToAgent();
                                // send this log to the agent, this will send it back to this plugin
                                return new jQuery.Deferred().resolve("Agent connected successfully");
                            }.bind(this)
                        },
                        writeLog: {
                            executeServiceCallFn: function (oServiceParams) {
                                this.addLogItem(oServiceParams.oMessageData.body.sMsg);
                                return new jQuery.Deferred().resolve();
                            }.bind(this)
                        }
                    }
                },
                "user.postapi.bbactions": {
                    outCalls: {
                        helloFromParent: {}
                    }
                }
            });
        },

        checkConnToAgent: function () {
            setTimeout(() => {
                oPostMessageInterface.postMessageToApp(
                    "user.postapi.bbactions",
                    "helloFromParent"
                ).done((oRes) => {
                    this.addLogItem(oRes.result);
                });
            }, 1);
        },

        waitForCommEstablished: function () {
            this.bCommEstablished = false;
            this.addLogItem("Waiting for agent to connect...");
        },

        addLogItem: function (sMsg) {
            const oData = this.oModel.getProperty("/");
            oData.push({ Value: `${new Date().toLocaleTimeString()} - ${sMsg}` });
            this.oModel.setProperty("/", oData);
        }
    });
});
