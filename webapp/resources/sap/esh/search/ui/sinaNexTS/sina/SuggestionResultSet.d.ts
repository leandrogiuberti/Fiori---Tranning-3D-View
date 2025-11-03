declare module "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ResultSet, ResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { Suggestion } from "sap/esh/search/ui/sinaNexTS/sina/Suggestion";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    type SuggestionResultSetOptions = ResultSetOptions;
    class SuggestionResultSet extends ResultSet {
        query: SuggestionQuery;
        items: Array<Suggestion>;
    }
}
//# sourceMappingURL=SuggestionResultSet.d.ts.map