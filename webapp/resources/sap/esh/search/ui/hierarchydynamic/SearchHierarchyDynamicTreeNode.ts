/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { HierarchyResultSet } from "../sinaNexTS/sina/HierarchyResultSet";
import TreeNode, { TreeNodeProperties } from "../tree/TreeNode";
import TreeNodeFactory from "../tree/TreeNodeFactory";
import SearchHierarchyDynamicFacet from "./SearchHierarchyDynamicFacet";

interface SearchHierarchyDynamicTreeNodeProperties extends TreeNodeProperties {
    count: number;
    facet: SearchHierarchyDynamicFacet;
}

export default class SearchHierarchyDynamicTreeNode extends TreeNode {
    count: number;
    selected: boolean;
    partiallySelected: boolean;
    hasFilter: boolean;
    constructor(props: SearchHierarchyDynamicTreeNodeProperties) {
        super(props);
        this.count = props.count;
        this.selected = false;
        this.partiallySelected = false;
        this.hasFilter = false;
        this.getData().facet = props.facet;
    }

    /*wait() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }*/

    async fetchChildTreeNodesImpl(): Promise<Array<SearchHierarchyDynamicTreeNode>> {
        const resultChildNodes: Array<SearchHierarchyDynamicTreeNode> = [];
        // assemble filter by removing attribute conditions of "own" facet attribute
        // (we want to show all children independend on the selection done in the "own" facet)
        const facet = this.getData().facet as SearchHierarchyDynamicFacet;
        const filter = this.getData().facet.filter.clone();
        filter.rootCondition.removeAttributeConditions(facet.attributeId);
        // fetch sina result set
        const resultSet = (await facet.sina
            .createHierarchyQuery({
                attributeId: facet.attributeId,
                nodeId: this.id,
                filter: filter,
                nlq: facet?.model?.isNlqActive(),
            })
            .getResultSetAsync()) as HierarchyResultSet;
        if (resultSet.hasErrors()) {
            const facet = this.getData().facet as SearchHierarchyDynamicFacet;
            resultSet.getErrors().forEach((error) => facet.model.errorHandler.onError(error));
        }
        if (!resultSet?.node?.childNodes) {
            return resultChildNodes;
        }
        const treeNodeFactory = this.getTreeNodeFactory() as TreeNodeFactory<
            SearchHierarchyDynamicTreeNode,
            typeof SearchHierarchyDynamicTreeNode
        >;
        for (const childNode of resultSet.node.childNodes) {
            resultChildNodes.push(
                treeNodeFactory.createTreeNode({
                    id: childNode.id,
                    label: childNode.label,
                    count: childNode.count,
                    facet: this.getData().facet,
                    expandable: childNode.hasChildren,
                })
            );
        }
        (this.getData().facet as SearchHierarchyDynamicFacet).updateStructureTree(resultSet.node);
        return resultChildNodes;
    }

    async setExpanded(expanded: boolean, updateUI?: boolean) {
        await super.setExpanded(expanded, false);
        this.getData().facet.mixinFilterNodes();
        if (updateUI) {
            this.getTreeNodeFactory().updateUI();
        }
    }

    toggleFilter(): void {
        if (this.selected) {
            if (this.partiallySelected) {
                // 1. checkbox with square
                this.setFilter(true);
                this.visitParentNodesRecursively(function (node) {
                    node.setFilter(false);
                });
                this.visitChildNodesRecursively(function (node) {
                    node.setFilter(false);
                });
            } else {
                // 2. selected checkbox
                this.setFilter(false);
            }
        } else {
            // 3. not selected checkbox
            this.setFilter(true);
            this.visitParentNodesRecursively(function (node) {
                node.setFilter(false);
            });
        }
        const facet = this.getData().facet as SearchHierarchyDynamicFacet;
        if (facet.isShowMoreDialog) {
            facet.mixinFilterNodes();
            facet.treeNodeFactory.updateUI();
        } else {
            facet.activateFilters();
        }
    }

    setFilter(set: boolean): void {
        const facet = this.getData().facet as SearchHierarchyDynamicFacet;
        const filterCondition = facet.sina.createSimpleCondition({
            operator: facet.sina.ComparisonOperator.DescendantOf,
            attribute: facet.attributeId,
            attributeLabel: facet.title,
            value: this.id,
            valueLabel: this.label,
        });
        if (set) {
            facet.filter.autoInsertCondition(filterCondition);
            facet.model.setProperty("/facetDialogOverallCounter", true);
        } else {
            facet.filter.autoRemoveCondition(filterCondition);
            // TODO: this if condition works for disable reset button in facet dialog, but could be improved
            if (facet.model["aFilters"]?.length === 1 && facet.filterCount === 1) {
                facet.model.setProperty("/facetDialogOverallCounter", false);
            }
        }
        if (facet.handleSetFilter) {
            facet.handleSetFilter(this, set, filterCondition);
        }
    }
}
