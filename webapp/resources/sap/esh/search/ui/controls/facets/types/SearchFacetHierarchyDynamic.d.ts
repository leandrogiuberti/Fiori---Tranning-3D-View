declare module "sap/esh/search/ui/controls/facets/types/SearchFacetHierarchyDynamic" {
    import CustomTreeItem from "sap/m/CustomTreeItem";
    import VBox from "sap/m/VBox";
    import Context from "sap/ui/model/Context";
    import { ShowMoreDialogOptions } from "sap/esh/search/ui/controls/OpenShowMoreDialog";
    /**
     * Hierarchy facet (dynamic)
     *
     * The SearchFacetHierarchyDynamic control is used for displaying dynamic hierarchy facets.
     * Corresponding model objects:
     * - hierarchydynamic/SearchHierarchyDynamicFacet.js : facet with pointer to root hierarchy node
     * - hierarchydynamic/SearchHierarchyDynamicNode.js  : hierarchy node
     */
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetHierarchyDynamic extends VBox {
        static readonly metadata: {
            properties: {
                showTitle: {
                    type: string;
                    defaultValue: boolean;
                };
                openShowMoreDialogFunction: {
                    type: string;
                };
            };
        };
        private tree;
        constructor(sId?: string, options?: any);
        getOpenShowMoreDialogFunction(): (options: ShowMoreDialogOptions) => Promise<void>;
        createShowMoreLink(): void;
        getShowTitle(): boolean;
        createTreeItem(sId: string, oContext: Context): CustomTreeItem;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetHierarchyDynamic.d.ts.map