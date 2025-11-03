// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.ui5service.ShellUIService}.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ushell/ui5service/ShellUIService",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/services/AppConfiguration",
    "sap/ui/thirdparty/jquery"
], (
    EventBus,
    ServiceFactoryRegistry,
    ServiceFactory,
    ShellUIService,
    AppCommunicationMgr,
    AppRuntimeContext,
    AppConfiguration,
    jQuery
) => {
    "use strict";

    let sLastSetTitle;
    let bRegistered = false;
    let fnBackNavigationCallback;

    /**
     * @alias sap.ushell.appRuntime.ui5.services.ShellUIService
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.ui5service.ShellUIService}.
     *
     * @hideconstructor
     *
     * @private
     */
    const ShellUIServiceProxy = ShellUIService.extend("sap.ushell.appRuntime.services.ShellUIService", {
        setTitle: function (sTitle, oAdditionalInformation) {
            if (typeof sTitle !== "undefined" && typeof sTitle !== "string") {
                throw new Error("'setTitle' was called with invalid arguments. The parameter should be a string");
            }
            sLastSetTitle = sTitle === undefined ? sLastSetTitle : sTitle;
            AppCommunicationMgr.postMessageToFLP("sap.ushell.services.ShellUIService.setTitle", {
                sTitle: sTitle,
                oAdditionalInformation: oAdditionalInformation
            });
        },

        getTitle: function () {
            return sLastSetTitle;
        },

        setHierarchy: function (aHierarchyLevels) {
            return AppRuntimeContext.checkIntentsConversionForScube(aHierarchyLevels).then((aNewHierarchyLevels) => {
                return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.ShellUIService.setHierarchy", {
                    aHierarchyLevels: aNewHierarchyLevels
                });
            });
        },

        setRelatedApps: function (aRelatedApps) {
            return AppRuntimeContext.checkIntentsConversionForScube(aRelatedApps).then((aNewRelatedApps) => {
                return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.ShellUIService.setRelatedApps", {
                    aRelatedApps: aNewRelatedApps
                });
            });
        },

        setBackNavigation: function (fnCallback) {
            if (!bRegistered) {
                bRegistered = true;
                const oRequestHandlers = {
                    "sap.ushell.appRuntime.handleBackNavigation": {
                        async handler (oMessageBody, oMessageEvent) {
                            if (fnBackNavigationCallback) {
                                fnBackNavigationCallback();
                            } else if (AppRuntimeContext.checkDataLossAndContinue()) {
                                window.history.back();
                            }
                            return new jQuery.Deferred().resolve().promise();
                        }
                    }
                };

                Object.keys(oRequestHandlers).forEach((sServiceRequest) => {
                    AppCommunicationMgr.setRequestHandler(sServiceRequest, oRequestHandlers[sServiceRequest].handler);
                });
            }

            fnBackNavigationCallback = fnCallback;
            AppCommunicationMgr.postMessageToFLP("sap.ushell.ui5service.ShellUIService.setBackNavigation", {
                callbackMessage: {
                    service: "sap.ushell.appRuntime.handleBackNavigation"
                }
            });
        },

        _getBackNavigationCallback: function () {
            return fnBackNavigationCallback;
        },

        _resetBackNavigationCallback: function () {
            this.setBackNavigation();
        },

        setApplicationFullWidth: function (bFullWidth) {
            AppConfiguration.setApplicationFullWidthInternal(bFullWidth);
        }
    });

    /**
     * Resets the local title variable to undefined.
     */
    ShellUIServiceProxy._resetTitle = function () {
        sLastSetTitle = undefined;
    };

    // reset last title locally to undefined after an app was closed
    EventBus.getInstance().subscribe("sap.ushell", "appClosed", ShellUIServiceProxy._resetTitle);

    // Register this service with the generic factory
    ServiceFactoryRegistry.register(
        "sap.ushell.ui5service.ShellUIService",
        new ServiceFactory(ShellUIServiceProxy)
    );

    return ShellUIServiceProxy;
});
