// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview MenuAdapter for the local platform.
 */

sap.ui.define([
    "sap/base/Log",
    "sap/base/i18n/Localization",
    "sap/base/util/ObjectPath",
    "sap/ushell/library",
    "sap/ushell/Container"
], (
    Log,
    Localization,
    ObjectPath,
    ushellLibrary,
    Container
) => {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * Constructs a new instance of the MenuAdapter for the local platform.
     *
     * @class
     * @since 1.72.0
     * @param {object} system The system information. In a local environment this is not used
     * @param {string} parameter The Adapter parameter
     * @param {object} adapterConfiguration The Adapter configuration
     * @param {boolean} adapterConfiguration.enabled Determines if the menu should be enabled
     * @param {(string|object)} adapterConfiguration.menuData
     *   If a JSON path is provided as a string the MenuAdapter tries to load and parse the respective JSON.
     *   If an object is provided the adapter uses the data of the specified object.
     * @private
     */
    function MenuAdapter (system, parameter, adapterConfiguration) {
        this._oAdapterConfig = ObjectPath.get("config", adapterConfiguration);
    }

    MenuAdapter.prototype.isMenuEnabled = function () {
        return Promise.resolve(!!this._oAdapterConfig.enabled);
    };

    /**
     * Resolves the content nodes defined in the adapter config
     *
     * @returns {Promise<object[]>} Resolves the content nodes
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype.getContentNodes = async function () {
        const vMenuData = this._oAdapterConfig.menuData;

        if (!vMenuData) {
            Log.error("No menuData specified in the adapter configuration.", null, "sap.ushell.adapters.local.MenuAdapter");
            throw new Error("No menuData specified in the adapter configuration.");
        }

        if (typeof vMenuData === "object") {
            return vMenuData;
        }

        return fetch(vMenuData,
            {
                headers: {
                    Accept: "application/json",
                    "Accept-Language": Localization.getLanguageTag().toString()
                }
            }
        )
            .then((oResponse) => {
                return oResponse.json();
            })
            .catch((oError) => {
                Log.error("Menu entries were requested but could not be loaded from JSON file", oError);
                throw new Error("Menu entries could not be fetched");
            });
    };

    /**
     * Resolves the menu entries based on the content nodes
     * Remarks:
     * - The menu entries have to be spaces and pages
     *
     * @returns {Promise<object[]>} Resolves the menu entries
     * @private
     */
    MenuAdapter.prototype.getMenuEntries = function () {
        return this.getContentNodes().then((aContentNodes) => {
            return aContentNodes.map((oSpaceNode) => {
                const oFirstPage = oSpaceNode.children[0];
                const oTopLevelEntry = this._buildMenuEntry(oSpaceNode, oSpaceNode.id, oFirstPage.id);

                if (oSpaceNode.children.length > 1) {
                    oTopLevelEntry.menuEntries = oSpaceNode.children.map((oPageNode) => {
                        return this._buildMenuEntry(oPageNode, oSpaceNode.id, oPageNode.id);
                    });
                }

                return oTopLevelEntry;
            });
        });
    };

    /**
     * Gets the pinned menu entries of the user from the personalization service.
     * @returns  {object} A personalization object containing a property pinnedSpaces.
     *                    This is an array of the keys of the pinned spaces.
     *                    The sort order is given by the array index.
     * @private
     * @since 1.114.0
     */
    MenuAdapter.prototype.getMenuPersonalization = function () {
        return Container.getServiceAsync("PersonalizationV2")
            .then(async (oPersonalizationService) => {
                const oPersId = {
                    container: "sap.ushell.menuPersonalization",
                    item: "data"
                };

                const oScope = {
                    validity: "Infinity",
                    keyCategory: oPersonalizationService.KeyCategory.FIXED_KEY,
                    writeFrequency: oPersonalizationService.WriteFrequency.HIGH,
                    clientStorageAllowed: false
                };

                const oPersonalizer = await oPersonalizationService.getPersonalizer(oPersId, oScope);
                return oPersonalizer.getPersData();
            });
    };

    /**
     * Builds a menu entry based on a content node
     *
     * @param {object} oContentNode The content node containing the details for the menu entry
     * @param {string} sSpaceId The SpaceId of the menu entry
     * @param {string} sPageId The PageId of the menu entry
     * @returns {object} menu entry
     * @private
     * @since 1.105.0
     */
    MenuAdapter.prototype._buildMenuEntry = function (oContentNode, sSpaceId, sPageId) {
        const sHelpIdPrefix = oContentNode.type === ContentNodeType.Space ? "Space-" : "Page-";
        return {
            id: oContentNode.id,
            "help-id": sHelpIdPrefix + oContentNode.id,
            title: oContentNode.label,
            type: "IBN",
            target: {
                semanticObject: "Launchpad",
                action: "openFLPPage",
                parameters: [
                    { name: "spaceId", value: sSpaceId },
                    { name: "pageId", value: sPageId }
                ]
            },
            isHomeEntry: false,
            menuEntries: []
        };
    };

    return MenuAdapter;
});
