// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/m/Select",
    "sap/m/Switch",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/tile/TileBase",
    "sap/ui/core/Item",
    "sap/m/library",
    "sap/ui/layout/Grid",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/Panel",
    "sap/m/Page"
], (
    Input,
    Label,
    MessageToast,
    Select,
    Switch,
    View,
    JSONModel,
    TileBase,
    Item,
    mobileLibrary,
    Grid,
    SimpleForm,
    Panel,
    Page
) => {
    "use strict";

    // shortcut for sap.m.InputType
    const InputType = mobileLibrary.InputType;

    return View.extend("sap.ushell.playground.view.TileBasePlayground", {
        createContent: function (oController) {
            const oPage = this._createPage();
            return oPage;
        },

        _createPage: function () {
            const oData = {
                title: "title",
                subtitle: "subtitle",
                icon: "sap-icon://world",
                info: "Tile Base Info",
                highlightTerms: "highlightTerms"
            };

            const oModel = new JSONModel(oData);

            const oTileBase = new TileBase({
                title: "{/title}",
                subtitle: "{/subtitle}",
                icon: "{/icon}",
                info: "{/info}",
                highlightTerms: "{/highlightTerms}"
            });

            function fnPress (oEvent) {
                MessageToast.show("Tile Base is pressed");
            }

            const oPressSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    const bState = oEvent.getParameter("state");
                    if (bState) {
                        oTileBase.attachPress(fnPress);
                    } else {
                        oTileBase.detachPress(fnPress);
                    }
                }
            });

            const oPressLabel = new Label({
                text: "Press Action",
                labelFor: oPressSwitch
            });

            const oIconSelect = new Select("tile-base-icon-select", {
                items: [
                    new Item("world-item", {
                        key: "sap-icon://world",
                        text: "world"
                    }),
                    new Item({
                        key: "",
                        text: "none"
                    }),
                    new Item({
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

            const oTitleInput = new Input({
                type: InputType.Text,
                placeholder: "Enter tile base title ..."
            });
            oTitleInput.bindValue("/title");

            const oTitleLabel = new Label({
                text: "Tile Base Title",
                labelFor: oTitleInput
            });

            const oSubtitleInput = new Input({
                type: InputType.Text,
                placeholder: "Enter tile base subtitle ..."
            });
            oSubtitleInput.bindValue("/subtitle");

            const oSubtitleLabel = new Label({
                text: "Tile Base Subitle",
                labelFor: oSubtitleInput
            });

            const oInfoInput = new Input({
                type: InputType.Text,
                placeholder: "Enter tile base info ..."
            });
            oInfoInput.bindValue("/info");

            const oInfoLabel = new Label({
                text: "Tile Base Info",
                labelFor: oInfoInput
            });

            const oHighlightTermsInput = new Input({
                type: InputType.Text,
                placeholder: "Enter highlight terms ..."
            });
            oHighlightTermsInput.bindValue("/highlightTerms");

            const oHighlightTermsLabel = new Label({
                text: "Tile Highlight Terms",
                labelFor: oHighlightTermsInput
            });

            const oGrid = new Grid({
                defaultSpan: "XL4 L4 M6 S12",
                content: [oTileBase]
            });

            const oForm = new SimpleForm({
                layout: "ColumnLayout",
                title: "Modify Tile Base",
                editable: true,
                content: [
                    oIconLabel,
                    oIconSelect,
                    oTitleLabel,
                    oTitleInput,
                    oSubtitleLabel,
                    oSubtitleInput,
                    oInfoLabel,
                    oInfoInput,
                    oPressLabel,
                    oPressSwitch,
                    oHighlightTermsLabel,
                    oHighlightTermsInput
                ]
            });

            const oControlPanel = new Panel({
                backgroundDesign: "Solid",
                content: oGrid,
                height: "400px"
            });

            const oPage = new Page("tileBasePage", {
                title: "Tile Base Demo",
                content: [oControlPanel, oForm]
            }).setModel(oModel);

            return oPage;
        }
    });
});
