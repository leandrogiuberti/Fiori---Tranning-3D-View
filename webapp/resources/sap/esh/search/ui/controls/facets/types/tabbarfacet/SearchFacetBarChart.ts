/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../../../../i18n";
import ComparisonMicroChart, {
    ComparisonMicroChart$PressEvent,
} from "sap/suite/ui/microchart/ComparisonMicroChart";
import ComparisonMicroChartData from "sap/suite/ui/microchart/ComparisonMicroChartData";
import Control, { $ControlSettings } from "sap/ui/core/Control";
import { ValueColor } from "sap/m/library";
import RenderManager from "sap/ui/core/RenderManager";
import SearchModel from "sap/esh/search/ui/SearchModel";
import FacetItem from "../../../../FacetItem";
import { ComplexCondition } from "../../../../sinaNexTS/sina/ComplexCondition";
import Label from "sap/m/Label";
import SearchFacetDialog from "../../SearchFacetDialog";
import Facet from "../../../../Facet";
import Element from "sap/ui/core/Element";

export interface $SearchFacetBarChartSettings extends $ControlSettings {
    aItems: Array<ComparisonMicroChartData>;
    items: Array<ComparisonMicroChartData>;
    oSearchFacetDialog: SearchFacetDialog;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetBarChart extends Control {
    static readonly metadata = {
        properties: {
            aItems: {
                type: "object",
            },
            oSearchFacetDialog: {
                type: "sap.esh.search.ui.controls.SearchFacetDialog",
            },
        },
        aggregations: {
            items: {
                type: "sap.suite.ui.microchart.ComparisonMicroChartData",
                multiple: true,
            },
        },
    };
    options: Partial<$SearchFacetBarChartSettings>;
    iMissingCnt: number;

    constructor(sId?: string, settings?: Partial<$SearchFacetBarChartSettings>) {
        super(sId, settings);

        this.options = settings || {};
        this.bindAggregation("items", {
            path: "items",
            factory: (): ComparisonMicroChartData => {
                const oComparisonMicroChartData = new ComparisonMicroChartData({
                    title: { path: "label" },
                    value: { path: "value" },
                    color: {
                        path: "selected",
                        formatter: (isSelected: boolean): string => {
                            let res;
                            if (isSelected) {
                                res = ValueColor.Good;
                            } else {
                                res = ValueColor.Neutral;
                            }
                            return res;
                        },
                    },
                    tooltip: {
                        parts: [{ path: "label" }, { path: "value" }],
                        formatter: (label, value) => {
                            return label + ": " + value;
                        },
                    },
                    displayValue: { path: "valueLabel" },
                    press: (oEvent: ComparisonMicroChart$PressEvent) => {
                        const context = (oEvent.getSource() as Control).getBindingContext();
                        const model = context.getModel() as SearchModel;
                        const data = context.getObject() as FacetItem;
                        const isSelected = data.selected;
                        const filterCondition = data.filterCondition as ComplexCondition; // ToDo

                        if (isSelected) {
                            // deselect (remove filter)
                            if (this.options.oSearchFacetDialog) {
                                this.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
                            } else {
                                model.removeFilterCondition(filterCondition, true);
                            }
                        } else if (this.options.oSearchFacetDialog) {
                            // select (set filter), first for searchFacetDialog
                            this.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
                        } else {
                            // select (set filter), without searchFacetDialog / for small facets
                            model.addFilterCondition(filterCondition, true);
                        }
                    },
                });
                return oComparisonMicroChartData;
            },
        });
    }

    static renderer = {
        apiVersion: 2,
        render(oRm: RenderManager, oControl: SearchFacetBarChart): void {
            // render start of tile container
            oRm.openStart("div", oControl);
            oRm.openEnd();

            const oComparisonMicroChart = new ComparisonMicroChart("", {
                width: "90%",
                colorPalette: [], // the colorPalette merely stops the evaluation of the bar with 'neutral', 'good' etc
                tooltip: "",
                shrinkable: true,
            } as any) as any;

            if (oControl.options?.oSearchFacetDialog) {
                oComparisonMicroChart.setWidth("95%");
                oComparisonMicroChart.addStyleClass("sapUshellSearchFacetBarChartLarge");
            } else {
                oComparisonMicroChart.addStyleClass("sapUshellSearchFacetBarChart");
            }

            oComparisonMicroChart.addEventDelegate({
                onAfterRendering: function () {
                    const chartDom = document.getElementById(this.getId());
                    if (chartDom && chartDom.querySelector(".Good")) {
                        chartDom.classList.add("sapUshellSearchFacetBarChartSelected");
                    }
                    const selectedFacetItem = this.getBindingContext().getObject() as Facet;
                    oComparisonMicroChart
                        .getDomRef()
                        .setAttribute(
                            "data-test-id-facet-dimension-value",
                            `${selectedFacetItem.title}-${selectedFacetItem.dimension}`
                        );
                }.bind(oControl),
            });

            let barItems = oControl.getAggregation("items") as Array<ComparisonMicroChartData>;
            const barItems2 = oControl.getProperty("aItems");
            if (barItems.length === 0 && barItems2) {
                barItems = barItems2;
            }
            let iMissingCnt = 0;
            for (const barItem of barItems) {
                if (!oControl.options.oSearchFacetDialog) {
                    if (barItem.getProperty("value")) {
                        oComparisonMicroChart.addData(barItem);
                    } else {
                        iMissingCnt++;
                    }
                } else {
                    oComparisonMicroChart.addData(barItem);
                }
            }
            oControl.iMissingCnt = iMissingCnt;
            oRm.renderControl(oComparisonMicroChart);

            // render end of tile container
            oRm.close("div");
        },
    };

    onAfterRendering(): void {
        const domRef = this.getDomRef() as HTMLElement;
        const facetIconTabBar = domRef.closest(".sapUshellSearchFacetIconTabBar");
        if (!facetIconTabBar) {
            return;
        }
        const infoZeile = facetIconTabBar.querySelector(".sapUshellSearchFacetInfoZeile") as HTMLElement;
        if (!infoZeile) {
            return;
        }
        const oInfoZeile = Element.getElementById(infoZeile.id) as Label;
        if (this.iMissingCnt > 0) {
            oInfoZeile.setVisible(true);
            const message = i18n.getText("infoZeileNumberMoreSelected", [this.iMissingCnt]);
            oInfoZeile.setText(message);
            oInfoZeile.rerender();
        } else {
            oInfoZeile.setVisible(false);
        }
    }
}
