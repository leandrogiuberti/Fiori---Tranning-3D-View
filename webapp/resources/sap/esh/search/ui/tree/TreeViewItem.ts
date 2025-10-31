/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import CustomTreeItem, { $CustomTreeItemSettings } from "sap/m/CustomTreeItem";
/**
 * @namespace sap.esh.search.ui.tree
 */
export default class TreeViewItem extends CustomTreeItem {
    constructor(sId?: string, options?: Partial<$CustomTreeItemSettings>) {
        super(sId, options);
        this.data("esh-tree-node-id", "{id}", true);
    }
    static renderer = {
        apiVersion: 2,
    };
}
