/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/*!
 * The SearchHierarchyStaticFacetsFormatter is called from the search model after each search.
 * The formatter assembles the static facets from the sina search result.
 */

import SearchModel from "sap/esh/search/ui/SearchModel";
import { SearchResultSet } from "../sinaNexTS/sina/SearchResultSet";
import SearchHierarchyStaticFacet from "./SearchHierarchyStaticFacet";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import { AttributeMetadata } from "../sinaNexTS/sina/AttributeMetadata";

export default class SearchHierarchyStaticFacetsFormatter {
    model: SearchModel;
    facetMap: { [key: string]: SearchHierarchyStaticFacet };

    constructor(model: SearchModel) {
        this.model = model;
        this.facetMap = {};
    }

    getFacetAttributes(resultSet: SearchResultSet): Array<{ attributeId: string; dataSource: DataSource }> {
        const attributesMetadata = resultSet.query.filter.dataSource.attributesMetadata;
        const facetAttributes = [];
        for (let i = 0; i < attributesMetadata.length; ++i) {
            const attributeMetadata = attributesMetadata[i] as AttributeMetadata;
            if (!attributeMetadata.isHierarchy) {
                continue;
            }
            if (
                attributeMetadata.hierarchyDisplayType !==
                resultSet.sina.HierarchyDisplayType.StaticHierarchyFacet
            ) {
                continue;
            }
            const dataSource = resultSet.sina.getHierarchyDataSource(attributeMetadata.hierarchyName);
            if (!dataSource) {
                continue;
            }
            facetAttributes.push({
                attributeId: attributeMetadata.id,
                dataSource: dataSource,
            });
        }
        return facetAttributes;
    }

    async getFacet(
        resultSet: SearchResultSet,
        model: SearchModel,
        facetAttribute
    ): Promise<SearchHierarchyStaticFacet> {
        let facet;
        try {
            facet = this.facetMap[facetAttribute.attributeId];
            if (!facet) {
                const attributeMetadata = resultSet.query.filter.dataSource.getAttributeMetadata(
                    facetAttribute.attributeId
                ) as AttributeMetadata;
                facet = new SearchHierarchyStaticFacet({
                    model: model,
                    attributeId: facetAttribute.attributeId,
                    dataSource: facetAttribute.dataSource,
                    filter: model.getProperty("/uiFilter"),
                    title: attributeMetadata.label,
                });
                this.facetMap[facetAttribute.attributeId] = facet;
                facet.treeNodeFactory.cache.activate();
                await facet.initAsync();
            }
            facet.treeNodeFactory.cache.activate();
            facet.filter = model.getProperty("/uiFilter");
            facet.updateNodesFromHierarchyNodePaths(resultSet.hierarchyNodePaths);
            await facet.mixinFilterNodes();
            return facet;
        } finally {
            facet.treeNodeFactory.cache.deActivate();
        }
    }

    getFacets(resultSet: SearchResultSet): Promise<Array<SearchHierarchyStaticFacet>> {
        if (!this.model.config.FF_staticHierarchyFacets) {
            return Promise.resolve([]);
        }
        if (!this.model.getProperty("/facetVisibility")) {
            return Promise.resolve([]);
        }
        const facetAttributes = this.getFacetAttributes(resultSet);
        const facetPromises = [];
        for (let i = 0; i < facetAttributes.length; ++i) {
            const facetAttribute = facetAttributes[i];
            const facet = this.getFacet(resultSet, this.model, facetAttribute);
            facetPromises.push(facet);
        }
        return Promise.all(facetPromises);
    }

    destroy(): void {
        for (const facetAttributeId in this.facetMap) {
            const facet = this.facetMap[facetAttributeId];
            facet.delete();
        }
        this.facetMap = {};
    }

    handleDataSourceChanged(): void {
        this.destroy();
    }
}
