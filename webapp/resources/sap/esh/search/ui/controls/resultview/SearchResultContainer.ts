/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import VBox from "sap/m/VBox";
import VerticalLayout from "sap/ui/layout/VerticalLayout";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchResultContainer extends VerticalLayout {
    noResultScreen: VBox;
    constructor(sId?: string) {
        super(sId);
        // define group for F6 handling
        this.data("sap-ui-fastnavgroup", "true", true /* write  into DOM */);
        this.addStyleClass("sapUshellSearchResultContainer"); // obsolete
        this.addStyleClass("sapElisaSearchResultContainer");
    }

    getNoResultScreen(): VBox {
        return this.noResultScreen;
    }
    setNoResultScreen(object: VBox): void {
        this.removeContent(this.noResultScreen);
        this.noResultScreen = object as VBox;
        this.addContent(this.noResultScreen);
    }

    static renderer = {
        apiVersion: 2,
    };
}
