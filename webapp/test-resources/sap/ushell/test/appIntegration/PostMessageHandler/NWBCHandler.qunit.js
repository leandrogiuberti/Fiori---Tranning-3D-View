// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.NWBCHandler
 */
sap.ui.define([
    "sap/ushell/ApplicationType",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/test/utils/MockIframe",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    ApplicationType,
    IframeApplicationContainer,
    PostMessageHandler,
    PostMessageManager,
    MockIframe,
    PostMessageHelper
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("Dirty state handling", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();
            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication)
            });

            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    ["NWBC", "TR"].forEach((sNwbcLikeApplicationType) => {
        QUnit.test(`pro54_setGlobalDirty when application type is ${sNwbcLikeApplicationType}`, async function (assert) {
            // Arrange
            const sGlobalDirtyStorageKey = this.oCurrentApplication.getGlobalDirtyStorageKey();
            this.oCurrentApplication.setApplicationType(ApplicationType.enum[sNwbcLikeApplicationType]);
            localStorage.setItem(sGlobalDirtyStorageKey, "PENDING");

            const oMessage = {
                action: "pro54_setGlobalDirty",
                parameters: { globalDirty: "DIRTY" }
            };
            const oExpectedReply = {
                type: "response",
                service: "sap.ushell.appIntegration.PostMessageManager.NWBCHandler.pro54_setGlobalDirty",
                status: "success",
                body: {}
            };

            // Act
            const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

            // Assert
            const sRequestId = oReply.request_id;
            delete oReply.request_id; // Remove request_id for comparison

            assert.ok(sRequestId, "The reply has a request_id");
            assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");

            const sValue = localStorage.getItem(sGlobalDirtyStorageKey);
            assert.strictEqual(sValue, "DIRTY", "localStorage is in sync with the application container");
        });

        QUnit.test(`pro54_setGlobalDirty when application type is ${sNwbcLikeApplicationType} from different window`, async function (assert) {
            // Arrange
            const sGlobalDirtyStorageKey = this.oCurrentApplication.getGlobalDirtyStorageKey();
            this.oCurrentApplication.setApplicationType(ApplicationType.enum[sNwbcLikeApplicationType]);
            localStorage.setItem(sGlobalDirtyStorageKey, "PENDING");
            const oMockIframe = await new MockIframe().load();
            const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe);

            const oMessage = {
                action: "pro54_setGlobalDirty",
                parameters: { globalDirty: "DIRTY" }
            };
            const oExpectedReply = {
                type: "response",
                service: "sap.ushell.appIntegration.PostMessageManager.NWBCHandler.pro54_setGlobalDirty",
                status: "error"
            };

            // Act
            oMockIframe.postMessageFromIframe(oMessage);
            const oReply = await pResponse;

            // Assert
            const sRequestId = oReply.request_id;
            const oReplyBody = oReply.body;
            delete oReply.request_id; // Remove request_id for comparison
            delete oReply.body; // Remove body for comparison

            assert.ok(sRequestId, "The reply has a request_id");
            assert.ok(oReplyBody, "the reply has a body");
            assert.ok(oReplyBody.message, "the reply has a body with message");
            assert.ok(oReplyBody.stack, "the reply has a body with stack");

            assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");

            const sValue = localStorage.getItem(sGlobalDirtyStorageKey);
            assert.strictEqual(sValue, "PENDING", "localStorage was not updated");

            // Cleanup
            oMockIframe.destroy();
        });

        // todo: [FLPCOREANDUX-10024] test when not PENDING
    });
});
