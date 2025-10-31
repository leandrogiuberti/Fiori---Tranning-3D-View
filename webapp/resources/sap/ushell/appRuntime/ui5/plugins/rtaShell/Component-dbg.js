// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/api/RTA",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer"
], (
    Component,
    jQuery,
    RtaApi,
    AppLifeCycleUtils,
    Renderer
) => {
    "use strict";

    let oPostMessageInterface;

    function getInitialConfiguration () {
        return {
            sComponentName: "sap.ushell.appRuntime.ui5.plugins.rtaShell",
            layer: "CUSTOMER",
            id: "RTA_AppRuntime_Plugin_ActionButton",
            text: "RTA_BUTTON_TEXT",
            icon: "sap-icon://wrench",
            visible: false
        };
    }

    function switchToolbarVisibility (bVisible) {
        RtaApi.setShellHeaderVisibility(bVisible, false);
    }

    function postStartUIAdaptationToApp () {
        return new Promise((resolve, reject) => {
            switchToolbarVisibility(false);
            oPostMessageInterface.postMessageToApp(
                "user.postapi.rtaPlugin",
                "startUIAdaptation"
            ).done((sRtaStatus) => {
                // If RTA is stopped, the toolbar should be visible again
                if (sRtaStatus === "stopped") {
                    switchToolbarVisibility(true);
                }
                resolve(sRtaStatus);
            }).fail(() => {
                switchToolbarVisibility(true);
                reject();
            });
        });
    }

    return Component.extend("sap.ushell.appRuntime.ui5.plugins.rtaShell.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            this.mConfig = getInitialConfiguration();

            oPostMessageInterface = this.getComponentData().oPostMessageInterface;

            this._registerPostMessages();
        },

        _registerPostMessages: function () {
            oPostMessageInterface.registerPostMessageAPIs({
                "user.postapi.rtaPlugin": {
                    inCalls: {
                        activatePlugin: {
                            executeServiceCallFn: function () {
                                return oPostMessageInterface.createPostMessageResult(this._initPlugin());
                            }.bind(this)
                        },
                        showAdaptUI: {
                            executeServiceCallFn: async function () {
                                await this._changeActionButtonVisibility(true/* bVisible */);
                                return oPostMessageInterface.createPostMessageResult();
                            }.bind(this)
                        },
                        hideAdaptUI: {
                            executeServiceCallFn: async function () {
                                await this._changeActionButtonVisibility(false/* bVisible */);
                                return oPostMessageInterface.createPostMessageResult();
                            }.bind(this)
                        },
                        switchToolbarVisibility: {
                            executeServiceCallFn: function (oServiceParams) {
                                const bVisible = oServiceParams.oMessageData.body.visible;
                                switchToolbarVisibility(bVisible);
                                return oPostMessageInterface.createPostMessageResult();
                            }
                        }
                    },
                    outCalls: {
                        startUIAdaptation: {}
                    }
                }
            });
        },

        _initPlugin: function () {
            if (this.bIsInitialized) {
                return new jQuery.Deferred().resolve();
            }
            this.bIsInitialized = true;
            this.mConfig.i18n = this.getModel("i18n").getResourceBundle();

            return new jQuery.Deferred((oDeferred) => {
                Renderer.createActionButton(
                    this,
                    postStartUIAdaptationToApp.bind(undefined),
                    this.mConfig.visible
                )
                    .then((oActionButton) => {
                        this.oActionButton = oActionButton;
                    })
                    .catch((vError) => {
                        this.bIsInitialized = false;
                        return Promise.reject(vError);
                    })
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);
            }).promise();
        },

        _changeActionButtonVisibility: async function (bVisible) {
            if (!this.oActionButton) {
                return;
            }
            // If the application type is not URL, the plugin is running in an app without iFrames
            // and the button should not be shown. The monolitic RTA plugin should be used instead.
            const oALCService = await AppLifeCycleUtils.getAppLifeCycleService();
            if (bVisible && oALCService.getCurrentApplication().applicationType === "URL") {
                this.oActionButton.showForAllApps();
            } else {
                this.oActionButton.hideForAllApps();
            }
        },

        exit: function () {
            switchToolbarVisibility(false);
        }
    });
});
