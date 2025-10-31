declare module "sap/esh/search/ui/controls/resultview/CustomSearchResultListItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchResultListItem, { $SearchResultListItemSettings } from "sap/esh/search/ui/controls/resultview/SearchResultListItem";
    import CustomSearchResultListItemContent from "sap/esh/search/ui/controls/resultview/CustomSearchResultListItemContent";
    interface $CustomSearchResultListItemSettings extends $SearchResultListItemSettings {
        content: CustomSearchResultListItemContent;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class CustomSearchResultListItem extends SearchResultListItem {
        readonly metadata: {
            properties: {
                content: {
                    type: string;
                };
            };
        };
        static renderer: {
            apiVersion: number;
        };
        constructor(sId?: string, settings?: Partial<$CustomSearchResultListItemSettings>);
        setupCustomContentControl(): void;
        renderer(oRm: any, oControl: any): void;
        onAfterRendering(): void;
    }
}
//# sourceMappingURL=CustomSearchResultListItem.d.ts.map