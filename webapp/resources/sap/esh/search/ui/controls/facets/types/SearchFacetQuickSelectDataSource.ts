/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import List, { $ListSettings } from "sap/m/List";
import StandardListItem from "sap/m/StandardListItem";
import { FlexAlignItems, FlexJustifyContent, ListSeparators } from "sap/m/library";
import { ListMode } from "sap/m/library";
import { ListType } from "sap/m/library";
import CustomData from "sap/ui/core/CustomData";
import Tree, { Tree$ToggleOpenStateEvent } from "sap/m/Tree";
import CustomListItem from "sap/m/CustomListItem";
import SearchFacetHierarchyStaticTreeItem from "./SearchFacetHierarchyStaticTreeItem";
import Label from "sap/m/Label";
import Icon from "sap/ui/core/Icon";
import SearchModel from "sap/esh/search/ui/SearchModel";
import { DataSource } from "../../../sinaNexTS/sina/DataSource";
import { QuickSelectSwitchEvent, UserEventType } from "../../../eventlogging/UserEvents";
import Context from "sap/ui/model/Context";
import VBox from "sap/m/VBox";
import FlexBox from "sap/m/FlexBox";
import i18n from "../../../i18n";

export interface QuickSelectDataSource {
    dataSource: DataSource;
    type: "quickSelectDataSourceTreeNode";
    children: Array<{ dataSource: DataSource }>;
}

/**
 * Quick-select datasource facet
 */

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetQuickSelectDataSource extends VBox {
    private tree: Tree;

    constructor(sId?: string, options?: Partial<$ListSettings>) {
        super(sId, options);
        this.addStyleClass("sapUshellSearchFacetContainer");

        const header = new FlexBox({
            justifyContent: FlexJustifyContent.SpaceBetween,
            alignItems: FlexAlignItems.Center,
            items: [new Label({ text: i18n.getText("quickSelectDataSourcesHeader") })],
        });
        header.addStyleClass("sapUshellSearchFacetHeader");
        this.addItem(header);

        const dataSourcesList = new List({
            itemPress: (event) => {
                const itemControl = event.getParameter("srcControl");
                const item = itemControl.getBindingContext().getObject() as QuickSelectDataSource;
                this.handleSelectDataSource(item.dataSource);
                const oModel = this.getModel() as SearchModel;
                const userEventQuickSelectSwitch: QuickSelectSwitchEvent = {
                    type: UserEventType.QUICK_SELECT_SWITCH,
                    dataSourceKey: item.dataSource.id,
                };
                oModel.eventLogger.logEvent(userEventQuickSelectSwitch);
            },
            items: {
                path: "items",
                factory: (sId: string, oContext: Context) => {
                    const object = oContext.getObject() as QuickSelectDataSource;
                    if (object.type === "quickSelectDataSourceTreeNode") {
                        // tree display (one catalog)
                        return this.createTree();
                    } else {
                        // flat list (repo explorer)
                        return this.createListItem();
                    }
                },
            },
        });
        dataSourcesList.setShowSeparators(ListSeparators.None);
        dataSourcesList.setMode(ListMode.SingleSelectMaster);
        this.addItem(dataSourcesList);

        // legacy: keep compatability for exit setQuickSelectDataSourceAllAppearsNotSelected
        (this as any).getSelectedItem = dataSourcesList.getSelectedItem.bind(dataSourcesList);
    }

    handleSelectDataSource(dataSource: DataSource): void {
        const oModel = this.getModel() as SearchModel;
        // reset search term (even if selected item gets pressed again)
        if (oModel.config.bResetSearchTermOnQuickSelectDataSourceItemPress) {
            oModel.setSearchBoxTerm("", false);
        }
        // when filter is changed (here data source), give a callback to adjust the conditions
        if (typeof oModel.config.adjustFilters === "function") {
            oModel.config.adjustFilters(oModel);
        }
        oModel.setDataSource(dataSource);
    }

    createTree(): CustomListItem {
        this.tree = new Tree({
            mode: ListMode.None,
            includeItemInSelection: true,
            items: {
                path: "children",
                factory: this.createTreeItem.bind(this),
            },
            toggleOpenState: function (event: Tree$ToggleOpenStateEvent) {
                (event.getParameter("itemContext") as any).getObject().toggleExpand();
            },
        });
        const delegate = {
            onAfterRendering: function () {
                this.expandTreeNodes();
            }.bind(this),
        };
        this.addEventDelegate(delegate, this);
        return new CustomListItem({
            content: this.tree,
        });
    }

    expandTreeNodes(): void {
        const facetModel = this.getBindingContext().getObject();
        const rootNode = (facetModel as any).items[0]; // ToDo
        this.expandTreeNodeRecursively(rootNode, true);
    }

    expandTreeNodeRecursively(node: any, isRootNode?: boolean): void {
        if (node.expanded && !isRootNode) {
            this.doExpandTreeNode(node);
        }
        if (!node.children) {
            return;
        }
        for (let i = 0; i < node.children.length; ++i) {
            const childNode = node.children[i];
            this.expandTreeNodeRecursively(childNode);
        }
    }

    doExpandTreeNode(node: any): void {
        const items = this.tree.getItems();
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            const itemNode = item.getBindingContext().getObject();
            if (itemNode === node) {
                this.tree.expand(i);
                return;
            }
        }
    }

    createTreeItem(sId: string, oContext: any): SearchFacetHierarchyStaticTreeItem {
        const content = [];
        const iconUrl = oContext.getObject().icon;
        if (iconUrl) {
            const icon = new Icon("", {
                src: "{icon}",
            });
            icon.addStyleClass("sapUiTinyMarginEnd");
            content.push(icon);
        }
        const label = new Label({
            text: "{label}",
        });
        label.attachBrowserEvent("click", () => {
            this.handleSelectDataSource(oContext.getObject().getDataSource());
        });
        content.push(label);
        const treeItem = new SearchFacetHierarchyStaticTreeItem("", {
            content: content,
            selectLine: {
                parts: ["/queryFilter", "dataSourceId"],
                formatter: function (queryFilter, dataSourceId) {
                    return queryFilter.dataSource.id === dataSourceId;
                },
            },
        });
        return treeItem;
    }

    createListItem(): StandardListItem {
        return new StandardListItem("", {
            type: ListType.Active,
            title: "{dataSource/label}",
            tooltip: "{dataSource/label}",
            icon: "{dataSource/icon}",
            customData: [
                new CustomData({
                    key: "test-id-collection",
                    value: "{dataSource/label}",
                    writeToDom: true,
                }),
            ],
            selected: {
                parts: [{ path: "/queryFilter" }, { path: "dataSource" }],
                formatter(queryFilter, dataSource) {
                    const model = this.getModel() as SearchModel;
                    const { searchInAreaOverwriteMode } = model.config;
                    if (
                        searchInAreaOverwriteMode &&
                        model.getStaticHierarchyFilterConditions().length === 1
                    ) {
                        return false;
                    }
                    return queryFilter.dataSource === dataSource;
                },
            },
        });
    }

    static renderer = {
        apiVersion: 2,
    };
}
