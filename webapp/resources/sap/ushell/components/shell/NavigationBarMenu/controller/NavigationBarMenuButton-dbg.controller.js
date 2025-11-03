// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Controller for the NavigationBarMenu Popover. It is responsible for Popover handling, model binding, persistence
 * logic to pin, unpin and rearrange pinned spaces as well as executing navigation.
 *
 * @version 1.141.0
 * @private
 */
sap.ui.define([
    "sap/ui/core/InvisibleMessage",
    "./NavigationBarMenu.controller",
    "sap/ui/core/Fragment",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ui/model/json/JSONModel"
], (
    InvisibleMessage,
    NavigationBarMenuController,
    Fragment,
    Container,
    EventHub,
    JSONModel
) => {
    "use strict";

    /**
     * @alias sap.ushell.components.shell.NavigationBarMenu.button.controller.NavigationBarMenu
     * @class
     * @classdesc Controller of the NavigationBarMenu view.
     * It is responsible for the popover handling, pinning / unpinning spaces, rearranging spaces via DnD and do persistence of these changes.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameter
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @since 1.114.0
     * @private
     */ // eslint-disable-next-line max-len
    return NavigationBarMenuController.extend("sap.ushell.components.shell.NavigationBarMenu.controller.NavigationBarMenuButton", /** @lends sap.ushell.components.shell.NavigationBarMenu.button.controller.NavigationBarMenu.prototype */ {
        /**
         * Initializes the controller. ResourceBundle and Menu service promise are set.
         *
         * @private
         * @since 1.114.0
         */
        onInit: function () {
            this.pMenuServicePromise = Container.getServiceAsync("Menu");
            this._oInvisibleMessageInstance = InvisibleMessage.getInstance();
            this.oViewConfigurationModel = new JSONModel({
                enableMenuBarNavigation: true,
                contextMenu: {
                    enableMoveDown: false,
                    enableMoveUp: false,
                    enablePin: false
                }
            });
            this.getView().setModel(this.oViewConfigurationModel, "viewConfiguration");

            this._oEventHubListener = EventHub.on("enableMenuBarNavigation").do((bEnableMenuBarNavigation) => {
                this.oViewConfigurationModel.setProperty("/enableMenuBarNavigation", bEnableMenuBarNavigation);
            });
        },

        /**
         * Opens the Navigation Bar Menu Popover. Sets the menu model from the menu bar to the popover.
         * @param {sap.ui.base.Event} oEvent Press Event of the Button to open the Popover.
         * @returns {Promise<undefined>} Promise that resolves, after the pinned spaces are bound.
         *
         * @since 1.114.0
         * @private
         */
        openNavigationBarMenuPopover: function (oEvent) {
            const oNavigationBarMenuButton = oEvent.getSource();
            if (!this._pPopoverPromise) {
                this._pPopoverPromise = Fragment.load({
                    type: "XML",
                    id: this.getView().getId(),
                    controller: this,
                    name: "sap.ushell.components.shell.NavigationBarMenu.view.NavigationBarMenuPopover"
                }).then((oNavigationBarMenuPopover) => {
                    this.oModel = this.getOwnerComponent().oPropagatedProperties.oModels.menu;
                    oNavigationBarMenuPopover.setModel(this.oModel, "spaces");
                    this.getView().addDependent(oNavigationBarMenuPopover);
                    return oNavigationBarMenuPopover;
                });
            }

            return this._pPopoverPromise.then((oNavigationBarMenuPopover) => {
                this._bindPinnedSpaces().then(() => {
                    oNavigationBarMenuPopover.openBy(oNavigationBarMenuButton);
                });
            });
        },

        /**
         * Closes the navigation bar menu popover.
         *
         * @since 1.114.0
         * @private
         */
        closeNavigationBarMenuPopover: async function () {
            if (!this._pPopoverPromise) {
                return;
            }

            return this._pPopoverPromise.then((oPopover) => {
                oPopover.close();
            });
        },

        onMenuItemSelection: async function (oEvent) {
            await NavigationBarMenuController.prototype.onMenuItemSelection.call(this, oEvent);
            return this.closeNavigationBarMenuPopover();
        }
    });
});
