declare module "sap/esh/search/ui/compositecontrol/ResultViewsAssembler" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Control from "sap/ui/core/Control";
    import SearchCompositeControl from "sap/esh/search/ui/SearchCompositeControl";
    import SearchResultTable from "sap/esh/search/ui/controls/resultview/SearchResultTable";
    import InvisibleText from "sap/ui/core/InvisibleText";
    import SearchResultList from "sap/esh/search/ui/controls/resultview/SearchResultList";
    import SearchResultGrid from "sap/esh/search/ui/controls/resultview/SearchResultGrid";
    import VerticalLayout from "sap/ui/layout/VerticalLayout";
    import FlexBox from "sap/m/FlexBox";
    import CustomListItem from "sap/m/CustomListItem";
    export default class ResultViewsAssembler {
        compositeControl: SearchCompositeControl;
        constructor(compositeControl: SearchCompositeControl);
        assembleResultView(idPrefix: string): Array<Control>;
        assembleCountBreadcrumbsHiddenElement(): InvisibleText;
        assembleSearchResultTable(idPrefix: string): SearchResultTable;
        assembleSearchResultList(idPrefix: string): SearchResultList;
        assembleSearchResultGrid(idPrefix: string): SearchResultGrid;
        assembleAppSearch(idPrefix: string): VerticalLayout;
        highlightTile(oEvent: Event): void;
        assembleShowMoreFooter(): FlexBox;
        assembleListItem(resultItemPath: string, oContext: any): CustomListItem;
        assembleResultListItem(resultItemPath: string, oData: any): CustomListItem;
        assembleAppContainerResultListItem(resultItemPath: string): CustomListItem;
    }
}
//# sourceMappingURL=ResultViewsAssembler.d.ts.map