// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Dashboard groups container renderer
 * @deprecated since 1.120. Deprecated together with the classic homepage.
 */
sap.ui.define([
    "sap/ushell/utils"
], (utils) => {
    "use strict";

    /**
     * DashboardGroupsContainer renderer.
     * @namespace
     * @static
     * @private
     */
    const DashboardGroupsContainerRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided
     * {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render
     *            output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be
     *            rendered
     */
    DashboardGroupsContainerRenderer.render = function (oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.attr("data-sap-ui-customfastnavgroup", "true");
        oRm.class("sapUshellDashboardGroupsContainer");

        if (oControl.getAccessibilityLabel()) {
            oRm.accessibilityState(oControl, {
                role: "navigation",
                label: oControl.getAccessibilityLabel()
            });
        }
        oRm.openEnd();

        const aGroups = oControl.getGroups();
        let oGroup;
        for (let i = 0; i < aGroups.length; i++) {
            oGroup = aGroups[i];
            oRm.openStart("div");
            oRm.class("sapUshellDashboardGroupsContainerItem");
            if (oGroup.getIsGroupLocked() || oGroup.getDefaultGroup()) {
                oRm.class("sapUshellDisableDragAndDrop");
            }
            oRm.openEnd();

            oRm.renderControl(oGroup);

            oRm.close("div");
        }

        oRm.close("div");
        utils.setPerformanceMark("FLP -- dashboardgroupscontainer renderer");
    };

    return DashboardGroupsContainerRenderer;
}, /* bExport= */ true);
