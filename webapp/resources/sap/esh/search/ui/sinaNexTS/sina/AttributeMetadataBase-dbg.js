/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject"], function (___SinaObject) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  class AttributeMetadataBase extends SinaObject {
    // _meta: {
    //     properties: {
    //         id: {
    //             required: true
    //         },
    //         usage: {
    //             required: true
    //         },
    //         displayOrder: {
    //             required: false
    //         },
    //         groups: { // array of AttributeGroupMembership instances
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    id;
    usage;
    displayOrder;
    groups = [];
    type;
    format;
    semantics;
    constructor(properties) {
      super(properties);
      this.id = properties.id ?? this.id;
      this.usage = properties.usage ?? this.usage;
      this.displayOrder = properties.displayOrder ?? this.displayOrder;
      this.groups = properties.groups ?? this.groups;
      this.type = properties.type;
      this.format = properties.format ?? this.format;
    }

    // static fromJson ist implemented in following files:
    // 1. DataSource.ts (dejsonifyAttribute)
    // 2. AttributeMetadata.ts
    // 3. AttributeGroupMetadata.ts,
    // implemented not in base class, because of circular import dependency
  }
  var __exports = {
    __esModule: true
  };
  __exports.AttributeMetadataBase = AttributeMetadataBase;
  return __exports;
});
//# sourceMappingURL=AttributeMetadataBase-dbg.js.map
