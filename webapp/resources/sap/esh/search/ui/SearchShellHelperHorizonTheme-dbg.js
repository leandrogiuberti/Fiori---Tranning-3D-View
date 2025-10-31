/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/Element"], function (Log, Element) {
  "use strict";

  const module = {
    isSearchFieldExpandedByDefault() {
      // copied from /ushell-lib/src/main/js/sap/ushell/renderers/fiori2/search/util.js in order to avoid dependency
      try {
        const shellHeader = Element.getElementById("shell-header");
        if (!shellHeader || !shellHeader.isExtraLargeState) {
          return false;
        }
        const shellCtrl = window.sap.ushell.Container.getRenderer("fiori2").getShellController();
        const shellView = shellCtrl.getView();
        const shellConfig = (shellView.getViewData() ? shellView.getViewData().config : {}) || {};
        return shellConfig.openSearchAsDefault || shellHeader.isExtraLargeState();
      } catch (e) {
        Log.warning("Failed to determine default search field state", e);
        return false;
      }
    }
  };
  return module;
});
//# sourceMappingURL=SearchShellHelperHorizonTheme-dbg.js.map
