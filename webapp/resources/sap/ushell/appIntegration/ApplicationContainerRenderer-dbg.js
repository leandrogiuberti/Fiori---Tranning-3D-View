// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    const ApplicationContainerRenderer = {
        apiVersion: 2
    };

    ApplicationContainerRenderer.waitForUI5Version = function (oContainer) {
        const ApplicationContainer = oContainer.getMetadata().getClass();
        // we have to cache the UI5 version first
        if (ApplicationContainer.ui5version === null) {
            ApplicationContainer.ui5versionPromise.then(() => {
                oContainer.invalidate();
            });
            return true;
        }
    };

    ApplicationContainerRenderer.render = function (oRenderManager, oContainer) {
        /*
         * This is only a placeholder rendering, the actual rendering is done by the sub classes.
         * It is executed when the application is not ready for rendering.
         * Once it is ready, the application will be rendered by the sub classes and any further
         * rendering will be suppressed.
         */

        oRenderManager.openStart("div", oContainer);
        oRenderManager.accessibilityState(oContainer);
        oRenderManager.attr("data-help-id", oContainer.getDataHelpId());
        oRenderManager.attr("data-sap-ushell-active", oContainer.getActive());
        oRenderManager.attr("data-sap-ushell-initial-app-id", oContainer.getInitialAppId());
        oRenderManager.attr("data-sap-ushell-current-app-id", oContainer.getCurrentAppId());
        oRenderManager.attr("data-sap-ushell-stateful-type", oContainer.getStatefulType());
        oRenderManager.attr("data-sap-ushell-framework-id", oContainer.getFrameworkId());
        oRenderManager.class("sapUShellApplicationContainer");
        oRenderManager.style("height", oContainer.getHeight());
        oRenderManager.style("width", oContainer.getWidth());
        oRenderManager.openEnd();

        oRenderManager.close("div");
    };

    return ApplicationContainerRenderer;
});
