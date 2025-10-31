/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ResponsiveSplitter, { $ResponsiveSplitterSettings } from "sap/ui/layout/ResponsiveSplitter";
import SplitterLayoutData from "sap/ui/layout/SplitterLayoutData";
import VBox from "sap/m/VBox";
import BusyDialog from "sap/m/BusyDialog";
import SplitPane from "sap/ui/layout/SplitPane";
import PaneContainer from "sap/ui/layout/PaneContainer";
import type SearchModel from "sap/esh/search/ui/SearchModel";
import { Orientation } from "sap/ui/core/library";
import Int from "sap/ui/model/odata/type/Int";
import Control from "sap/ui/core/Control";
import Text from "sap/m/Text";
import SearchResultPanel from "./resultview/SearchResultPanel";
import { AggregationBindingInfo, PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import UIEvents from "../UIEvents";
import SearchFacetList from "./facets/SearchFacetList";

export interface $SearchLayoutResponsiveSettings extends $ResponsiveSplitterSettings {
    // properties
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
    private _previousFacetPanelWidthSize: number;
    private _paneMainContainer: PaneContainer;
    private _paneLeft: SplitPane;
    private _paneRight: SplitPane;
    private _facetPanelWidthSizeIsOutdated: boolean;
    private _busyIndicatorModal: BusyDialog;
    private _busyFlag: boolean;
    private _busyTimeout: number;
    private _resultPanelContent: SearchResultPanel;
    private _facetPanelContent: Control;

    static readonly metadata = {
        properties: {
            searchIsBusy: {
                type: "boolean",
            },
            busyDelay: {
                type: "int",
            },
            showFacets: {
                type: "boolean",
            },
            facetPanelResizable: {
                type: "boolean",
                defaultValue: false,
            },
            facetPanelWidthInPercent: {
                type: "int",
                defaultValue: 25,
            },
            facetPanelMinWidth: {
                type: "int",
                defaultValue: 288,
            },
            animateFacetTransition: {
                type: "boolean",
                defaultValue: false,
            },
        },
        aggregations: {
            resultPanelContent: {
                type: "object",
                multiple: false,
            },
            facetPanelContent: {
                type: "object",
                multiple: false,
            },
        },
    };

    constructor(sId?: string, options?: Partial<$SearchLayoutResponsiveSettings>) {
        super(sId, options);

        // facets
        const facetsDummyContainer = new VBox("", {
            items: [new Text()], // dummy for initialization
        });
        this._paneLeft = new SplitPane({
            requiredParentWidth: 10, // use minimal width -> single pane mode disabled
            content: facetsDummyContainer,
        });
        // pane right, content
        this._paneRight = new SplitPane({
            requiredParentWidth: 10, // use minimal width -> single pane mode disabled
            content: this._resultPanelContent,
        });
        // facet panel "hidden"
        this._paneLeft.setLayoutData(
            new SplitterLayoutData({
                size: "0%", // width
                resizable: false,
            })
        );
        // panes
        this._paneMainContainer = new PaneContainer({
            orientation: Orientation.Horizontal,
            panes: [this._paneLeft, this._paneRight],
            resize: () => {
                this.triggerUpdateLayout();
            },
        });
        this._paneMainContainer.setLayoutData(
            new SplitterLayoutData({
                size: "100%", // height
                resizable: false,
            })
        );
        const paneContainer = this._paneMainContainer;
        this.setRootPaneContainer(paneContainer);
        this.setDefaultPane(this._paneRight); // not used
    }

    getFacetPanelContent(): Control {
        const facetContainer = this._paneLeft;
        if (facetContainer?.getContent()) {
            return facetContainer.getContent();
        }
        return undefined;
    }

    setFacetPanelContent(oControl: Control): void {
        this._facetPanelContent = oControl;
        const facetContainer = this._paneLeft;
        if (facetContainer) {
            facetContainer.setContent(oControl);
        }
    }

    setResultPanelContent(oSearchResultPanel: SearchResultPanel): void {
        this._resultPanelContent = oSearchResultPanel;
        if (this._paneRight) {
            this._paneRight.setContent(oSearchResultPanel);
        }
    }

    setSearchIsBusy(isBusy: boolean): void {
        const searchModel = this.getModel() as SearchModel;
        if (!searchModel) {
            return;
        }
        const searchCompositeControl = searchModel.getSearchCompositeControlInstanceByChildControl(this);
        if (!searchCompositeControl) {
            return;
        }
        searchCompositeControl.setBusyIndicatorDelay(this.getProperty("busyDelay"));
        searchCompositeControl.setBusy(isBusy);
    }

    setShowFacets(showFacets: boolean): SearchLayoutResponsive {
        if (!this._paneRight) {
            return;
        }

        this.updateLayout(showFacets);

        return this; // return "this" to allow method chaining
    }

    setFacetPanelWidthInPercent(facetPanelWidthInPercentValue: Int): SearchLayoutResponsive {
        // the 3rd parameter supresses rerendering
        this.setProperty("facetPanelWidthInPercent", facetPanelWidthInPercentValue, true); // this validates and stores the new value
        this._facetPanelWidthSizeIsOutdated = true;

        return this; // return "this" to allow method chaining
    }

    /* call from i.e. result view after toolbar changes */
    triggerUpdateLayout() {
        const paneLeftContainerLayoutData = this?._paneLeft.getLayoutData();
        const widthString = paneLeftContainerLayoutData.getProperty("size").replace("%", "");
        const facetPanelPaneWidth = parseInt(widthString);
        const facetsAreVisible = facetPanelPaneWidth > 0;
        this.updateLayout(facetsAreVisible);
    }

    updateLayout(facetsAreVisible: boolean): void {
        // update facets
        // adjust the facet content
        const facetContainer = this._paneLeft;
        if (facetContainer?.getContent() instanceof VBox) {
            const vBoxItems = (facetContainer.getContent() as VBox).getItems();
            if (vBoxItems?.length > 0 && vBoxItems[0] instanceof Text) {
                facetContainer.setContent(this._facetPanelContent);
            }
        }
        // animation
        if (this._facetPanelContent) {
            // robustness when triggered by constructor
            if (this.getProperty("animateFacetTransition")) {
                this._facetPanelContent.addStyleClass("sapUshellSearchFacetAnimation");
            } else {
                this._facetPanelContent.removeStyleClass("sapUshellSearchFacetAnimation");
            }
        }
        // left pane - facets width / splitter position
        if (this?._paneLeft?.getContent()) {
            let currentFacetPanelWidthSize;
            const paneLeftContainerLayoutData = this?._paneLeft.getLayoutData();
            if (!facetsAreVisible) {
                this._paneLeft.getContent().setVisible(false);
                this._paneLeft.setLayoutData(
                    new SplitterLayoutData({
                        size: "0%", // width
                        minSize: 0,
                        resizable: false,
                    })
                );
            } else {
                this._paneLeft.getContent().setVisible(true);
                const oModel = this.getModel() as SearchModel;
                let facetPanelMinWidth = this.getProperty("facetPanelMinWidth");
                if (oModel.config.optimizeForValueHelp) {
                    currentFacetPanelWidthSize = 0.01; // facet panel currently needs to be visible/rendered to open filter dialog
                    facetPanelMinWidth = 0;
                } else if (this._facetPanelWidthSizeIsOutdated) {
                    currentFacetPanelWidthSize = this.getProperty("facetPanelWidthInPercent");
                    this._facetPanelWidthSizeIsOutdated = false;
                } else {
                    currentFacetPanelWidthSize = parseInt(
                        paneLeftContainerLayoutData.getProperty("size").replace("%", "")
                    );
                    if (currentFacetPanelWidthSize < 1) {
                        if (this._previousFacetPanelWidthSize) {
                            currentFacetPanelWidthSize = this._previousFacetPanelWidthSize;
                        } else {
                            currentFacetPanelWidthSize = this.getProperty("facetPanelWidthInPercent");
                        }
                    }
                }
                this._paneLeft.setLayoutData(
                    new SplitterLayoutData({
                        size: currentFacetPanelWidthSize + "%",
                        minSize: facetPanelMinWidth,
                        resizable: this.getProperty("facetPanelResizable"),
                    })
                );
                this._previousFacetPanelWidthSize = currentFacetPanelWidthSize; // remember width to restore when showing facets (after having closed them before)
            }
        }

        this._paneMainContainer.setLayoutData(
            new SplitterLayoutData({
                size: "100%",
                resizable: false,
            })
        );

        const handleAnimationEnd = () => {
            (this.getModel() as SearchModel).notifySubscribers(UIEvents.ESHSearchLayoutChanged);
        };

        const searchFacets = document.querySelector(".sapUiFixFlexFixed");
        if (searchFacets) {
            const onTransitionEnd = () => {
                handleAnimationEnd();
                searchFacets.removeEventListener("transitionend", onTransitionEnd);
            };
            searchFacets.addEventListener("transitionend", onTransitionEnd);
        }
    }

    convertRemToPixel(remValue: number): number {
        return remValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    convertPixelToRem(pxValue: number): number {
        return pxValue / parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    static renderer = {
        apiVersion: 2,
    };
}
