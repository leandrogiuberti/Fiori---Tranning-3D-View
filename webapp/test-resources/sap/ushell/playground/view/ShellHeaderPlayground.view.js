// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/m/Page",
    "sap/m/Panel",
    "sap/m/Select",
    "sap/m/Switch",
    "sap/ui/core/Item",
    "sap/ui/core/mvc/View",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/ShellHeader",
    "sap/ushell/ui/shell/ShellAppTitle",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/m/library"
], (
    Button,
    Input,
    Label,
    MessageToast,
    Page,
    Panel,
    Select,
    Switch,
    Item,
    View,
    SimpleForm,
    JSONModel,
    ShellHeader,
    ShellAppTitle,
    ShellHeadItem,
    mLibrary
) => {
    "use strict";

    // shortcut for sap.m.InputType
    const InputType = mLibrary.InputType;

    // shortcut for sap.m.ButtonType
    const ButtonType = mLibrary.ButtonType;

    return View.extend("sap.ushell.playground.view.ShellHeaderPlayground", {
        getControllerName: function () {
            return "sap.ushell.playground.controller.ShellHeaderPlayground";
        },

        createContent: function () {
            const oPage = this._createPage();
            return oPage;
        },
        _createPage: function () {
            const sSapLogo = "../../../../resources/sap/ushell/themes/base/img/SAPLogo.svg";

            const oData = {
                currentState: "",
                visible: true,
                logo: sSapLogo,
                title: "foo"
            };

            const oModel = new JSONModel(oData);

            const oShellHeader = new ShellHeader({
                visible: "{/visible}",
                logo: "{/logo}",
                title: "{/title}"
            });

            const oShellHeaderSwitch = new Switch({
                state: true,
                change: function (oEvent) {
                    oData.visible = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oShellHeaderVsbLabel = new Label({
                text: "Header visible",
                labelFor: oShellHeaderSwitch
            });

            const oLogoSelect = new Select("shell-header-icon-select", {
                change: function (oEvent) {
                    oData.logo = oEvent.getParameter("selectedItem").getKey();
                    oModel.checkUpdate();
                },
                items: [
                    new Item("Logo-0-SH", {
                        key: "",
                        text: "No Logo"
                    }),
                    new Item("Logo-1-SH", {
                        key: sSapLogo,
                        text: "SAP"
                    })
                ],
                selectedItem: "Logo-1-SH"
            });

            const oLogoLabel = new Label({
                text: "Logo",
                labelFor: oLogoSelect
            });

            const oHeadItemAddBtn = new Button({
                text: "Add",
                press: function () {
                    const oShellHeadItem = new ShellHeadItem({
                        tooltip: "Shell Head Item",
                        icon: "sap-icon://activity-items",
                        press: function () {
                            MessageToast.show("Shell Head Item");
                        }
                    });

                    oShellHeader.addHeadItem(oShellHeadItem);
                }
            });

            const oHeadItemLabel = new Label({
                text: "Head Item",
                labelFor: oHeadItemAddBtn
            });

            const oHeadItemRemoveBtn = new Button("HI-RM-BTN", {
                text: "Remove",
                type: ButtonType.Reject,
                press: function () {
                    oShellHeader.removeHeadItem(oShellHeader.getHeadItems().length - 1);
                }
            });

            const oHeadEndItemAddBtn = new Button({
                text: "Add",
                press: function () {
                    const oShellEndHeadItem = new ShellHeadItem({
                        tooltip: "Shell Head End Item",
                        icon: "sap-icon://activity-items",
                        press: function () {
                            MessageToast.show("Shell Head End Item");
                        }
                    });
                    oShellHeader.addHeadEndItem(oShellEndHeadItem);
                }
            });

            const oHeadEndItemLabel = new Label({
                text: "Head End Item",
                labelFor: oHeadEndItemAddBtn
            });

            const oHeadEndItemRemoveBtn = new Button("HEI-RM-BTN", {
                text: "Remove",
                type: ButtonType.Reject,
                press: function () {
                    oShellHeader.removeHeadEndItem(oShellHeader.getHeadEndItems().length - 1);
                }
            });

            const oTitleText = new Input({
                type: InputType.Text,
                placeholder: "Enter a shell title ...",
                change: function (oEvent) {
                    oShellHeader.setTitle(oTitleText.getValue());
                }
            });
            oTitleText.bindValue("/title");

            const oTitleLabel = new Label({
                text: "Title",
                labelFor: oTitleText
            });

            const oShellAppTitle = new ShellAppTitle({
                text: "{/shellAppTitle}",
                tooltip: "shell app title",
                press: function () {
                    MessageToast.show("Shell App Title");
                }
            });

            const oShellAppTitleText = new Input({
                type: InputType.Text,
                placeholder: "Enter a shell app title ...",
                change: function (oEvent) {
                    if (!oShellAppTitleText.getValue() === "") {
                        oShellHeader.setAggregation("appTitle");
                        oShellHeader.setAppTitle(oShellAppTitle);
                    } else {
                        oShellHeader.setAggregation("appTitle");
                    }
                }
            });
            oShellAppTitleText.bindValue("/shellAppTitle");

            const oShellAppTitleLabel = new Label({
                text: "Shell App Title",
                labelFor: oShellAppTitleText
            });

            const oEditableSimpleForm = new SimpleForm({
                layout: "ColumnLayout",
                editable: true,
                title: "Modify Shell Header",
                content: [
                    oShellHeaderVsbLabel,
                    oShellHeaderSwitch,
                    oLogoLabel,
                    oLogoSelect,
                    oHeadItemLabel,
                    oHeadItemAddBtn,
                    oHeadItemRemoveBtn,
                    oHeadEndItemLabel,
                    oHeadEndItemAddBtn,
                    oHeadEndItemRemoveBtn,
                    oTitleLabel,
                    oTitleText,
                    oShellAppTitleLabel,
                    oShellAppTitleText
                ]
            });

            const oControlPanel = new Panel({
                backgroundDesign: "Solid",
                content: oShellHeader,
                height: "400px"
            });

            const oPage = new Page("shellHeaderPage", {
                title: "Shell Header Demo",
                backgroundDesign: "Solid",
                content: [oControlPanel, oEditableSimpleForm]
            });

            oPage.setModel(oModel);

            oShellHeader.addEventDelegate({
                onAfterRendering: function () {
                    // The Shell Header hides itself because of internal checks
                    const oDomRef = oShellHeader.getDomRef();
                    if (oDomRef) {
                        oDomRef.style.visibility = "visible";
                    }
                }
            }, oShellHeader);
            return oPage;
        }
    });
});
