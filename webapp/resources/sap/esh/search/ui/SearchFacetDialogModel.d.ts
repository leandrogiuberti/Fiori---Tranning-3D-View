declare module "sap/esh/search/ui/SearchFacetDialogModel" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import FacetItem from "sap/esh/search/ui/FacetItem";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    interface $SearchFacetDialogModelSettings {
        searchModel: SearchModel;
    }
    export default class SearchFacetDialogModel extends SearchModel {
        aFilters: Array<FacetItem>;
        chartQuery: ChartQuery;
        searchModel: SearchModel;
        constructor(settings: $SearchFacetDialogModelSettings);
        prepareFacetList(): void;
        initialFillFiltersForDynamicHierarchyFacets(): void;
        facetDialogSingleCall(properties: {
            sAttribute: string;
            sAttributeLimit: number;
            sBindingPath: string;
            bInitialFilters?: boolean;
        }): Promise<void>;
        resetChartQueryFilterConditions(): void;
        hasFilterCondition(filterCondition: any): boolean;
        hasFilter(item: any): boolean;
        addFilter(item: FacetItem): void;
        removeFilter(item: FacetItem): void;
        changeFilterAdvaced(item: any, bAdvanced: boolean): void;
        addFilterCondition(filterCondition: any): void;
        getAttributeDataType(facet: any): string;
        destroy(): void;
    }
}
//# sourceMappingURL=SearchFacetDialogModel.d.ts.map