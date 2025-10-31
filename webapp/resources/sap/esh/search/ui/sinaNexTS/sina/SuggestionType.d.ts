declare module "sap/esh/search/ui/sinaNexTS/sina/SuggestionType" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /**
     * Three of them can be used with SuggestionCalculationModes.[Data|History]
     */
    enum SuggestionType {
        SearchTerm = "SearchTerm",// Can have child suggestions
        SearchTermAI = "SearchTermAI",// AI suggestion
        DataSource = "DataSource",// No Historic Data available!
        SearchTermAndDataSource = "SearchTermAndDataSource",// Can have child suggestions which are also SearchTermAndDataSource Suggestions
        Object = "Object"
    }
}
//# sourceMappingURL=SuggestionType.d.ts.map