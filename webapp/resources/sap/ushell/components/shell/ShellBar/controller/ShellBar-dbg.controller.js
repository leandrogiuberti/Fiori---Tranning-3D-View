// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/Device",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/api/NewExperience",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarSpacer",
    "sap/ushell/gen/ui5/webcomponents/dist/Button",
    "sap/ushell/state/BindingHelper",
    "sap/ushell/state/modules/BackNavigation",
    "sap/ushell/state/ShellModel",
    "sap/ushell/ui/shell/ShellAppTitle",
    "sap/ushell/utils"
], (
    Device,
    Element,
    EventBus,
    Controller,
    JSONModel,
    hasher,
    Config,
    Container,
    EventHub,
    NewExperience,
    ShellBarItem,
    ShellBarSpacer,
    _Button, // Needed to be able to synchronously load the webcomponent inside the ushell/renderer/Renderer and PostLoadingHeaderEnhancment/Component
    BindingHelper,
    BackNavigation,
    ShellModel,
    ShellAppTitle,
    ushellUtils
) => {
    "use strict";

    const _aReservedHeadEndItems = [
        "NOTIFICATIONSCOUNTBUTTON",
        "PRODUCTSWITCHBTN",
        "USERACTIONSMENUHEADERBUTTON",
        "SF"
    ];

    /**
     * @alias sap.ushell.components.shell.ShellBar.controller.ShellBar
     * @class
     * @classdesc Controller of the ShellBar view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameter
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @since 1.135.0
     * @private
     */
    return Controller.extend("sap.ushell.components.shell.ShellBar.controller.ShellBar", /** @lends sap.ushell.components.shell.ShellBar.controller.ShellBar.prototype */ {
        _aDoables: [],

        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * It gets all the required UShell services and
         * initializes the view.
         *
         * @private
         * @since 1.135.0
         */
        onInit: function () {
            BindingHelper.overrideUpdateAggregation(this.byId("shellBar"));

            this._aDoables.push(Config.on("/core/shellHeader/homeUri").do(this._updateHomeUri.bind(this)));
            this._updateHomeUri(Config.last("/core/shellHeader/homeUri"));

            this.getView().setModel(this.getConfigurationModel(), "config");
            this.getView().setModel(ShellModel.getConfigModel(), "shellConfig");

            this.prepareShellAppTitle();
            this._aDoables.push(EventHub.on("navigateBack").do(this.pressNavBackButton.bind(this)));
            this._aDoables.push(EventHub.on("navigateFromShellApplicationNavigationMenu").do(this.navigateFromShellApplicationNavigationMenu.bind(this)));
            Device.resize.attachHandler(this.handleResize.bind(this));
        },

        handleResize: function (oEvent) {
            if (this._iDebounceTimerHandleResize) {
                clearTimeout(this._iDebounceTimerHandleResize);
            }
            this._iDebounceTimerHandleResize = setTimeout(() => {
                const oShellBar = this.byId("shellBar");
                oShellBar.getBinding("content").refresh(true);
            }, 400);
        },

        getConfigurationModel: function () {
            const oModel = new JSONModel({
                windowTitleExtension: Config.last("/core/shell/windowTitleExtension") || ""
            });
            return oModel;
        },

        onContentItemVisibilityChange: function (oEvent) {
            if (this._iDebounceTimerContentItemVisibilityChange) {
                clearTimeout(this._iDebounceTimerContentItemVisibilityChange);
            }
            this._iDebounceTimerContentItemVisibilityChange = setTimeout(() => {
                const aHiddenElements = oEvent.getParameter("items");
                const sNewExperienceControlId = NewExperience.getShellHeaderControl()?.getId();
                const oHiddenElements = aHiddenElements.reduce((oAcc, oCurrentItem) => {
                    const sId = oCurrentItem.getId();
                    if (["shellAppTitle", sNewExperienceControlId].includes(sId)) {
                        oAcc[sId] = oCurrentItem;
                    }
                    return oAcc;
                }, {});

                if (oHiddenElements.shellAppTitle) {
                    oHiddenElements.shellAppTitle.setShowAppTitle(false);
                }

                const oShellBarAppTitle = Element.getElementById(this.getOwnerComponent().getAppTitle());
                const oNewExperienceControl = oHiddenElements[sNewExperienceControlId];
                if (oNewExperienceControl) {
                    oShellBarAppTitle.setNewExperienceControl(oNewExperienceControl);
                } else if (NewExperience.getShellHeaderControl()?.getParent() === this.byId("shellBar")) {
                    oShellBarAppTitle.setNewExperienceControl(null);
                }
            }, 400);
        },

        onSearchButtonClick: function (oEvent) {
            // Ensure that the event is also fired again if the search was not yet loaded, so we listen to the event once.
            EventBus.getInstance().subscribeOnce("shell", "searchCompLoaded", () => {
                this.getOwnerComponent().fireSearchButtonPress(oEvent);
            });
            // Used in the old CEP Search to open the search field
            this.getOwnerComponent().fireSearchButtonPress(oEvent);
            // Used in the new CEP Search to trigger the search event in case the WC is inside the overflow on small screens
            Element.getElementById("newCEPShellBarSearch")?.fireSearch();
        },

        _delegateHeadEndItemClick: function (sItemId) {
            // delegate the click to the actual button, with this it can also be replaced with a custom control
            const aHeadEndItems = ShellModel.getModel().getProperty("/header/headEndItems");
            const sItemIdUpperCase = sItemId.toUpperCase();

            const sButtonId = aHeadEndItems.find((sItem) => sItem.toUpperCase() === sItemIdUpperCase);
            if (!sButtonId) {
                return;
            }

            const oButton = Element.getElementById(sButtonId);
            if (!oButton) {
                return;
            }

            if (typeof oButton.firePress === "function") {
                oButton.firePress();
            } else if (typeof oButton.fireClick === "function") {
                oButton.fireClick();
            }
        },

        onProfileClick: function () {
            // delegate the click to the actual button, with this it can also be replaced with a custom control
            return this._delegateHeadEndItemClick("USERACTIONSMENUHEADERBUTTON");
        },

        isHeadEndItem: function (sItemId) {
            const sItemIdUpperCase = sItemId.toUpperCase();
            if (_aReservedHeadEndItems.includes(sItemIdUpperCase)) {
                return false;
            }
            const oControl = Element.getElementById(sItemId);
            return oControl instanceof ShellBarItem;
        },

        isContentItem: function (sItemId) {
            const sItemIdUpperCase = sItemId.toUpperCase();
            if (_aReservedHeadEndItems.includes(sItemIdUpperCase)) {
                return false;
            }
            const oControl = Element.getElementById(sItemId);
            return !(oControl instanceof ShellBarItem);
        },

        isProfileMenu: function (sItemIdUpperCase) {
            return sItemIdUpperCase === "USERACTIONSMENUHEADERBUTTON";
        },

        hasNotifications: function (aHeadEndItems) {
            const bHasNotifications = aHeadEndItems.some((sItemId) => sItemId.toUpperCase() === "NOTIFICATIONSCOUNTBUTTON");
            if (bHasNotifications) {
                const oNotificationBtnModel = Element.getElementById("NotificationsCountButton").getModel("configModel");
                this.getView().setModel(oNotificationBtnModel, "configModel");
            }
            return bHasNotifications;
        },

        onNotificationsClick: function () {
            // delegate the click to the actual button, with this it can also be replaced with a custom control
            return this._delegateHeadEndItemClick("NOTIFICATIONSCOUNTBUTTON");
        },

        hasProducts: function (aHeadEndItems) {
            return aHeadEndItems.some((sItemId) => sItemId.toUpperCase() === "PRODUCTSWITCHBTN");
        },

        onProductSwitchClick: function () {
            // delegate the click to the actual button, with this it can also be replaced with a custom control
            return this._delegateHeadEndItemClick("PRODUCTSWITCHBTN");
        },

        prepareShellAppTitle: function () {
            const oShellBarSpacer = new ShellBarSpacer({
                id: "shellBarSpacer"
            });

            const oShellAppTitle = new ShellAppTitle({
                id: "shellAppTitle",
                text: "{shellModel>/application/title}",
                title: "{shellModel>/application/title}",
                icon: "{shellModel>/application/icon}",
                subTitle: "{shellModel>/application/subTitle}"
            });
            // set the ShellAppTitle to be the last thing to be hidden when screen gets small
            oShellAppTitle.data("hide-order", "9999", true);
            this.getOwnerComponent().setAppTitle(oShellAppTitle);
            Container.getRendererInternal("fiori2").addHeaderEndItem({ id: oShellAppTitle.getId() }, true, false);
            Container.getRendererInternal("fiori2").addHeaderEndItem({ id: oShellBarSpacer.getId() }, true, false);
        },

        _updateHomeUri: function (sHomeUri) {
            const oModel = this.getOwnerComponent().getModel();
            oModel.setProperty("/logo/homeUri", sHomeUri);
            oModel.setProperty("/logo/isRootIntent", ushellUtils.isRootIntent(sHomeUri));
        },

        pressNavBackButton: async function () {
            // set meAria as closed when navigating back
            EventHub.emit("showUserActionsMenu", false);
            BackNavigation.navigateBack();
        },

        navigateFromShellApplicationNavigationMenu: function (sIntent) {
            // if the target was not change, do nothing
            if (hasher.getHash() !== sIntent.substr(1)) {
                // we must make sure the view-port is centered before triggering navigation from shell-app-nav-menu
                EventHub.emit("centerViewPort", Date.now());

                // trigger the navigation
                hasher.setHash(sIntent);
            }

            // close the popover which holds the navigation menu
            const oShellAppTitle = Element.getElementById("shellAppTitle");
            if (oShellAppTitle) {
                oShellAppTitle.close();
            }
        },

        onSearchFieldToggle: function () {
            const oShellBarSearch = Element.getElementById("newCEPShellBarSearch");
            if (oShellBarSearch) {
                const bSearchExpanded = this.getOwnerComponent().getModel().getProperty("/searchField/show");
                if (!bSearchExpanded && oShellBarSearch.getValue()) {
                    oShellBarSearch.setValue("");
                }
            }
        },

        /**
         * UI5 lifecycle method which is called upon controller destruction.
         * It detaches the router events and config listeners.
         *
         * @private
         * @since 1.135.0
         */
        onExit: function () {
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDoables = [];
        }
    });
});
