// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Provides functionality for "sap/ushell/ui/launchpad/FailedTileDialog.fragment.xml"
 */
sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], (
    Fragment,
    JSONModel
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.FailedTileDialog
     * @class
     */
    return function () {
        /**
         * Helper function to get the Tile from any child of it. If the Tile itself is given, then it is returned.
         *
         * @param {sap.ui.core.Control} oSourceControl The source control. Must be the Tile itself or any child of it.
         * @returns {sap.ui.core.Control} The Tile.
         * @private
         */
        function _getTile (oSourceControl) {
            if (!oSourceControl) { throw new Error("Could not find the Tile of the given control"); }
            if (oSourceControl.isA(["sap.ushell.ui.launchpad.Tile", "sap.ushell.ui.launchpad.LinkTileWrapper"])) { return oSourceControl; }
            return _getTile(oSourceControl.getParent());
        }

        /**
         * Helper function to get the Group from any child of it. If the Group itself is given, then it is returned.
         *
         * @param {sap.ui.core.Control} oSourceControl The source control. Must be the Group itself or any child of it.
         * @returns {sap.ushell.ui.launchpad.TileContainer} The Group.
         * @private
         */
        function _getGroup (oSourceControl) {
            if (!oSourceControl) { throw new Error("Could not find the Group of the given control"); }
            if (oSourceControl.isA("sap.ushell.ui.launchpad.TileContainer")) { return oSourceControl; }
            return _getGroup(oSourceControl.getParent());
        }

        /**
         * Helper function to gather debug information from a Tile or any child of it.
         *
         * @param {sap.ui.core.Control} oSourceControl The source control. Must be the Tile itself or any child of it.
         * @returns {object} The "debugInfo" object containing the Tile debug information.
         * @private
         */
        function _getDebugInfo (oSourceControl) {
            let oDebugInfo = {};
            const oTile = _getTile(oSourceControl);
            if (oTile.getDebugInfo) {
                const sDebugInfo = oTile.getDebugInfo();
                if (sDebugInfo) {
                    oDebugInfo = JSON.parse(sDebugInfo);
                    oDebugInfo.debugInfo = sDebugInfo; // enhance the object with the original JSON received from "getDebugInfo()"
                }
            }
            if (oTile.getTileCatalogId) {
                const sTileCatalogId = oTile.getTileCatalogId();
                if (sTileCatalogId) {
                    // when available, the "tileCatalogId" (aka "chipId") is obtained from "getTileCatalogId()" instead of "getDebugInfo()"
                    oDebugInfo.chipId = decodeURIComponent(sTileCatalogId);
                }
            }
            const oGroup = _getGroup(oSourceControl);
            const oGroupBindingContext = oGroup.getBindingContext();
            if (oGroupBindingContext) {
                const oGroupObject = oGroupBindingContext.getProperty("object");
                if (oGroupObject) {
                    oDebugInfo.groupId = oGroupObject.getId();
                }
            }
            return oDebugInfo;
        }

        /**
         * Opens the FailedTileDialog using the information gathered from the Tile's "getDebugInfo()".
         * The same instance is reused whenever the Tile is within the same View of any previous invocation.
         *
         * @param {sap.ui.core.Control} oSourceControl The control that initiated the action. Must be the Tile itself or any child of it.
         * @returns {Promise<undefined>} A promise that resolves when the FailedTileDialog is created.
         * @protected
         */
        this.openFor = function (oSourceControl) {
            function getView (oControl) {
                if (!oControl) { throw new Error("Could not find the View of the given control"); }
                return (oControl.isA("sap.ui.core.mvc.View") ? oControl : getView(oControl.getParent()));
            }
            const oView = getView(oSourceControl);
            if (!oView.oFailedTileDialog) {
                return Fragment.load({
                    id: oView.createId("failedTileDialogFragment"),
                    name: "sap.ushell.ui.launchpad.FailedTileDialog",
                    controller: this
                }).then((oFailedTileDialog) => {
                    oFailedTileDialog.setModel(new JSONModel({}));
                    oFailedTileDialog.bindObject({ path: "/" });
                    oView.oFailedTileDialog = oFailedTileDialog;
                    oView.addDependent(oView.oFailedTileDialog);
                    this.openFor(oSourceControl);
                });
            }
            const oDialogModel = oView.oFailedTileDialog.getModel();
            oDialogModel.setProperty("/", _getDebugInfo(oSourceControl));
            oDialogModel.setProperty("/showDetails", false);
            oView.oFailedTileDialog.open();
            return Promise.resolve();
        };

        /**
         * Intended to be called by the FailedTileDialog fragment to handle "Show Details" press events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         * @protected
         */
        this.onShowDetails = function (oEvent) {
            oEvent.getSource().getModel().setProperty("/showDetails", true);
        };

        /**
         * Intended to be called by the FailedTileDialog fragment to handle "Close" press events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         * @protected
         */
        this.onClose = function (oEvent) {
            oEvent.getSource().getParent().close();
        };
    };
});
