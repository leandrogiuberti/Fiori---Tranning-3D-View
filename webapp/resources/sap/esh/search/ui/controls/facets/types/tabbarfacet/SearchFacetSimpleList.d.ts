declare module "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetSimpleList" {
    import List, { $ListSettings } from "sap/m/List";
    import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
    import { FacetTypeUI } from "sap/esh/search/ui/controls/facets/FacetTypeUI";
    interface $SearchFacetSimpleListSettings extends $ListSettings {
        facetType?: FacetTypeUI;
    }
    /**
     * Generic facet to be used for 'data sources' or 'attributes' (see property `facetType`)
     */
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetSimpleList extends List {
        static readonly metadata: {
            properties: {
                facetType: {
                    type: string;
                    defaultValue: FacetTypeUI;
                };
            };
        };
        constructor(sId?: string, settings?: Partial<$SearchFacetSimpleListSettings>);
        handleItemPress(oEvent: ListBase$SelectionChangeEvent): void;
        onAfterRendering(oEvent: any): void;
        switchFacetType(facetType: FacetTypeUI): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetSimpleList.d.ts.map