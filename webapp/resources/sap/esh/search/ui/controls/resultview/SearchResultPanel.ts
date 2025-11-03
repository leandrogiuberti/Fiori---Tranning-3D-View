/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import FixFlex from "sap/ui/layout/FixFlex";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchResultPanel extends FixFlex {
    constructor(sId?: string, mSettings?: object) {
        super(sId, mSettings);
        // define group for F6 handling
        this.data("sap-ui-fastnavgroup", "true", true /* write  into DOM */);
    }

    static renderer = {
        apiVersion: 2,
    };
}
