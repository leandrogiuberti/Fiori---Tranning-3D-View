/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/AttributeGroupMetadata", "../../sina/AttributeMetadata"], function (____sina_AttributeGroupMetadata, ____sina_AttributeMetadata) {
  "use strict";

  const AttributeGroupMetadata = ____sina_AttributeGroupMetadata["AttributeGroupMetadata"];
  const AttributeMetadata = ____sina_AttributeMetadata["AttributeMetadata"];
  class HierarchyNodePathParser {
    sina;
    constructor(sina) {
      this.sina = sina;
    }
    parse(response, query) {
      const hierarchyNodePaths = [];
      if (!response) {
        return hierarchyNodePaths;
      }
      const staticHierarchyAttributeForDisplay = query.filter.dataSource._getStaticHierarchyAttributeForDisplay();
      for (const parentHierarchy of response) {
        const hierarchyAttributeId = parentHierarchy.scope;
        let hierarchyAttributeLabel = "";
        let hierarchyAttributeIcon = "";
        const hierarchyAttributeMeta = query.filter.dataSource.attributeMetadataMap[hierarchyAttributeId];
        if (staticHierarchyAttributeForDisplay instanceof AttributeGroupMetadata) {
          const childAttribute = staticHierarchyAttributeForDisplay._private?.childAttribute;
          if (childAttribute instanceof AttributeMetadata) {
            hierarchyAttributeLabel = childAttribute.id;
          }
          const parentAttribute = staticHierarchyAttributeForDisplay._private?.parentAttribute;
          if (parentAttribute instanceof AttributeMetadata) {
            hierarchyAttributeIcon = parentAttribute.iconUrlAttributeName;
          }
        } else if (staticHierarchyAttributeForDisplay instanceof AttributeMetadata) {
          hierarchyAttributeLabel = hierarchyAttributeMeta.id;
          hierarchyAttributeIcon = hierarchyAttributeMeta.iconUrlAttributeName;
        }
        if (!hierarchyAttributeLabel) {
          hierarchyAttributeLabel = "node_value";
        }
        const length = parentHierarchy.hierarchy.length;
        const hierarchyNodes = [];
        parentHierarchy.hierarchy.forEach((node, index) => {
          let isFirstPath = false;
          let isLastPath = false;
          let icon = node[hierarchyAttributeIcon] || node["icon"] || "sap-icon://folder";
          let label = node[hierarchyAttributeLabel] || node["node_value"] || node[hierarchyAttributeId] || node["node_id"];
          if (index === 0) {
            isFirstPath = true;
            // Replace first $$ROOT$$ node with datasource node
            if (node[hierarchyAttributeId] === "$$ROOT$$") {
              icon = query.filter.dataSource.icon || "sap-icon://home";
              label = query.filter.dataSource.labelPlural || query.filter.dataSource.label || label;
            }
          } else if (index === length - 1) {
            isLastPath = true;
            icon = node[hierarchyAttributeIcon] || node["icon"] || "sap-icon://open-folder";
          }
          hierarchyNodes.push(this.sina.createHierarchyNode({
            id: node[hierarchyAttributeId] || node["node_id"],
            label: label,
            isFirst: isFirstPath,
            isLast: isLastPath,
            icon: icon
          }));
        });
        hierarchyNodePaths.push(this.sina.createHierarchyNodePath({
          name: parentHierarchy.scope,
          path: hierarchyNodes
        }));
      }
      return hierarchyNodePaths;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyNodePathParser = HierarchyNodePathParser;
  return __exports;
});
//# sourceMappingURL=HierarchyNodePathParser-dbg.js.map
