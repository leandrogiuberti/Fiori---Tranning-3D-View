// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Provides control sap.ushell.ui.footerbar.AddBookmarkButton.
 * @deprecated since 1.136
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/Button",
    "sap/m/ButtonRenderer", // will load the renderer async
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/MessageBox",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/ui/core/library",
    "sap/ui/core/mvc/View",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/state/StateManager"
], (
    Log,
    Button,
    ButtonRenderer,
    Dialog,
    mobileLibrary,
    MessageBox,
    Text,
    VBox,
    coreLibrary,
    View,
    Device,
    JSONModel,
    Config,
    ushellLibrary,
    ushellResources,
    StateManager
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ui.core.ValueState
    const ValueState = coreLibrary.ValueState;

    // shortcut for sap.ui.core.mvc.ViewType
    const ViewType = coreLibrary.mvc.ViewType;

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;
    const {
        Headerless,
        Standalone,
        Embedded,
        Merged
    } = ShellMode;

    /**
     * @alias sap.ushell.ui.footerbar.AddBookmarkButton
     * @class
     * @classdesc Enables users to save bookmark tiles in the Fiori launchpad.
     * Clicking the button opens a dialog box for saving the app state, so that the app can be launched directly in that state from the launchpad.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new control

     * @extends sap.m.Button
     *
     * @public
     * @deprecated since 1.136
     */
    const AddBookmarkButton = Button.extend("sap.ushell.ui.footerbar.AddBookmarkButton", /** @lends sap.ushell.ui.footerbar.AddBookmarkButton.prototype */{
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * A callback function that is called before the save-as-tile dialog is opened.
                 */
                beforePressHandler: { type: "function", group: "Misc", defaultValue: null },

                /**
                 * A callback function that is called after the save-as-tile dialog is closed.
                 */
                afterPressHandler: { type: "function", group: "Misc", defaultValue: null },

                /**
                 * Title to be displayed on the tile.
                 */
                title: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Subtitle to be displayed below the tile title.
                 */
                subtitle: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Text to be displayed at the bottom of the tile.
                 */
                info: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Icon to be displayed in the Tile.
                 */
                tileIcon: { type: "string", group: "Appearance", defaultValue: null },

                /**
                 * For dynamic tile, the unit to be displayed below the number, for example, USD.
                 */
                numberUnit: { type: "string", group: "Appearance", defaultValue: null },

                /**
                 * The keywords based on which the future tile should be indexed and filtered.
                 */
                keywords: { type: "string", group: "Misc", defaultValue: null },

                /**
                 *  The target intent or URL of the bookmark. If the target app runs in the current shell, the URL has
                 *  to be a valid intent, i.e. in the format <code>"#SO-Action?P1=a&P2=x&/route?RPV=1"</code>.
                 *  See also {@link sap.ushell.services.URLParsing#getHash}.
                 */
                customUrl: { type: "any", group: "Misc", defaultValue: null },

                /**
                 * URL of an OData service from which data for a dynamic tile should be read.
                 */
                serviceUrl: { type: "any", group: "Misc", defaultValue: null },

                /**
                 * Data source of the OData service.
                 * See same parameter of {@link sap.ushell.services.Bookmark#addBookmark} for details
                 */
                dataSource: { type: "any", group: "Misc", defaultValue: null },

                /**
                 * Number of seconds after which dynamic content is read from the data source and the display is refreshed.
                 */
                serviceRefreshInterval: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Whether to display the control for group selection in the save-as-tile dialog in launchpad homepage mode.
                 */
                showGroupSelection: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * Whether to display the control for page selection in the save-bookmark dialog in launchpad spaces mode.
                 */
                showPageSelection: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * An object containing properties with information about the app, e.g. serviceUrl, numberUnit, ... .
                 * @deprecated since 1.31. Use dedicated properties like afterPressHandler, beforePresshandler, customUrl, ... of the AddBookmarkButton instead.
                 */
                appData: { type: "object", group: "Misc", defaultValue: null, deprecated: true }
            }
        },
        renderer: ButtonRenderer
    });

    AddBookmarkButton.prototype.init = function () {
        // call the parent sap.m.Button init method
        if (Button.prototype.init) {
            Button.prototype.init.apply(this, arguments);
        }

        this.bSpaceEnabled = Config.last("/core/spaces/enabled");
        this.bMyHomeEnabled = Config.last("/core/spaces/myHome/enabled");
        this.setIcon("sap-icon://add-favorite");
        this.bindProperty("text", { path: "i18n>addToHomePageBtn" });
        this.setEnabled(); // disables button if shell not initialized
        this.oModel = new JSONModel({
            showGroupSelection: true,
            showPageSelection: true,
            title: "",
            subtitle: "",
            numberValue: 0,
            info: "",
            icon: "",
            numberUnit: "",
            keywords: ""
        });
        this.setModel(ushellResources.i18nModel, "i18n");

        this.attachPress(() => {
            const fnBeforePressCallback = this.getBeforePressHandler();
            if (fnBeforePressCallback) {
                fnBeforePressCallback();
            }

            this.showAddBookmarkDialog();
        });
    };

    AddBookmarkButton.prototype.exit = function () {
        if (this.oDialog) {
            this.oDialog.destroy();
        }
        if (this.oModel) {
            this.oModel.destroy();
        }
        // call the parent sap.m.Button exit method
        if (Button.prototype.exit) {
            Button.prototype.exit.apply(this, arguments);
        }
    };

    AddBookmarkButton.prototype.setBookmarkTileView = function (oView) {
        this.bookmarkTileView = oView;
    };

    AddBookmarkButton.prototype.getBookmarkTileView = function () {
        return this.bookmarkTileView;
    };

    AddBookmarkButton.prototype.showAddBookmarkDialog = function () {
        // Create view for save bookmark dialog
        const oAppData = this.getAppData() || {};
        const oViewData = {
            serviceUrl: this.getServiceUrl() || oAppData.serviceUrl,
            customUrl: this.getCustomUrl() || oAppData.customUrl
        };
        this.oModel.setProperty("/serviceUrl", !!oViewData.serviceUrl);
        let oViewPromise;

        if (this.bSpaceEnabled) {
            oViewPromise = View.create({
                type: ViewType.XML,
                viewName: "sap.ushell.ui.bookmark.SaveOnPage",
                viewData: oViewData
            });
        } else {
            oViewPromise = View.create({
                viewName: "module:sap/ushell/ui/footerbar/SaveAsTile.view",
                viewData: oViewData
            });
        }

        return oViewPromise.then((oDialogView) => {
            this.setBookmarkTileView(oDialogView);
            oDialogView.setModel(this.oModel);
            oDialogView.setModel(ushellResources.i18nModel, "i18n");
            return (this._openDialog(oDialogView));
        });
    };

    AddBookmarkButton.prototype._openDialog = function (oContent) {
        // Create and open dialog
        this.oDialog = new Dialog({
            id: "bookmarkDialog",
            title: "{i18n>addToHomePageBtn}",
            contentWidth: "25rem",
            content: oContent,
            beginButton: new Button("bookmarkOkBtn", {
                text: "{i18n>saveBtn}",
                type: ButtonType.Emphasized,
                press: [this._handleOKButtonPress, this]
            }),
            endButton: new Button("bookmarkCancelBtn", {
                text: "{i18n>cancelBtn}",
                press: [this._handleCancelButtonPress, this]
            }),
            stretch: Device.system.phone,
            horizontalScrolling: false,
            afterClose: function () {
                const fnAfterPressCallBack = this.getAfterPressHandler();
                if (fnAfterPressCallBack) {
                    fnAfterPressCallBack();
                }
                this._restoreDialogEditableValuesToDefault();
                this.oDialog.destroy();
                delete this.oDialog;
            }.bind(this)
        }).addStyleClass("sapContrastPlus");
        this.oDialog.open();
        this.oDialog.setModel(ushellResources.i18nModel, "i18n");

        return this.oDialog;
    };

    AddBookmarkButton.prototype._handleOKButtonPress = function () {
        if (this.oDialog.getBusy()) {
            return;
        }

        /**
         * @deprecated since 1.119.
         */
        if (!this.bSpaceEnabled) {
            this._handleOKButtonPressClassicMode();
            return;
        }

        this._handleOKButtonPressSpacesMode();
    };

    AddBookmarkButton.prototype._handleCancelButtonPress = function () {
        /**
         * @deprecated since 1.119.
         */
        if (!this.bSpaceEnabled) {
            this._handleCancelButtonPressClassicMode();
            return;
        }

        this._handleCancelButtonPressSpacesMode();
    };

    AddBookmarkButton.prototype.setTitle = function (sTitle) {
        this.setProperty("title", sTitle, true);
        this.oModel.setProperty("/title", sTitle);
        return this;
    };

    AddBookmarkButton.prototype.setSubtitle = function (sSubtitle) {
        this.setProperty("subtitle", sSubtitle, true);
        this.oModel.setProperty("/subtitle", sSubtitle);
        return this;
    };

    AddBookmarkButton.prototype.setInfo = function (sInfo) {
        this.setProperty("info", sInfo, true);
        this.oModel.setProperty("/info", sInfo);
        return this;
    };

    AddBookmarkButton.prototype.setTileIcon = function (sIcon) {
        this.setProperty("tileIcon", sIcon, true);
        this.oModel.setProperty("/icon", sIcon);
        return this;
    };

    AddBookmarkButton.prototype.setShowGroupSelection = function (bShowGroupSelection) {
        this.setProperty("showGroupSelection", bShowGroupSelection, true);
        this.oModel.setProperty("/showGroupSelection", bShowGroupSelection);
        return this;
    };

    AddBookmarkButton.prototype.setNumberUnit = function (sNumberUnit) {
        this.setProperty("numberUnit", sNumberUnit, true);
        this.oModel.setProperty("/numberUnit", sNumberUnit);
        return this;
    };

    AddBookmarkButton.prototype.setServiceRefreshInterval = function (sServiceRefreshInterval) {
        this.setProperty("serviceRefreshInterval", sServiceRefreshInterval, true);
        this.oModel.setProperty("/serviceRefreshInterval", sServiceRefreshInterval);
        return this;
    };

    AddBookmarkButton.prototype.setDataSource = function (oDataSource) {
        this.setProperty("dataSource", oDataSource, true);
        this.oModel.setProperty("/dataSource", oDataSource);
        return this;
    };

    AddBookmarkButton.prototype.setKeywords = function (sKeywords) {
        this.setProperty("keywords", sKeywords, true);
        this.oModel.setProperty("/keywords", sKeywords);
        return this;
    };

    AddBookmarkButton.prototype.setAppData = function (oAppData) {
        this.setProperty("appData", oAppData, true);
        const aButtonProperties = [
            "showGroupSelection",
            "title",
            "subtitle",
            "info",
            "icon",
            "numberUnit",
            "keywords",
            "serviceRefreshInterval",
            "dataSource"
        ];
        const aModelProperties = [
            "showInfo",
            "showPreview"
        ];

        Object.keys(oAppData).forEach((sKey) => {
            if (aButtonProperties.indexOf(sKey) > -1) {
                const sPropertyKey = sKey === "icon" ? "tileIcon" : sKey;
                this.setProperty(sPropertyKey, oAppData[sKey], true);
            }
            if (aButtonProperties.indexOf(sKey) > -1 || aModelProperties.indexOf(sKey) > -1) {
                this.oModel.setProperty(`/${sKey}`, oAppData[sKey]);
            }
        });
        return this;
    };

    AddBookmarkButton.prototype._restoreDialogEditableValuesToDefault = function () {
        if (this.oModel) {
            this.oModel.setProperty("/title", this.getTitle());
            this.oModel.setProperty("/subtitle", this.getSubtitle());
            this.oModel.setProperty("/info", this.getInfo());
        }
    };

    /**
     * A confirmation message dialog is created and displayed, in case a title,
     * subtitle or description is provided.
     *
     * @private
     */
    AddBookmarkButton.prototype._handleCancelButtonPressSpacesMode = function () {
        const oBookmarkTileController = this.getBookmarkTileView().getController();
        const oBookmarkData = oBookmarkTileController.getBookmarkTileData();

        if (oBookmarkData.title || oBookmarkData.subtitle || oBookmarkData.info || oBookmarkData.contentNodes.length) {
            const sDiscardAction = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.Action.Discard");
            const sMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.Message.Discard");
            const sTitle = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.Title.Discard");

            MessageBox.show(sMessage, {
                title: sTitle,
                actions: [
                    sDiscardAction,
                    MessageBox.Action.CANCEL
                ],
                emphasizedAction: sDiscardAction,
                onClose: function (sResult) {
                    if (sResult === sDiscardAction) {
                        this.oDialog.close();
                    }
                }.bind(this)
            });
        } else {
            this.oDialog.close();
        }
    };

    AddBookmarkButton.prototype._handleOKButtonPressSpacesMode = function () {
        const oBookmarkTileController = this.getBookmarkTileView().getController();
        const oBookmarkData = oBookmarkTileController.getBookmarkTileData();
        let bValid = true;

        if (oBookmarkData.contentNodes.length === 0) {
            const oPageSelect = oBookmarkTileController.byId("SelectedNodesComboBox");
            if (oPageSelect) {
                oPageSelect.setValueState(ValueState.Error);
                oPageSelect.setValueStateText(ushellResources.i18n.getText("bookmarkPageSelectError"));
                bValid = false;
            }
        }

        if (!oBookmarkData.title || oBookmarkData.title.length < 1) {
            const oTitle = oBookmarkTileController.byId("bookmarkTitleInput");
            if (oTitle) {
                oTitle.setValueState(ValueState.Error);
                oTitle.setValueStateText(ushellResources.i18n.getText("bookmarkTitleInputError"));
                bValid = false;
            }
        }

        if (!bValid) {
            sap.ushell.Container.getServiceAsync("MessageInternal").then((oMessageService) => {
                oMessageService.info(ushellResources.i18n.getText("SaveAsTileDialog.MessageToast.ValidationFailed"));
            });
            return;
        }

        this.oDialog.setBusy(true);
        this.oDialog.close(); // dialog is destroyed after closing

        const oBookmarkServicePromise = sap.ushell.Container.getServiceAsync("BookmarkV2");
        const aAddToPagePromises = oBookmarkData.contentNodes.map((oContentNode) => {
            return oBookmarkServicePromise.then((oBookmarkService) => {
                return oBookmarkService.addBookmark(oBookmarkData, oContentNode);
            })
                .then(() => {
                    return {
                        pageId: oContentNode.id,
                        status: "resolved"
                    };
                })
                .catch((oError) => {
                    Log.error("Failed to add one a bookmark: ", oError, "sap.ushell.ui.footerbar.AddBookmarkButton");
                    return {
                        pageId: oContentNode.id,
                        error: oError.message,
                        status: "failed"
                    };
                });
        });

        Promise.all(aAddToPagePromises).then((aResults) => {
            sap.ushell.Container.getServiceAsync("MessageInternal").then((oMessageService) => {
                const iSuccess = aResults.filter((oResult) => {
                    return oResult.status === "resolved";
                }).length;
                const aFailed = aResults.filter((oResult) => {
                    return oResult.status === "failed";
                });

                if (iSuccess === 1) {
                    oMessageService.info(ushellResources.i18n.getText("SaveAsTileDialog.MessageToast.TileCreatedInPage"));
                } else if (iSuccess > 1) {
                    oMessageService.info(ushellResources.i18n.getText("SaveAsTileDialog.MessageToast.TileCreatedInPages"));
                }

                if (aFailed.length) {
                    this._showErrorDialog(aFailed, iSuccess, oBookmarkData.title);
                }
            });
        });
    };

    /**
     * Creates and displays an error dialog that adjusts its content to the given parameters.
     *
     * @param {object[]} failedBookmarks The failed bookmarks
     * @param {int} nrOfSuccessfulBookmarks Number of successfully created bookmarks
     * @param {string} bookmarkTitle The title of the bookmark tile
     *
     * @private
     */
    AddBookmarkButton.prototype._showErrorDialog = function (failedBookmarks, nrOfSuccessfulBookmarks, bookmarkTitle) {
        sap.ushell.Container.getServiceAsync("MessageInternal").then((oMessageService) => {
            let sErrorMessage;
            let sDetailMessage;

            if (failedBookmarks.length === 1) {
                if (nrOfSuccessfulBookmarks === 0) {
                    sErrorMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.SinglePageError");
                } else {
                    sErrorMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.OnePageError");
                }
                sDetailMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.PageErrorDetail",
                    [bookmarkTitle, failedBookmarks[0].pageId]);
            } else if (failedBookmarks.length > 1) {
                if (nrOfSuccessfulBookmarks === 0) {
                    sErrorMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.AllPagesError");
                } else {
                    sErrorMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.SomePagesError");
                }
                const sPageIds = failedBookmarks.map((oFailedPage) => {
                    return oFailedPage.pageId;
                }).join("\n");
                sDetailMessage = ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.PagesErrorDetail", [bookmarkTitle, sPageIds]);
            }

            const oDetailsBox = new VBox({
                items: [
                    new Text({
                        text: sDetailMessage
                    }).addStyleClass("sapUiSmallMarginBottom"),
                    new Text({
                        text: failedBookmarks.map((oFailedPage) => {
                            return oFailedPage.error;
                        }).join("\n")
                    }).addStyleClass("sapUiSmallMarginBottom"),
                    new Text({
                        text: ushellResources.i18n.getText("SaveAsTileDialog.MessageBox.PageErrorSolution")
                    })
                ]
            });

            oMessageService.errorWithDetails(sErrorMessage, oDetailsBox);
        });
    };

    /**
     * @deprecated since 1.118.
     */
    AddBookmarkButton.prototype._handleCancelButtonPressClassicMode = function () {
        this.oDialog.close();
    };

    /**
     * @returns {Promise} A promise which resolves on success
     * @deprecated since 1.118.
     */
    AddBookmarkButton.prototype._handleOKButtonPressClassicMode = async function () {
        const oBookmarkTileView = this.getBookmarkTileView();
        const oBookmarkTileController = oBookmarkTileView.getController();
        const oBookmarkData = oBookmarkTileController.getBookmarkTileData();

        if (!oBookmarkData.title || oBookmarkData.title.length < 1) {
            const oTitle = oBookmarkTileView.getTitleInput();
            if (oTitle) {
                oTitle.setValueState(ValueState.Error);
                oTitle.setValueStateText(ushellResources.i18n.getText("bookmarkTitleInputError"));
                throw new Error("Invalid bookmark title");
            }
        }
        this.oDialog.setBusy(true);
        this.oDialog.close(); // dialog is destroyed after closing

        const sTileGroup = oBookmarkData.group ? oBookmarkData.group.object : "";
        delete oBookmarkData.group;

        return Promise.all([
            sap.ushell.Container.getServiceAsync("BookmarkV2"),
            sap.ushell.Container.getServiceAsync("MessageInternal")
        ]).then((aResult) => {
            const oBookmarkService = aResult[0];
            const oMessageService = aResult[1];

            return oBookmarkService.addBookmark(oBookmarkData, sTileGroup)
                .then(() => {
                    oMessageService.info(ushellResources.i18n.getText("tile_created_msg"));
                })
                .catch((oError) => {
                    Log.error("Failed to add bookmark", oError, "sap.ushell.ui.footerbar.AddBookmarkButton");
                    oMessageService.error(ushellResources.i18n.getText("fail_to_add_tile_msg"));
                });
        });
    };

    AddBookmarkButton.prototype.setEnabled = function (bEnabled) {
        let bPersonalizationEnabled = true;
        const sCurrentLaunchpadState = StateManager.getLaunchpadState();
        const sCurrentShellMode = StateManager.getShellMode();

        if (sap.ushell.Container) {
            const bConfigPersonalization = Config.last("/core/shell/enablePersonalization");
            if (bConfigPersonalization !== undefined) {
                bPersonalizationEnabled = bConfigPersonalization;
            }

            if (!bPersonalizationEnabled && this.bSpaceEnabled && this.bMyHomeEnabled) {
                bPersonalizationEnabled = true;
            }
        }
        if (!bPersonalizationEnabled || (sCurrentLaunchpadState === LaunchpadState.App && [Headerless, Standalone, Embedded, Merged].includes(sCurrentShellMode))) {
            bEnabled = false;
        }
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                Log.warning(
                    "Disabling 'Save as Tile' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.AddBookmarkButton"
                );
            }
            bEnabled = false;
        }
        Button.prototype.setEnabled.call(this, bEnabled);
        if (!bEnabled) {
            this.addStyleClass("sapUshellAddBookmarkButton");
        }
    };

    return AddBookmarkButton;
});
