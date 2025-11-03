/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ResultSetItem"], function (___ResultSetItem) {
  "use strict";

  const ResultSetItem = ___ResultSetItem["ResultSetItem"];
  class Suggestion extends ResultSetItem {
    // _meta: {
    //     properties: {
    //         calculationMode: {
    //             required: true
    //         },
    //         label: {
    //             required: true
    //         }
    //     }
    // }

    type;
    calculationMode;
    label;
    object;
    constructor(properties) {
      super(properties);
      this.calculationMode = properties.calculationMode;
      this.label = properties.label;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Suggestion = Suggestion;
  return __exports;
});
//# sourceMappingURL=Suggestion-dbg.js.map
