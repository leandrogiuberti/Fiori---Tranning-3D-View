// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    /**
     * Section renderer.
     * @namespace
     * @static
     * @private
     */
    const SectionRenderer = {
        apiVersion: 2
    };

    function isSectionEmpty (section) {
        const bDefaultAreaHasItems = !!section.getDefaultItems().length;
        const bFlatAreaHasItems = !!section.getFlatItems().length;
        const bCompactAreaHasItems = !!section.getCompactItems().length;
        return !bDefaultAreaHasItems && !bCompactAreaHasItems && !bFlatAreaHasItems;
    }

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.launchpad.Section} section an object representation of the control that should be rendered
     */
    SectionRenderer.render = function (rm, section) {
        const sHelpId = section.getDefault() ? "recently-added-apps" : section.getDataHelpId();
        const bEditable = section.getEditable();
        const oNoVisualizationsText = section.getAggregation("_noVisualizationsText");

        rm.openStart("div", section);
        rm.class("sapUshellSection");
        if (bEditable) {
            rm.class("sapUshellSectionEdit");
            rm.attr("tabindex", "0");
        }
        if (!section.getShowSection()) {
            rm.class("sapUshellSectionHidden");
        }
        if (isSectionEmpty(section)) {
            rm.class("sapUshellSectionNoVisualizations");
            if (bEditable && section.getShowNoVisualizationsText()) {
                rm.attr("aria-describedBy", oNoVisualizationsText.getId());
            }
        }
        if (sHelpId) {
            rm.attr("data-help-id", sHelpId);
        }
        rm.attr("role", "region");
        rm.attr("aria-label", section.getAriaLabel());
        rm.openEnd(); // div - tag

        rm.renderControl(section.getAggregation("_title"));
        rm.renderControl(section.getAggregation("_header"));
        rm.renderControl(oNoVisualizationsText);
        rm.renderControl(section.getAggregation("_defaultArea"));
        rm.renderControl(section.getAggregation("_flatArea"));
        rm.renderControl(section.getAggregation("_compactArea"));

        rm.close("div");
    };

    return SectionRenderer;
}, /* bExport= */ true);
