// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/i18n/Localization",
    "sap/base/util/isEmptyObject",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/core/IconPool",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/Container",
    "sap/ushell/state/ShellModel"
], (
    logger,
    Localization,
    isEmptyObject,
    Button,
    coreLibrary,
    IconPool,
    UIComponent,
    Device,
    jQuery,
    resources,
    Container,
    ShellModel
) => {
    "use strict";

    const ButtonType = coreLibrary.ButtonType;
    /**
     * TODO: This entire thing does not need to have a UI Component as it has no own UI representation.
     * User Image is part of Shell Header and ME area
     * Should rather be a plain Component
     *
     */
    return UIComponent.extend("sap.ushell.components.shell.UserImage.Component", {

        metadata: {
            version: "1.141.0",
            library: "sap.ushell.components.shell.UserImage",
            dependencies: {
                libs: {
                    "sap.m": {},
                    "sap.ui.layout": {
                        lazy: true
                    }
                }
            }
        },

        createContent: function () {
            const oShellConfig = Container.getRendererInternal("fiori2").getShellConfig();
            this.loadUserImage();
            const oUser = Container.getUser();
            if (oShellConfig.enableUserImgConsent === true && oUser.getImageConsent() === undefined) {
                this._showUserConsentPopup();
            }
        },

        _showUserConsentPopup: function () {
            const that = this;
            const sTextAlign = Localization.getRTL() ? "Right" : "Left";
            let dialog; let fboxUserConsentItem1; let fboxUserConsentItem2; let fboxUserConsentItem3;

            const yesButton = new Button("yesButton", {
                text: resources.i18n.getText("DisplayImg"),
                type: ButtonType.Emphasized,
                press: function () {
                    that.updateUserImage(true);
                    dialog.close();
                }
            });
            const noButton = new Button("noButton", {
                text: resources.i18n.getText("DontDisplayImg"),
                press: function () {
                    that.updateUserImage(false);
                    dialog.close();
                }
            });
            sap.ui.require([
                "sap/ui/layout/form/VerticalLayout", // todo move to sap/ui/layout/VerticalLayout in follow up
                "sap/m/Dialog",
                "sap/m/Text",
                "sap/m/Link",
                "sap/m/FlexBox"
            ], (
                VerticalLayout,
                Dialog,
                Text,
                Link,
                FlexBox
            ) => {
                dialog = new Dialog("userConsentDialog", {
                    title: resources.i18n.getText("userImageConsentDialogTitle"),
                    modal: true,
                    stretch: Device.system.phone,
                    buttons: [yesButton, noButton],
                    afterClose: function () {
                        dialog.destroy();
                    }
                }).addStyleClass("sapUshellUserConsentDialog").addStyleClass("sapContrastPlus");

                const useOfTermsText = new Text({
                    text: resources.i18n.getText("userImageConsentDialogTermsOfUse")
                }).addStyleClass("sapUshellUserConsentDialogTerms");

                const consentText = new Text({
                    text: resources.i18n.getText("userImageConsentText"),
                    textAlign: sTextAlign
                }).addStyleClass("sapUshellUserConsentDialogText");

                const useOfTermsLink = new Link({
                    text: resources.i18n.getText("userImageConsentDialogShowTermsOfUse"),
                    textAlign: sTextAlign,
                    press: function () {
                        const isTermsOfUseVisilble = fboxUserConsentItem3.getVisible();
                        if (isTermsOfUseVisilble) {
                            fboxUserConsentItem3.setVisible(false);
                            useOfTermsLink.setText(resources.i18n.getText("userImageConsentDialogShowTermsOfUse"));
                        } else {
                            useOfTermsLink.setText(resources.i18n.getText("userImageConsentDialogHideTermsOfUse"));
                            fboxUserConsentItem3.setVisible(true);
                        }
                    }
                }).addAriaLabelledBy(consentText);

                fboxUserConsentItem1 = new FlexBox({
                    alignItems: "Center",
                    direction: "Row",
                    items: [
                        consentText
                    ]
                }).addStyleClass("sapUshellUserConsentDialogBox");

                fboxUserConsentItem2 = new FlexBox({
                    alignItems: "Center",
                    direction: "Row",
                    items: [
                        useOfTermsLink
                    ]
                }).addStyleClass("sapUshellUserConsentDialogBox").addStyleClass("sapUshellUserConsentDialogLink");

                fboxUserConsentItem3 = new FlexBox({
                    alignItems: "Center",
                    direction: "Row",
                    items: [
                        useOfTermsText
                    ]
                }).addStyleClass("ushellUserImgConsentTermsOfUseFlexBox");
                fboxUserConsentItem3.setVisible(false);
                const layout = new VerticalLayout("userConsentDialogLayout", {
                    content: [fboxUserConsentItem1, fboxUserConsentItem2, fboxUserConsentItem3]
                });

                dialog.addContent(layout);
                dialog.open();
            });
        },

        loadUserImage: function () {
            const oUser = Container.getUser();
            const imageURI = oUser.getImage();

            if (imageURI) {
                this._setUserImage(imageURI);
            }
            oUser.attachOnSetImage(this._setUserImage.bind(this));
        },

        // Changing the property of userImage in the model, which is bound to the userActionsMenuHeaderButton
        _setUserImage: function (param) {
            const sUrl = typeof param === "string" ? param : param.mParameters;

            if (sUrl && typeof sUrl === "string" || !isEmptyObject(sUrl)) {
                // Using jQuery.ajax instead of jQuery.get in-order to be able to control the caching.
                jQuery.ajax({
                    url: sUrl,
                    // "cache: false" didn't work as expected hence, turning off the cache vie explicit headers.
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0"
                    },
                    success: function () {
                        // if there's a url for the image, set the model's property - userImage to its url
                        ShellModel.getConfigModel().setProperty("/userImage/personPlaceHolder", sUrl);
                        ShellModel.getConfigModel().setProperty("/userImage/account", sUrl);
                    },
                    error: function () {
                        logger.error(`Could not load user image from: ${sUrl}`, "", "sap.ushell.renderer.Shell.view");
                        Container.getUser().setImage("");
                    }
                });
            } else {
                ShellModel.getConfigModel().setProperty("/userImage/personPlaceHolder", null);
                ShellModel.getConfigModel().setProperty("/userImage/account", IconPool.getIconURI("account"));
            }
        },

        updateUserImage: function (isImageConsent) {
            const oUser = Container.getUser();
            let oUserPreferencesPromise;

            Container.getServiceAsync("UserInfo")
                .then((UserInfo) => {
                    if (isImageConsent !== undefined) {
                        oUser.setImageConsent(isImageConsent);
                        oUserPreferencesPromise = UserInfo.updateUserPreferences(oUser);
                        oUserPreferencesPromise.done(() => {
                            oUser.resetChangedProperty("isImageConsent");
                        });
                    }
                });
        }
    });
});
