declare module "sap/esh/search/ui/controls/SearchSelectionBar" {
    import Toolbar from "sap/m/Toolbar";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchSelectionBar extends Toolbar {
        private selectionText;
        constructor(sId?: string);
        textFormatter(selectedObjects: any, count: int): string;
        visibleFormatter(selectedObjects: any, config: any): boolean;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchSelectionBar.d.ts.map