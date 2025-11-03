// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/base/Log",
    "sap/ushell/Container",
    "sap/ushell/resources",
    "sap/ushell/EventHub",
    "sap/ushell/utils/WindowUtils",
    "sap/m/Text",
    "sap/m/Page",
    "sap/m/SplitApp",
    "sap/ushell/components/shell/Settings/ErrorMessageHelper",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/message/Message",
    "sap/ushell/Config",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery"
], (
    Element,
    Controller,
    JSONModel,
    Device,
    Log,
    Container,
    resources,
    EventHub,
    windowUtils,
    Text,
    Page,
    SplitApp,
    ErrorMessageHelper,
    XMLView,
    Message,
    Config,
    ObjectPath,
    jQuery
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.sandbox.create();

    QUnit.module("The onInit function", {
        beforeEach: function (assert) {
            Device.system.phone = false;

            this.oModel = new JSONModel({
                entries: [
                    {
                        id: "firstEntry",
                        contentFunc: sandbox.stub().resolves(),
                        entryHelpID: "entry-help-id-0",
                        icon: "sap-icon://home",
                        onCancel: sandbox.stub().resolves(),
                        onSave: sandbox.stub().resolves(),
                        title: "entry0",
                        valueArgument: sandbox.stub().resolves("subtitle0")
                    },
                    {
                        id: "secondEntry",
                        contentFunc: sandbox.stub().resolves(),
                        entryHelpID: "entry-help-id-1",
                        icon: "sap-icon://delete",
                        onCancel: sandbox.stub().resolves(),
                        onSave: sandbox.stub().resolves(),
                        title: "entry1",
                        valueArgument: sandbox.stub().resolves("subtitle1")
                    },
                    {
                        id: "thirdEntry",
                        contentFunc: sandbox.stub().resolves(),
                        entryHelpID: "entry-help-id-1",
                        icon: "sap-icon://delete",
                        onCancel: sandbox.stub().resolves(),
                        onSave: sandbox.stub().resolves(),
                        title: "entry1",
                        valueArgument: sandbox.stub().resolves("subtitle1"),
                        tabs: [
                            { id: "tabEntry1" },
                            { id: "tabEntry2" }
                        ]
                    }
                ]
            });
            this.oView = {
                byId: sandbox.stub(),
                getModel: sandbox.stub().returns(this.oModel),
                setModel: sandbox.stub()
            };

            this.aEntries = [
                {
                    getBindingContext: () => {
                        return {
                            getObject: sandbox.stub().returns(this.oModel.getProperty("/entries/0"))
                        };
                    },
                    focus: sandbox.stub()
                },
                {
                    getBindingContext: () => {
                        return {
                            getObject: sandbox.stub().returns(this.oModel.getProperty("/entries/1"))
                        };
                    },
                    focus: sandbox.stub()
                },
                {
                    getBindingContext: () => {
                        return {
                            getObject: sandbox.stub().returns(this.oModel.getProperty("/entries/2"))
                        };
                    },
                    focus: sandbox.stub()
                }
            ];

            this.oUserSettingList = {
                addEventDelegate: sandbox.stub(),
                setSelectedItem: sandbox.stub(),
                getItems: sandbox.stub().returns(this.aEntries)
            };
            this.oView.byId.withArgs("userSettingEntryList").returns(this.oUserSettingList);

            const oDialog = {
                addEventDelegate: sandbox.stub()
            };
            this.oView.byId.withArgs("userSettingsDialog").returns(oDialog);

            this.oOrientationAttachHandlerStub = sandbox.stub(Device.orientation, "attachHandler");

            return Controller.create({
                name: "sap.ushell.components.shell.Settings.UserSettings"
            }).then((oController) => {
                this.oController = oController;
                sandbox.stub(this.oController, "getView").returns(this.oView);
            });
        },

        afterEach: function () {
            this.oController.destroy();
            this.oOrientationAttachHandlerStub.restore();
            sandbox.restore();
        }
    });

    QUnit.test("Check initial models", function (assert) {
        // Arrange
        const oExpectedModel = {
            entries: {}
        };

        // Act
        this.oController.onInit();

        // Assert

        let oSetModelCall = this.oView.setModel.getCall(0);
        assert.deepEqual(oSetModelCall.args[1], "device", "device Model was set");

        oSetModelCall = this.oView.setModel.getCall(3);
        assert.deepEqual(oSetModelCall.args[0].getData(), oExpectedModel, "Model was set");
        assert.strictEqual(oSetModelCall.args[1], "results", "Model name was set");
    });

    QUnit.test("Check all listener are added", function (assert) {
        // Act
        this.oController.onInit();

        // Assert
        assert.ok(this.oView.byId.calledOnce, "addEventDelegate for userSettingEntryList");
        // userSettingEntryList
        assert.ok(this.oUserSettingList.addEventDelegate.calledOnce, "addEventDelegate for userSettingEntryList was added");
        assert.ok(!!this.oUserSettingList.addEventDelegate.getCall(0).args[0].onAfterRendering,
            "onAfterRendering listener for userSettingEntryList was added");

        assert.ok(this.oOrientationAttachHandlerStub.calledOnce, "A function was attached to the orientation change event of the device.");
    });

    QUnit.test("_listAfterRendering updates entry values", function (assert) {
        // Arrange
        sandbox.stub(this.oController, "_toDetail");
        const oSetEntryValueResultStub = sandbox.stub(this.oController, "_setEntryValueResult");

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.ok(oSetEntryValueResultStub.calledWith("firstEntry"), "First entry was updated");
        assert.ok(oSetEntryValueResultStub.calledWith("secondEntry"), "Second entry was updated");
    });

    QUnit.test("_listAfterRendering navigates to the first entry", function (assert) {
        // Arrange
        sandbox.stub(this.oController, "_toDetail");

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.ok(this.oController._toDetail.calledOnce, "_toDetail was called in after rendering for not mobile devices");
        assert.deepEqual(this.oController._toDetail.getCall(0).args, [this.aEntries[0], undefined], "_toDetail was called with the first entry");

        assert.ok(this.oUserSettingList.setSelectedItem.calledOnce, "setSelectedItem was called in after rendering for not mobile devices");
        assert.deepEqual(this.oUserSettingList.setSelectedItem.getCall(0).args, [this.aEntries[0]], "_toDetail was called with the first entry");

        assert.ok(this.aEntries[0].focus.calledOnce, "focus was set on the first entry");
        assert.ok(this.aEntries[1].focus.notCalled, "focus was not set on the second entry");
    });

    QUnit.test("_listAfterRendering navigates to the defined target entry", function (assert) {
        // Arrange
        sandbox.stub(this.oController, "_toDetail");
        this.oController.sTargetEntryId = "secondEntry";

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.strictEqual(this.oController.sTargetEntryId, null, "The target entry id was reset");
        assert.deepEqual(this.oUserSettingList.setSelectedItem.getCall(0).args, [this.aEntries[1]], "_toDetail was called with the second entry");

        // Change selection back to the first entry
        // Arrange
        this.oController.sTargetEntryId = "firstEntry";

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.strictEqual(this.oController.sTargetEntryId, null, "The target entry id was reset");
        assert.deepEqual(this.oUserSettingList.setSelectedItem.getCall(1).args, [this.aEntries[0]], "_toDetail was called with the first entry");
    });

    QUnit.test("_listAfterRendering navigates to the defined target entry with tabs", function (assert) {
        // Arrange
        const oToDetailStub = sandbox.stub(this.oController, "_toDetail");
        this.oController.sTargetEntryId = "tabEntry2";

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.strictEqual(this.oController.sTargetEntryId, null, "The target entry id was reset");
        assert.deepEqual(oToDetailStub.getCall(0).args, [this.aEntries[2], "tabEntry2"], "_toDetail was called with the correct entry");

        // Change selection back to the first tab entry
        // Arrange
        this.oController.sTargetEntryId = "tabEntry1";

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.strictEqual(this.oController.sTargetEntryId, null, "The target entry id was reset");
        assert.deepEqual(oToDetailStub.getCall(1).args, [this.aEntries[2], "tabEntry1"], "_toDetail was called with the first entry");
    });

    QUnit.test("_listAfterRendering navigates to the last selected entry", function (assert) {
        // Arrange
        sandbox.stub(this.oController, "_toDetail");
        this.oController._aPreviouslySelectedItems = ["secondEntry"];

        // Act
        this.oController._listAfterRendering();

        // Assert
        assert.ok(this.oController._toDetail.calledOnce, "_toDetail was called in after rendering for not mobile devices");
        assert.deepEqual(this.oController._toDetail.getCall(0).args, [this.aEntries[1], undefined], "_toDetail was called with the second entry");

        assert.ok(this.oUserSettingList.setSelectedItem.calledOnce, "setSelectedItem was called in after rendering for not mobile devices");
        assert.deepEqual(this.oUserSettingList.setSelectedItem.getCall(0).args, [this.aEntries[1]], "_toDetail was called with the second entry");

        assert.ok(this.aEntries[0].focus.notCalled, "focus was not set on the first entry");
        assert.ok(this.aEntries[1].focus.calledOnce, "focus was set on the second entry");
    });

    QUnit.module("The onExit function", {
        beforeEach: function () {
            this.oOrientationDetachHandlerStub = sandbox.stub(Device.orientation, "detachHandler");

            return Controller.create({
                name: "sap.ushell.components.shell.Settings.UserSettings"
            }).then((oController) => {
                this.oController = oController;
                this.oController._oConfigDoable = {
                    off: sandbox.stub()
                };
            });
        },

        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Check config doable and orientation handler are removed", function (assert) {
        // Act
        this.oController.onExit();

        // Assert
        assert.ok(this.oController._oConfigDoable.off.calledOnce, "Config doable was removed.");
        assert.ok(this.oOrientationDetachHandlerStub.calledOnce, "A function was detached from the orientation change event of the device.");
    });

    QUnit.module("valueResult handling", {
        beforeEach: function (assert) {
            const done = assert.async();
            sandbox.stub(resources.i18n, "getText").returnsArg(0);

            this.oEntry = { id: "testEntryId", title: "test" };
            Config.emit("/core/userPreferences/entries", [this.oEntry]);

            this.oLogErrorSpy = sandbox.spy(Log, "error");
            this.oResultsModel = new JSONModel({
                entries: {
                    testEntryId: {
                        valueResult: null,
                        contentResult: null
                    }
                }
            });

            Controller.create({
                name: "sap.ushell.components.shell.Settings.UserSettings"
            }).then((oController) => {
                oController.getView = sandbox.stub().returns({
                    getModel: sandbox.stub().withArgs("results").returns(this.oResultsModel)
                });

                this.oController = oController;
                done();
            });
        },

        afterEach: function () {
            this.oLogErrorSpy.restore();
            this.oController.destroy();
            this.oController = null;
            sandbox.restore();
            Config._reset();
        }
    });

    QUnit.test("set valueResult empty string when no valueArgument is defined", function (assert) {
        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "", "empty string is set as valueResult");
        });
    });

    QUnit.test("don't update model if valueResult is not empty and valueArgument is not function", function (assert) {
        // Arrange
        this.oResultsModel.setProperty("/entries/testEntryId/valueResult", "testResult");

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "testResult", "correct valueResult value");
        });
    });

    QUnit.test("update valueResult with valueArgument value", function (assert) {
        // Arrange
        this.oEntry.valueArgument = "valueArgumentValue";
        Config.emit("/core/userPreferences/entries", [this.oEntry]);

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "valueArgumentValue", "correct valueResult value");
        });
    });

    QUnit.test("update valueResult when valueArgument is function", function (assert) {
        // Arrange
        function fnValueArgument () {
            const oDfd = new jQuery.Deferred();
            oDfd.resolve("functionValue");
            return oDfd.promise();
        }
        this.oEntry.valueArgument = fnValueArgument;
        Config.emit("/core/userPreferences/entries", [this.oEntry]);

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "functionValue", "correct valueResult value");
        });
    });

    QUnit.test("set error for valueResult when valueArgument is rejected", function (assert) {
        // Arrange
        function fnValueArgument () {
            const oDfd = new jQuery.Deferred();
            oDfd.reject(new Error("functionValue"));
            return oDfd.promise();
        }
        this.oEntry.valueArgument = fnValueArgument;
        Config.emit("/core/userPreferences/entries", [this.oEntry]);

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "loadingErrorMessage", "correct valueResult value");
        });
    });

    QUnit.test("update valueResult and visibility when valueArgument returns object", function (assert) {
        // Arrange
        function fnValueArgument () {
            const oDfd = new jQuery.Deferred();
            oDfd.resolve({
                value: false,
                displayText: "someText"
            });
            return oDfd.promise();
        }
        this.oEntry.valueArgument = fnValueArgument;
        Config.emit("/core/userPreferences/entries", [this.oEntry]);

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "someText", "correct valueResult value");
            const oEntry = Config.last("/core/userPreferences/entries")[0];
            assert.strictEqual(oEntry.visible, false, "visibility was updated");
        });
    });

    QUnit.test("update valueResult when valueArgument return native promise", function (assert) {
        // Arrange
        function fnValueArgument () {
            return Promise.resolve("promiseTest");
        }
        this.oEntry.valueArgument = fnValueArgument;
        Config.emit("/core/userPreferences/entries", [this.oEntry]);

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "promiseTest", "correct valueResult value");
        });
    });

    QUnit.test("handle the case when error in the valueArgument function", function (assert) {
        // Arrange
        function fnValueArgument () {
            // simulate js runtime error
            throw new Error("Error while function execution");
        }
        this.oEntry.valueArgument = fnValueArgument;
        Config.emit("/core/userPreferences/entries", [this.oEntry]);

        // Act
        return this.oController._setEntryValueResult("testEntryId").then(() => {
            // Assert
            const sValueResult = this.oResultsModel.getProperty("/entries/testEntryId/valueResult");
            assert.strictEqual(sValueResult, "loadingErrorMessage", "correct valueResult value");
            assert.ok(this.oLogErrorSpy.calledOnce, "error should be logged");
        });
    });

    QUnit.module("Content loading and navigation", {
        beforeEach: function (assert) {
            const done = assert.async();

            Device.system.phone = false;
            Device.system.tablet = false;

            this.fnByIdStub = sandbox.stub();
            this.oModel = new JSONModel({
                entries: []
            });
            this.oResultsModel = new JSONModel({
                entries: {
                    testId: {
                        valueResult: null,
                        contentResult: null
                    }
                }
            });
            const oMockView = {
                byId: this.fnByIdStub,
                createId: sandbox.stub().callsFake((sId) => {
                    return sId;
                }),
                getModel: sandbox.stub().callsFake((sModelName) => {
                    if (sModelName === "results") {
                        return this.oResultsModel;
                    }
                    return this.oModel;
                })
            };

            this.oGetSelectedItemStub = sandbox.stub();

            this.oSplitApp = new SplitApp({
                mode: "StretchCompressMode"
            });
            sandbox.spy(this.oSplitApp, "getMode");
            sandbox.spy(this.oSplitApp, "toDetail");
            sandbox.spy(this.oSplitApp, "hideMaster");
            sandbox.spy(this.oSplitApp, "addDetailPage");
            this.oSetBusyStub = sandbox.stub();
            this.oGetCurrentDetailsPageStub = sandbox.stub(this.oSplitApp, "getCurrentDetailPage").returns({
                setBusy: this.oSetBusyStub
            });

            this.fnByIdStub.withArgs("settingsApp").returns(this.oSplitApp);
            this.fnByIdStub.withArgs("userSettingEntryList").returns({
                getSelectedItem: this.oGetSelectedItemStub
            });

            Controller.create({
                name: "sap.ushell.components.shell.Settings.UserSettings"
            }).then((oController) => {
                this.oController = oController;
                this.oController._mLoadedEntryContent = new Map();
                this.oController._mLoadedWrappers = new Map();
                sandbox.stub(this.oController, "getView").returns(oMockView);
                sandbox.stub(this.oController, "byId").callsFake(this.fnByIdStub);
                done();
            });
        },

        afterEach: function () {
            this.oController.destroy();
            this.oController = null;

            this.oSplitApp = null;
            this.oModel = null;
            EventHub._reset();
            sandbox.restore();
            Config._reset();
        }
    });

    QUnit.test("pressHandler calls the correct method", function (assert) {
        // Arrange
        const oTestSelectedItem = {
            title: "helloWorld"
        };
        const oEvent = {
            getSource: sandbox.stub().returns({
                getSelectedItem: sandbox.stub().returns(oTestSelectedItem)
            })
        };
        this.oGetSelectedItemStub.returns(oTestSelectedItem);

        const oStub = sandbox.stub(this.oController, "_toDetail");
        // Act
        this.oController._onSelectionChange(oEvent);
        // Assert
        assert.ok(oStub.calledOnce, "item press handler called toDetail");
        assert.deepEqual(oStub.getCall(0).args, [oTestSelectedItem], "The selected item is used");
        assert.ok(this.oSetBusyStub.calledOnce, "Detail page set to busy");
    });

    QUnit.test("navigate to already created view", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        this.oModel.setProperty("/entries/0", {
            title: "testTitle",
            id: "testId",
            tabs: [
                {
                    id: "testId",
                    title: "testTitle"
                }
            ]
        });
        this.oResultsModel.setProperty("/entries/testId/contentResult", "wrapperId");
        this.oController._mLoadedWrappers.set("testId", Promise.resolve({
            getContent: sandbox.stub().returns([{}, {
                getSelectedKey: sandbox.stub().returns(undefined),
                getItems: sandbox.stub().returns([{ getId: sandbox.stub().returns("testId") }])
            }])
        }));
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            assert.ok(this.oSplitApp.toDetail.calledOnce, "execute navigation in SplitApp");
            assert.deepEqual(this.oSplitApp.toDetail.getCall(0).args, ["wrapperId"], "The navigation to the correct detail page");
            assert.deepEqual(EventHub.last("UserSettingsOpened"), { testId: true }, "event value was updated");
        });
    });

    QUnit.test("navigate to already created view and select tab", function (assert) {
        // Arrange
        const sSelectedMasterEntry = "testId";
        const sSelectedTabEntry = "testId2";
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        this.oModel.setProperty("/entries/0", {
            title: "testTitle",
            id: sSelectedMasterEntry,
            tabs: [
                {
                    id: sSelectedMasterEntry,
                    title: "testTitle"
                },
                {
                    id: sSelectedTabEntry,
                    title: "testTitle"
                }
            ]
        });
        this.oSetSelectedKeyStub = sandbox.stub();
        this.oResultsModel.setProperty(`/entries/${sSelectedMasterEntry}/contentResult`, "wrapperId");
        this.oController._mLoadedWrappers.set(`${sSelectedMasterEntry}-${sSelectedTabEntry}`, Promise.resolve({
            getContent: sandbox.stub().returns([{}, {
                getSelectedKey: sandbox.stub().returns(undefined),
                setSelectedKey: this.oSetSelectedKeyStub,
                getItems: sandbox.stub().returns([
                    { getId: sandbox.stub().returns(sSelectedMasterEntry) }
                ])
            }])
        }));
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem, sSelectedTabEntry).then(() => {
            // Assert
            assert.ok(this.oSplitApp.toDetail.calledOnce, "execute navigation in SplitApp");
            assert.deepEqual(this.oSplitApp.toDetail.getCall(0).args, ["wrapperId"], "The navigation to the correct detail page");
            assert.deepEqual(EventHub.last("UserSettingsOpened"), { testId: true }, "event value was updated");
            assert.strictEqual(this.oSetSelectedKeyStub.callCount, 1, "setSelectedKey was called");
            assert.deepEqual(this.oSetSelectedKeyStub.getCall(0).args, [sSelectedTabEntry], "setSelectedKey was called with correct arguments");
        });
    });

    QUnit.test("create the view and navigate to created view", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryWrapper = new Page();
        const oFakeEntryContent = new Page();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ]
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        sandbox.stub(this.oController, "_createEntryContent").resolves(oFakeEntryContent);
        const aExpectedEntries = [
            {
                title: oEntry.title,
                id: oEntry.id,
                tabs: oEntry.tabs
            }
        ];
        const sExpectedContentResult = oFakeEntryWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.deepEqual(Config.last("/core/userPreferences/entries"), aExpectedEntries);
            assert.ok(this.oSplitApp.toDetail.callCount > 0, "execute navigation in SplitApp");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeEntryWrapper.getId() ] ], "It navigates to the correct detail page.");
            assert.deepEqual(EventHub.last("UserSettingsOpened"), { testId: true }, "event value was updated");

            oFakeEntryWrapper.destroy();
        });
    });

    QUnit.test("create the view and navigate to created view and select tab", function (assert) {
        // Arrange
        const sSelectedMasterEntry = "testId";
        const sSelectedTabEntry = "testId2";
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryContent = new Page();
        const oFakeContentWrapper = new Page();
        this.oSetSelectedKeyStub = sandbox.stub();
        sandbox.stub(oFakeContentWrapper, "getContent").returns([{}, {
            setSelectedKey: this.oSetSelectedKeyStub
        }]);
        const oMasterEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ]
        };
        const aEntries = [
            {
                id: sSelectedMasterEntry,
                visible: true
            },
            {
                id: sSelectedTabEntry,
                visible: true
            }
        ];

        Config.emit("/core/userPreferences/entries", aEntries);
        this.oModel.setProperty("/entries/0", oMasterEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeContentWrapper);
        sandbox.stub(this.oController, "_createEntryContent").resolves(oFakeEntryContent);
        const sExpectedContentResult = oFakeContentWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem, sSelectedTabEntry).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.ok(this.oSplitApp.toDetail.callCount > 0, "execute navigation in SplitApp");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeContentWrapper.getId() ] ], "It navigates to the correct detail page.");
            assert.deepEqual(EventHub.last("UserSettingsOpened"), { testId: true }, "event value was updated");
            assert.strictEqual(this.oSetSelectedKeyStub.callCount, 1, "setSelectedKey was called");
            assert.deepEqual(this.oSetSelectedKeyStub.getCall(0).args, [sSelectedTabEntry], "setSelectedKey was called with correct arguments");

            oFakeEntryContent.destroy();
        });
    });

    QUnit.test("Create view with error message when contentFunc is not defined", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryWrapper = new Page();
        const oFakeErrorContent = new Page();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ]
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        sandbox.stub(this.oController, "_createErrorContent").resolves(oFakeErrorContent);
        const aExpectedEntries = [
            {
                title: oEntry.title,
                id: oEntry.id,
                tabs: oEntry.tabs
            }
        ];
        const sExpectedContentResult = oFakeEntryWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.deepEqual(Config.last("/core/userPreferences/entries"), aExpectedEntries);
            assert.ok(this.oController._createErrorContent.calledOnce, "error content was added");
            assert.deepEqual(this.oController._createErrorContent.getCall(0).args, [resources.i18n.getText("userSettings.noContent")],
                "_createErrorContent called with correct arguments");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeEntryWrapper.getId() ] ], "The navigation to the correct detail pages");
        });
    });

    QUnit.test("Create view with error message when contentFunc does not return control object", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryWrapper = new Page();
        const oFakeErrorContent = new Page();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ],
            contentFunc: function () {
                const oDfd = new jQuery.Deferred();
                oDfd.resolve(null);
                return oDfd.promise();
            }
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        sandbox.stub(this.oController, "_createErrorContent").resolves(oFakeErrorContent);
        const aExpectedEntries = [
            {
                title: oEntry.title,
                id: oEntry.id,
                tabs: oEntry.tabs,
                contentFunc: oEntry.contentFunc
            }
        ];
        const sExpectedContentResult = oFakeEntryWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.deepEqual(Config.last("/core/userPreferences/entries"), aExpectedEntries);
            assert.ok(this.oController._createErrorContent.calledOnce, "error content was added");
            assert.deepEqual(this.oController._createErrorContent.getCall(0).args, [resources.i18n.getText("loadingErrorMessage")],
                "_addErrorContentToWrapper called with correct argument");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeEntryWrapper.getId() ] ], "The navigation to the correct detail pages");
        });
    });

    QUnit.test("Create view and add content when contentFunc returns control object", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryWrapper = new Page();
        const oText = new Text();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ],
            contentFunc: function () {
                const oDfd = new jQuery.Deferred();
                oDfd.resolve(oText);
                return oDfd.promise();
            }
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        const aExpectedEntries = [
            {
                title: oEntry.title,
                id: oEntry.id,
                tabs: oEntry.tabs,
                contentFunc: oEntry.contentFunc
            }
        ];
        const sExpectedContentResult = oFakeEntryWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.deepEqual(Config.last("/core/userPreferences/entries"), aExpectedEntries);
            assert.deepEqual(oFakeEntryWrapper.getContent(), [oText], "correct content was added");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeEntryWrapper.getId() ] ], "The navigation to the correct detail pages");
        });
    });

    QUnit.test("Create view and add content when contentFunc returns normal promise with control object", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryWrapper = new Page();
        const oText = new Text();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ],
            contentFunc: function () {
                return Promise.resolve(oText);
            }
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        const aExpectedEntries = [
            {
                title: oEntry.title,
                id: oEntry.id,
                tabs: oEntry.tabs,
                contentFunc: oEntry.contentFunc
            }
        ];
        const sExpectedContentResult = oFakeEntryWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.deepEqual(Config.last("/core/userPreferences/entries"), aExpectedEntries);
            assert.deepEqual(oFakeEntryWrapper.getContent(), [oText], "correct content was added");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeEntryWrapper.getId() ] ], "The navigation to the correct detail pages");
        });
    });

    QUnit.test("Selected Entry changed while loading first content", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0")
        };
        const oFakeEntryWrapper = new Page();
        const oText = new Text();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ],
            contentFunc: function () {
                return Promise.resolve(oText);
            }
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        this.oGetSelectedItemStub.returns({ different: "item" });

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            assert.deepEqual(this.oSplitApp.toDetail.args, [ ], "The navigation to the correct detail page");
        });
    });

    QUnit.test("navigate when device is mobile", function (assert) {
        // Arrange
        Device.system.phone = true;
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0"),
            setSelected: sandbox.stub()
        };
        const oBackButton = {
            setVisible: sandbox.spy()
        };
        this.oModel.setProperty("/entries/0", {
            title: "testTitle",
            id: "testId",
            tabs: [
                {
                    id: "testId",
                    title: "testTitle"
                }
            ]
        });
        this.oResultsModel.setProperty("/entries/testId/contentResult", "wrapperId");

        this.oSplitApp.getMode = sandbox.stub().returns("ShowHideMode");
        this.fnByIdStub.withArgs("userSettingsNavBackButton").returns(oBackButton);
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        this.oController._toDetail(oSelectedItem);

        // Assert
        assert.ok(oSelectedItem.setSelected.calledOnce, "unselect item");
        assert.deepEqual(oSelectedItem.setSelected.lastCall.args, [false], "unselect item");
        assert.ok(this.oSplitApp.hideMaster.callCount > 0, "master page was hidden");
        assert.deepEqual(oBackButton.setVisible.lastCall.args, [true], "show back button");
    });

    QUnit.test("create the view and navigate to created view on mobile", function (assert) {
        // Arrange
        Device.system.phone = true;
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0"),
            setSelected: sandbox.stub()
        };
        const oFakeEntryWrapper = new Page();
        const oFakeEntryContent = new Page();
        const oEntry = {
            title: "testTitle",
            id: "testId",
            tabs: [
                "testId"
            ]
        };

        Config.emit("/core/userPreferences/entries", [oEntry]);
        this.oModel.setProperty("/entries/0", oEntry);
        sandbox.stub(this.oController, "_createContentWrapper").resolves(oFakeEntryWrapper);
        sandbox.stub(this.oController, "_createEntryContent").resolves(oFakeEntryContent);
        const aExpectedEntries = [
            {
                title: oEntry.title,
                id: oEntry.id,
                tabs: oEntry.tabs
            }
        ];
        const sExpectedContentResult = oFakeEntryWrapper.getId();
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        const oNavigationPromise = this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            const sContentResult = this.oResultsModel.getProperty("/entries/testId/contentResult");
            assert.strictEqual(sContentResult, sExpectedContentResult, "Saved the correct control id");
            assert.deepEqual(Config.last("/core/userPreferences/entries"), aExpectedEntries);
            assert.ok(this.oSplitApp.toDetail.callCount > 0, "execute navigation in SplitApp");
            assert.deepEqual(this.oSplitApp.toDetail.args, [ [ oFakeEntryWrapper.getId() ] ], "It navigates to the correct detail page.");
            assert.deepEqual(EventHub.last("UserSettingsOpened"), { testId: true }, "event value was updated");

            assert.deepEqual(oSelectedItem.setSelected.getCall(0).args, [false], "Selected item was reset");

            oFakeEntryWrapper.destroy();
        });

        return oNavigationPromise;
    });

    QUnit.test("navigates to entry with tabs, with tab two previously selected.", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0"),
            setSelected: sandbox.stub()
        };
        this.oModel.setProperty("/entries/0", {
            title: "testTitle",
            id: "testId",
            tabs: [
                {
                    id: "testId"
                },
                {
                    id: "testId2"
                }
            ]
        });
        this.oResultsModel.setProperty("/entries/testId/contentResult", "wrapperId");
        this.oController._mLoadedWrappers.set("testId-testId2", Promise.resolve({
            getContent: sandbox.stub().returns([{}, {
                getSelectedKey: sandbox.stub().returns("testId2"),
                getItems: sandbox.stub().returns([
                    { getId: sandbox.stub().returns("testId") },
                    { getId: sandbox.stub().returns("testId2") }
                ])
            }])
        }));
        sandbox.stub(this.oController, "_navToDetail");
        sandbox.stub(this.oController, "_emitEntryOpened");
        const aExpectedArguments = [
            [ "testId2" ]
        ];
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            assert.ok(this.oController._navToDetail.calledOnce, "navigated to the detail page.");
            assert.deepEqual(this.oController._emitEntryOpened.args, aExpectedArguments, "emitted the entry opened event correctly.");
        });
    });

    QUnit.test("navigates to entry with tabs, but no tab was previously selected.", function (assert) {
        // Arrange
        const oSelectedItem = {
            getBindingContextPath: sandbox.stub().returns("/entries/0"),
            setSelected: sandbox.stub()
        };
        this.oModel.setProperty("/entries/0", {
            title: "testTitle",
            id: "testId",
            tabs: [
                {
                    id: "testId"
                },
                {
                    id: "testId2"
                }
            ]
        });
        this.oResultsModel.setProperty("/entries/testId/contentResult", "wrapperId");
        this.oController._mLoadedWrappers.set("testId-testId2", Promise.resolve({
            getContent: sandbox.stub().returns([{}, {
                getSelectedKey: sandbox.stub().returns(null),
                getItems: sandbox.stub().returns([
                    { getId: sandbox.stub().returns("testId") },
                    { getId: sandbox.stub().returns("testId2") }
                ])
            }])
        }));
        sandbox.stub(this.oController, "_navToDetail");
        sandbox.stub(this.oController, "_emitEntryOpened");
        const aExpectedArguments = [
            [ "testId" ]
        ];
        this.oGetSelectedItemStub.returns(oSelectedItem);

        // Act
        return this.oController._toDetail(oSelectedItem).then(() => {
            // Assert
            assert.ok(this.oController._navToDetail.calledOnce, "navigated to the detail page.");
            assert.deepEqual(this.oController._emitEntryOpened.args, aExpectedArguments, "emitted the entry opened event correctly.");
        });
    });

    QUnit.test("correct updating the UserSettingsOpened event", function (assert) {
        // Arrange
        const oTestState = {
            id1: true,
            id10: true
        };
        const oExpectedState = {
            id1: true,
            id10: true,
            id5: true
        };
        EventHub.emit("UserSettingsOpened", oTestState);

        // Act
        this.oController._emitEntryOpened("id5");

        // Assert
        assert.deepEqual(EventHub.last("UserSettingsOpened"), oExpectedState, "UserSettingsOpened was updated correctly");
    });

    QUnit.module("Buttons handling", {
        beforeEach: function () {
            Device.system.phone = false;
            Device.system.tablet = false;

            this.oModel = new JSONModel({
                entries: []
            });

            this.fnResetChangedProperties = sandbox.spy();

            sandbox.stub(Container, "getServiceAsync").withArgs("MessageInternal").resolves({
                init: sandbox.stub(),
                show: sandbox.stub(),
                Type: {ERROR: "1"}
            });

            sandbox.stub(Container, "getUser").returns({
                resetChangedProperties: this.fnResetChangedProperties
            });

            ObjectPath.set("sap.ushell.services.Message.Type.ERROR", 1);

            this.oLogErrorSpy = sandbox.spy(Log, "error");

            this.oAddMessageSpy = sandbox.spy(ErrorMessageHelper, "addMessage");

            return XMLView.create({
                id: "settingsView",
                viewName: "sap.ushell.components.shell.Settings.UserSettings"
            }).then((oSettingsView) => {
                this.oSettingsView = oSettingsView;

                this.oController = oSettingsView.getController();

                this.oSplitApp = oSettingsView.byId("settingsApp");
                sandbox.spy(this.oSplitApp, "backDetail");
                sandbox.stub(this.oSplitApp, "isMasterShown");
                sandbox.spy(this.oSplitApp, "showMaster");
                sandbox.spy(this.oSplitApp, "hideMaster");
                sandbox.spy(this.oSplitApp, "toMaster");

                this.oSetBusyStub = sandbox.stub();
                this.oGetCurrentDetailsPageStub = sandbox.stub(this.oSplitApp, "getCurrentDetailPage").returns({
                    setBusy: this.oSetBusyStub
                });

                this.oBackButton = oSettingsView.byId("userSettingsNavBackButton");
                sandbox.spy(this.oBackButton, "setVisible");

                this.oToggleButton = oSettingsView.byId("userSettingsMenuButton");
                sandbox.spy(this.oToggleButton, "setVisible");
                sandbox.spy(this.oToggleButton, "setPressed");
                sandbox.spy(this.oToggleButton, "setTooltip");

                this.oDialog = oSettingsView.byId("userSettingsDialog");
                sandbox.spy(this.oDialog, "close");

                oSettingsView.setModel(resources.i18nModel, "i18n");
                oSettingsView.setModel(this.oModel);
                oSettingsView.byId("userSettingsDialog").open();
            });
        },

        afterEach: function () {
            this.oSettingsView.destroy();
            EventHub._reset();
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("back button press handler", function (assert) {
        // Arrange
        Device.system.phone = true;

        // Act
        this.oController._navBackButtonPressHandler();

        // Assert
        assert.ok(this.oSplitApp.backDetail.calledOnce, "backDetail was called");
        assert.ok(this.oBackButton.setVisible.calledOnce, "the back button visibility was changed");
        assert.deepEqual(this.oBackButton.setVisible.getCall(0).args, [false], "the correct visibility of the back button was set");
        assert.ok(this.oToggleButton.setVisible.notCalled, "the toggle button visibility was not changed");
        assert.ok(this.oSetBusyStub.called, "Busy indicator called");
    });

    QUnit.test("toggle button was press when master page is hidden", function (assert) {
        // Arrange
        const bOldOrientationPortrait = Device.orientation.portrait;
        Device.orientation.portrait = true;
        this.oSplitApp.isMasterShown.returns(false);
        this.oToggleButton.setTooltip.reset();
        // Act
        this.oController._navToggleButtonPressHandler();

        // Assert
        assert.ok(this.oSplitApp.showMaster.calledOnce, "master page should be shown");
        assert.ok(this.oBackButton.setVisible.notCalled, "the back button visibility was not changed");
        assert.ok(this.oToggleButton.setVisible.calledOnce, "the toggle button visibility was set");
        assert.deepEqual(this.oToggleButton.setVisible.getCall(0).args, [true], "the correct visibility of the toggle button was set");
        assert.ok(this.oToggleButton.setPressed.calledOnce, "the toggle button press state was set");
        assert.deepEqual(this.oToggleButton.setPressed.getCall(0).args, [true], "The toggle button should be shown as pressed");
        assert.ok(this.oToggleButton.setTooltip.calledOnce, "the toggle button tooltip was set");
        assert.deepEqual(
            this.oToggleButton.setTooltip.getCall(0).args,
            [resources.i18n.getText("ToggleButtonHide")],
            "the correct tooltip was set"
        );

        // Clean-up
        Device.orientation.portrait = bOldOrientationPortrait;
    });

    QUnit.test("toggle button was press when master page is shown", function (assert) {
        // Arrange
        const bOldOrientationPortrait = Device.orientation.portrait;
        Device.orientation.portrait = true;
        this.oSplitApp.isMasterShown.returns(true);
        this.oToggleButton.setTooltip.reset();
        // Act
        this.oController._navToggleButtonPressHandler();

        // Assert
        assert.ok(this.oSplitApp.hideMaster.calledOnce, "master page should be shown");
        assert.ok(this.oBackButton.setVisible.notCalled, "the back button visibility was not changed");
        assert.ok(this.oToggleButton.setVisible.calledOnce, "the toggle button visibility was set");
        assert.deepEqual(this.oToggleButton.setVisible.getCall(0).args, [true], "the correct visibility of the toggle button was set");
        assert.ok(this.oToggleButton.setPressed.calledOnce, "the toggle button press state was set");
        assert.deepEqual(this.oToggleButton.setPressed.getCall(0).args, [false], "The toggle button should be shown as not pressed");
        assert.ok(this.oToggleButton.setTooltip.calledOnce, "the toggle button tooltip was set");
        assert.deepEqual(
            this.oToggleButton.setTooltip.getCall(0).args,
            [resources.i18n.getText("ToggleButtonShow")],
            "the correct tooltip was set"
        );

        // Clean-up
        Device.orientation.portrait = bOldOrientationPortrait;
    });

    QUnit.test("tablet in landscape mode ", function (assert) {
        // Arrange
        const bOldOrientationPortrait = Device.orientation.portrait;
        const bOldOrientationLandscape = Device.orientation.landscape;
        const bOldSystemTablet = Device.system.tablet;

        Device.orientation.portrait = false;
        Device.orientation.landscape = true;
        Device.system.tablet = true;

        // Act
        this.oController._updateHeaderButtonVisibility(false);

        // Assert
        assert.ok(this.oToggleButton.setVisible.calledOnce, "the toggle button visibility was set");
        assert.deepEqual(this.oToggleButton.setVisible.getCall(0).args, [false], "the correct visibility of the toggle button was set");

        // Clean-up
        Device.orientation.portrait = bOldOrientationPortrait;
        Device.orientation.landscape = bOldOrientationLandscape;
        Device.system.tablet = bOldSystemTablet;
    });

    QUnit.test("tablet in portrait mode ", function (assert) {
        // Arrange
        const bOldOrientationPortrait = Device.orientation.portrait;
        const bOldOrientationLandscape = Device.orientation.landscape;
        const bOldSystemTablet = Device.system.tablet;

        Device.orientation.portrait = true;
        Device.orientation.landscape = false;
        Device.system.tablet = true;

        // Act
        this.oController._updateHeaderButtonVisibility(false);

        // Assert
        assert.ok(this.oToggleButton.setVisible.calledOnce, "the toggle button visibility was set");
        assert.deepEqual(this.oToggleButton.setVisible.getCall(0).args, [true], "the correct visibility of the toggle button was set");

        // Clean-up
        Device.orientation.portrait = bOldOrientationPortrait;
        Device.orientation.landscape = bOldOrientationLandscape;
        Device.system.tablet = bOldSystemTablet;
    });

    QUnit.test("desktop in landscape mode ", function (assert) {
        // Arrange
        const bOldOrientationPortrait = Device.orientation.portrait;
        const bOldOrientationLandscape = Device.orientation.landscape;
        const bOldSystemDesktop = Device.system.desktop;

        Device.orientation.portrait = false;
        Device.orientation.landscape = true;
        Device.system.desktop = true;

        // Act
        this.oController._updateHeaderButtonVisibility(false);

        // Assert
        assert.ok(this.oToggleButton.setVisible.calledOnce, "the toggle button visibility was set");
        assert.deepEqual(this.oToggleButton.setVisible.getCall(0).args, [false], "the correct visibility of the toggle button was set");

        // Clean-up
        Device.orientation.portrait = bOldOrientationPortrait;
        Device.orientation.landscape = bOldOrientationLandscape;
        Device.system.desktop = bOldSystemDesktop;
    });

    QUnit.test("tablet in portrait mode ", function (assert) {
        // Arrange
        const bOldOrientationPortrait = Device.orientation.portrait;
        const bOldOrientationLandscape = Device.orientation.landscape;
        const bOldSystemDesktop = Device.system.desktop;

        Device.orientation.portrait = true;
        Device.orientation.landscape = false;
        Device.system.desktop = true;

        // Act
        this.oController._updateHeaderButtonVisibility(false);

        // Assert
        assert.ok(this.oToggleButton.setVisible.calledOnce, "the toggle button visibility was set");
        assert.deepEqual(this.oToggleButton.setVisible.getCall(0).args, [true], "the correct visibility of the toggle button was set");

        // Clean-up
        Device.orientation.portrait = bOldOrientationPortrait;
        Device.orientation.landscape = bOldOrientationLandscape;
        Device.system.desktop = bOldSystemDesktop;
    });

    QUnit.test("press cancel when there is no entries", function (assert) {
        // Arrange
        EventHub.emit("UserSettingsOpened", {});

        // Act
        this.oController._handleCancel();

        // Assert
        assert.equal(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened was reset");
        assert.ok(this.fnResetChangedProperties.calledOnce, "user change properties were reset");
        assert.ok(this.oDialog.close.calledOnce, "settings dialog should be closed");
        assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");
    });

    QUnit.test("press cancel reset open entries", function (assert) {
        // Arrange
        const aEntries = [
            { onCancel: sandbox.spy() },
            { id: "1", onCancel: sandbox.spy() },
            { id: "2", onCancel: sandbox.spy() },
            { id: "3" } // no onCancel
        ];

        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", {
            1: true,
            3: true
        });

        // Act
        this.oController._handleCancel();

        // Assert
        assert.equal(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened was reset");
        assert.ok(aEntries[0].onCancel.notCalled, "don't call onCancel for not opened entry");
        assert.ok(aEntries[1].onCancel.calledOnce, "call onCancel for opened entry");
        assert.ok(aEntries[2].onCancel.notCalled, "don't call onCancel for not opened entry");
        assert.ok(this.oDialog.close.calledOnce, "settings dialog should be closed");
        assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");
    });

    QUnit.test("press cancel button on mobile", function (assert) {
        // Arrange
        Device.system.phone = true;
        // Act
        this.oController._handleCancel();

        // Assert
        assert.equal(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened was reset");
        assert.ok(this.oSplitApp.toMaster.calledOnce, "toMaster was called");
        assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");

        assert.deepEqual(
            this.oSplitApp.toMaster.getCall(0).args,
            ["settingsView--userSettingMaster"],
            "toMaster was called with correct argument"
        );
    });

    QUnit.test("press cancel button - js runtime error onCancel", function (assert) {
        // Arrange
        const aEntries = [{
            id: "1",
            onCancel: function () {
                const test = {}.test;
                test();
            }
        }];
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", {
            1: true
        });

        // Act
        this.oController._handleCancel();

        // Assert
        assert.equal(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened was reset");
        assert.ok(this.oLogErrorSpy.calledOnce, "error should be logged");
        assert.ok(this.oDialog.close.calledOnce, "settings dialog should be closed");
        assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");
    });

    QUnit.test("press save button - save only opened entries", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().resolves() },
            { id: "1", onSave: sandbox.stub().resolves() }
        ];
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", {
            1: true
        });
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.equal(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened was reset");
            assert.ok(aEntries[0].onSave.notCalled, "don't call onSave for not opened entry");
            assert.ok(aEntries[1].onSave.calledOnce, "call onSave for opened entry");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called only once");
            assert.ok(this.oController._showSuccessMessageToast.calledOnce, "Message toast should be shown");
            assert.ok(this.oController._handleSettingsDialogClose.calledOnce, "Message toast should be shown");
            assert.strictEqual(Element.getElementById("userSettingsMessagePopover"), undefined, "Control with id userSettingsMessagePopover was not created");
            assert.ok(windowUtils.refreshBrowser.notCalled, "the browser was not refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.notCalled, "the `sap-usercontext` cookie was not cleared");
        });
    });

    QUnit.test("press save button - onSave is jQuery promise", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().returns(new jQuery.Deferred().resolve().promise()) }
        ];
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", {
            0: true
        });
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        this.oLogSpy = sandbox.spy(Log, "warning");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.equal(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened was reset");
            assert.ok(aEntries[0].onSave.calledOnce, "don't call onSave for not opened entry");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");
            assert.ok(this.oController._showSuccessMessageToast.calledOnce, "Message toast should be shown");
            assert.ok(this.oController._handleSettingsDialogClose.calledOnce, "Message toast should be shown");
            assert.ok(this.oLogSpy.calledWithMatch(sinon.match(/jQuery\.promise is used to save/)), "the warning message should be logged");
            assert.strictEqual(Element.getElementById("userSettingsMessagePopover"), undefined, "Control with id userSettingsMessagePopover was not created");

            // Cleanup
            this.oLogSpy.restore();
        });
    });

    QUnit.test("press save button - browser should be refreshed after save", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().resolves({ refresh: true, clearSapUserContextCookie: true, obsoleteUrlParams: ["sap-language"] })}
        ];
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", {
            0: true
        });
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            assert.ok(this.oController._showSuccessMessageToast.calledOnce, "Message toast should be shown");
            assert.ok(this.oController._handleSettingsDialogClose.calledOnce, "Message toast should be shown");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");
            assert.ok(windowUtils.refreshBrowser.calledOnce, "the browser should be refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.calledOnce, "the `sap-usercontext` cookie was cleared");
            assert.strictEqual(Element.getElementById("userSettingsMessagePopover"), undefined, "Control with id userSettingsMessagePopover was not created");
        });
    });

    QUnit.test("press save button - error message should be shown if one of save operation fails", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().resolves() },
            { id: "1", onSave: sandbox.stub().rejects(new Error("test")) }
        ];
        const oChangedEntries = {
            0: true,
            1: true
        };
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", oChangedEntries);
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.deepEqual(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened should be reset");
            assert.ok(this.oController._showSuccessMessageToast.notCalled, "Message toast should not be shown");
            assert.ok(this.oController._handleSettingsDialogClose.called, "Dialog shall be closed");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called once");
            assert.ok(windowUtils.refreshBrowser.notCalled, "the browser was not refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.notCalled, "the `sap-usercontext` cookie was not cleared");
        });
    });

    QUnit.test("press save button - error message should be shown if js runtime error", function (assert) {
        // Arrange
        const aEntries = [{
            id: "0",
            onSave: function () {
                // simulate runtime error
                const test = {}.test;
                test();
            }
        }];
        const oChangedEntries = {
            0: true
        };

        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", oChangedEntries);
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.deepEqual(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened should be reset");

            assert.ok(this.oController._showSuccessMessageToast.notCalled, "Message toast should not be shown");
            assert.ok(this.oController._handleSettingsDialogClose.called, "Dialog close should be called");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for each item");
            assert.strictEqual(this.oAddMessageSpy.callCount, 1, "addMessage was called exactly once");
            assert.ok(
                this.oAddMessageSpy.firstCall.args[0].getMessage().startsWith(resources.i18n.getText("userSettings.SavingError.WithMessage", [""])),
                "Function is called with expected message"
            );
            assert.ok(windowUtils.refreshBrowser.notCalled, "the browser was not refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.notCalled, "the `sap-usercontext` cookie was not cleared");
        });
    });

    QUnit.test("press save button - mix native and jQuery promises", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().returns(new jQuery.Deferred().reject(new Error("test")).promise()) },
            { id: "1", onSave: sandbox.stub().rejects(new Error("test")) }
        ];
        const oChangedEntries = {
            0: true,
            1: true
        };
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", oChangedEntries);
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        this.oLogWarningSpy = sandbox.spy(Log, "warning");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.deepEqual(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened should be reset");

            assert.ok(this.oController._showSuccessMessageToast.notCalled, "Message toast should not be shown");
            assert.ok(this.oController._handleSettingsDialogClose.called, "Dialog close should be called");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called once");
            assert.strictEqual(this.oLogErrorSpy.callCount, 1, "error should be logged");
            assert.ok(this.oLogWarningSpy.callCount > 0, "warning should be logged");
        });
    });

    QUnit.test("press save button - setting rejects with undefined error", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().returns(new jQuery.Deferred().reject(undefined).promise()) }
        ];
        const oChangedEntries = {
            0: true
        };
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", oChangedEntries);
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        this.oLogWarningSpy = sandbox.spy(Log, "warning");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.deepEqual(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened should be reset");

            assert.ok(this.oController._showSuccessMessageToast.notCalled, "Message toast should not be shown");
            assert.ok(this.oController._handleSettingsDialogClose.called, "Dialog close should be called");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for each item");

            assert.strictEqual(this.oAddMessageSpy.callCount, 1, "addMessage was called exactly once");
            assert.strictEqual(this.oAddMessageSpy.firstCall.args[0].getMessage(), resources.i18n.getText("userSettings.SavingError.Undefined"), "Function is called with expected message");
            assert.ok(this.oLogErrorSpy.calledOnce, "error should be logged");
            assert.ok(this.oLogWarningSpy.callCount > 0, "warning should be logged");
            assert.ok(windowUtils.refreshBrowser.notCalled, "the browser was not refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.notCalled, "the `sap-usercontext` cookie was not cleared");
            this.oLogWarningSpy.restore();
        });
    });

    QUnit.test("press save button - setting rejects with Message", function (assert) {
        // Arrange
        const aEntries = [
            { id: "0", onSave: sandbox.stub().returns(new jQuery.Deferred().reject(new Message({ message: "testMessage" }))) }
        ];
        const oChangedEntries = {
            0: true
        };
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", oChangedEntries);
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        this.oLogWarningSpy = sandbox.spy(Log, "warning");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.deepEqual(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened should be reset");

            assert.ok(this.oController._showSuccessMessageToast.notCalled, "Message toast should not be shown");
            assert.ok(this.oController._handleSettingsDialogClose.called, "Dialog close should be called");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for each item");

            assert.strictEqual(this.oAddMessageSpy.callCount, 1, "addMessage was called exactly once");
            assert.strictEqual(this.oAddMessageSpy.firstCall.args[0].getMessage(), "testMessage", "Function is called with expected message");
            assert.ok(this.oLogErrorSpy.calledOnce, "error should be logged");
            assert.ok(this.oLogWarningSpy.callCount > 0, "warning should be logged");
            assert.ok(windowUtils.refreshBrowser.notCalled, "the browser was not refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.notCalled, "the `sap-usercontext` cookie was not cleared");
            this.oLogWarningSpy.restore();
        });
    });

    QUnit.test("press save button - setting rejects with multiple Messages", function (assert) {
        // Arrange
        const aEntries = [{
            id: "0",
            onSave: sandbox.stub().returns(new jQuery.Deferred().reject([
                new Message({ message: "firstMessage" }),
                new Message({ message: "secondMessage" })
            ]))
        }];
        const oChangedEntries = { 0: true };
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", oChangedEntries);
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        this.oLogWarningSpy = sandbox.spy(Log, "warning");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.deepEqual(EventHub.last("UserSettingsOpened"), null, "UserSettingsOpened should be reset");

            assert.ok(this.oController._showSuccessMessageToast.notCalled, "Message toast should not be shown");
            assert.ok(this.oController._handleSettingsDialogClose.called, "Dialog close should be called");
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for each item");

            assert.strictEqual(this.oAddMessageSpy.callCount, 2, "addMessage was called twice");
            assert.strictEqual(this.oAddMessageSpy.firstCall.args[0].getMessage(), "firstMessage", "Function is called with expected message");
            assert.strictEqual(this.oAddMessageSpy.secondCall.args[0].getMessage(), "secondMessage", "Function is called with expected message");
            assert.ok(this.oLogErrorSpy.calledOnce, "error should be logged");
            assert.ok(this.oLogWarningSpy.callCount > 0, "warning should be logged");
            this.oLogWarningSpy.restore();
        });
    });

    QUnit.test("press save button - no changed entries", function (assert) {
        // Arrange
        EventHub.emit("UserSettingsOpened", {});
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        sandbox.spy(this.oController, "_executeEntrySave");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.strictEqual(Element.getElementById("userSettingsMessagePopover"), undefined, "Control with id userSettingsMessagePopover was not created");
            assert.ok(this.oController._showSuccessMessageToast.calledOnce, "Message toast should be shown");
            assert.ok(this.oController._handleSettingsDialogClose.calledOnce, "Message toast should be shown");
            assert.ok(this.oController._executeEntrySave.notCalled, "No onSave functions were executed");
            assert.ok(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called for dialog close");
            assert.ok(windowUtils.refreshBrowser.notCalled, "the browser was not refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.notCalled, "the `sap-usercontext` cookie was not cleared");
        });
    });

    QUnit.test("press save button - browser should be refreshed after save and new url parameter was added", function (assert) {
        // Arrange
        const aUrlParams = [
            { "sap-language": "EN" },
            { "sap-client": "010" }
        ];

        const aObsoleteUrlParams = ["sap-language"];
        const aEntries = [
            { id: "0", onSave: sandbox.stub().resolves({ refresh: true, clearSapUserContextCookie: true, urlParams: [aUrlParams[0]], obsoleteUrlParams: undefined }) },
            { id: "1", onSave: sandbox.stub().resolves({ refresh: true, clearSapUserContextCookie: true, urlParams: [aUrlParams[1]], obsoleteUrlParams: aObsoleteUrlParams }) }
        ];
        Config.emit("/core/userPreferences/entries", aEntries);
        EventHub.emit("UserSettingsOpened", {
            0: true,
            1: true
        });
        sandbox.spy(this.oController, "_showSuccessMessageToast");
        sandbox.spy(this.oController, "_handleSettingsDialogClose");
        sandbox.stub(windowUtils, "refreshBrowser");
        sandbox.stub(windowUtils, "clearSapUserContextCookie");

        // Act
        return this.oController._handleSaveButtonPress().then(() => {
            // Assert
            assert.ok(this.oController._showSuccessMessageToast.calledOnce, "Message toast should be shown");
            assert.ok(this.oController._handleSettingsDialogClose.calledOnce, "Message toast should be shown");
            assert.ok(windowUtils.refreshBrowser.calledOnce, "the browser should be refreshed");
            assert.ok(windowUtils.clearSapUserContextCookie.calledOnce, "the `sap-usercontext` cookie was cleared");
            assert.deepEqual(
                windowUtils.refreshBrowser.getCall(0).args[0],
                aUrlParams,
                "the browser should be refreshed with an updated query string"
            );
            assert.deepEqual(
                windowUtils.refreshBrowser.getCall(0).args[1],
                aObsoleteUrlParams,
                "the browser should be refreshed with a reduced query string"
            );
            assert.strictEqual(this.fnResetChangedProperties.callCount, 1, "resetChangedProperties was called once");
            assert.strictEqual(Element.getElementById("userSettingsMessagePopover"), undefined, "Control with id userSettingsMessagePopover was not created");
        });
    });

    QUnit.module("updateUserPreferences", {
        beforeEach: function (assert) {
            this.oUserInfoService = {
                updateUserPreferences: sandbox.stub().returns(new jQuery.Deferred().resolve())
            };

            sandbox.stub(Container, "getServiceAsync").withArgs("UserInfo").resolves(this.oUserInfoService);
            this.oConfigLastStub = sandbox.stub(Config, "last");

            return Controller.create({
                name: "sap/ushell/components/shell/Settings/UserSettings"
            }).then((oController) => {
                this.oController = oController;
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Positive test", function (assert) {
        const oController = this.oController;
        const oUpdatePromise = oController.updateUserPreferences();

        assert.ok(oUpdatePromise === oController.updateUserPreferences(), "updateUserPreferences returns a singleton");
        assert.ok(oUpdatePromise === oController._updateUserPreferencesPromise, "updateUserPreferences reuses a promise");

        oUpdatePromise.sendRequest();

        return oUpdatePromise.then(() => {
            assert.ok(true, "updateUserPreferences finished OK");
            assert.ok(!oController._updateUserPreferencesPromise, "Reuse Promise instance is deleted");
        });
    });

    QUnit.test("Negative test", function (assert) {
        const oController = this.oController;
        this.oUserInfoService.updateUserPreferences = sandbox.stub().returns(new jQuery.Deferred().reject(new Error("Failed intentionally")));
        const oUpdatePromise = oController.updateUserPreferences();

        assert.ok(oUpdatePromise === oController.updateUserPreferences(), "updateUserPreferences returns a singleton");

        oUpdatePromise.sendRequest();

        return oUpdatePromise.catch(() => {
            assert.ok(true, "updateUserPreferences was rejected");
            assert.ok(!oController._updateUserPreferencesPromise, "Reuse Promise instance is deleted");
        });
    });

    QUnit.module("_afterMasterClose", {
        beforeEach: function () {
            return Controller.create({
                name: "sap/ushell/components/shell/Settings/UserSettings"
            }).then((oController) => {
                this.oController = oController;
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("calls _updateHeaderButtonVisibility", function (assert) {
        // Arrange
        sandbox.stub(this.oController, "_updateHeaderButtonVisibility");

        // Act
        this.oController._afterMasterClose();

        // Assert
        assert.deepEqual(this.oController._updateHeaderButtonVisibility.args, [ [ false ] ], "_updateHeaderButtonVisibility is called");
    });

    QUnit.module("The open method", {
        beforeEach: function () {
            return Controller.create({
                name: "sap/ushell/components/shell/Settings/UserSettings"
            }).then((oController) => {
                this.oController = oController;
                this.oUserSettingsOpenStub = sandbox.stub();
                sandbox.stub(this.oController, "byId").returns({
                    open: this.oUserSettingsOpenStub
                });
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("set targetEntryId and open settings", function (assert) {
        // Arrange
        const sTargetEntryId = "testId";

        // Act
        this.oController.open(sTargetEntryId);

        // Assert
        assert.strictEqual(this.oController.sTargetEntryId, sTargetEntryId, "The open method of sets the target entry ID.");
        assert.strictEqual(this.oUserSettingsOpenStub.callCount, 1, "The open method of the user settings dialog was called once.");
    });
});
