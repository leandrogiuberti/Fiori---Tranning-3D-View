/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject"], function (___SinaObject) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  class SearchResultSetItemAttributeBase extends SinaObject {
    // _meta: {
    //     properties: {
    //         id: {
    //             required: true
    //         },
    //         metadata: {
    //             required: true
    //         },
    //         groups: {
    //             required: false,
    //             defaul: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // },

    id;
    label;
    metadata;
    groups = [];
    parent;
    constructor(properties) {
      super(properties);
      this.id = properties.id;
      this.label = properties.label;
      this.metadata = properties.metadata;
      this.groups = properties.groups;
      this.parent = properties.parent;
    }
    toString() {
      return this.id;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSetItemAttributeBase = SearchResultSetItemAttributeBase;
  return __exports;
});
//# sourceMappingURL=SearchResultSetItemAttributeBase-dbg.js.map
