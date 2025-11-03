// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.JamShareButton.
sap.ui.define([
    "sap/base/Log",
    "sap/collaboration/components/fiori/sharing/dialog/Component",
    "sap/m/Button",
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/ui/core/Component",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    Log,
    Component,
    Button,
    ButtonRenderer,
    CoreComponent,
    ushellLibrary,
    resources,
    Container
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.footerbar.JamShareButton
     * @class
     * @classdesc Constructor for a new ui/footerbar/JamShareButton.
     * Add your documentation for the new ui/footerbar/JamShareButton
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.m.Button
     *
     * @since 1.15.0
     * @private
     */
    const JamShareButton = Button.extend("sap.ushell.ui.footerbar.JamShareButton", /** @lends sap.ushell.ui.footerbar.JamShareButton.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                beforePressHandler: { type: "any", group: "Misc", defaultValue: null },
                afterPressHandler: { type: "any", group: "Misc", defaultValue: null },
                jamData: { type: "object", group: "Misc", defaultValue: null }
            }
        },
        renderer: ButtonRenderer
    });

    JamShareButton.prototype.init = function () {
        // call the parent sap.m.Button init method
        if (Button.prototype.init) {
            Button.prototype.init.apply(this, arguments);
        }

        this.setEnabled(); // disables button if shell not initialized or Jam not active
        this.setIcon("sap-icon://share-2");
        this.setText(resources.i18n.getText("shareBtn"));

        this.attachPress(() => {
            if (this.getBeforePressHandler()) {
                this.getBeforePressHandler()();
            }
            this.showShareDialog(this.getAfterPressHandler());
        });
    };

    JamShareButton.prototype._createShareComponent = function () {
        this.oShareComponentPromise = CoreComponent.create({
            name: "sap.collaboration.components.fiori.sharing.dialog",
            settings: this.getJamData()
        });
        return this.oShareComponentPromise;
    };

    JamShareButton.prototype.showShareDialog = function (cb) {
        if (!this.oShareComponentPromise) {
            this.oShareComponentPromise = this._createShareComponent();
        }

        if (Container.inAppRuntime()) {
            this.adjustFLPUrl(this.getJamData())
                .catch((oError) => {
                    Log.error("Could not retrieve FLP URL", oError, "sap.ushell.ui.footerbar.JamShareButton");
                    throw oError;
                })
                .then(() => {
                    return this.oShareComponentPromise.then((oShareComponent) => {
                        oShareComponent.open();
                        if (cb) {
                            cb();
                        }
                    });
                });
        } else {
            return this.oShareComponentPromise.then((oShareComponent) => {
                oShareComponent.open();
                if (cb) {
                    cb();
                }
            });
        }
    };

    JamShareButton.prototype.exit = function () {
        if (this.shareComponentPromise) {
            this.shareComponentPromise.then((shareComponent) => {
                shareComponent.destroy();
            });
        }
        // call the parent sap.m.Button exit method
        if (Button.prototype.exit) {
            Button.prototype.exit.apply(this, arguments);
        }
    };

    JamShareButton.prototype.setEnabled = function (bEnabled) {
        if (Container.isInitialized()) {
            const oUser = Container.getUser();
            if (!(oUser && oUser.isJamActive())) {
                if (!bEnabled) {
                    Log.info("Disabling JamShareButton: user not logged in or Jam not active", null,
                        "sap.ushell.ui.footerbar.JamShareButton");
                }
                bEnabled = false;
                this.setVisible(false);
            }
        } else {
            if (!bEnabled) {
                Log.warning("Disabling JamShareButton: unified shell container not initialized", null,
                    "sap.ushell.ui.footerbar.JamShareButton");
            }
            bEnabled = false;
        }
        Button.prototype.setEnabled.call(this, bEnabled);
    };

    /**
     * in cFLP, the URL of FLP needs to be taken from the outer shell and not from
     * the iframe, so the proper URL will be shared in JAM
     *
     * @param {object} jamData data that contains a URL
     * @returns {Promise} resolves if jamData is incomplete, wrong or was changed.
     *  rejects if call to getFLPUrl failed.
     *
     * @since 1.74.0
     * @private
     */
    JamShareButton.prototype.adjustFLPUrl = function (jamData) {
        if (jamData && jamData.object && jamData.object.id && typeof jamData.object.id === "string" && jamData.object.id === document.URL) {
            return Container.getFLPUrl(true).then((sURL) => {
                jamData.object.id = sURL;
            });
        }

        return Promise.resolve();
    };

    return JamShareButton;
}, true /* bExport */);
