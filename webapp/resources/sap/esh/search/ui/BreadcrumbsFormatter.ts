/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "./SearchModel";
import { AttributeMetadata } from "./sinaNexTS/sina/AttributeMetadata";
import { HierarchyDisplayType } from "./sinaNexTS/sina/HierarchyDisplayType";
import { HierarchyNode } from "./sinaNexTS/sina/HierarchyNode";
import { HierarchyNodePath } from "./sinaNexTS/sina/HierarchyNodePath";
import { SearchResultSet } from "./sinaNexTS/sina/SearchResultSet";

export class Formatter {
    model: SearchModel;
    constructor(model: SearchModel) {
        this.model = model;
    }
    formatNodePaths(searchResultSet: SearchResultSet): Array<HierarchyNode> {
        if (searchResultSet) {
            const path = this._selectNodePath(searchResultSet);
            if (path) {
                return path.path;
            }
        }
        return [];
    }

    formatHierarchyAttribute(searchResultSet: SearchResultSet): string {
        if (searchResultSet) {
            const path = this._selectNodePath(searchResultSet);
            if (path) {
                return path.name;
            }
        }
        return "";
    }

    _selectNodePath(searchResultSet: SearchResultSet): HierarchyNodePath {
        const paths = searchResultSet.hierarchyNodePaths;
        if (paths && Array.isArray(paths) && paths.length > 0) {
            for (let i = 0; i < paths.length; i++) {
                const path = paths[i];
                const attributeName = path.name;
                if (path && Array.isArray(path.path) && attributeName) {
                    const attrMetadata = searchResultSet.query
                        .getDataSource()
                        ?.attributesMetadata?.find(
                            (attributeMetadata) => attributeMetadata.id === attributeName
                        ) as AttributeMetadata | undefined;
                    if (
                        attrMetadata &&
                        attrMetadata.isHierarchy === true &&
                        (attrMetadata.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView ||
                            attrMetadata.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet)
                    ) {
                        return path;
                    }
                }
            }
        }
        return null;
    }
}
