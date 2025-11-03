// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/thirdparty/hasher",
    "sap/m/library",
    "sap/ushell/Container"
], (Controller, hasher, mobileLibrary, Container) => {
    "use strict";

    // shortcut for sap.m.URLHelper
    const URLHelper = mobileLibrary.URLHelper;

    let sXKey;
    let sIKey;

    return Controller.extend("sap.ushell.demo.bookmarkstate.bookmark", {
        onInit: function () {
            const oView = this.getView();
            oView.byId("txtXAppState").setValue("{\"a\":1, \"b\":2, \"c\":3, \"d\":4}");
            oView.byId("txtIAppState").setValue("This is a dummy state string");

            sXKey = undefined;
            sIKey = undefined;

            const sHash = hasher.getHash();
            if (sHash && sHash.length > 0 && sHash.indexOf("sap-xapp-state=") > 0) {
                let aParams = /(?:sap-xapp-state=)([^&/]+)/.exec(sHash);
                if (aParams && aParams.length === 2) {
                    sXKey = aParams[1];
                }
                aParams = /(?:sap-iapp-state=)([^&/]+)/.exec(sHash);
                if (aParams && aParams.length === 2) {
                    sIKey = aParams[1];
                }
            }

            this._loadStateData();
        },

        onCreateNewStateTransient: function () {
            this.onCreateNewState(true);
        },

        onCreateNewStatePersistent: function () {
            this.onCreateNewState(false);
        },

        onUpdateStateTransient: function () {
            this.onUpdateState(true);
        },

        onUpdateStatePersistent: function () {
            this.onUpdateState(false);
        },

        onCreateNewState: function (bTransient) {
            Container.getServiceAsync("AppState").then((oService) => {
                const oView = this.getView();

                let oState = oService.createEmptyAppState(undefined, bTransient);
                oState.setData(oView.byId("txtXAppState").getValue());
                oState.save();
                sXKey = oState.getKey();
                oState = oService.createEmptyAppState(undefined, bTransient);
                oState.setData(oView.byId("txtIAppState").getValue());
                oState.save();
                sIKey = oState.getKey();

                let sHash = hasher.getHash().split("&/")[0];
                sHash += `&/sap-xapp-state=${sXKey}/sap-iapp-state=${sIKey}`;
                hasher.replaceHash(sHash);
            });
        },

        onUpdateState: function (bTransient) {
            Container.getServiceAsync("AppState").then((oService) => {
                const oView = this.getView();

                if (sXKey) {
                    Promise.all([
                        oService.getAppState(sXKey),
                        oService.getAppState(sIKey)
                    ]).then((values) => {
                        const oXState = values[0];
                        const oIState = values[1];
                        const oNewXState = oService.createEmptyAppState(undefined, bTransient);
                        const oNewIState = oService.createEmptyAppState(undefined, bTransient);

                        oNewXState._sKey = oXState._sKey;
                        oNewXState._iPersistencyMethod = "PersonalState";
                        oNewXState._oPersistencySettings = undefined;
                        oNewXState.setData(oView.byId("txtXAppState").getValue());
                        oNewXState.save();

                        oNewIState._sKey = oIState._sKey;
                        oNewIState._iPersistencyMethod = "PersonalState";
                        oNewIState._oPersistencySettings = undefined;
                        oNewIState.setData(oView.byId("txtIAppState").getValue());
                        oNewIState.save();
                    });
                } else {
                    this.onCreateNewState(bTransient);
                }
            });
        },

        onLoadStateData: function () {
            this._showStateDataInCtrl(sXKey, "txtXAppStateRead");
            this._showStateDataInCtrl(sIKey, "txtIAppStateRead");
        },

        onDeleteStateData: function () {
            if (sXKey) {
                Container.getServiceAsync("AppState").then((oService) => {
                    Promise.all([
                        oService.deleteAppState(sXKey),
                        oService.deleteAppState(sIKey)
                    ]).then(() => {
                        this._loadStateData().then(() => {
                            sXKey = undefined;
                            sIKey = undefined;
                            hasher.replaceHash(hasher.getHash().split("&/")[0]);
                        });
                    });
                });
            }
        },

        _loadStateData: function () {
            return Promise.all([
                this._showStateDataInCtrl(sXKey, "txtXAppStateRead"),
                this._showStateDataInCtrl(sIKey, "txtIAppStateRead")
            ]);
        },

        _showStateDataInCtrl: function (sKey, sCtrlId) {
            return new Promise((resolve) => {
                const oView = this.getView();
                const oEditCtrl = oView.byId(sCtrlId);

                if (sKey) {
                    Container.getServiceAsync("CrossApplicationNavigation").then((oService) => {
                        oService.getAppStateData(sKey).then((sValue) => {
                            if (sValue === undefined) {
                                oEditCtrl.setValue(`[ERROR] no value found for state key ${sKey}`);
                            } else if (typeof sValue === "string") {
                                oEditCtrl.setValue(sValue);
                            } else {
                                try {
                                    oEditCtrl.setValue(JSON.stringify(sValue));
                                } catch (oError) {
                                    oEditCtrl.setValue(`[ERROR] value of state key ${sKey} could not be converted to string`);
                                }
                            }
                            resolve();
                        });
                    });
                } else {
                    oEditCtrl.setValue("[INFO] state key found in URL");
                    resolve();
                }
            });
        },

        sendAsEmailS4: function () {
            URLHelper.triggerEmail(null, "This is the email of FLP", document.URL);
        },

        openThemeManager: function () {
            const sMsgValue = "{\"type\":\"request\",\"service\":\"sap.ushell.services.UserInfo.openThemeManager\",\"body\":{},\"request_id\":\"SAPUI5_ISOLATION_MSGID_1\"}";
            window.parent.postMessage(sMsgValue, "*");
        }
    });
});
