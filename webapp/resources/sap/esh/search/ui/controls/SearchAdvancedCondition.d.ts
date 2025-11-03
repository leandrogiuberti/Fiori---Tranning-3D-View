declare module "sap/esh/search/ui/controls/SearchAdvancedCondition" {
    import HorizontalLayout, { $HorizontalLayoutSettings } from "sap/ui/layout/HorizontalLayout";
    import Control from "sap/ui/core/Control";
    import SearchFacetDialogHelper from "sap/esh/search/ui/SearchFacetDialogHelper";
    import Event from "sap/ui/base/Event";
    interface $SearchAdvancedConditionSettings extends $HorizontalLayoutSettings {
        type: string;
        allowWrapping: boolean;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchAdvancedCondition extends HorizontalLayout {
        static readonly metadata: {
            properties: {
                type: {
                    type: string;
                };
            };
        };
        static searchFacetDialogHelper: SearchFacetDialogHelper;
        constructor(sId?: string, settings?: Partial<$SearchAdvancedConditionSettings>);
        contentFactory(options: Partial<$SearchAdvancedConditionSettings>): Array<Control>;
        getDetailPage(oControl: Control): Control;
        onDateRangeSelectionChange(oEvent: Event): void;
        onAdvancedInputChange(oEvent: Event): void;
        onDeleteButtonPress(): void;
        onAdvancedNumberInputChange(oEvent: Event): void;
        static injectSearchFacetDialogHelper(_SearchFacetDialogHelper: SearchFacetDialogHelper): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchAdvancedCondition.d.ts.map