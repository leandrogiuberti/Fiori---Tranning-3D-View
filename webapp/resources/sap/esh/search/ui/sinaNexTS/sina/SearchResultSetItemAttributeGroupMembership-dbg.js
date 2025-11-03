/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject"], function (___SinaObject) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  class SearchResultSetItemAttributeGroupMembership extends SinaObject {
    // _meta: {
    //     properties: {
    //         group: {
    //             required: true
    //         },
    //         attribute: {
    //             required: true
    //         },
    //         metadata: {
    //             required: true
    //         }
    //     }
    // }

    group;
    attribute;
    metadata;
    valueFormatted = ""; // TODO: superfluous?

    constructor(properties) {
      super(properties);
      this.group = properties.group ?? this.group;
      this.attribute = properties.attribute ?? this.attribute;
      this.metadata = properties.metadata ?? this.metadata;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSetItemAttributeGroupMembership = SearchResultSetItemAttributeGroupMembership;
  return __exports;
});
//# sourceMappingURL=SearchResultSetItemAttributeGroupMembership-dbg.js.map
