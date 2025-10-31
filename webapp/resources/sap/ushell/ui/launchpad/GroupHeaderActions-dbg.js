// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.GroupHeaderActions.
sap.ui.define([
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/core/Control",
    "sap/ushell/library" // css style dependency
], (
    Button,
    mobileLibrary,
    Control
    // ushellLibrary
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    /**
     * @alias sap.ushell.ui.launchpad.GroupHeaderActions
     * @class
     * @classdesc Constructor for a new ui/launchpad/GroupHeaderActions.
     * Add your documentation for the new ui/launchpad/GroupHeaderActions
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.ui.core.Control
     *
     * @private
     */
    const GroupHeaderActions = Control.extend("sap.ushell.ui.launchpad.GroupHeaderActions", /** @lends sap.ushell.ui.launchpad.GroupHeaderActions.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                isOverflow: { type: "boolean", group: "Misc", defaultValue: false },
                tileActionModeActive: { type: "boolean", group: "Misc", defaultValue: false }
            },
            aggregations: {
                content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
            }
        },
        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the given groupHeaderActions, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm RenderManager that can be used for writing to the render output buffer.
             * @param {sap.ushell.ui.launchpad.GroupHeaderActions} groupHeaderActions groupHeaderActions to be rendered.
             */
            render: function (rm, groupHeaderActions) {
                rm.openStart("div", groupHeaderActions);
                rm.openEnd(); // div - tag

                const aContent = groupHeaderActions.getContent();

                if (groupHeaderActions.getTileActionModeActive()) {
                    if (groupHeaderActions.getIsOverflow()) {
                        const bHasVisibleContent = aContent.some((oContent) => {
                            return oContent.getVisible();
                        });

                        if (bHasVisibleContent) {
                            rm.renderControl(groupHeaderActions._getOverflowButton());
                        }
                    } else {
                        aContent.forEach((oContent) => {
                            rm.renderControl(oContent);
                        });
                    }
                }
                rm.close("div");
            }
        }
    });

    GroupHeaderActions.prototype.exit = function () {
        if (this._oOverflowButton) {
            this._oOverflowButton.destroy();
        }

        if (this._oActionSheet) {
            this._oActionSheet.destroy();
        }
    };

    GroupHeaderActions.prototype._getOverflowButton = function () {
        if (!this._oOverflowButton) {
            this._oOverflowButton = new Button({
                icon: "sap-icon://overflow",
                type: ButtonType.Transparent,
                enabled: "{= !${/editTitle}}",
                press: function () {
                    sap.ui.require(["sap/m/ActionSheet"], (ActionSheet) => {
                        if (!this._oActionSheet) {
                            this._oActionSheet = new ActionSheet({
                                placement: PlacementType.Auto
                            });
                        }

                        this._oActionSheet.destroyButtons();

                        this.getContent().forEach((oButton) => {
                            const cButton = oButton.clone();
                            cButton.setModel(oButton.getModel());
                            cButton.setBindingContext(oButton.getBindingContext());
                            this._oActionSheet.addButton(cButton);
                        });

                        this._oActionSheet.openBy(this._oOverflowButton);
                    });
                }.bind(this)
            }).addStyleClass("sapUshellHeaderActionButton");
            this._oOverflowButton.setParent(this);
        }
        return this._oOverflowButton;
    };

    return GroupHeaderActions;
});
