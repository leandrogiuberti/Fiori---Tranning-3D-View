// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    Log,
    deepExtend,
    MessageToast,
    Controller,
    ServiceFactoryRegistry,
    JSONModel,
    Config,
    Container
) => {
    "use strict";

    const S_INTRO = [
        ["The ShellUIService allows apps to interact with the surrounding UI.",
            "The service is injected in the app components by the FLP renderer",
            "before the corresponding apps start. To consume the service,",
            "app components should declare it in their manifest.json as follows:"].join(" "),
        "{",
        " ...",
        '  "sap.ui5": {',
        '    "services": {',
        '      "ShellUIService": {',
        '        "factoryName": "sap.ushell.ui5service.ShellUIService"',
        "      }",
        "    }",
        "  }",
        " ...",
        "}",
        "",
        [
            "The service can be then consumed within the root component as shown in the",
            "following example:"
        ].join(" "),
        "",
        "// Component.js",
        "...",
        'this.getService("ShellUIService").then( // promise is returned',
        "   function (oService) {",
        '      oService.setTitle("Application Title");',
        "   },",
        "   function (oError) {",
        '      Log.error("Cannot get ShellUIService", oError, "my.app.Component");',
        "   }",
        ");",
        "..."
    ].join("\n");

    return Controller.extend("sap.ushell.demo.AppShellUIServiceSample.App", {
        onInit: function () {
            Log.setLevel(2); // set Warning level
            this.oShellUIServiceFromStaticMethod = null;
            this.oShellUIServiceFromComponent = null;
            this.oCrossAppNavigationPromise = Container.getServiceAsync("CrossApplicationNavigation");
            this.iUpdateTimeout = 3000;
            this.sSwitchOnText = "using sap.ui.Component.getService('ShellUIService')";
            this.sSwitchOffText = "using ServiceFactoryRegistry#get('sap.ushell.ui5service.ShellUIService').getInstance()";
            this.setTitleIconStart = "restart";
            this.setTitleIconStop = "stop";
            this.bSwitchOn = true;
            this.bCallSetTitle = false;
            this.oModel = {
                introText: S_INTRO,
                currentTimeout: `${this.iUpdateTimeout}`,
                currentStateText: this.sSwitchOnText,
                setTitleIcon: "restart",
                setTitleText: "Set Title",
                componentId: this.getOwnerComponent().getId(),
                setHierarchyRelatedAppsFormSaveEnabled: false,
                setHierarchyRelatedAppsFormDeleteEnabled: false,
                setHierarchyRelatedAppsFormItem: {
                },
                setHierarchyRelatedAppsArg: [{
                    title: "Sample App",
                    subtitle: "Demonstrates navigation",
                    icon: "sap-icon://media-play",
                    intent: "#Action-toappnavsample"
                }],
                setTitleAdditionalInfo: {},
                setTitleTitle: ""
            };
            this._setModel(this.oModel);

            this.getView().byId("setTitleWindowTitleExtension").setValue(Config.last("/core/shell/windowTitleExtension") || "");
        },
        onSetHierarchyRowSelectionChange: function (oControl) {
            const iSelectedIndex = oControl.getParameters().rowIndex;
            if (iSelectedIndex >= 0) {
                this.iSetHierarchySelectionIndex = iSelectedIndex;
                this.oModel.setHierarchyRelatedAppsFormSaveEnabled = true;
                this.oModel.setHierarchyRelatedAppsFormDeleteEnabled = true;
                this.oModel.setHierarchyRelatedAppsFormItem = deepExtend({}, this.oModel.setHierarchyRelatedAppsArg[iSelectedIndex]);
                this._setModel(this.oModel);
            }
        },
        btnAddHierarchyEntryPressed: function () {
            this.iSetHierarchySelectionIndex = -1;
            this.oModel.setHierarchyRelatedAppsFormSaveEnabled = false;
            this.oModel.setHierarchyRelatedAppsFormDeleteEnabled = false;
            this.oModel.setHierarchyRelatedAppsFormItem = {};

            // Get data from form and add to the arg
            const oEntry = {
                title: this.byId("setHierarchyRelatedAppsTitle").getValue(),
                subtitle: this.byId("setHierarchyRelatedAppsSubtitle").getValue(),
                icon: this.byId("setHierarchyRelatedAppsIcon").getValue(),
                intent: this.byId("setHierarchyRelatedAppsIntent").getValue()
            };

            if (!Array.isArray(this.oModel.setHierarchyRelatedAppsArg)) {
                this.oModel.setHierarchyRelatedAppsArg = [];
            }

            this.oModel.setHierarchyRelatedAppsArg.push(oEntry);

            this._setModel(this.oModel);

            this.byId("setHierarchyRelatedAppsTable").clearSelection();
        },
        btnSaveHierarchyEntryPressed: function () {
            const idx = this.iSetHierarchySelectionIndex;
            if (idx >= 0) {
                this.oModel.setHierarchyRelatedAppsFormSaveEnabled = false;
                this.oModel.setHierarchyRelatedAppsFormDeleteEnabled = false;

                this.oModel.setHierarchyRelatedAppsArg = this.oModel.setHierarchyRelatedAppsArg.map((oArg, i) => {
                    if (i === idx) {
                        return {
                            title: this.byId("setHierarchyRelatedAppsTitle").getValue(),
                            subtitle: this.byId("setHierarchyRelatedAppsSubtitle").getValue(),
                            icon: this.byId("setHierarchyRelatedAppsIcon").getValue(),
                            intent: this.byId("setHierarchyRelatedAppsIntent").getValue()
                        };
                    }
                    return oArg;
                });

                this.iSetHierarchySelectionIndex = -1;
                this.oModel.setHierarchyRelatedAppsFormItem = {};
                this._setModel(this.oModel);
                this.byId("setHierarchyRelatedAppsTable").clearSelection();
            } else {
                MessageToast.show("No item selected");
            }
        },
        btnDeleteHierarchyEntryPressed: function () {
            const idx = this.iSetHierarchySelectionIndex;
            if (idx >= 0) {
                this.byId("setHierarchyRelatedAppsTable").clearSelection();
                this.oModel.setHierarchyRelatedAppsFormSaveEnabled = false;
                this.oModel.setHierarchyRelatedAppsFormDeleteEnabled = false;
                this.oModel.setHierarchyRelatedAppsFormItem = {};

                this.oModel.setHierarchyRelatedAppsArg = this.oModel.setHierarchyRelatedAppsArg.filter((e, i) => {
                    return i !== idx;
                });

                this.iSetHierarchySelectionIndex = -1;

                this._setModel(this.oModel);
            } else {
                MessageToast.show("No item selected");
            }
        },
        onAfterRendering: function () {
            // Fix some styles
            const aTextAreas = document.querySelectorAll("textarea");
            for (let i = 0; i < aTextAreas.length; i++) {
                aTextAreas[i].style.fontFamily = "courier";
                aTextAreas[i].style.fontSize = "10pt";
                aTextAreas[i].style.border = "none";
            }

            this.iTitleCount = 0;

            // Read service from component
            this.getOwnerComponent().getService("ShellUIService")
                .then((oService) => {
                    this.oShellUIServiceFromComponent = oService;
                })
                .catch((oError) => {
                    Log.error(
                        "Error while getting ShellUIService",
                        oError,
                        "sap.ushell.demo.AppShellUIServiceSample"
                    );
                });

            // Use static method
            ServiceFactoryRegistry
                .get("sap.ushell.ui5service.ShellUIService")
                .createInstance()
                .then((oService) => {
                    this.oShellUIServiceFromStaticMethod = oService;
                })
                .catch((oError) => {
                    Log.error(
                        "Error while getting ShellUIService",
                        oError,
                        "sap.ushell.demo.AppShellUIServiceSample"
                    );
                });
        },
        btnGoHomePressed: function () {
            this.oCrossAppNavigationPromise.then((oService) => {
                oService.toExternal({
                    target: {
                        shellHash: "#Shell-home"
                    }
                });
            });
        },
        btnGoToAppNavSample: function () {
            this.oCrossAppNavigationPromise.then((oService) => {
                oService.toExternal({
                    target: {
                        shellHash: "#Action-toappnavsample"
                    }
                });
            });
        },
        btnSetTitlePressed: function () {
            const oAdditionalInformation = this._oModel.getProperty("/setTitleAdditionalInfo");
            let sTitle = this._oModel.getProperty("/setTitleTitle");

            if (this._oModel.getProperty("/setTitleTitle") === "") {
                // If the title is not set, use the automatic title
                sTitle = undefined;
            }
            const oService = this.bSwitchOn
                ? this.oShellUIServiceFromComponent
                : this.oShellUIServiceFromStaticMethod;

            oService.setTitle(sTitle, oAdditionalInformation);
        },
        btnSetHierarchyRelatedAppsPressed: function () {
            this._setHierarchyRelatedApps(this.oModel.setHierarchyRelatedAppsArg);
        },
        btnClearHierarchyRelatedAppsPressed: function () {
            this._setHierarchyRelatedApps();
        },
        onTimeoutChanged: function (oControl) {
            this.iUpdateTimeout = oControl.getParameters().value;
            this.oModel.currentTimeout = this.iUpdateTimeout;
            this._setModel(this.oModel);
        },
        onUseInjectedServiceChange: function (oControl) {
            const bOn = oControl.getParameters().state;
            this.bSwitchOn = bOn;
            this.oModel.currentStateText = bOn
                ? this.sSwitchOnText
                : this.sSwitchOffText;
            this._setModel(this.oModel);
        },
        onWindowTitleExtensionChange: function (oEvent) {
            const sWindowTitleExtension = oEvent.getParameter("value");
            Config.emit("/core/shell/windowTitleExtension", sWindowTitleExtension);
        },
        _setHierarchyRelatedApps: function (aMethodArg) {
            const oService = this.bSwitchOn
                ? this.oShellUIServiceFromComponent
                : this.oShellUIServiceFromStaticMethod;

            try {
                const sMethod = this.byId("radioRelatedApps").getSelected()
                    ? "setRelatedApps"
                    : "setHierarchy";

                oService[sMethod](aMethodArg);
                MessageToast.show(`${sMethod} called successfully`);
            } catch (oError) {
                MessageToast.show(oError);
            }
        },
        _setModel: function (oJson) {
            if (!this._oModel) {
                this._oModel = new JSONModel(oJson);
            } else {
                this._oModel.setData(oJson);
            }
            this.getView().setModel(this._oModel);
        }
    });
});
