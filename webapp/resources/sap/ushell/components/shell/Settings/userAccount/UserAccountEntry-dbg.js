// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    XMLView,
    Log,
    Config,
    resources,
    Container
) => {
    "use strict";

    function getEntry () {
        const oShellConfig = Container.getRendererInternal("fiori2").getShellConfig();
        const bUseSelector = oShellConfig.enableUserImgConsent;

        const sViewId = bUseSelector ? "userAccountSelector" : "userAccountSetting";
        const sComponentNamespace = bUseSelector
            ? "sap.ushell.components.shell.Settings.userAccount.UserAccountSelector"
            : "sap.ushell.components.shell.Settings.userAccount.UserAccountSetting";

        const sIcon = Config.last("/core/shell/model/userImage/account") || "sap-icon://account";
        let oViewInstance;

        const oEntry = {
            id: "userAccountEntry",
            entryHelpID: "userAccountEntry",
            title: resources.i18n.getText("UserAccountFld"),
            valueResult: null,
            contentResult: null,
            icon: sIcon,
            valueArgument: Container.getUser().getFullName(),
            provideEmptyWrapper: true, // to hide the header and add custom header instead
            contentFunc: function () {
                return XMLView.create({
                    id: sViewId,
                    viewName: sComponentNamespace
                }).then((oView) => {
                    oViewInstance = oView;
                    return oView;
                });
            },
            onSave: function (fnUpdateUserPreferences) {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave(fnUpdateUserPreferences);
                }
                Log.warning("Save operation for user account settings was not executed, because the userAccount view was not initialized");
                return Promise.resolve();
            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for user account settings was not executed, because the userAccount view was not initialized"
                );
            }
        };

        return oEntry;
    }

    return {
        getEntry: getEntry
    };
});
