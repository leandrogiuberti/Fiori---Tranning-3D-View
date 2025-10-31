// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/GenericTile",
    "sap/m/library",
    "sap/ushell/resources"
], (
    Log,
    GenericTile,
    mobileLibrary,
    ushellResources
) => {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    const GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.m.LoadState
    const LoadState = mobileLibrary.LoadState;

    /**
     * LinkTileWrapper renderer.
     * @namespace
     * @static
     * @private
     */
    const LinkTileWrapperRenderer = {
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
    LinkTileWrapperRenderer.render = function (oRm, oControl) {
        let oTileView = null;
        const oModel = oControl.getModel();

        function tileLoadingFailed () {
            oTileView = new GenericTile({
                header: ushellResources.i18n.getText("cannotLoadTile"),
                mode: GenericTileMode.LineMode,
                state: LoadState.Failed
            });
        }

        try {
            oTileView = oControl.getTileViews()[0];
        } catch (oError) {
            Log.warning("Failed to load tile view: ", oError);
            tileLoadingFailed();
        }

        if (!oTileView) {
            Log.warning("Failed to load tile view: the control has no tileViews");
            tileLoadingFailed();
        }

        oRm.openStart("div", oControl);

        // if xRay is enabled
        if (oModel && oModel.getProperty("/enableHelp")) {
            // currently only the Tile (and the Tile's footer) has a data attribute in teh xRay integration
            // (as using this value as a class value instead as done in all of the static elements causes parsing errors in the xRay hotspot definition flow)
            oRm.attr("data-help-id", oControl.getTileCatalogId());// xRay support
            if (oControl.getTileCatalogIdStable()) {
                oRm.attr("data-help-id2", oControl.getTileCatalogIdStable());
            }
        }
        oRm.class("sapUshellLinkTile");
        if (!oControl.getVisible()) {
            oRm.class("sapUshellHidden");
        }
        // TODO:Check this
        if (oControl.getIsLocked()) {
            oRm.class("sapUshellLockedTile");
        }
        oRm.attr("tabindex", "-1");

        oRm.openEnd();

        oRm.renderControl(oTileView);

        oRm.close("div");
    };

    return LinkTileWrapperRenderer;
}, /* bExport=*/true);
