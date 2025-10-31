/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { StaticFacetSelectEvent, UserEventType } from "../eventlogging/UserEvents";
import { HierarchyNode } from "../sinaNexTS/sina/HierarchyNode";
import { SearchResultSet } from "../sinaNexTS/sina/SearchResultSet";
import TreeNode, { TreeNodeProperties } from "../tree/TreeNode";
import SearchHierarchyStaticFacet from "./SearchHierarchyStaticFacet";

interface SearchHierarchyStaticTreeNodeProperties extends TreeNodeProperties {
    icon?: string;
    facet: SearchHierarchyStaticFacet;
}

export default class SearchHierarchyStaticTreeNode extends TreeNode {
    hasFilter: boolean;
    icon: string;
    constructor(props: SearchHierarchyStaticTreeNodeProperties) {
        super(props);
        this.icon = props.icon;
        this.getData().facet = props.facet;
    }

    async setExpanded(expanded: boolean, updateUI?: boolean) {
        await super.setExpanded(expanded, false);
        this.getData().facet.mixinFilterNodes();
        if (updateUI) {
            this.getTreeNodeFactory().updateUI();
        }
    }

    async toggleFilter(): Promise<void> {
        const facet = this.getData().facet as SearchHierarchyStaticFacet;
        if (!this.hasFilter) {
            // set filter
            this.setFilter(true);
        } else {
            // remove filter
            this.setFilter(false);
        }
        await facet.activateFilters();
    }

    setFilter(set: boolean): void {
        const facet = this.getData().facet as SearchHierarchyStaticFacet;
        const filterCondition = facet.sina.createSimpleCondition({
            operator: facet.sina.ComparisonOperator.DescendantOf,
            attribute: facet.attributeId,
            attributeLabel: facet.title, // TODO
            value: this.id,
            valueLabel: this.label,
        });
        const uiFilter = facet.model.getProperty("/uiFilter");
        if (set) {
            this.removeExistingFilters();
            if (facet.model.config.searchInAreaOverwriteMode) {
                facet.model.config.resetQuickSelectDataSourceAll(facet.model);
            }
            facet.model.setSearchBoxTerm("", false);
            facet.model.resetFilterByFilterConditions(false);
            uiFilter.autoInsertCondition(filterCondition);
            const userEventStaticFacetSelect: StaticFacetSelectEvent = {
                type: UserEventType.STATIC_FACET_SELECT,
                clickedValue: this.id,
                clickedLabel: this.label,
                clickedPosition: -1, // position is not relevant for static facets
                dataSourceKey: facet.model.getDataSource().id,
            };
            facet.model.eventLogger.logEvent(userEventStaticFacetSelect);
        } else {
            uiFilter.autoRemoveCondition(filterCondition);
        }
    }

    removeExistingFilters() {
        const facet = this.getData().facet as SearchHierarchyStaticFacet;
        const uiFilter = facet.model.getProperty("/uiFilter");
        const filterConditonsForRemoval = uiFilter.rootCondition.getAttributeConditions(facet.attributeId);
        for (const filterCondition of filterConditonsForRemoval) {
            uiFilter.autoRemoveCondition(filterCondition);
        }
    }

    async fetchChildTreeNodesImpl(): Promise<Array<SearchHierarchyStaticTreeNode>> {
        // helper functions
        const getId = (item) => {
            for (let i = 0; i < item.attributes.length; ++i) {
                const attribute = item.attributes[i];
                if (attribute.id === facet.attributeId) {
                    return attribute.value;
                }
            }
        };
        const getLabel = (item) => {
            const label = [];
            for (let i = 0; i < item.titleAttributes.length; ++i) {
                const titleAttribute = item.titleAttributes[i];
                if (!titleAttribute.value.startsWith("sap-icon://")) {
                    label.push(titleAttribute.valueFormatted);
                }
            }
            return label.join(" ");
        };
        const getIcon = (item) => {
            for (let i = 0; i < item.attributes.length; ++i) {
                const attribute = item.attributes[i];
                if (typeof attribute.value === "string" && attribute.value.startsWith("sap-icon://")) {
                    return attribute.value;
                }
            }
            return "sap-icon://none";
        };

        const facet = this.getData().facet as SearchHierarchyStaticFacet;
        const filter = facet.sina.createFilter({ dataSource: facet.dataSource });
        filter.autoInsertCondition(
            facet.sina.createSimpleCondition({
                attribute: facet.attributeId,
                value: this.id,
                operator: facet.sina.ComparisonOperator.ChildOf,
            })
        );
        const query = facet.sina.createSearchQuery({
            filter: filter,
            top: 500,
        });
        const resultSet = (await query.getResultSetAsync()) as SearchResultSet;

        if (resultSet.hasErrors()) {
            resultSet.getErrors().forEach((error) => facet.model.errorHandler.onError(error));
        }

        const childTreeNodes = [];
        for (let i = 0; i < resultSet.items.length; ++i) {
            const item = resultSet.items[i];
            const node = facet.treeNodeFactory.createTreeNode({
                facet: facet,
                id: getId(item),
                label: getLabel(item),
                icon: getIcon(item),
                expandable:
                    !item.attributesMap.HASHIERARCHYNODECHILD ||
                    item.attributesMap.HASHIERARCHYNODECHILD.value === "true",
            }); // ToDo, try to get rid of artificial attribute 'HASHIERARCHYNODECHILD'
            childTreeNodes.push(node);
        }
        return childTreeNodes;
    }

    updateNodePath(path: Array<HierarchyNode>, index: number): void {
        if (path[index].id !== this.id) {
            throw new Error("program error"); // TODO
        }
        if (index + 1 >= path.length) {
            return;
        }
        const pathPart = path[index + 1];
        let childNode = this.getChildTreeNodeById(pathPart.id) as SearchHierarchyStaticTreeNode;
        if (!childNode) {
            const facet = this.getData().facet as SearchHierarchyStaticFacet;
            childNode = facet.treeNodeFactory.createTreeNode({
                facet: facet,
                id: pathPart.id,
                label: pathPart.label,
            });
            this.addChildTreeNode(childNode);
        }
        childNode.updateNodePath(path, index + 1);
    }
}
