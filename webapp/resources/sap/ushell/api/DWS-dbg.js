// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview Utility functions for DWS plugins.
 */
sap.ui.define([
    "sap/ushell/appIntegration/ApplicationContainerCache",
    "sap/ushell/appIntegration/AppLifeCycle"
], (
    ApplicationContainerCache,
    AppLifeCycle
) => {
    "use strict";

    /**
     * @alias sap.ushell.api.DWS
     * @namespace
     *
     * @since 1.135.0
     * @private
     * @ui5-restricted sap.cf.workzonePlugins (e.g. WorkZoneAdmin)
     */
    const DwsUtils = {};

    /**
     * Returns the current application iframe and its origin.
     * @returns {{iframe: HTMLIFrameElement, origin: string}|null} The iframe and the origin of the current application.
     *
     * @since 1.135.0
     * @private
     * @ui5-restricted sap.cf.workzonePlugins (e.g. WorkZoneAdmin)
     */
    DwsUtils.getCurrentApplicationIframe = function () {
        const oCurrentApplicationContainer = AppLifeCycle.getCurrentApplication()?.container;

        if (!oCurrentApplicationContainer) {
            return null;
        }

        const oIframe = oCurrentApplicationContainer.getPostMessageTarget();
        if (!oIframe) {
            return null;
        }

        return {
            iframe: oIframe,
            origin: oCurrentApplicationContainer.getPostMessageTargetOrigin()
        };
    };

    /**
     * Returns the all application iframes and their origins.
     * @returns {Array<{iframe: HTMLIFrameElement, origin: string}>} The iframes and their origins.
     *
     * @since 1.135.0
     * @private
     * @ui5-restricted sap.cf.workzonePlugins (e.g. WorkZoneAdmin)
     */
    DwsUtils.getAllApplicationIframes = function () {
        const aApplicationContainers = ApplicationContainerCache.getAll();

        return aApplicationContainers
            .filter((oContainer) => {
                if (!oContainer) {
                    return false;
                }

                if (!oContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                    return false;
                }

                if (!oContainer.getPostMessageTarget()) {
                    return false;
                }

                return true;
            })
            .map((oContainer) => {
                return {
                    iframe: oContainer.getPostMessageTarget(),
                    origin: oContainer.getPostMessageTargetOrigin()
                };
            });
    };

    return DwsUtils;
});
