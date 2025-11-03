// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/Page",
    "sap/m/Panel",
    "sap/m/Select",
    "sap/m/Switch",
    "sap/m/MessageToast",
    "sap/ui/core/Item",
    "sap/ui/core/mvc/View",
    "sap/ui/layout/Grid",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/shell/ToolAreaItem",
    "sap/m/library"
], (
    Input,
    Label,
    Page,
    Panel,
    Select,
    Switch,
    MessageToast,
    Item,
    View,
    Grid,
    SimpleForm,
    JSONModel,
    ToolAreaItem,
    mLibrary
) => {
    "use strict";

    // shortcut for sap.m.InputType
    const InputType = mLibrary.InputType;

    return View.extend("sap.ushell.playground.view.ToolAreaItemPlayground", {
        createContent: function (oController) {
            const oPage = this._createPage();
            return oPage;
        },

        _createPage: function () {
            const oData = {
                icon: "sap-icon://world",
                selected: false,
                text: "Tool Area Item",
                visible: false,
                expandable: false
            };

            const oModel = new JSONModel(oData);

            const oToolAreaItem = new ToolAreaItem({
                icon: "{/icon}",
                selected: "{/selected}",
                text: "{/text}",
                visible: "{/visible}",
                expandable: "{/expandable}"
            });

            const oGrid = new Grid({
                defaultSpan: "XL4 L4 M6 S12",
                content: [oToolAreaItem]
            });

            const oIconSelect = new Select("tool-area-item-icon-select", {
                items: [
                    new Item({
                        key: "sap-icon://world",
                        text: "world"
                    }),
                    new Item({
                        key: "",
                        text: "none"
                    }),
                    new Item("deleteItem", {
                        key: "sap-icon://delete",
                        text: "delete"
                    }),
                    new Item({
                        key: "sap-icon://refresh",
                        text: "refresh"
                    })
                ],
                change: function (oEvt) {
                    oData.icon = oEvt.getParameter("selectedItem").getKey();
                    oModel.checkUpdate();
                }
            });

            const oIconLabel = new Label({
                text: "Icon",
                labelFor: oIconSelect
            });

            const oTextInput = new Input({
                type: InputType.Text,
                placeholder: "Enter a Tool Area Item text ..."
            });

            const oTextLabel = new Label({
                text: "Tool Area item Title",
                labelFor: oTextInput
            });
            oTextInput.bindValue("/text");

            const oExpandableSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    oData.expandable = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oExpandableLabel = new Label({
                text: "Expandable",
                labelFor: oExpandableSwitch
            });

            const oSelectSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    oData.selected = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oSelectLabel = new Label({
                text: "Selected",
                labelFor: oSelectSwitch
            });

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

            const oPressLabel = new Label({
                text: "Press Action",
                labelFor: "press-action"
            });

            function fnPress (oEvent) {
                MessageToast.show("Tool area item is pressed");
            }

            const oPressSwitch = new Switch({
                id: "press-action",
                state: false,
                change: function (oEvent) {
                    const bState = oEvent.getParameter("state");
                    if (bState) {
                        oToolAreaItem.attachPress(fnPress);
                    } else {
                        oToolAreaItem.detachPress(fnPress);
                    }
                }
            });

            const oExpandLabel = new Label({
                text: "Expand Action",
                labelFor: "press-action"
            });

            function fnExpand (oEvent) {
                MessageToast.show("Expand tool area item");
            }

            const oExpandSwitch = new Switch({
                id: "expand-action",
                state: false,
                change: function (oEvent) {
                    const bState = oEvent.getParameter("state");
                    if (bState) {
                        oToolAreaItem.attachExpand(fnExpand);
                    } else {
                        oToolAreaItem.detachExpand(fnExpand);
                    }
                }
            });

            const oForm = new SimpleForm({
                layout: "ColumnLayout",
                title: "Modify Tool Area Item",
                editable: true,
                content: [
                    oIconLabel,
                    oIconSelect,
                    oTextLabel,
                    oTextInput,
                    oExpandableLabel,
                    oExpandableSwitch,
                    oSelectLabel,
                    oSelectSwitch,
                    oVisibleLabel,
                    oVisibleSwitch,
                    oPressLabel,
                    oPressSwitch,
                    oExpandLabel,
                    oExpandSwitch
                ]
            });

            const oControlPanel = new Panel({
                backgroundDesign: "Solid",
                content: oGrid,
                height: "400px"
            });

            const oPage = new Page("toolAreaItemPage", {
                title: "Tool Area Item Demo",
                content: [oControlPanel, oForm]
            }).setModel(oModel);

            return oPage;
        }
    });
});
