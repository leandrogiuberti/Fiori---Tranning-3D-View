// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (UIComponent, JSONModel, Container) => {
    "use strict";

    // new Component
    return UIComponent.extend("sap.ushell.demo.NavigationSample.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // this component should automatically initialize the router!
            this.getRouter().initialize();

            // trigger direct inner-app navigation if intent parameter navTo set
            // we use this for testing the correct stopping of the previous app's
            // router upon cross-app navigation
            const oStartupParameters = this.getComponentData().startupParameters;
            const sNavTo = oStartupParameters && oStartupParameters.navTo && oStartupParameters.navTo[0];

            if (sNavTo) {
                this.getRouter().navTo(sNavTo, null, true);
            }

            /* StartupParameters (2) */
            /* http://localhost:8080/ushell/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html#Action-toappnavsample?AAA=BBB&DEF=HIJ */
            /* results in { AAA: ["BBB"], DEF: ["HIJ"] }  */
            const oComponentData = this.getComponentData && this.getComponentData();

            this.rootControlLoaded().then((view) => {
                const oStartupData = this.createStartupParametersData(oComponentData && oComponentData.startupParameters || {});

                view.setModel(new JSONModel(oStartupData), "startupParameters");
                view.setModel(new JSONModel({ appstate: " no app state " }), "AppState");

                Container.getServiceAsync("CrossApplicationNavigation")
                    .then((oCAN) => {
                        return oCAN.getStartupAppState(this);
                    }).then((oAppState) => {
                        const oAppStateData = oAppState.getData();
                        const oModelData = { parameters: [] };

                        oModelData.stringifiedAppstate = JSON.stringify(oAppState.getData() || " no app state ");
                        oModelData.appStateKey = oAppState.getKey();

                        // array or object
                        if (typeof oAppStateData === "object") {
                            Object.keys(oAppStateData).forEach((sParamName) => {
                                oModelData.parameters.push({ name: sParamName, value: JSON.stringify(oAppStateData[sParamName]) });
                            });
                        }
                        view.getModel("AppState").setProperty("/appstate", oModelData);
                    });
            });
        },

        createStartupParametersData: function (oComponentData) {
            // convert the raw componentData into a model that is consumed by the UI
            return {
                parameters: Object.keys(oComponentData).map((key) => {
                    if (key === "CRASHME") {
                        throw new Error("Deliberately crashed on startup");
                    }
                    return {
                        key: key,
                        value: oComponentData[key].toString()
                    };
                })
            };
        },

        getAutoPrefixId: function () {
            return true;
        }

    });
});
