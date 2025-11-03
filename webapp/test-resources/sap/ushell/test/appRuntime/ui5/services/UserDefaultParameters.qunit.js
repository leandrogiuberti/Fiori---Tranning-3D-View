// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.services.UserDefaultParameters
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/services/Container"

], (
    jQuery,
    AppCommunicationMgr,
    Container
) => {
    "use strict";
    /* global sinon, QUnit */

    const sandbox = sinon.sandbox.create({});

    window["sap-ushell-config"] = {
        services: {
            UserDefaultParameters: {
                module: "sap.ushell.appRuntime.ui5.services.UserDefaultParameters",
                adapter: {
                    module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                }
            }
        }
    };

    QUnit.module("sap.ushell.test.appRuntime.ui5.services.UserDefaultParameters", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            const oDeferred = new jQuery.Deferred();
            oDeferred.resolve("testValue");

            this.oSendMessageToOuterShellStub = sandbox.stub(AppCommunicationMgr, "sendMessageToOuterShell").returns(oDeferred.promise());

            Container.init("local").then(() => {
                Container.getServiceAsync("UserDefaultParameters").then((UserDefaultParameters) => {
                    this.oUserDefaultParameters = UserDefaultParameters;
                    fnDone();
                });
            });
        },
        afterEach: function () {
        }
    });
    QUnit.test("getValue", function (assert) {
        const fnDone = assert.async();

        this.oUserDefaultParameters.getValue("testParam").then((sValue) => {
            assert.strictEqual(sValue, "testValue", "The value was returned.");
            assert.strictEqual(this.oSendMessageToOuterShellStub.callCount, 1, "sendMessageToOuterShell was called once.");
            assert.deepEqual(this.oSendMessageToOuterShellStub.firstCall.args, [
                "sap.ushell.services.UserDefaultParameters.getValue",
                { sParameterName: "testParam" }
            ], "sendMessageToOuterShell was called with the expected parameters.");
            fnDone();
        });
    });
});
