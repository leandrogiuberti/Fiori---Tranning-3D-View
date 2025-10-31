/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/*!
 * The SearchHierarchyDynamicFacetsFormatter is called from the search model after each search.
 * The formatter assembles the dynamic facets from the sina search result.
 */

import SearchModel from "sap/esh/search/ui/SearchModel";
import SearchFacetDialogModel from "../SearchFacetDialogModel";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import { FacetResultSet } from "../sinaNexTS/sina/FacetResultSet";
import { HierarchyDisplayType } from "../sinaNexTS/sina/HierarchyDisplayType";
import { HierarchyResultSet } from "../sinaNexTS/sina/HierarchyResultSet";
import { SearchResultSet } from "../sinaNexTS/sina/SearchResultSet";
import SearchHierarchyDynamicFacet from "./SearchHierarchyDynamicFacet";
import { AttributeMetadata } from "../sinaNexTS/sina/AttributeMetadata";

export default class SearchHierarchyDynamicFacetsFormatter {
    testCounter: number;
    facetMap: { [key: string]: SearchHierarchyDynamicFacet };
    facetFromMetadataMap: { [key: string]: SearchHierarchyDynamicFacet };
    model: SearchModel;

    constructor(model: SearchModel) {
        this.testCounter = 0;
        this.facetMap = {};
        this.facetFromMetadataMap = {};
        this.model = model;
    }

    getFacetAttributes(resultSet: SearchResultSet): Array<any> {
        // display facets which are included in the server response
        const facetAttributes = [];
        for (let i = 0; i < resultSet.facets.length; ++i) {
            const facetResultSet = resultSet.facets[i];
            if (facetResultSet.type !== resultSet.sina.FacetType.Hierarchy) {
                continue;
            }
            if (!facetResultSet["node"]) {
                // ToDo
                continue; // TODO: server error?
            }
            const facetAttribute = (facetResultSet.query as any).attributeId; // ToDo
            if (facetAttributes.indexOf(facetAttribute) >= 0) {
                continue;
            }
            facetAttributes.push(facetAttribute);
        }

        // display facet for which filters are set
        const filterFacetAttributes = resultSet.query.filter.rootCondition.getAttributes();
        for (let j = 0; j < filterFacetAttributes.length; ++j) {
            const filterFacetAttribute = filterFacetAttributes[j];
            const filterFacetAttributeMetadata = resultSet.query.filter.dataSource.getAttributeMetadata(
                filterFacetAttribute
            ) as AttributeMetadata;
            if (
                !(
                    filterFacetAttributeMetadata.isHierarchy &&
                    filterFacetAttributeMetadata.usage &&
                    ((filterFacetAttributeMetadata.usage.Facet &&
                        typeof filterFacetAttributeMetadata.usage.Facet.displayOrder === "number") ||
                        (filterFacetAttributeMetadata.usage.AdvancedSearch &&
                            typeof filterFacetAttributeMetadata.usage.AdvancedSearch.displayOrder ===
                                "number"))
                )
            ) {
                continue;
            }
            if (facetAttributes.indexOf(filterFacetAttribute) >= 0) {
                continue;
            }
            facetAttributes.push(filterFacetAttribute);
        }
        return facetAttributes;
    }

    getFacetFromResultSet(resultSet: SearchResultSet, attributeId: string): FacetResultSet {
        for (let i = 0; i < resultSet.facets.length; ++i) {
            const facetResultSet = resultSet.facets[i];
            if (attributeId === (facetResultSet.query as any).attributeId) {
                // ToDo
                return facetResultSet;
            }
        }
    }

    async getFacet(
        resultSet: SearchResultSet,
        searchModel: SearchModel,
        attributeId: string
    ): Promise<SearchHierarchyDynamicFacet> {
        const attributeMetadata = resultSet.query.filter.dataSource.getAttributeMetadata(
            attributeId
        ) as AttributeMetadata;
        let facet = this.facetMap[attributeId];
        if (!facet) {
            facet = new SearchHierarchyDynamicFacet({
                model: searchModel,
                sina: resultSet.sina,
                dataSource: resultSet.query.filter.dataSource,
                attributeId: attributeId,
                title: attributeMetadata.label,
                filter: this.model.getProperty("/uiFilter"),
                modelPathPrefix: "/facets",
                isShowMoreDialog: false,
            });
            this.facetMap[attributeId] = facet;
        }
        facet.setFilter(this.model.getProperty("/uiFilter"));
        const containsAttribute = resultSet.query.filter.rootCondition.containsAttribute(attributeId);
        const hasExpandedChildNode = facet.rootTreeNode && facet.rootTreeNode.hasExpandedChildNode();
        if (containsAttribute || hasExpandedChildNode) {
            await facet.treeNodeFactory.updateRecursively();
        } else {
            const facetResultSet = this.getFacetFromResultSet(resultSet, attributeId);
            facet.updateFromResultSet(facetResultSet as HierarchyResultSet);
        }
        facet.updateNodesFromHierarchyNodePaths(resultSet.hierarchyNodePaths);
        facet.mixinFilterNodes();
        return facet;
    }

    getFacets(resultSet: SearchResultSet, searchModel: SearchModel): any {
        if (!this.model.config.FF_dynamicHierarchyFacets) {
            return Promise.resolve([]);
        }
        // determine which facets to be displayed
        const facetAttributes = this.getFacetAttributes(resultSet);
        // create/update facets
        const facets = [];
        for (let i = 0; i < facetAttributes.length; ++i) {
            const facetAttribute = facetAttributes[i];
            const facetPromise = this.getFacet(resultSet, searchModel, facetAttribute);
            facets.push(facetPromise);
        }
        return Promise.all(facets).then(function (result) {
            return Array.from(result);
        });
    }

    destroy(): void {
        for (const facetAttributeId in this.facetMap) {
            const facet = this.facetMap[facetAttributeId];
            facet.delete();
        }
        this.facetMap = {};
        for (const facetAttributeId in this.facetFromMetadataMap) {
            const facet = this.facetFromMetadataMap[facetAttributeId];
            facet.delete();
        }
        this.facetFromMetadataMap = {};
    }

    handleDataSourceChanged(): void {
        this.destroy();
    }

    getFacetFromMetadata(
        attributeId: string,
        dataSource: DataSource,
        searchFacetDialogModel: SearchFacetDialogModel
    ): SearchHierarchyDynamicFacet {
        let facet = this.facetFromMetadataMap[attributeId];
        if (facet) {
            return facet;
        }
        const attributeMetadata = dataSource.getAttributeMetadata(attributeId) as AttributeMetadata;
        facet = new SearchHierarchyDynamicFacet({
            model: searchFacetDialogModel,
            sina: dataSource.sina,
            dataSource: dataSource,
            attributeId: attributeId,
            title: attributeMetadata.label,
            filter: this.model.getProperty("/uiFilter"),
            modelPathPrefix: "/facetDialog",
            isShowMoreDialog: true,
        });
        this.facetFromMetadataMap[attributeId] = facet;
        return facet;
    }

    getFacetsFromMetadata(
        dataSource: DataSource,
        searchFacetDialogModel: SearchFacetDialogModel
    ): Array<SearchHierarchyDynamicFacet> {
        const facets: Array<SearchHierarchyDynamicFacet> = [];
        if (!searchFacetDialogModel.config.FF_dynamicHierarchyFacetsInShowMore) {
            return facets;
        }
        for (const attributeMetadata of dataSource.attributesMetadata) {
            if (
                (attributeMetadata as AttributeMetadata).isHierarchy &&
                (attributeMetadata as AttributeMetadata).hierarchyDisplayType ===
                    HierarchyDisplayType.DynamicHierarchyFacet
            ) {
                facets.push(
                    this.getFacetFromMetadata(attributeMetadata.id, dataSource, searchFacetDialogModel)
                );
            }
        }
        return facets;
    }
}
