// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/tnt/NavigationList",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ushell/components/shell/SideNavigation/modules/Spaces",
    "sap/ushell/modules/NavigationMenu/ListProvider"
], (
    NavigationList,
    Filter,
    FilterOperator,
    Spaces,
    ListProvider
) => {
    "use strict";

    /**
     * The NavigationList for the item aggregation of the SideNavigation.
     *
     * Spaces will be rendered on root level of the SideNavigation.
     *
     * This module depends on the following ushell configuration:
     *
     * <code>
     * /core/menu/personalization/enabled
     * </code>
     *
     * Module specific configuration can contain the following properties as a stringified JSON object:
     * <code>
     * /core/sideNavigation/navigationListProvider/configuration
     * {
     *     spaces: {
     *         defaultIcon: ""
     *     }
     * }
     * </code>
     *
     * @property {sap.tnt.NavigationList} oRootItem The root navigation list that will be populated with items from the spaces model.
     *
     * @augments sap.ushell.modules.NavigationMenu.ListProvider
     *
     * @since 1.134.0
     * @private
     */
    class SpacesNavigationListProvider extends ListProvider {
        /**
        * Creates a new menu with spaces and pages for the SideNavigation.
        *
        * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
        *
        * @since 1.134.0
        * @private
        */
        constructor (oSideNavAPI) {
            super(oSideNavAPI);

            this.oRootItem = new NavigationList();
            this.oSpaces = new Spaces(oSideNavAPI);
            this.pSpaces = this.oSpaces.getRootItem().then((oItem) => {
                const oBindingInfo = oItem.getBindingInfo("items");

                // Remove the current filters from the binding info as they are not required to display all spaces in a flat list.
                // The filters would have removed the MyHome space and filtered for the pinned spaces.
                oBindingInfo.filters = [
                    new Filter("type", FilterOperator.NE, "separator") // Keep the filter for the separator items.
                ];

                // make sure to set all models on the root item
                Object.keys(oItem.getOwnModels()).forEach((sModelName) => {
                    this.oRootItem.setModel(oItem.getModel(sModelName), sModelName);
                });
                this.oRootItem.bindAggregation("items", oBindingInfo);
                return this.oSpaces;
            });
        }

        /**
         * Asynchronously retrieves the root navigation item.
         *
         * @async
         * @returns {Promise<sap.tnt.NavigationList>} A promise that resolves to NavigationList once the model is prepared and ready.
         * @since 1.134.0
         */
        async getRootItem () {
            return this.oRootItem;
        }

        /**
         * Asynchronously retrieves the selected key from the spaces.
         *
         * @returns {Promise<string>} A promise that resolves to the selected key from the spaces.
         */
        async findSelectedKey () {
            return (await this.pSpaces).findSelectedKey(this.oRootItem);
        }
    }

    return SpacesNavigationListProvider;
});
