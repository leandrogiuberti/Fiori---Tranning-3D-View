declare module "sap/esh/search/ui/userpref/SearchPrefsDialog.view" {
    import VBox from "sap/m/VBox";
    import Event from "sap/ui/base/Event";
    import View from "sap/ui/core/mvc/View";
    /**
     * @namespace sap.esh.search.ui.userpref
     */
    export default class SearchPrefsDialog extends View {
        private firstTimeBeforeRendering;
        createContent(): Array<VBox>;
        createSearchPersonalizationContent(): VBox;
        createMyFavoritesContent(): VBox;
        createNlqContent(): VBox;
        onBeforeRendering(): void;
        resetHistory(): void;
        onListItemSelectionChange(oEvent: Event): void;
    }
}
//# sourceMappingURL=SearchPrefsDialog.view.d.ts.map