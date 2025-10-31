// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    Log,
    XMLView,
    ushellResources,
    Container
) => {
    "use strict";

    function getEntry () {
        let oViewInstance;

        const oEntry = {
            id: "language",
            entryHelpID: "language",
            title: ushellResources.i18n.getText("languageAndRegionTit"),
            valueResult: null,
            contentResult: null,
            icon: "sap-icon://map",
            valueArgument: function () {
                let sUserLanguage = Container.getUser().getLanguageText();
                if (sUserLanguage.indexOf("-") > -1) {
                    sUserLanguage = sUserLanguage.replace("-", " (").concat(")");
                }
                return Promise.resolve(sUserLanguage);
            },
            contentFunc: function () {
                return XMLView.create({
                    id: "userLanguageAndRegion",
                    viewName: "sap.ushell.adapters.cdm.Settings.UserLanguageAndRegion.UserLanguageAndRegion"
                }).then((oView) => {
                    oViewInstance = oView;
                    return oViewInstance;
                });
            },
            onSave: function (fnUpdateUserPreferences) {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave(fnUpdateUserPreferences);
                }
                Log.warning(
                    "Save operation for language settings was not executed, because the userLanguageAndRegion view was not initialized"
                );
                return Promise.resolve();
            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for language settings was not executed, because the userLanguageAndRegion view was not initialized"
                );
            }
        };
        return oEntry;
    }

    return {
        getEntry: getEntry
    };
});
