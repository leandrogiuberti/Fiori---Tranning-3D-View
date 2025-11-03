/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import FacetItem from "./FacetItem";
import SearchHierarchyDynamicFacet from "./hierarchydynamic/SearchHierarchyDynamicFacet";
import SearchHierarchyDynamicTreeNode from "./hierarchydynamic/SearchHierarchyDynamicTreeNode";
import SearchFacetDialogModel from "./SearchFacetDialogModel";
import { SimpleCondition } from "./sinaNexTS/sina/SimpleCondition";

export async function updateDetailPageforDynamicHierarchy(
    model: SearchFacetDialogModel,
    dynamicHierarchyFacet: SearchHierarchyDynamicFacet,
    filters: Array<any>
) {
    function handleSetFilter(
        node: SearchHierarchyDynamicTreeNode,
        set: boolean,
        filterCondition: SimpleCondition
    ) {
        const facet = node.getData().facet as SearchHierarchyDynamicFacet;
        const facetItem = createFilterFacetItemForDynamicHierarchy(facet, filterCondition);
        if (set) {
            model.addFilter(facetItem);
        } else {
            model.removeFilter(facetItem);
        }
    }

    const facetFilter = dynamicHierarchyFacet.sina.createFilter({ dataSource: model.getDataSource() });
    // firstly add static hierachy facets
    const staticHierarchyFilterConditions = model.getStaticHierarchyFilterConditions();
    if (staticHierarchyFilterConditions.length > 0) {
        for (const nonFilterByCondition of staticHierarchyFilterConditions) {
            facetFilter.autoInsertCondition(nonFilterByCondition);
        }
    }
    for (const filter of filters) {
        facetFilter.autoInsertCondition(filter.filterCondition);
    }
    dynamicHierarchyFacet.setFilter(facetFilter);
    dynamicHierarchyFacet.setHandleSetFilter(handleSetFilter);
    await dynamicHierarchyFacet.treeNodeFactory.updateRecursively();
    dynamicHierarchyFacet.updateNodesFromHierarchyNodePaths(model.getProperty("/hierarchyNodePaths"));
    dynamicHierarchyFacet.mixinFilterNodes();
    dynamicHierarchyFacet.treeNodeFactory.updateUI();
}

export function createFilterFacetItemForDynamicHierarchy(
    facet: SearchHierarchyDynamicFacet,
    condition: SimpleCondition
): FacetItem {
    return new FacetItem({
        selected: false,
        level: 0,
        filterCondition: condition,
        value: condition.value as string,
        valueLabel: condition.valueLabel,
        label: facet.title,
        facetTitle: facet.title,
        facetAttribute: facet.attributeId,
        advanced: true,
        listed: true,
        icon: null,
        visible: true,
    });
}
