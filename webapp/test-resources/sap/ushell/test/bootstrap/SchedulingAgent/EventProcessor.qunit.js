// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.bootstrap.SchedulingAgent.EventProcessor
 */
sap.ui.define([
    "sap/ushell/bootstrap/SchedulingAgent/EventProcessor",
    "sap/ushell/EventHub",
    "sap/ushell/bootstrap/SchedulingAgent/state",
    "sap/ushell/bootstrap/SchedulingAgent"
], (EventProcessor, EventHub, InternalState, SchedulingAgent) => {
    "use strict";

    /* global sinon, QUnit */

    QUnit.module("Initialization of step done listener", {
        beforeEach: function () {
            this.oEventReceivedStub = sinon.stub(SchedulingAgent, "eventReceived").returns({});
        },
        afterEach: function () {
            this.oEvent = null;
            EventProcessor.aDoables = [];
            this.oEventReceivedStub.restore();
        }
    });

    QUnit.test("Uses the event hub for event listening", function (assert) {
        // Arrange
        const oSpyEventHub = sinon.spy(EventHub, "on");

        // Act
        EventProcessor.initializeStepDoneListener();

        // Assert
        assert.ok(oSpyEventHub.calledWith("StepDone"), "StepDone registered.");
        assert.ok(oSpyEventHub.calledWith("StepFailed"), "StepFailed registered.");
        assert.strictEqual(EventProcessor.aDoables.length, 2, "The doable object's array has been initialized");
        oSpyEventHub.restore();
    });

    QUnit.test("StepDone sets the loading step on the internal to done state and notifies the scheduling agent", function (assert) {
        // Arrange
        const done = assert.async();
        assert.expect(2);
        const sEventName = "StepDone";
        const sStepName = "myStep";
        const oSpyInternalState = sinon.spy(InternalState, "setForLoadingStep");

        EventHub.emit(sEventName, sStepName);

        // Act
        EventProcessor.initializeStepDoneListener(SchedulingAgent);
        EventHub.wait(sEventName).then(() => {
            EventHub.once(sEventName).do(() => {
                // Assert
                assert.ok(oSpyInternalState.calledWith(sStepName, InternalState.id.loadingStep.Done, "", "Step event received"),
                    "The internal state has been updated with the correct parameters.");
                assert.ok(this.oEventReceivedStub.called, "The scheduling agent has been informed about a received event.");
                oSpyInternalState.restore();
                EventHub._reset();
                done();
            });
        });
    });

    QUnit.test("StepFailed sets the loading step on the internal state to skipped and notifies the scheduling agent", function (assert) {
        // Arrange
        const done = assert.async();
        assert.expect(2);
        const sEventName = "StepFailed";
        const sStepName = "myStep";
        const oSpyInternalState = sinon.spy(InternalState, "setForLoadingStep");

        EventHub.emit(sEventName, sStepName);

        // Act
        EventProcessor.initializeStepDoneListener(SchedulingAgent);
        EventHub.wait(sEventName).then(() => {
            EventHub.once(sEventName).do(() => {
                // Assert
                assert.ok(oSpyInternalState.calledWith(sStepName, InternalState.id.loadingStep.Skipped, "", "Step event received"),
                    "The internal state has been updated with the correct parameters.");
                assert.ok(this.oEventReceivedStub.called, "The scheduling agent has been informed about a received event.");
                oSpyInternalState.restore();
                EventHub._reset();
                done();
            });
        });
    });

    QUnit.module("Listening to events", {
        beforeEach: function () {
            this.oEvent = {
                eventName: "myEvent",
                stepName: "myStep"
            };
            this.oEventReceivedStub = sinon.stub(SchedulingAgent, "eventReceived").returns({});
            EventProcessor.SchedulingAgent = SchedulingAgent;
        },
        afterEach: function () {
            this.oEvent = null;
            EventHub._reset();
            this.oEventReceivedStub.restore();
            EventProcessor.SchedulingAgent = {};
        }
    });

    QUnit.test("Uses the event hub for event listening", function (assert) {
        // Arrange
        const oSpyEventHub = sinon.spy(EventHub, "once");

        // Act
        EventProcessor.listenToEvent(this.oEvent);

        // Assert
        assert.ok(oSpyEventHub.calledWith(this.oEvent.eventName), "The event hub's on() function has been called with the correct parameter.");

        oSpyEventHub.restore();
    });

    QUnit.test("If an event has a timer to wait for, EventProcessor waits before continue loading", function (assert) {
        // Arrange
        const done = assert.async();
        const oSpyInternalState = sinon.spy(InternalState, "setForLoadingStep");
        const oEvent = {
            eventName: "myEvent",
            stepName: "myStep",
            timeoutInMs: 10
        };

        // Act
        EventProcessor.listenToEvent(oEvent);

        // Assert
        assert.notOk(oSpyInternalState.called, "Event not yet processed as a timer is given.");
        setTimeout(() => {
            // Assert
            assert.ok(oSpyInternalState.calledWith(this.oEvent.stepName, InternalState.id.loadingStep.Done, this.oEvent.eventName, "Event received"),
                "The internal state has been updated with the correct parameters.");
            assert.ok(this.oEventReceivedStub.called, "The scheduling agent has been informed about a received event.");
            oSpyInternalState.restore();
            done();
        }, 12);
    });

    QUnit.test("If an event has a timer to wait for, EventProcessor reacts only once to event", function (assert) {
        // Arrange
        const done = assert.async();
        const oSpyInternalState = sinon.spy(InternalState, "setForLoadingStep");
        const oEvent = {
            eventName: "myEvent",
            stepName: "myStep",
            timeoutInMs: 10
        };

        // Act
        EventProcessor.listenToEvent(oEvent);
        EventHub.emit("myEvent");

        // Assert
        setTimeout(() => {
            // Assert
            assert.ok(oSpyInternalState.calledWith(this.oEvent.stepName, InternalState.id.loadingStep.Done, this.oEvent.eventName, "Event received"),
                "The internal state has been updated with the correct parameters.");
            assert.ok(this.oEventReceivedStub.calledOnce, "The scheduling agent has been informed about a received event once.");
            oSpyInternalState.restore();
            done();
        }, 12);
    });

    QUnit.test("Sets the loading step on the internal state and notifies the scheduling agent", function (assert) {
        // Arrange
        const done = assert.async();
        assert.expect(2);
        const oSpyInternalState = sinon.spy(InternalState, "setForLoadingStep");

        EventHub.emit(this.oEvent.eventName);

        // Act
        EventProcessor.listenToEvent(this.oEvent);
        EventHub.wait(this.oEvent.eventName).then(() => {
            EventHub.once(this.oEvent.eventName).do(() => {
                // Assert
                assert.ok(oSpyInternalState.calledWith(this.oEvent.stepName, InternalState.id.loadingStep.Done, this.oEvent.eventName, "Event received"),
                    "The internal state has been updated with the correct parameters.");
                assert.ok(this.oEventReceivedStub.called, "The scheduling agent has been informed about a received event.");
                oSpyInternalState.restore();
                done();
            });
        });
    });

    QUnit.module("Turning off the event Processor");

    QUnit.test("Unregisters the stepDone listener", function (assert) {
        // Arrange
        const oDoable = EventHub.on("StepDone");
        const oDoable2 = EventHub.on("getNextStep");
        const oSpyOff = sinon.spy(oDoable, "off");
        const oSpyOff2 = sinon.spy(oDoable2, "off");
        EventProcessor.aDoables = [oDoable, oDoable2];

        // Act
        EventProcessor.unregisterStepDoneListener();

        // Assert
        assert.ok(oSpyOff.called, "The StepDone doable's off() function has been called.");
        assert.ok(oSpyOff2.called, "The getNextStep doable's off() function has been called.");

        oSpyOff.restore();
        EventProcessor.aDoables = [];
    });
});
