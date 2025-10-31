/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeGroupMetadata } from "../../sina/AttributeGroupMetadata";
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { HierarchyNode } from "../../sina/HierarchyNode";
import { HierarchyNodePath } from "../../sina/HierarchyNodePath";
import { SearchQuery } from "../../sina/SearchQuery";
import { Sina } from "../../sina/Sina";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { HANAOdataParentHierarchies } from "./Provider";

export class HierarchyNodePathParser {
    sina: Sina;

    constructor(sina: Sina) {
        this.sina = sina;
    }

    public parse(
        response: Array<HANAOdataParentHierarchies>,
        query: SearchQuery | SuggestionQuery
    ): Array<HierarchyNodePath> {
        const hierarchyNodePaths: Array<HierarchyNodePath> = [];
        if (!response) {
            return hierarchyNodePaths;
        }
        const staticHierarchyAttributeForDisplay =
            query.filter.dataSource._getStaticHierarchyAttributeForDisplay();
        for (const parentHierarchy of response) {
            const hierarchyAttributeId = parentHierarchy.scope;
            let hierarchyAttributeLabel = "";
            let hierarchyAttributeIcon = "";
            const hierarchyAttributeMeta = query.filter.dataSource.attributeMetadataMap[hierarchyAttributeId];
            if (staticHierarchyAttributeForDisplay instanceof AttributeGroupMetadata) {
                const childAttribute = staticHierarchyAttributeForDisplay._private
                    ?.childAttribute as AttributeMetadata;
                if (childAttribute instanceof AttributeMetadata) {
                    hierarchyAttributeLabel = childAttribute.id;
                }
                const parentAttribute = staticHierarchyAttributeForDisplay._private
                    ?.parentAttribute as AttributeMetadata;
                if (parentAttribute instanceof AttributeMetadata) {
                    hierarchyAttributeIcon = parentAttribute.iconUrlAttributeName;
                }
            } else if (staticHierarchyAttributeForDisplay instanceof AttributeMetadata) {
                hierarchyAttributeLabel = hierarchyAttributeMeta.id;
                hierarchyAttributeIcon = (hierarchyAttributeMeta as AttributeMetadata).iconUrlAttributeName;
            }

            if (!hierarchyAttributeLabel) {
                hierarchyAttributeLabel = "node_value";
            }
            const length = parentHierarchy.hierarchy.length;
            const hierarchyNodes: Array<HierarchyNode> = [];
            parentHierarchy.hierarchy.forEach((node, index) => {
                let isFirstPath = false;
                let isLastPath = false;
                let icon = node[hierarchyAttributeIcon] || node["icon"] || "sap-icon://folder";
                let label =
                    node[hierarchyAttributeLabel] ||
                    node["node_value"] ||
                    node[hierarchyAttributeId] ||
                    node["node_id"];
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
                hierarchyNodes.push(
                    this.sina.createHierarchyNode({
                        id: node[hierarchyAttributeId] || node["node_id"],
                        label: label,
                        isFirst: isFirstPath,
                        isLast: isLastPath,
                        icon: icon,
                    })
                );
            });
            hierarchyNodePaths.push(
                this.sina.createHierarchyNodePath({
                    name: parentHierarchy.scope,
                    path: hierarchyNodes,
                })
            );
        }
        return hierarchyNodePaths;
    }
}
