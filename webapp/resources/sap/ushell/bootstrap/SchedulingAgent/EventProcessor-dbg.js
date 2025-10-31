// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/bootstrap/SchedulingAgent/state",
    "sap/ushell/EventHub"
], (InternalState, EventHub) => {
    "use strict";

    const EventProcessor = {
        SchedulingAgent: {},

        aDoables: [],
        /**
         * Initializes the listener for the "StepDone", "StepFailed" and "getNextStep" events, which are emitted by the EventHub.
         * The EventHub event needs to contain the name of the step that belongs to the current triggering
         * of the "StepDone" event. The step name must be passed as the data of the EventHub event.
         * This method should only be called by the Scheduling Agent.
         *
         * @param {object} agent The scheduling agent singleton.
         * @protected
         */
        initializeStepDoneListener: function (agent) {
            this.SchedulingAgent = agent;
            this.aDoables = [
                EventHub.on("StepDone").do((stepName) => {
                    InternalState.setForLoadingStep(stepName, InternalState.id.loadingStep.Done, "", "Step event received");
                    this.SchedulingAgent.eventReceived();
                }),
                EventHub.on("StepFailed").do((stepName) => {
                    InternalState.setForLoadingStep(stepName, InternalState.id.loadingStep.Skipped, "", "Step event received");
                    this.SchedulingAgent.eventReceived();
                })
            ];
        },

        /**
         * Uses the EventHub to listen to a given event and enters the corresponding step to the internal state.
         * The scheduling agent is notified that an event is received and a new loading step is set in the internal state.
         *
         * @param {{eventName: string, stepName: string, timeoutInMs: int}} event The StepConfiguration event definition.
         * @protected
         */
        listenToEvent: function (event) {
            let bEventHandled = false;

            EventHub.once(event.eventName).do(() => {
                if (bEventHandled) {
                    return;
                }

                bEventHandled = true;
                InternalState.setForLoadingStep(event.stepName, InternalState.id.loadingStep.Done, event.eventName, "Event received");
                this.SchedulingAgent.eventReceived();
            });

            if (event.timeoutInMs) {
                setTimeout(() => {
                    if (bEventHandled) {
                        return;
                    }

                    bEventHandled = true;
                    InternalState.setForLoadingStep(event.stepName, InternalState.id.loadingStep.Done, event.eventName, "Event received");
                    this.SchedulingAgent.eventReceived();
                }, event.timeoutInMs);
            }
        },

        /**
         * Unregisters all doable objects stored in aDoables by calling the #off method of the EventHub
         * This method is meant to stop the scheduler and should only be called in case of major error.
         *
         * @protected
         */
        unregisterStepDoneListener: function () {
            this.aDoables.forEach((oDoable) => {
                oDoable.off();
            });
        },

        setTimeOut: function () { }
    };

    return EventProcessor;
});
