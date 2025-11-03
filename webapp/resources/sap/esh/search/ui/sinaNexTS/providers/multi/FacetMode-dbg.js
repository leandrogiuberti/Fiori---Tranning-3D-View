/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var FacetMode = /*#__PURE__*/function (FacetMode) {
    // every subprovider seperate as a subtree, with a root with subprovider_all
    FacetMode["tree"] = "tree";
    // all subprovider facets will be merged and sorted
    FacetMode["flat"] = "flat";
    return FacetMode;
  }(FacetMode || {});
  var __exports = {
    __esModule: true
  };
  __exports.FacetMode = FacetMode;
  return __exports;
});
//# sourceMappingURL=FacetMode-dbg.js.map
