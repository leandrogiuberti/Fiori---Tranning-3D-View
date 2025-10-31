// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ushell/Container"
], (Element, Container) => {
    "use strict";

    return {
        isSearchFieldExpandedByDefault: function () {
            const shellHeader = Element.getElementById("shell-header") || { isExtraLargeState: function () { return false; } };
            const shellCtrl = Container.getRendererInternal("fiori2").getShellController();
            const shellView = shellCtrl.getView();
            const shellConfig = (shellView.getViewData() ? shellView.getViewData().config : {}) || {};
            return shellConfig.openSearchAsDefault || shellHeader.isExtraLargeState();
        }
    };
});
