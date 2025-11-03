/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../../../i18n";
import Tree from "sap/m/Tree";
import CustomTreeItem from "sap/m/CustomTreeItem";
import Label from "sap/m/Label";
import CheckBox, { CheckBox$SelectEvent } from "sap/m/CheckBox";
import { FlexAlignItems, FlexJustifyContent, ListType } from "sap/m/library";
import BindingMode from "sap/ui/model/BindingMode";
import TreeView from "../../../tree/TreeView";
import Link from "sap/m/Link";
import VBox from "sap/m/VBox";
import SearchHierarchyDynamicFacet from "../../../hierarchydynamic/SearchHierarchyDynamicFacet";
import SearchModel from "../../../SearchModel";
import Context from "sap/ui/model/Context";
import SearchHierarchyDynamicTreeNode from "../../../hierarchydynamic/SearchHierarchyDynamicTreeNode";
import TreeViewItem from "../../../tree/TreeViewItem";
import FlexBox from "sap/m/FlexBox";
import { ShowMoreDialogOptions } from "../../OpenShowMoreDialog";

/**
 * Hierarchy facet (dynamic)
 *
 * The SearchFacetHierarchyDynamic control is used for displaying dynamic hierarchy facets.
 * Corresponding model objects:
 * - hierarchydynamic/SearchHierarchyDynamicFacet.js : facet with pointer to root hierarchy node
 * - hierarchydynamic/SearchHierarchyDynamicNode.js  : hierarchy node
 */

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetHierarchyDynamic extends VBox {
    static readonly metadata = {
        properties: {
            showTitle: {
                type: "boolean",
                defaultValue: true,
            },
            openShowMoreDialogFunction: {
                type: "function",
            },
        },
    };

    private tree: Tree;
    constructor(sId?: string, options?: any /* Partial<$SearchFacetHierarchyDynamic> */) {
        super(sId, options);
        this.addStyleClass("sapUshellSearchFacetContainer");

        // heading
        if (this.getShowTitle()) {
            const header = new FlexBox({
                justifyContent: FlexJustifyContent.SpaceBetween,
                alignItems: FlexAlignItems.Center,
                items: [new Label({ text: "{title}" })],
            });
            header.addStyleClass("sapUshellSearchFacetHeader");
            this.addItem(header);
        }

        // tree
        const treeView = new TreeView("", {
            treeNodeFactory: "{treeNodeFactory}",
            items: {
                path: "rootTreeNode/childTreeNodes",
                factory: (sId: string, oContext: Context) => {
                    return this.createTreeItem(sId, oContext);
                },
            },
        });
        // define group for F6 handling (tree)
        treeView.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
        this.addItem(treeView);

        // show more link
        this.createShowMoreLink();
    }

    getOpenShowMoreDialogFunction(): (options: ShowMoreDialogOptions) => Promise<void> {
        return this.getProperty("openShowMoreDialogFunction");
    }

    createShowMoreLink() {
        const oShowMoreLink = new Link("", {
            text: i18n.getText("showMore"),
            press: () => {
                const facet = this.getBindingContext().getObject() as SearchHierarchyDynamicFacet;
                const openShowMoreDialog = this.getOpenShowMoreDialogFunction();
                openShowMoreDialog({
                    searchModel: this.getModel() as SearchModel,
                    dimension: facet.attributeId,
                    selectedTabBarIndex: 0,
                    tabBarItems: undefined,
                    sourceControl: this,
                });
            },
        });
        const oInfoZeile = new Label("", {
            text: "",
        });
        oShowMoreLink.addStyleClass("sapUshellSearchFacetShowMoreLink");
        const oShowMoreSlot = new VBox("", {
            items: [oInfoZeile, oShowMoreLink],
            visible: {
                parts: [{ path: "isShowMoreDialog" }],
                formatter: function (isShowMoreDialog) {
                    return !isShowMoreDialog;
                },
            },
        });
        oShowMoreSlot.addStyleClass("sapUshellSearchFacetShowMore");
        this.addItem(oShowMoreSlot);
    }

    getShowTitle(): boolean {
        return this.getProperty("showTitle");
    }

    createTreeItem(sId: string, oContext: Context): CustomTreeItem {
        const treeNode = oContext.getObject() as SearchHierarchyDynamicTreeNode;
        const checkBox = new CheckBox({
            selected: {
                path: "selected",
                mode: BindingMode.OneWay,
            },
            partiallySelected: {
                path: "partiallySelected",
                mode: BindingMode.OneWay,
            },
            select: function (event: CheckBox$SelectEvent) {
                const treeNode = event
                    .getSource()
                    .getBindingContext()
                    .getObject() as SearchHierarchyDynamicTreeNode;
                treeNode.toggleFilter();
            },
        });
        const label = new Label({
            text: {
                parts: [{ path: "label" }, { path: "count" }],
                formatter: function (label, count) {
                    return count ? label + " (" + count + ")" : label;
                },
            },
        });
        const treeItem = new TreeViewItem("", {
            content: [checkBox, label],
        });
        treeItem.attachPress(() => {
            treeNode.toggleFilter();
        });
        treeItem.setType(ListType.Active);
        return treeItem;
    }

    static renderer = {
        apiVersion: 2,
    };
}
