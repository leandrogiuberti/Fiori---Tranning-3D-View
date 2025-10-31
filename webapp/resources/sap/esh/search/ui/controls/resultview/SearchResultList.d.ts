declare module "sap/esh/search/ui/controls/resultview/SearchResultList" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import List, { $ListSettings } from "sap/m/List";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchResultList extends List {
        private _resizeHandler;
        constructor(sId?: string, options?: $ListSettings);
        onAfterRendering(...args: Array<any>): void;
        private _prepareResizeHandler;
        resize(): void;
        enableSelectionMode(): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchResultList.d.ts.map