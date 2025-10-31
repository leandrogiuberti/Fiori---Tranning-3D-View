declare module "sap/esh/search/ui/SearchResultBaseFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ErrorHandler from "sap/esh/search/ui/error/ErrorHandler";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    interface SortAttribute {
        attributeId: string;
        name: string;
        key: string;
        selected: boolean;
    }
    export default abstract class SearchResultBaseFormatter {
        model: SearchModel;
        protected errorHandler: ErrorHandler;
        constructor(model: SearchModel);
        formatSortAttributes(): Array<SortAttribute>;
    }
}
//# sourceMappingURL=SearchResultBaseFormatter.d.ts.map