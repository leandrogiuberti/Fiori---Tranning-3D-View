declare module "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetSimpleListItem" {
    import StandardListItem, { $StandardListItemSettings } from "sap/m/StandardListItem";
    interface $SearchFacetSimpleListItemSettings extends $StandardListItemSettings {
        isDataSource: boolean;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetSimpleListItem extends StandardListItem {
        static readonly metadata: {
            properties: {
                isDataSource: {
                    type: string;
                    defaultValue: boolean;
                };
            };
        };
        constructor(sId?: string, settings?: $SearchFacetSimpleListItemSettings);
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetSimpleListItem.d.ts.map