// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/test/Opa5"
], (
    Element,
    Opa5
) => {
    "use strict";

    Opa5.createPageObjects({
        onTheNotificationsPopup: {
            actions: {
                iPressAnAction: function (sGroup, iNotificationIndex, iActionIndex) {
                    return this.waitFor({
                        controlType: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
                        success: function (aLists) {
                            let oItem;
                            const aGroups = aLists[0].getItems();
                            for (let i = 0; i < aGroups.length; i++) {
                                if (aGroups[i].getBindingContext()?.getObject().key === sGroup) {
                                    oItem = aGroups[i].getItems()[iNotificationIndex];
                                    break;
                                }
                            }

                            const oMenu = oItem.getMenu()[0];
                            const oMenuEntry = oMenu?.getItems()?.[0];
                            if (oMenuEntry) {
                                oMenu.fireItemClick({ item: oMenuEntry });
                                return true;
                            }
                            return false;
                        },
                        errorMessage: `Action index ${iActionIndex} in Notification index ${iNotificationIndex} for Notification group ${sGroup} not found`
                    });
                },
                iPressRemove: function (sGroup, iNotificationIndex) {
                    return this.waitFor({
                        controlType: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
                        success: function (aLists) {
                            let oItem;
                            const aGroups = aLists[0].getItems();
                            for (let i = 0; i < aGroups.length; i++) {
                                if (aGroups[i].getBindingContext()?.getObject().key === sGroup) {
                                    oItem = aGroups[i].getItems()[iNotificationIndex];
                                    break;
                                }
                            }

                            if (oItem) {
                                oItem.fireClose({ item: oItem});
                                return true;
                            }
                            return false;
                        },
                        errorMessage: `Notification index ${iNotificationIndex} for Notification group ${sGroup} not found`
                    });
                }
            },
            assertions: {
                iShouldSeeThePopover: function () {
                    return this.waitFor({
                        id: "shellNotificationsPopover",
                        success: function (oPopover) {
                            Opa5.assert.strictEqual(oPopover.isOpen(), true, "The popover is opened");
                        },
                        errorMessage: "Notifications popover is not found"
                    });
                },
                iShouldNotSeeThePopover: function (bOpen) {
                    return this.waitFor({
                        success: function () {
                            const oPopover = Element.getElementById("shellNotificationsPopover");
                            Opa5.assert.ok(!oPopover || !oPopover.isOpen(), "The popover is not visible");
                        }
                    });
                },
                iShouldSeeTheCount: function (count) {
                    return this.waitFor({
                        id: "NotificationsCountButton",
                        matchers: function (oButton) {
                            const sCount = oButton.$().attr("data-counter-content");
                            return count ? sCount === `${count}` : !sCount;
                        },
                        success: function () {
                            Opa5.assert.ok(true, "The notifications count badge is correctly set");
                        },
                        errorMessage: "Notifications count is not set"
                    });
                },
                iShouldSeeNotifications: function (count) {
                    return this.waitFor({
                        controlType: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
                        visible: count > 0,
                        success: function (aNotificationList) {
                            let iNrOfItems = 0;
                            aNotificationList[0]?.getItems().forEach((oGroup) => {
                                iNrOfItems += oGroup.getItems().length;
                            });
                            Opa5.assert.strictEqual(iNrOfItems, count, `Expect notification groups: ${count}`);
                        },
                        errorMessage: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList were not found."
                    });
                },
                iShouldSeeNotificationsInGroup: function (sGroup, count) {
                    return this.waitFor({
                        controlType: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
                        visible: count > 0,
                        success: function (aNotificationList) {
                            let iNrOfItems = -1;
                            const aGroups = aNotificationList[0]?.getItems();
                            for (let i = 0; i < aGroups.length; i++) {
                                if (aGroups[i].getBindingContext()?.getObject().key === sGroup) {
                                    iNrOfItems = aGroups[i].getItems().length;
                                    break;
                                }
                            }
                            Opa5.assert.strictEqual(iNrOfItems, count, `Expect notification groups: ${count}`);
                        },
                        errorMessage: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList were not found."
                    });
                },
                iShouldSeeGroups: function (count) {
                    return this.waitFor({
                        controlType: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
                        visible: count > 0,
                        success: function (aNotificationList) {
                            const iNrOfItems = aNotificationList[0]?.getItems().length;
                            Opa5.assert.strictEqual(iNrOfItems, count, `Expect notification groups: ${count}`);
                        },
                        errorMessage: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList were not found."
                    });
                }
            }
        }
    });
});
