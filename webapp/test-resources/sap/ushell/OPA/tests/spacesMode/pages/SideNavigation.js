// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/I18NText",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/matchers/Ancestor",
    "sap/base/util/deepEqual"
], (
    Opa5,
    I18NTextMatcher,
    Press,
    PropertiesMatcher,
    AncestorMatcher,
    deepEqual
) => {
    "use strict";

    Opa5.createPageObjects({
        onTheSideNavigation: {
            actions: {
                iClickOnAllSpaces: function () {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListItem",
                        matchers: new PropertiesMatcher({
                            text: "All Spaces"
                        }),
                        actions: new Press()
                    });
                },
                iClickOnTheBackButton: function (sText) {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        matchers: new PropertiesMatcher({
                            type: "Back"
                        }),
                        actions: new Press()
                    });
                }
            },
            assertions: {
                iSeeAllSpaces: function () {
                    this.waitFor({
                        controlType: "sap.m.Title",
                        matchers: new PropertiesMatcher({
                            text: "All Spaces"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "Found the All Spaces Section.");
                        }
                    });
                },
                iSeeTheSideNavigation: function () {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListGroup",
                        matchers: new PropertiesMatcher({
                            text: "My Spaces"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "Found the SideNavigation.");
                        }
                    });
                },
                iSeeMenuEntries: function (aExpectedMenuEntries) {
                    this.waitFor({
                        controlType: "sap.tnt.NavigationListGroup",
                        matchers: new PropertiesMatcher({ text: "My Spaces" }),
                        success: function (oNavigationListGroup) {
                            return this.waitFor({
                                controlType: "sap.tnt.NavigationListItem",
                                matchers: new AncestorMatcher(oNavigationListGroup[0]),
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
                }
            }
        }
    });
});
