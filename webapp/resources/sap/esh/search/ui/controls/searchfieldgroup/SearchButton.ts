/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../../i18n";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import Button, { $ButtonSettings } from "sap/m/Button";
import IconPool from "sap/ui/core/IconPool";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchButton extends Button {
    constructor(sId?: string, options?: Partial<$ButtonSettings>) {
        super(sId, options);

        this.setIcon(IconPool.getIconURI("search"));
        this.setTooltip(i18n.getText("search"));
        this.bindProperty("enabled", {
            parts: [
                {
                    path: "/initializingObjSearch",
                },
            ],
            formatter: function (initializingObjSearch) {
                return !SearchHelper.isSearchAppActive() || !initializingObjSearch;
            },
        });
        this.addStyleClass("searchBtn");
    }

    static renderer = {
        apiVersion: 2,
    };
}
