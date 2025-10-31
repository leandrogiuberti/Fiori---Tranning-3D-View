// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/Renderer",
    "sap/m/GroupHeaderListItemRenderer",
    "sap/ushell/library" // css style dependency
], (
    coreLibrary,
    Renderer,
    GroupHeaderListItemRenderer,
    ushellLibrary
) => {
    "use strict";

    const TextDirection = coreLibrary.TextDirection;

    const CustomGroupHeaderListItemRenderer = Renderer.extend(GroupHeaderListItemRenderer);

    CustomGroupHeaderListItemRenderer.apiVersion = 2;

    CustomGroupHeaderListItemRenderer.renderLIAttributes = function (rm, oLI) {
        GroupHeaderListItemRenderer.renderLIAttributes(rm, oLI);
        rm.class("sapUshellCGHLIContent");
    };

    CustomGroupHeaderListItemRenderer.renderLIContent = function (rm, oLI) {
        const sTextDir = oLI.getTitleTextDirection();

        rm.openStart("span");
        rm.class("sapMGHLITitle");
        if (sTextDir !== TextDirection.Inherit) {
            rm.attr("dir", sTextDir.toLowerCase());
        }
        rm.openEnd();

        rm.renderControl(oLI.getAggregation("_titleText"));

        if (oLI.getDescription()) {
            rm.voidStart("br");
            rm.voidEnd();
            rm.openStart("span");
            rm.class("sapUshellCGHLIDescription");
            rm.openEnd();
            rm.renderControl(oLI.getAggregation("_descriptionText"));
            rm.close("span");
        }
        rm.close("span");
    };

    return CustomGroupHeaderListItemRenderer;
});
