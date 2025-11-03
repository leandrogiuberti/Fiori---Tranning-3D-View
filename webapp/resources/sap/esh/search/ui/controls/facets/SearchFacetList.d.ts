declare module "sap/esh/search/ui/controls/facets/SearchFacetList" {
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import RenderManager from "sap/ui/core/RenderManager";
    interface $SearchFacetListSettings extends $ControlSettings {
        facets: Array<Control>;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetList extends Control {
        static readonly metadata: {
            aggregations: {
                facets: {
                    singularName: string;
                    bindable: string;
                    multiple: boolean;
                };
                _showAllBtn: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
            };
        };
        constructor(sId?: string, settings?: $SearchFacetListSettings);
        private bindFacets;
        getFirstFilterByFacet(facets: Array<Control>): Control;
        doRenderSectionHeader(oRm: RenderManager, title: string, showResetButton: boolean, styleClass?: string): void;
        renderSectionHeader(oRm: RenderManager, facets: Array<Control>, facetIndex: number): void;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchFacetList): void;
        };
        onAfterRendering(): void;
        private _getShowAllButton;
    }
}
//# sourceMappingURL=SearchFacetList.d.ts.map