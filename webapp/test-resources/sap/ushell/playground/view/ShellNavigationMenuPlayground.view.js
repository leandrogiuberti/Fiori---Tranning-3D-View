// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ushell/ui/shell/ShellNavigationMenu",
    "sap/ushell/ui/shell/NavigationMiniTile",
    "sap/m/StandardListItem",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/m/Input",
    "sap/ui/model/type/String",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Switch",
    "sap/ui/model/type/Boolean",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/layout/Grid",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/Panel",
    "sap/m/Page"
], (
    View,
    ShellNavigationMenu,
    NavigationMiniTile,
    StandardListItem,
    JSONModel,
    Label,
    Input,
    TypeString,
    Select,
    Item,
    Switch,
    TypeBoolean,
    Button,
    mobileLibrary,
    Grid,
    SimpleForm,
    Panel,
    Page
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.ListType
    const ListType = mobileLibrary.ListType;

    return View.extend("sap.ushell.playground.view.ShellNavigationMenuPlayground", {
        createContent: function () {
            const oPage = this._createPage();
            return oPage;
        },

        _createPage: function () {
            const oData = {
                title: "",
                icon: "",
                showTitle: false,
                showRelatedApps: true,
                itemcount: 0,
                itemIcon: "sap-icon://home",
                itemText: "Home",
                miniTileCount: 0,
                miniTileHeader: "Related App 1",
                tileIcon: "sap-icon://documents"
            };

            const oModel = new JSONModel(oData);

            function checkAggregationUpdate () {
                const tmp = oData.title;
                oData.title = `${oData.title}something`;
                oModel.checkUpdate();

                oData.title = tmp;
                oModel.checkUpdate();
            }

            function addShellNavigaionMenuControls (oForm) {
                oForm.addContent(new Label({
                    text: "Title"
                }));

                oForm.addContent(new Input({
                    placeholder: "Enter title ...",
                    value: {
                        path: "/title",
                        type: new TypeString()
                    },
                    liveChange: function (oEvt) {
                        oModel.checkUpdate();
                    }
                }));

                oForm.addContent(new Label({
                    text: "Icon"
                }));

                oForm.addContent(new Select("navigation-menu-icon-select", {
                    items: [
                        new Item({
                            key: "",
                            text: "none"
                        }),
                        new Item({
                            key: "sap-icon://world",
                            text: "world"
                        }),
                        new Item({
                            key: "sap-icon://customer-financial-fact-sheet",
                            text: "customer-financial-fact-sheet"
                        }),
                        new Item({
                            key: "sap-icon://delete",
                            text: "delete"
                        }),
                        new Item({
                            key: "sap-icon://refresh",
                            text: "refresh"
                        }),
                        new Item({
                            key: "sap-icon://email",
                            text: "email"
                        }),
                        new Item({
                            key: "sap-icon://hide",
                            text: "hide"
                        }),
                        new Item("SNV-home-icon", {
                            key: "sap-icon://home",
                            text: "home"
                        }),
                        new Item({
                            key: "sap-icon://documents",
                            text: "documents"
                        }),
                        new Item({
                            key: "sap-icon://copy",
                            text: "copy"
                        })
                    ],
                    change: function (oEvt) {
                        oData.icon = oEvt.getParameter("selectedItem").getKey();
                        oModel.checkUpdate();
                    }
                }));

                oForm.addContent(new Label({
                    text: "Show title"
                }));

                oForm.addContent(new Switch("showTitleSwitch", {
                    state: {
                        path: "/showTitle",
                        type: new TypeBoolean()
                    }
                }));

                oForm.addContent(new Label({
                    text: "Show related apps"
                }));

                oForm.addContent(new Switch("showRelatedApps", {
                    state: {
                        path: "/showRelatedApps",
                        type: new TypeBoolean()
                    }
                }));
            }

            const oShellNavigationMenu = new ShellNavigationMenu({
                title: "{/title}",
                icon: "{/icon}",
                showTitle: "{/showTitle}",
                showRelatedApps: "{/showRelatedApps}",
                visible: true
            });

            function addListItemControls (oForm) {
                oForm.addContent(new Label({
                    text: "List-Item Text"
                }));

                oForm.addContent(new Input({
                    placeholder: "Enter text ...",
                    value: {
                        path: "/itemText",
                        type: new TypeString()
                    },
                    liveChange: function (oEvt) {
                        oModel.checkUpdate();
                    }
                }));

                oForm.addContent(new Label({
                    text: "List-Item Icon"
                }));

                oForm.addContent(new Select("navigation-menu-item-select", {
                    items: [
                        new Item({
                            key: "",
                            text: "none"
                        }),
                        new Item({
                            key: "sap-icon://world",
                            text: "world"
                        }),
                        new Item({
                            key: "sap-icon://customer-financial-fact-sheet",
                            text: "customer-financial-fact-sheet"
                        }),
                        new Item({
                            key: "sap-icon://delete",
                            text: "delete"
                        }),
                        new Item({
                            key: "sap-icon://refresh",
                            text: "refresh"
                        }),
                        new Item({
                            key: "sap-icon://email",
                            text: "email"
                        }),
                        new Item({
                            key: "sap-icon://hide",
                            text: "hide"
                        }),
                        new Item("SNM-std-list-icon", {
                            key: "sap-icon://home",
                            text: "home"
                        }),
                        new Item({
                            key: "sap-icon://documents",
                            text: "documents"
                        }),
                        new Item({
                            key: "sap-icon://copy",
                            text: "copy"
                        })
                    ],
                    selectedItem: "SNM-std-list-icon",
                    change: function (oEvt) {
                        oData.itemIcon = oEvt.getParameter("selectedItem").getKey();
                        oModel.checkUpdate();
                    }
                }));

                oForm.addContent(new Label({
                    text: "Add or Remove a Item"
                }));

                oForm.addContent(new Button({
                    text: "Add Item",
                    press: function (oEvt) {
                        oData.itemcount++;
                        oShellNavigationMenu.addItem(new StandardListItem({
                            type: ListType.Inactive, // "Active",
                            title: oData.itemText,
                            icon: oData.itemIcon
                        })).addStyleClass("sapUshellNavigationMenuListItems");
                        checkAggregationUpdate();
                    }
                }));

                oForm.addContent(new Button({
                    text: "Remove Item",
                    type: ButtonType.Reject,
                    press: function (oEvt) {
                        if (oData.itemcount > 0) {
                            oData.itemcount--;
                        } else {
                            oData.itemcount = 0;
                        }
                        oShellNavigationMenu.removeItem(oData.itemcount);
                        checkAggregationUpdate();
                    }
                }));
            }

            function addMiniTileControls (oForm) {
                oForm.addContent(new Label({
                    text: "Mini-Tile Header"
                }));

                oForm.addContent(new Input({
                    placeholder: "Enter mini-tile header ...",
                    value: {
                        path: "/miniTileHeader",
                        type: new TypeString()
                    },
                    liveChange: function (oEvt) {
                        oModel.checkUpdate();
                    }
                }));

                oForm.addContent(new Label({
                    text: "Mini-Tile Icon"
                }));

                oForm.addContent(new Select("navigation-menu-mini-tile-icon-select", {
                    items: [
                        new Item({
                            key: "",
                            text: "none"
                        }),
                        new Item({
                            key: "sap-icon://world",
                            text: "world"
                        }),
                        new Item({
                            key: "sap-icon://customer-financial-fact-sheet",
                            text: "customer-financial-fact-sheet"
                        }),
                        new Item({
                            key: "sap-icon://delete",
                            text: "delete"
                        }),
                        new Item({
                            key: "sap-icon://refresh",
                            text: "refresh"
                        }),
                        new Item({
                            key: "sap-icon://email",
                            text: "email"
                        }),
                        new Item({
                            key: "sap-icon://hide",
                            text: "hide"
                        }),
                        new Item({
                            key: "sap-icon://home",
                            text: "home"
                        }),
                        new Item("SNV-std-mt-icon", {
                            key: "sap-icon://documents",
                            text: "documents"
                        }),
                        new Item({
                            key: "sap-icon://copy",
                            text: "copy"
                        })
                    ],
                    selectedItem: "SNV-std-mt-icon",
                    change: function (oEvt) {
                        oData.tileIcon = oEvt.getParameter("selectedItem").getKey();
                        oModel.checkUpdate();
                    }
                }));

                oForm.addContent(new Label({
                    text: "Add or Remove a Mini-Tile"
                }));

                oForm.addContent(new Button({
                    text: "Add Mini-Tile",
                    press: function (oEvt) {
                        oData.miniTileCount++;
                        oShellNavigationMenu.addMiniTile(new NavigationMiniTile({
                            title: oData.miniTileHeader,
                            icon: oData.tileIcon
                        }));
                        checkAggregationUpdate();
                    }
                }));

                oForm.addContent(new Button({
                    text: "Remove Mini-Tile",
                    type: ButtonType.Reject,
                    press: function (oEvt) {
                        if (oData.miniTileCount > 0) {
                            oData.miniTileCount -= 1;
                        } else {
                            oData.miniTileCount = 0;
                        }
                        oShellNavigationMenu.removeMiniTile(oData.miniTileCount);
                        checkAggregationUpdate();
                    }
                }));
            }

            oShellNavigationMenu._createItemsList();
            oShellNavigationMenu._createMiniTilesBox();
            oShellNavigationMenu._beforeOpen();
            oShellNavigationMenu._afterOpen();
            oShellNavigationMenu._extendInnerControlsForAccKeyboard();
            oShellNavigationMenu.onAfterRendering();

            const oGrid = new Grid({
                width: "1100px",
                content: [oShellNavigationMenu]
            });

            const oForm = new SimpleForm({
                layout: "ColumnLayout",
                editable: true,
                title: "Modify Shell Navigation Menu"
            });

            addShellNavigaionMenuControls(oForm);
            addListItemControls(oForm);
            addMiniTileControls(oForm);

            const oControlPanel = new Panel({
                backgroundDesign: "Solid",
                content: oGrid,
                height: "400px"
            });

            const oPage = new Page("shellNavigationMenuPage", {
                title: "Shell Navigation Menu Demo",
                content: [oControlPanel, oForm]
            }).setModel(oModel);

            return oPage;
        }
    });
});
