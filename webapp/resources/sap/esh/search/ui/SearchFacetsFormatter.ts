/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ErrorHandler from "./error/ErrorHandler";
import SearchHierarchyDynamicFacetsFormatter from "./hierarchydynamic/SearchHierarchyDynamicFacetsFormatter";
import SearchHierarchyStaticFacetsFormatter from "./hierarchystatic/SearchHierarchyStaticFacetsFormatter";
import Facet from "./Facet";
import FacetItem from "./FacetItem";
import { DataSource } from "./sinaNexTS/sina/DataSource";
import { SearchResultSet } from "./sinaNexTS/sina/SearchResultSet";
import { ComparisonOperator } from "./sinaNexTS/sina/ComparisonOperator";
import SearchFacetDialogModel from "./SearchFacetDialogModel";
import { ChartResultSet } from "./sinaNexTS/sina/ChartResultSet";
import SearchModel from "./SearchModel";
import { FacetTypeUI } from "./controls/facets/FacetTypeUI";
import { AttributeMetadata } from "./sinaNexTS/sina/AttributeMetadata";

interface TreeNode {
    expanded: boolean;
    type: string;
    label: string;
    icon: string;
    getDataSource: () => DataSource;
    dataSourceId: string;
    children: Array<TreeNode>;
    toggleExpand: () => void;
}

interface TreeNode {
    expanded: boolean;
    type: string;
    label: string;
    icon: string;
    getDataSource: () => DataSource;
    dataSourceId: string;
    children: Array<TreeNode>;
    toggleExpand: () => void;
}

export default class SearchFacetsFormatter {
    searchFacetDialogModel: SearchModel;
    errorHandler: ErrorHandler;
    hierarchyDynamicFacetsFormatter: SearchHierarchyDynamicFacetsFormatter;
    hierarchyStaticFacetsFormatter: SearchHierarchyStaticFacetsFormatter;
    treeQuickSelectDataSourceFacet: any;

    constructor(searchModel: SearchModel) {
        this.searchFacetDialogModel = searchModel;
        this.errorHandler = ErrorHandler.getInstance();
        this.hierarchyDynamicFacetsFormatter = new SearchHierarchyDynamicFacetsFormatter(searchModel);
        this.hierarchyStaticFacetsFormatter = new SearchHierarchyStaticFacetsFormatter(searchModel);
    }

    private _getAncestorDataSources(searchModel: SearchModel): Array<FacetItem> {
        const aRecentDataSources: Array<FacetItem> = [];
        const oFilterDataSource = searchModel.dataSourceTree.findNode(
            searchModel.getProperty("/uiFilter/dataSource")
        );
        if (oFilterDataSource) {
            const aAncestorNodes = oFilterDataSource.getAncestors().reverse();
            for (let i = 0; i < aAncestorNodes.length; i++) {
                const ds = aAncestorNodes[i].dataSource;
                const dsFacetItem = new FacetItem({
                    label: ds.labelPlural,
                    icon: ds.icon || "sap-icon://none",
                    filterCondition: ds as any,
                    level: 0,
                    value: aAncestorNodes[i].count ? aAncestorNodes[i].count.toString() : "",
                });
                aRecentDataSources.push(dsFacetItem);
            }
        }
        return aRecentDataSources;
    }

    private _getSiblingDataSources(searchModel: SearchModel, level: number): Array<any> {
        const aSiblingFacetItems = [];
        const currentDS = searchModel.getProperty("/uiFilter/dataSource");
        const currentNode = searchModel.dataSourceTree.findNode(currentDS);
        let aSiblingNodes;
        if (currentNode.parent && !currentNode.unsureWhetherNodeisBelowRoot) {
            aSiblingNodes = currentNode.parent.getChildren();
        } else {
            aSiblingNodes = [];
        }
        if (aSiblingNodes.length === 0) {
            aSiblingNodes.push(currentNode);
        }
        for (let j = 0, lenJ = aSiblingNodes.length; j < lenJ; j++) {
            const ds = aSiblingNodes[j].dataSource;
            const fi = new FacetItem({
                label: ds.labelPlural,
                icon: ds.icon || "sap-icon://none",
                value: aSiblingNodes[j].count,
                filterCondition: ds,
                selected: currentDS === ds,
                level: level,
            });
            aSiblingFacetItems.push(fi);
            if (fi.selected) {
                aSiblingFacetItems.push(...this._getChildrenDataSources(searchModel, level + 1));
            }
        }
        return aSiblingFacetItems;
    }

    private _getChildrenDataSources(searchModel: SearchModel, level: number): Array<FacetItem> {
        // add children with data from the tree
        const aChildFacetItems: Array<FacetItem> = [];
        const currentDS = searchModel.getProperty("/uiFilter/dataSource");
        const aChildNodes = searchModel.dataSourceTree.findNode(currentDS).getChildren();
        for (let j = 0, lenJ = aChildNodes.length; j < lenJ; j++) {
            const ds = aChildNodes[j].dataSource;
            const fi = new FacetItem({
                label: ds.labelPlural,
                icon: ds.icon || "sap-icon://none",
                value: aChildNodes[j].count ? aChildNodes[j].count.toString() : "",
                filterCondition: ds as any,
                selected: false,
                level: level,
            });
            aChildFacetItems.push(fi);
        }
        return aChildFacetItems;
    }

    getDataSourceFacetFromTree(searchModel: SearchModel): Facet {
        const oDataSourceFacet = new Facet({
            facetType: FacetTypeUI.DataSource,
            title: "Search In",
        });
        const currentDS = searchModel.getProperty("/uiFilter/dataSource");
        const aAncestors = this._getAncestorDataSources(searchModel);
        oDataSourceFacet.items.push(...aAncestors);
        const aSiblings = this._getSiblingDataSources(
            searchModel,
            searchModel.allDataSource === currentDS ? 0 : 1
        );
        oDataSourceFacet.items.push(...aSiblings);
        return oDataSourceFacet;
    }

    private _createFacetItemsFromConditionGroup(
        dataSource: DataSource,
        rootCondition: any
    ): Array<FacetItem> {
        // ToDo 'any'
        const facetItems: Array<FacetItem> = [];
        for (let i = 0; i < rootCondition.conditions.length; i++) {
            const complexCondition = rootCondition.conditions[i];
            for (let j = 0; j < complexCondition.conditions.length; j++) {
                const condition = complexCondition.conditions[j];
                let facetAttribute;
                if (condition.type === this.searchFacetDialogModel.sinaNext.ConditionType.Simple) {
                    facetAttribute = condition.attribute;
                    if ((dataSource.getAttributeMetadata(facetAttribute) as AttributeMetadata).isHierarchy) {
                        continue;
                    }
                    facetItems.push(
                        new FacetItem({
                            facetAttribute: facetAttribute,
                            label: this._formatLabel(condition.valueLabel, condition.operator),
                            filterCondition: condition,
                            selected: true,
                        })
                    );
                } else {
                    facetAttribute = condition.conditions[0].attribute;
                    if ((dataSource.getAttributeMetadata(facetAttribute) as AttributeMetadata).isHierarchy) {
                        continue;
                    }
                    facetItems.push(
                        new FacetItem({
                            facetAttribute: facetAttribute,
                            label: condition.valueLabel,
                            filterCondition: condition,
                            selected: true,
                        })
                    );
                }
            }
        }
        return facetItems;
    }

    private _formatLabel(label: string, operator) {
        let labelFormatted;
        switch (operator) {
            case ComparisonOperator.Bw /*"Bw"*/:
                labelFormatted = label + "*";
                break;
            case ComparisonOperator.Ew /*"Ew"*/:
                labelFormatted = "*" + label;
                break;
            case ComparisonOperator.Co /*"Co"*/:
                labelFormatted = "*" + label + "*";
                break;
            default:
                labelFormatted = label;
                break;
        }
        return labelFormatted;
    }

    private getAttributeFacetsFromResultSet(resultSet: SearchResultSet, searchModel: SearchModel): any {
        const oDataSource = searchModel.getDataSource();
        if (oDataSource.type === searchModel.sinaNext.DataSourceType.Category) {
            return Promise.resolve([]); // UI decision: with Category, common attributes should not be shown
        }

        // get chart facets from resultSet
        const aServerSideFacets = resultSet.facets.filter(function (element) {
            return element && element.type && element.type === searchModel.sinaNext.FacetType.Chart;
        }) as Array<ChartResultSet>;

        // create facets and facet items from server response
        const aClientSideFacets = [];
        const aClientSideFacetsByDimension = {};
        for (const oServerSideFacet of aServerSideFacets) {
            let facetTotalCount;
            if (typeof oServerSideFacet?.facetTotalCount === "number") {
                facetTotalCount = oServerSideFacet?.facetTotalCount;
            } else {
                facetTotalCount = resultSet.totalCount;
            }
            const oClientSideFacet = new Facet({
                title: oServerSideFacet.title,
                facetType: FacetTypeUI.Attribute,
                dimension: oServerSideFacet.query.dimension,
                totalCount: facetTotalCount,
            });
            if (oServerSideFacet.items.length === 0) {
                continue;
            }
            for (let j = 0; j < oServerSideFacet.items.length; j++) {
                const oFacetListItem = oServerSideFacet.items[j];
                const item = new FacetItem({
                    facetAttribute: oServerSideFacet.query.dimension,
                    label: this._formatLabel(
                        oFacetListItem.dimensionValueFormatted,
                        oFacetListItem.filterCondition.operator
                    ),
                    value: oFacetListItem.measureValue as any,
                    filterCondition: oFacetListItem.filterCondition,
                    icon: oFacetListItem.icon,
                });
                item.facetTitle = oServerSideFacet.title;
                oClientSideFacet.items.push(item);
            }
            aClientSideFacetsByDimension[oServerSideFacet.query.dimension] = oClientSideFacet;
            aClientSideFacets.push(oClientSideFacet);
        }

        this.addDataTypeToClientSideFacets(aClientSideFacets, searchModel);

        // create facet items from global filter
        const oClientSideFacetsWithSelection = {};
        const aFacetItemsWithFilterConditions = this._createFacetItemsFromConditionGroup(
            oDataSource,
            searchModel.getProperty("/uiFilter/rootCondition")
        );

        // combine facets from global filter with facets from server
        for (let k = 0, lenK = aFacetItemsWithFilterConditions.length; k < lenK; k++) {
            const oSelectedFacetItem = aFacetItemsWithFilterConditions[k];
            const oClientSideFacetWithSelection =
                aClientSideFacetsByDimension[oSelectedFacetItem.facetAttribute];
            if (oClientSideFacetWithSelection) {
                // remove and insert selected facet on top, only in facet panel
                const indexOfClientSideFacetWithSelection = aClientSideFacets.indexOf(
                    oClientSideFacetWithSelection
                );
                if (indexOfClientSideFacetWithSelection > 0) {
                    aClientSideFacets.splice(indexOfClientSideFacetWithSelection, 1);
                    aClientSideFacets.splice(0, 0, oClientSideFacetWithSelection);
                }
                // facet with the same title as a already selected facetitems facet was sent by the server
                // -> merge the item into this facet. If the same facet item already exists just select it
                // var facetItemFoundInFacet = false;
                for (let m = 0, lenM = oClientSideFacetWithSelection.items.length; m < lenM; m++) {
                    const facetItem = oClientSideFacetWithSelection.items[m];
                    if (oSelectedFacetItem.filterCondition.equals(facetItem.filterCondition)) {
                        facetItem.selected = true;
                    }
                }
            }
            oClientSideFacetsWithSelection[oSelectedFacetItem.facetAttribute] = oClientSideFacetWithSelection;
        }

        return Promise.resolve(aClientSideFacets);
    }

    addDataTypeToClientSideFacets(aClientSideFacets, searchModel: SearchModel): void {
        const oDataSource = searchModel.getDataSource();
        for (let i = 0; i < aClientSideFacets.length; i++) {
            const oFacet = aClientSideFacets[i];
            try {
                const metadata = oDataSource.getAttributeMetadata(oFacet.dimension);
                oFacet.dataType = metadata.type;
            } catch (error) {
                this.errorHandler.onError(error);
            }
        }
    }

    addQuickSelectDataSourceFacet(searchModel: SearchModel, facets: Array<any>): void {
        if (searchModel.config.quickSelectDataSources.length === 0) {
            return;
        }
        const dataSource = searchModel.config.quickSelectDataSources[0];
        let facet;
        if (dataSource.type === "quickSelectDataSourceTreeNode") {
            // tree of datasources (one catalog)
            facet = this.createTreeQuickSelectDataSourceFacet(searchModel);
        } else {
            // flat list of datasources (repository explorer)
            facet = this.createListQuickSelectDataSourceFacet(searchModel);
        }
        facets.push(facet);
    }

    createListQuickSelectDataSourceFacet(searchModel: SearchModel): any {
        return {
            facetType: FacetTypeUI.QuickSelectDataSource,
            items: searchModel.config.quickSelectDataSources.map((ds) => {
                return {
                    type: "quickSelectDataSourceListItem",
                    dataSource: ds,
                };
            }),
        };
    }

    createTreeQuickSelectDataSourceFacet(searchModel: SearchModel): any {
        if (!this.treeQuickSelectDataSourceFacet) {
            // use same structure as for list display
            // root tree node is stored as first item
            this.treeQuickSelectDataSourceFacet = {
                facetType: FacetTypeUI.QuickSelectDataSource,
                items: [
                    {
                        type: "quickSelectDataSourceTreeNode",
                        children: searchModel.config.quickSelectDataSources.map((treeNodeProps) =>
                            this.createTreeNodeQuickSelectDataSource(treeNodeProps)
                        ),
                    },
                ],
            };
        }
        const rootNode = this.treeQuickSelectDataSourceFacet.items[0];
        this.expandPathToSelectedDataSource(searchModel, rootNode);
        return this.treeQuickSelectDataSourceFacet;
    }

    expandPathToSelectedDataSource(searchModel: SearchModel, rootNode: TreeNode) {
        type Path = Array<TreeNode>;

        // helper function for collecting all tree paths to a datasource
        function collectPaths(rootNode: TreeNode, dataSource): Array<Path> {
            const paths: Array<Path> = [];
            function findDataSource(path: Array<TreeNode>, node: TreeNode) {
                path = path.slice();
                path.push(node);
                if (node.getDataSource && node.getDataSource() === dataSource) {
                    paths.push(path);
                    return;
                }
                if (!node.children) {
                    return;
                }
                for (const childNode of node.children) {
                    findDataSource(path, childNode);
                }
            }
            findDataSource([], rootNode);
            return paths;
        }

        // collect all paths in the tree to the current datasource
        const paths = collectPaths(rootNode, searchModel.getDataSource());

        // expand paths
        for (const path of paths) {
            for (let i = 0; i < path.length - 1; ++i) {
                // i<path.length-1 because last path element is datasource itself and does not need expansion
                const node = path[i];
                node.expanded = true;
            }
        }
    }

    createTreeNodeQuickSelectDataSource(treeNodeProps): TreeNode {
        let children = [];
        if (treeNodeProps.children) {
            children = treeNodeProps.children.map((childTreeNodeProps) => {
                return this.createTreeNodeQuickSelectDataSource(childTreeNodeProps);
            });
        }
        return {
            expanded: false,
            type: "quickSelectDataSourceTreeNode",
            label: treeNodeProps.dataSource.labelPlural,
            icon: treeNodeProps.dataSource.icon,
            getDataSource: () => treeNodeProps.dataSource,
            dataSourceId: treeNodeProps.dataSource.id,
            children: children,
            toggleExpand: function () {
                this.expanded = !this.expanded;
            },
        };
    }

    async getFacets(
        oDataSource: DataSource,
        searchResultSet: SearchResultSet,
        searchModel: SearchModel
    ): Promise<any> {
        const resultFacets = [];

        // add datasource facet
        resultFacets.push(this.getDataSourceFacetFromTree(searchModel));

        // add quick select datasource facet
        this.addQuickSelectDataSourceFacet(searchModel, resultFacets);

        // for ds=apps or ds=category -> no attribute facets, just return
        if (
            oDataSource === searchModel.appDataSource ||
            oDataSource.type === searchModel.sinaNext.DataSourceType.Category
        ) {
            this.sortFacets(resultFacets, searchModel);
            this.setFacetIndex(resultFacets);
            return resultFacets;
        }

        // return if we have no searchResultSet
        if (!searchResultSet) {
            this.sortFacets(resultFacets, searchModel);
            this.setFacetIndex(resultFacets);
            return resultFacets;
        }

        // add dynamic hierarchy facets
        const hierarchyDynamicFacets = await this.hierarchyDynamicFacetsFormatter.getFacets(
            searchResultSet,
            searchModel
        );
        resultFacets.push(...hierarchyDynamicFacets);

        // add static hierarchy facets
        const hierarchyStaticFacets = await this.hierarchyStaticFacetsFormatter.getFacets(searchResultSet);
        resultFacets.push(...hierarchyStaticFacets);

        // add attribute facets
        const attributeFacets = await this.getAttributeFacetsFromResultSet(searchResultSet, searchModel);
        resultFacets.push(...attributeFacets);

        // sort
        this.sortFacets(resultFacets, searchModel);
        this.setFacetIndex(resultFacets);
        return resultFacets;
    }

    setFacetIndex(facets): void {
        // facet index is needed in SearchHierarchyFacet and SearchHierarchyStaticFacet for updating facets in the UI
        // see method refreshUI
        for (let i = 0; i < facets.length; ++i) {
            const facet = facets[i];
            if (facet.setFacetIndex) {
                facet.setFacetIndex(i);
            } else {
                facet.facetIndex = i;
            }
        }
    }

    sortFacets(facets: Array<Facet>, searchModel: SearchModel) {
        const facetPosition: { [key in FacetTypeUI]: number } = {
            [FacetTypeUI.DataSource]: -2000, // negative in order to not interfere with DSP exit
            [FacetTypeUI.QuickSelectDataSource]: -1000, // negative in order to not interfere with DSP exit
            [FacetTypeUI.HierarchyStatic]: 100,
            [FacetTypeUI.Hierarchy]: 1000,
            [FacetTypeUI.Attribute]: 1000,
        };

        for (let index = 0; index < facets.length; ++index) {
            const facet = facets[index];

            // keep original position
            facet.position = index;

            // add offset according to type
            facet.position += facetPosition[facet.facetType];

            // move facets with filters up
            if (facet.facetType === FacetTypeUI.Attribute || facet.facetType === FacetTypeUI.Hierarchy) {
                if (searchModel.getFilterRootCondition().containsAttribute(facet.dimension)) {
                    facet.position -= 500;
                }
            }
        }
        facets.sort((f1, f2) => f1.position - f2.position);
    }

    getDialogFacetsFromMetaData(
        dataSource: DataSource,
        searchFacetDialogModel: SearchFacetDialogModel
    ): Array<any> {
        const facets = [];
        // attribute facets
        const attributeFacets = this.getAttributeDialogFacetsFromMetaData(dataSource, searchFacetDialogModel);
        facets.push(...attributeFacets);
        // dynamic hierarchy attribute facets
        const hierarchyDynamicFacets = this.hierarchyDynamicFacetsFormatter.getFacetsFromMetadata(
            dataSource,
            searchFacetDialogModel
        );
        facets.push(...hierarchyDynamicFacets);
        // sort
        facets.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });
        // set facet index
        this.setFacetIndex(facets);
        return facets;
    }

    getAttributeDialogFacetsFromMetaData(
        oMetaData: DataSource,
        searchFacetDialogModel: SearchFacetDialogModel
    ): Array<any> {
        const aServerSideFacets = Object.values(oMetaData.attributeMetadataMap);
        const aClientSideFacets = [];
        // extract facets from server response:
        for (const oServerSideFacet of aServerSideFacets) {
            if (
                (oServerSideFacet.usage.Facet || oServerSideFacet.usage.AdvancedSearch) &&
                (oServerSideFacet as AttributeMetadata).isHierarchy !== true // Hierarchy attribute based facet is not displayed in the showmore dialog, but in static hierarchy facet.
            ) {
                const oClientSideFacet = new Facet({
                    title: (oServerSideFacet as AttributeMetadata).label,
                    facetType: FacetTypeUI.Attribute,
                    dimension: oServerSideFacet.id,
                    dataType: oServerSideFacet.type,
                    matchingStrategy: (oServerSideFacet as AttributeMetadata).matchingStrategy,
                });

                const aFacetItemsWithFilterConditions = this._createFacetItemsFromConditionGroup(
                    searchFacetDialogModel.getDataSource(),
                    searchFacetDialogModel.getProperty("/uiFilter/rootCondition")
                );
                let count = 0;
                for (let k = 0, lenK = aFacetItemsWithFilterConditions.length; k < lenK; k++) {
                    const oSelectedFacetItem = aFacetItemsWithFilterConditions[k];
                    oSelectedFacetItem.visible = oClientSideFacet.visible;
                    if (oSelectedFacetItem.facetAttribute === oClientSideFacet.dimension) {
                        count++;
                        oClientSideFacet.items.splice(0, 0, oSelectedFacetItem);
                    }
                }
                oClientSideFacet["count"] = count; // ToDo, 'count does not exist ?!?'

                aClientSideFacets.push(oClientSideFacet);
            }
        }

        return aClientSideFacets;
    }

    getDialogFacetsFromChartQuery(
        resultSet: ChartResultSet,
        searchModel: SearchModel,
        dimension: string,
        filters?: Array<any>
    ): Facet {
        const oClientSideFacet = new Facet({
            dimension: dimension,
            totalCount: resultSet?.facetTotalCount,
        });

        if (resultSet) {
            for (let j = 0; j < resultSet.items.length; j++) {
                const oFacetListItem = resultSet.items[j];
                const item = new FacetItem({
                    value: oFacetListItem.measureValue as any,
                    filterCondition: oFacetListItem.filterCondition,
                    label: oFacetListItem.dimensionValueFormatted,
                    facetAttribute: resultSet.query.dimension,
                });
                oClientSideFacet.items.push(item);
            }

            // add filter conditions as facet items:
            let aFacetItemsWithFilterConditions;
            if (filters) {
                aFacetItemsWithFilterConditions = filters;
            } else {
                aFacetItemsWithFilterConditions = this._createFacetItemsFromConditionGroup(
                    searchModel.getDataSource(),
                    searchModel.getProperty("/uiFilter/rootCondition")
                );
            }

            for (let k = 0, lenK = aFacetItemsWithFilterConditions.length; k < lenK; k++) {
                const oSelectedFacetItem = aFacetItemsWithFilterConditions[k];
                if (oSelectedFacetItem.facetAttribute === oClientSideFacet.dimension) {
                    let facetItemFoundInFacet = false;
                    for (let m = 0, lenM = oClientSideFacet.items.length; m < lenM; m++) {
                        const facetItem = oClientSideFacet.items[m];
                        if (oSelectedFacetItem.filterCondition.equals(facetItem.filterCondition)) {
                            facetItem.selected = true;
                            facetItemFoundInFacet = true;
                        }
                    }
                    if (!facetItemFoundInFacet) {
                        // there is no such facet item -> add the facet item to the facet
                        oClientSideFacet.items.splice(oClientSideFacet.items.length, 0, oSelectedFacetItem);
                        if (oSelectedFacetItem.filterCondition.userDefined) {
                            oSelectedFacetItem.advanced = true;
                        } else {
                            oSelectedFacetItem.listed = true;
                            oSelectedFacetItem.value = "";
                            oSelectedFacetItem.valueLabel = "";
                        }
                    } else {
                        oSelectedFacetItem.listed = true;
                    }
                }
            }
        }

        return oClientSideFacet;
    }

    hasDialogFacetsFromMetaData(searchModel: SearchModel): boolean {
        const oMetaData = searchModel.getDataSource();
        const aServerSideFacets = Object.values(oMetaData.attributeMetadataMap);
        let hasDialogFacets = false;

        // extract facets from server response:
        for (const oServerSideFacet of aServerSideFacets) {
            if (oServerSideFacet.usage) {
                if (oServerSideFacet.usage.Facet || oServerSideFacet.usage.AdvancedSearch) {
                    // TODO: ||, show more displays facets + advanced search
                    hasDialogFacets = true;
                    break;
                }
            }
        }
        return hasDialogFacets;
    }

    handleDataSourceChanged(): void {
        this.hierarchyDynamicFacetsFormatter.handleDataSourceChanged();
        this.hierarchyStaticFacetsFormatter.handleDataSourceChanged();
    }

    destroy(): void {
        this.hierarchyDynamicFacetsFormatter.destroy();
        this.hierarchyDynamicFacetsFormatter = null;
        this.hierarchyStaticFacetsFormatter.destroy();
        this.hierarchyStaticFacetsFormatter = null;
    }
}
