/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./AttributeType", "./AttributeMetadataBase", "./AttributeMetadata"], function (___AttributeType, ___AttributeMetadataBase, ___AttributeMetadata) {
  "use strict";

  const AttributeType = ___AttributeType["AttributeType"];
  const AttributeMetadataBase = ___AttributeMetadataBase["AttributeMetadataBase"];
  const AttributeMetadata = ___AttributeMetadata["AttributeMetadata"];
  class AttributeGroupMetadata extends AttributeMetadataBase {
    // _meta: {
    //     properties: {
    //         type: { // overwrite
    //             required: false,
    //             default: AttributeType.Group
    //         },
    //         label: { // overwrite
    //             required: false
    //         },
    //         isSortable: { // overwrite
    //             required: false,
    //             default: false
    //         },
    //         template: {
    //             required: false
    //         },
    //         attributes: { // array of AttributeGroupMembership instances
    //             required: true,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //         displayAttributes{ // array of attibutes to be displayed
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    type = AttributeType.Group;
    label;
    isSortable = false;
    template;
    attributes = [];
    displayAttributes = [];
    constructor(properties) {
      super(properties);
      this.id = properties.id ?? this.id;
      this.usage = properties.usage ?? this.usage;
      this.label = properties.label ?? this.label;
      this.isSortable = properties.isSortable ?? this.isSortable;
      this.template = properties.template ?? this.template;
      this.attributes = properties.attributes ?? this.attributes;
      this.displayAttributes = properties.displayAttributes ?? this.displayAttributes;
    }
    toJson() {
      const json = {
        id: this.id,
        label: this.label,
        type: this.type,
        displayOrder: this?.displayOrder,
        isSortable: this?.isSortable,
        usage: this?.usage,
        groups: [],
        template: this?.template || "",
        attributes: [],
        displayAttributes: this?.displayAttributes || []
      };

      // push attributes
      const attributeMembers = this.attributes || [];
      if (attributeMembers.length === 0) {
        return json;
      }
      for (const member of attributeMembers) {
        json.attributes.push({
          attribute: {
            id: member.attribute.id
          },
          group: {
            id: member.group.id
          },
          nameInGroup: member.nameInGroup
        });
      }

      // push groups
      const groupMembers = this.groups || [];
      if (groupMembers.length === 0) {
        return json;
      }
      for (const member of groupMembers) {
        json.groups.push({
          attribute: {
            id: member.attribute.id
          },
          group: {
            id: member.group.id
          },
          nameInGroup: member.nameInGroup
        });
      }
      return json;
    }
    static fromJson(groupAttributeJson, attributeJsonArray, attributeMetadataMap,
    // attribute metadata map buffer, may not be compete
    sina) {
      // group attribute metadata
      const groupAttributeMetadata = sina._createAttributeGroupMetadata({
        id: groupAttributeJson.id,
        label: groupAttributeJson.label,
        type: AttributeType.Group,
        template: groupAttributeJson.template,
        attributes: [],
        displayAttributes: groupAttributeJson.displayAttributes || [],
        usage: groupAttributeJson.usage
      });

      // child attribute loop
      for (const childAttribute of groupAttributeJson.attributes) {
        let childAttributeMetadata = attributeMetadataMap[childAttribute.attribute.id];
        if (childAttributeMetadata) {
          // 1. child attribute is dejsonified
          // do nothing
        } else {
          // 2. child attribute is NOT dejsonified
          // get full json data by child attribute
          const childAttributeJson = groupAttributeMetadata.getAttributeJsonById(attributeJsonArray, childAttribute.attribute.id);
          if (childAttributeJson.type !== AttributeType.Group) {
            // 2.1 child attribute is single attribute
            // create single attribute metadata
            childAttributeMetadata = AttributeMetadata.fromJson(childAttributeJson, sina);
          } else {
            // 2.2 child attribute is group attribute
            // create group attribute metadata
            childAttributeMetadata = AttributeGroupMetadata.fromJson(childAttributeJson, attributeJsonArray, attributeMetadataMap, sina);
          }
          // set attribute metadata map buffer
          attributeMetadataMap[childAttributeMetadata.id] = childAttributeMetadata;
        }

        // push membership
        groupAttributeMetadata.pushMembership(groupAttributeMetadata, childAttributeMetadata, childAttribute.nameInGroup);
      }
      return groupAttributeMetadata;
    }
    getAttributeJsonById(attributeJsonArray, id) {
      const attributeJson = attributeJsonArray.find(attribute => attribute.id === id);
      return attributeJson || undefined;
    }
    pushMembership(groupAttributeMetadata, childAttributeMetadata, nameInGroup) {
      // create membership
      const childAttributeGroupMembership = this.sina._createAttributeGroupMembership({
        group: groupAttributeMetadata,
        attribute: childAttributeMetadata,
        nameInGroup: nameInGroup
      });
      // push membership to group attribute metadata
      groupAttributeMetadata.attributes.push(childAttributeGroupMembership);

      // push membership to child attribute metadata
      if (childAttributeMetadata.type === AttributeType.Group) {
        childAttributeMetadata.groups.push(childAttributeGroupMembership);
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.AttributeGroupMetadata = AttributeGroupMetadata;
  return __exports;
});
//# sourceMappingURL=AttributeGroupMetadata-dbg.js.map
