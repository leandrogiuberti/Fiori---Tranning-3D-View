/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../../i18n";
import IconTabFilter from "sap/m/IconTabFilter";
import Button from "sap/m/Button";
import errors from "../../error/errors";
import SearchFacetQuickSelectDataSource from "./types/SearchFacetQuickSelectDataSource";
import SearchFacetHierarchyDynamic from "./types/SearchFacetHierarchyDynamic";
import SearchFacetHierarchyStatic from "./types/SearchFacetHierarchyStatic";
import SearchFacetBarChart from "./types/tabbarfacet/SearchFacetBarChart";
import SearchFacetPieChart from "./types/tabbarfacet/SearchFacetPieChart";
import Control, { $ControlSettings } from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import SearchModel from "sap/esh/search/ui/SearchModel";
import SearchFacetTabBar from "./types/tabbarfacet/SearchFacetTabBar";
import { UserEventType } from "../../eventlogging/UserEvents";
import { openShowMoreDialog } from "../OpenShowMoreDialog";
import { ButtonType, FlexAlignItems, FlexJustifyContent } from "sap/m/library";
import Facet from "../../Facet";
import { FacetTypeUI } from "./FacetTypeUI";
import SearchFacetSimpleList from "./types/tabbarfacet/SearchFacetSimpleList";
import FlexBox from "sap/m/FlexBox";
import Label from "sap/m/Label";

export interface $SearchFacetListSettings extends $ControlSettings {
    facets: Array<Control>;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetList extends Control {
    static readonly metadata = {
        aggregations: {
            facets: {
                singularName: "facet",
                bindable: "bindable", // -->> shorthand function 'bindFacets' generated -> leads to TS syntax errors and thus 'this.bindFacets' cannot be used
                multiple: true,
                // visibility: "hidden", -->> bindAggregation is failing after activation of this line ?!?
            },
            _showAllBtn: {
                type: "sap.m.Button",
                multiple: false,
                visibility: "hidden",
            },
        },
    };

    constructor(sId?: string, settings?: /* $ControlSettings */ $SearchFacetListSettings) {
        super(sId, settings);

        // define group for F6 handling
        this.data("sap-ui-fastnavgroup", "true", true /* write into DOM */);

        this.bindFacets();
    }

    private bindFacets(): void {
        if (!this.getBindingInfo("facets")) {
            this.bindAggregation("facets", {
                path: "/facets",
                factory: (id: string, oContext) => {
                    const facet = oContext.getObject() as Facet;
                    const oModel = oContext.getModel() as SearchModel;
                    const config = oModel.config;

                    switch (facet.facetType) {
                        // attrbute facet (list/chart)
                        case FacetTypeUI.Attribute: {
                            const oIconTabBar = new SearchFacetTabBar(`${id}-attribute_facet`, {
                                items: [
                                    new IconTabFilter({
                                        text: i18n.getText("facetList"),
                                        icon: "sap-icon://list",
                                        key: `list${id}`,
                                        content: new SearchFacetSimpleList(`list${id}`), // facetType: Default value is 'FacetTypeUI.DataSource'
                                    }),
                                    new IconTabFilter({
                                        text: i18n.getText("facetBarChart"),
                                        icon: "sap-icon://horizontal-bar-chart",
                                        key: `barChart${id}`,
                                        content: new SearchFacetBarChart(`barChart${id}`),
                                    }),
                                    new IconTabFilter({
                                        text: i18n.getText("facetPieChart"),
                                        icon: "sap-icon://pie-chart",
                                        key: `pieChart${id}`,
                                        content: new SearchFacetPieChart(`pieChart${id}`),
                                    }),
                                ],
                            });
                            oIconTabBar.addStyleClass("sapUshellSearchFacetIconTabBar");
                            return oIconTabBar;
                        }
                        case FacetTypeUI.DataSource: {
                            const dataSourceFacet = new SearchFacetSimpleList(
                                (config?.id ? config.id + "-" : "") + "dataSourceFacet",
                                { facetType: FacetTypeUI.DataSource } // default value
                            );
                            if (config.exclusiveDataSource) {
                                dataSourceFacet.setVisible(false);
                            }
                            return dataSourceFacet;
                        }
                        // quick-select datasource facet
                        case FacetTypeUI.QuickSelectDataSource: {
                            const quickSelectDataSourceList = new SearchFacetQuickSelectDataSource(
                                (config?.id ? config.id + "-" : "") +
                                    "sapUshellSearchFacetQuickSelectDataSource",
                                {}
                            );
                            return quickSelectDataSourceList;
                        }
                        // hierarchy facet
                        case FacetTypeUI.Hierarchy: {
                            const hierarchyId = `${id}-hierarchy_facet`;
                            const facet = new SearchFacetHierarchyDynamic(hierarchyId, {
                                openShowMoreDialogFunction: openShowMoreDialog, // inject function because otherwise we have circular dependencies
                            });
                            return facet;
                        }
                        // static-hierarchy facet
                        case FacetTypeUI.HierarchyStatic: {
                            const hierarchyStaticId = `${id}-hierarchyStatic_facet`;
                            return new SearchFacetHierarchyStatic(hierarchyStaticId, {});
                        }
                        default: {
                            const internalError = new Error(
                                `Program error: Unknown facet type: '${facet.facetType}'`
                            );
                            throw new errors.UnknownFacetType(internalError);
                        }
                    }
                },
            });
        }
    }

    getFirstFilterByFacet(facets: Array<Control>): Control {
        for (const facet of facets) {
            const facetModel = facet.getBindingContext().getObject() as Facet;
            if (
                facetModel.facetType === FacetTypeUI.Attribute ||
                facetModel.facetType === FacetTypeUI.Hierarchy
            ) {
                return facet;
            }
        }
    }

    doRenderSectionHeader(oRm: RenderManager, title: string, showResetButton: boolean, styleClass?: string) {
        const headerItems = [];
        // label
        const label = new Label({ text: title });
        label.addStyleClass("sapUshellSearchFacetSectionHeader");
        headerItems.push(label);
        // reset button
        if (showResetButton) {
            const oSearchModel = this.getModel() as SearchModel;
            let bFiltersExist = false;
            const rootCondition = oSearchModel.getProperty("/uiFilter/rootCondition");
            if (rootCondition.hasFilters()) {
                bFiltersExist = true;
                // There are conditions only from static hierarchy facet (Collection area), no condition from dynamic static facet or attribute facet ('Filter By' area).
                // It shall not enable the reset button.
                if (oSearchModel.hasStaticHierarchyFacetFilterConditionOnly()) {
                    bFiltersExist = false;
                }
            } else {
                bFiltersExist = false;
            }
            const oResetButton = new Button("", {
                icon: "sap-icon://clear-filter",
                tooltip: i18n.getText("resetFilterButton_tooltip"),
                type: ButtonType.Transparent,
                enabled: bFiltersExist,
                press: () => {
                    oSearchModel.eventLogger.logEvent({
                        type: UserEventType.CLEAR_ALL_FILTERS,
                        dataSourceKey: oSearchModel.getDataSource()?.id,
                    });
                    oSearchModel.resetFilterByFilterConditions(true);
                },
            });
            oResetButton.addStyleClass("sapUshellSearchFilterByResetButton");
            headerItems.push(oResetButton);
        }
        // header
        const header = new FlexBox({
            justifyContent: FlexJustifyContent.SpaceBetween,
            alignItems: FlexAlignItems.Center,
            items: headerItems,
        });
        if (styleClass) {
            header.addStyleClass(styleClass);
        }
        oRm.renderControl(header);
    }

    renderSectionHeader(oRm: RenderManager, facets: Array<Control>, facetIndex: number) {
        const facet = facets[facetIndex];
        if (facetIndex === 0) {
            this.doRenderSectionHeader(oRm, i18n.getText("searchIn"), false, "sapUshellSearchInSection");
            return;
        }
        if (this.getFirstFilterByFacet(facets) === facet) {
            this.doRenderSectionHeader(oRm, i18n.getText("filterBy"), true);
            return;
        }
    }

    static renderer = {
        apiVersion: 2,
        render(oRm: RenderManager, oControl: SearchFacetList): void {
            const oSearchModel = oControl.getModel() as SearchModel;

            // outer div
            oRm.openStart("div", oControl);
            oRm.class("sapUshellSearchFacetList");
            oRm.class("sapUshellSearchFacetFilter"); // deprecated
            oRm.openEnd();

            const facets = oControl.getAggregation("facets") as Array<any>;
            for (let i = 0, len = facets.length; i < len; i++) {
                const facet = facets[i];
                oControl.renderSectionHeader(oRm, facets, i);
                const facetModel = facet.getBindingContext().getObject();
                switch (facetModel.facetType) {
                    case FacetTypeUI.Attribute:
                        facet.switchFacetType(FacetTypeUI.Attribute);
                        facet.attachSelectionChange(null, () => {
                            // don't show the showAllBtn while the facet pane is empty
                            const showAllBtn = oControl._getShowAllButton();
                            const showAllBtnDomref = showAllBtn.getDomRef();
                            if (showAllBtnDomref) {
                                if (showAllBtnDomref instanceof HTMLElement) {
                                    showAllBtnDomref.style.display = "none";
                                }
                            } else {
                                // robustness
                            }
                        });
                        if (facetModel.position <= 499) {
                            facet.addStyleClass("sapUshellSearchFacetSearchInAttribute");
                        }
                        oRm.renderControl(facet);
                        break;
                    case FacetTypeUI.DataSource:
                        facet.switchFacetType(FacetTypeUI.DataSource);
                        facet.addStyleClass("sapUshellSearchFacetDataSource");
                        oRm.renderControl(facet);
                        break;
                    case FacetTypeUI.QuickSelectDataSource:
                        facet.addStyleClass("sapUshellSearchFacetQuickSelectDataSource");
                        oRm.renderControl(facet);
                        break;
                    case FacetTypeUI.Hierarchy:
                        if (facetModel.position <= 499) {
                            facet.addStyleClass("sapUshellSearchFacetSearchInAttribute");
                        }
                        facet.addStyleClass("sapUshellSearchFacetHierarchyDynamic");
                        oRm.renderControl(facet);
                        break;
                    case FacetTypeUI.HierarchyStatic:
                        facet.addStyleClass("sapUshellSearchFacetHierarchyStatic");
                        oRm.renderControl(facet);
                        break;
                    default:
                        throw "program error: unknown facet type :" + facetModel.facetType;
                }
            }

            // show all filters button
            if (oSearchModel.getDataSource()?.type === "BusinessObject") {
                const hasDialogFacets =
                    oSearchModel.oFacetFormatter.hasDialogFacetsFromMetaData(oSearchModel);
                const hasResultItems = oControl.getModel().getProperty("/boCount") > 0;
                if (hasDialogFacets && hasResultItems) {
                    const showAllButton = oControl._getShowAllButton();
                    if (showAllButton !== null) {
                        oRm.openStart("div", oControl.getId() + "-showAllFilters");
                        oRm.openEnd();
                        (showAllButton as Button).setModel(oControl.getModel("i18n"));
                        (showAllButton as Button).addStyleClass("sapUshellSearchFacetListShowAllFilterBtn");
                        (showAllButton as Button).addStyleClass("sapUshellSearchFacetFilterShowAllFilterBtn"); // deprecated
                        oRm.renderControl(showAllButton as Button);
                        oRm.close("div");
                    }
                }
            }
            // close searchfacetlist div
            oRm.close("div");
        },
    };

    onAfterRendering(): void {
        const dataSource = document.querySelector(".searchFacetList .searchFacet ul");
        if (dataSource) {
            dataSource.setAttribute("role", "tree");
            const dataSourceItems = dataSource.querySelectorAll("li");
            dataSourceItems.forEach((item) => {
                item.setAttribute("role", "treeitem");
            });
        }
    }

    private _getShowAllButton(): Button {
        if (this.getAggregation("_showAllBtn") === null) {
            const createOpenFacetDialogFn = async (/* oEvent: Event */) => {
                const oSearchModel = this.getModel() as SearchModel;
                await openShowMoreDialog({
                    searchModel: oSearchModel,
                    dimension: undefined,
                    selectedTabBarIndex: 0,
                    tabBarItems: undefined,
                    sourceControl: this,
                });
            };
            const showAllBtn = new Button(`${this.getId()}-ShowMoreAll`, {
                text: "{showAllFilters}",
                press: createOpenFacetDialogFn,
                visible: true,
            });
            this.setAggregation("_showAllBtn", showAllBtn);
        }
        return this.getAggregation("_showAllBtn") as Button;
    }
}
