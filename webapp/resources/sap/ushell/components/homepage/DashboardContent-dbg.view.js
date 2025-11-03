// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Fiori launchpad main view. The view includes a <code>sap.m.page</code>
 * with a header of type <code>sap.ushell.ui.launchpad.AnchorNavigationBar</code>
 * and content of type <code>sap.ushell.ui.launchpad.DashboardGroupsContainer</code>.
 *
 * @version 1.141.0
 *
 * @deprecated since 1.112
 * @private
 */
sap.ui.define([
    "sap/m/library",
    "sap/ui/core/library",
    "sap/m/Page",
    "sap/m/PageAccessibleLandmarkInfo",
    "sap/ui/core/Component",
    "sap/ui/core/Core",
    "sap/ui/core/mvc/View",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/homepage/DashboardGroupsBox",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AnchorItem",
    "sap/ushell/ui/launchpad/AnchorNavigationBar",
    "sap/ushell/utils",
    "sap/ushell/components/homepage/DashboardContent.controller", // controller must be preloaded
    "sap/ushell/components/homepage/ActionMode"
], (
    mobileLibrary,
    coreLibrary,
    Page,
    PageAccessibleLandmarkInfo,
    Component,
    Core,
    View,
    Device,
    Filter,
    FilterOperator,
    jQuery,
    DashboardGroupsBox,
    Config,
    EventHub,
    resources,
    AnchorItem,
    AnchorNavigationBar,
    utils,
    DashboardContentController,
    ActionMode
) => {
    "use strict";

    // shortcut for sap.ui.core.AccessibleLandmarkRole
    const AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

    return View.extend("sap.ushell.components.homepage.DashboardContent", {
        /**
         * Creating the content of the main dashboard view.
         * The view is basically a sap.m.Page control that contains:
         *  - AnchorNavigationBar as header.
         *  - DashboardGroupsBox that contains the groups and tiles as content.
         *  - Bar in the footer if edit mode is enabled.
         *
         * @param {sap.ushell.components.homepage.DashboardContent.controller} oController the dashboard content controller.
         * @returns {sap.m.Page} the dashboard page control.
         */
        createContent: function (oController) {
            this.oModel = this.getController().getOwnerComponent().getModel();

            const bEnablePersonalization = this.oModel.getProperty("/personalization");
            const bEnableTileActionsIcon = this.oModel.getProperty("/enableTileActionsIcon");

            this.isCombi = Device.system.combi;
            this.isTouch = this.isCombi ? false : (Device.system.phone || Device.system.tablet);
            this.parentComponent = Component.getOwnerComponentFor(this);
            this.addStyleClass("sapUshellDashboardView");
            this.oRenderer = sap.ushell.Container.getRendererInternal("fiori2");
            this.bIsHomeIntentRootIntent = utils.isFlpHomeIntent(this.oRenderer.getShellConfig().rootIntent);

            Core.getEventBus().subscribe("launchpad", "actionModeInactive", this._handleEditModeChange, this);
            Core.getEventBus().subscribe("launchpad", "actionModeActive", this._handleEditModeChange, this);
            Core.getEventBus().subscribe("launchpad", "contentRefresh", this._onDashboardShown, this);
            Core.getEventBus().subscribe("launchpad", "dashboardModelContentLoaded", this._onDashboardShown, this);

            /**
             * In order to save performance we delay the ActionMode init, the footer creation and the overflow of the anchorBar
             * till core-ext file has been loaded.
             */
            this.oDoable = EventHub.once("CoreResourcesComplementLoaded").do(() => {
                this.oAnchorNavigationBar.setOverflowEnabled(true);

                if (bEnablePersonalization || bEnableTileActionsIcon) {
                    ActionMode.init(this.oModel);
                }
                if (bEnablePersonalization) {
                    this._createFooter();
                    this._createActionModeButton();
                }
            });
            this.oFilterSelectedGroup = new Filter("isGroupSelected", FilterOperator.EQ, true);

            this.oRenderer.getRouter().getRoute("home").attachMatched(this._onHomeNavigation, this);

            this.oAnchorNavigationBar = this._getAnchorNavigationBar(oController);
            this.oAnchorNavigationBar.setModel(this.oModel);
            this.oRenderer.setNavigationBar(this.oAnchorNavigationBar);

            const oDashboardGroupsBoxModule = new DashboardGroupsBox();
            // Create the DashboardGroupsBox object that contains groups and tiles
            this.oDashboardGroupsBox = oDashboardGroupsBoxModule.createGroupsBox(oController, this.oModel);

            this.oPage = new Page("sapUshellDashboardPage", {
                showHeader: false,
                landmarkInfo: new PageAccessibleLandmarkInfo({
                    contentRole: AccessibleLandmarkRole.Region,
                    contentLabel: resources.i18n.getText("Dashboard.Page.Content.AriaLabel"),
                    rootRole: AccessibleLandmarkRole.None
                }),
                floatingFooter: true,
                content: [this.oDashboardGroupsBox]
            });

            this.oPage.addEventDelegate({
                onAfterRendering: function () {
                    const oDomRef = this.getDomRef();
                    const oScrollableElement = oDomRef.getElementsByTagName("section");

                    jQuery(oScrollableElement[0]).off("scrollstop", oController.handleDashboardScroll);
                    jQuery(oScrollableElement[0]).on("scrollstop", oController.handleDashboardScroll);
                }.bind(this)
            });

            return this.oPage;
        },

        getAnchorItemTemplate: function () {
            const that = this;
            const oAnchorItemTemplate = new AnchorItem({
                index: "{index}",
                title: "{title}",
                groupId: "{groupId}",
                defaultGroup: "{isDefaultGroup}",
                helpId: "{helpId}",
                selected: false,
                isGroupRendered: "{isRendered}",
                visible: {
                    parts: ["/tileActionModeActive", "isGroupVisible", "visibilityModes"],
                    formatter: function (tileActionModeActive, isGroupVisible, visibilityModes) {
                        // Empty groups should not be displayed when personalization is off or
                        // if they are locked or default group not in action mode
                        if (!visibilityModes[tileActionModeActive ? 1 : 0]) {
                            return false;
                        }
                        return isGroupVisible || tileActionModeActive;
                    }
                },
                locked: "{isGroupLocked}",
                isGroupDisabled: {
                    parts: ["isGroupLocked", "/isInDrag", "/homePageGroupDisplay"],
                    formatter: function (bIsGroupLocked, bIsInDrag, sAnchorBarMode) {
                        return bIsGroupLocked && bIsInDrag && sAnchorBarMode === "tabs";
                    }
                },
                press: function (oEvent) {
                    that.oAnchorNavigationBar.handleAnchorItemPress(oEvent);
                }
            });

            oAnchorItemTemplate.attachBrowserEvent("focus", function () {
                this.setNavigationBarItemsVisibility();
            }.bind(this.oAnchorNavigationBar));

            return oAnchorItemTemplate;
        },

        _getAnchorNavigationBar: function (oController) {
            const oAnchorNavigationBar = new AnchorNavigationBar("anchorNavigationBar", {
                selectedItemIndex: "{/topGroupInViewPortIndex}",
                itemPress: [function (oEvent) {
                    this._handleAnchorItemPress(oEvent);
                }, oController],
                overflowEnabled: false // we will enable the overflow once coreExt will be loaded!!!
            });

            this._oAnchorNavigationBarDelegatePromise = new Promise((resolve, reject) => {
                if (Device.system.desktop) {
                    sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], (ComponentKeysHandler) => {
                        ComponentKeysHandler.getInstance().then((ComponentKeysHandlerInstance) => {
                            oAnchorNavigationBar.addEventDelegate({
                                onBeforeFastNavigationFocus: function (oEvent) {
                                    if (jQuery(".sapUshellAnchorItem").is(":visible")) {
                                        oEvent.preventDefault();
                                        ComponentKeysHandlerInstance.goToSelectedAnchorNavigationItem();
                                    }
                                },
                                onsapenter: function (oEvent) {
                                    oEvent.srcControl.getDomRef().click();
                                },
                                onsapspace: function (oEvent) {
                                    oEvent.srcControl.getDomRef().click();
                                },
                                onsaptabnext: function () {
                                    // If the OverflowButton is not visible, jump to the last visited Tile
                                    if (!Core.byId("sapUshellAnchorBarOverflowButton").getVisible()) {
                                        ComponentKeysHandlerInstance.goToLastVisitedTile();
                                    }
                                }
                            });
                            resolve();
                        });
                    });
                } else {
                    resolve();
                }
            });

            oAnchorNavigationBar.addStyleClass("sapContrastPlus");

            return oAnchorNavigationBar;
        },

        _actionModeButtonPress: function () {
            this.oDashboardGroupsBox.getBinding("groups").filter([]); // replace model filter in order to show hidden groups
            const dashboardGroups = this.oDashboardGroupsBox.getGroups();
            ActionMode.toggleActionMode(this.oModel, "Menu Item", dashboardGroups);
            this._updateAnchorNavigationBarVisibility();
            if (this.oModel.getProperty("/homePageGroupDisplay") === "tabs") {
                if (this.oModel.getProperty("/tileActionModeActive")) { // To edit mode
                    // find the selected group
                    const aGroups = this.oModel.getProperty("/groups");
                    let selectedGroup;
                    for (let i = 0; i < aGroups.length; i++) {
                        if (aGroups[i].isGroupSelected) {
                            selectedGroup = i;
                            break;
                        }
                    }
                    // scroll to selected group
                    this.getController()._scrollToGroup("launchpad", "scrollToGroup", {
                        group: {
                            getGroupId: function () {
                                return aGroups[selectedGroup].groupId;
                            }
                        },
                        groupChanged: false,
                        focus: true
                    });
                } else { // To non-edit mode
                    this.getController()._deactivateActionModeInTabsState();
                }
            }
        },

        /**
         * Creates the action mode button based on the shell config.
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButton: function () {
            const oActionButtonObjectData = {
                id: "ActionModeBtn",
                text: resources.i18n.getText("activateEditMode"),
                icon: "sap-icon://edit",
                press: this._actionModeButtonPress.bind(this)
            };
            const bMoveEditButtonToShellHeader = this.oRenderer.getShellConfig().moveEditHomePageActionToShellHeader;
            if (bMoveEditButtonToShellHeader) {
                this._createActionModeButtonInHeader(oActionButtonObjectData);
            } else {
                this._createActionModeButtonInUserMenu(oActionButtonObjectData);
            }
        },

        /**
         * Creates the action mode button in the shell header.
         *
         * @param {object} oActionButtonObjectData the button property
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButtonInHeader: function (oActionButtonObjectData) {
            let sRequirePath = "sap/ushell/ui/shell/ShellHeadItem";
            if (Config.last("/core/shellBar/enabled")) {
                sRequirePath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem";
                if (oActionButtonObjectData.press) {
                    oActionButtonObjectData.click = oActionButtonObjectData.press;
                    delete oActionButtonObjectData.press; // remove press handler, since it is not used in ShellBarItem
                }
            }

            sap.ui.require([sRequirePath], (ShellHeadItem) => {
                this.oTileActionsButton = new ShellHeadItem(oActionButtonObjectData);
                if (Config.last("/core/extension/enableHelp")) {
                    this.oTileActionsButton.addStyleClass("help-id-ActionModeBtn"); // xRay help ID
                }
                if (!this.bIsHomeIntentRootIntent) {
                    this.oRenderer.showHeaderEndItem(this.oTileActionsButton.getId(), true);
                } else {
                    this.oRenderer.showHeaderEndItem(this.oTileActionsButton.getId(), false, ["home"]);
                }
            });
        },

        /**
         * Creates the action mode button in the user menu.
         *
         * @param {object} oActionButtonObjectData the button property
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButtonInUserMenu: function (oActionButtonObjectData) {
            const oAddActionButtonParameters = {
                controlType: "sap.ushell.ui.launchpad.ActionItem",
                oControlProperties: oActionButtonObjectData,
                bIsVisible: true,
                aStates: ["home"]
            };

            if (!this.bIsHomeIntentRootIntent) {
                oAddActionButtonParameters.aStates = null;
                oAddActionButtonParameters.bCurrentState = true;
            }

            this.oRenderer.addUserAction(oAddActionButtonParameters).done((oActionButton) => {
                this.oTileActionsButton = oActionButton;
                // if xRay is enabled
                if (Config.last("/core/extension/enableHelp")) {
                    this.oTileActionsButton.addStyleClass("help-id-ActionModeBtn");// xRay help ID
                }
            });
        },

        _handleEditModeChange: function () {
            if (this.oTileActionsButton) {
                this.oTileActionsButton.toggleStyleClass("sapUshellActionItemActive");
            }
        },

        _createFooter: function () {
            sap.ui.require([
                "sap/m/Bar",
                "sap/m/Button",
                "sap/m/ToolbarSpacer"
            ], (Bar, Button, ToolbarSpacer) => {
                this.oPage.setFooter(new Bar("sapUshellDashboardFooter", {
                    visible: "{/tileActionModeActive}",
                    contentRight: [
                        new ToolbarSpacer(),
                        new Button("sapUshellDashboardFooterDoneBtn", {
                            type: mobileLibrary.ButtonType.Emphasized,
                            text: resources.i18n.getText("closeEditMode"),
                            tooltip: resources.i18n.getText("exitEditMode"),
                            press: this._actionModeButtonPress.bind(this)
                        })
                    ]
                }));
            });
        },

        _onDashboardShown: function () {
            const bInDashboard = this.oRenderer && this.oRenderer.getCurrentCoreView() === "home";

            if (bInDashboard) {
                if (!Device.system.phone) {
                    this.oRenderer.showRightFloatingContainer(false);
                }

                this._updateAnchorNavigationBarVisibility();

                this.getController().resizeHandler();
                utils.refreshTiles();
                if (Device.system.desktop) {
                    const sTagName = document.activeElement ? document.activeElement.tagName : "";
                    if (sTagName !== "INPUT" && sTagName !== "TEXTAREA") {
                        // only change the focus while not renaming a tile
                        sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], (ComponentKeysHandler) => {
                            ComponentKeysHandler.getInstance().then((ComponentKeysHandlerInstance) => {
                                ComponentKeysHandlerInstance.goToLastVisitedTile();
                            });
                        });
                    }
                }
            }
        },

        _onHomeNavigation: function () {
            this._onDashboardShown();
            if (!this.bIsHomeIntentRootIntent) {
                if (this.oRenderer.getShellConfig().moveEditHomePageActionToShellHeader) {
                    this.oRenderer.showHeaderEndItem(this.oTileActionsButton.getId(), true);
                } else {
                    this.oRenderer.showActionButton(this.oTileActionsButton.getId(), true);
                }
            }

            // track navigation in ShellAnalytics
            if (EventHub.last("firstSegmentCompleteLoaded")) {
                EventHub.emit("CloseFesrRecord", Date.now());
            }
        },

        _updateAnchorNavigationBarVisibility: function () {
            const bOldVisible = this.oAnchorNavigationBar.getVisible();
            const bActionModeActive = this.getModel().getObject("/tileActionModeActive");
            const aVisibleGroups = this.getModel().getProperty("/groups").filter((oGroup) => {
                // Check for group's visibility AND - depending on the ActionMode - the visibilityMode
                // (see ushell/utils.calcVisibilityModes() for details of visibilityModes)
                if (bActionModeActive) {
                    return oGroup.isGroupVisible && oGroup.visibilityModes[1];
                }
                return oGroup.isGroupVisible && oGroup.visibilityModes[0];
            });
            const bVisible = aVisibleGroups.length > 1;

            this.oAnchorNavigationBar.setVisible(bVisible);

            if (bVisible && !bOldVisible) {
                const aGroups = this.getModel().getProperty("/groups");
                const iSelectedGroup = this.getModel().getProperty("/iSelectedGroup");

                for (let i = 0; i < aVisibleGroups.length; i++) {
                    if (aVisibleGroups[i].getGroupId && aVisibleGroups[i].getGroupId() === aGroups[iSelectedGroup].groupId) {
                        this.oAnchorNavigationBar.setSelectedItemIndex(i);
                        break;
                    }
                }
            }
        },

        getControllerName: function () {
            return "sap.ushell.components.homepage.DashboardContent";
        },

        exit: function () {
            View.prototype.exit.apply(this, arguments);

            if (this.oAnchorNavigationBar) {
                this.oAnchorNavigationBar.destroy();
            }
            if (this.oTileActionsButton) {
                this.oTileActionsButton.destroy();
            }

            if (this.oDoable) {
                this.oDoable.off();
            }

            if (this.oPage) {
                this.oPage.destroy();
            }

            Core.getEventBus().unsubscribe("launchpad", "actionModeInactive", this._handleEditModeChange, this);
            Core.getEventBus().unsubscribe("launchpad", "actionModeActive", this._handleEditModeChange, this);
            Core.getEventBus().unsubscribe("launchpad", "contentRefresh", this._onDashboardShown, this);
            Core.getEventBus().unsubscribe("launchpad", "dashboardModelContentLoaded", this._onDashboardShown, this);
        }
    });
});
