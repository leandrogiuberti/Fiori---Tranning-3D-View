/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/*!
 * The SearchHierarchyDynamicFacet class is used for the model representation of dynamic hierarchy facets.
 * * The corresponding UI control is SearchFacetHierarchyDynamic.
 */

import SearchModel from "sap/esh/search/ui/SearchModel";
import { ComplexCondition } from "../sinaNexTS/sina/ComplexCondition";
import { Condition } from "../sinaNexTS/sina/Condition";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import { Filter } from "../sinaNexTS/sina/Filter";
import { HierarchyNode } from "../sinaNexTS/sina/HierarchyNode";
import { HierarchyNodePath } from "../sinaNexTS/sina/HierarchyNodePath";
import { HierarchyResultSet } from "../sinaNexTS/sina/HierarchyResultSet";
import { SimpleCondition } from "../sinaNexTS/sina/SimpleCondition";
import { Sina } from "../sinaNexTS/sina/Sina";
import TreeNodeFactory from "../tree/TreeNodeFactory";
import SearchHierarchyDynamicTreeNode from "./SearchHierarchyDynamicTreeNode";
import StructureTree, { StructureTreeNode } from "./StructureTree";
import { FacetTypeUI } from "../controls/facets/FacetTypeUI";

type SetFilterCallback = (
    node: SearchHierarchyDynamicTreeNode,
    set: boolean,
    filterCondition: SimpleCondition
) => void;
export interface SearchHierarchyDynamicFacetOptions {
    model: SearchModel;
    sina: Sina;
    dataSource: DataSource;
    attributeId: string;
    title: string;
    filter: Filter;
    modelPathPrefix: string;
    isShowMoreDialog?: boolean;
    handleSetFilter?: SetFilterCallback;
}
export default class SearchHierarchyDynamicFacet {
    public static readonly rootNodeId = "$$ROOT$$";

    model: SearchModel;
    sina: Sina;
    dataSource: DataSource;
    attributeId: string;
    title: string;
    filter: Filter;
    modelPathPrefix: string;
    isShowMoreDialog: boolean;
    handleSetFilter: SetFilterCallback;
    filterCount?: number;
    dimension: string;
    facetType: string;
    facetIndex: number;
    structureTree: StructureTree;
    notDisplayedFilterConditions: Array<any>;
    treeNodeFactory: TreeNodeFactory<SearchHierarchyDynamicTreeNode, typeof SearchHierarchyDynamicTreeNode>;
    rootTreeNode: SearchHierarchyDynamicTreeNode;

    constructor(properties: SearchHierarchyDynamicFacetOptions) {
        this.model = properties.model;
        this.sina = properties.sina;
        this.dataSource = properties.dataSource;
        this.attributeId = properties.attributeId;
        this.dimension = this.attributeId; // alias for compatability with the simple attribute facets
        this.title = properties.title;
        this.filter = properties.filter;
        this.modelPathPrefix = properties.modelPathPrefix;
        this.isShowMoreDialog = properties.isShowMoreDialog;
        this.handleSetFilter = properties.handleSetFilter;
        this.filterCount = (this.filter.rootCondition as ComplexCondition).getAttributeConditions(
            this.attributeId
        ).length;
        this.facetType = FacetTypeUI.Hierarchy;
        this.facetIndex = -1;
        this.structureTree = new StructureTree({
            rootNode: { id: SearchHierarchyDynamicFacet.rootNodeId, label: "root" },
        });
        this.notDisplayedFilterConditions = [];
        this.treeNodeFactory = TreeNodeFactory.create<
            SearchHierarchyDynamicTreeNode,
            typeof SearchHierarchyDynamicTreeNode
        >({
            model: this.model,
            rootTreeNodePath: `/facets/${this.facetIndex}/rootTreeNode`, // updated in setFacetIndex
            treeNodeConstructor: SearchHierarchyDynamicTreeNode,
            busyIndicator: this.model.busyIndicator,
        });
        this.rootTreeNode = this.treeNodeFactory.createRootTreeNode({
            id: SearchHierarchyDynamicFacet.rootNodeId,
            label: "Root",
            count: 0,
            facet: this,
        });
    }

    setFilter(filter: Filter) {
        this.filter = filter;
    }

    setHandleSetFilter(handleSetFilter: SetFilterCallback) {
        this.handleSetFilter = handleSetFilter;
    }

    setFacetIndex(index: number) {
        this.facetIndex = index;
        this.treeNodeFactory.setRootTreeNodePath(`${this.modelPathPrefix}/${this.facetIndex}/rootTreeNode`);
    }

    updateStructureTree(sinaNode: HierarchyNode): void {
        this.structureTree.update(sinaNode);
    }

    async activateFilters(): Promise<void> {
        try {
            await this.model.fireSearchQuery();
            this.model.notifyFilterChanged();
        } finally {
            //
        }
    }

    updateFromResultSet(resultSet: HierarchyResultSet): Promise<void> {
        const childTreeNodes: Array<SearchHierarchyDynamicTreeNode> = [];
        for (const childNode of resultSet.node.childNodes) {
            childTreeNodes.push(
                this.treeNodeFactory.createTreeNode({
                    id: childNode.id,
                    label: childNode.label,
                    count: childNode.count,
                    facet: this,
                    expandable: childNode.hasChildren,
                })
            );
        }
        this.rootTreeNode.updateChildren(childTreeNodes);
        this.updateStructureTree(resultSet.node);
        return Promise.resolve();
    }

    getComplexConditionOfFacet(): ComplexCondition {
        for (let i = 0; i < (this.filter.rootCondition as ComplexCondition).conditions.length; ++i) {
            const complexCondition = (this.filter.rootCondition as ComplexCondition).conditions[
                i
            ] as ComplexCondition;
            if (complexCondition.containsAttribute(this.attributeId)) {
                return complexCondition;
            }
        }
        return null;
    }

    getFilterConditions(): Array<Condition> {
        const filterConditions = [];
        const complexCondition = this.getComplexConditionOfFacet() as ComplexCondition;
        if (!complexCondition) {
            return filterConditions;
        }
        for (let i = 0; i < complexCondition.conditions.length; ++i) {
            const condition = complexCondition.conditions[i];
            filterConditions.push(condition);
        }
        return filterConditions;
    }

    mixinFilterNodes(): void {
        // reset filter flag for complete tree
        this.rootTreeNode.hasFilter = false;
        this.rootTreeNode.visitChildNodesRecursively(function (treeNode: SearchHierarchyDynamicTreeNode) {
            treeNode.hasFilter = false;
        });
        // update filter flag from filter conditions
        let treeNodeId;
        const notDisplayedFilterConditions = [];
        const filterConditions = this.getFilterConditions();
        for (let i = 0; i < filterConditions.length; ++i) {
            const filterCondition = filterConditions[i];
            treeNodeId = (filterCondition as any).value; // ToDo
            const treeNode = this.treeNodeFactory.getTreeNode(treeNodeId);
            if (treeNode) {
                treeNode.hasFilter = true;
            } else {
                notDisplayedFilterConditions.push(filterCondition);
            }
        }
        // add tree nodes for filters not in tree
        for (let j = 0; j < notDisplayedFilterConditions.length; ++j) {
            const notDisplayedFilterCondition = notDisplayedFilterConditions[j];
            treeNodeId = notDisplayedFilterCondition.value;
            // try to add filter node via structure tree
            if (this.addMissingFilterNode(treeNodeId)) {
                // in case of success delete from notDisplayedFilterConditions list
                notDisplayedFilterConditions.splice(j, 1);
                j--;
            }
        }
        this.notDisplayedFilterConditions = notDisplayedFilterConditions;
        this.calculateCheckboxStatus();
        this.calculateFilterCount();
    }

    calculateFilterCount() {
        const filterCount = (this.filter.rootCondition as ComplexCondition).getAttributeConditions(
            this.attributeId
        ).length;
        this.model.setProperty(`${this.modelPathPrefix}/${this.facetIndex}/filterCount`, filterCount);
    }

    addMissingFilterNode(id: string): boolean {
        const getOrCreateTreeNode = (
            structureTreeNode: StructureTreeNode
        ): SearchHierarchyDynamicTreeNode => {
            let treeNode = this.treeNodeFactory.getTreeNode(structureTreeNode.id);
            if (treeNode) {
                if (treeNode.isVisible()) {
                    return treeNode;
                } else {
                    return null;
                }
            }
            if (!structureTreeNode.parentNode) {
                throw new Error("program error parent node missing for " + structureTreeNode.id);
            }
            const parentTreeNode = getOrCreateTreeNode(structureTreeNode.parentNode);
            if (!parentTreeNode) {
                return null;
            }
            treeNode = this.treeNodeFactory.createTreeNode({
                id: structureTreeNode.id,
                label: structureTreeNode.label,
                count: 0,
                facet: this,
            });
            parentTreeNode.addChildTreeNode(treeNode);
            return treeNode;
        };

        const structureTreeNode = this.structureTree.getNode(id);
        if (!structureTreeNode) {
            return false;
        }
        const treeNode = getOrCreateTreeNode(structureTreeNode);
        if (!treeNode) {
            return false;
        }
        treeNode.hasFilter = true;
        return true;
    }

    calculateCheckboxStatus(): void {
        // reset
        this.rootTreeNode.selected = false;
        this.rootTreeNode.partiallySelected = false;
        this.rootTreeNode.visitChildNodesRecursively(function (node: SearchHierarchyDynamicTreeNode) {
            node.selected = false;
            node.partiallySelected = false;
        });
        // collect leafs
        const leafNodes = [];
        if (!this.rootTreeNode.hasChildNodes()) {
            leafNodes.push(this.rootTreeNode);
        }
        this.rootTreeNode.visitChildNodesRecursively(function (node: SearchHierarchyDynamicTreeNode) {
            if (!node.hasChildNodes()) {
                leafNodes.push(node);
            }
        });
        // calculate selected and partiallySelected
        for (let i = 0; i < leafNodes.length; ++i) {
            const leafNode = leafNodes[i];
            this.calculateCheckboxStatusFromLeafNode(leafNode);
        }
    }

    calculateCheckboxStatusFromLeafNode(leafNode: SearchHierarchyDynamicTreeNode): void {
        let node = leafNode;
        let markPartiallySelected = false;
        while (node) {
            if (node.selected && node.partiallySelected) {
                return;
            }
            if (node.hasFilter) {
                node.selected = true;
                node.partiallySelected = false;
                markPartiallySelected = true;
            } else {
                if (markPartiallySelected) {
                    node.selected = true;
                    node.partiallySelected = true;
                }
            }
            node = node.getParentTreeNode() as SearchHierarchyDynamicTreeNode;
        }
    }
    handleModelUpdate() {
        this.treeNodeFactory.updateUI();
    }

    delete() {
        this.treeNodeFactory.delete();
    }

    updateNodesFromHierarchyNodePaths(hierarchyNodePaths: Array<HierarchyNodePath>) {
        for (const hierarchyNodePath of hierarchyNodePaths) {
            if (hierarchyNodePath.name !== this.attributeId) {
                continue;
            }
            this.structureTree.updateFromHierarchyNodePath(hierarchyNodePath);
        }
    }
}
