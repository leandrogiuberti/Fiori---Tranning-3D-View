// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Renderer",
    "sap/ushell/appIntegration/ApplicationContainerRenderer"
], (
    Renderer,
    ApplicationContainerRenderer
) => {
    "use strict";

    const UI5ApplicationContainerRenderer = Renderer.extend(ApplicationContainerRenderer);

    UI5ApplicationContainerRenderer.render = function (oRenderManager, oContainer) {
        if (!oContainer.getReadyForRendering()) {
            ApplicationContainerRenderer.render(oRenderManager, oContainer);
            return;
        }

        const oChild = oContainer.getAggregation("child");

        if (!oChild) {
            return;
        }

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

        oRenderManager.renderControl(oChild);

        oRenderManager.close("div");

        // mark the rendering as complete, this will suppress any further invalidation
        oContainer.setRenderComplete(true);
    };

    return UI5ApplicationContainerRenderer;
});
