// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.utils.CallbackQueue
 */
sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ushell/utils/CallbackQueue",
    "sap/ushell/utils"
], (
    Deferred,
    CallbackQueue,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("push", {
        beforeEach: function () {
            this.oCallbackQueue = new CallbackQueue();
        },
        afterEach: async function () {
            await this.oCallbackQueue.waitAllSettled();

            sandbox.restore();
        }
    });

    QUnit.test("Adds a promise to the queue", async function (assert) {
        // Arrange
        const oDeferred = new Deferred();
        oDeferred.resolve("result");
        const oCallback = sandbox.stub().returns(oDeferred.promise);

        // Act
        const sResult = await this.oCallbackQueue.push(oCallback);

        // Assert
        assert.strictEqual(oCallback.callCount, 1, "The callback should be called once");
        assert.strictEqual(sResult, "result", "The result should be the same as the resolved promise");
    });

    QUnit.test("Adds sync callbacks to the queue", async function (assert) {
        // Arrange
        const oCallback = sandbox.stub().returns("result");

        // Act
        const sResult = await this.oCallbackQueue.push(oCallback);

        // Assert
        assert.strictEqual(oCallback.callCount, 1, "The callback should be called once");
        assert.strictEqual(sResult, "result", "The result should be the same as the resolved promise");
    });

    QUnit.test("Adds a failing promise to the queue", async function (assert) {
        // Arrange
        const oDeferred = new Deferred();
        const oErrorMock = new Error("Test error");
        oDeferred.reject(oErrorMock);
        const oCallback = sandbox.stub().returns(oDeferred.promise);

        // Act
        await this.oCallbackQueue.push(oCallback)
            .then(() => {
                assert.ok(false, "The promise should be rejected");
            })
            .catch((oError) => {
                assert.strictEqual(oError, oErrorMock, "The error should be the same as the mocked error");
            });

        // Assert
        assert.strictEqual(oCallback.callCount, 1, "The callback should be called once");
    });

    QUnit.test("Adds multiple callbacks to the queue", async function (assert) {
        // Arrange
        const oDeferred1 = new Deferred();
        oDeferred1.resolve("result 1");
        const oCallback1 = sandbox.stub().returns(oDeferred1.promise);
        const oDeferred2 = new Deferred();
        oDeferred2.resolve("result 2");
        const oCallback2 = sandbox.stub().returns(oDeferred2.promise);
        const oDeferred3 = new Deferred();
        oDeferred3.resolve("result 3");
        const oCallback3 = sandbox.stub().returns(oDeferred3.promise);

        // Act
        const [
            sResult1,
            sResult2,
            sResult3
        ] = await Promise.all([
            this.oCallbackQueue.push(oCallback1),
            this.oCallbackQueue.push(oCallback2),
            this.oCallbackQueue.push(oCallback3)
        ]);

        // Assert
        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallback2.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallback3.callCount, 1, "The callback should be called once");

        assert.ok(oCallback1.calledBefore(oCallback2), "Callback 1 should be called before Callback 2");
        assert.ok(oCallback2.calledBefore(oCallback3), "Callback 2 should be called before Callback 3");

        assert.strictEqual(sResult1, "result 1", "The result should be the same as the resolved promise");
        assert.strictEqual(sResult2, "result 2", "The result should be the same as the resolved promise");
        assert.strictEqual(sResult3, "result 3", "The result should be the same as the resolved promise");
    });

    QUnit.test("Adds multiple callbacks to the queue and awaits the correct order", async function (assert) {
        // Arrange
        const done = assert.async();
        const oDeferred1 = new Deferred();
        const oCallback1 = sandbox.stub().returns(oDeferred1.promise);
        const oDeferred2 = new Deferred();
        const oCallback2 = sandbox.stub().returns(oDeferred2.promise);
        const oDeferred3 = new Deferred();
        const oCallback3 = sandbox.stub().returns(oDeferred3.promise);
        const oDeferred4 = new Deferred();
        const oCallback4 = sandbox.stub().returns(oDeferred4.promise);

        // Act
        Promise.all([
            this.oCallbackQueue.push(oCallback1),
            this.oCallbackQueue.push(oCallback2),
            this.oCallbackQueue.push(oCallback3),
            this.oCallbackQueue.push(oCallback4)
        ]).then(() => {
            // Assert
            assert.ok(oCallback1.calledBefore(oCallback2), "Callback 1 should be called before Callback 2");
            assert.ok(oCallback2.calledBefore(oCallback3), "Callback 2 should be called before Callback 3");
            assert.ok(oCallback3.calledBefore(oCallback4), "Callback 3 should be called before Callback 4");

            done();
        });

        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallback2.callCount, 0, "The second callback should not be called");
        assert.strictEqual(oCallback3.callCount, 0, "The third callback should not be called");
        assert.strictEqual(oCallback4.callCount, 0, "The fourth callback should not be called");

        oDeferred2.resolve();
        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallback2.callCount, 0, "The second callback should not be called once");
        assert.strictEqual(oCallback3.callCount, 0, "The third callback should not be called");
        assert.strictEqual(oCallback4.callCount, 0, "The fourth callback should not be called");

        oDeferred1.resolve();
        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallback2.callCount, 1, "The second callback should be called once");
        assert.strictEqual(oCallback3.callCount, 1, "The third callback should be called");
        assert.strictEqual(oCallback4.callCount, 0, "The fourth callback should not be called");

        oDeferred3.resolve();
        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallback2.callCount, 1, "The second callback should be called once");
        assert.strictEqual(oCallback3.callCount, 1, "The third callback should be called");
        assert.strictEqual(oCallback4.callCount, 1, "The fourth callback should be called");

        oDeferred4.resolve();
    });

    QUnit.test("Even error callbacks are awaited", async function (assert) {
        // Arrange
        const done = assert.async();
        const oDeferred1 = new Deferred();
        const oCallback1 = sandbox.stub().returns(oDeferred1.promise);
        const oCallback1ErrorMock = new Error("Test error - callback 1");

        const oDeferredError1 = new Deferred();
        const oCallbackError1 = sandbox.stub().returns(oDeferredError1.promise);
        const oCallbackError1ErrorMock = new Error("Test error - callback error 1");

        const oDeferred2 = new Deferred();
        const oCallback2 = sandbox.stub().returns(oDeferred2.promise);
        const oCallbackError2 = sandbox.stub().returns("Result - callback error 2"); // sync error callback

        // Act
        Promise.all([
            this.oCallbackQueue.push(oCallback1, oCallbackError1)
                .then(() => {
                    assert.ok(false, "The promise should be rejected");
                })
                .catch((oError) => {
                    assert.strictEqual(oError, oCallbackError1ErrorMock, "The error callback should be rejected with the correct error");
                }),
            this.oCallbackQueue.push(oCallback2, oCallbackError2)
                .then((sResult) => {
                    assert.strictEqual(sResult, "Result - callback error 2", "The error callback should return the correct result");
                })
        ]).then(() => {
            // Assert
            assert.ok(oCallback1.calledBefore(oCallbackError1), "Callback 1 should be called before Callback Error 1");
            assert.ok(oCallbackError1.calledBefore(oCallback2), "Callback Error 1 should be called before Callback 2");
            assert.ok(oCallback2.calledBefore(oCallbackError2), "Callback 2 should be called before Callback Error 2");

            done();
        });

        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallbackError1.callCount, 0, "The error callback should not be called");
        assert.strictEqual(oCallback2.callCount, 0, "The second callback should not be called");
        assert.strictEqual(oCallbackError2.callCount, 0, "The second error callback should not be called");

        oDeferred1.reject(oCallback1ErrorMock);
        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallbackError1.callCount, 1, "The error callback should be called once");
        assert.strictEqual(oCallback2.callCount, 0, "The second callback should not be called");
        assert.strictEqual(oCallbackError2.callCount, 0, "The second error callback should not be called");

        oDeferredError1.reject(oCallbackError1ErrorMock);
        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallbackError1.callCount, 1, "The error callback should be called once");
        assert.strictEqual(oCallback2.callCount, 1, "The second callback should be called once");
        assert.strictEqual(oCallbackError2.callCount, 0, "The second error callback should not be called");

        oDeferred2.reject(new Error("Test error"));
        await ushellUtils.awaitTimeout(0);

        assert.strictEqual(oCallback1.callCount, 1, "The callback should be called once");
        assert.strictEqual(oCallbackError1.callCount, 1, "The error callback should be called once");
        assert.strictEqual(oCallback2.callCount, 1, "The second callback should be called once");
        assert.strictEqual(oCallbackError2.callCount, 1, "The second error callback should be called once");
    });

    QUnit.module("waitAllSettled", {
        beforeEach: async function () {
            this.oCallbackQueue = new CallbackQueue();
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Waits for all promises to settle", async function (assert) {
        // Arrange
        const done = assert.async();
        const oDeferred1 = new Deferred();
        const oDeferred2 = new Deferred();
        let bAllSettled = false;

        const oCallback1 = sandbox.stub().returns(oDeferred1.promise);
        const oCallback2 = sandbox.stub().returns(oDeferred2.promise);

        const pStep1 = this.oCallbackQueue.push(oCallback1);
        const pStep2 = this.oCallbackQueue.push(oCallback2);

        // Act
        this.oCallbackQueue.waitAllSettled().then(() => {
            // Assert
            assert.strictEqual(bAllSettled, true, "waitAllSettled should be called after all promises are settled");
            done();
        });

        Promise.all([
            pStep1,
            pStep2
        ]).then(() => {
            bAllSettled = true;
        });

        oDeferred1.resolve();
        oDeferred2.resolve();
    });

    QUnit.test("Waits for all promises even when afterwards added", async function (assert) {
        // Arrange
        const done = assert.async();
        const oDeferred1 = new Deferred();
        const oDeferred2 = new Deferred();
        let bAllSettled = false;

        const oCallback1 = sandbox.stub().returns(oDeferred1.promise);
        const oCallback2 = sandbox.stub().returns(oDeferred2.promise);

        const pStep1 = this.oCallbackQueue.push(oCallback1);

        // Act
        this.oCallbackQueue.waitAllSettled().then(() => {
            // Assert
            assert.strictEqual(bAllSettled, true, "waitAllSettled should be called after all promises are settled");
            done();
        });

        // add new promise during waitAllSettled
        const pStep2 = this.oCallbackQueue.push(oCallback2);

        Promise.all([
            pStep1,
            pStep2
        ]).then(() => {
            bAllSettled = true;
        });

        oDeferred1.resolve();
        oDeferred2.resolve();
    });
});
