/* !
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/EventBus",
    "sap/ui/core/Lib",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/BaseRTAPluginStatus",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
    /*
     * Be careful with new dependencies.
     * Only include dependencies that are already bundled in
     * core-min/core-ext, appruntime or the flex-plugins bundle
     * otherwise load the library lazily before use.
     */
], (
    hasher,
    BusyIndicator,
    EventBus,
    Lib,
    PluginStatus,
    AppLifeCycleUtils
) => {
    "use strict";
    const STATUS_STARTING = PluginStatus.STATUS_STARTING;
    const STATUS_STARTED = PluginStatus.STATUS_STARTED;
    const STATUS_STOPPING = PluginStatus.STATUS_STOPPING;
    const STATUS_STOPPED = PluginStatus.STATUS_STOPPED;

    function Trigger (mConfig) {
        this.mConfig = mConfig;
        this.sStatus = PluginStatus.STATUS_STOPPED;
        this.oStartingPromise = null;
        this.oStoppingPromise = null;
        const oContainer = AppLifeCycleUtils.getContainer();
        oContainer.registerDirtyStateProvider(this._dirtyStateProvider.bind(this));
        this.oInitPromise = oContainer.getServiceAsync("URLParsing")
            .then((oURLParsingService) => {
                this.oURLParsingService = oURLParsingService;
            })
            .catch((vError) => {
                throw new Error(`Error during retrieval of URLParsing ushell service: ${vError}`);
            });
    }

    function requireStartAdaptation () {
        return new Promise((resolve, reject) => {
            sap.ui.require(["sap/ui/rta/api/startAdaptation"], resolve, reject);
        });
    }

    function getRootControl () {
        return AppLifeCycleUtils.getCurrentRunningApplication()
            .then((oCurrentRunningApp) => {
                return oCurrentRunningApp.componentInstance;
            });
    }

    Trigger.prototype.getInitPromise = function () {
        return this.oInitPromise;
    };

    // if the failed event is fired, RuntimeAuthoring couldn't properly start
    // and startAdaptation does not return the RuntimeAuthoring instance
    // so the instance has to be saved and the error handler has to stop rta
    Trigger.prototype._onRtaFailed = function (oEvent) {
        BusyIndicator.hide();
        this._oRTA = oEvent.getSource();
        this.mConfig.onErrorHandler();
    };

    Trigger.prototype._startRta = function () {
        this.sStatus = STATUS_STARTING;
        EventBus.getInstance().subscribe(
            "sap.ushell.renderers.fiori2.Renderer",
            "appClosed",
            this._onAppClosed,
            this
        );
        EventBus.getInstance().subscribe(
            "sap.ushell",
            "appKeepAliveDeactivate",
            this._onAppClosed,
            this
        );
        BusyIndicator.show(0);

        let oRootControl;
        return getRootControl()
            .then((oReturnedRootControl) => {
                oRootControl = oReturnedRootControl;
                return Lib.load({name: "sap.ui.rta"});
            })
            .then(requireStartAdaptation.bind(this))
            .then((startAdaptation) => {
                // when RTA gets started we have to save the current hash to compare on navigation
                this.sOldHash = hasher.getHash();

                const mOptions = {
                    rootControl: oRootControl,
                    flexSettings: {
                        layer: this.mConfig.layer,
                        developerMode: this.mConfig.developerMode
                    }
                };

                return startAdaptation(
                    mOptions,
                    this.mConfig.loadPlugins,
                    this.mConfig.onStartHandler,
                    this._onRtaFailed.bind(this),
                    this.mConfig.onStopHandler
                );
            })
            .then((oRTA) => {
                BusyIndicator.hide();
                this._oRTA = oRTA;
                this.sStatus = STATUS_STARTED;
            })
            .catch((vError) => {
                BusyIndicator.hide();
                if (vError.reason === "flexEnabled") {
                    this.handleFlexDisabledOnStart();
                }
                this.sStatus = STATUS_STOPPED;
            });
    };

    Trigger.prototype._stopRta = function () {
        this.sStatus = STATUS_STOPPING;
        return this._oRTA.stop.apply(this._oRTA, arguments).then(() => {
            this.exitRta();
        });
    };

    /**
	 * Turns on the adaption mode of the RTA FLP plugin.
	 * @returns {promise} Resolves when runtime adaptation has started
	 * @private
	 */
    Trigger.prototype.triggerStartRta = function () {
        const sStatus = this.sStatus;

        switch (sStatus) {
            case STATUS_STARTING:
                break;
            case STATUS_STARTED:
                this.oStartingPromise = Promise.resolve();
                break;
            case STATUS_STOPPING:
                this.oStartingPromise = this.oStoppingPromise
                    .then(() => {
                        return this._startRta();
                    });
                break;
            case STATUS_STOPPED:
                this.oStartingPromise = this._startRta();
                break;
            default:
        }

        if (sStatus !== STATUS_STARTING) {
            this.oStartingPromise.then(() => {
                this.oStartingPromise = null;
            });
        }
        return this.oStartingPromise;
    };

    /**
	 * Stopps the adaption mode of the RTA FLP plugin.
	 * @returns {promise} Resolves when runtime adaptation has stopped
	 * @private
	 */
    Trigger.prototype.triggerStopRta = function () {
        const sStatus = this.sStatus;
        switch (sStatus) {
            case STATUS_STARTING:
                this.oStoppingPromise = this.oStartingPromise.then(function () {
                    return this._stopRta.apply(this, arguments);
                }.bind(this));
                break;
            case STATUS_STARTED:
                this.oStoppingPromise = this._stopRta.apply(this, arguments);
                break;
            case STATUS_STOPPING:
                break;
            case STATUS_STOPPED:
                this.oStoppingPromise = Promise.resolve();
                break;
            default:
        }

        if (sStatus !== STATUS_STOPPING) {
            this.oStoppingPromise.then(() => {
                this.oStoppingPromise = null;
            });
        }
        return this.oStoppingPromise;
    };

    /**
	 * Triggers a Message when flex is disabled on FLP start.
	 * @private
	 */
    Trigger.prototype.handleFlexDisabledOnStart = function () {
        sap.ui.require([
            "sap/ui/rta/util/showMessageBox",
            "sap/m/MessageBox"
        ], (
            showMessageBox,
            MessageBox
        ) => {
            showMessageBox(
                this.mConfig.i18n.getText("MSG_FLEX_DISABLED"),
                {
                    icon: MessageBox.Icon.INFORMATION,
                    title: this.mConfig.i18n.getText("HEADER_FLEX_DISABLED"),
                    actions: [MessageBox.Action.OK],
                    initialFocus: null,
                    isCustomAction: false
                }
            );
        });
    };

    Trigger.prototype._dirtyStateProvider = function () {
        if (this._oRTA && this.sStatus === STATUS_STARTED) {
            const sHash = hasher.getHash();
            const oParsedNew = this.oURLParsingService.parseShellHash(sHash);
            const oParsedOld = this.oURLParsingService.parseShellHash(this.sOldHash);
            this.sOldHash = sHash;

            if (
                oParsedNew.semanticObject === oParsedOld.semanticObject &&
				oParsedNew.action === oParsedOld.action &&
				oParsedNew.appSpecificRoute !== oParsedOld.appSpecificRoute
            ) {
                return false;
            }
            return this._oRTA.canSave();
        }
        return false;
    };

    Trigger.prototype.exitRta = function () {
        if (this._oRTA) {
            this._oRTA.destroy();
            this.sStatus = STATUS_STOPPED;
            this.oStartingPromise = null;
            this.oStoppingPromise = null;
            this._oRTA = null;
        }
        EventBus.getInstance().unsubscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);
        EventBus.getInstance().unsubscribe("sap.ushell", "appKeepAliveDeactivate", this._onAppClosed, this);
    };

    Trigger.prototype._onAppClosed = function () {
        // If the app gets closed (or navigated away from), RTA should be stopped without saving changes
        // or checking personalization changes (as the app should not be reloaded in this case)
        this.triggerStopRta(/* bDontSaveChanges = */true, /* bSkipCheckPersChanges = */true);
    };

    return Trigger;
}, true);
