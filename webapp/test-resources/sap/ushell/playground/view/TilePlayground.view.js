// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/m/Page",
    "sap/m/Panel",
    "sap/m/Select",
    "sap/m/Switch",
    "sap/ui/core/Item",
    "sap/ui/core/mvc/View",
    "sap/ui/core/Title",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/layout/Grid",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/launchpad/Tile"
], (
    Button,
    Label,
    MessageToast,
    Page,
    Panel,
    Select,
    Switch,
    Item,
    View,
    Title,
    SimpleForm,
    Grid,
    JSONModel,
    Tile
) => {
    "use strict";

    return View.extend("sap.ushell.playground.view.TilePlayground", {
        createContent: function (oController) {
            const oPage = this._createPage();
            return oPage;
        },

        _createPage: function () {
            const oData = {
                visible: false,
                long: false,
                tileActionModeActive: false,
                target: "PlaygroundHomepage.html"
            };

            const oModel = new JSONModel(oData);

            const oVisibleSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    oData.visible = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oVisibleLabel = new Label({
                text: "Visible",
                labelFor: oVisibleSwitch
            });

            const oLongSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    oData.long = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oLongLabel = new Label({
                text: "Long",
                labelFor: oLongSwitch
            });

            const oTargetSelect = new Select("target-select", {
                items: [
                    new Item("pl-item", {
                        key: "playgroundHomepage",
                        text: "PlaygroundHomepage.html"
                    })
                ],
                selectedItem: "playgroundHomepage",
                change: function (oEvt) {
                    oData.target = oEvt.getParameter("selectedItem").getKey();
                    oModel.checkUpdate();
                }
            });

            const oTargetLabel = new Label({
                text: "Target",
                labelFor: oTargetSelect
            });

            const oTileActionModeActiveSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    oData.tileActionModeActive = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oTileActionModeActiveLabel = new Label({
                text: "Tile Action Mode Active",
                labelFor: oTileActionModeActiveSwitch
            });

            const oPinButton = new Button({
                text: "Pin Button",
                press: function () {
                    MessageToast.show("Pin button is pressed");
                }
            });

            function fnAfterRendering (oEvent) {
                MessageToast.show("Tile has been rendered");
            }

            const oTile = new Tile({
                visible: "{/visible}",
                tileActionModeActive: "{/tileActionModeActive}",
                long: "{/long}",
                target: "{/target}",
                afterRendering: fnAfterRendering
            });

            const oPinButtonSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    if (this.getState()) {
                        oTile.addPinButton(oPinButton);
                    } else {
                        oTile.removePinButton(0);
                    }
                }
            });

            const oPinButtonLabel = new Label({
                text: "Show Pin Button",
                labelFor: oPinButtonSwitch
            });

            const oTileView = new Text({
                text: "Tile View"
            });

            const oTileViewSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    if (this.getState()) {
                        oTile.addTileView(oTileView);
                    } else {
                        oTile.removeTileView(0);
                    }
                }
            });

            const oTileViewLabel = new Label({
                text: "Show Tile View",
                labelFor: oTileViewSwitch
            });

            function fnPress (oEvent) {
                MessageToast.show("Tile is pressed");
            }

            const oPressSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    const bState = oEvent.getParameter("state");
                    if (bState) {
                        oTile.attachPress(fnPress);
                    } else {
                        oTile.detachPress(fnPress);
                    }
                }
            });

            const oPressLabel = new Label({
                text: "Press Action",
                labelFor: oPressSwitch
            });

            function fnDeletePress (oEvent) {
                MessageToast.show("Delete is pressed");
            }

            const oDeletePressSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    const bState = oEvent.getParameter("state");
                    if (bState) {
                        oTile.attachDeletePress(fnDeletePress);
                    } else {
                        oTile.detachDeletePress(fnDeletePress);
                    }
                }
            });

            const oDeletePressLabel = new Label({
                text: "Delete Action",
                labelFor: oDeletePressSwitch
            });

            oTile.addEventDelegate({
                onAfterRendering: function () {
                    this.setRgba("rgba(153, 204, 255, 0.3)");
                }.bind(oTile)
            });

            const oGrid = new Grid({
                defaultSpan: "XL4 L4 M6 S12",
                content: [oTile]
            });

            const oForm = new SimpleForm({
                title: "Modify Tile",
                editable: true,
                layout: "ColumnLayout",
                content: [
                    new Title({ text: "Modify Tile" }),
                    oVisibleLabel,
                    oVisibleSwitch,
                    oLongLabel,
                    oLongSwitch,
                    oTargetLabel,
                    oTargetSelect,
                    oTileActionModeActiveLabel,
                    oTileActionModeActiveSwitch,
                    oTileViewLabel,
                    oTileViewSwitch,
                    oPinButtonLabel,
                    oPinButtonSwitch,
                    oPressLabel,
                    oPressSwitch,
                    oDeletePressLabel,
                    oDeletePressSwitch
                ]
            });

            const oControlPanel = new Panel({
                backgroundDesign: "Solid",
                content: oGrid,
                height: "400px"
            });

            const oPage = new Page("tilePage", {
                title: "Tile Demo",
                content: [oControlPanel, oForm]
            }).setModel(oModel);

            return oPage;
        }
    });
});
