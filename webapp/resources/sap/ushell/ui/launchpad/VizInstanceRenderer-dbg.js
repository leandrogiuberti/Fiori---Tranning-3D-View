// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    const VizInstanceRenderer = {
        apiVersion: 2
    };

    VizInstanceRenderer.render = function (rm, vizInstance) {
        const aControls = this._prepareControlsToBeRendered(vizInstance);

        rm.openStart("div", vizInstance);
        rm.class("sapUshellVizInstance");
        if (vizInstance.getEditable()) {
            rm.class("sapUshellVizInstanceEdit");
        }
        rm.openEnd(); // div - tag
        aControls.forEach((oControl) => {
            rm.renderControl(oControl);
        });
        rm.close("div");
    };

    /**
     * Determines if the edit mode overlay needs to be rendered and returns the corresponding controls.
     *
     * @param {sap.ushell.ui.launchpad.VizInstance} vizInstance The vizInstance which is about to be rendered
     * @returns {object[]}
     *  The controls that need to be rendered. Either only the VizInstances content or a collection of controls belonging to the edit mode plus the content
     */
    VizInstanceRenderer._prepareControlsToBeRendered = function (vizInstance) {
        const aControls = [vizInstance.getContent()];

        if (vizInstance.getEditable()) {
            if (vizInstance.getRemovable()) { // add the "Remove" icon only if the Tile is removable
                const oRemoveIconVBox = vizInstance._getRemoveIconVBox();
                aControls.unshift(oRemoveIconVBox);
            }
            const oActionModeButtonIconVBox = vizInstance._getActionModeButtonIconVBox();
            aControls.push(oActionModeButtonIconVBox);
        }

        return aControls;
    };

    return VizInstanceRenderer;
});
