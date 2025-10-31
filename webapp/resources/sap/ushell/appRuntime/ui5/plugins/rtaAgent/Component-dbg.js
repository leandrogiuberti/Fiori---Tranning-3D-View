// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Component",
    "sap/ui/core/EventBus",
    "sap/ui/fl/initial/api/InitialFlexAPI",
    "sap/ushell/api/RTA",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/Trigger"
], (
    Log,
    Component,
    EventBus,
    InitialFlexAPI,
    RtaApi,
    AppLifeCycleUtils,
    CheckConditions,
    Trigger
) => {
    "use strict";

    let oPostMessageInterface;

    function getInitialConfiguration () {
        return {
            sComponentName: "sap.ushell.appRuntime.ui5.plugins.rtaAgent",
            layer: "CUSTOMER",
            developerMode: false
        };
    }

    function postSwitchToolbarVisibilityMessageToFLP (bVisible) {
        return new Promise((resolve, reject) => {
            oPostMessageInterface.postMessageToFlp(
                "user.postapi.rtaPlugin",
                "switchToolbarVisibility",
                { visible: bVisible }
            ).done(resolve).fail(reject);
        });
    }

    function postActivatePluginMessageToFLP () {
        return new Promise((resolve, reject) => {
            oPostMessageInterface.postMessageToFlp(
                "user.postapi.rtaPlugin",
                "activatePlugin"
            ).done(resolve).fail(reject);
        });
    }

    function postShowAdaptUIMessageToFLP () {
        return CheckConditions.checkUI5App()
            .then((bIsUI5App) => {
                if (bIsUI5App) {
                    oPostMessageInterface.postMessageToFlp(
                        "user.postapi.rtaPlugin",
                        "showAdaptUI"
                    ).fail((vError) => {
                        throw new Error(vError);
                    });
                }
            });
    }

    function postHideAdaptUIMessageToFLP () {
        oPostMessageInterface.postMessageToFlp(
            "user.postapi.rtaPlugin",
            "hideAdaptUI"
        ).fail((vError) => {
            throw new Error(vError);
        });
    }

    function onAppClosed () {
        // If the app gets closed (or navigated away from), RTA should be stopped without saving changes
        // or checking personalization changes (as the app should not be reloaded in this case)
        this.oTrigger.triggerStopRta(/* bDontSaveChanges = */true, /* bSkipCheckPersChanges = */true);
    }

    return Component.extend("sap.ushell.appRuntime.ui5.plugins.rtaAgent.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            this.mConfig = getInitialConfiguration();
            this._oPluginPromise = Promise.resolve();

            oPostMessageInterface = this.getComponentData().oPostMessageInterface;

            InitialFlexAPI.isKeyUser()

                .then((bIsKeyUser) => {
                    if (bIsKeyUser) {
                        return postActivatePluginMessageToFLP();
                    }
                    // step over the next 'then' steps
                    return Promise.reject();
                })

                .then(() => {
                    this.mConfig.i18n = this.getModel("i18n").getResourceBundle();
                    this.mConfig.onStartHandler = this._onStartHandler.bind(this);
                    this.mConfig.onErrorHandler = this._onErrorHandler.bind(this);
                    this.mConfig.onStopHandler = this._onStopHandler.bind(this);

                    this.oTrigger = new Trigger(this.mConfig);
                    return this.oTrigger.getInitPromise();
                })

                .then(() => {
                    this._registerPostMessages();
                    return this._restartRtaIfRequired();
                })

                .then(() => {
                    return AppLifeCycleUtils.getAppLifeCycleService();
                })

                .then((oAppLifeCycleService) => {
                    oAppLifeCycleService.attachAppLoaded(this._onAppLoaded, this);
                })

                .then(postShowAdaptUIMessageToFLP)

                .catch((vError) => {
                    if (vError) {
                        Log.error(vError);
                    }
                });
        },

        getPluginPromise: function () {
            return this._oPluginPromise;
        },

        _registerPostMessages: function () {
            oPostMessageInterface.registerPostMessageAPIs({
                "user.postapi.rtaPlugin": {
                    inCalls: {
                        startUIAdaptation: {
                            executeServiceCallFn: async function () {
                                EventBus.getInstance().subscribe(
                                    "sap.ushell",
                                    "appClosed",
                                    onAppClosed.bind(this)
                                );
                                RtaApi.addTopHeaderPlaceHolder();
                                await this.oTrigger.triggerStartRta(this);
                                return oPostMessageInterface.createPostMessageResult(this.oTrigger.sStatus);
                            }.bind(this)
                        }
                    },
                    outCalls: {
                        activatePlugin: {},
                        showAdaptUI: {}
                    }
                }
            });
        },

        _restartRtaIfRequired: function () {
            return CheckConditions.checkUI5App()
                .then((bIsUI5App) => {
                    if (bIsUI5App) {
                        if (CheckConditions.checkRestartRTA(this.mConfig.layer)) {
                            return postSwitchToolbarVisibilityMessageToFLP(false)
                                .then(() => {
                                    RtaApi.addTopHeaderPlaceHolder();
                                    return this.oTrigger.triggerStartRta(this);
                                });
                        }
                    }
                    return undefined;
                });
        },

        _onAppLoaded: async function () {
            const bIsUI5App = await CheckConditions.checkUI5App();
            if (bIsUI5App) {
                await this._restartRtaIfRequired();
                return postShowAdaptUIMessageToFLP();
            }
            return postHideAdaptUIMessageToFLP();
        },

        _onStopHandler: function () {
            this._exitAdaptation();
        },

        /**
		 * This function is called when the start event of RTA was fired
		 * @private
		 */
        _onStartHandler: function () {},

        /**
		 * This function is called when the failed event of RTA was fired
		 * @private
		 */
        _onErrorHandler: function () {
            this._exitAdaptation();
        },

        _exitAdaptation: function () {
            EventBus.getInstance().unsubscribe("sap.ushell", "appClosed", onAppClosed.bind(this));
            postSwitchToolbarVisibilityMessageToFLP(true);
            this.oTrigger.exitRta();
            RtaApi.removeTopHeaderPlaceHolder();
        },

        exit: function () {
            EventBus.getInstance().unsubscribe("sap.ushell", "appClosed", onAppClosed.bind(this));
            postSwitchToolbarVisibilityMessageToFLP(true);
            this._oPluginPromise = this._oPluginPromise
                .then(AppLifeCycleUtils.getAppLifeCycleService.bind(AppLifeCycleUtils))
                .then((oAppLifeCycleService) => {
                    oAppLifeCycleService.detachAppLoaded(this._onAppLoaded, this);
                });
        }
    });
});
