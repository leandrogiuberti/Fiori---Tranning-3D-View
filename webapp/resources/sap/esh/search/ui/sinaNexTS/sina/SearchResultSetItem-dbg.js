/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ResultSetItem", "../core/core", "./AttributeMetadata"], function (___ResultSetItem, ___core_core, ___AttributeMetadata) {
  "use strict";

  const ResultSetItem = ___ResultSetItem["ResultSetItem"];
  const generateGuid = ___core_core["generateGuid"];
  const AttributeMetadata = ___AttributeMetadata["AttributeMetadata"];
  class SearchResultSetItem extends ResultSetItem {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         },
    //         titleAttributes: {
    //             required: true,
    //             aggregation: true
    //         },
    //         titleDescriptionAttributes: {
    //             required: false,
    //             aggregation: true
    //         },
    //         detailAttributes: {
    //             required: true,
    //             aggregation: true
    //         },
    //         defaultNavigationTarget: {
    //             required: false,
    //             aggregation: true
    //         },
    //         navigationTargets: {
    //             required: false,
    //             aggregation: true
    //         },
    //         score: {
    //             required: false,
    //             default: 0
    //         }
    //     }
    // },

    dataSource;
    attributes;
    attributesMap;
    titleAttributes;
    titleDescriptionAttributes;
    detailAttributes;
    defaultNavigationTarget;
    navigationTargets;
    score = 0;
    hierarchyNodePaths;
    constructor(properties) {
      super(properties);
      this.dataSource = properties.dataSource ?? this.dataSource;
      this.setAttributes(properties.attributes || []);
      this.setTitleAttributes(properties.titleAttributes);
      this.setTitleDescriptionAttributes(properties.titleDescriptionAttributes);
      this.setDetailAttributes(properties.detailAttributes);
      this.setDefaultNavigationTarget(properties.defaultNavigationTarget);
      this.setNavigationTargets(properties.navigationTargets || []);
      this.score = properties.score ?? this.score;
      this.hierarchyNodePaths = properties.hierarchyNodePaths ?? this.hierarchyNodePaths;
    }
    setDefaultNavigationTarget(navigationTarget) {
      if (!navigationTarget) {
        this.defaultNavigationTarget = undefined;
        return;
      }
      this.defaultNavigationTarget = navigationTarget;
      navigationTarget.parent = this;
    }
    setNavigationTargets(navigationTargets) {
      this.navigationTargets = [];
      if (!navigationTargets) {
        return;
      }
      for (const navigationTarget of navigationTargets) {
        this.addNavigationTarget(navigationTarget);
      }
    }
    addNavigationTarget(navigationTarget) {
      this.navigationTargets.push(navigationTarget);
      navigationTarget.parent = this;
    }
    setAttributes(attributes) {
      this.attributes = [];
      this.attributesMap = {};
      for (const attribute of attributes) {
        this.attributes.push(attribute);
        this.attributesMap[attribute.id] = attribute;
        attribute.parent = this;
      }
    }
    setTitleAttributes(titleAttributes) {
      this.titleAttributes = [];
      if (!Array.isArray(titleAttributes) || titleAttributes.length < 1) {
        return this;
      }
      for (let i = 0; i < titleAttributes.length; i++) {
        const item = titleAttributes[i];
        item.parent = this;
        this.titleAttributes.push(item);
      }
      return this;
    }
    setTitleDescriptionAttributes(titleDescriptionAttributes) {
      this.titleDescriptionAttributes = [];
      if (!Array.isArray(titleDescriptionAttributes) || titleDescriptionAttributes.length < 1) {
        return this;
      }
      for (let i = 0; i < titleDescriptionAttributes.length; i++) {
        const item = titleDescriptionAttributes[i];
        item.parent = this;
        this.titleDescriptionAttributes.push(item);
      }
      return this;
    }
    setDetailAttributes(detailAttributes) {
      this.detailAttributes = [];
      if (!Array.isArray(detailAttributes) || detailAttributes.length < 1) {
        return this;
      }
      for (let i = 0; i < detailAttributes.length; i++) {
        const item = detailAttributes[i];
        item.parent = this;
        this.detailAttributes.push(item);
      }
      return this;
    }
    get key() {
      const parts = [];
      parts.push(this.dataSource.id);
      // Filter key single attributes and return their metadata.id
      const keyAttributeValues = this.attributes.filter(attribute => attribute.metadata instanceof AttributeMetadata && attribute.metadata.isKey === true).map(attribute => attribute.value);
      if (keyAttributeValues.length > 0 && keyAttributeValues.join("").length > 0) {
        parts.push(...keyAttributeValues);
      }

      // If no key attributes are defined, use the title attributes' values
      if (parts.length === 1) {
        const titleAttributeValues = [];
        for (const titleAttribute of this.titleAttributes) {
          const subTitleAttributes = titleAttribute.getSubAttributes();
          for (const subTitleAttribute of subTitleAttributes) {
            titleAttributeValues.push(subTitleAttribute.value);
          }
        }
        if (titleAttributeValues.length > 0 && titleAttributeValues.join("").length > 0) {
          parts.push(...titleAttributeValues);
        }
      }

      // If no key, no title attributes are defined,
      // use the first 3 details attributes' values, if available
      if (parts.length === 1) {
        const detailAttributeValues = [];
        const maxDetailAttributes = Math.min(3, this.detailAttributes.length);
        for (let i = 0; i < maxDetailAttributes; i++) {
          const detailAttribute = this.detailAttributes[i];
          const subDetailAttributes = detailAttribute.getSubAttributes();
          for (const subDetailAttribute of subDetailAttributes) {
            detailAttributeValues.push(subDetailAttribute.value);
          }
        }
        if (detailAttributeValues.length > 0 && detailAttributeValues.join("").length > 0) {
          parts.push(...detailAttributeValues);
        }
      }

      // no key, no title attributes, no first 3 details attributes -> use guid
      // this bottom of the barrel workaround works only inside same search session.
      // in cross search sessions scenario the key for same item will be different
      // the potential comparison of same item will fail without any hint for end users
      if (parts.length === 1) {
        parts.push(generateGuid());
      }
      return parts.join("-");
    }
    toString() {
      let i;
      const result = [];
      const title = [];
      for (i = 0; i < this.titleAttributes.length; ++i) {
        const titleAttribute = this.titleAttributes[i];
        title.push(titleAttribute.toString());
      }
      result.push(title.join(" "));
      for (i = 0; i < this.detailAttributes.length; ++i) {
        const detailAttribute = this.detailAttributes[i];
        result.push("  - " + detailAttribute.toString());
      }
      return result.join("\n");
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSetItem = SearchResultSetItem;
  return __exports;
});
//# sourceMappingURL=SearchResultSetItem-dbg.js.map
