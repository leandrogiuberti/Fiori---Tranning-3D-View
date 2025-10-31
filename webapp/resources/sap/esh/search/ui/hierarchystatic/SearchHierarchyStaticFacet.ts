/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/*!
 * The SearchHierarchyStaticFacet class is used for the model representation of static hierarchy facets.
 * The corresponding UI control is SearchFacetHierarchyStatic.
 */

import SearchModel from "sap/esh/search/ui/SearchModel";
import { ComplexCondition } from "../sinaNexTS/sina/ComplexCondition";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import { Filter } from "../sinaNexTS/sina/Filter";
import { HierarchyNodePath } from "../sinaNexTS/sina/HierarchyNodePath";
import { SimpleCondition } from "../sinaNexTS/sina/SimpleCondition";
import { Sina } from "../sinaNexTS/sina/Sina";
import TreeNodeFactory from "../tree/TreeNodeFactory";
import SearchHierarchyStaticTreeNode from "./SearchHierarchyStaticTreeNode";
import { sequentializedExecution } from "../SearchHelperSequentializeDecorator";
import { FacetTypeUI } from "../controls/facets/FacetTypeUI";

export interface SearchHierarchyStaticFacetOptions {
    model: SearchModel;
    attributeId: string;
    dataSource: DataSource;
    filter: Filter;
    title: string;
}
export default class SearchHierarchyStaticFacet {
    public static readonly rootNodeId = "$$ROOT$$";
    model: SearchModel;
    attributeId: string;
    dataSource: DataSource;
    filter: Filter;
    title: string;
    sina: Sina;
    facetType: string; // ToDo
    facetIndex: number;
    position: number;
    treeNodeFactory: TreeNodeFactory<SearchHierarchyStaticTreeNode, typeof SearchHierarchyStaticTreeNode>;
    rootTreeNode: SearchHierarchyStaticTreeNode;

    constructor(properties: SearchHierarchyStaticFacetOptions) {
        this.model = properties.model;
        this.sina = this.model.sinaNext;
        this.attributeId = properties.attributeId;
        this.dataSource = properties.dataSource;
        this.filter = properties.filter;
        this.facetType = FacetTypeUI.HierarchyStatic;
        this.title = properties.title;
        this.facetIndex = -1;
        this.position = -1;
        this.treeNodeFactory = TreeNodeFactory.create<
            SearchHierarchyStaticTreeNode,
            typeof SearchHierarchyStaticTreeNode
        >({
            model: this.model,
            rootTreeNodePath: `/facets/${this.facetIndex}/rootTreeNode`, // updated in setFacetIndex
            treeNodeConstructor: SearchHierarchyStaticTreeNode,
            busyIndicator: this.model.busyIndicator,
        });
        this.rootTreeNode = this.treeNodeFactory.createRootTreeNode({
            id: SearchHierarchyStaticFacet.rootNodeId,
            label: "Root",
            facet: this,
        });
        this.updateTree = sequentializedExecution(this.updateTree);
    }

    setFacetIndex(index: number) {
        this.facetIndex = index;
        this.treeNodeFactory.setRootTreeNodePath(`/facets/${this.facetIndex}/rootTreeNode`);
    }

    async initAsync(): Promise<void> {
        const childTreeNodes = await this.rootTreeNode.fetchChildTreeNodes();
        this.rootTreeNode.addChildTreeNodes(childTreeNodes);
    }

    async activateFilters(): Promise<void> {
        try {
            await this.model.fireSearchQuery();
            this.model.notifyFilterChanged();
        } finally {
            //
        }
    }

    updateTree(): Promise<void> {
        // not sure whether sequentialized decorator does work on async methods
        // therefore use this wrapper
        return this.doUpdateTree();
    }

    async doUpdateTree(): Promise<void> {
        await this.treeNodeFactory.updateRecursively();
        await this.mixinFilterNodes();
        this.treeNodeFactory.updateUI();
    }
    getComplexConditionOfFacet(): ComplexCondition {
        for (const complexCondition of (this.filter.rootCondition as ComplexCondition).conditions) {
            if (complexCondition.containsAttribute(this.attributeId)) {
                return complexCondition as ComplexCondition;
            }
        }
        return null;
    }

    getFilterConditions(): Array<SimpleCondition> {
        const filterConditions: Array<SimpleCondition> = [];
        const complexCondition = this.getComplexConditionOfFacet();
        if (!complexCondition) {
            return filterConditions;
        }
        for (const condition of complexCondition.conditions) {
            filterConditions.push(condition as SimpleCondition);
        }
        return filterConditions;
    }

    async mixinFilterNodes(): Promise<void> {
        // reset filter flags for complete tree
        this.rootTreeNode.hasFilter = false;
        this.rootTreeNode.visitChildNodesRecursively(function (node) {
            node.hasFilter = false;
        });
        // set filter flag from filter conditions
        const filterConditions = this.getFilterConditions();
        for (const filterCondition of filterConditions) {
            const node = this.treeNodeFactory.getTreeNode(filterCondition.value as string);
            if (!node) {
                continue; // TODO shall never happen
            }
            node.hasFilter = true;
        }
        // auto expand first filter
        await this.autoExpandFirstFilterNode();
    }

    handleModelUpdate() {
        this.treeNodeFactory.updateUI();
    }

    delete() {
        this.treeNodeFactory.delete();
    }

    async autoExpandFirstFilterNode(): Promise<void> {
        // determine first node with filter
        let firstFilterNode: SearchHierarchyStaticTreeNode = null;
        this.rootTreeNode.visitChildNodesRecursively(function (node) {
            if (node.hasFilter && !firstFilterNode) {
                firstFilterNode = node;
            }
        });
        if (!firstFilterNode) {
            return;
        }
        if (firstFilterNode.isVisible()) {
            return;
        }
        // expand nodes following path to root node
        let node = firstFilterNode.getParentTreeNode();
        while (node) {
            node.expanded = true;
            node = node.getParentTreeNode();
        }
        // update tree
        await this.treeNodeFactory.updateRecursively();
    }

    updateNodesFromHierarchyNodePaths(hierarchyNodePaths: Array<HierarchyNodePath>): void {
        for (let i = 0; i < hierarchyNodePaths.length; ++i) {
            const hierarchyNodePath = hierarchyNodePaths[i];
            if (hierarchyNodePath.name !== this.attributeId) {
                continue;
            }
            this.rootTreeNode.updateNodePath(hierarchyNodePath.path, 0);
        }
    }
}
