// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Dashboard groups container
 * @deprecated since 1.120. Deprecated together with the classic homepage.
 */
sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/core/InvisibleText",
    "sap/ushell/Config",
    "sap/ushell/library", // CSS dependency
    "sap/ushell/override",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "./DashboardGroupsContainerRenderer"
], (
    ManagedObject,
    Control,
    Core,
    InvisibleText,
    ushellConfig,
    ushellLibrary,
    ushellOverride,
    ushellResources,
    ushellUtils,
    DashboardGroupsContainerRenderer
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.DashboardGroupsContainer
     * @class
     * @classdesc Constructor for "sap.ushell.ui.launchpad.DashboardGroupsContainer".
     *
     * @param {string} [sId] ID for the new control, generated automatically if no id is given.
     * @param {object} [mSettings] Initial settings for the new control.
     *
     * @extends sap.ui.core.Control
     *
     * @public
     * @deprecated since 1.120
     */
    const DashboardGroupsContainer = Control.extend("sap.ushell.ui.launchpad.DashboardGroupsContainer", /** @lends sap.ushell.ui.launchpad.DashboardGroupsContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * A value for an optional accessibility label.
                 */
                accessibilityLabel: { type: "string", defaultValue: null },

                /**
                 */
                displayMode: { type: "string", defaultValue: null }
            },
            aggregations: {
                /**
                 */
                groups: { type: "sap.ui.core.Control", multiple: true, singularName: "group" }
            },
            events: {
                /**
                 */
                afterRendering: {}
            }
        },

        renderer: DashboardGroupsContainerRenderer
    });

    DashboardGroupsContainer.prototype.init = function () {
        // add invisible texts in order to support screen reader support on tiles inside the dashboard
        this.addInvisibleAccessabilityTexts();
    };

    DashboardGroupsContainer.prototype.exit = function () {
        if (this.oTileText) {
            this.oTileText.destroy();
        }

        if (this.oTileEditModeText) {
            this.oTileEditModeText.destroy();
        }

        Control.prototype.exit.apply(this, arguments);
    };

    /**
     * Overwrites update function (version without filter/sort support).
     *
     * Alternative (supports all bindings, uses default as fallback):
     *   sap.ushell.ui.launchpad.TileContainer.prototype.updateAggregation = sap.ushell.override.updateAggregation;
     */
    DashboardGroupsContainer.prototype.updateGroups = ushellOverride.updateAggregatesFactory("groups");

    DashboardGroupsContainer.prototype.onAfterRendering = function () {
        const that = this;
        const oConfigMarks = { bUseUniqueMark: true };

        ushellUtils.setPerformanceMark("FLP-TimeToInteractive_tilesLoaded", oConfigMarks);
        that.fireAfterRendering();
    };

    DashboardGroupsContainer.prototype.getGroupControlByGroupId = function (groupId) {
        try {
            const groups = this.getGroups();
            for (let i = 0, len = groups.length; i < len; ++i) {
                if (groups[i].getGroupId() === groupId) {
                    return groups[i];
                }
            }
        } catch {
            // continue regardless of error
        }

        return null;
    };

    DashboardGroupsContainer.prototype.addLinksToUnselectedGroups = function () {
        const aGroups = this.getGroups();
        aGroups.forEach((oGroup, index) => {
            if (!oGroup.getIsGroupSelected()) {
                ManagedObject.prototype.updateAggregation.call(oGroup, "links");
            }
        });
    };

    DashboardGroupsContainer.prototype.removeLinksFromAllGroups = function () {
        const aGroups = this.getGroups();
        aGroups.forEach((oGroup, index) => {
            const aLinks = oGroup.getLinks();
            if (aLinks.length) {
                if (aLinks[0].getMetadata().getName() === "sap.m.GenericTile") {
                    oGroup.removeAllLinks();
                } else {
                    for (let i = 0; i < aLinks.length; i++) {
                        aLinks[i].destroy();
                    }
                }
            }
        });
    };

    DashboardGroupsContainer.prototype.removeLinksFromUnselectedGroups = function () {
        const aGroups = this.getGroups();
        aGroups.forEach((oGroup, index) => {
            const aLinks = oGroup.getLinks();
            if (aLinks.length && !oGroup.getIsGroupSelected()) {
                if (aLinks[0].getMetadata().getName() === "sap.m.GenericTile") {
                    oGroup.removeAllLinks();
                } else {
                    for (let i = 0; i < aLinks.length; i++) {
                        aLinks[i].destroy();
                    }
                }
            }
        });
    };

    DashboardGroupsContainer.prototype.addInvisibleAccessabilityTexts = function () {
        this.oTileText = new InvisibleText("sapUshellDashboardAccessibilityTileText", {
            text: ushellResources.i18n.getText("tile")
        }).toStatic();

        const oBundle = Core.getLibraryResourceBundle("sap.m");
        if (oBundle) {
            this.oTileEditModeText = new InvisibleText("sapUshellDashboardAccessibilityTileEditModeText", {
                text: oBundle.getText("LIST_ITEM_NAVIGATION")
            }).toStatic();
        }
    };

    return DashboardGroupsContainer;
});
