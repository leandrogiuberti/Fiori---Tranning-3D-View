declare module "sap/esh/search/ui/suggestions/TransactionSuggestionProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { SuggestionProvider } from "sap/esh/search/ui/suggestions/SuggestionProvider";
    import { UISinaObjectSuggestion } from "sap/esh/search/ui/suggestions/SuggestionType";
    import { Type } from "sap/esh/search/ui/suggestions/SuggestionType";
    import SuggestionHandler from "sap/esh/search/ui/suggestions/SuggestionHandler";
    interface TransactionSuggestion extends UISinaObjectSuggestion {
        searchTerm: string;
        uiSuggestionType: Type.Transaction;
        position: number;
        key: string;
        url: string;
        icon: "sap-icon://generate-shortcut";
    }
    export default class TransactionSuggestionProvider implements SuggestionProvider {
        readonly model: SearchModel;
        private suggestionHandler;
        private suggestionLimit;
        private sinaNext;
        private suggestionQuery;
        private transactionsDS;
        private suggestionStartingCharacters;
        private suggestionFormatter;
        transactionSuggestions: Array<TransactionSuggestion>;
        constructor(params: {
            model: SearchModel;
            suggestionHandler: SuggestionHandler;
        });
        abortSuggestions(): void;
        private getUrl;
        getSuggestions(filter: Filter): Promise<Array<TransactionSuggestion>>;
        addSuggestion(transactionSuggestion: TransactionSuggestion): void;
        private prepareSuggestionQuery;
    }
}
//# sourceMappingURL=TransactionSuggestionProvider.d.ts.map