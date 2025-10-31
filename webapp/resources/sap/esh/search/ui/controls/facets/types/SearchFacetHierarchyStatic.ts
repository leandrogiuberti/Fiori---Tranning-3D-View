/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { $ListSettings } from "sap/m/List";
import SearchFacetHierarchyStaticTreeItem from "./SearchFacetHierarchyStaticTreeItem";
import Label from "sap/m/Label";
import { FlexAlignItems, FlexJustifyContent, ListType } from "sap/m/library";
import Icon from "sap/ui/core/Icon";
import FlexBox from "sap/m/FlexBox";
import TreeView from "../../../tree/TreeView";
import FlexItemData from "sap/m/FlexItemData";
import SearchHierarchyStaticFacet from "../../../hierarchystatic/SearchHierarchyStaticFacet";
import Context from "sap/ui/model/Context";
import SearchHierarchyStaticTreeNode from "../../../hierarchystatic/SearchHierarchyStaticTreeNode";
import VBox from "sap/m/VBox";

/**
 * Hierarchy facet (static)
 *
 * The SearchFacetHierarchyStatic control is used for displaying static hierarchy facets.
 * Corresponding model objects:
 * - hierarchystatic/SearchHierarchyStaticFacet.js : facet with pointer to root hierarchy node
 * - hierarchystatic/SearchHierarchyStaticNode.js  : hierarchy node
 */

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetHierarchyStatic extends VBox {
    constructor(sId?: string, options?: $ListSettings) {
        super(sId, options);
        this.addStyleClass("sapUshellSearchFacetContainer");
        // heading
        const header = new FlexBox({
            justifyContent: FlexJustifyContent.SpaceBetween,
            alignItems: FlexAlignItems.Center,
            items: [new Label({ text: "{title}" })],
        });
        header.addStyleClass("sapUshellSearchFacetHeader");
        this.addItem(header);
        // tree
        const treeView = new TreeView("", {
            treeNodeFactory: "{treeNodeFactory}",
            items: {
                path: "rootTreeNode/childTreeNodes",
                factory: this.createTreeItem.bind(this),
            },
        });
        this.addItem(treeView);
        treeView.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
        this.bindProperty("visible", {
            parts: [{ path: "rootTreeNode/childTreeNodes/length" }],
            formatter: () => {
                const facet = this.getBindingContext().getObject() as SearchHierarchyStaticFacet;
                const childTreeNodes = facet?.rootTreeNode?.childTreeNodes;
                if (!childTreeNodes) {
                    return false;
                }
                const realTreeNodes = childTreeNodes.filter((treeNode) => treeNode.id !== "dummy");
                return realTreeNodes.length > 0;
            },
        });
    }

    createTreeItem(sId: string, oContext: Context): SearchFacetHierarchyStaticTreeItem {
        // label
        const treeItemLabel = new Label({
            text: "{label}",
            width: "100%",
        });
        treeItemLabel.setLayoutData(new FlexItemData({ growFactor: 1 }));
        treeItemLabel.addStyleClass("sapUshellSearchHierarchyFacetItemLabel");
        const treeNode = oContext.getObject() as SearchHierarchyStaticTreeNode;
        // icon
        const treeItemIcon = new Icon("", {
            src: "{icon}",
        });
        treeItemIcon.addStyleClass("sapUshellSearchHierarchyFacetItemIcon");
        treeItemIcon.setLayoutData(new FlexItemData({ growFactor: 0 }));

        // flex box containing label + icon
        const treeItemFlex = new FlexBox("", {
            items: [treeItemIcon, treeItemLabel],
            width: "100%",
        });
        // tree item containing flex box
        const treeItem = new SearchFacetHierarchyStaticTreeItem("", {
            content: treeItemFlex,
            selectLine: "{hasFilter}",
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
