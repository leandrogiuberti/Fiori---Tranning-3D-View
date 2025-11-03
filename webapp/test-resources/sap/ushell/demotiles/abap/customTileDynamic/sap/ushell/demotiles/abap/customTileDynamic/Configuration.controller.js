// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/ListItem",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils"
], (
    ListItem,
    Controller,
    tilesUtils
) => {
    "use strict";

    return Controller.extend("sap.ushell.demotiles.abap.customTileDynamic.Configuration", {
        // checks given inputs
        onConfigurationInputChange: function (oControlEvent) {
            tilesUtils.checkInput(this.getView(), oControlEvent);
        },
        // default semantic objects for dynamic applauncher: blank
        aDefaultObjects: [{ obj: "", name: "" }],
        onInit: function () {
            const oView = this.getView();
            const oSemanticObjectSelector = oView.byId("navigation_semantic_objectInput");
            const oActionSelector = oView.byId("navigation_semantic_actionInput");
            const oResourceModel = tilesUtils.getResourceBundleModel();

            oView.setModel(oResourceModel, "i18n");
            const oBundle = tilesUtils.getResourceBundle();
            // set view name for identification in utils
            oView.setViewName("sap.ushell.demotiles.abap.customTileDynamic.Configuration");
            tilesUtils.createSemanticObjectModel(this, oSemanticObjectSelector, this.aDefaultObjects);
            tilesUtils.createActionModel(this, oActionSelector, this.aDefaultObjects);

            // make sure that the chose object is written back to the configuration
            oSemanticObjectSelector.attachChange((oControlEvent) => {
                const sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/navigation_semantic_object", sValue);
            });
            oActionSelector.attachChange((oControlEvent) => {
                const sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/navigation_semantic_action", sValue);
            });
            // toggle editable property of targetURL input field depending on navigation_use_semantic_object
            oView.byId("targetUrl").bindProperty("enabled", {
                formatter: function (bUseLaunchpad) {
                    return !bUseLaunchpad;
                },
                path: "/config/navigation_use_semantic_object"
            });
            // Adding list items URL and Intent to the Target Type in Tile Actions section
            let oItem = new ListItem({ key: "URL", text: oBundle.getText("configuration.tile_actions.table.target_type.url") });
            oView.byId("targetTypeCB").addItem(oItem);
            oItem = new ListItem({ key: "INT", text: oBundle.getText("configuration.tile_actions.table.target_type.intent") });
            oView.byId("targetTypeCB").addItem(oItem);
        },

        onAfterRendering: function () {
            //            sap.ushell.components.tiles.utils.updateTooltipForDisabledProperties(this.getView());
            tilesUtils.updateMessageStripForOriginalLanguage(this.getView());
        },

        // forward semantic object value helper request to utils
        onValueHelpRequest: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions icon field, else general icon field.
            tilesUtils.objectSelectOnValueHelpRequest(this, oEvent, false);
        },
        // forward semantic action value helper request to utils
        onActionValueHelpRequest: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions icon field, else general icon field.
            tilesUtils.actionSelectOnValueHelpRequest(this, oEvent, false);
        },
        // change handler for check box
        onCheckBoxChange: function (oEvent) {
            const oView = this.getView();
            const oSemanticObjectSelector = oView.byId("navigation_semantic_objectInput");
            const oModel = oSemanticObjectSelector.getModel();
            const value = oEvent.getSource().getSelected();
            oModel.setProperty("/enabled", value);
            tilesUtils.checkInput(this.getView(), oEvent);
        },
        // forward icon value help request to utils
        onIconValueHelpRequest: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions icon field, else general icon field.
            tilesUtils.iconSelectOnValueHelpRequest(this, oEvent, false);
        },
        // forward icon close request to utils
        onSelectIconClose: function () {
            tilesUtils.onSelectIconClose(this.getView());
        },
        // forward icon ok to utils
        onSelectIconOk: function () {
            tilesUtils.onSelectIconOk(this.getView());
        },
        // This function applies table logic for the Action according to the Target Type:
        // if Taregt Type is URL, then Action field should be disabled else if it's Intent, then the Action field should be enabled.
        handleTargetTypeChange: function (oTargetTypeComboBox) {
            tilesUtils.onTargetTypeChange(oTargetTypeComboBox);
        },
        // forward tile actions semantic object value helper request to utils
        onTileActionValueHelp: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions icon field, else general icon field.
            tilesUtils.objectSelectOnValueHelpRequest(this, oEvent, true);
        },
        // forward icon value help request to utils
        onTileActionIconValueHelp: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions icon field, else general icon field.
            tilesUtils.iconSelectOnValueHelpRequest(this, oEvent, true);
        },
        // adds new row in the tile actions table
        addRow: function () {
            tilesUtils.addTileActionsRow(this.getView());
        },
        // delets row in the tile actions table
        deleteRow: function () {
            tilesUtils.deleteTileActionsRow(this.getView());
        }
    });
}, /* bExport= */ true);
