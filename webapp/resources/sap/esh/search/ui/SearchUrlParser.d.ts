declare module "sap/esh/search/ui/SearchUrlParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchUrlParserInav2 from "sap/esh/search/ui/SearchUrlParserInav2";
    interface SearchUrlParserOptions {
        model: SearchModel;
        urlParserInav2?: SearchUrlParserInav2;
    }
    export default class SearchUrlParser {
        private model;
        private urlParserInav2;
        private errorHandler;
        constructor(options: SearchUrlParserOptions);
        parse(fireQuery?: boolean): Promise<void>;
        private isJson;
        private parseSimplifiedUrlParameters;
        private parseUrlParameters;
    }
}
//# sourceMappingURL=SearchUrlParser.d.ts.map