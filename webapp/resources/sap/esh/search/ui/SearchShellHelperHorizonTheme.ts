/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Log from "sap/base/Log";
import Element from "sap/ui/core/Element";

const module = {
    isSearchFieldExpandedByDefault(): boolean {
        // copied from /ushell-lib/src/main/js/sap/ushell/renderers/fiori2/search/util.js in order to avoid dependency
        try {
            const shellHeader = Element.getElementById("shell-header");
            if (!shellHeader || !(shellHeader as any).isExtraLargeState) {
                return false;
            }
            const shellCtrl = (
                (window.sap.ushell as any).Container.getRenderer("fiori2") as any
            ).getShellController();
            const shellView = shellCtrl.getView();
            const shellConfig = (shellView.getViewData() ? shellView.getViewData().config : {}) || {};
            return shellConfig.openSearchAsDefault || (shellHeader as any).isExtraLargeState();
        } catch (e) {
            Log.warning("Failed to determine default search field state", e);
            return false;
        }
    },
};

export default module;
