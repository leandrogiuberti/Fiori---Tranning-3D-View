declare module "sap/esh/search/ui/controls/facets/SearchFacetDialog" {
    import SearchFacetDialogModel from "sap/esh/search/ui/SearchFacetDialogModel";
    import SearchFacetDialogHelperCharts from "sap/esh/search/ui/SearchFacetDialogHelperCharts";
    import Page from "sap/m/Page";
    import Dialog, { $DialogSettings } from "sap/m/Dialog";
    import SplitContainer from "sap/m/SplitContainer";
    import IconTabFilter from "sap/m/IconTabFilter";
    import Event from "sap/ui/base/Event";
    import Context from "sap/ui/model/Context";
    import Model from "sap/ui/model/Model";
    import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
    interface $SearchFacetDialogSettings extends $DialogSettings {
        selectedAttribute: string;
        selectedTabBarIndex: number;
        tabBarItems: Array<IconTabFilter>;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetDialog extends Dialog {
        oSplitContainer: SplitContainer;
        bConditionValidateError: boolean;
        bShowCharts: boolean;
        bOldPieChart: boolean;
        selectedAttribute: string;
        chartOnDisplayIndex: number;
        facetOnDisplayIndex: number;
        chartOnDisplayIndexByFilterArray: Array<number>;
        aItemsForBarChart: Array<any>;
        aItemsForBarChartFacetTotalCount: number;
        tabBarItems: Array<IconTabFilter>;
        SearchFacetDialogHelperCharts: SearchFacetDialogHelperCharts;
        onSearchFieldLiveChangeDelayed: any;
        static readonly metadata: {
            properties: {
                tabBarItems: {
                    type: string;
                };
                selectedAttribute: {
                    type: string;
                };
                selectedTabBarIndex: {
                    type: string;
                };
            };
        };
        constructor(sId?: string, settings?: Partial<$SearchFacetDialogSettings>);
        createContainer(): SplitContainer;
        setModel(oModel: Model, sName?: string): any;
        createMasterPages(): Array<Page>;
        resetAllFilters(): void;
        resetAdvancedConditionFilters(): void;
        resetEnabledForFilterResetButton(bForceEnabled?: boolean): void;
        onMasterPageSelectionChange(oEvent: ListBase$SelectionChangeEvent): void;
        createDetailPage(sId: string, oContext: Context): Page;
        createDynamicHierarchyAttributeDetailPage(sId: string, oContext: Context): Page;
        createAttributeDetailPage(sId: string, oContext: Context): Page;
        onDetailPageSelectionChange(oEvent: ListBase$SelectionChangeEvent): void;
        onSearchFieldLiveChange(value: string): void;
        onSettingButtonPress(oEvent: Event): void;
        onSelectChange(oEvent: Event): void;
        onCheckBoxSelect(oEvent: Event): void;
        onPlusButtonPress(oEvent: Event, type: string): void;
        onOkClick(): void;
        onCancelClick(): void;
        setChartOnDisplayIndexForFacetListItem(facetOnDisplayIndex: number): void;
        resetIcons(oModel: SearchFacetDialogModel, sPath: string, oControl: any): void;
        onDetailPageSelectionChangeCharts(oEvent: any): void;
        updateDetailPageCharts(aItems: Array<any>, facetTotalCount: number): void;
        controlChartVisibility(oControl: SearchFacetDialog, chartIndexToShow: number, forcePie?: boolean): void;
        hideSelectively(oEvent: Event, oControl: SearchFacetDialog, chartIndex: number): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetDialog.d.ts.map