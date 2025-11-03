// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (
    ObjectPath,
    MessageToast,
    Controller,
    JSONModel,
    Container
) => {
    "use strict";

    let oApplications = null;

    return Controller.extend("sap.ushell.demo.FioriSandboxDefaultApp.App", {
        onInit: function () {
            const oView = this.getView();

            Container.getServiceAsync("CrossApplicationNavigation").then((crossAppNavService) => {
                const aApps = [];
                let href;

                oApplications = ObjectPath.get("sap-ushell-config.services.NavTargetResolutionInternal.adapter.config.applications");

                for (const sAppName in oApplications) {
                    if (oApplications.hasOwnProperty(sAppName) && sAppName != "" && sAppName != "_comment") {
                        // use cross-application navigation service to construct link targets with proper encoding
                        href = crossAppNavService.hrefForExternal({ target: { shellHash: sAppName } });

                        aApps.push({
                            href: href,
                            appDescription: oApplications[sAppName].description || sAppName
                        });
                    }
                }
                const oModel = new JSONModel({ apps: aApps });
                oView.setModel(oModel);
            });
        },

        onSelectFromList: function () {
            const oButton = this.getView().byId("configAsLocal1");
            oButton.setEnabled(true);
        },

        onConfigureAsAppLocal1: function (oEvent) {
            // Determine selected app.
            const oList = this.getView().byId("applist");
            const oListItem = oList.getSelectedItem();
            const aListItemContents = oListItem.getContent();
            const oLink = aListItemContents[0];
            const sHref = oLink.getHref();
            const sAppName = sHref.substring(1); // sHref.split("#")[1];
            const oApp = oApplications[sAppName];

            const sAppConfigO = JSON.stringify(oApp);

            const oAppClone = JSON.parse(sAppConfigO);

            // patch for relative sample applications:
            const sRelStart = "../../../../../test-resources/sap/ushell/demoapps";
            const iLen = sRelStart.length;
            if (oAppClone.url.length > iLen && oAppClone.url.substr(0, iLen) === sRelStart) {
                oAppClone.url = `/ushell/test-resources/sap/ushell/demoapps${oAppClone.url.substr(iLen)}`;
            }
            const sAppConfig = JSON.stringify(oAppClone);

            // Store details of selected app for hash "#Test-local1".
            window.localStorage["sap.ushell.#Test-local1"] = sAppConfig;

            MessageToast.show(`App ${sAppName} is now available as #Test-local1 in the Fiori Launchpad.`);
        }
    });
});
