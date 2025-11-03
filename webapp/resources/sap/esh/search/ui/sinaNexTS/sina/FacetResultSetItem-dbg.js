/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ResultSetItem"], function (___ResultSetItem) {
  "use strict";

  const ResultSetItem = ___ResultSetItem["ResultSetItem"];
  class FacetResultSetItem extends ResultSetItem {
    // _meta: {
    //     properties: {
    //         dimensionValueFormatted: {
    //             required: true
    //         },
    //         measureValue: {
    //             required: true
    //         },
    //         measureValueFormatted: {
    //             required: true
    //         }
    //     }
    // },

    dimensionValueFormatted;
    measureValue;
    measureValueFormatted;
    constructor(properties) {
      super(properties);
      this.dimensionValueFormatted = properties.dimensionValueFormatted ?? this.dimensionValueFormatted;
      this.measureValue = properties.measureValue ?? this.measureValue;
      this.measureValueFormatted = properties.measureValueFormatted ?? this.measureValueFormatted;
    }
    toString() {
      return this.dimensionValueFormatted + ": " + this.measureValueFormatted;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.FacetResultSetItem = FacetResultSetItem;
  return __exports;
});
//# sourceMappingURL=FacetResultSetItem-dbg.js.map
