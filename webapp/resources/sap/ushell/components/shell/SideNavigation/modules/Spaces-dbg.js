// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/tnt/NavigationListGroup",
    "sap/tnt/NavigationListItem",
    "sap/ui/core/CustomData",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/components/shell/SideNavigation/modules/NavigationHelper",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/utils/UrlParsing"
], (
    ObjectPath,
    NavigationListGroup,
    NavigationListItem,
    CustomData,
    Filter,
    FilterOperator,
    Sorter,
    JSONModel,
    hasher,
    Config,
    Container,
    NavigationHelper,
    AppConfiguration,
    UrlParsing
) => {
    "use strict";

    /**
     * The menu entry "My Spaces" with spaces and pages for the SideNavigation.
     *
     * @since 1.134.0
     * @private
     */
    class Spaces {
        /**
         * The side navigation API object passed to the constructor.
         * @type {object}
         */
        #oSideNavAPI;

        /**
         * The promise which resolves with the root navigation list item when everything is loaded.
         * @type {Promise<sap.tnt.NavigationListGroup>}
         */
        #pItemReady;

        /**
         * The root navigation list item group item configured with sections and apps.
         * @type {sap.tnt.NavigationListGroup}
         */
        #oRootItem;

        /**
         * The default icon for side navigation list items.
         * @type {string}
         */
        #sSideNavigationListItemIcon;

        /**
         * The navigation helper instance used for navigation-related operations.
         * @type {sap.ushell.components.shell.SideNavigation.modules.NavigationHelper}
         */
        #oNavigationHelper;

        /**
         * Model to maintain the expanded state of the navigation list items.
         * @type {sap.ui.model.json.JSONModel}
         */
        #oNavigationListItemModel;

        /**
         * The promise which resolves with the Menu services model.
         * @type {Promise<sap.ui.model.json.JSONModel>}
         */
        #pModel;

        /**
         * Creates a new menu entry "My Spaces" with spaces and pages for the SideNavigation.
         *
         * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
         *
         * @since 1.134.0
         * @private
         */
        constructor (oSideNavAPI) {
            this.#oSideNavAPI = oSideNavAPI;
            this.#sSideNavigationListItemIcon = this.#oSideNavAPI.getConfigValue("spaces.defaultIcon");
            this.#oNavigationHelper = new NavigationHelper();

            const bMenuPersonalization = Config.last("/core/menu/personalization/enabled");
            const sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");
            const aFilters = [
                new Filter("type", FilterOperator.NE, "separator")
            ];
            if (bMenuPersonalization) {
                aFilters.push(new Filter("pinned", FilterOperator.EQ, true));
            }

            if (sMyHomeSpaceId) {
                aFilters.push(new Filter("id", FilterOperator.NE, sMyHomeSpaceId));
            }

            this.#oNavigationListItemModel = new JSONModel({});
            this.#oNavigationListItemModel.attachPropertyChange(() => {
                this.#oSideNavAPI.updateSelectedKey();
            });

            this.#oRootItem = new NavigationListGroup({
                text: "{i18n>SideNavigation.Item.Spaces.Title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                customData: [new CustomData({
                    key: "help-id",
                    value: "MenuEntry-My-Spaces",
                    writeToDom: true
                })],
                items: {
                    path: "spaces>/",
                    factory: this._spacesModelItemFactory.bind(this),
                    filters: new Filter({
                        filters: aFilters,
                        and: true
                    }),
                    sorter: bMenuPersonalization ? new Sorter({ path: "pinnedSortOrder" }) : null
                }
            });
            this.#oRootItem.setModel(this.#oNavigationListItemModel, "navigationListItemModel");
            this.#pItemReady = new Promise((resolve) => {
                this.#pModel = this.#prepareModel(resolve);
            });
        }

        /**
         * Asynchronously retrieves the root navigation item.
         *
         * @returns {Promise<sap.tnt.NavigationListGroup>} A promise that resolves to NavigationListGroup once the model is prepared and ready.
         *
         * @since 1.134.0
         * @private
         */
        async getRootItem () {
            return this.#pItemReady;
        }

        /**
         * Prepares the model by fetching the menu service and setting the spaces model on the root item.
         *
         * @param {function} resolve The resolve function for the Promise associated with model preparation.
         * @returns {Promise<sap.ui.model.json.JSONModel>} A promise that resolves once the model is set on the root item.
         *
         * @since 1.134.0
         * @private
         */
        async #prepareModel (resolve) {
            const oMenuService = await Container.getServiceAsync("Menu");
            const oSpacesModel = await oMenuService.getMenuModel();
            this.#oRootItem.setModel(oSpacesModel, "spaces");
            resolve(this.#oRootItem);
            return oSpacesModel;
        }

        /**
         * Finds the selected key based on the current URL hash and the spaces model.
         *
         * @param {sap.tnt.NavigationListItemBase} oRootItem The root item to start the search from.
         * @returns {Promise<string>} A promise that resolves to the selected menu key.
         *
         * @since 1.134.0
         */
        async findSelectedKey (oRootItem) {
            const sHash = hasher.getHash();
            const oHashParts = UrlParsing.parseShellHash(sHash);
            const sSpaceId = ObjectPath.get("params.spaceId.0", oHashParts);
            const sPageId = ObjectPath.get("params.pageId.0", oHashParts);

            // first use hint from the hint from url, second the actual resolved app id (which might be different)
            const sAppIdHint = ObjectPath.get("params.sap-ui-app-id-hint.0", oHashParts)
                || AppConfiguration.getCurrentApplication()?.appId;

            oRootItem = oRootItem || await this.getRootItem();
            if (oHashParts.semanticObject === "Shell" && oHashParts.action === "home") {
                return oRootItem.getItems()[0]?.getKey();
            }
            const oSelectedItem = this.#findItemRecursive(oRootItem.getItems(), sSpaceId, sPageId, sAppIdHint);
            return oSelectedItem?.getKey();
        }

        /**
         * Finds the selected item in the spaces model recursively.
         *
         * If the item is found and is not expanded, its parent item is returned.
         *
         * @param {sap.tnt.NavigationListItemBase[]} aItems The array of navigation list items to search.
         * @param {string} sSpaceId The space ID to match.
         * @param {string} sPageId The page ID to match.
         * @param {string} sAppIdHint The app ID hint to match.
         * @returns {sap.tnt.NavigationListItemBase} The selected item or its parent if the parent of the selected item is not expanded.
         *
         * @private
         * @since 1.135.0
         */
        #findItemRecursive (aItems, sSpaceId, sPageId, sAppIdHint) {
            for (let i = 0; i < aItems.length; i++) {
                const oItem = aItems[i];
                const aNestedItems = oItem.getItems();
                const oFoundNestedItem = this.#findItemRecursive(aNestedItems, sSpaceId, sPageId, sAppIdHint);
                if (oFoundNestedItem && !oItem.getExpanded()) {
                    return oItem;
                } else if (oFoundNestedItem) {
                    return oFoundNestedItem;
                }

                const bFound = this.#hasSpaceIdAndPageId(oItem.getBindingContext("spaces").getObject(), sSpaceId, sPageId, sAppIdHint);
                if (bFound) {
                    return oItem;
                }
            }
        }

        /**
         * Checks if a side navigation entry has the specified space ID and page ID in its target parameters.
         *
         * @param {object} oSideNavigationEntry The side navigation entry object to check.
         * @param {string} sSpaceId The space ID to match.
         * @param {string} sPageId The page ID to match.
         * @param {string} sAppIdHint The app ID hint to match.
         * @returns {boolean} True if the side navigation entry has the specified space ID and page ID, false otherwise.
         *
         * @private
         * @since 1.132.0
         */
        #hasSpaceIdAndPageId (oSideNavigationEntry, sSpaceId, sPageId, sAppIdHint) {
            const aParameters = ObjectPath.get("target.parameters", oSideNavigationEntry) || [];

            const bSpaceIdMatched = aParameters.some((oParameter) => {
                return oParameter.name === "spaceId" && oParameter.value === sSpaceId;
            });
            const bPageIdMatched = aParameters.some((oParameter) => {
                return oParameter.name === "pageId" && oParameter.value === sPageId;
            });
            const bAppIdHintMatched = aParameters.some((oParameter) => {
                return oParameter.name === "sap-ui-app-id-hint" && oParameter.value === sAppIdHint;
            });

            if (!sSpaceId) {
                return bPageIdMatched || bAppIdHintMatched;
            }

            // when no pageId and no appId is provided, match only by spaceId
            const bNoPageIdAndNoAppIdProvided = !sPageId && !sAppIdHint;

            return bSpaceIdMatched && (bPageIdMatched || bAppIdHintMatched || bNoPageIdAndNoAppIdProvided);
        }

        /**
         * Factory function for creating a navigation list items in the "My Spaces" menu for the spaces model.
         *
         * @param {string} sId The unique identifier for the navigation list item.
         * @param {sap.ui.model.Context} oContext The model context object for the navigation list item.
         * @returns {sap.tnt.NavigationListItem} A new instance of NavigationListItem configured for the spaces model.
         *
         * @since 1.133.0
         * @private
         */
        _spacesModelItemFactory (sId, oContext) {
            const aMenuEntries = oContext.getProperty("menuEntries");
            const sUid = oContext.getProperty("uid");
            this.#oNavigationListItemModel.setProperty(`/${sUid}`, false);
            return new NavigationListItem(sId, {
                key: "{spaces>uid}", // is not unique if used multiple times in a hierarchy
                text: "{spaces>title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                selectable: this.#oSideNavAPI.getConfigValue("spaces.selectable") || !aMenuEntries || aMenuEntries.length === 0,
                expanded: `{navigationListItemModel>/${sUid}}`,
                customData: [new CustomData({
                    key: "help-id",
                    value: "{= 'MenuEntry-' + ${spaces>help-id}}",
                    writeToDom: "{= !!${spaces>help-id}}"
                })],
                icon: { path: "spaces>icon", formatter: (sIcon) => sIcon || this.#sSideNavigationListItemIcon },
                select: this._onSideNavigationItemSelection.bind(this),
                items: {
                    path: "spaces>menuEntries",
                    template: new NavigationListItem({
                        key: "{spaces>uid}", // is not unique if used multiple times in a hierarchy
                        text: "{spaces>title}",
                        enabled: "{viewConfiguration>/enableSideNavigation}",
                        expanded: false,
                        customData: [new CustomData({
                            key: "help-id",
                            value: "{= 'MenuEntry-' + ${spaces>help-id}}",
                            writeToDom: "{= !!${spaces>help-id}}"
                        })],
                        select: this._onSideNavigationItemSelection.bind(this),
                        icon: "{spaces>icon}"
                    })
                }
            });
        }

        /**
         * Triggered whenever a user selects a side navigation item.
         *
         * @param {sap.ui.base.Event} oEvent The 'itemSelect' event.
         *
         * @private
         * @since 1.132.0
         */
        _onSideNavigationItemSelection (oEvent) {
            this.#oSideNavAPI.updateSelectedKey();
            const oDestinationIntent = oEvent.getParameter("item").getBindingContext("spaces").getProperty();
            this.#oSideNavAPI.closeSideNavigation();
            this.#oNavigationHelper.navigate(oDestinationIntent);
        }
    }

    return Spaces;
}, false);
