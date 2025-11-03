// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
 *
 * @fileOverview Tile action mode implementation.
 *
 * In tile action mode the user can launch an action associated with a tile.
 * The mode is launched when clicking on the Edit button in the user menu.
 *
 * Tile action mode can be activated only from the launchpad. it is not accessible from the catalog or from an application.
 * When the mode is active and the user clicks on a tile - the tile's corresponding actions are presented in an action sheet
 *  and the user can click/launch any of them.
 *
 * Every user action (e.g. menu buttons, drag-and-drop) except for clicking a tile - stops/deactivates the action mode.
 *
 * This module Contains the following:
 *  - Constructor function that creates action mode activation buttons
 *  - Activation handler
 *  - Deactivation handler
 *  - Rendering tile action menu
 *
 * @version 1.141.0
 *
 * @deprecated since 1.112
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Popover",
    "sap/m/Text",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ushell/components/HomepageManager",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/EventHub"
], (
    Log,
    Button,
    mobileLibrary,
    Popover,
    Text,
    Element,
    EventBus,
    HomepageManager,
    resources,
    WindowUtils,
    EventHub
) => {
    "use strict";

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    /* global hasher */

    /**
     * @namespace sap.ushell.components.homepage.ActionMode
     * @since 1.26.0
     * @private
     */

    /**
     * Constructor function
     * Creates action mode activation buttons:
     *  1. A new button in the user menu
     *  2. A floating button
     */
    function ActionMode () {
        this.oEventBus = EventBus.getInstance();

        this.init = function (oModel) {
            this.oModel = oModel;
        };
    }

    /**
     * Activation handler of Tile actions mode ("Edit Mode").
     *
     * Performs the following actions:
     * - Sets the feature's model property to indicate that the feature is activated
     * - Registers deactivation click handler, called when the user clicks outside of a tile
     * - Adds the cover DIV to all tiles adding the mode's grey opacity and click handler for opening the actions menu
     * - Disables drag capability on tiles
     * - Changes the appearance of the floating activation button
     */
    ActionMode.prototype._activate = function () {
        this.oModel.setProperty("/tileActionModeActive", true);
        this.aOrigHiddenGroupsIds = this.getHomepageManager().getCurrentHiddenGroupIds(this.oModel);
        const oDashboardGroups = Element.getElementById("dashboardGroups");
        oDashboardGroups.addLinksToUnselectedGroups();

        // Change action mode button display in the user actions menu
        const oTileActionsButton = Element.getElementById("ActionModeBtn");
        if (oTileActionsButton) {
            oTileActionsButton.setText(resources.i18n.getText("exitEditMode"));
            // only available if the action mode button is in the shell header
            if (oTileActionsButton.setSelected) {
                oTileActionsButton.setSelected(true);
            }
        }
        this.oEventBus.publish("launchpad", "actionModeActive");
    };

    /**
     * Deactivation handler of tile actions mode
     *
     * Performs the following actions:
     * - Unregisters the deactivation click handler
     * - Sets the feature's model property to indicate that the feature is deactivated
     * - Enables drag capability on tiles
     * - Destroys the tile actions menu control
     * - Removed the cover DIV from to all the tiles
     * - Adds the cover DIV to all tiles adding the mode's grey opacity and click handler for opening the actions menu
     * - Changes the appearance of the floating activation button
     */
    ActionMode.prototype._deactivate = function () {
        this.oModel.setProperty("/tileActionModeActive", false);
        this.oEventBus.publish("launchpad", "actionModeInactive", this.aOrigHiddenGroupsIds);

        const tileActionsMenu = Element.getElementById("TileActions");
        if (tileActionsMenu !== undefined) {
            tileActionsMenu.destroy();
        }

        // Change action mode button display in the user actions menu
        const oTileActionsButton = Element.getElementById("ActionModeBtn");
        if (oTileActionsButton) {
            oTileActionsButton.setText(resources.i18n.getText("activateEditMode"));
            // only available if the action mode button is in the shell header
            if (oTileActionsButton.setSelected) {
                oTileActionsButton.setSelected(false);
            }
        }
    };

    ActionMode.prototype.toggleActionMode = function (oModel, sSource, dashboardGroups) {
        dashboardGroups = dashboardGroups || [];

        const visibleGroups = dashboardGroups.filter((group) => {
            return group.getVisible();
        });

        const oData = {
            group: visibleGroups[oModel.getProperty("/topGroupInViewPortIndex")]
        };

        if (oModel.getProperty("/tileActionModeActive")) {
            this._deactivate();

            // if the TileContainer header was focused, we need to restore focus to the closest tile
            const oLastFocusedHeaderElement = document.querySelector(".sapUshellTileContainerHeader[tabindex='0']");
            if (oLastFocusedHeaderElement) {
                const oTileContainerElement = oLastFocusedHeaderElement.closest("sapUshellTileContainer");
                if (oTileContainerElement) {
                    oData.restoreLastFocusedTileContainerById = oTileContainerElement.getAttribute("id");
                }
            }
        } else {
            this._activate();
        }

        // the "scrollToGroup" event gets triggered by the onAfterRendering
        // this handler should go afterwards
        setTimeout(() => {
            this.oEventBus.publish("launchpad", "scrollToGroup", oData);
        }, 0);
    };

    /**
     * Apply action/edit mode CSS classes on a group.
     * This function is called when in edit/action mode and tiles were dragged,
     *  since the group is being re-rendered and the dashboard is still in action/edit mode
     *
     * @param {object} oGroup Group that should be placed in edit mode
     */
    ActionMode.prototype.activateGroupEditMode = function (oGroup) {
        const aGroupContentElements = oGroup.getDomRef().getElementsByClassName("sapUshellTileContainerContent");

        for (let i = 0; i < aGroupContentElements.length; i++) {
            aGroupContentElements[i].classList.add("sapUshellTileContainerEditMode");
        }
    };

    ActionMode.prototype.getHomepageManager = function () {
        if (!this.oHomepageManager) {
            this.oHomepageManager = HomepageManager.prototype.getInstance();
        }
        return this.oHomepageManager;
    };

    ActionMode.prototype._filterActions = function (aActions, oTileControl) {
        const oTileModel = oTileControl.getModel();
        const sGroupBindingPath = oTileControl.getParent().getBindingContext().getPath();
        if (oTileModel.getProperty(`${sGroupBindingPath}/isGroupLocked`)) {
            // edit (personalization) actions should not be displayed in locked Groups,
            // but actions defined in FLPD should be kept (e.g. Dynamic & Static Tiles can have settings actions)
            [
                "tileSettingsBtn",
                "linkSettingsBtn",
                "ConvertToTile",
                "ConvertToLink",
                "moveTile_action"
            ].forEach((sActionKey) => {
                aActions = aActions.filter((oAction) => {
                    return (oAction.id !== sActionKey);
                });
            });
        }
        if (this.getHomepageManager().getPersonalizableGroups().length < 2) {
            // the "Move" action should not be displayed if there are less than 2 personalizable Groups
            aActions = aActions.filter((oAction) => {
                return (oAction.id !== "moveTile_action");
            });
        }
        return aActions;
    };

    /**
     * Opens the tile menu, presenting the tile's actions
     *
     * Performs the following actions:
     * - Returning the clicked tile to its original appearance
     * - Tries to get an existing action sheet in case actions menu was already opened during this session of action mode
     * - If this is the first time the user opens actions menu during this session of action mode - lazy creation a new action sheet
     * - Gets the Tile's actions from the LaunchPage service and creates buttons accordingly; invalid actions are discarded
     * - Open the action sheet by the clicked tile
     *
     * @param {sap.ui.base.Event} oEvent Tile press action event.
     * @private
     */
    ActionMode.prototype._openActionsMenu = function (oEvent) {
        const oTileControl = oEvent.getSource();
        const oTile = oTileControl.getBindingContext().getObject().object;
        let aActions = this.getHomepageManager().getTileActions(oTile);
        aActions = this._filterActions(aActions, oTileControl);

        const aTileActionLayerDivSelectedElements = document.getElementsByClassName("sapUshellTileActionLayerDivSelected");
        for (let i = 0; i < aTileActionLayerDivSelectedElements.length; i++) {
            aTileActionLayerDivSelectedElements[i].classList.remove("sapUshellTileActionLayerDivSelected");
        }

        const aCoverDivs = oTileControl.getDomRef().getElementsByClassName("sapUshellTileActionLayerDiv");
        for (let j = 0; j < aCoverDivs.length; j++) {
            aCoverDivs[j].classList.add("sapUshellTileActionLayerDivSelected");
        }

        const aActionButtons = [];

        aActions.forEach((oAction) => {
            if (!oAction.press && !oAction.targetURL) {
                Log.warning(`Invalid Tile action discarded: ${JSON.stringify(oAction)}`);
                return;
            }
            aActionButtons.push(new Button({
                text: oAction.text,
                icon: oAction.icon,
                press: this._handleActionPress.bind(this, oAction, oTileControl)
            }));
        });

        if (aActionButtons.length === 0) {
            this._openNoActionsPopover(oEvent);
            return;
        }

        // for tiles, actions menu is opened by "more" icon; for links, there is an action button not controlled by the FLP.
        // for links, we first try to access the "more" button and open the action sheet by it.
        let oActionSheetTarget = oTileControl.getActionSheetIcon ? oTileControl.getActionSheetIcon() : undefined;
        if (!oActionSheetTarget) {
            const oMoreAction = Element.getElementById(`${oTileControl.getId()}-action-more`);
            oActionSheetTarget = (oMoreAction || oTileControl);
        }

        let oActionSheet = Element.getElementById("TileActions");
        if (!oActionSheet) {
            sap.ui.require(["sap/m/ActionSheet"], (ActionSheet) => {
                oActionSheet = new ActionSheet("TileActions", {
                    placement: PlacementType.VerticalPreferedBottom,
                    afterClose: function () {
                        const aSelectedElements = document.getElementsByClassName("sapUshellTileActionLayerDivSelected");
                        for (let k = 0; k < aSelectedElements.length; k++) {
                            aSelectedElements[k].classList.remove("sapUshellTileActionLayerDivSelected");
                        }
                        const oEventBus = EventBus.getInstance();
                        oEventBus.publish("dashboard", "actionSheetClose", oTileControl);
                    }
                });
                this._openActionSheet(oActionSheet, aActionButtons, oActionSheetTarget);
            });
        } else {
            this._openActionSheet(oActionSheet, aActionButtons, oActionSheetTarget);
        }
    };

    /**
     * Opens the Action Sheet on the given target with the provided buttons.
     *
     * @param {object} oActionSheet the action sheet control instance.
     * @param {object[]} aButtons the buttons that should be in the action sheet.
     * @param {object} oTarget the target control, the action sheet should open by.
     */
    ActionMode.prototype._openActionSheet = function (oActionSheet, aButtons = [], oTarget) {
        oActionSheet.destroyButtons();
        aButtons.forEach((oButton) => {
            oActionSheet.addButton(oButton);
        });
        oActionSheet.openBy(oTarget);
    };

    ActionMode.prototype._openNoActionsPopover = function (oEvent) {
        const oTileControl = oEvent.getSource();
        const oText = new Text({ text: resources.i18n.getText("tileHasNoActions") });
        new Popover({
            placement: PlacementType.Bottom,
            showHeader: false,
            ariaLabelledBy: oText.getId(),
            content: oText
        }).addStyleClass("sapUiContentPadding").openBy(oTileControl);
    };

    /**
     * Press handler of an action in a Tile's action sheet.
     * This handling is platform-specific (i.e. not all platforms call this method).
     *
     * @param {object} oAction The pressed action in the Tile's action sheet.
     * @param {string} oAction.icon An icon code.
     * @param {string} oAction.text A text.
     * @param {function} [oAction.press] A callback function to handle the press.
     * @param {string} [oAction.targetURL] Either a hash (intent) or a full URL to navigate to.
     *   If both a "press" and a "targetURL" are provided, "targetURL" is ignored.
     *   If neither a "press" nor a "targetURL" are provided, nothing happens (the action is invalid and should not be displayed).
     * @param {sap.ui.core.Control} oTileControl The Tile that owns the action.
     * @private
     */
    ActionMode.prototype._handleActionPress = function (oAction, oTileControl) {
        if (oAction.press) {
            oAction.press(oTileControl);
        } else if (oAction.targetURL) {
            EventHub.emit("UITracer.trace", {
                reason: "LaunchApp",
                source: "Tile",
                data: {
                    targetUrl: oAction.targetURL
                }
            });
            if (oAction.targetURL.indexOf("#") === 0) {
                hasher.setHash(oAction.targetURL);
            } else {
                WindowUtils.openURL(oAction.targetURL, "_blank");
            }
        }
    };

    return new ActionMode();
}, /* bExport= */ true);
