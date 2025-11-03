// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.AppStateHandler
 */
sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/services/appstate/AppState",
    "sap/ushell/services/Navigation/compatibility",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    hasher,
    jQuery,
    PostMessageHandler,
    PostMessageManager,
    Container,
    AppState,
    navigationCompatibility,
    PostMessageHelper
) => {
    "use strict";

    /* global sinon, QUnit */

    sinon.addBehavior("resolvesDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().resolve(...vValue).promise());
    });

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("AppState", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");
            this.Navigation = {};
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);
            this.AppState = {};
            Container.getServiceAsync.withArgs("AppState").resolves(this.AppState);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.AppState.getAppState", async function (assert) {
        // Arrange
        const oAppState = new AppState(
            {
                id: "MockServiceInstance"
            }, // oServiceInstance
            "AS1234", // sKey
            true, // bModifiable
            JSON.stringify({ foo: "bar" }), // sData
            "appName", // sAppName
            "CA-FLP-FE-UI", // sACHComponent
            false, // bTransient
            "persistencyMethod", // sPersistencyMethod
            { id: "persistencySettings" } // oPersistencySettings
        );
        this.AppState.getAppState = sandbox.stub().resolvesDeferred(oAppState);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppState.getAppState",
            body: {
                sKey: "AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.AppState.getAppState",
            body: {
                result: {
                    _sKey: "AS1234",
                    _bModifiable: true,
                    _sData: JSON.stringify({ foo: "bar" }),
                    _sAppName: "appName",
                    _sACHComponent: "CA-FLP-FE-UI",
                    _bTransient: false,
                    _sPersistencyMethod: "persistencyMethod",
                    _oPersistencySettings: { id: "persistencySettings" }
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.AppState.getAppState.getCall(0).args, [oMessage.body.sKey], "getAppState was called correctly");
    });

    QUnit.test("sap.ushell.services.AppState._saveAppState", async function (assert) {
        // Arrange
        this.AppState._saveAppState = sandbox.stub().resolvesDeferred();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppState._saveAppState",
            body: {
                sKey: "AS1234",
                sData: JSON.stringify({ foo: "bar" }),
                sAppName: "appName",
                sComponent: "sap.ushell.demo.AppNavSample",
                bTransient: true,
                iPersistencyMethod: "persistencyMethod",
                oPersistencySettings: { id: "persistencySettings" }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.AppState._saveAppState",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.sKey,
            oMessage.body.sData,
            oMessage.body.sAppName,
            oMessage.body.sComponent,
            oMessage.body.bTransient,
            oMessage.body.iPersistencyMethod,
            oMessage.body.oPersistencySettings
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.AppState._saveAppState.getCall(0).args, aExpectedArgs, "_saveAppState was called correctly");
    });

    QUnit.test("sap.ushell.services.AppState.deleteAppState", async function (assert) {
        // Arrange
        this.AppState.deleteAppState = sandbox.stub().resolvesDeferred();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppState.deleteAppState",
            body: {
                sKey: "AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.AppState.deleteAppState",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.AppState.deleteAppState.getCall(0).args, [oMessage.body.sKey], "deleteAppState was called correctly");
    });

    QUnit.test("sap.ushell.services.AppState.makeStatePersistent", async function (assert) {
        // Arrange
        this.AppState.makeStatePersistent = sandbox.stub().resolvesDeferred("AS5678");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppState.makeStatePersistent",
            body: {
                sKey: "AS1234",
                iPersistencyMethod: "persistencyMethod",
                oPersistencySettings: { id: "persistencySettings" }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.AppState.makeStatePersistent",
            body: {
                result: "AS5678"
            }
        };

        const aExpectedArgs = [
            oMessage.body.sKey,
            oMessage.body.iPersistencyMethod,
            oMessage.body.oPersistencySettings
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.AppState.makeStatePersistent.getCall(0).args, aExpectedArgs, "makeStatePersistent was called correctly");
    });

    QUnit.test("sap.ushell.services.Navigation.getAppState", async function (assert) {
        // Arrange
        const oAppState = new AppState(
            {
                id: "MockServiceInstance"
            }, // oServiceInstance
            "AS1234", // sKey
            true, // bModifiable
            JSON.stringify({ foo: "bar" }), // sData
            "appName", // sAppName
            "CA-FLP-FE-UI", // sACHComponent
            false, // bTransient
            "persistencyMethod", // sPersistencyMethod
            { id: "persistencySettings" } // oPersistencySettings
        );
        this.Navigation.getAppState = sandbox.stub().resolves(oAppState);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.getAppState",
            body: {
                sAppStateKey: "AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.getAppState",
            body: {
                result: {
                    _sKey: "AS1234",
                    _bModifiable: true,
                    _sData: JSON.stringify({ foo: "bar" }),
                    _sAppName: "appName",
                    _sACHComponent: "CA-FLP-FE-UI",
                    _bTransient: false,
                    _sPersistencyMethod: "persistencyMethod",
                    _oPersistencySettings: { id: "persistencySettings" }
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        const oProvidedComponent = this.Navigation.getAppState.getCall(0).args[0];
        assert.ok(oProvidedComponent.isA("sap.ui.core.UIComponent"), "A component was provided");
        assert.strictEqual(this.Navigation.getAppState.getCall(0).args[1], oMessage.body.sAppStateKey, "getAppState was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getAppState", async function (assert) {
        // Arrange
        const oAppState = new AppState(
            {
                id: "MockServiceInstance"
            }, // oServiceInstance
            "AS1234", // sKey
            true, // bModifiable
            JSON.stringify({ foo: "bar" }), // sData
            "appName", // sAppName
            "CA-FLP-FE-UI", // sACHComponent
            false, // bTransient
            "persistencyMethod", // sPersistencyMethod
            { id: "persistencySettings" } // oPersistencySettings
        );
        this.Navigation.getAppState = sandbox.stub().resolves(oAppState);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getAppState",
            body: {
                sAppStateKey: "AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.getAppState",
            body: {
                result: {
                    _sKey: "AS1234",
                    _bModifiable: true,
                    _sData: JSON.stringify({ foo: "bar" }),
                    _sAppName: "appName",
                    _sACHComponent: "CA-FLP-FE-UI",
                    _bTransient: false,
                    _sPersistencyMethod: "persistencyMethod",
                    _oPersistencySettings: { id: "persistencySettings" }
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        const oProvidedComponent = this.Navigation.getAppState.getCall(0).args[0];
        assert.ok(oProvidedComponent.isA("sap.ui.core.UIComponent"), "A component was provided");
        assert.strictEqual(this.Navigation.getAppState.getCall(0).args[1], oMessage.body.sAppStateKey, "getAppState was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getAppStateData - success", async function (assert) {
        // Arrange
        sandbox.stub(navigationCompatibility, "getAppStateData").resolves({ foo: "bar" });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getAppStateData",
            body: { sAppStateKey: "AS1234" }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.getAppStateData",
            body: {
                result: { foo: "bar" }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(navigationCompatibility.getAppStateData.getCall(0).args, [oMessage.body.sAppStateKey], "getAppStateData was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getAppStateData - error", async function (assert) {
        // Arrange
        const oError = new Error("rejected!");
        sandbox.stub(navigationCompatibility, "getAppStateData").rejects(oError);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getAppStateData",
            body: { sAppStateKey: "AS1234" }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.CrossApplicationNavigation.getAppStateData",
            body: { message: oError.message, stack: oError.stack }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(navigationCompatibility.getAppStateData.getCall(0).args, [oMessage.body.sAppStateKey], "getAppStateData was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData - add inner app route with state & also saves non JSON", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B");
        sandbox.stub(hasher, "replaceHash").callsFake(() => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing is disabled");
        });

        const oNewAppState = new AppState(
            {}, // oServiceInstance
            "AS5678", // sKey
            true // bModifiable
        );
        sandbox.stub(oNewAppState, "setData");
        sandbox.stub(oNewAppState, "save").resolvesDeferred();
        sandbox.stub(oNewAppState, "getKey").returns("AS5678");
        this.AppState.createEmptyAppState = sandbox.stub().returns(oNewAppState);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData",
            body: {
                sData: "<Cannot be parsed as JSON>"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData",
            body: {
                result: "AS5678"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(hasher.replaceHash.getCall(0).args, ["SemanticObject-Action?A=B&/sap-iapp-state=AS5678"], "replaceHash was called correctly");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "hash change processing is enabled again");

        assert.deepEqual(oNewAppState.setData.getCall(0).args, [oMessage.body.sData], "setData was called with the correct data");
        assert.strictEqual(oNewAppState.save.callCount, 1, "save was called once");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData - add state to inner app route & defaults to empty object", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B&/View1");
        sandbox.stub(hasher, "replaceHash").callsFake(() => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing is disabled");
        });

        const oNewAppState = new AppState(
            {}, // oServiceInstance
            "AS5678", // sKey
            true // bModifiable
        );
        sandbox.stub(oNewAppState, "setData");
        sandbox.stub(oNewAppState, "save").resolvesDeferred();
        sandbox.stub(oNewAppState, "getKey").returns("AS5678");
        this.AppState.createEmptyAppState = sandbox.stub().returns(oNewAppState);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData",
            body: {
                result: "AS5678"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(hasher.replaceHash.getCall(0).args, ["SemanticObject-Action?A=B&/View1/sap-iapp-state=AS5678"], "replaceHash was called correctly");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "hash change processing is enabled again");

        assert.deepEqual(oNewAppState.setData.getCall(0).args, [{}], "setData was called with the correct data");
        assert.strictEqual(oNewAppState.save.callCount, 1, "save was called once");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData - replace state", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B&/View1/?sap-iapp-state=AS1234");
        sandbox.stub(hasher, "replaceHash").callsFake(() => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing is disabled");
        });

        const oNewAppState = new AppState(
            {}, // oServiceInstance
            "AS5678", // sKey
            true // bModifiable
        );
        sandbox.stub(oNewAppState, "setData");
        sandbox.stub(oNewAppState, "save").resolvesDeferred();
        sandbox.stub(oNewAppState, "getKey").returns("AS5678");
        this.AppState.createEmptyAppState = sandbox.stub().returns(oNewAppState);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData",
            body: {
                sData: JSON.stringify({ foo: "bar" })
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData",
            body: {
                result: "AS5678"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(hasher.replaceHash.getCall(0).args, ["SemanticObject-Action?A=B&/View1/?sap-iapp-state=AS5678"], "replaceHash was called correctly");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "hash change processing is enabled again");

        assert.deepEqual(oNewAppState.setData.getCall(0).args, [JSON.parse(oMessage.body.sData)], "setData was called with the correct data");
        assert.strictEqual(oNewAppState.save.callCount, 1, "save was called once");
    });
});
