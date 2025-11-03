declare module "sap/esh/search/ui/sinaNexTS/sina/DataSourceSuggestion" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Suggestion, SuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/Suggestion";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    interface DataSourceSuggestionOptions extends SuggestionOptions {
        dataSource: DataSource;
    }
    class DataSourceSuggestion extends Suggestion {
        type: SuggestionType;
        dataSource: DataSource;
        constructor(properties: DataSourceSuggestionOptions);
    }
}
//# sourceMappingURL=DataSourceSuggestion.d.ts.map