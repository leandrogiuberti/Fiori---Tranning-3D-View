declare module "sap/esh/search/ui/suggestions/SinaObjectSuggestionFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { UISinaObjectSuggestion } from "sap/esh/search/ui/suggestions/SuggestionType";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    export default class Formatter {
        private assembleLabel1;
        private assembleLabel2;
        private getFirstHighlightedAttribute;
        private getFirstStringAttribute;
        private assembleNavigation;
        private assembleImageUrl;
        format(suggestionProvider: {
            model: SearchModel;
            addSuggestion: (suggestion: Partial<UISinaObjectSuggestion & {
                label1: string;
                label2: string;
                titleNavigation: null | NavigationTarget;
            }>) => void;
        }, sinaSuggestion: UISinaObjectSuggestion): void;
    }
}
//# sourceMappingURL=SinaObjectSuggestionFormatter.d.ts.map