/**
 * tests for the sap.suite.ui.generic.template.lib.ContextMenuHandler
 */

sap.ui.define([
    "testUtils/sinonEnhanced",
    "sap/suite/ui/generic/template/lib/ContextMenuHandler",
    "sap/suite/ui/commons/collaboration/ServiceContainer",
    "sap/ui/comp/smarttable/SmartTable",
    "sap/ui/model/odata/v2/Context",
    "sap/m/Table",
    "sap/m/Column",
    "sap/ui/model/json/JSONModel",
    "sap/m/OverflowToolbar",
    "sap/m/Button",
    "sap/ui/base/Event",
    "sap/m/MenuItem",
    "sap/m/Menu",
    "sap/m/MenuButton"
], function (
    sinon,
    ContextMenuHandler,
    ServiceContainer,
    SmartTable,
    Context,
    ResponsiveTable,
    ResponsiveTableColumn,
    JSONModel,
    OverflowToolbar,
    Button,
    Event,
    MenuItem,
    Menu,
    MenuButton
) {
    // Initializing SmartTable related controls
    var oResponsiveColumn = new ResponsiveTableColumn();
    var oToolbar = new OverflowToolbar({
        id: "Toolbar",
        content: [
            new Button("customAction1", { text: "Custom 1" }),
            new Button("customAction2", { text: "Custom 2" }),
            new Button("customAction3", { text: "Custom 3" }),
            new Button("customAction4", { text: "Custom 4" }),
            new Button("customAction5", { text: "Custom 5" }),
            new MenuButton("customMenuButton1", {
                text: "Custom Menu 1",
                menu: new Menu({
                    items: [
                        new MenuItem("customAction6", {text: "Custom 6"}),
                        new MenuItem("customAction7", {text: "Custom 7"})
                    ]
                })
            }),
            new MenuButton("customMenuButton2", {
                text: "Custom Menu 2",
                menu: new Menu({
                    items: [
                        new MenuItem("customAction8", {text: "Custom 8"}),
                        new MenuItem("customAction9", {text: "Custom 9"})
                    ]
                })
            }),
            new MenuButton("customMenuButton3", {
                text: "Custom Menu 3",
                menu: new Menu({
                    items: [
                        new MenuItem("customAction10", {text: "Custom 10"}),
                        new MenuItem("customAction11", {text: "Custom 11"})
                    ]
                })
            }),
            new Button("deleteEntry", { text: "Delete" }),
            new Button("standardAction1", { text: "Standard 1" }),
            new Button("standardAction2", { text: "Standard 2" })
        ]
    });
    var oResponsiveTable = new ResponsiveTable({
        id: "responsiveTable",
        columns: [oResponsiveColumn],
        contextMenu: new Menu()
    });
    var oSmartTable = new SmartTable({
        id: "SmartTable",
        entitySet: "SalesOrder",
        tableType: "ResponsiveTable",
        items: oResponsiveTable,
        customToolbar: oToolbar
    });

    var oSmartTableModel = {
        hasPendingChanges: function () {
            return false;
        }
    };

    // Initializing FE related objects

    // Argument 1: oController related
    var oTempPrivModelInitialData = {
        generic: {
            controlProperties: {
                SmartTable: {
                    contextMenu: {
                        items: []
                    }
                }
            }
        }
    };
    var oTemplatePrivModel = (new JSONModel(oTempPrivModelInitialData)).setDefaultBindingMode("TwoWay");
    var oView = {
        getLocalId: function (sControlId) {
            return sControlId;
        },
        getModel: function () {
            return oTemplatePrivModel;
        }
    };
    var oController = {
        getView: function () {
            return oView;
        },
        getOwnerComponent: function () {
            return {
                getAppComponent: function () {
                    return {
                        getFlexibleColumnLayout: Function.prototype
                    };
                }
            };
        },
        onCustomAction1: Function.prototype,
        onCustomAction2: Function.prototype,
        onCustomAction3: Function.prototype,
        onCustomAction4: Function.prototype,
        onCustomAction5: Function.prototype,
        onCustomAction6: Function.prototype,
        onCustomAction7: Function.prototype,
        onCustomAction8: Function.prototype,
        onCustomAction9: Function.prototype,
        onCustomAction10: Function.prototype,
        onCustomAction11: Function.prototype
    };

    var aStandardActionsInfo = [
        { ID: "deleteEntry", RecordType: "CRUDActionDelete" },
        { ID: "standardAction1", RecordType: "com.sap.vocabularies.UI.v1.DataFieldForAction" },
        { ID: "standardAction2", RecordType: "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" }
    ];

    var oStandardActionEnablementInfo = {
        "deleteEntry": { enabled: true },
        "standardAction1": { enabled: true },
        "standardAction2": { enabled: false }
    };

    var oBreakoutActionsInfo = {
        "customAction1": {
            id: "customAction1",
            text: "Custom 1",
            press: "onCustomAction1",
            requiresSelection: true
        },
        "customAction2": {
            id: "customAction2",
            text: "Custom 2",
            press: "onCustomAction2",
            requiresSelection: true
        },
        "customAction3": {
            id: "customAction3",
            text: "Custom 3",
            press: "onCustomAction3",
            requiresSelection: true,
            applicablePath: "IsActiveEntity"
        },
        "customAction4": {
            id: "customAction4",
            text: "Custom 4",
            press: "onCustomAction4",
            requiresSelection: false
        },
        "customAction5": {
            id: "customAction5",
            text: "Custom 5",
            press: "onCustomAction5",
            requiresSelection: true,
            excludeFromContextMenu: true
        },
        "customAction6": {
            id: "customAction6",
            text: "Custom 6",
            press: "onCustomAction6",
            requiresSelection: true
        },
        "customAction7": {
            id: "customAction7",
            text: "Custom 7",
            press: "onCustomAction7",
            requiresSelection: true,
        },
        "customAction8": {
            id: "customAction8",
            text: "Custom 8",
            press: "onCustomAction8",
            requiresSelection: true,
        },
        "customAction9": {
            id: "customAction9",
            text: "Custom 9",
            press: "onCustomAction9",
            requiresSelection: false,
        },
        "customAction10": {
            id: "customAction10",
            text: "Custom 10",
            press: "onCustomAction10",
            requiresSelection: false,
        },
        "customAction11": {
            id: "customAction11",
            text: "Custom 11",
            press: "onCustomAction11",
            requiresSelection: false,
        }
    };

    var oBreakoutActionEnablementInfo = {
        "customAction1": true,
        "customAction2": true,
        "customAction3": false,
        "customAction4": true,
        "customAction5": true,
        "customAction6": false,
        "customAction7": true,
        "customAction8": true,
        "customAction9": true,
        "customAction10": true,
        "customAction11": true
    };

    // Argument 2: oTemplateUtils and it's sub-objects
    var oCommonUtils = {
        getToolbarCustomData: function () {
            return aStandardActionsInfo;
        },
        getBreakoutActions: function () {
            return oBreakoutActionsInfo;
        },
        getToolbarActionEnablementInfo: function (oStandardAction) {
            return oStandardActionEnablementInfo[oStandardAction.ID];
        },
        isBreakoutActionEnabled: function (oBreakoutAction) {
            return oBreakoutActionEnablementInfo[oBreakoutAction.id];
        },
        getText: function (key) {
            switch (key) {
                case "ST_SHARE_TO_COLLABORATION_MANAGER":
                    return "Share to SAP Collaboration Manager";
                default:
                    return key ?? "";
            }
        }
    };

    var oComponentUtils = {
        isDraftEnabled: function () {
            return false;
        },
        canNavigateToSubEntitySet: function () {
            return true;
        },
        getViewLevel: function () {
            return 0;
        }
    };

    var oTableRowModel = new JSONModel({});
    var oRowContext = new Context(oTableRowModel, "/row1");
    var oFocusInfo = {
        focussedBindingContext: oRowContext,
        applicableContexts: [oRowContext],
        doesApplicableEqualSelected: true
    };

    var oPresentationControlHandler = {
        getFocusInfoForContextMenuEvent: function (oEvent) {
            return oFocusInfo;
        }
    };

    var oTemplateUtils = {
        oCommonUtils: oCommonUtils,
        oComponentUtils: oComponentUtils,
        oServices: {
            oApplication: {
                getEditFlowOfRoot: function () {
                    return "";
                }
            },
            oApplicationController: {
                synchronizeDraftAsync: function () {
                    return Promise.resolve();
                }
            },
            oPresentationControlHandlerFactory: {
                getPresentationControlHandler: function () {
                    return oPresentationControlHandler;
                }
            }
        }
    };

    // Argument 3: oState
    var oState = {};

    // Argument 4: Smart Table (Created above)
    // Argument 5: oConfiguration
    var oConfiguration = {
        executeAction: Function.prototype,
        findBreakoutActionByLocalId: function (aBreakoutActionsData, sToolbarButtonLocalId) {
            return aBreakoutActionsData.find(function (oBreakoutAction) {
                return sToolbarButtonLocalId === oBreakoutAction.id;
            });
        }
    }

    var sShareToCM = oCommonUtils.getText("ST_SHARE_TO_COLLABORATION_MANAGER");

    var mCollaborationServices = {
        oCMHelperService: {
            getOptions: function () {
                return [{
                    "type": "collaborationManager",
                    "text": sShareToCM,
                    "icon": "sap-icon://collaborate"
                }];
            }
        }
    };
    sinon.stub(ServiceContainer, "getCollaborationServices").returns(Promise.resolve(mCollaborationServices));

    QUnit.module("Context menu handler", {
        setup: function () {
            oSmartTableModelStub = sinon.stub(oSmartTable, "getModel").returns(oSmartTableModel);
        },
        teardown: function () {
            oSmartTableModelStub.restore();
        }
    });

    // Global variable for context menu handler
    var oContextMenuHandler = new ContextMenuHandler(oController, oTemplateUtils, oState, oSmartTable, oConfiguration);
    //Firing "beforeOpenContextMenu" event
    var oBeforeOpenContextMenuEvent = new Event("beforeOpenContextMenu", oResponsiveTable);
    oContextMenuHandler.beforeOpenContextMenu(oBeforeOpenContextMenuEvent);

    QUnit.test("Check the context menu contents", function (assert) {
        var done = assert.async();

        // Instantiate the ContextMenuController
        assert.ok(oContextMenuHandler, "Handler is created");

        // Check the context menu contents
        var aContextMenuItems = oTemplatePrivModel.getProperty("/generic/controlProperties/SmartTable/contextMenu/items");
        var aContextMenuItemTexts = aContextMenuItems.map(function (oMenuItem) {
            return oMenuItem.text;
        });
        var aContextMenuItemHandlerPromises = aContextMenuItems.map(function (oMenuItem) {
            return oMenuItem.handlerPromise;
        });

        // In the custom actions.
        //    - "Custom 1", "Custom 2" and "Custom 3" are added
        //    - "Custom 4" is omitted as "requiresSelection" is false
        //    - "Custom 5" is also omitted as "excludeFromContextMenu" is true
        //    - The menu button "Custom Menu 1" is added
        //    - On the menu button "Custom Menu 2", only one item ("Custom 8") is eligible and it's directly added to context menu
        // All other items are added
        assert.deepEqual(aContextMenuItemTexts, [
            "Custom 1",
            "Custom 2", 
            "Custom 3", 
            "Custom Menu 1",
            "Custom 8",
            "Delete", 
            "Standard 1",
            "Standard 2", 
            sShareToCM
        ], "Verify the context menu contents");

        assert.equal(aContextMenuItemTexts.includes("Custom Menu 3"), false, "The context menu shouldn't include 'Custom Menu 3' as doesn't have any eligible menu items for context menu");

        //Resolve all the handler promises to verify the menu item enablement
        Promise.all([aContextMenuItemHandlerPromises]).then(function () {
            var aUpdatedContextMenuItems = oTemplatePrivModel.getProperty("/generic/controlProperties/SmartTable/contextMenu/items");
            assert.equal(aUpdatedContextMenuItems[0].enabled, true, "'Custom 1' should be enabled");
            assert.equal(aUpdatedContextMenuItems[1].enabled, true, "'Custom 2' should be enabled");
            assert.equal(aUpdatedContextMenuItems[2].enabled, false, "'Custom 3' should be disabled");
            assert.equal(aUpdatedContextMenuItems[3].enabled, true, "'Custom Menu 1' should be enabled");
            assert.equal(aUpdatedContextMenuItems[4].enabled, true, "'Custom 8' should be enabled");
            assert.equal(aUpdatedContextMenuItems[5].enabled, true, "'Delete' should be enabled");
            assert.equal(aUpdatedContextMenuItems[6].enabled, true, "'Standard 1' should be enabled");
            assert.equal(aUpdatedContextMenuItems[7].enabled, false, "'Standard 2' should be disabled");
            assert.equal(aUpdatedContextMenuItems[8].enabled, true, "'" + sShareToCM + "' should be enabled");

            // Checking the sub-menu of "Custom Menu 1"
            var aCustomMenu1ChildEntries = aUpdatedContextMenuItems[3].children;
            var aSubMenuTexts = aCustomMenu1ChildEntries.map(entry => entry.text);
            assert.equal(aCustomMenu1ChildEntries.length, 2, "'Custom Menu 1' should have 2 sub-menu entries");
            assert.deepEqual(aSubMenuTexts, ["Custom 6", "Custom 7"], "Verify the sub-menu contents");
            assert.equal(aCustomMenu1ChildEntries[0].enabled, false, "'Custom 6' should be disabled");
            assert.equal(aCustomMenu1ChildEntries[1].enabled, true, "'Custom 7' should be enabled");

            done();
        });
    });

    QUnit.test("Execute a breakout action", function (assert) {
        var aContextMenuItems = oTemplatePrivModel.getProperty("/generic/controlProperties/SmartTable/contextMenu/items");
        var oMenuItemForCustomAction1 = new MenuItem(aContextMenuItems[0]);
        // Stub for custom action 1 handler
        var oCustomAction1HandlerStub = sinon.stub(oController, "onCustomAction1");
        // Press event for menu item
        var oPressEvent = new Event("press", oMenuItemForCustomAction1);

        // Act
        oContextMenuHandler.onContextMenu(oPressEvent);

        // Check whether the custom method in controller is executed
        assert.equal(oCustomAction1HandlerStub.calledOnce, true, "Press event handler on the controller is invoked");
        // Restore the stubs
        oCustomAction1HandlerStub.restore();
    });
});