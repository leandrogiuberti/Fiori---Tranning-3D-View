// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/tnt/NavigationList",
    "sap/tnt/NavigationListItem",
    "sap/m/MessageToast"
], (
    NavigationList,
    NavigationListItem
) => {
    "use strict";

    /**
     * A custom navigation list provider for the SideNavigation.
     *
     * This module creates a fixed navigation list with a single action button.
     *
     * @property {sap.tnt.NavigationList} oRootItem The root navigation list that will be populated with items from the spaces model.
     *
     * @private
     */
    class DemoFixedNavigationListProvider {
        /**
        * Creates a new navigation list with an action button for the SideNavigation.
        *
        * @private
        */
        constructor () {
            this.oRootItem = new NavigationList("UIPluginActionButton", {
                items: [
                    new NavigationListItem({
                        text: "Create",
                        design: "Action",
                        icon: "sap-icon://sys-add",
                        press: function () {
                            sap.m.MessageToast.show("Create Button pressed");
                        }
                    })
                ]
            });
        }

        /**
         * Asynchronously retrieves the root navigation item.
         *
         * @async
         * @returns {Promise<sap.tnt.NavigationList>} A promise that resolves to NavigationList once the model is prepared and ready.
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

    return DemoFixedNavigationListProvider;
}, false);
