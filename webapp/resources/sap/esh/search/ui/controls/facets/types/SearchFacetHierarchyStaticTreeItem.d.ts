declare module "sap/esh/search/ui/controls/facets/types/SearchFacetHierarchyStaticTreeItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /*!
     * This control is identical to sap.m.CustomTreeItem but adds a new property selectLine
     * which can be used to mark the CustromTreemItem as selected. Changing the property triggers
     * a rerender and therefor also onAfterRendering. In onAfterRendering the css class for selection
     * sapMLIBSelected is added/removed.
     *
     * (This is control is needed because the selected property of CustomTreeItem cannot be used)
     */
    import { $CustomTreeItemSettings } from "sap/m/CustomTreeItem";
    import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    import TreeViewItem from "sap/esh/search/ui/tree/TreeViewItem";
    interface $SearchFacetHierarchyStaticTreeItemOptions extends $CustomTreeItemSettings {
        selectLine: boolean | PropertyBindingInfo | `{${string}}`;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetHierarchyStaticTreeItem extends TreeViewItem {
        static readonly metadata: {
            properties: {
                selectLine: {
                    type: string;
                    defaultValue: boolean;
                };
            };
        };
        constructor(sId?: string, options?: Partial<$SearchFacetHierarchyStaticTreeItemOptions>);
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetHierarchyStaticTreeItem.d.ts.map