/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";

/*
 * @namespace sap.esh.search.ui.controls
 */
export default class CustomSearchResultListItemContent extends ManagedObject {
    static metadata = {
        properties: {
            title: "string",
            titleUrl: "string",
            type: "string",
            imageUrl: "string",
            attributes: {
                type: "object",
                multiple: true,
            },
            intents: {
                type: "object",
                multiple: true,
            },
        },
    };

    // overwrite this method and return the custom content of the item
    public getContent(): Control[] | Control {
        // should return sap.ui.core.Control or sap.ui.core.Control[]
        return undefined;
    }

    // overwrite the following methods to customize the item

    // show or Hide the Title and Category
    public getTitleVisibility(): boolean {
        return true;
    }
}
