// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.bootstrap.SchedulingAgent.FLPLoader
 */
sap.ui.define([
    "sap/ushell/bootstrap/SchedulingAgent/FLPLoader",
    "sap/ushell/EventHub",
    "sap/ui/core/Component"
], (FLPLoader, EventHub, Component) => {
    "use strict";

    /* global sinon, QUnit */

    QUnit.module("FLPLoader", {
        afterEach: function () {
            EventHub._reset();
        }
    });

    QUnit.test("Load component by event", function (assert) {
        // Arrange
        const done = assert.async();
        assert.expect(1);

        // Act
        FLPLoader.loadComponentByEvent({ eventName: "loadComponent", eventData: {} });
        EventHub.wait("loadComponent").then(() => {
            EventHub.once("loadComponent").do(() => {
                // Assert
                assert.ok(true, "The event has been emitted.");
                EventHub._reset();
                done();
            });
        });
    });

    QUnit.test("Load component by component create", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oStep = {
            sStepName: "step",
            oData: "my.component"
        };
        const oSpyComponentCreate = sinon.stub(Component, "create").returns(Promise.resolve("This should be a stub!"));

        // Act
        FLPLoader.loadComponentByComponentCreate(oStep).then((sTestStep) => {
            // Assert
            assert.ok(oSpyComponentCreate.calledOnce, "Component.create is called once.");
            assert.strictEqual(oStep.sStepName, sTestStep, "The correct step type is returned.");

            oSpyComponentCreate.restore();
            fnDone();
        });
    });

    QUnit.test("Set a time out and emit with StepDone", function (assert) {
        const done = assert.async();
        const oTimeOutSpy = sinon.spy(window, "setTimeout");
        const oStep = { sStepName: "Alas, dear FLP, we still need TimeOuts!", iWaitingTime: 100 };
        assert.expect(3);

        FLPLoader.waitInMs(oStep);

        EventHub.once("StepDone").do(() => {
            // Assert
            assert.ok(true, "The correct event has been emitted.");
            assert.ok(oTimeOutSpy.called, "A timeout happened.");
            assert.strictEqual(oTimeOutSpy.firstCall.args[1], 100, "The Timeout has the correct duration.");
            done();
        });
    });

    QUnit.test("Load component by require", function (assert) {
        // Arrange
        const done = assert.async();
        const sModuleToLoad = "my/path";
        let sModuleLoaded;
        const oReturnedDependency = {};
        function fnRequireStub (aRequiredModules, fnHandler) {
            sModuleLoaded = aRequiredModules[0];
            fnHandler(oReturnedDependency);
        }
        const oRequireStub = sinon.stub(sap.ui, "require");
        oRequireStub.callsFake(fnRequireStub);

        // Act
        const oPromise = FLPLoader.loadComponentByRequire(sModuleToLoad);

        // Assert
        assert.expect(3);
        oPromise.then(() => {
            assert.ok(true, "A promise was returned.");
            assert.ok(oRequireStub.called, "sap.ui.require was called.");
            assert.strictEqual(sModuleLoaded, sModuleToLoad, "The correct module was loaded.");
            oRequireStub.restore();
            done();
        });
    });

    QUnit.test("FlpLoader.directLoading available", function (assert) {
        const bFunctionExists = typeof FLPLoader.directLoading === "function";
        assert.ok(bFunctionExists, "Method FlpLoader.directLoading exists.");
    });
});
