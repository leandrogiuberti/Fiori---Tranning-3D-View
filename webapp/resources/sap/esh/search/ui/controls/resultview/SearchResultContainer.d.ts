declare module "sap/esh/search/ui/controls/resultview/SearchResultContainer" {
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
        constructor(sId?: string);
        getNoResultScreen(): VBox;
        setNoResultScreen(object: VBox): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchResultContainer.d.ts.map