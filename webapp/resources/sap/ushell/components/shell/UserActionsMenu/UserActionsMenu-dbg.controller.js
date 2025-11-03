// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/library",
    "sap/m/StandardListItem",
    "sap/ui/core/Element",
    "sap/ui/core/ElementMetadata",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/performance/Measurement",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/AboutButton",
    "sap/ushell/ui/footerbar/ContactSupportButton",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/ui/QuickAccess",
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager"
], (
    Log,
    mobileLibrary,
    StandardListItem,
    Element,
    ElementMetadata,
    Fragment,
    Controller,
    JSONModel,
    Measurement,
    Config,
    Container,
    EventHub,
    ushellResources,
    AboutButton,
    ContactSupportButton,
    ActionItem,
    QuickAccess,
    ShellModel,
    StateManager
) => {
    "use strict";
    // shortcut for sap.m.ListType
    const ListType = mobileLibrary.ListType;

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    return Controller.extend("sap.ushell.components.shell.UserActionsMenu.UserActionsMenu", {
        _aDanglingControl: [],
        _aDoables: [],

        onInit: function () {
            const oConfig = this.getShellConfig();
            this._createActionButtons(oConfig);

            this.oModel = new JSONModel(this.getInitialModelData());

            this._aDoables.push(EventHub.on("showUserActionsMenu").do((bShow) => {
                if (this.getPopoverIsOpen() || !bShow) {
                    this._toggleUserActionsMenuPopover(false);
                } else {
                    this._toggleUserActionsMenuPopover(true);
                }
            }));
        },

        onExit: function () {
            this._destroyDanglingControls();
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDanglingControl = [];
            this._aDoables = [];

            const oPopover = Element.getElementById("sapUshellUserActionsMenuPopover");
            if (oPopover) {
                oPopover.destroy();
            }
        },

        getInitialModelData: function () {
            const oUser = Container.getUser();
            const bShowUserId = Config.last("/core/userActionsMenu/displayUserId");
            const oModelData = {
                userName: oUser.getFullName() || "",
                identifier: bShowUserId ? oUser.getId() : oUser.getEmail() || oUser.getId(),
                initials: oUser.getInitials(),
                userEmail: bShowUserId ? oUser.getEmail() : ""
            };

            return oModelData;
        },

        filterUserActions: function (sActionId) {
            if (!Element.getElementById(sActionId)) {
                Log.debug(`Could not render ActionItem because it was not created: ${sActionId}`);
                return false;
            } else if (sActionId === "logoutBtn") {
                // if the avatar shall be displayed, we are using the UI5 web component which comes with its own logout button
                // Hence, the logout button should not be rendered in the UserActionsMenu list of items
                return !this.getDisplayAvatar();
            }

            return true;
        },

        getModel: function () {
            return this.oModel;
        },

        _createActionButtons: function (oConfig) {
            const bEnableHelp = Config.last("/core/extension/enableHelp");

            const bEnableAbout = Config.last("/core/shell/enableAbout");
            if (bEnableAbout) {
                this._createAboutButton(bEnableHelp);
            }

            if (!oConfig.moveAppFinderActionToShellHeader && Config.last("/core/catalog/enabled")) {
                this._createAppFinderButton(oConfig, bEnableHelp);
            }

            // in case the user setting button should move to the shell header, it was already created by header
            // otherwise, create it as an actionItem for UserActionsMenu
            if (!oConfig.moveUserSettingsActionToShellHeader) {
                this._createSettingsButton(bEnableHelp);
            }

            // Only when the contact support button has to be shown in the UserActionsMenu
            if (!oConfig.moveContactSupportActionToShellHeader) {
                this._createSupportTicketButton(bEnableHelp);
            }

            if (oConfig.enableRecentActivity && Config.last("/core/shell/model/showRecentActivity")) {
                this._createRecentActivitiesButton();
                this._createFrequentActivitiesButton();
            }

            if (!oConfig.disableSignOut) {
                this._createLogoutButton();
            }
        },

        _createAppFinderButton: function (oConfig, bEnableHelp) {
            if (Element.getElementById("openCatalogBtn")) {
                return;
            }

            const oOpenCatalogItem = new ActionItem("openCatalogBtn", {
                text: ushellResources.i18n.getText("open_appFinderBtn"),
                icon: "sap-icon://sys-find",
                visible: !oConfig.disableAppFinder,
                actionType: "action",
                press: function () {
                    Measurement.start("FLP:AppFinderLoadingStartToEnd", "AppFinderLoadingStartToEnd", "FLP");
                    Container.getServiceAsync("Navigation").then((oNavigationService) => {
                        oNavigationService.navigate({ target: { semanticObject: "Shell", action: "appfinder" } });
                    });
                }
            });
            if (bEnableHelp) {
                oOpenCatalogItem.addStyleClass("help-id-openCatalogActionItem"); // xRay help ID
            }
            this._addDanglingControl(oOpenCatalogItem);

            StateManager.updateAllBaseStates("userActions.items", Operation.Add, oOpenCatalogItem.getId());
        },

        _createAboutButton: function (bEnableHelp) {
            const sId = "aboutBtn";
            if (!Element.getElementById(sId)) {
                const oAboutButton = new AboutButton(sId);
                if (bEnableHelp) {
                    oAboutButton.addStyleClass(`help-id-${sId}`); // xRay help ID
                }
                this._addDanglingControl(oAboutButton);
                this.getRenderer().showActionButton(sId, false);
            }
        },

        _createSettingsButton: function (bEnableHelp) {
            const sId = "userSettingsBtn";
            if (!Element.getElementById(sId)) {
                const oUserPrefButton = new ActionItem(sId, {
                    tooltip: `${ushellResources.i18n.getText("ControlKey")} + ${ushellResources.i18n.getText("CommaKey")}`,
                    text: ushellResources.i18n.getText("userSettings"),
                    icon: "sap-icon://action-settings",
                    press: function () {
                        EventHub.emit("openUserSettings", Date.now());
                    }
                });
                if (bEnableHelp) {
                    oUserPrefButton.addStyleClass("help-id-loginDetails"); // xRay help ID
                }
                this._addDanglingControl(oUserPrefButton);
            }

            // Add to userActions. The actual move happens within the state management
            StateManager.updateAllBaseStates("userActions.items", Operation.Add, sId);
        },

        _createSupportTicketButton: function (bEnableHelp) {
            // Create button on demand
            Config.on("/core/extension/SupportTicket").do((bConfigured) => {
                // 1) false and no button : do nothing
                // 2) false and the button exists: probably visible, set visibility to false
                // 3) true: create the button and set visibility to true
                const sId = "ContactSupportBtn";
                let oContactSupport = Element.getElementById(sId);
                if (bConfigured && !oContactSupport) {
                    oContactSupport = new ContactSupportButton(sId);
                    this._addDanglingControl(oContactSupport);
                    if (bEnableHelp) {
                        oContactSupport.addStyleClass("help-id-contactSupportBtn"); // xRay help ID
                    }
                }
                if (bConfigured) {
                    this.getRenderer().showActionButton(sId);
                } else {
                    this.getRenderer().hideActionButton(sId);
                }
            });
        },

        _createRecentActivitiesButton: function () {
            const sId = "recentActivitiesBtn";

            Config.on("/core/shell/model/enableTrackingActivity").do((bEnableTrackingActivity) => {
                if (bEnableTrackingActivity) {
                    let oRecentActivitiesBtn = Element.getElementById(sId);
                    if (!oRecentActivitiesBtn) {
                        oRecentActivitiesBtn = new ActionItem(sId, {
                            text: ushellResources.i18n.getText("recentActivities"),
                            icon: "sap-icon://customer-history",
                            press: function () {
                                QuickAccess.openQuickAccessDialog("recentActivityFilter", "userActionsMenuHeaderButton");
                            }
                        });
                        this._addDanglingControl(oRecentActivitiesBtn);
                    }
                    this.getRenderer().showActionButton(sId, false);
                } else {
                    this.getRenderer().hideActionButton(sId, false);
                }
            });
        },

        _createFrequentActivitiesButton: function () {
            const sId = "frequentActivitiesBtn";

            Config.on("/core/shell/model/enableTrackingActivity").do((bEnableTrackingActivity) => {
                if (bEnableTrackingActivity) {
                    let oFrequentActivitiesBtn = Element.getElementById(sId);
                    if (!oFrequentActivitiesBtn) {
                        oFrequentActivitiesBtn = new ActionItem(sId, {
                            text: ushellResources.i18n.getText("frequentActivities"),
                            icon: "sap-icon://activity-individual",
                            tooltip: ushellResources.i18n.getText("frequentActivitiesTooltip"),
                            press: function () {
                                QuickAccess.openQuickAccessDialog("frequentlyUsedFilter", "userActionsMenuHeaderButton");
                            }
                        });
                        this._addDanglingControl(oFrequentActivitiesBtn);
                    }
                    this.getRenderer().showActionButton(sId, false);
                } else {
                    this.getRenderer().hideActionButton(sId, false);
                }
            });
        },

        _createLogoutButton: function () {
            const sId = "logoutBtn";
            if (Element.getElementById(sId)) {
                return;
            }
            const oLogoutBtn = new ActionItem(sId, {
                visible: true,
                type: ButtonType.Transparent,
                icon: "sap-icon://log",
                text: ushellResources.i18n.getText("signoutBtn_title"),
                press: this.logout
            });
            this._addDanglingControl(oLogoutBtn);
            this.getRenderer().showActionButton(sId, false);
        },

        logout: function () {
            sap.ui.require(["sap/m/MessageBox", "sap/ushell/ui/launchpad/LoadingDialog"],
                (MessageBox, LoadingDialog) => {
                    let oLoading = new LoadingDialog({ text: "" });
                    let bShowLoadingScreen = true;
                    let bIsLoadingScreenShown = false;

                    Container.getGlobalDirty().done((dirtyState) => {
                        bShowLoadingScreen = false;
                        if (bIsLoadingScreenShown === true) {
                            oLoading.exit();
                            oLoading = new LoadingDialog({ text: "" });
                        }

                        const oLogoutDetails = {};
                        const oResourceBundle = ushellResources.i18n;

                        if (dirtyState === Container.DirtyState.DIRTY) {
                            // show warning only if it is sure that there are unsaved changes
                            oLogoutDetails.message = oResourceBundle.getText("unsaved_data_warning_popup_message");
                            oLogoutDetails.icon = MessageBox.Icon.WARNING;
                            oLogoutDetails.messageTitle = oResourceBundle.getText("unsaved_data_warning_popup_title");
                        } else {
                            // show 'normal' logout confirmation in all other cases, also if dirty state could not be determined
                            oLogoutDetails.message = oResourceBundle.getText("signoutConfirmationMsg");
                            oLogoutDetails.icon = MessageBox.Icon.QUESTION;
                            oLogoutDetails.messageTitle = oResourceBundle.getText("signoutMsgTitle");
                        }

                        MessageBox.show(oLogoutDetails.message, oLogoutDetails.icon,
                            oLogoutDetails.messageTitle, [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                            (oAction) => {
                                if (oAction === MessageBox.Action.OK) {
                                    oLoading.openLoadingScreen();
                                    oLoading.showAppInfo(ushellResources.i18n.getText("beforeLogoutMsg"), null);
                                    Container.defaultLogout();
                                }
                            }, ElementMetadata.uid("confirm"));
                    });
                    if (bShowLoadingScreen === true) {
                        oLoading.openLoadingScreen();
                        bIsLoadingScreenShown = true;
                    }
                }
            );
        },

        _addDanglingControl: function (oControl) {
            this._aDanglingControl.push(oControl);
        },

        _destroyDanglingControls: function () {
            if (this._aDanglingControl) {
                this._aDanglingControl.forEach((oControl) => {
                    if (oControl.destroyContent) {
                        oControl.destroyContent();
                    }
                    oControl.destroy();
                });
            }
        },

        /**
         * Method to open or close the UserActionsMenu popover
         *
         * @param {boolean} bShow flag to open or close UserActionsMenu popover
         * @private
         */
        _toggleUserActionsMenuPopover: async function (bShow) {
            let sFragmentName;
            const pUserMenuItemLoaded = new Promise((resolve) => {
                if (this.getDisplayAvatar()) {
                    sFragmentName = "sap.ushell.components.shell.UserActionsMenu.UserActionsMenu";

                    sap.ui.require(["sap/ushell/gen/ui5/webcomponents-fiori/dist/UserMenuItem"], () => {
                        resolve();
                    });
                } else {
                    sFragmentName = "sap.ushell.components.shell.UserActionsMenu.UserActionsMenuPopover";
                    resolve();
                }
            });

            if (!this.oPopover) {
                await Promise.all([pUserMenuItemLoaded, Fragment.load({
                    name: sFragmentName,
                    type: "XML",
                    controller: this
                })]).then((aResults) => {
                    this.oPopover = aResults[1];
                    this.oPopover.setModel(this.getModel());
                    this.oPopover.setModel(ShellModel.getConfigModel(), "configModel");
                    this.oPopover.setModel(ShellModel.getModel(), "shellModel");
                    if (this.getDisplayAvatar()) {
                        this.oPopover.placeAt("WebComponents-shellArea", "last");
                        this.oPopover.attachClose(() => {
                            this.popoverClose();
                        });
                    }
                    return this._toggleUserActionsMenuPopover(bShow);
                });
            } else if (bShow) {
                // force refresh when reopen because the visibility of actions may change
                StateManager.refreshState("userActions.items");
                this.popoverOpen();
            } else {
                this.popoverClose();

                if (window.document.activeElement && window.document.activeElement.id !== "userActionsMenuHeaderButton") {
                    window.document.getElementById("userActionsMenuHeaderButton")?.focus();
                }
            }
        },

        onItemPress: function (oEvent) {
            const sActionItemId = oEvent.getParameter("item").data("actionItemId");
            const oActionItem = Element.getElementById(sActionItemId);
            if (oActionItem) {
                oActionItem.firePress();
                EventHub.emit("showUserActionsMenu", false);
            }
        },

        /**
         * Factory to return UserMenuItems for the web component
         *
         * @param {string} sId ID of the control
         * @param {sap.ui.model.Context} oContext Binding context
         * @returns {sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem} User Menu Item
         */
        userActionsMenuItemFactory: function (sId, oContext) {
            const oActionItem = Element.getElementById(oContext.getObject());

            // This module was already asynchronously loaded when the fragment was loaded. This factory is referenced in the fragment,
            // hence we can synchronously access the user menu item.
            const UserMenuItem = sap.ui.require("sap/ushell/gen/ui5/webcomponents-fiori/dist/UserMenuItem");
            return new UserMenuItem({
                id: `${sId}-${oActionItem.getId()}`,
                icon: oActionItem.getIcon(),
                text: oActionItem.getText(),
                tooltip: oActionItem.getTooltip(),
                visible: oActionItem.getVisible(),
                customData: [{ // used for opa test
                    key: "actionItemId",
                    value: oActionItem.getId()
                }]
            });
        },

        /**
         * Factory to return StandardListItems for the UserMenu
         *
         * @param {string} sId ID of the control
         * @param {sap.ui.model.Context} oContext Binding context
         * @returns {sap.m.StandardListItem} User Menu Item
         */
        userActionsMenuPopoverItemFactory: function (sId, oContext) {
            const oActionItem = Element.getElementById(oContext.getObject());

            return new StandardListItem({
                id: `${sId}-${oActionItem.getId()}`,
                icon: oActionItem.getIcon(),
                tooltip: oActionItem.getTooltip(),
                iconInset: true,
                title: oActionItem.getText(),
                visible: oActionItem.getVisible(),
                type: ListType.Active,
                customData: [{ // used for opa test
                    key: "actionItemId",
                    value: oActionItem.getId()
                }],
                press: function () {
                    if (oActionItem) {
                        oActionItem.firePress();
                        EventHub.emit("showUserActionsMenu", false);
                    }
                }
            }).addStyleClass("sapUshellUserActionsMenuActionItem");
        },

        getRenderer: function () {
            if (!this._oRenderer) {
                this._oRenderer = Container.getRendererInternal("fiori2");
            }
            return this._oRenderer;
        },

        getShellConfig: function () {
            return this.getRenderer().getShellConfig();
        },

        /**
         * Returns the displayAvatar configuration
         *
         * @returns {boolean} true if the avatar is displayed, false otherwise
         */
        getDisplayAvatar: function () {
            return !!Config.last("/core/userActionsMenu/displayAvatar");
        },

        /**
         * Two different ways to open the popover are supported:
         * 1. When the avatar is displayed, the popover is opened via the web component
         * 2. When the avatar is not displayed, the popover is opened via the sap.m.Popover
         * Both have a different API to determine the open-state.
         *
         * @returns {boolean} true if the popover is open, false otherwise
         */
        getPopoverIsOpen: function () {
            if (this.getDisplayAvatar()) {
                return this.bPopoverOpen || this.oPopover?.getOpen();
            }
            return this.oPopover?.isOpen();
        },

        /**
         * Opens the UserActionsMenu popover
         *
         * @returns {sap.m.Popover|sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem} Returns the popover or the web component for chaining
         */
        popoverOpen: function () {
            if (this.getDisplayAvatar()) {
                // keep track of open state internally. This is to allow to close the popover when clicking on the
                // avatar in the shell header while the menu is opened.
                this.bPopoverOpen = true;
                return this.oPopover.setOpen(true);
            }
            return this.oPopover.openBy(Element.getElementById("userActionsMenuHeaderButton"));
        },

        /**
         * Closes the UserActionsMenu popover
         *
         * @returns {sap.m.Popover|sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem} Returns the popover or the web component for chaining
         */
        popoverClose: function () {
            if (this.getDisplayAvatar()) {
                window.setTimeout(() => {
                    // keep track of open state internally. This is to allow to close the popover when clicking on the
                    // avatar in the shell header while the menu is opened. Setting the value to false in a timeout is required
                    // to get after the current stack. If it was done synchronosouly, the popover would be opened again, as the
                    // blur handling of the web component had closed it before.
                    this.bPopoverOpen = false;
                }, 400);

                return this.oPopover.setOpen(false);
            }
            return this.oPopover.close();
        }
    });
});
