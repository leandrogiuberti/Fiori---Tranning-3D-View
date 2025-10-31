declare module "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetBarChart" {
    import ComparisonMicroChartData from "sap/suite/ui/microchart/ComparisonMicroChartData";
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import RenderManager from "sap/ui/core/RenderManager";
    import SearchFacetDialog from "sap/esh/search/ui/controls/facets/SearchFacetDialog";
    interface $SearchFacetBarChartSettings extends $ControlSettings {
        aItems: Array<ComparisonMicroChartData>;
        items: Array<ComparisonMicroChartData>;
        oSearchFacetDialog: SearchFacetDialog;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetBarChart extends Control {
        static readonly metadata: {
            properties: {
                aItems: {
                    type: string;
                };
                oSearchFacetDialog: {
                    type: string;
                };
            };
            aggregations: {
                items: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        options: Partial<$SearchFacetBarChartSettings>;
        iMissingCnt: number;
        constructor(sId?: string, settings?: Partial<$SearchFacetBarChartSettings>);
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchFacetBarChart): void;
        };
        onAfterRendering(): void;
    }
}
//# sourceMappingURL=SearchFacetBarChart.d.ts.map