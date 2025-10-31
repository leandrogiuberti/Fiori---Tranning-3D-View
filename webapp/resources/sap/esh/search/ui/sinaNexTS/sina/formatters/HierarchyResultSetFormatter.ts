/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { HierarchyNodePath } from "../HierarchyNodePath";
import { ResultSet } from "../ResultSet";
import { SearchQuery } from "../SearchQuery";
import { SearchResultSet } from "../SearchResultSet";
import { Formatter } from "./Formatter";
import * as sinaUtil from "../util";
import { SearchResultSetItem } from "../SearchResultSetItem";
import { DataSource } from "../DataSource";
import { AttributeMetadata } from "../AttributeMetadata";
import { FilteredDataSource } from "../FilteredDataSource";

interface ResultListItemParams {
    resultSetItem: SearchResultSetItem;
    dataSource: DataSource;
    hierarchyDataSource: DataSource;
    staticHierarchyAttributeMetadata: AttributeMetadata;
}
export class HierarchyResultSetFormatter extends Formatter {
    initAsync(): Promise<void> {
        return Promise.resolve();
    }

    format(resultSet: ResultSet): ResultSet {
        return resultSet;
    }

    async formatAsync(resultSet: SearchResultSet): Promise<SearchResultSet> {
        // check feature flag: title links, tooltips, attribute links are only generated in case the breadcrumb is switched on
        if (!resultSet.sina.configuration.FF_hierarchyBreadcrumbs) {
            return resultSet;
        }

        // Only reformat search results instead of facet items in show more dialog
        // The second condition is to exclude hierarchy facets which also send SearchQuery
        if (!(resultSet.query instanceof SearchQuery)) {
            return resultSet;
        }

        // check that there is a hierarchy datasource
        const dataSource = resultSet.query.filter.dataSource;
        const hierarchyDataSource = dataSource.getHierarchyDataSource();
        if (!hierarchyDataSource) {
            return resultSet;
        }
        const staticHierarchyAttributeMetadata = dataSource.getStaticHierarchyAttributeMetadata();
        if (!staticHierarchyAttributeMetadata) {
            return resultSet;
        }
        // process all items
        resultSet.items.forEach((resultSetItem) => {
            this.processResultSetItem({
                resultSetItem: resultSetItem,
                dataSource: dataSource,
                hierarchyDataSource: hierarchyDataSource,
                staticHierarchyAttributeMetadata: staticHierarchyAttributeMetadata,
            });
        });

        return resultSet;
    }

    private getHierarchyNodePath(
        hierarchyNodePaths: Array<HierarchyNodePath>,
        hierarchyAttributeName: string
    ) {
        if (!hierarchyNodePaths) {
            return;
        }
        for (const hierarchyNodePath of hierarchyNodePaths) {
            if (hierarchyNodePath.name === hierarchyAttributeName) {
                return hierarchyNodePath;
            }
        }
    }

    private processResultSetItem(params: ResultListItemParams) {
        this.assembleTitleNavigationTarget(params);
        this.assembleHierarchyAttributeNavigationTarget(params);
    }

    private assembleTitleNavigationTarget(params: ResultListItemParams) {
        // determine hierarchy node id of result list item (= folder in DSP) (needed for filter condition)
        const hierarchyNodePath = this.getHierarchyNodePath(
            params.resultSetItem.hierarchyNodePaths,
            params.staticHierarchyAttributeMetadata.id
        );
        if (!hierarchyNodePath || !hierarchyNodePath.path || hierarchyNodePath.path.length < 1) {
            return;
        }
        const lastNode = hierarchyNodePath.path[hierarchyNodePath.path.length - 1];

        // determine static hierarch attribute
        const staticHierarchyAttribute =
            params.resultSetItem.attributesMap[params.staticHierarchyAttributeMetadata.id];

        // assemble title
        const mergedTitleValues = sinaUtil.assembleTitle(params.resultSetItem);

        // assemble navigation target
        params.resultSetItem.setDefaultNavigationTarget(
            params.resultSetItem.sina.createStaticHierarchySearchNavigationTarget(
                lastNode.id,
                mergedTitleValues || staticHierarchyAttribute?.value || "",
                this.exchangeDataSourceForFilteredDataSource(params.dataSource),
                "",
                params.staticHierarchyAttributeMetadata.id
            )
        );
    }

    private assembleHierarchyAttributeNavigationTarget(params: ResultListItemParams) {
        const staticHierarchyAttribute =
            params.resultSetItem.attributesMap[params.staticHierarchyAttributeMetadata.id];
        if (!staticHierarchyAttribute) {
            return;
        }
        const hierarchyAttributeNavigationTargetLabel =
            this.constructHierarchyAttributeNavigationTargetLabel(params);
        staticHierarchyAttribute.setDefaultNavigationTarget(
            params.resultSetItem.sina.createStaticHierarchySearchNavigationTarget(
                staticHierarchyAttribute.value,
                hierarchyAttributeNavigationTargetLabel, // for filter condition value label
                this.exchangeDataSourceForFilteredDataSource(params.dataSource),
                hierarchyAttributeNavigationTargetLabel, // for targetNavigation label
                params.staticHierarchyAttributeMetadata.id
            )
        );
        staticHierarchyAttribute.tooltip = this._constructTooltip(params);
    }

    private exchangeDataSourceForFilteredDataSource(dataSource: DataSource): DataSource {
        if (
            dataSource.sina.configuration?.searchInAreaOverwriteMode === true &&
            dataSource instanceof FilteredDataSource
        ) {
            dataSource = dataSource.dataSource;
        }
        return dataSource;
    }

    private _constructTooltip(params: ResultListItemParams): string {
        // get hierarchy node path
        const hierarchyNodePath = this.getHierarchyNodePath(
            params.resultSetItem.hierarchyNodePaths,
            params.staticHierarchyAttributeMetadata.id
        );
        if (!hierarchyNodePath || !hierarchyNodePath.path || hierarchyNodePath.path.length < 1) {
            return "";
        }
        const path = hierarchyNodePath.path;
        // get last part of path, in folder scenario, it should be the parent folder
        const lastNode = path[path.length - 1];
        // Specific case: if the result item is a folder object, the path includes also the item folder itself
        // then the second last part of the path is the parent folder, we remove the last part of the path
        if (
            lastNode.id !==
            params.resultSetItem.attributesMap[params.staticHierarchyAttributeMetadata.id].value
        ) {
            path.splice(path.length - 1, 1);
        }
        // join path parts
        return path.map((path) => path.label).join(" / ");
    }

    private constructHierarchyAttributeNavigationTargetLabel(params: ResultListItemParams): string {
        // get hierarchy node path
        const hierarchyNodePath = this.getHierarchyNodePath(
            params.resultSetItem.hierarchyNodePaths,
            params.staticHierarchyAttributeMetadata.id
        );
        const staticHierarchyAttribute =
            params.resultSetItem.attributesMap[params.staticHierarchyAttributeMetadata.id];
        if (
            !hierarchyNodePath ||
            !hierarchyNodePath.path ||
            hierarchyNodePath.path.length < 1 ||
            !staticHierarchyAttribute
        ) {
            return "";
        }
        const path = hierarchyNodePath.path;
        // get last part of path, in folder scenario, it should be the parent folder
        let lastNode = path[path.length - 1];
        // Specific case: if the result item is a folder object, the path includes also the item folder itself
        // then the second last part of the path is the parent folder
        if (
            lastNode.id !==
                params.resultSetItem.attributesMap[params.staticHierarchyAttributeMetadata.id].value &&
            path.length > 1
        ) {
            lastNode = path[path.length - 2];
        }
        return lastNode.label || staticHierarchyAttribute.label || "";
    }
}
