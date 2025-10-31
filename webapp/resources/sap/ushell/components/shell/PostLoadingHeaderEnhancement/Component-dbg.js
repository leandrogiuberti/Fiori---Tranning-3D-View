// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/Device",
    "sap/ui/core/Component",
    "sap/ui/core/CustomData",
    "sap/ui/core/Element",
    "sap/ui/core/IconPool",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager",
    "sap/ushell/Container",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], (
    Localization,
    Device,
    Component,
    CustomData,
    Element,
    IconPool,
    Config,
    EventHub,
    ushellLibrary,
    resources,
    ShellHeadItem,
    ShellModel,
    StateManager,
    Container,
    ushellUtils,
    UrlParsing
) => {
    "use strict";

    // shortcut for sap.ushell.AppTitleState
    const AppTitleState = ushellLibrary.AppTitleState;

    // shortcut for sap.ushell.FloatingNumberType
    const FloatingNumberType = ushellLibrary.FloatingNumberType;

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;
    const {
        Default,
        Standalone,
        Embedded,
        Lean,
        Merged
    } = ShellMode;

    let aCreatedControlIds = [];

    return Component.extend("sap.ushell.components.shell.PostLoadingHeaderEnhancement.Component", {
        metadata: {
            library: "sap.ushell"
        },
        init: function () {
            this._aInitPromises = [];
            const oShellConfig = Container.getRendererInternal("fiori2").getShellConfig();

            this._aInitPromises.push(this._createBackButton().then((sBtnId) => {
                aCreatedControlIds.push(sBtnId);
            }));
            aCreatedControlIds.push(this._createOverflowButton());

            if (oShellConfig.moveAppFinderActionToShellHeader && Config.last("/core/catalog/enabled") && !oShellConfig.disableAppFinder) {
                this._aInitPromises.push(this._createAppFinderButton().then((sBtnId) => {
                    aCreatedControlIds.push(sBtnId);
                }));
            }

            if (oShellConfig.moveContactSupportActionToShellHeader) {
                this._aInitPromises.push(this._createSupportButton().then((sBtnId) => {
                    aCreatedControlIds.push(sBtnId);
                }));
            }

            this._createShellNavigationMenu();

            const oShellHeader = Element.getElementById("shell-header");
            oShellHeader.updateAggregation("headItems");
            oShellHeader.updateAggregation("headEndItems");

            this._pInitPromise = Promise.all(this._aInitPromises);
        },

        _createBackButton: async function () {
            const sBackButtonIcon = Localization.getRTL() ? "feeder-arrow" : "nav-back";
            const sCurrentShellMode = StateManager.getShellMode();
            let oBackButton;
            if (Config.last("/core/shellBar/enabled")) {
                const [Button] = await ushellUtils.requireAsync(["sap/ushell/gen/ui5/webcomponents/dist/Button"]);
                oBackButton = new Button({
                    id: "backBtn",
                    tooltip: resources.i18n.getText("backBtn_tooltip"),
                    accessibleDescription: resources.i18n.getText("backBtn_tooltip"),
                    icon: IconPool.getIconURI(sBackButtonIcon),
                    click: function () {
                        EventHub.emit("navigateBack", Date.now());
                    }
                });
            } else {
                oBackButton = new ShellHeadItem({
                    id: "backBtn",
                    tooltip: resources.i18n.getText("backBtn_tooltip"),
                    ariaLabel: resources.i18n.getText("backBtn_tooltip"),
                    icon: IconPool.getIconURI(sBackButtonIcon),
                    press: function () {
                        EventHub.emit("navigateBack", Date.now());
                    }
                });
            }

            if ([Default, Standalone, Embedded, Merged].includes(sCurrentShellMode)) {
                StateManager.updateBaseStates([LaunchpadState.App], "header.headItems", Operation.Add, oBackButton.getId());
            } else if (sCurrentShellMode === Lean) {
                // only show btn after a navigation happened
                this._boundSetBackButtonVisibilityAfterHashChanged = this._setBackButtonVisibilityAfterHashChanged.bind(this);
                window.addEventListener("hashchange", this._boundSetBackButtonVisibilityAfterHashChanged);
            }
            /*
             * minimal:
             * only show btn in case a custom back navigation was registered
             * handled in Shell.controller@_onBackNavigationChanged
             */

            return oBackButton.getId();
        },

        _setBackButtonVisibilityAfterHashChanged: function (oHashChangeEvent) {
            const { oldURL, newURL } = oHashChangeEvent;
            const sOldHash = UrlParsing.getHash(oldURL);
            const sNewHash = UrlParsing.getHash(newURL);
            const sOldInnerAppRoute = UrlParsing.parseShellHash(sOldHash).appSpecificRoute;
            const sNewInnerAppRoute = UrlParsing.parseShellHash(sNewHash).appSpecificRoute;

            const bInnerAppNavigationOccurred = sOldInnerAppRoute !== sNewInnerAppRoute;

            if (bInnerAppNavigationOccurred) {
                StateManager.updateBaseStates([LaunchpadState.App], "header.headItems", Operation.Add, "backBtn");

                window.removeEventListener("hashchange", this._boundSetBackButtonVisibilityAfterHashChanged);
                delete this._boundSetBackButtonVisibilityAfterHashChanged;
            }
        },

        _createOverflowButton: function () {
            if (Config.last("/core/shellBar/enabled")) {
                // overflow is handled by the ShellBar component
                return;
            }

            const oEndItemsOverflowBtn = new ShellHeadItem({
                id: "endItemsOverflowBtn",
                tooltip: {
                    path: "configModel>/notificationsCount",
                    formatter: function (notificationsCount) {
                        return this.tooltipFormatter(notificationsCount);
                    }
                },
                ariaLabel: resources.i18n.getText("shellHeaderOverflowBtn_tooltip"),
                ariaHaspopup: "dialog",
                icon: "sap-icon://overflow",
                floatingNumber: "{configModel>/notificationsCount}",
                floatingNumberMaxValue: Device.system.phone ? 99 : 999, // according to the UX specification
                floatingNumberType: FloatingNumberType.OverflowButton,
                press: function (oEvent) {
                    EventHub.emit("showEndItemOverflow", oEvent.getSource().getId(), true);
                }
            });
            oEndItemsOverflowBtn.setModel(ShellModel.getConfigModel(), "configModel");
            return oEndItemsOverflowBtn.getId();
        },

        _createHeaderItem: async function (oSettings) {
            if (Config.last("/core/shellBar/enabled")) {
                const [ShellBarItem] = await ushellUtils.requireAsync(["sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem"]);
                // Create a ShellBarItem for the shell header
                oSettings.click = oSettings.press; // web components use click instead of press
                delete oSettings.press; // remove press to avoid confusion

                oSettings.accessibilityAttributes = oSettings.accessibilityAttributes || {};
                oSettings.accessibilityAttributes.hasPopup = oSettings.accessibilityAttributes.hasPopup ?? oSettings.ariaHaspopup;
                delete oSettings.ariaHaspopup; // web components do not support ariaHaspopup
                delete oSettings.ariaLabel; // web components do not support ariaLabel

                return new ShellBarItem(oSettings);
            }
            return new ShellHeadItem(oSettings);
        },

        _createAppFinderButton: async function () {
            const oOpenCatalogButton = await this._createHeaderItem({
                id: "openCatalogBtn",
                text: resources.i18n.getText("open_appFinderBtn"),
                ariaLabel: resources.i18n.getText("open_appFinderBtn"),
                tooltip: resources.i18n.getText("open_appFinderBtn"),
                icon: "sap-icon://sys-find",
                press: function () {
                    Container.getServiceAsync("Navigation").then((oNavService) => {
                        oNavService.navigate({
                            target: {
                                semanticObject: "Shell",
                                action: "appfinder"
                            }
                        });
                    });
                }
            });
            if (Config.last("/core/extension/enableHelp")) {
                oOpenCatalogButton.addStyleClass("help-id-openCatalogActionItem"); // xRay help ID
            }

            // Add to userActions. The actual move happens within the state management
            StateManager.updateAllBaseStates("userActions.items", Operation.Add, oOpenCatalogButton.getId());
            return oOpenCatalogButton.getId();
        },

        _createSupportButton: function () {
            return new Promise((fnResolve) => {
                sap.ui.require(["sap/ushell/ui/footerbar/ContactSupportButton"], async (ContactSupportButton) => {
                    const sButtonName = "ContactSupportBtn";
                    let oSupportButton = Element.getElementById(sButtonName);
                    if (!oSupportButton) {
                        // Create an ActionItem from UserActionsMenu (ContactSupportButton)
                        // in order to to take its text and icon
                        // and fire the press method when the shell header item is pressed,
                        // but don't render this control
                        const oTempButton = new ContactSupportButton("tempContactSupportBtn", {
                            visible: true
                        });

                        const sIcon = oTempButton.getIcon();
                        const sText = oTempButton.getText();
                        oSupportButton = await this._createHeaderItem({
                            id: sButtonName,
                            icon: sIcon,
                            tooltip: sText,
                            text: sText,
                            ariaHaspopup: "dialog",
                            press: function () {
                                oTempButton.firePress();
                            }
                        });
                    }

                    // Add to userActions. The actual move happens within the state management
                    StateManager.updateAllBaseStates("userActions.items", Operation.Add, sButtonName);
                    fnResolve(sButtonName);
                });
            });
        },

        _createShellNavigationMenu: function () {
            return new Promise(function (resolve) {
                sap.ui.require([
                    "sap/m/StandardListItem",
                    "sap/ushell/ui/shell/NavigationMiniTile",
                    "sap/ushell/ui/shell/ShellNavigationMenu"
                ], (StandardListItem, NavigationMiniTile, ShellNavigationMenu) => {
                    const sMenuId = "shellNavigationMenu";

                    function oHierarchyTemplateFunction (sId, oContext) {
                        const sIcon = oContext.getProperty("icon") || "sap-icon://circle-task-2";
                        const sTitle = oContext.getProperty("title");
                        const sSubtitle = oContext.getProperty("subtitle");
                        const sIntent = oContext.getProperty("intent");

                        const oListItem = (new StandardListItem({
                            type: "Active", // Use string literal to avoid dependency from sap.m.library
                            title: sTitle,
                            description: sSubtitle,
                            icon: sIcon,
                            wrapping: true,
                            customData: [new CustomData({
                                key: "intent",
                                value: sIntent
                            })],
                            press: function () {
                                if (sIntent && sIntent[0] === "#") {
                                    EventHub.emit("navigateFromShellApplicationNavigationMenu", sIntent, true);
                                }
                            }
                        })).addStyleClass("sapUshellNavigationMenuListItems");

                        return oListItem;
                    }

                    function oRelatedAppsTemplateFunction (sId, oContext) {
                        // default icon behavior
                        const sIcon = oContext.getProperty("icon");
                        const sTitle = oContext.getProperty("title");
                        const sSubtitle = oContext.getProperty("subtitle");
                        const sIntent = oContext.getProperty("intent");
                        return new NavigationMiniTile({
                            title: sTitle,
                            subtitle: sSubtitle,
                            icon: sIcon,
                            intent: sIntent,
                            press: function () {
                                const sTileIntent = this.getIntent();
                                if (sTileIntent && sTileIntent[0] === "#") {
                                    EventHub.emit("navigateFromShellApplicationNavigationMenu", sTileIntent, true);
                                }
                            }
                        });
                    }

                    const oShellNavigationMenu = new ShellNavigationMenu(sMenuId, {
                        showRelatedApps: StateManager.getShellMode() !== Lean,
                        items: {
                            path: "shellModel>/application/hierarchy",
                            factory: oHierarchyTemplateFunction.bind(this)
                        },
                        miniTiles: {
                            path: "shellModel>/application/relatedApps",
                            factory: oRelatedAppsTemplateFunction.bind(this)
                        },
                        visible: {
                            path: "configModel>/shellAppTitleState",
                            formatter: function (sCurrentState) {
                                return sCurrentState === AppTitleState.ShellNavMenu;
                            }
                        }
                    });

                    oShellNavigationMenu.setModel(ShellModel.getModel(), "shellModel");
                    oShellNavigationMenu.setModel(ShellModel.getConfigModel(), "configModel");

                    const oShellAppTitle = Element.getElementById("shellAppTitle");
                    if (oShellAppTitle) {
                        oShellAppTitle.setNavigationMenu(oShellNavigationMenu);
                    }
                    aCreatedControlIds.push(sMenuId);

                    resolve(oShellNavigationMenu);
                });
            });
        },

        exit: function () {
            aCreatedControlIds.forEach((sControl) => {
                const oControl = Element.getElementById(sControl);
                if (oControl) {
                    oControl.destroy();
                }
            });
            aCreatedControlIds = [];

            if (this._boundSetBackButtonVisibilityAfterHashChanged) {
                window.removeEventListener("hashchange", this._boundSetBackButtonVisibilityAfterHashChanged);
            }
        }
    });
});
