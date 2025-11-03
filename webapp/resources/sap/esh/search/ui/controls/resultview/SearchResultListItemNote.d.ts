declare module "sap/esh/search/ui/controls/resultview/SearchResultListItemNote" {
    import SearchResultListItem from "sap/esh/search/ui/controls/resultview/SearchResultListItem";
    import RenderManager from "sap/ui/core/RenderManager";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchResultListItemNote extends SearchResultListItem {
        protected _renderContentContainer(oRm: RenderManager): void;
        protected _renderTitleContainer(oRm: RenderManager): void;
        protected _renderAttributesContainer(oRm: RenderManager): void;
        protected _renderImageForPhone(oRm: RenderManager): void;
        private _renderDocAttributesContainer;
        private _renderThumbnailSnippetContainer;
        private _renderSnippetContainer;
        protected _renderAllAttributes(oRm: RenderManager, itemAttributes: Array<any>): void;
        protected _getExpandAreaObjectInfo(): any;
        hideDetails(): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchResultListItemNote.d.ts.map