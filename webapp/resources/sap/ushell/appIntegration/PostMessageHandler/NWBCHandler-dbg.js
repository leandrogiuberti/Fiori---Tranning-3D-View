// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the NWBCHandler class.
 *
 * NWBC specific dirty state handling
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepClone",
    "sap/base/util/uid",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/utils"
], (
    Log,
    deepClone,
    uid,
    PostMessageManager,
    Container,
    ushellUtils
) => {
    "use strict";

    const aEventPreprocessor = [
        (oOriginalMessageEvent, oOriginalMessage) => {
            if (oOriginalMessage.action === "pro54_setGlobalDirty") {
                const oMessage = deepClone(oOriginalMessage);
                oMessage.service = "sap.ushell.appIntegration.PostMessageManager.NWBCHandler.pro54_setGlobalDirty";
                delete oMessage.action;

                oMessage.body = oMessage.parameters;
                delete oMessage.parameters;

                if (!oMessage.request_id) {
                    oMessage.request_id = uid();
                }

                if (!oMessage.type) {
                    oMessage.type = "request";
                }

                const oMessageEvent = new MessageEvent("message", {
                    data: JSON.stringify(oMessage),
                    origin: oOriginalMessageEvent.origin,
                    source: oOriginalMessageEvent.source
                });

                return {
                    event: oMessageEvent,
                    message: oMessage
                };
            }
        }
    ];

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         */
        "sap.ushell.appIntegration.PostMessageManager.NWBCHandler.pro54_setGlobalDirty": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const sDirtyStateStorageKey = oApplicationContainer.getGlobalDirtyStorageKey();
                if (localStorage.getItem(sDirtyStateStorageKey) === Container.DirtyState.PENDING) {
                    Log.debug(
                        `getGlobalDirty() pro54_setGlobalDirty SetItem key:${sDirtyStateStorageKey} value: ${oMessageBody.globalDirty}`,
                        null,
                        "sap.ushell.appIntegration.ApplicationContainer"
                    );
                    ushellUtils.localStorageSetItem(sDirtyStateStorageKey, oMessageBody.globalDirty, true);
                }
            },
            options: {
                provideApplicationContext: true
            }
        }
    };

    return {
        register () {
            aEventPreprocessor.forEach((fnEventPreprocessor) => {
                PostMessageManager.addEventPreprocessor(fnEventPreprocessor);
            });

            Object.keys(oDistributionPolicies).forEach((sServiceRequest) => {
                const oDistributionPolicy = oDistributionPolicies[sServiceRequest];
                PostMessageManager.setDistributionPolicy(sServiceRequest, oDistributionPolicy);
            });

            Object.keys(oServiceRequestHandlers).forEach((sServiceRequest) => {
                const oHandler = oServiceRequestHandlers[sServiceRequest];
                PostMessageManager.setRequestHandler(sServiceRequest, oHandler.handler, oHandler.options);
            });
        }
    };
});
