// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// eslint-disable-next-line no-unused-expressions
window.blanket && window.blanket.options("sap-ui-cover-only", "[sap/ushell/appRuntime/ui5/plugins]");

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/plugin/utils/TestUtil",
    "sap/base/i18n/ResourceBundle",
    "sap/ushell/api/RTA",
    "sap/ushell/appRuntime/ui5/plugins/rtaShell/Component",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer",
    "sap/ui/thirdparty/sinon-4",
    "sap/ui/fl/library"
], (
    jQuery,
    TestUtil,
    ResourceBundle,
    RTAUtils,
    RTAPlugin,
    AppLifeCycleUtils,
    Renderer,
    sinon
) => {
    "use strict";

    /* global QUnit */

    const sandbox = sinon.sandbox.create();
    const sPostMessageGroupId = "user.postapi.rtaPlugin";
    const sStartUIAdaptationPostMessageId = "startUIAdaptation";
    const sAppType = "URL";

    function instantiatePlugin () {
        const oContainer = TestUtil.createContainerObject.call(this, sAppType);
        sandbox.stub(AppLifeCycleUtils, "getContainer").returns(oContainer);
        this.oSetHeaderVisibilityStub = sandbox.stub(RTAUtils, "setShellHeaderVisibility");
        this.oRegisterPostMessageAPIsStub = sandbox.stub();
        this.oPostMessageToAppStub = sandbox.stub().returns(new jQuery.Deferred().resolve());
        this.oPlugin = new RTAPlugin(TestUtil.createComponentData.call(this));
    }

    function getServiceCallFunction (sFunctionName, oRegisterPostMessageAPIsStub) {
        const mPostMessageRegistration = oRegisterPostMessageAPIsStub.lastCall.args[0][sPostMessageGroupId];
        return mPostMessageRegistration.inCalls[sFunctionName].executeServiceCallFn;
    }

    QUnit.module("Given the component is instantiated", {
        beforeEach: function () {
            instantiatePlugin.call(this);
        },
        afterEach: function () {
            this.oPlugin.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("when app gets loaded and is not enabled for key user adaptation", function (assert) {
        const mInitialConfiguration = this.oPlugin.mConfig;
        assert.strictEqual(mInitialConfiguration.sComponentName, "sap.ushell.appRuntime.ui5.plugins.rtaShell",
            "then the component name is set");
        assert.strictEqual(mInitialConfiguration.layer, "CUSTOMER", "then the layer is set");
        assert.ok(mInitialConfiguration.id, "then the button id is prepared");
        assert.ok(mInitialConfiguration.text, "then the button text is prepared");
        assert.ok(mInitialConfiguration.icon.includes("sap-icon://"), "then the icon is prepared");
        assert.notOk(mInitialConfiguration.visible, "then the visibility of the button is initially set to 'false'");
        const mPostMessageRegistration = this.oRegisterPostMessageAPIsStub.getCall(0).args[0][sPostMessageGroupId];
        assert.strictEqual(typeof mPostMessageRegistration.inCalls.activatePlugin.executeServiceCallFn, "function",
            "then the 'activatePlugin' function is registered as inCall in the post message interface");
        assert.strictEqual(typeof mPostMessageRegistration.inCalls.showAdaptUI.executeServiceCallFn, "function",
            "then the 'showAdaptUI' function is registered as inCall in the post message interface");
        assert.strictEqual(typeof mPostMessageRegistration.inCalls.hideAdaptUI.executeServiceCallFn, "function",
            "then the 'hideAdaptUI' function is registered as inCall in the post message interface");
        assert.strictEqual(typeof mPostMessageRegistration.inCalls.switchToolbarVisibility.executeServiceCallFn, "function",
            "then the 'switchToolbarVisibility' function is registered as inCall in the post message interface");
        assert.ok(typeof mPostMessageRegistration.outCalls.startUIAdaptation,
            "then the 'startUIAdaptation' function is registered as outCall in the post message interface");
    });

    QUnit.test("when 'exit' function is called", function (assert) {
        this.oPlugin.exit();
        assert.strictEqual(this.oSetHeaderVisibilityStub.callCount, 1, "then 'setHeaderVisibility' function is called");
    });

    QUnit.test("when 'activatePlugin' is triggered by post message call", function (assert) {
        const fnDone = assert.async();
        const fnExecuteServiceCallFn = getServiceCallFunction("activatePlugin", this.oRegisterPostMessageAPIsStub);
        const oCreateActionButtonStub = sandbox.stub(Renderer, "createActionButton").resolves();

        assert.notOk(this.oPlugin.bIsInitialized,
            "then BEFORE post message service call the plugin is not marked as initialized");
        fnExecuteServiceCallFn()
            .done(() => {
                assert.ok(this.oPlugin.mConfig.i18n instanceof ResourceBundle, "then the resource bundle is prepared");
                assert.ok(this.oPlugin.bIsInitialized,
                    "then AFTER post message service call the plugin is marked as initialized");
                assert.ok(oCreateActionButtonStub, "then 'Renderer.createActionButton' function is called");
                assert.strictEqual(typeof oCreateActionButtonStub.lastCall.args[1], "function",
                    "then 'handler' function is passed to the actionButton");
                assert.strictEqual(oCreateActionButtonStub.lastCall.args[2], false,
                    "then visibility of the button is set to 'false'");
                fnDone();
            });
    });

    QUnit.test("when 'activatePlugin' is triggered by post message call and execution breaks", function (assert) {
        const fnDone = assert.async();
        const fnExecuteServiceCallFn = getServiceCallFunction("activatePlugin", this.oRegisterPostMessageAPIsStub, "Error_test");
        sandbox.stub(Renderer, "createActionButton").rejects(new Error("Error_test"));

        fnExecuteServiceCallFn()
            .done(() => {
                assert.notOk(true, "then done shouldn't be called");
            })
            .fail(() => {
                assert.ok(this.oPlugin.mConfig.i18n instanceof ResourceBundle, "then the resource bundle is prepared");
                assert.notOk(this.oPlugin.bIsInitialized,
                    "then AFTER post message service call the plugin is NOT marked as initialized");
                fnDone();
            });
    });

    QUnit.module("Given the component is instantiated and activated via post message call", {
        beforeEach: function () {
            instantiatePlugin.call(this);
            this.oStubbedActionButton = {
                showForAllApps: sandbox.stub(),
                hideForAllApps: sandbox.stub()
            };
            this.oCreateActionButtonStub = sandbox.stub(Renderer, "createActionButton").resolves(this.oStubbedActionButton);
            const fnExecuteServiceCallFn = getServiceCallFunction("activatePlugin", this.oRegisterPostMessageAPIsStub);
            return new Promise((resolve, reject) => {
                fnExecuteServiceCallFn()
                    .then(resolve)
                    .catch(reject);
            });
        },
        afterEach: function () {
            this.oPlugin.destroy();
            sandbox.restore();
        }
    });

    function createServiceParameters (bVisible) {
        return {
            oMessageData: {
                body: {
                    visible: bVisible
                }
            }
        };
    }

    [true, false].forEach((bVisible) => {
        QUnit.test(`when 'switchToolbarVisibility' functionality is triggered ${
            bVisible ? "ON" : "OFF"} by post message call`, function (assert) {
            const fnDone = assert.async();
            const fnExecuteServiceCallFn = getServiceCallFunction("switchToolbarVisibility", this.oRegisterPostMessageAPIsStub);
            const oServiceParams = createServiceParameters(bVisible);
            fnExecuteServiceCallFn(oServiceParams)
                .done(() => {
                    assert.strictEqual(this.oSetHeaderVisibilityStub.callCount, 1, "the header visibility setter was called");
                    assert.deepEqual(this.oSetHeaderVisibilityStub.lastCall.args, [bVisible, false], "the header visibility was set correctly");
                    fnDone();
                });
        });
    });

    QUnit.test("when 'showAdaptUI' functionality is triggered by post message call", async function (assert) {
        const fnExecuteServiceCallFn = getServiceCallFunction("showAdaptUI", this.oRegisterPostMessageAPIsStub);
        await fnExecuteServiceCallFn();
        assert.ok(this.oStubbedActionButton.showForAllApps.calledOnce, "then the action button is shown");
    });

    QUnit.test("when 'showAdaptUI' functionality is triggered by post message call with application type !== 'URL'", async function (assert) {
        const oGetAppLifeCycleServiceStub = sandbox.stub(AppLifeCycleUtils, "getAppLifeCycleService").callsFake(async () => {
            const oAppLifeCycleService = await oGetAppLifeCycleServiceStub.wrappedMethod();
            oAppLifeCycleService.getCurrentApplication = () => ({
                applicationType: "UI5"
            });
            return oAppLifeCycleService;
        });
        const fnExecuteServiceCallFn = getServiceCallFunction("showAdaptUI", this.oRegisterPostMessageAPIsStub);
        await fnExecuteServiceCallFn();
        assert.ok(this.oStubbedActionButton.hideForAllApps.calledOnce, "then the action button is hidden");
    });

    QUnit.test("when 'showAdaptUI' functionality is triggered by post message call and action button do not exist", async function (assert) {
        const fnExecuteServiceCallFn = getServiceCallFunction("showAdaptUI", this.oRegisterPostMessageAPIsStub);
        try {
            await fnExecuteServiceCallFn();
            assert.ok(true, "then the function call doesn't break");
        } catch (oError) {
            assert.notOk(true, "then the error shouldn't be thrown");
        }
    });

    QUnit.test("when 'hideAdaptUI' functionality is triggered by post message call", async function (assert) {
        const fnExecuteServiceCallFn = getServiceCallFunction("hideAdaptUI", this.oRegisterPostMessageAPIsStub);
        await fnExecuteServiceCallFn();
        assert.ok(this.oStubbedActionButton.hideForAllApps.calledOnce, "then the action button is hidden");
    });

    QUnit.test("when 'postStartUIAdaptationToApp' function is triggered", async function (assert) {
        const fnPostStartUIAdaptationHandler = this.oCreateActionButtonStub.lastCall.args[1];
        await fnPostStartUIAdaptationHandler();
        assert.strictEqual(this.oSetHeaderVisibilityStub.callCount, 1,
            "then the hiding styleclass is added to the header (header gets invisible)");
        assert.ok(this.oPostMessageToAppStub.calledOnce,
            "then the postmessage 'postStartUIAdaptationToApp' is triggered");
        assert.strictEqual(this.oPostMessageToAppStub.lastCall.args[0], sPostMessageGroupId,
            "then the postmessage group id is provided");
        assert.strictEqual(this.oPostMessageToAppStub.lastCall.args[1], sStartUIAdaptationPostMessageId,
            "then the postmessage id is provided");
    });

    QUnit.test("when 'postStartUIAdaptationToApp' function is triggered and message returns status 'stopped'", async function (assert) {
        const fnPostStartUIAdaptationHandler = this.oCreateActionButtonStub.lastCall.args[1];
        this.oPostMessageToAppStub.returns(new jQuery.Deferred().resolve("stopped"));
        await fnPostStartUIAdaptationHandler();
        assert.ok(this.oSetHeaderVisibilityStub.calledWith(true), "then the header visibility is set to true again");
    });

    QUnit.test("when 'postStartUIAdaptationToApp' function is triggered and message fails", async function (assert) {
        const fnPostStartUIAdaptationHandler = this.oCreateActionButtonStub.lastCall.args[1];
        this.oPostMessageToAppStub.returns(new jQuery.Deferred().reject());
        try {
            await fnPostStartUIAdaptationHandler();
        } catch (oError) {
            assert.ok(this.oSetHeaderVisibilityStub.calledWith(true), "then the header visibility is set to true again");
        }
    });
});
