// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/base/Log",
    "sap/ushell/resources"
], (
    XMLView,
    Log,
    resources
) => {
    "use strict";

    function getEntry () {
        const sViewId = "userActivitiesSetting";
        const sComponentNamespace = "sap.ushell.components.shell.Settings.userActivities.UserActivitiesSetting";
        let oViewInstance;

        return {
            id: "userActivitiesEntry",
            entryHelpID: "userActivitiesEntry",
            title: resources.i18n.getText("userActivities"),
            valueResult: null,
            contentResult: null,
            icon: "sap-icon://laptop",
            valueArgument: null,
            groupingEnablement: true,
            groupingId: "userActivities",
            groupingTabHelpId: "userActivitiesEntryTab",
            groupingTabTitle: resources.i18n.getText("userActivitiesTabName"),
            contentFunc: function () {
                return XMLView.create({
                    id: sViewId,
                    viewName: sComponentNamespace
                }).then((oView) => {
                    oViewInstance = oView;
                    return oView;
                });
            },
            onSave: function () {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave();
                }
                Log.warning(
                    "Save operation for user account settings was not executed, because the userActivities view was not initialized"
                );
                return Promise.resolve();
            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for user account settings was not executed, because the userActivities view was not initialized"
                );
            }
        };
    }

    return {
        getEntry: getEntry
    };
});
