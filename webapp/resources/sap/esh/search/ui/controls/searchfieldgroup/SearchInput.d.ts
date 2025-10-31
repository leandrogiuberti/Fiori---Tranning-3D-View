declare module "sap/esh/search/ui/controls/searchfieldgroup/SearchInput" {
    import Input, { $InputSettings, Input$SuggestionItemSelectedEvent } from "sap/m/Input";
    import ColumnListItem from "sap/m/ColumnListItem";
    import VerticalLayout from "sap/ui/layout/VerticalLayout";
    import Context from "sap/ui/model/Context";
    import { Suggestion } from "../../suggestions/SuggestionType";
    global {
        interface Window {
            hasher: {
                prependHash: string;
                getHash: () => string;
                setHash: (hash: string) => void;
            };
        }
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchInput extends Input {
        private _bUseDialog;
        private _bFullScreen;
        private logger;
        private listNavigationMode;
        triggerSuggestionItemSelected: boolean;
        constructor(sId?: string, options?: $InputSettings);
        isMobileDevice(): boolean;
        onfocusin(oEvent: JQuery.Event): void;
        onsapenter(...args: Array<unknown>): void;
        updateSelectionFromList(item: unknown): void;
        triggerSearch(): void;
        isNavigationAllowed(): boolean;
        decorateHandleListNavigation(): void;
        handleLiveChange(): void;
        handleSuggestionItemSelected(oEvent: Input$SuggestionItemSelectedEvent): void;
        logRecentActivity(suggestion: Suggestion): void;
        suggestionItemFactory(sId: string, oContext: Context): ColumnListItem;
        busyIndicatorSuggestionItemFactory(): ColumnListItem;
        headerSuggestionItemFactory(sId: string, oContext: Context): ColumnListItem;
        assembleListNavigationModeGetVisibleFunction(): () => boolean;
        assembleObjectSuggestionLabels(suggestion: {
            imageUrl?: string;
            imageExists?: true;
            imageIsCircular?: boolean;
            exists?: false;
            label2?: string;
        }): VerticalLayout;
        objectSuggestionItemFactory(sId: string, oContext: Context): ColumnListItem;
        regularSuggestionItemFactory(sId: string, oContext: Context): ColumnListItem;
        navigateToSearchApp(): void;
        onAfterRendering(oEvent: any): void;
        onValueRevertedByEscape(): void;
        onsapescape(oEvent: JQuery.Event): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchInput.d.ts.map