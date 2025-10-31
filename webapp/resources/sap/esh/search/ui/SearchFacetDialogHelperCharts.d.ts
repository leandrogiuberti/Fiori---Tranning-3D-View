declare module "sap/esh/search/ui/SearchFacetDialogHelperCharts" {
    import SearchFacetPieChart from "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetPieChart";
    import ComparisonMicroChart from "sap/suite/ui/microchart/ComparisonMicroChart";
    import Button from "sap/m/Button";
    import SearchFacetDialog from "sap/esh/search/ui/controls/facets/SearchFacetDialog";
    import Event from "sap/ui/base/Event";
    export default class SearchFacetDialogHelperCharts {
        static dialog: SearchFacetDialog;
        constructor(dialog: SearchFacetDialog);
        static getBarChartPlaceholder(): ComparisonMicroChart;
        testWhetherPieWedgeOrLabelIsDummy(oEvent: Event): boolean;
        static getPieChartPlaceholder(): SearchFacetPieChart;
        static setDummyTabBarItems(oControl: SearchFacetDialog, ...args: Array<string>): void;
        static getDropDownButton(oControl: SearchFacetDialog): Button;
        static getListContainersForDetailPage(): Array<any>;
    }
}
//# sourceMappingURL=SearchFacetDialogHelperCharts.d.ts.map