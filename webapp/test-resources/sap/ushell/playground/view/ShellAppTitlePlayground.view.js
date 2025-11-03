// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/m/Page",
    "sap/m/Panel",
    "sap/m/StandardListItem",
    "sap/m/Switch",
    "sap/ui/core/mvc/View",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/ui/shell/NavigationMiniTile",
    "sap/ushell/ui/shell/ShellAppTitle",
    "sap/ushell/ui/shell/ShellNavigationMenu",
    "sap/m/library",
    "sap/ushell/state/StateManager"
], (
    Input,
    Label,
    MessageToast,
    Page,
    Panel,
    StandardListItem,
    Switch,
    View,
    SimpleForm,
    JSONModel,
    Config,
    NavigationMiniTile,
    ShellAppTitle,
    ShellNavigationMenu,
    mLibrary,
    StateManager
) => {
    "use strict";

    // shortcut for sap.m.InputType
    const InputType = mLibrary.InputType;

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    return View.extend("sap.ushell.playground.view.ShellAppTitlePlayground", {
        getControllerName: function () {
            return "sap.ushell.playground.controller.ShellAppTitlePlayground";
        },

        createContent: function (oController) {
            const oPage = this._createPage();
            return oPage;
        },

        _createPage: function () {
            let oAllMyAppsView;
            const oData = {
                visible: true,
                navMenuVis: true,
                shellAppTitleText: "Shell App Title Text",
                shellAppTitletooltip: "Shell App Title tooltip",
                title: "Shell App Title",
                ShellAppTitleState: "",
                icon: "sap-icon://world",
                showTitle: false,
                showRelatedApps: true
            };

            StateManager.switchState(LaunchpadState.App);

            const oModel = new JSONModel(oData);
            this.setModel(oModel);

            const oVisibleSwitch = new Switch({
                state: true,
                change: function (oEvent) {
                    oData.visible = this.getState();
                    oModel.checkUpdate();
                }
            });

            const oVisibleLabel = new Label({
                text: "Shell App Title Visible",
                labelFor: oVisibleSwitch
            });

            const oShellAppTitleTextInput = new Input({
                type: InputType.Text,
                placeholder: "Enter a shell app title ..."
            });
            oShellAppTitleTextInput.bindValue("/shellAppTitleText");

            const oShellAppTitleTextLabel = new Label({
                text: "Shell App Title Text",
                labelFor: oShellAppTitleTextInput
            });

            const oShellAppTitleTooltipTextInput = new Input({
                type: InputType.Text,
                placeholder: "Enter a shell app title tooltip ..."
            });
            oShellAppTitleTooltipTextInput.bindValue("/shellAppTitletooltip");

            const oShellAppTitleTooltipLabel = new Label({
                text: "Shell App Title Tooltip Text",
                labelFor: oShellAppTitleTooltipTextInput
            });

            const oShellNavigationMenu = new ShellNavigationMenu({
                title: "{/title}",
                icon: "{/icon}",
                showRelatedApps: "{/showRelatedApps}",
                visible: "{/navMenuVis}",
                items: [
                    new StandardListItem({
                        icon: "sap-icon://navigation-right-arrow",
                        title: "Navigation Item 1"
                    }),
                    new StandardListItem({
                        icon: "sap-icon://navigation-right-arrow",
                        title: "Navigation Item 2"
                    })
                ],
                miniTiles: [
                    new NavigationMiniTile({
                        title: "Hello",
                        subtitle: "Foo",
                        icon: "sap-icon://navigation-right-arrow",
                        intent: "Go-Anywhere"
                    })
                ]
            });

            const oShellAppTitle = new ShellAppTitle({
                text: "{/shellAppTitleText}",
                tooltip: "{/shellAppTitletooltip}",
                visible: "{/visible}",
                press: function () {
                    MessageToast.show("Shell App Title has been pressed");
                },
                textChanged: function () {
                    MessageToast.show("Shell App Title text has been changed");
                }
            });

            const oShellNavigationMenuVisibleSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    if (this.getState()) {
                        oShellAppTitle.setNavigationMenu(oShellNavigationMenu);
                    } else {
                        oShellAppTitle.setNavigationMenu(null);
                    }
                }
            });

            const oShellAppTitleNavMenuLabel = new Label({
                text: "Shell App Title Navigation Menu",
                labelFor: oShellNavigationMenuVisibleSwitch
            });

            const oAllMyAppsSwitch = new Switch({
                state: false,
                change: function (oEvent) {
                    if (this.getState()) {
                        oShellAppTitle.setAllMyApps(oAllMyAppsView);
                    } else {
                        oShellAppTitle.setAllMyApps(null);
                    }
                }
            });

            const oAllMyAppsLabel = new Label({
                text: "Shell App Title All My Apps View",
                labelFor: oAllMyAppsSwitch
            });

            View.create({
                type: "XML",
                id: "allMyAppsView",
                viewName: "sap.ushell.renderer.allMyApps.AllMyApps"
            }).then((allMyAppsView) => {
                oAllMyAppsView = allMyAppsView;

                /*
                oAllMyAppsView.getController = function () {
                    return {};
                };
                */
            });

            const oEditableSimpleForm = new SimpleForm({
                layout: "ColumnLayout",
                maxContainerCols: 2,
                editable: true,
                title: "Modify Shell App Title",
                content: [
                    oVisibleLabel,
                    oVisibleSwitch,
                    oShellAppTitleTextLabel,
                    oShellAppTitleTextInput,
                    oShellAppTitleTooltipLabel,
                    oShellAppTitleTooltipTextInput,
                    oShellAppTitleNavMenuLabel,
                    oShellNavigationMenuVisibleSwitch,
                    oAllMyAppsLabel,
                    oAllMyAppsSwitch
                ]
            });

            const oControlPanel = new Panel({
                backgroundDesign: "Solid",
                content: oShellAppTitle,
                height: "400px"
            });

            const oPage = new Page("shellAppTitlePage", {
                title: "Shell App Title Demo",
                content: [oControlPanel, oEditableSimpleForm]
            }).setModel(oModel);

            oShellAppTitle.addEventDelegate({
                onAfterRendering: function () {
                    const oDomRef = oShellAppTitle.getDomRef();
                    if (oDomRef) {
                        oDomRef.style.backgroundColor = "#354a5f";
                    }
                }
            }, oShellAppTitle);

            return oPage;
        }
    });
});
