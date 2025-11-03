/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class FolderModeResultViewTypeCalculator {
    model;
    constructor(model) {
      this.model = model;
    }
    calculate(resultViewTypes, resultViewType, filter) {
      if (!this.model.config.folderMode || !this.model.config.autoAdjustResultViewTypeInFolderMode) {
        return resultViewType;
      }
      let calculatedResultViewType;
      if (filter.isFolderMode()) {
        calculatedResultViewType = "searchResultTable";
      } else {
        calculatedResultViewType = "searchResultList";
      }
      if (resultViewTypes.indexOf(calculatedResultViewType) < 0) {
        return resultViewType;
      }
      return calculatedResultViewType;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.FolderModeResultViewTypeCalculator = FolderModeResultViewTypeCalculator;
  return __exports;
});
//# sourceMappingURL=FolderModeUtils-dbg.js.map
