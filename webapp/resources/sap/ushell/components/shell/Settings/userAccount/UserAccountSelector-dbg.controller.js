// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/Container"
], (
    Controller,
    JSONModel,
    Log,
    Config,
    resources,
    MessageBox,
    MessageToast,
    ushellUtils,
    windowUtils,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userAccount.UserAccountSelector", {
        onInit: function () {
            const oShellConfig = Container.getRendererInternal("fiori2").getShellConfig();
            const bEnableUserImgConsent = oShellConfig.enableUserImgConsent;
            // determines whether the User Image consent feature is enabled
            this.imgConsentEnabled = bEnableUserImgConsent || false;
            this.oUser = Container.getUser();

            const oConfigModel = this.getConfigurationModel();
            this.getView().setModel(resources.i18nModel, "i18n");
            this.getView().setModel(oConfigModel, "config");

            this.oUser.attachOnSetImage(() => {
                oConfigModel.setProperty("/icon", Config.last("/core/shell/model/userImage/personPlaceHolder"));
            });

            Container.getServiceAsync("PersonalizationV2")
                .then((oPersonalizationService) => {
                    return oPersonalizationService.isResetEntirePersonalizationSupported()
                        .then((bIsResetPersonalizationSupported) => {
                            if (!bIsResetPersonalizationSupported) {
                                oConfigModel.setProperty("/isResetPersonalizationVisible", false);
                            }
                        });
                })
                .catch((oError) => {
                    Log.error(`The personalization service could not be loaded because of: .${oError.toString()}`);
                });
        },

        getConfigurationModel: function () {
            const oModel = new JSONModel({});
            const oUser = Container.getUser();
            const sIcon = Config.last("/core/shell/model/userImage/personPlaceHolder") || "sap-icon://person-placeholder";
            oModel.setData({
                icon: sIcon,
                name: oUser.getFullName(),
                id: oUser.getId(),
                mail: oUser.getEmail(),
                server: window.location.host,
                imgConsentEnabled: this.imgConsentEnabled, // to show second tab
                isImageConsentForUser: oUser.getImageConsent(), // CheckBox state
                isResetPersonalizationVisible: this.isResetPersonalizationVisible || true,
                displayUserId: Config.last("/core/userSettings/displayUserId")
            });
            return oModel;
        },

        onCancel: function () {
            if (this.imgConsentEnabled) {
                this.getView().getModel("config").setProperty("/isImageConsentForUser", this.oUser.getImageConsent());
            }
        },

        onSave: function (fnUpdateUserPreferences) {
            if (this.imgConsentEnabled) {
                return this.onSaveUserImgConsent(fnUpdateUserPreferences);
            }
            return Promise.resolve();
        },

        onSaveUserImgConsent: function (fnUpdateUserPreferences) {
            const oUser = this.oUser;
            const bOrigUserImgConsent = oUser.getImageConsent();
            const oModel = this.getView().getModel("config");
            const bCurrentUserImgConsent = oModel.getProperty("/isImageConsentForUser");
            let oUserPreferencesPromise;
            Log.debug("[000] onSaveUserImgConsent:current", bCurrentUserImgConsent, "UserAccountSelector.controller");
            Log.debug("[000] onSaveUserImgConsent:original", bOrigUserImgConsent, "UserAccountSelector.controller");
            if (bOrigUserImgConsent !== bCurrentUserImgConsent) { // only if there was a change we would like to save it
                // set the user's image consent
                oUser.setImageConsent(bCurrentUserImgConsent);
                return new Promise((resolve, reject) => {
                    oUserPreferencesPromise = fnUpdateUserPreferences();
                    oUserPreferencesPromise.then(() => {
                        oUser.resetChangedProperty("isImageConsent");
                        resolve();
                    });
                    oUserPreferencesPromise.catch((oError) => {
                        const sErrorMessage = oError.message;
                        if (!sErrorMessage.includes("ISIMAGECONSENT")) {
                            oUser.resetChangedProperty("isImageConsent");
                            resolve();
                        } else {
                            // Apply the previous display density to the user
                            oUser.setImageConsent(bOrigUserImgConsent);
                            oUser.resetChangedProperty("isImageConsent");
                            oModel.setProperty("/isImageConsentForUser", bOrigUserImgConsent);
                            Log.error("Failed to update user image consent", oError);
                            reject(oError);
                        }
                    });
                });
            }
            return Promise.resolve();
        },

        termsOfUserPress: function () {
            const termsOfUseTextBox = this.getView().byId("termsOfUseTextFlexBox");
            const termsOfUseLink = this.getView().byId("termsOfUseLink");
            const isTermsOfUseVisible = termsOfUseTextBox.getVisible();

            termsOfUseTextBox.setVisible(!isTermsOfUseVisible);
            termsOfUseLink.setText(resources.i18n.getText(isTermsOfUseVisible ? "userImageConsentDialogShowTermsOfUse"
                : "userImageConsentDialogHideTermsOfUse"));
        },

        showMessageBoxWarningDeletePersonalization: function () {
            MessageBox.warning(resources.i18n.getText("userAccountResetPersonalizationWarningDialogDescription"), {
                onClose: this.resetEntirePersonalization.bind(this),
                actions: [ MessageBox.Action.OK, MessageBox.Action.CANCEL ],
                contentWidth: "600px"
            });
        },

        resetEntirePersonalization: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
                this.getView().setBusy(true);
                Container.getServiceAsync("PersonalizationV2")
                    .then((oPersonalizationService) => {
                        return oPersonalizationService.resetEntirePersonalization()
                            .then(() => {
                                MessageToast.show(resources.i18n.getText("userAccountResetPersonalizationWarningDialogSuccessToast"), {
                                    onClose: windowUtils.refreshBrowser
                                });
                            })
                            .catch(this.showErrorMessageBox.bind(this));
                    })
                    .catch(this.showErrorMessageBox.bind(this))
                    .finally(() => {
                        this.getView().setBusy(false);
                    });
            }
        },

        showErrorMessageBox: function () {
            MessageBox.error(resources.i18n.getText("userAccountResetPersonalizationWarningDialogErrorDialog"), {
                actions: MessageBox.Action.CLOSE,
                contentWidth: "600px"
            });
        }
    });
});
