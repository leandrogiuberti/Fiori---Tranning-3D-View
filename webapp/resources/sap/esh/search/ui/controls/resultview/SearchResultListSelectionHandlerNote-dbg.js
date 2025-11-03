/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SearchResultListSelectionHandler"], function (__SearchResultListSelectionHandler) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchResultListSelectionHandler = _interopRequireDefault(__SearchResultListSelectionHandler);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultListSelectionHandlerNote = SearchResultListSelectionHandler.extend("sap.esh.search.ui.controls.SearchResultListSelectionHandlerNote", {
    isMultiSelectionAvailable: function _isMultiSelectionAvailable() {
      return true;
    }
  });
  return SearchResultListSelectionHandlerNote;
});
//# sourceMappingURL=SearchResultListSelectionHandlerNote-dbg.js.map
