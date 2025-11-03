// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.homepage.DashboardContent
 *
 * @deprecated since 1.112
 */
sap.ui.define([
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/homepage/DashboardUIActions"
], (
    Device,
    jQuery,
    DashboardUIActions
) => {
    "use strict";

    /* global QUnit, sinon */

    let oModelData;
    let oController;
    let dashboardGroupsUIActions;
    let oDashboardGroupsUIActionsModule;
    let shellDomElement;

    QUnit.module("sap.ushell.components.flp.Component", {
        beforeEach: function () {
            sap.ushell.Container = {};
            sap.ushell.Container.getServiceAsync = function () {
                return Promise.resolve({
                    isLinkPersonalizationSupported: function () {
                        return false;
                    }
                });
            };
            const TestableDashboardUIActions = DashboardUIActions.extend("TestableDashboardUIActions", {
                metadata: {
                    publicMethods: [
                        "initializeUIActions",
                        "_handleGroupMoved",
                        "_setController",
                        "_handleGroupsUIStart",
                        "_handleGroupStartDrag",
                        "_handleGroupStartDrag",
                        "_handleGroupUIStart",
                        "_enableGroupsUIActions",
                        "_handleGroupsUIStart"
                    ]
                }
            });
            oModelData = {
                getProperty: function (sProperty) {
                    if (sProperty === "/personalization") {
                        return true;
                    }
                },
                setProperty: sinon.spy()
            };
            oController = {
                _publishAsync: sinon.spy(),
                getView: function () {
                    return {
                        isTouch: false,
                        sDashboardGroupsWrapperId: "",
                        oDashboardGroupsBox: {
                            getGroups: function () {
                                return {
                                    length: 5
                                };
                            }
                        },
                        getModel: function () {
                            return oModelData;
                        }
                    };
                }
            };

            dashboardGroupsUIActions = new TestableDashboardUIActions();
            oDashboardGroupsUIActionsModule = new DashboardUIActions();

            shellDomElement = document.createElement("div");
            shellDomElement.id = "mainShell";
            jQuery("body").append(shellDomElement);
        },
        afterEach: function () {
            dashboardGroupsUIActions.destroy();
            oController = undefined;
            oModelData = undefined;
            delete sap.ushell.Container;
            jQuery("#mainShell").remove();
        }
    });

    QUnit.test("Test handleActionModeGroupMove", function (assert) {
        const fnDone = assert.async();
        const divElement1 = document.createElement("div");

        divElement1.id += "dashboardGroups";
        jQuery("body").append(divElement1);
        oDashboardGroupsUIActionsModule.initializeUIActions(oController);
        const ui = {
            item: {
                index: function () {
                    return 1;
                },
                startPos: 0
            }
        };

        oDashboardGroupsUIActionsModule._handleGroupMoved(null, ui);

        setTimeout(() => {
            assert.ok(oController._publishAsync.calledOnce, "_publishAsync is called once");
            assert.ok(oModelData.setProperty.calledOnce === true, "Model setProperty.calledOnce");
            assert.ok(oModelData.setProperty.args[0][0] === "/isInDrag", "Settign property isInDrag");
            assert.ok(oModelData.setProperty.args[0][1] === false, "property isInDrag set to false");
            fnDone();
        }, 200);
    });

    QUnit.test("test handleActionModeStartDrag in case system.phone = false", function (assert) {
        const fnDone = assert.async();
        const fSortableStartListener = sinon.spy();

        sap.ui.getCore().getEventBus().subscribe("launchpad", "sortableStart", fSortableStartListener);
        const bPhone = Device.system.phone;

        // Make sure that the Model's setProperty function gets a new sinon.spy since it "remembers" the previous calls
        oController.getView().getModel().setProperty = sinon.spy();

        const divElement1 = document.createElement("div");
        const divElement2 = document.createElement("div");
        const divElement3 = document.createElement("div");
        const divElement4 = document.createElement("div");
        divElement1.className += "sapUshellDashboardGroupsContainerItem-clone";
        divElement2.className += "sapUshellTileContainerEditMode";
        divElement3.className += "sapUshellTileContainerBeforeContent";
        divElement4.className += "sapUshellDashboardGroupsContainerItem-placeholder ";
        divElement4.className += "sapUshellDashboardGroupsContainerItem-clone ";
        divElement4.className += "sapUshellDashboardView section";

        divElement1.id += "dashboardGroups";

        jQuery("body").append(divElement1);
        jQuery("body").append(divElement3);
        jQuery("body").append(divElement4);
        jQuery(".sapUshellDashboardGroupsContainerItem-clone").append(divElement2);

        oDashboardGroupsUIActionsModule.initializeUIActions(oController);
        setTimeout(() => {
            oDashboardGroupsUIActionsModule._handleGroupStartDrag();
        }, 100);

        setTimeout(() => {
            assert.ok(jQuery(".sapUshellTileContainerBeforeContent").hasClass("sapUshellTileContainerHidden"),
                "class sapUshellTileContainerHidden was added to element with class sapUshellTileContainerBeforeContent");
            assert.ok(oController.getView().getModel().setProperty.calledOnce === true, "Model setProperty.calledOnce");
            assert.ok(oController.getView().getModel().setProperty.args[0][0] === "/isInDrag", "Settign property isInDrag");
            assert.ok(oController.getView().getModel().setProperty.args[0][1] === true, "property isInDrag set to true");
            assert.ok(fSortableStartListener.calledOnce, "sortableStart event is published");

            Device.system.phone = bPhone;
            jQuery("sapUshellDashboardGroupsContainerItem-clone").remove();
            jQuery(".sapUshellTileContainerEditMode").remove();
            jQuery(".sapUshellTileContainerBeforeContent").remove();
            jQuery(".sapUshellDashboardGroupsContainerItem-placeholder ").remove();
            fnDone();
        }, 200);
    });

    QUnit.test("test handleActionModeStartDrag in case system.phone = true", function (assert) {
        const fnDone = assert.async();
        const fSortableStartListener = sinon.spy();

        sap.ui.getCore().getEventBus().subscribe("launchpad", "sortableStart", fSortableStartListener);

        const bPhone = Device.system.phone;
        Device.system.phone = true;
        const divElement1 = document.createElement("div");
        const divElement2 = document.createElement("div");
        const divElement3 = document.createElement("div");
        const divElement4 = document.createElement("div");
        const divElement5 = document.createElement("div");

        divElement1.className += "sapUshellTilesContainer-sortable ";
        divElement2.className += "sapUshellLineModeContainer ";
        divElement3.className += "sapUshellTileContainerBeforeContent ";
        divElement4.className += "sapUshellContainerHeaderActions ";
        divElement5.className += "sapUshellTileContainerAfterContent ";
        divElement5.className += "sapUshellDashboardGroupsContainerItem-placeholder ";
        divElement5.className += "sapUshellDashboardGroupsContainerItem-clone ";
        divElement5.className += "sapUshellDashboardView section";
        divElement5.id += "dashboardGroups";

        jQuery("body").append(divElement1);
        jQuery("body").append(divElement2);
        jQuery("body").append(divElement3);
        jQuery("body").append(divElement4);
        jQuery("body").append(divElement5);

        oDashboardGroupsUIActionsModule.initializeUIActions(oController);

        oDashboardGroupsUIActionsModule.initializeUIActions(oController);
        setTimeout(() => {
            oDashboardGroupsUIActionsModule._handleGroupStartDrag();
        }, 100);
        setTimeout(() => {
            // check that correct classes were added
            assert.ok(jQuery(".sapUshellTilesContainer-sortable").hasClass("sapUshellTileContainerRemoveContent"),
                "class sapUshellTilesContainer-sortable was added to element with class sapUshellTilesContainer-sortable");
            assert.ok(jQuery(".sapUshellLineModeContainer").hasClass("sapUshellTileContainerRemoveContent"),
                "class sapUshellLineModeContainer was added to element with class sapUshellLineModeContainer");
            assert.ok(jQuery(".sapUshellTileContainerBeforeContent").hasClass("sapUshellTileContainerRemoveContent"),
                "class sapUshellTileContainerBeforeContent was added to element with class sapUshellTileContainerBeforeContent");
            assert.ok(jQuery(".sapUshellContainerHeaderActions").hasClass("sapUshellTileContainerHidden"),
                "class sapUshellContainerHeaderActions was added to element with class sapUshellContainerHeaderActions");

            assert.ok(oController.getView().getModel().setProperty.args[0][0] === "/isInDrag", "Settign property isInDrag");
            assert.ok(oController.getView().getModel().setProperty.args[0][1] === true, "property isInDrag set to true");
            assert.ok(fSortableStartListener.calledOnce, "sortableStart event is published");

            Device.system.phone = bPhone;

            jQuery(".sapUshellTilesContainer-sortable ").remove();
            jQuery(".sapUshellLineModeContainer").remove();
            jQuery(".sapUshellTileContainerBeforeContent").remove();
            jQuery(".sapUshellContainerHeaderActions").remove();
            jQuery("#dashboardGroups").remove();
            fnDone();
        }, 200);
    });
});
