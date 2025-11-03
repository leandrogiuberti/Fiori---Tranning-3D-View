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
                iNavigateBack: function () {
                    return this.waitFor({
                        controlType: "sap.ushell.ui.shell.ShellHeadItem",
                        matchers: new PropertiesMatcher({ icon: "sap-icon://nav-back" }),
                        actions: new Press()
                    });
                }
            },
            assertions: {
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
        onTheMenuBar: {
            actions: {
                iClickOnMenuEntry: function (sTitle) {
                    this.waitFor({
                        controlType: "sap.m.IconTabFilter",
                        matchers: new PropertiesMatcher({ text: sTitle }),
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, `Menu entry "${sTitle}" was clicked.`);
                        }
                    });
                },
                iOpenDropDown: function (sTitle) {
                    return this.waitFor({
                        controlType: "sap.m.IconTabFilter",
                        matchers: new PropertiesMatcher({ text: sTitle }),
                        success: function (aIconTabFilter) {
                            return this.waitFor({
                                controlType: "sap.ui.core.Icon",
                                matchers: new AncestorMatcher(aIconTabFilter[0]),
                                actions: new Press()
                            });
                        }
                    });
                }
            },
            assertions: {
                iSeeMenuEntries: function (aExpectedMenuEntries) {
                    return this.waitFor({
                        controlType: "sap.m.IconTabFilter",
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
            }
        },
        onTheDropDown: {
            actions: {
                iClickOnMenuEntry: function (sTitle) {
                    this.waitFor({
                        controlType: "sap.m.IconTabBarSelectList ",
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
