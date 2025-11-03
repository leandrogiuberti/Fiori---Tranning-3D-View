declare module "sap/esh/search/ui/tree/TreeViewItem" {
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
        constructor(sId?: string, options?: Partial<$CustomTreeItemSettings>);
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=TreeViewItem.d.ts.map