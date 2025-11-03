// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/resources"
], (Config, resources) => {
    "use strict";

    /**
     * ShellHeader renderer.
     * @namespace
     * @static
     * @private
     */
    const ShellHeaderRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     */
    ShellHeaderRenderer.render = function (rm, shellHeader) {
        const id = shellHeader.getId();
        const oCentralControl = shellHeader.getCentralControl();

        rm.openStart("header", shellHeader);

        if (!shellHeader.getVisible()) {
            rm.style("display", "none");
        }

        rm.class("sapUshellShellHeader");
        rm.class("sapContrastPlus");
        rm.attr("aria-label", resources.i18n.getText("Shell_Header_AriaLabel"));
        rm.attr("data-sap-ui-customfastnavgroup", "true");
        rm.openEnd(); // header - tag

        // Left area
        rm.openStart("div");
        rm.attr("id", `${id}-hdr-begin`);
        rm.class("sapUshellShellHeadBegin");
        if (oCentralControl) {
            rm.class("sapUshellHeadWithCenter"); // limit the width of the begin area
        }
        rm.openEnd(); // div - tag

        // Render default header items first (back Button, menu Button) and then left to right
        this.renderReservedHeaderItems(rm, shellHeader);
        this.renderLogo(rm, shellHeader);
        this.renderHeaderItems(rm, shellHeader);

        // Render AppTitle and (sub)Title
        this.renderTitle(rm, shellHeader);

        this.renderNewExperienceSwitch(rm, shellHeader);

        rm.close("div");

        // Central container
        if (oCentralControl) {
            rm.openStart("div", oCentralControl);
            rm.attr("id", `${id}-hdr-center`);
            rm.class("sapUshellShellHeadCenter");
            rm.openEnd(); // div - tag
            rm.renderControl(oCentralControl);
            rm.close("div");
        }

        // Search container
        rm.openStart("div");
        rm.attr("id", `${id}-hdr-search-container`);
        rm.class("sapUshellShellHeadSearchContainer");
        rm.openEnd(); // div - tag
        // Search field container
        this.renderSearch(rm, shellHeader);
        rm.close("div");

        // Right area
        rm.openStart("div");
        rm.attr("id", `${id}-hdr-end`);
        rm.class("sapUshellShellHeadEnd");
        rm.openEnd(); // div - tag
        this.renderHeaderEndItems(rm, shellHeader);
        rm.close("div");

        rm.close("header");
    };

    /**
     * Renders the search field of the ShellHeader.
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     */
    ShellHeaderRenderer.renderSearch = function (rm, shellHeader) {
        const oSearch = shellHeader.getSearch();
        rm.openStart("div");
        rm.attr("id", `${shellHeader.getId()}-hdr-search`);
        rm.attr("data-help-id", "shellHeader-search");
        rm.class("sapUshellShellSearch");
        rm.style("max-width", `${shellHeader.getSearchWidth()}rem`);
        if (shellHeader.getSearchState() === "COL") {
            rm.style("display", "none");
        }
        rm.openEnd(); // div - tag

        if (oSearch) {
            rm.renderControl(oSearch);
        }
        rm.close("div");
    };

    /**
     * Renders the new experience switch control
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     */
    ShellHeaderRenderer.renderNewExperienceSwitch = function (rm, shellHeader) {
        const oNewExperienceSwitch = shellHeader.getNewExperienceSwitchControl();
        if (oNewExperienceSwitch) {
            rm.openStart("div");
            rm.attr("id", `${shellHeader.getId()}-hdr-new-experience-switch`);
            rm.attr("data-help-id", "ushell-new-experience-switch");
            rm.openEnd(); // div - tag
            rm.renderControl(oNewExperienceSwitch);
            rm.close("div");
        }
    };

    /**
     * Renders the title of the ShellHeader.
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     */
    ShellHeaderRenderer.renderTitle = function (rm, shellHeader) {
        const sTitle = shellHeader.getTitle();

        rm.renderControl(shellHeader.getAppTitle());

        if (sTitle && shellHeader.isMediumOrBiggerState()) { // design decision: render subtitle only on M or bigger
            rm.openStart("div");
            rm.attr("id", `${shellHeader.getId()}-hdr-shell-title`);
            rm.class(shellHeader.getAppTitle() ? "sapUshellShellHeadSubtitle" : "sapUshellShellHeadTitle");
            rm.openEnd(); // div - tag

            rm.openStart("h2");
            rm.class("sapUshellHeadTitle");
            rm.attr("aria-level", "2");
            rm.attr("title", sTitle);
            rm.openEnd(); // span - tag
            rm.text(sTitle);
            rm.close("h2");

            rm.close("div");
        }
    };

    /**
     * Renders the reserved header items (back button, menu button) which should always be displayed first (left side).
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     * @since 1.134.0
     */
    ShellHeaderRenderer.renderReservedHeaderItems = function (rm, shellHeader) {
        const aItems = shellHeader.getHeadItems();
        aItems.forEach((oItem) => {
            // Ensure to only render the backButton && menuButton
            if (oItem.getId() === "sideMenuExpandCollapseBtn" || oItem.getId() === "backBtn") {
                rm.renderControl(oItem);
            }
        });
    };

    /**
     * Renders the header items of the ShellHeader (standard aggregation, next to the reserved items, still left side).
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     */
    ShellHeaderRenderer.renderHeaderItems = function (rm, shellHeader) {
        const aItems = shellHeader.getHeadItems();
        aItems.forEach((oItem) => {
            if (oItem.getId() !== "backBtn" && oItem.getId() !== "sideMenuExpandCollapseBtn") {
                rm.renderControl(oItem);
            }
        });
    };

    /**
     * Renders the header end items of the ShellHeader (standard aggregation, right side).
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     */
    ShellHeaderRenderer.renderHeaderEndItems = function (rm, shellHeader) {
        shellHeader.getHeadEndItems().forEach(rm.renderControl);
    };

    /**
     * Renders the logo of the ShellHeader.
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ushell.ui.ShellHeader} shellHeader ShellHeader to be rendered
     * @private
     */
    ShellHeaderRenderer.renderLogo = function (rm, shellHeader) {
        const sIco = shellHeader.getLogo();

        if (!sIco) {
            return;
        }

        const bLeanMode = shellHeader._getLeanMode(); // In lean mode, do not render <a> link
        const sTooltipText = shellHeader._bHomeIsRoot ? resources.i18n.getText("homeBtn_tooltip_text") : resources.i18n.getText("lastPage_tooltip");

        rm.openStart(bLeanMode ? "div" : "a");
        rm.attr("id", `${shellHeader.getId()}-logo`);
        rm.class("sapUshellShellIco");

        if (bLeanMode) {
            rm.class("sapUshellLean");
        } else {
            rm.attr("href", shellHeader.getHomeUri());
            rm.attr("title", sTooltipText);
            rm.attr("role", "button");
        }

        rm.openEnd();

        rm.voidStart("img");
        rm.attr("id", `${shellHeader.getId()}-icon`);
        rm.attr("alt", shellHeader.getLogoAltText(sIco));
        rm.attr("src", sIco);
        rm.voidEnd(); // img - tag
        rm.close(bLeanMode ? "div" : "a");
    };

    return ShellHeaderRenderer;
}, /* bExport= */ true);
