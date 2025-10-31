// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/EventBus",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/shell/SideNavigation/interface/ListProviderAPI",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/utils"
], (
    Log,
    EventBus,
    Controller,
    ListProviderAPI,
    Config,
    Container,
    EventHub,
    ushellUtils
) => {
    "use strict";

    /**
     * The default key value when no key is selected.
     */
    const sNoneSelectedKey = "NONE";

    /**
     * @alias sap.ushell.components.shell.SideNavigation.controller.SideNavigation
     * @class
     * @classdesc Controller of the SideNavigation view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameter
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @since 1.132.0
     * @private
     */
    return Controller.extend("sap.ushell.components.shell.SideNavigation.controller.SideNavigation", /** @lends sap.ushell.components.shell.SideNavigation.controller.SideNavigation.prototype */ {
        _aDoables: [],

        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * It gets all the required UShell services and
         * initializes the view.
         *
         * @private
         * @since 1.132.0
         */
        onInit: function () {
            const oUpdateNavigationListOnConfigChange = Config.on("/core/sideNavigation/navigationListProvider").do((oConfig) => {
                this.pNavigationListProvider = this._initNavigationListProvider("/core/sideNavigation/navigationListProvider");
                this.selectIndexAfterRouteChange();
            });
            const oUpdateFixedNavigationListOnConfigChange = Config.on("/core/sideNavigation/fixedNavigationListProvider").do((oConfig) => {
                this._initNavigationListProvider("/core/sideNavigation/fixedNavigationListProvider", "fixedItem");
            });

            this._aDoables.push(oUpdateNavigationListOnConfigChange);
            this._aDoables.push(oUpdateFixedNavigationListOnConfigChange);

            this.oContainerRouter = Container.getRendererInternal().getRouter();

            this.oContainerRouter.getRoute("home").attachMatched(this.selectIndexAfterRouteChange, this);
            this.oContainerRouter.getRoute("openFLPPage").attachMatched(this.selectIndexAfterRouteChange, this);
            this.oContainerRouter.getRoute("openWorkPage").attachMatched(this.selectIndexAfterRouteChange, this);

            this.oEnableMenuBarNavigationListener = EventHub.on("enableMenuBarNavigation").do((bEnableSideNavigation) => this.onEnableSideNavigation(bEnableSideNavigation));
            EventBus.getInstance().subscribe("sap.ushell", "appOpened", this.selectIndexAfterRouteChange, this);
        },

        /**
         * Initializes the NavigationListProvider.
         *
         * It initializes the navigation list provider and passes an API closure to access the side navigation API.
         *
         * @param {string} sConfigPath The configuration path.
         * @param {string} sAggregationName The name of the aggregation.
         * @returns {Promise<sap.ushell.modules.NavigationMenu.ListProvider>} A promise that resolves with the NavigationListProvider when it is initialized.
         * @private
         * @since 1.134.0
         */
        _initNavigationListProvider: async function (sConfigPath, sAggregationName) {
            const oSideNavigation = this.byId("sideNavigation");
            const oNavContainer = this.byId("navContainer");
            const sModulePath = Config.last(`${sConfigPath}/modulePath`);
            const oComponent = this.getOwnerComponent();
            if (sModulePath) {
                let oProviderConfig;
                try {
                    oProviderConfig = JSON.parse(Config.last(`${sConfigPath}/configuration`));
                } catch (oError) {
                    oProviderConfig = {};
                }

                const oListProviderAPI = new ListProviderAPI(
                    oProviderConfig,
                    oNavContainer,
                    oSideNavigation,
                    oComponent,
                    this
                );

                const [NavigationListProvider] = await ushellUtils.requireAsync([sModulePath]);

                const oNavigationListProvider = new NavigationListProvider(oListProviderAPI);
                const oNavigationListItems = await oNavigationListProvider.getRootItem();
                if (sAggregationName === "fixedItem") {
                    oSideNavigation.setFixedItem(oNavigationListItems);
                } else {
                    oSideNavigation.setItem(oNavigationListItems);
                }
                return oNavigationListProvider;
            }
        },

        /**
        * Enables or disables the side navigation based on the provided flag.
        * It sets the "enableSideNavigation" property in the view configuration model to the provided value.
        *
        * @param {boolean} bEnableSideNavigation A flag indicating whether to enable or disable the side navigation.
        *
        * @private
        * @since 1.132.0
        */
        onEnableSideNavigation: function (bEnableSideNavigation) {
            this.getView().getModel("viewConfiguration").setProperty("/enableSideNavigation", bEnableSideNavigation);
        },

        /**
        * Selects the appropriate side navigation entry after a route change
        * based on the current hash and default space.
        *
        * - Updates the "selectedKey" property of the view configuration model,
        * which is responsible for the visual indication of the currently selected
        * side navigation entry.
        *
        * @returns {Promise} A promise that resolves when the selection is completed.
        *
        * @private
        * @since 1.132.0
        */
        selectIndexAfterRouteChange: async function () {
            const oViewConfigModel = this.getOwnerComponent().getModel("viewConfiguration");
            const oNavigationListProvider = await this.pNavigationListProvider;
            const sSelectedKey = await oNavigationListProvider.findSelectedKey();
            setTimeout(() => {
                if (sSelectedKey) {
                    oViewConfigModel.setProperty("/selectedKey", sSelectedKey);
                } else {
                    // no entry found for selection. Remove selection to avoid visual indication
                    oViewConfigModel.setProperty("/selectedKey", sNoneSelectedKey);
                    this.byId("sideNavigation").setSelectedItem(null);
                }
            }, 0);
        },

        /**
         * UI5 lifecycle method which is called upon controller destruction.
         * It detaches the router events, and config listeners, and EventHub listeners, and EventBus subscriptions.
         *
         * @private
         * @since 1.132.0
         */
        onExit: function () {
            this.oEnableMenuBarNavigationListener.off();
            EventBus.getInstance().unsubscribe("sap.ushell", "appOpened", this.selectIndexAfterRouteChange, this);
            this._aDoables.forEach((oConfigListener) => {
                oConfigListener.off();
            });
            this._aDoables = [];

            // clean up the router matched event listeners
            const oRouter = Container.getRendererInternal().getRouter();

            // the router is not available in the test environment in some cases ...
            if (!oRouter) {
                return;
            }

            function detachMatched (sRouteName) {
                // ... or the route is not available in the test environment in some cases
                const oRoute = oRouter.getRoute(sRouteName);
                if (oRoute) {
                    oRoute.detachMatched(this.selectIndexAfterRouteChange, this);
                }
            }
            try {
                detachMatched.call(this, "home");
                detachMatched.call(this, "openFLPPage");
                detachMatched.call(this, "openWorkPage");
            } catch (oError) {
                Log.error("Error detaching route matched event listeners", oError);
            }
        }
    });
});
