// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.AppCommunicationMgr
 */
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/base/Log",
    "sap/base/util/isEmptyObject",
    "sap/ui/thirdparty/jquery"
], (
    AppCommunicationMgr,
    Log,
    isEmptyObject,
    jQuery
) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("sap.ushell.appRuntime.ui5.AppCommunicationMgr", {
        beforeEach: function () {
            // Do not use the parent window as it may not be the same instance in some cases
            sandbox.stub(AppCommunicationMgr, "_getTargetWindow").returns(window);
            sandbox.stub(AppCommunicationMgr, "_isTrustedPostMessageSource").returns(true);
        },
        afterEach: function () {
            AppCommunicationMgr.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("test postMessage", function (assert) {
        const done = assert.async();

        function fnHandleMessageEvent (oMessage) {
            const oMessageData = JSON.parse(oMessage.data);

            assert.strictEqual(oMessageData.a, 1, "ApplicationContainer.postMessage - Message successfully passed");
            removeEventListener("message", fnHandleMessageEvent);

            done();
        }
        addEventListener("message", fnHandleMessageEvent);

        AppCommunicationMgr.postMessage({
            a: 1
        });
    });

    QUnit.test("test sendMessageToOuterShell", async function (assert) {
        const oMsg = {
            service: "test.add",
            body: { x: 1, y: 2 },
            request_id: "1111"
        };

        function fnHandleMessageEvent (oMessage) {
            removeEventListener("message", fnHandleMessageEvent);

            const oMessageData = JSON.parse(oMessage.data);

            function calculateReply (oMessageData) {
                return oMessageData.body.x + oMessageData.body.y;
            }
            const oResponse = {
                type: "response",
                service: oMsg.service,
                request_id: oMsg.request_id,
                status: "success",
                body: {
                    result: {
                        result: calculateReply(oMessageData)
                    }
                }
            };
            window.postMessage(JSON.stringify(oResponse), "*");
        }
        addEventListener("message", fnHandleMessageEvent);

        AppCommunicationMgr.init();

        const oResult = await AppCommunicationMgr.sendMessageToOuterShell(oMsg.service, oMsg.body, oMsg.request_id);
        assert.strictEqual(oResult.result, 3, "ApplicationContainer.postMessage - Result successfully passed to IFrame");
    });

    QUnit.test("test sendMessageToOuterShell with empty body", async function (assert) {
        const oMsg = {
            service: "test.noInput",
            body: {},
            request_id: "2222"
        };

        function fnHandleMessageEvent (oMessage) {
            removeEventListener("message", fnHandleMessageEvent);

            const oMessageData = JSON.parse(oMessage.data);

            function calculateReply (oMessageData) {
                if (isEmptyObject(oMessageData.body)) {
                    return "ok";
                }
                return "NOT ok";
            }
            const oResponse = {
                type: "response",
                service: oMsg.service,
                request_id: oMsg.request_id,
                status: "success",
                body: {
                    result: {
                        result: calculateReply(oMessageData)
                    }
                }
            };
            window.postMessage(JSON.stringify(oResponse), "*");
        }
        addEventListener("message", fnHandleMessageEvent);

        AppCommunicationMgr.init();

        const oResult = await AppCommunicationMgr.sendMessageToOuterShell(oMsg.service, oMsg.body, oMsg.request_id);
        assert.strictEqual(oResult.result, "ok", "ApplicationContainer.postMessage - Result successfully passed to IFrame");
    });

    QUnit.test("test _handleMessageEvent", function (assert) {
        const done = assert.async();

        AppCommunicationMgr.init();

        AppCommunicationMgr.setRequestHandler(
            "sap.ushell.services.appLifeCycle.subscribe",
            () => {
                return new jQuery.Deferred().resolve({
                    action: "subscribe"
                }).promise();
            }
        );

        AppCommunicationMgr.setRequestHandler(
            "qunit.test.add",
            (oMessageBody, oMessageEvent) => {
                const x = oMessageBody.x;
                const y = oMessageBody.y;
                return new jQuery.Deferred().resolve(x + y).promise();
            }
        );

        function fnHandleMessageEvent (oMessage) {
            const oMessageData = JSON.parse(oMessage.data);
            if (oMessageData && oMessageData.type && oMessageData.type === "request") {
                return;
            }
            if (oMessageData && oMessageData.type && oMessageData.type === "response") {
                if (oMessageData.service === "sap.ushell.services.appLifeCycle.subscribe") {
                    assert.strictEqual(oMessageData.body.result.action, "subscribe", "ApplicationContainer.handleMessageEvent - Result successfully passed to IFrame");
                } else {
                    assert.strictEqual(oMessageData.body.result, 5, "ApplicationContainer.handleMessageEvent - Result successfully passed to IFrame");
                }

                window.removeEventListener("message", fnHandleMessageEvent);
                done();
            }
        }

        window.addEventListener("message", fnHandleMessageEvent);

        window.postMessage('{"type":"request","request_id":"1234","service":"qunit.test.add","body":{"x":2, "y":3}}', "*");
    });

    [
        {
            input: {
                oMessage: {
                    source: window,
                    data: '{"type":"request","request_id":"1111","service":"qunit.test.add","body":{"x": 1, "y": 2}}',
                    origin: "*"
                },
                oMessageData: {
                    service: "qunit.test.add",
                    body: { x: 1, y: 2 },
                    request_id: "1111",
                    type: "request"
                }
            },
            output: {
                result: 3,
                status: "success"
            }
        }
    ].forEach((oFixture) => {
        QUnit.test("test _handleMessageRequest - valid message", function (assert) {
            const done = assert.async();

            AppCommunicationMgr.init();

            AppCommunicationMgr.setRequestHandler(
                "qunit.test.add",
                (oMessageBody, oMessageEvent) => {
                    const x = oMessageBody.x;
                    const y = oMessageBody.y;
                    return new jQuery.Deferred().resolve(x + y).promise();
                }
            );

            function fnHandleMessageEvent (oMessage) {
                const oMessageData = JSON.parse(oMessage.data);
                if (oMessageData && oMessageData.type && oMessageData.type === "request") {
                    return;
                }
                if (oMessageData && oMessageData.type && oMessageData.type === "response") {
                    assert.strictEqual(oFixture.output.status, oMessageData.status, "ApplicationContainer._handleMessageRequest - The request status received as expected");

                    if (oMessageData.status === "success") {
                        assert.strictEqual(oFixture.output.result, oMessageData.body.result, "ApplicationContainer._handleMessageRequest - Result successfully passed to IFrame");
                    } else if (oMessageData.status === "error") {
                        assert.strictEqual(oFixture.output.result, oMessageData.body.message, "ApplicationContainer._handleMessageRequest - Error message successfully passed to IFrame");
                    }

                    done();
                    removeEventListener("message", fnHandleMessageEvent);
                }
            }
            addEventListener("message", fnHandleMessageEvent);

            AppCommunicationMgr._handleMessageRequest(oFixture.input.oMessage, oFixture.input.oMessageData);
        });
    });

    QUnit.test("test _handleMessageRequest - error message", function (assert) {
        const fnWarning = sinon.spy(Log, "warning");

        AppCommunicationMgr.init();

        AppCommunicationMgr._handleMessageRequest({
            source: window,
            data: '{"type":"request","request_id":"1111","service":"wrong.service","body":{"x": 1, "y": 2}}',
            origin: "*"
        }, {
            service: "wrong.service", // wrong service was sent
            body: { x: 1, y: 2 },
            request_id: "1111",
            type: "request"
        });

        assert.ok(fnWarning.calledOnce, "Log warining called 1 times");
        assert.ok(fnWarning.getCall(0).args[0].indexOf("App Runtime received message with unknown service name (wrong.service)") >= 0, "Log warning text correct");

        fnWarning.restore();
    });

    QUnit.module("postMessageToFLP, sendMessageToOuterShell");

    const arrTests = [{
        input: {
            sMessageId: "sap.ushell.services.dummy1",
            oParams: {},
            sRequestId: "1111"
        },
        output: {
            response: {
                data: '{"type":"response","service":"sap.ushell.services.dummy1","request_id":"1111","status":"success","body":{"result": {"a": 1}}}',
                origin: "test"
            },
            type: "success"
        }
    }, {
        input: {
            sMessageId: "sap.ushell.services.dummy2",
            oParams: {},
            sRequestId: "2222"
        },
        output: {
            response: {
                data: '{"type":"response","service":"sap.ushell.services.dummy1","request_id":"2222","status":"fail","body":{"a": "0"}}',
                origin: "test"
            },
            type: "fail"
        }
    }];

    arrTests.forEach((oFixture) => {
        QUnit.test("Test sendMessageToOuterShell", function (assert) {
            const done = assert.async();
            const getTargetWindowSinon = sinon.stub(AppCommunicationMgr, "_getTargetWindow").returns({
                postMessage: function () {
                    setTimeout(() => {
                        AppCommunicationMgr._handleMessageEvent(oFixture.output.response);
                    }, 200);
                }
            });

            AppCommunicationMgr.sendMessageToOuterShell(
                oFixture.input.sMessageId,
                oFixture.input.oParams,
                oFixture.input.sRequestId
            ).done((response) => {
                assert.ok(oFixture.output.type === "success", "request should be success");
                done();
            }).fail(() => {
                assert.ok(oFixture.output.type === "fail", "request should be fail");
                done();
            });

            getTargetWindowSinon.restore();
        });
    });

    arrTests.forEach((oFixture) => {
        QUnit.test("Test postMessageToFLP", function (assert) {
            const done = assert.async();
            const getTargetWindowSinon = sinon.stub(AppCommunicationMgr, "_getTargetWindow").returns({
                postMessage: function () {
                    setTimeout(() => {
                        AppCommunicationMgr._handleMessageEvent(oFixture.output.response);
                    }, 200);
                }
            });

            const oPromise = AppCommunicationMgr.postMessageToFLP(
                oFixture.input.sMessageId,
                oFixture.input.oParams,
                oFixture.input.sRequestId
            );

            assert.ok(!oPromise.hasOwnProperty("done"));
            assert.ok(!oPromise.hasOwnProperty("fail"));

            oPromise
                .then((response) => {
                    assert.ok(oFixture.output.type === "success", "request should be success");
                    done();
                })
                .catch(() => {
                    assert.ok(oFixture.output.type === "fail", "request should be fail");
                    done();
                });

            getTargetWindowSinon.restore();
        });
    });
});
