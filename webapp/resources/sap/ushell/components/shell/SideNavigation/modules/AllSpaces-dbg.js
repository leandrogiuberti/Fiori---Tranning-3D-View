// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/ui/core/CustomData",
    "sap/ui/core/Fragment",
    "sap/ui/core/Component",
    "sap/ushell/Container"
], (
    NavigationListItem,
    CustomData,
    Fragment,
    Component,
    Container
) => {
    "use strict";

    /**
     * The menu entry "All Spaces" for the SideNavigation
     *
     * @property {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI Holds the side navigation API object passed to the constructor.
     * @property {sap.tnt.NavigationListItem} oRootItem The root navigation list item configured with the AllSpaces entry.
     * @since 1.134.0
     * @private
     */
    class AllSpaces {
        /**
         * The promise that resolves once the fragment is loaded.
         * @type {Promise<Array<sap.ui.core.Fragment|sap.ui.core.Component>>}
         */
        #pFragmentLoaded;

        /**
         * Creates a new menu entry "AllSpaces".
         *
         * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
         *
         * @since 1.134.0
         * @private
         */
        constructor (oSideNavAPI) {
            this.oSideNavAPI = oSideNavAPI;

            if (!this.#pFragmentLoaded) {
                const pFragmentLoaded = Fragment.load({
                    id: "AllSpaces",
                    name: "sap.ushell.components.shell.SideNavigation.fragment.AllSpaces",
                    controller: this
                });
                const pComponentLoaded = Component.create({
                    name: "sap.ushell.components.shell.NavigationBarMenu", componentData: { renderType: "Menu" }
                });

                this.#pFragmentLoaded = Promise.all([pFragmentLoaded, pComponentLoaded]).then(async (aResults) => {
                    const [oAllSpacesFragment, oComponent] = [...aResults];
                    Fragment.byId("AllSpaces", "NavigationBarMenuComponentContainer").setComponent(oComponent);
                    oSideNavAPI.getNavContainerFacade().add(oAllSpacesFragment);
                    const oMenuService = await Container.getServiceAsync("Menu");
                    const oSpacesModel = await oMenuService.getMenuModel();
                    oAllSpacesFragment.setModel(oSpacesModel, "spaces");

                    return oAllSpacesFragment;
                });
            }

            this.oRootItem = new NavigationListItem({
                text: "{i18n>SideNavigation.Item.AllSpaces.Title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                customData: [new CustomData({
                    key: "help-id",
                    value: "MenuEntry-All-Spaces",
                    writeToDom: true
                })],
                icon: "sap-icon://BusinessSuiteInAppSymbols/icon-all-spaces-pin",
                selectable: false,
                press: async () => {
                    oSideNavAPI.getNavContainerFacade().to(await this.#pFragmentLoaded);
                }
            });
        }

        /**
         * Asynchronously retrieves the root navigation list item.
         *
         * @async
         * @returns {Promise<sap.tnt.NavigationListItem>} A promise that resolves to NavigationListItem.
         * @since 1.134.0
         * @private
         */
        async getRootItem () {
            return this.oRootItem;
        }

        /**
         * Navigate back to SideNavigation.
         */
        onPressNavigateBackToSideNav () {
            this.oSideNavAPI.getNavContainerFacade().toRoot();
        }
    }
    return AllSpaces;
}, false);
