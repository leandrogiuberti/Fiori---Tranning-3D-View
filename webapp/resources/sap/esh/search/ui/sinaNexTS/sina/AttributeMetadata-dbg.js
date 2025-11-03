/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./AttributeMetadataBase"], function (___AttributeMetadataBase) {
  "use strict";

  const AttributeMetadataBase = ___AttributeMetadataBase["AttributeMetadataBase"];
  class AttributeMetadata extends AttributeMetadataBase {
    // _meta: {
    //     properties: {
    //         type: {
    //             required: true
    //         },
    //         label: {
    //             required: true
    //         },
    //         isSortable: {
    //             required: true
    //         },
    //         format: {
    //             required: false
    //             // TODO: multiple: true?
    //         },
    //         isKey: { // TODO: replace/amend with keyAttribute in SearchResultSetItem
    //             required: true
    //         },
    //         semantics: {
    //             required: false
    //         },
    //         matchingStrategy: {
    //             required: true
    //         }
    //     }
    // }

    label;
    isSortable;
    isKey;
    matchingStrategy;
    isHierarchy;
    hierarchyName;
    hierarchyDisplayType;
    iconUrlAttributeName;
    _private = {
      semanticObjectType: "",
      temporaryUsage: {}
    };
    constructor(properties) {
      super(properties);
      this.label = properties.label ?? this.label;
      this.isSortable = properties.isSortable ?? this.isSortable;
      this.format = properties.format ?? this.format;
      this.isKey = properties.isKey ?? this.isKey;
      this.semantics = properties.semantics ?? this.semantics;
      this.matchingStrategy = properties.matchingStrategy ?? this.matchingStrategy;
      this.isHierarchy = properties.isHierarchy ?? false;
      this.hierarchyName = properties.hierarchyName;
      this.hierarchyDisplayType = properties.hierarchyDisplayType;
      this.iconUrlAttributeName = properties.iconUrlAttributeName;
    }
    toJson() {
      return {
        id: this.id,
        label: this.label,
        type: this.type,
        displayOrder: this?.displayOrder,
        isSortable: this?.isSortable,
        usage: this?.usage,
        isKey: this?.isKey,
        matchingStrategy: this?.matchingStrategy,
        format: this?.format
      };
    }
    static fromJson(attributeJson, sina) {
      return sina._createAttributeMetadata({
        id: attributeJson.id,
        type: attributeJson.type,
        label: attributeJson.label,
        isSortable: attributeJson.isSortable,
        matchingStrategy: attributeJson.matchingStrategy,
        isKey: attributeJson.isKey,
        usage: attributeJson.usage,
        format: attributeJson.format
      });
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.AttributeMetadata = AttributeMetadata;
  return __exports;
});
//# sourceMappingURL=AttributeMetadata-dbg.js.map
