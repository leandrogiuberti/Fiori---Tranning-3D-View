// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the MessageBrokerHandler class.
 *
 * Any handlers that are relevant for the message broker
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    Log,
    PostMessageManager,
    Config,
    Container
) => {
    "use strict";

    const { DoNotReply } = PostMessageManager.BuiltInResponses;

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.MessageBroker": {
            async handler (oMessageBody, oMessageEvent) {
                if (oMessageEvent.source === window) {
                    throw new Error(`MessageBrokerHandler: Message received from FLP window by client '${oMessageBody.clientId}' instead of an iframe. This scenario is not supported!`);
                }

                const MessageBroker = await Container.getServiceAsync("MessageBroker");
                const sRequestId = PostMessageManager.getRequestId(oMessageEvent);

                if (!oMessageBody.channelId) {
                    throw new Error(`MessageBroker: No channelId provided in message body by client '${oMessageBody.clientId}'`);
                }

                if (oMessageBody.channelId === "sap.ushell.MessageBroker") {
                    let bShouldHandleResponse = true;

                    switch (oMessageBody.messageName) {
                        case "connect":
                            await MessageBroker.connect(
                                oMessageBody.clientId,
                                // fnClientConnectionCallback
                                (sMessageName, sClientId, aSubscribedChannels) => {
                                    return PostMessageManager.sendRequest(
                                        "sap.ushell.services.MessageBroker",
                                        {
                                            targetClientId: oMessageBody.clientId,
                                            channelId: oMessageBody.channelId,
                                            messageName: sMessageName,
                                            clientId: sClientId,
                                            channels: aSubscribedChannels
                                        },
                                        oMessageEvent.source,
                                        oMessageEvent.origin,
                                        false
                                    );
                                }
                            );
                            break; // common response below
                        case "disconnect":
                            await MessageBroker.disconnect(oMessageBody.clientId);
                            break; // common response below
                        case "subscribe":
                            await MessageBroker.subscribe(
                                oMessageBody.clientId,
                                oMessageBody.subscribedChannels,
                                // fnMessageCallback
                                (sClientId, sChannelId, sMessageName, oData) => {
                                    return PostMessageManager.sendRequest(
                                        "sap.ushell.services.MessageBroker",
                                        {
                                            targetClientId: oMessageBody.clientId,
                                            channelId: sChannelId,
                                            messageName: sMessageName,
                                            clientId: sClientId,
                                            data: oData
                                        },
                                        oMessageEvent.source,
                                        oMessageEvent.origin,
                                        false
                                    );
                                }
                            );
                            break; // common response below
                        case "unsubscribe":
                            await MessageBroker.unsubscribe(oMessageBody.clientId, oMessageBody.subscribedChannels);
                            break; // common response below
                        default:
                            // else publish in "sap.ushell.services.MessageBroker" channel
                            bShouldHandleResponse = false;
                            // publish is handled below
                    }

                    if (bShouldHandleResponse) {
                        // MessageBroker requires custom response formatting
                        await PostMessageManager.sendResponse(
                            sRequestId,
                            "sap.ushell.services.MessageBroker",
                            {
                                channelId: oMessageBody.channelId,
                                messageName: oMessageBody.messageName,
                                clientId: oMessageBody.clientId,
                                correlationMessageId: sRequestId,
                                status: "accepted"
                            },
                            true,
                            oMessageEvent.source,
                            oMessageEvent.origin
                        );

                        return DoNotReply;
                    }
                }

                // else the message is publish action
                await MessageBroker.publish(
                    oMessageBody.channelId,
                    oMessageBody.clientId,
                    oMessageBody.messageName,
                    oMessageBody.targetClientIds,
                    oMessageBody.data
                );

                // Do not respond for 'publish'
                return DoNotReply;
            },
            options: {
                async isValidRequest (oMessageEvent) {
                    const MessageBroker = await Container.getServiceAsync("MessageBroker");

                    const bOriginIsAccepted = MessageBroker.getAcceptedOrigins().some((sAcceptedOrigin) => {
                        return sAcceptedOrigin === oMessageEvent.origin;
                    });

                    return bOriginIsAccepted;
                }
            }
        }
    };

    return {
        register () {
            if (!Config.last("/core/shell/enableMessageBroker")) {
                return;
            }

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
