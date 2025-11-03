declare module "sap/esh/search/ui/controls/SearchLayoutResponsive" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ResponsiveSplitter, { $ResponsiveSplitterSettings } from "sap/ui/layout/ResponsiveSplitter";
    import Int from "sap/ui/model/odata/type/Int";
    import Control from "sap/ui/core/Control";
    import SearchResultPanel from "sap/esh/search/ui/controls/resultview/SearchResultPanel";
    import { AggregationBindingInfo, PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    import SearchFacetList from "sap/esh/search/ui/controls/facets/SearchFacetList";
    interface $SearchLayoutResponsiveSettings extends $ResponsiveSplitterSettings {
        searchIsBusy: boolean | PropertyBindingInfo;
        busyDelay: number | PropertyBindingInfo;
        showFacets: boolean | PropertyBindingInfo;
        facetPanelResizable: boolean | PropertyBindingInfo;
        facetPanelWidthInPercent: number | PropertyBindingInfo;
        facetPanelMinWidth: int | PropertyBindingInfo;
        resultPanelContent: SearchResultPanel;
        facetPanelContent: SearchFacetList | AggregationBindingInfo;
        animateFacetTransition?: boolean | PropertyBindingInfo;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchLayoutResponsive extends ResponsiveSplitter {
        private _previousFacetPanelWidthSize;
        private _paneMainContainer;
        private _paneLeft;
        private _paneRight;
        private _facetPanelWidthSizeIsOutdated;
        private _busyIndicatorModal;
        private _busyFlag;
        private _busyTimeout;
        private _resultPanelContent;
        private _facetPanelContent;
        static readonly metadata: {
            properties: {
                searchIsBusy: {
                    type: string;
                };
                busyDelay: {
                    type: string;
                };
                showFacets: {
                    type: string;
                };
                facetPanelResizable: {
                    type: string;
                    defaultValue: boolean;
                };
                facetPanelWidthInPercent: {
                    type: string;
                    defaultValue: number;
                };
                facetPanelMinWidth: {
                    type: string;
                    defaultValue: number;
                };
                animateFacetTransition: {
                    type: string;
                    defaultValue: boolean;
                };
            };
            aggregations: {
                resultPanelContent: {
                    type: string;
                    multiple: boolean;
                };
                facetPanelContent: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        constructor(sId?: string, options?: Partial<$SearchLayoutResponsiveSettings>);
        getFacetPanelContent(): Control;
        setFacetPanelContent(oControl: Control): void;
        setResultPanelContent(oSearchResultPanel: SearchResultPanel): void;
        setSearchIsBusy(isBusy: boolean): void;
        setShowFacets(showFacets: boolean): SearchLayoutResponsive;
        setFacetPanelWidthInPercent(facetPanelWidthInPercentValue: Int): SearchLayoutResponsive;
        triggerUpdateLayout(): void;
        updateLayout(facetsAreVisible: boolean): void;
        convertRemToPixel(remValue: number): number;
        convertPixelToRem(pxValue: number): number;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchLayoutResponsive.d.ts.map