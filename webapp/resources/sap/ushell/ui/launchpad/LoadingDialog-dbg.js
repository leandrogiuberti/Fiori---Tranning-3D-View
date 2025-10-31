// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.LoadingDialog.
sap.ui.define([
    "sap/m/Label",
    "sap/ui/core/Control",
    "sap/ui/core/Icon",
    "sap/ui/core/Popup",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "./LoadingDialogRenderer"
], (
    Label,
    Control,
    Icon,
    Popup,
    ushellLibrary,
    resources,
    AccessibilityCustomData,
    LoadingDialogRenderer
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.LoadingDialog
     * @class
     * @classdesc Constructor for a new ui/launchpad/LoadingDialog.
     * Displays a loading dialog with an indicator that an app is loading
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.ui.core.Control
     *
     * @private
     */
    const LoadingDialog = Control.extend("sap.ushell.ui.launchpad.LoadingDialog", /** @lends sap.ushell.ui.launchpad.LoadingDialog.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                iconUri: // the sap-icon://-style URI of an icon
                    { type: "sap.ui.core.URI", group: "Appearance", defaultValue: null },
                text: // the text to be displayed
                    { type: "sap.ui.core.URI", group: "Appearance", defaultValue: null },
                loadAnimationWithInterval: // defines whether the presentation of the Fiori flower animation should be displayed with an interval
                    { type: "boolean", group: "Appearance", defaultValue: true }
            }
        },

        renderer: LoadingDialogRenderer
    });

    LoadingDialog.prototype.init = function () {
        this._oPopup = new Popup();
        this._oPopup.restoreFocus = false;
        this._oPopup.setShadow(false);
        // adds the class "sapUshellLoadingDialog" to UI5 block layer
        this._oPopup.setModal(true, "sapUshellLoadingDialog");
        this.oIcon = new Icon();
        this._oLabel = new Label(`${this.getId()}loadingLabel`).addStyleClass("sapUshellLoadingDialogLabel");
        this.sState = "idle";
        // TODO: Require a dedicated string for application loading
        this.sLoadingString = resources.i18n.getText("genericLoading").replace("...", " ");
    };

    LoadingDialog.prototype.exit = function () {
        this._oPopup.close();
        this._oPopup.destroy();
        this.oIcon.destroy();
        this._oLabel.destroy();
    };

    LoadingDialog.prototype.isOpen = function () {
        return this._oPopup.isOpen();
    };

    LoadingDialog.prototype.openLoadingScreen = function () {
        if (this.sState === "idle") {
            this.sState = "busy";
        }
        if (this.getLoadAnimationWithInterval()) {
            this.addStyleClass("sapUshellVisibilityHidden");
            this._iTimeoutId = setTimeout(() => {
                this.removeStyleClass("sapUshellVisibilityHidden");
                this.focus();
            }, 3000);
        } else {
            // Show the Fiori Flower and the appInfo at any rate in case the Animation is applied without interval.
            this.removeStyleClass("sapUshellVisibilityHidden");
            this.focus();
        }
        if (!this.getVisible()) {
            this.setVisible(true);
            this.$().show();
        }
        if (!this.isOpen()) {
            this._oPopup.setContent(this);
            this._oPopup.setPosition("center center", "center center", document, "0 0", "fit");
            this._oPopup.open();
        }
    };

    LoadingDialog.prototype.showAppInfo = function (sAppTitle, sIconUri, bAnnounceAppTitle) {
        this.setText(sAppTitle);
        this.setIconUri(sIconUri);
        this.oIcon.setSrc(sIconUri);
        this._oLabel.setText(sAppTitle);

        this._oLabel.addCustomData(new AccessibilityCustomData({
            key: "aria-hidden",
            value: "true",
            writeToDom: true
        }));

        const oACCHelper = this.getDomRef("accessibility-helper");
        if (oACCHelper && bAnnounceAppTitle) {
            oACCHelper.innerText = this.sLoadingString;
        }
    };

    LoadingDialog.prototype.closeLoadingScreen = function () {
        if (this._iTimeoutId) {
            // Terminate delayed Fiori Flower presentation.
            clearTimeout(this._iTimeoutId);
        }
        if (this.getVisible()) {
            this.sState = "idle";
            this.setVisible(false);
            this.$().hide();
            this._oPopup.close();
        }
    };

    return LoadingDialog;
});
