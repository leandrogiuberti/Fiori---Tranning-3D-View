// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/bootstrap/SchedulingAgent/FLPScheduler",
    "sap/ushell/bootstrap/SchedulingAgent/EventProcessor",
    "sap/ushell/bootstrap/SchedulingAgent/FLPLoader",
    "sap/ushell/bootstrap/SchedulingAgent/logger",
    "sap/ushell/bootstrap/SchedulingAgent/state",
    "sap/ushell/EventHub"
], (
    FLPScheduler,
    EventProcessor,
    FLPLoader,
    logger,
    state,
    EventHub
) => {
    "use strict";

    const oLoadingModes = {
        CONTINUE_ON_EVENT: "continueOnEvent",
        BY_EVENT: "byEvent",
        BY_COMPONENT_CREATE: "byComponentCreate",
        BY_REQUIRE: "byRequire",
        WAIT_IN_MS: "waitInMs"
    };

    const oStatusDefinitions = {
        WAIT: "wait",
        ERROR: "error",
        DONE: "done",
        STEP: "step",
        BLOCKDONE: "blockDone",
        SKIPPED: "skip"
    };

    const SchedulingAgent = {

        oComponentsLoading: {},
        oPathsLoading: {},

        // Main methods of the Agent

        // Internal methods
        /**
         * Start all relevant components.
         * Specifically, start the scheduler and the internal state.
         * In case of error, an exception will be thrown.
         *
         * @private
         */
        _initialize: function () {
            state.clear();
            logger.clearHistory();

            state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.Initializing, "Scheduling Agent starting");
            const oDataPromise = FLPScheduler.initializeSchedule();
            oDataPromise.then((bScheduleReady) => {
                if (!bScheduleReady) {
                    state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.FatalError, "Configuration error!");
                    return;
                }
                EventProcessor.initializeStepDoneListener(this);
                state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.Initialized, "Scheduling Agent ready");

                // start everything!!!
                this.eventReceived();
            });
        },

        /**
         * Takes the object returned by the scheduler and extracts the necessary parts that
         * need to be sent to the loaders.
         *
         * @param {{sStatus: string, oContent: object, oConfig: object}} loadingStepConfiguration
         *     an object containing the relevant configuration:
         *        oContent: the corresponding loading step
         *        oConfig: the configuration of the loading step
         *
         * @returns {{sStepType: string, oData: object, bConfigOk: boolean}}
         *     sStepType: loading mode
         *     oData: the data needed to be passed to the loader
         *     bConfigOk: a flag to determine if the needed data was present
         *
         * @private
         */
        _processStepConfiguration: function (loadingStepConfiguration) {
            const oStepConfig = {
                sStepType: "",
                oData: {},
                sStepName: "",
                bConfigOk: false
            };

            if (loadingStepConfiguration.oConfig.loadingMode === oLoadingModes.CONTINUE_ON_EVENT) {
                oStepConfig.sStepType = oLoadingModes.CONTINUE_ON_EVENT;
                oStepConfig.sStepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.oData.eventName = loadingStepConfiguration.oConfig.continueOnEvent && loadingStepConfiguration.oConfig.continueOnEvent.eventName;
                oStepConfig.oData.timeoutInMs = loadingStepConfiguration.oConfig.continueOnEvent && loadingStepConfiguration.oConfig.continueOnEvent.timeoutInMs;
                oStepConfig.oData.stepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.bConfigOk = !!(oStepConfig.oData.eventName && oStepConfig.oData.stepName);
            } else if (loadingStepConfiguration.oConfig.loadingMode === oLoadingModes.BY_EVENT) {
                oStepConfig.sStepType = oLoadingModes.BY_EVENT;
                oStepConfig.sStepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.oData.eventName = loadingStepConfiguration.oConfig.byEvent &&
                                              loadingStepConfiguration.oConfig.byEvent.eventName;
                oStepConfig.oData.eventData = {};
                oStepConfig.oData.eventData.data = loadingStepConfiguration.oConfig.byEvent.eventData;
                oStepConfig.oData.eventData.stepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.bConfigOk = !!(oStepConfig.oData.eventName);
            } else if (loadingStepConfiguration.oConfig.loadingMode === oLoadingModes.BY_COMPONENT_CREATE) {
                oStepConfig.sStepType = oLoadingModes.BY_COMPONENT_CREATE;
                oStepConfig.sStepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.oData = loadingStepConfiguration.oConfig.byComponentCreate &&
                                    loadingStepConfiguration.oConfig.byComponentCreate.ui5ComponentOptions || {};

                oStepConfig.bConfigOk = !!oStepConfig.oData;
            } else if (loadingStepConfiguration.oConfig.loadingMode === oLoadingModes.BY_REQUIRE) {
                oStepConfig.sStepType = oLoadingModes.BY_REQUIRE;
                oStepConfig.sStepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.oData = {};
                oStepConfig.oData.sPath = loadingStepConfiguration.oConfig.byRequire.path;
                oStepConfig.oData.sStepName = loadingStepConfiguration.oContent.LoadingStep;

                oStepConfig.bConfigOk = !!oStepConfig.oData.sPath;
            } else if (loadingStepConfiguration.oConfig.loadingMode === oLoadingModes.WAIT_IN_MS) {
                oStepConfig.sStepType = oLoadingModes.WAIT_IN_MS;
                oStepConfig.sStepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.oData.iWaitingTime = loadingStepConfiguration.oConfig.waitInMs &&
                                                loadingStepConfiguration.oConfig.waitInMs.waitingTime;
                oStepConfig.oData.sStepName = loadingStepConfiguration.oContent.LoadingStep;
                oStepConfig.bConfigOk = !!(oStepConfig.oData.iWaitingTime && oStepConfig.oData.sStepName);
            }

            return oStepConfig;
        },

        // Public API
        /**
         * Dumps the current internal state to the console
         *
         * @public
         */
        dumpState: function () {
            state.dump();
        },

        /**
         * Dumps the loading history to the console
         *
         * @public
         */
        dumpHistory: function () {
            logger.dumpHistory();
        },

        /**
         * Dumps the loading history to the console
         *
         * @public
         */
        dumpSchedule: function () {
            FLPScheduler.dumpSchedule();
        },

        /**
         * Dumps all available logs to the console
         *
         * @public
         */
        dumpAll: function () {
            logger.dumpHistory();
            FLPScheduler.dumpSchedule();
            state.dump();
        },

        /**
         * Main entry point to the agent. Asks for a new step from the FLP scheduler and process it.
         *
         * @protected
         */
        eventReceived: function () {
            state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.Working, "Agent is active");
            let oNextStep;
            do {
                oNextStep = FLPScheduler.getNextLoadingStep();

                // Check the status and act accordingly

                // An error should abort the process
                if (oNextStep.sStatus === oStatusDefinitions.ERROR) {
                    state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.FatalError, "Fatal loading error. Loading aborted.");
                    EventProcessor.unregisterStepDoneListener();
                    EventHub.emit("FLPLoadingDone", Date.now());
                    return;
                }

                if (oNextStep.sStatus === oStatusDefinitions.DONE) {
                    state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.Done, "Loading finished");
                    EventProcessor.unregisterStepDoneListener();
                    EventHub.emit("FLPLoadingDone", Date.now());
                    return;
                }

                if (oNextStep.sStatus === oStatusDefinitions.BLOCKDONE) {
                    // Not yet implemented as no use case existing
                }

                if (oNextStep.sStatus === oStatusDefinitions.SKIPPED) {
                    // Not yet implemented as no use case existing
                }

                if (oNextStep.sStatus === oStatusDefinitions.STEP) {
                    // We need to prepare the correct information for each loading mode and call the corresponding function
                    const oStepConfig = this._processStepConfiguration(oNextStep);
                    if (!oStepConfig.bConfigOk) {
                        state.setForLoadingStep(oStepConfig.sStepName, state.id.loadingStep.Abort, "", "Step configuration error");
                        state.setForLoadingStep(oStepConfig.sStepName, state.id.loadingStep.Skipped, "", "Step configuration error");
                        state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.FatalError, oStepConfig, "Step configuration error!");
                    } else if (oStepConfig.sStepType === oLoadingModes.CONTINUE_ON_EVENT) {
                        EventProcessor.listenToEvent(oStepConfig.oData);
                        state.setForLoadingStep(oStepConfig.sStepName, state.id.loadingStep.InProgress, oStepConfig.oData.eventName, "continueOnEvent step sent to Event Processor");
                    } else if (oStepConfig.sStepType === oLoadingModes.BY_EVENT) {
                        FLPLoader.loadComponentByEvent(oStepConfig.oData);
                        state.setForLoadingStep(oStepConfig.sStepName, state.id.loadingStep.InProgress, oStepConfig.oData, "byEvent step sent to FLP Loader");
                    } else if (oStepConfig.sStepType === oLoadingModes.WAIT_IN_MS) {
                        FLPLoader.waitInMs(oStepConfig.oData);
                        state.setForLoadingStep(oStepConfig.sStepName, state.id.loadingStep.InProgress, `${oStepConfig.oData.iWaitingTime}ms`, "WaitInMs step sent to FLP Loader");
                    } else if (oStepConfig.sStepType === oLoadingModes.BY_REQUIRE) {
                        const oPathLoadingPromise = FLPLoader.loadComponentByRequire(oStepConfig.oData.sPath);
                        this.oPathsLoading[oStepConfig.sStepName] = oPathLoadingPromise;
                        state.setForLoadingStep(oStepConfig.sStepName, state.id.loadingStep.InProgress, oStepConfig.oData.sPath, "byRequire step sent to FLP Loader");
                        const sStepName = oStepConfig.sStepName;
                        oPathLoadingPromise
                            .then(() => {
                                /* eslint-disable */
                                state.setForLoadingStep(sStepName, state.id.loadingStep.InProgress, "", "Step's promise has resolved");
                                /* eslint-enable */
                                delete this.oPathsLoading[sStepName];
                                EventHub.emit("StepDone", sStepName);
                            })
                            .catch(() => {
                                /* eslint-disable */
                                    state.setForLoadingStep(sStepName, state.id.loadingStep.FatalError, "", "Step's promise failed");
                                    /* eslint-enable */
                                delete this.oPathsLoading[sStepName];
                                EventHub.emit("StepFailed", sStepName);
                            });
                    } else if (oStepConfig.sStepType === oLoadingModes.BY_COMPONENT_CREATE) {
                        const oPromise = FLPLoader.loadComponentByComponentCreate(oStepConfig);
                        const sStepName = oStepConfig.sStepName;
                        this.oComponentsLoading[sStepName] = oPromise;
                        state.setForLoadingStep(sStepName, state.id.loadingStep.InProgress, oStepConfig.oData, "byComponentCreate step sent to FLP Loader");
                        oPromise
                            .then(() => {
                                state.setForLoadingStep(sStepName, state.id.loadingStep.InProgress, "", "Step's promise has resolved");
                                delete this.oComponentsLoading[sStepName];
                                EventHub.emit("StepDone", sStepName);
                            })
                            .catch(() => {
                                state.setForLoadingStep(sStepName, state.id.loadingStep.FatalError, "", "Step's promise failed");
                                delete this.oComponentsLoading[sStepName];
                                EventHub.emit("StepFailed", sStepName);
                            });
                    }
                }
            } while (oNextStep.sStatus !== oStatusDefinitions.WAIT);

            state.setForModule(state.id.module.schedulingAgent.id, state.id.module.schedulingAgent.Waiting, "Agent waits");
        }
    };

    return SchedulingAgent;
}, false);
