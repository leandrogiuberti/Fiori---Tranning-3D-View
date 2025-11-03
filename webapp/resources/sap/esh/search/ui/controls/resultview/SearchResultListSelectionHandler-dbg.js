/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ui/base/Object"], function (Object) {
  "use strict";

  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultListSelectionHandler = Object.extend("sap.esh.search.ui.controls.SearchResultListSelectionHandler", {
    isMultiSelectionAvailable: function _isMultiSelectionAvailable() {
      return false;
    }
  });
  return SearchResultListSelectionHandler;
});
//# sourceMappingURL=SearchResultListSelectionHandler-dbg.js.map
