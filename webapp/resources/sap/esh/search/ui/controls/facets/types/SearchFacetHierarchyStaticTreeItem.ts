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
import TreeViewItem from "../../../tree/TreeViewItem";

export interface $SearchFacetHierarchyStaticTreeItemOptions extends $CustomTreeItemSettings {
    selectLine: boolean | PropertyBindingInfo | `{${string}}`;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetHierarchyStaticTreeItem extends TreeViewItem {
    static readonly metadata = {
        properties: {
            selectLine: { type: "boolean", defaultValue: false },
        },
    };
    constructor(sId?: string, options?: Partial<$SearchFacetHierarchyStaticTreeItemOptions>) {
        super(sId, options);
        const delegate = {
            onAfterRendering: () => {
                const domRef = this.getDomRef();
                if (this.getProperty("selectLine")) {
                    if (!domRef.classList.contains("sapMLIBSelected")) {
                        domRef.classList.add("sapMLIBSelected");
                    }
                } else {
                    if (domRef.classList.contains("sapMLIBSelected")) {
                        domRef.classList.remove("sapMLIBSelected");
                    }
                }
            },
        };
        this.addEventDelegate(delegate, this);
    }
    static renderer = {
        apiVersion: 2,
    };
}
