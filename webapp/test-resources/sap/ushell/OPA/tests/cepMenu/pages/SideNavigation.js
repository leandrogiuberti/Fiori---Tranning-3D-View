// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/matchers/Ancestor",
    "sap/base/util/deepEqual"
], (
    Opa5,
    Press,
    PropertiesMatcher,
    AncestorMatcher,
    deepEqual
) => {
    "use strict";

    Opa5.createPageObjects({
        onTheShellHeader: {
            actions: {
                iCollapseSideMenu: function () {
                    this.waitFor({
                        controlType: "sap.ushell.ui.shell.ShellHeadItem",
                        id: "sideMenuExpandCollapseBtn",
                        actions: new Press()
                    });
                },
                iNavigateBack: function () {
                    return this.waitFor({
                        controlType: "sap.ushell.ui.shell.ShellHeadItem",
                        matchers: new PropertiesMatcher({ icon: "sap-icon://nav-back" }),
                        actions: new Press()
                    });
                }
            },
            assertions: {
                iSeeSideNavigationToggleButton: function () {
                    return this.waitFor({
                        controlType: "sap.ushell.ui.shell.ShellHeadItem",
                        id: "sideMenuExpandCollapseBtn",
                        success: function () {
                            Opa5.assert.ok(true, "The side navigation toggle button is shown.");
                        }
                    });
                },
                iSeeApplication: function (sAppTitle) {
                    return this.waitFor({
                        controlType: "sap.ushell.ui.shell.ShellAppTitle",
                        matchers: new PropertiesMatcher({ title: sAppTitle }),
                        success: function () {
                            Opa5.assert.ok(true, `The application "${sAppTitle}" is shown.`);
                        }
                    });
                }
            }
        },
        onThePage: {
            assertions: {
                iSeePageTitle: function (sTitle) {
                    return this.waitFor({
                        controlType: "sap.ushell.ui.launchpad.Section",
                        matchers: new PropertiesMatcher({ title: sTitle }),
                        success: function () {
                            Opa5.assert.ok(true, `The page title "${sTitle}" is shown.`);
                        }
                    });
                }
            }
        },
        onTheSideNavigation: {
            actions: {
                iClickOnMenuEntry: function (sTitle) {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListItem",
                        matchers: new PropertiesMatcher({ text: sTitle }),
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, `Menu entry "${sTitle}" was clicked.`);
                        }
                    });
                },
                iOpenDropDown: function (sTitle) {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListItem",
                        matchers: new PropertiesMatcher({ text: sTitle, expanded: false }),
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, `Drop down "${sTitle}" was clicked.`);
                        }
                    });
                },
                iCloseDropDown: function (sTitle) {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListItem",
                        matchers: new PropertiesMatcher({ text: sTitle, expanded: true }),
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, `Drop down "${sTitle}" was clicked.`);
                        }
                    });
                }
            },
            assertions: {
                iSeeTheSideNavigation: function () {
                    return this.waitFor({
                        id: /sideNavigation/,
                        controlType: "sap.tnt.SideNavigation",
                        success: function () {
                            Opa5.assert.ok(true, "The side navigation is enabled.");
                        }
                    });
                },
                iSeeTheSideNavigationIsCollapsed: function () {
                    return this.waitFor({
                        id: /sideNavigation/,
                        controlType: "sap.tnt.SideNavigation",
                        check: function (oSideNavigationControl) {
                            const bSideNavigationIsCollapsed = !oSideNavigationControl[0].getExpanded();
                            return deepEqual(bSideNavigationIsCollapsed, true);
                        },
                        success: function () {
                            Opa5.assert.ok(true, "The side navigation is collapsed.");
                        }
                    });
                },
                iSeeSideNavigationOnRightSide: function () {
                    return this.waitFor({
                        id: /sideNavigation/,
                        controlType: "sap.tnt.SideNavigation",
                        success: function (oSideNavigation) {
                            const oDomRef = oSideNavigation?.[0].getDomRef();
                            const bIsOnRightSide = oDomRef && window.getComputedStyle(oDomRef).direction === "rtl";
                            Opa5.assert.ok(bIsOnRightSide, "The side navigation is rendered on the right side.");
                        }
                    });
                },
                iSeeMenuEntries: function (aExpectedMenuEntries) {
                    return this.waitFor({
                        controlType: "sap.tnt.NavigationList",
                        success: function (oNavigationList) {
                            this.waitFor({
                                controlType: "sap.tnt.NavigationListItem",
                                matchers: new AncestorMatcher(oNavigationList[0]),
                                check: function (aNavigationListItems) {
                                    const aMenuEntries = aNavigationListItems.map((oNavigationListItem) => {
                                        return oNavigationListItem.getText();
                                    });
                                    return deepEqual(aExpectedMenuEntries, aMenuEntries);
                                },
                                success: function () {
                                    Opa5.assert.ok(true, "The expected menu entries are shown.");
                                }
                            });
                        }
                    });
                },
                iSeeMenuEntrySelected: function (sTitle) {
                    return this.waitFor({
                        id: /sideNavigation/,
                        controlType: "sap.tnt.SideNavigation",
                        success: function (oSideNavigation) {
                            const sSelectedListItemKey = oSideNavigation[0].getSelectedKey();
                            this.waitFor({
                                controlType: "sap.tnt.NavigationListItem",
                                matchers: new PropertiesMatcher({ key: sSelectedListItemKey, text: sTitle }),
                                success: function () {
                                    Opa5.assert.ok(true, "The expected tree item is selected.");
                                }
                            });
                        }
                    });
                },
                iSeeIconInEntry: function (sIcon, sTitle) {
                    return this.waitFor({
                        controlType: "sap.tnt.NavigationListItem",
                        check: function (aNavigationListItems) {
                            const oEntry = aNavigationListItems.find((oNavigationListItem) => {
                                return oNavigationListItem.getText() === sTitle;
                            });
                            const sEntryIcon = oEntry.getIcon();
                            return deepEqual(sEntryIcon, sIcon);
                        },
                        success: function () {
                            Opa5.assert.ok(true, `The menu entry "${sTitle}" has the expected icon "${sIcon}".`);
                        }
                    });
                },
                iSeeUIPluginActionButton: function () {
                    return this.waitFor({
                        controlType: "sap.tnt.NavigationList",
                        id: "UIPluginActionButton",
                        success: function () {
                            Opa5.assert.ok(true, "The create action button is shown.");
                        }
                    });
                }
            }
        },
        onThePopover: {
            actions: {
                iClickOnMenuEntry: function (sTitle) {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListItem",
                        matchers: new PropertiesMatcher({ text: sTitle }),
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, `Menu entry ${sTitle} was clicked.`);
                        }
                    });
                }
            }
        }
    });
});
