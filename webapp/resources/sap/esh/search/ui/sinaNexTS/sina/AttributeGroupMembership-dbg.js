/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject"], function (___SinaObject) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  class AttributeGroupMembership extends SinaObject {
    // _meta: {
    //     properties: {
    //         group: {
    //             required: true
    //         },
    //         attribute: {
    //             required: true
    //         },
    //         nameInGroup: {
    //             required: true
    //         }
    //     }
    // }

    group;
    attribute;
    nameInGroup;
    constructor(properties) {
      super(properties);
      this.group = properties.group ?? this.group;
      this.attribute = properties.attribute ?? this.attribute;
      this.nameInGroup = properties.nameInGroup ?? this.nameInGroup;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.AttributeGroupMembership = AttributeGroupMembership;
  return __exports;
});
//# sourceMappingURL=AttributeGroupMembership-dbg.js.map
