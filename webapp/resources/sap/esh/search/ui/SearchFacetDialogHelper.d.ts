declare module "sap/esh/search/ui/SearchFacetDialogHelper" {
    import NumberFormat from "sap/ui/core/format/NumberFormat";
    import List from "sap/m/List";
    import SearchFacetDialogModel from "sap/esh/search/ui/SearchFacetDialogModel";
    import SearchFacetDialog from "sap/esh/search/ui/controls/facets/SearchFacetDialog";
    import SearchHierarchyDynamicFacet from "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacet";
    export default abstract class SearchFacetDialogHelper {
        static searchAdvancedCondition: any;
        static dialog: SearchFacetDialog;
        static POS_FACET_LIST: number;
        static POS_TOOLBAR_SEARCHFIELD: number;
        static POS_TOOLBAR_TOGGLEBUTTON: number;
        static POS_SETTING_CONTAINER: number;
        static POS_ATTRIBUTE_LIST_CONTAINER: number;
        static POS_ICONTABBAR: number;
        static POS_TABBAR_LIST: number;
        static POS_TABBAR_CONDITION: number;
        static POS_SORTING_SELECT: number;
        static POS_SHOWONTOP_CHECKBOX: number;
        static POS_ADVANCED_CHECKBOX: number;
        static POS_ADVANCED_INPUT_LAYOUT: number;
        static POS_ADVANCED_BUTTON: number;
        static bResetFilterIsActive: boolean;
        static oFloatNumberFormat: NumberFormat;
        static oIntegernumberFormat: NumberFormat;
        static oNumberFormat: NumberFormat;
        static oDateFormatOptions: any;
        static oTimestampFormatOptions: any;
        static oDateFormat: any;
        static oTimestampFormat: any;
        static oDateTimeFormat: any;
        static injectSearchAdvancedCondition(_SearchAdvancedCondition: any): void;
        constructor();
        static init(dialog: any): void;
        static getFacetList(): List;
        static updateDetailPage(oListItem: any, sFilterTerm?: string, bInitialFilters?: boolean): void;
        static applyChartQueryFilter(excludedIndex: number): void;
        static applyDynamicHierarchyChartQueryFilter(facet: SearchHierarchyDynamicFacet, model: SearchFacetDialogModel): void;
        static resetChartQueryFilters(): void;
        static applyAdvancedCondition(oDetailPage: any, oFacetItemBinding: any, oAppliedObject: any): void;
        static initiateAdvancedConditions(oAdvancedContainer: any, aItems: any, type: "integer" | "number" | "string" | "text" | "timestamp" | "date"): void;
        static updateDetailPageListItemsSelected(oDetailPageAttributeList: any, oAdvancedContainer: any): void;
        static removeAdvancedCondition(oAdvancedContainer: any, oListItem: any, type: "integer" | "number" | "string" | "text" | "timestamp" | "date"): void;
        static sortingAttributeList(oDetailPage: any): void;
        static insertNewAdvancedCondition(oAdvancedCondition: any, type: string): void;
        static deleteAdvancedCondition(oAdvancedCondition: any): void;
        static updateCountInfo(oDetailPage: any): void;
    }
}
//# sourceMappingURL=SearchFacetDialogHelper.d.ts.map