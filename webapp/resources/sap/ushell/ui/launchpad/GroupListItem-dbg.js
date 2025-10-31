// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.GroupListItem.
sap.ui.define([
    "sap/m/ListItemBase",
    "sap/ushell/library", // css style dependency
    "sap/ushell/utils",
    "./GroupListItemRenderer"
], (
    ListItemBase,
    library,
    utils,
    GroupListItemRenderer
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.GroupListItem
     * @class
     * @classdesc Constructor for a new ui/launchpad/GroupListItem.
     * Add your documentation for the new ui/launchpad/GroupListItem
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.m.ListItemBase
     *
     * @private
     */
    const GroupListItem = ListItemBase.extend("sap.ushell.ui.launchpad.GroupListItem", /** @lends sap.ushell.ui.launchpad.GroupListItem.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 */
                title: { type: "string", group: "Misc", defaultValue: null },

                /**
                 */
                defaultGroup: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 */
                show: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 */
                groupId: { type: "string", group: "Misc", defaultValue: null },

                /**
                 */
                index: { type: "int", group: "Misc", defaultValue: null },

                /**
                 */
                numberOfTiles: { type: "int", group: "Misc", defaultValue: 0 },

                /**
                 */
                isGroupVisible: { type: "boolean", group: "Misc", defaultValue: true }
            },
            events: {

                /**
                 */
                press: {},

                /**
                 */
                afterRendering: {}
            }
        },

        renderer: GroupListItemRenderer
    });

    GroupListItem.prototype.exit = function () {
        ListItemBase.prototype.exit.apply(this, arguments);
    };

    GroupListItem.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
    };

    GroupListItem.prototype.groupHasVisibleTiles = function () {
        const groupTiles = this.getModel().getProperty(`/groups/${this.getIndex()}/tiles`);
        const groupLinks = this.getModel().getProperty(`/groups/${this.getIndex()}/links`);
        return utils.groupHasVisibleTiles(groupTiles, groupLinks);
    };

    // browser events
    // use onmousedown instead of onclick because a click will not end the edit mode if the user starts immediately dragging another tile
    GroupListItem.prototype.onclick = function () {
        this.firePress({
            id: this.getId()
        });
    };

    GroupListItem.prototype.setGroupId = function (sGroupId) {
        this.setProperty("groupId", sGroupId, true); // suppress rerendering
        return this;
    };

    GroupListItem.prototype.setTitle = function (sTitle) {
        this.setProperty("title", sTitle); // DO NOT suppress rerendering - otherwise groups list (UI) is not re-rendered and old tooltip still showing
        this.$().find(".sapMSLITitleOnly").text(sTitle);
        return this;
    };

    return GroupListItem;
});
