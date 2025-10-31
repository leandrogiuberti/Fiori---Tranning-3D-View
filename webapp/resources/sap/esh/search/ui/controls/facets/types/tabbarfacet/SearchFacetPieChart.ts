/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/* global $ */
import i18n from "../../../../i18n";
import * as thirdpartyD3 from "sap/ui/thirdparty/d3";
import Control, { $ControlSettings } from "sap/ui/core/Control";
import SearchModel from "sap/esh/search/ui/SearchModel";
import RenderManager from "sap/ui/core/RenderManager";
import Dialog from "sap/m/Dialog";
import { FacetTypeUI } from "../../FacetTypeUI";
import Facet from "../../../../Facet";
import Label from "sap/m/Label";
import Element from "sap/ui/core/Element";

export interface $PieChartSettings extends $ControlSettings {
    // dimension-angle: "$count",
    "dimension-pie": string;
    backgroundWidth: number;
    backgroundHeight: number;
    width: number;
    height: number;
    innerRadius: number;
    outerRadius: number;
    tweenGen: () => void; // PieChart.Tweens.tweenGenSimple
    tweenGenText: () => void; // PieChart.Tweens.tweenGenSimpleText,
    arcCalculator: HistoricalArcCalculator | DefaultArcCalculator | HistoricalArcCalculator; // PieChart.generateHistoricalArcCalculator(), // PieChart.generateDefaultArcCalculator(), PieChart.generateHistoricalArcCalculator(),
    animationduration: number;
    labelHideThreshold: number;
    easing: string; // "linear";"poly(4)";"quad";"cubic" (default);"sin";"exp";"circle";"elastic(a, p)";"back(s)";"bounce"
    pieChartClass: string; // "sap-piechart"
    pieChartParentClass: string; // "sapUshellSearchFacetPieChart"
    color: string; // "blue"
    strokewidth: number;
    strokewidthHover: number;
    padding4click: number;
    multipleselectable: boolean; // if set to false(single selection mode) no hover effect will be provided when any segment already has been clicked
    oSearchFacetDialog: Dialog;
}
export interface PieChartItem {
    filterCondition?: any;
    dimension?: string;
    label?: string;
    selected?: boolean;
    filterLabel?: string;
    id?: string;
    value?: any;
    valueLabel?: string;
    tooltip?: string;
    filtered?: boolean;
    removed?: boolean;
    fill?: string; // i.e. "#007CAA";
    stroke?: string;
    maxLabelLength?: number;
}
export type svgAttr = (property: string, value: any) => { attr: svgAttr; style: svgStyle };
export type svgStyle = (property: string, value: any) => void;
export type svgSelect = (selector: string) => { remove: () => void };
export type svgSelectAll = (selector: string) => { remove: () => void };
export type svgAppend = (selector: string) => { attr: svgAttr; remove: () => void };

export interface SvgBackground {
    select: svgSelect;
    selectAll: svgSelect;
    append: svgAppend;
}

export type PieChartItems = Array<PieChartItem>;

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetPieChart extends Control {
    static readonly metadata = {
        properties: {
            oSearchFacetDialog: {
                type: "object",
            },
        },
        aggregations: {
            items: {
                type: "sap.esh.search.ui.FacetItem",
                multiple: true, // default type is "sap.ui.core.Control", multiple is "true"
            },
        },
    };
    static d3: any; // sap.ui.thirdparty.d3

    private PieChart: any;
    private chartElements: PieChartItems;
    private iMissingCnt = 0;

    constructor(sId?: string, settings?: Partial<$PieChartSettings>) {
        super(sId, settings);
        SearchFacetPieChart.d3 = thirdpartyD3;
    }

    static isIE(): boolean {
        // eslint-disable-next-line no-restricted-globals
        if (navigator.appName === "Microsoft Internet Explorer") {
            return true;
        }
        return false;
    }

    static renderer = {
        apiVersion: 2,
        render(oRm: RenderManager, oControl: SearchFacetPieChart): void {
            // outer div
            oRm.openStart("div", oControl);
            oRm.attr("role", "figure");
            oRm.openEnd();
            // close SearchFacetPieChart div
            oRm.close("div");
            oControl.PieChart = PieChart;
        },
    };

    getFacetIndex(): number {
        // navigate to parent with class sapUshellSearchFacetIconTabBar
        let domElement = this.getDomRef();
        let myIconTabBar;
        while (domElement) {
            if (domElement.classList.contains("sapUshellSearchFacetIconTabBar")) {
                myIconTabBar = domElement;
                break;
            }
            domElement = domElement.parentElement;
        }
        if (!myIconTabBar) {
            return -1;
        }

        const iconTabBars = document.querySelectorAll(".sapUshellSearchFacetIconTabBar");
        for (let i = 0; i < iconTabBars.length; ++i) {
            const iconTabBar = iconTabBars.item(i);
            if (iconTabBar === myIconTabBar) {
                return i;
            }
        }
        return -1;
    }

    getFacetIndexByIdForLargePieChart(chartId: string): number {
        let index = -1;
        // get the tabStrip element by id, then its parent, then its parent
        const chartElem = document.getElementById(chartId);
        const tabStrip = chartElem?.parentElement?.parentElement;
        if (!tabStrip) {
            return -1;
        }
        const tabStripId = tabStrip.id; // e.g. "__container6"
        // get all elements with class 'searchFacetLargeChartContainer'
        const ar = Array.from(document.querySelectorAll(".searchFacetLargeChartContainer")) as HTMLElement[];
        for (let i = 0; i < ar.length; i++) {
            const currentTabId = ar[i].id;
            if (currentTabId === tabStripId) {
                index = i;
                break;
            }
        }
        return index;
    }

    getPieChartIndexByFacetIndex(facetIndex: number): number {
        let selKey;
        let index = -1;
        let previousFacetsWithPieChart = 0;
        const iconTabBars = document.querySelectorAll(".sapUshellSearchFacetIconTabBar");
        for (let i = 0; i < facetIndex; i++) {
            const iconTabBar = iconTabBars[i] as HTMLElement;
            if (!iconTabBar) continue;
            const mlibContents = iconTabBar.querySelectorAll(".sapMLIBContent");
            if (mlibContents.length < 2) continue;
            const firstChild = mlibContents[1].firstChild as HTMLElement | null;
            if (!firstChild || !("id" in firstChild)) continue;
            selKey = (firstChild as HTMLElement).id;
            if (selKey && selKey.match(/pieChart/) !== null) {
                previousFacetsWithPieChart++;
            }
        }
        index = previousFacetsWithPieChart;
        return index;
    }

    getSumSelected(data): number {
        let itemValue;
        let integerValue = 0;
        if (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].facetType === FacetTypeUI.Attribute) {
                    for (let j = 0; j < data[i].items.length; j++) {
                        itemValue = data[i].items[j].value;
                        if (itemValue && data[i].items[j].selected) {
                            integerValue += itemValue;
                        }
                    }
                }
            }
        }
        return integerValue;
    }

    getDataForPieChart(data, model, facetIndex: number): Array<PieChartItems> {
        const res: Array<PieChartItems> = [];
        let group: PieChartItems = [];
        let item: PieChartItem;
        let itemValue = 0;
        let currentFacetIndex = -1;
        let itemValueText = "";
        const searchResultTotal = model.oData.count;
        let overallTotal;
        let pieChartTotal = 0;
        this.iMissingCnt = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].facetType === FacetTypeUI.Attribute) {
                currentFacetIndex++;
                group = [];
                pieChartTotal = 0;
                for (let j = 0; j < data[i].items.length; j++) {
                    item = {};
                    itemValue = data[i].items[j].value;
                    if (itemValue) {
                        itemValueText = "" + itemValue;
                        pieChartTotal += itemValue;
                        item.filterCondition = data[i].items[j].filterCondition;
                        item.dimension = data[i].items[j].facetTitle;
                        item.label = data[i].items[j].label;
                        item.selected = data[i].items[j].selected;
                        item.filterLabel = data[i].items[j].label;
                        item.id = data[i].items[j].label;
                        item.value = itemValue;
                        item.valueLabel = data[i].items[j].valueLabel;
                        if (itemValueText) {
                            item.tooltip = data[i].items[j].label + ": " + itemValue;
                        } else {
                            item.tooltip = data[i].items[j].label;
                        }
                        item.filtered = false;
                        item.removed = false;
                        item.fill = "#007CAA"; // ToDo: Use color code
                        item.maxLabelLength = 30;
                        group.push(item);
                    } else if (currentFacetIndex === facetIndex) {
                        this.iMissingCnt++;
                    }
                }
                // ############# add a new pie segment that just reflects the data NOT in the pie chart
                if (typeof data[i].totalCount === "number") {
                    overallTotal = data[i].totalCount;
                } else {
                    overallTotal = searchResultTotal;
                }
                const percCoveredInPie = Math.round((pieChartTotal / overallTotal) * 100);
                let percMissing = 100 - percCoveredInPie;
                if (percMissing > 0) {
                    if (percMissing === 100) {
                        percMissing = 99;
                    }
                    const sizeOfWedge = (18 * pieChartTotal) / 350; // 18 is 5% of 360°
                    const label = `${percMissing}`;
                    item = {};
                    item.filterCondition = null;
                    item.dimension = "";
                    item.label = label;
                    item.id = "perc_missing";
                    item.value = sizeOfWedge;
                    item.valueLabel = label;
                    item.tooltip = i18n.getText("facetPieChartOverflowText", [label]);
                    item.filtered = false;
                    item.removed = false;
                    item.fill = "transparent";
                    item.stroke = "none";
                    item.maxLabelLength = 30;
                    group.push(item);
                    // #############
                }

                res.push(group);
            }
        }
        return res;
    }

    getDataForPieChartLarge(
        facetItems: any,
        model: any,
        facetTotalCount: number,
        maxItemsToShow: number
    ): PieChartItems {
        const group: Array<PieChartItem> = [];
        let itemValue = 0;
        const searchResultTotal = model.oData.count;
        let overallTotal;
        let pieChartTotal = 0;
        this.iMissingCnt = 0;
        let item: PieChartItem;
        for (let j = 0; j < facetItems.length; j++) {
            if (j + 1 >= maxItemsToShow) {
                break; // limit number of items to show
            }
            itemValue = facetItems[j].value;
            if (itemValue) {
                item = {};
                pieChartTotal = pieChartTotal + itemValue;
                item.filterCondition = facetItems[j].filterCondition;
                item.dimension = facetItems[j].facetAttribute;
                item.label = facetItems[j].label;
                item.selected = facetItems[j].selected;
                item.filterLabel = facetItems[j].label;
                item.id = facetItems[j].label;
                item.value = itemValue;
                item.valueLabel = facetItems[j].valueLabel;
                item.tooltip = facetItems[j].label + "\t: " + itemValue;
                item.filtered = false;
                item.removed = false;
                item.fill = "#007CAA"; // ToDo: Use color code
                item.maxLabelLength = 30;
                group.push(item);
            }
        }
        // ############# add a new pie segment that just reflects the data NOT in the pie chart
        if (facetItems.length > 0) {
            if (typeof facetTotalCount === "undefined") {
                overallTotal = searchResultTotal;
            } else {
                overallTotal = facetTotalCount;
            }
            const percCoveredInPie = Math.round((pieChartTotal / overallTotal) * 100);
            let percMissing = 100 - percCoveredInPie;
            if (percMissing > 0) {
                if (percMissing === 100) {
                    percMissing = 99;
                }
                const sizeOfWedge = (18 * pieChartTotal) / 350; // 18 is 5% of 360°
                const label = `${percMissing}`;
                item = {};
                item.filterCondition = null;
                item.dimension = facetItems[0].facetAttribute;
                item.label = label;
                item.selected = false;
                item.filterLabel = label;
                item.id = "perc_missing";
                item.value = sizeOfWedge;
                item.valueLabel = label;
                item.tooltip = i18n.getText("facetPieChartOverflowText2", [label, maxItemsToShow]);
                item.filtered = false;
                item.removed = false;
                item.fill = "transparent";
                item.stroke = "none";
                item.maxLabelLength = 30;
                group.push(item);
                // #############
            }
        }
        return group;
    }

    directUpdate(facetItems, piechartParent, model, facetTotalCount: number, options): void {
        let model1;
        const fewerData = [];
        const maxItemsToShow = 20; // if needed, 19 items plus one segment for missing percentage of data
        const application = null;
        model1 = this.getModel();
        if (!model1) {
            model1 = this.getParent().getModel();
        }
        options.pieChartParentClass = "sapUshellSearchFacetPieChartLarge";
        options.height = options.relevantContainerHeight;
        $(piechartParent).parent().parent().parent().height();
        this.chartElements = this.getDataForPieChartLarge(
            facetItems,
            model1,
            facetTotalCount,
            maxItemsToShow
        );
        const chart = new PieChart(piechartParent, options, application, model1);
        for (let i = 0; i < maxItemsToShow; i++) {
            if (this.chartElements[i]) {
                fewerData.push(this.chartElements[i]);
            }
        }
        chart.update(fewerData);
    }

    isFacetPanel(): boolean {
        let domElement = this.getDomRef();
        while (domElement) {
            if (domElement.classList.contains("sapUshellSearchFacetTabBar")) {
                return true;
            }
            domElement = domElement.parentElement;
        }
        return false;
    }
    onAfterRendering(): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        let data, chartElements, chart, piechartParent, facetIndex;
        const application = null;
        const settings: Partial<$PieChartSettings> = {};

        const model = this.getModel();
        if (model) {
            piechartParent = document.getElementById(this["sId"]);

            // ensure that we are in the 'small pie chart'
            if (this.isFacetPanel()) {
                settings.pieChartParentClass = "sapUshellSearchFacetPieChart";
                facetIndex = this.getFacetIndex();
                if (piechartParent) {
                    piechartParent.className = settings.pieChartParentClass;
                }
                data = this.getDataForPieChart(model.getProperty("/facets"), model, facetIndex);
                chartElements = data[facetIndex];
                const aAriaDesc = chartElements.map((chartElement) => {
                    return chartElement.tooltip;
                });
                this.getDomRef().setAttribute("aria-label", aAriaDesc.join("; "));
                const selectedFacetItem = this.getBindingContext().getObject() as Facet;
                this.getDomRef().setAttribute(
                    "data-test-id-facet-dimension-value",
                    `${selectedFacetItem.title}-${selectedFacetItem.dimension}`
                );

                chart = new this.PieChart(piechartParent, settings, application, model);
                chart.update(chartElements);
                // update infozeile
                const iconTabBar = this.getDomRef().closest(".sapUshellSearchFacetIconTabBar");
                let infoZeile: HTMLElement | null = null;
                if (iconTabBar) {
                    infoZeile = iconTabBar.querySelector(".sapUshellSearchFacetInfoZeile");
                }
                if (infoZeile) {
                    const oInfoZeile = Element.getElementById(infoZeile.id) as Label;
                    if (that.iMissingCnt > 0) {
                        oInfoZeile.setVisible(true);
                        const message = i18n.getText("infoZeileNumberMoreSelected", [that.iMissingCnt]);
                        oInfoZeile.setText(message);
                        oInfoZeile.rerender();
                    } else {
                        oInfoZeile.setVisible(false);
                    }
                }
            } else if (
                piechartParent &&
                (piechartParent as HTMLElement).className === "largeChart2piechart"
            ) {
                // pie chart
                (piechartParent as HTMLElement).setAttribute("tabindex", "0");
            }
        }
    }
}

/*** PIE CHART ***/
class PieChart {
    application;
    parent: string;
    model: SearchModel;
    chartElements: Array<any>;
    options: any;
    svg: any;
    svgArcs: {
        selectAll: (path: string) => {
            data: any;
            each: (...args: Array<any>) => void;
            remove: () => void;
        };
    };
    svgLabels: {
        selectAll: (g: any) => {
            data: any;
            each: (...args: Array<any>) => void;
            remove: () => void;
        };
    };
    oldArcs: Array<any>;
    clickedSegment: any;
    firstUpdate: boolean;
    xOrigin: number;
    yOrigin: number;
    tweenGenArc: any;
    tweenGenText: any;
    arcSequence: Sequence;

    constructor(parentSelector, settings: $PieChartSettings, application: any, model: SearchModel) {
        this.init(parentSelector, settings, application, model);
    }

    init(parentSelector, settings: $PieChartSettings, application: any, model: SearchModel) {
        this.parent = parentSelector;
        this.application = application;
        this.model = model;
        this.chartElements = [];
        const parent = SearchFacetPieChart.d3.select(parentSelector);
        let svgHeight = parentSelector instanceof HTMLElement ? parentSelector.offsetHeight : 0;
        const svgWidth = parentSelector instanceof HTMLElement ? parentSelector.offsetWidth : 0;
        if (settings.height > svgHeight) {
            svgHeight = settings.height;
        }
        const r = Math.min(svgWidth, svgHeight) / 2;
        // initialize this.options
        this.options = {
            // dimension-angle: "$count",
            "dimension-pie": "YEAR",
            backgroundWidth: svgWidth,
            backgroundHeight: svgHeight,
            width: svgWidth,
            height: svgHeight,
            innerRadius: 0,
            outerRadius: r * 0.8,
            tweenGen: PieChart.Tweens.tweenGenSimple,
            tweenGenText: PieChart.Tweens.tweenGenSimpleText,
            arcCalculator: PieChart.generateHistoricalArcCalculator(this), // PieChart.generateDefaultArcCalculator(), PieChart.generateHistoricalArcCalculator(),
            animationduration: 1500,
            labelHideThreshold: 0.05,
            easing: "linear", // "linear";"poly(4)";"quad";"cubic" (default);"sin";"exp";"circle";"elastic(a, p)";"back(s)";"bounce"
            pieChartClass: "sap-piechart",
            pieChartParentClass: "sapUshellSearchFacetPieChart",
            color: "blue",
            strokewidth: 1,
            strokewidthHover: 3,
            padding4click: 7,
            multipleselectable: true, // if set to false(single selection mode) no hover effect will be provided when any segment already has been clicked
            oSearchFacetDialog: null,
        };
        // move passed in options to this.options
        if (settings) {
            for (const field in settings) {
                this.options[field] = settings[field];
            }
        }
        this.createAttributeService(PieChart, "innerRadius", function () {
            this.init();
        });
        this.createAttributeService(PieChart, "outerRadius", function () {
            this.init();
        });
        this.createAttributeService(PieChart, "tweenGen", function () {
            this.init();
        });
        this.createAttributeService(PieChart, "tweenGenText", function () {
            this.init();
        });
        this.createAttributeService(PieChart, "width", function () {
            this.init();
        });
        this.createAttributeService(PieChart, "height", function () {
            this.init();
        });
        this.createAttributeService(PieChart, "animationduration");
        this.createAttributeService(PieChart, "labelHideThreshold");
        this.createAttributeService(PieChart, "arcCalculator");
        // create global svg elements: parent.append
        const xOrigin = Math.round(this.options.width / 2);
        const yOrigin = Math.round(this.options.height / 2);
        this.svg = parent
            .append("svg:svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("id", parentSelector.id + "_svg")
            .append("svg:g")
            .attr("transform", "translate(" + xOrigin + "," + yOrigin + ")");
        this.svgArcs = this.svg.append("svg:g");
        this.svgLabels = this.svg.append("svg:g");
        this.svg.attr("class", this.options.pieChartClass);
        // initialize svg size and tween functions
        this.initTween();
        this.oldArcs = [];
        // stack of clicked segments
        this.clickedSegment = {};
        // mark init state as firstUpdate
        this.firstUpdate = true;
    }

    getParent() {
        return this.parent;
    }

    static Tweens = (function () {
        const Tweens1 = {
            tweenGenSimple: undefined,
            tweenGenSimpleText: undefined,
            translateStr4Padding: undefined,
            tweenGenEcstasy: undefined,
            tweenGenLSD: undefined,
        };
        // animation function generator: Simple
        // ======================================================================
        Tweens1.tweenGenSimple = function (d, i, a, innerRadius, outerRadius, svgGenerator) {
            const s1 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
            };
            const s2 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
            };
            const j = SearchFacetPieChart.d3.interpolate(s1, s2);
            return function (t) {
                return svgGenerator(j(t));
            };
        };
        // animation function generator: Simple Text
        // ======================================================================
        Tweens1.tweenGenSimpleText = function (d, i, a, innerRadius, outerRadius, chartInstance, filtered) {
            let labelText = " ";
            if (
                d.labelElement.childNodes[1] &&
                d.labelElement.childNodes[1].childNodes[0] &&
                d.labelElement.childNodes[1].childNodes[0].data
            ) {
                labelText = d.labelElement.childNodes[1].childNodes[0].data;
            }
            const labelpositionBefore = new Labelposition(
                chartInstance.options.width,
                chartInstance.options.height,
                d.oldArc.startAngle,
                d.oldArc.endAngle,
                chartInstance.options.outerRadius,
                d.labelElement.childNodes[1].getBBox().width,
                d.labelElement.childNodes[1].getBBox().height,
                chartInstance.svgArcGen(d).centroid(d),
                labelText,
                chartInstance.svg
            );
            labelpositionBefore.update();
            const coordinationBefore = [labelpositionBefore.x, labelpositionBefore.y];
            const labelpositionAfter = new Labelposition(
                chartInstance.options.width,
                chartInstance.options.height,
                d.startAngle,
                d.endAngle,
                chartInstance.options.outerRadius,
                d.labelElement.childNodes[1].getBBox().width,
                d.labelElement.childNodes[1].getBBox().height,
                chartInstance.svgArcGen(d).centroid(d),
                labelText,
                chartInstance.svg
            );
            labelpositionAfter.update();
            // in case that label shall be cut
            if (labelpositionAfter.labelWidth < d.labelElement.childNodes[1].getBBox().width) {
                chartInstance.adjustLabelWidth(d.labelElement, labelpositionAfter.labelWidth);
            }
            const coordinationAfter = [labelpositionAfter.x, labelpositionAfter.y];
            const j = SearchFacetPieChart.d3.interpolateArray(coordinationBefore, coordinationAfter);
            const translateStrBuilder = function (coordinate) {
                let tranlateStr;
                if (filtered) {
                    tranlateStr = Tweens1.translateStr4Padding(
                        d.startAngle,
                        d.endAngle,
                        chartInstance.options.padding4click,
                        coordinate[0],
                        coordinate[1]
                    );
                } else {
                    tranlateStr = "translate(" + coordinate + ")";
                }
                return tranlateStr;
            };
            return function (t) {
                return translateStrBuilder(j(t));
            };
        };
        Tweens1.translateStr4Padding = function (startAngle, endAngle, padding, xOldOrig, yOldOrig) {
            // cal origin of transformed coordinate system
            // in case that startangle = 0
            const apexAngle = endAngle - startAngle;
            let xNewOrig = padding * Math.sin(apexAngle / 2);
            let yNewOrig = -(padding * Math.cos(apexAngle / 2));
            // rotate it by startAngle
            const tmp = xNewOrig * Math.cos(startAngle) - yNewOrig * Math.sin(startAngle);
            yNewOrig = xNewOrig * Math.sin(startAngle) + yNewOrig * Math.cos(startAngle);
            xNewOrig = tmp;
            const translateStr = "translate(" + (xOldOrig + xNewOrig) + ", " + (yOldOrig + yNewOrig) + ")";
            return translateStr;
        };
        // animation function generator: Ecstasy
        // ======================================================================
        Tweens1.tweenGenEcstasy = function (d, i, a, innerRadius, outerRadius, svgGenerator) {
            // split
            const splitRadius = Math.round((innerRadius + outerRadius) / 2);
            let splitOuterRadius;
            let splitInnerRadius;
            if (i % 2) {
                splitOuterRadius = outerRadius;
                splitInnerRadius = splitRadius;
            } else {
                splitOuterRadius = splitRadius;
                splitInnerRadius = innerRadius;
            }
            let s1 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
            };
            let s2 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            const splitInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // move + resize
            s1 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            s2 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            const resizeInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // unify
            s1 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            s2 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
            };
            const unifyInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // assemble total animation function
            return function (t) {
                if (t <= 0.25) {
                    return svgGenerator(splitInterpolation(t * 4));
                }
                if (t <= 0.75) {
                    return svgGenerator(resizeInterpolation((t - 0.25) * 2));
                }
                return svgGenerator(unifyInterpolation((t - 0.75) * 4));
            };
        };
        // animation function generator: LSD
        // ======================================================================
        Tweens1.tweenGenLSD = function (d, i, a, innerRadius, outerRadius, svgGenerator) {
            // split
            const splitRadius = Math.round((innerRadius + outerRadius) / 2);
            let splitOuterRadius;
            let splitInnerRadius;
            if (i % 2) {
                splitOuterRadius = outerRadius;
                splitInnerRadius = splitRadius;
            } else {
                splitOuterRadius = splitRadius;
                splitInnerRadius = innerRadius;
            }
            let s1 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
            };
            let s2 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            const splitInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // move
            s1 = {
                startAngle: d.oldArc.startAngle,
                endAngle: d.oldArc.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            s2 = {
                startAngle: d.startAngle,
                endAngle: d.startAngle + (d.oldArc.endAngle - d.oldArc.startAngle),
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            const moveInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // resize
            s1 = {
                startAngle: d.startAngle,
                endAngle: d.startAngle + (d.oldArc.endAngle - d.oldArc.startAngle),
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            s2 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            const resizeInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // unify
            s1 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: splitInnerRadius,
                outerRadius: splitOuterRadius,
            };
            s2 = {
                startAngle: d.startAngle,
                endAngle: d.endAngle,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
            };
            const unifyInterpolation = SearchFacetPieChart.d3.interpolate(s1, s2);
            // assemble total animation function
            return function (t) {
                if (t <= 0.25) {
                    return svgGenerator(splitInterpolation(t * 4));
                }
                if (t <= 0.5) {
                    return svgGenerator(moveInterpolation((t - 0.25) * 4));
                }
                if (t <= 0.75) {
                    return svgGenerator(resizeInterpolation((t - 0.5) * 4));
                }
                return svgGenerator(unifyInterpolation((t - 0.75) * 4));
            };
        };
        return Tweens1;
    })();
    // create attribute get and set services
    // ======================================================================
    createAttributeService(cls, attribute, initFunction?: () => void) {
        cls.prototype[attribute] = function (value) {
            if (value === null) {
                return this.options[attribute];
            }
            this.options[attribute] = value;
            if (initFunction) {
                initFunction.call(this);
            }
            return this;
        };
    }
    // initialization of tween function
    // ======================================================================
    initTween() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        that.xOrigin = Math.round(that.options.width / 2);
        that.yOrigin = Math.round(that.options.height / 2);
        // adjust size
        that.svg.attr("width", this.options.width).attr("height", this.options.height);
        // tween function generator: generates tween function for svg:path
        this.tweenGenArc = function (d, i, a) {
            return that.options.tweenGen(
                d,
                i,
                a,
                that.options.innerRadius,
                that.options.outerRadius,
                that.svgArcGen(d)
            );
        };
        // tween function generator: generates tween function for svg:text
        this.tweenGenText = function (d, i, a, filtered) {
            return that.options.tweenGenText(
                d,
                i,
                a,
                that.options.innerRadius,
                that.options.outerRadius,
                that,
                filtered
            );
        };
    }
    // update (draw) pie chart
    // ======================================================================
    update(data) {
        this.notAnimatedUpdate(data);
    }
    notAnimatedUpdate(data) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        let arcs = [];
        if (!data) {
            return;
        }
        this.chartElements = data;
        // remove old elements
        that.svgArcs.selectAll("path").remove();
        that.svgLabels.selectAll("g").remove();
        // ------------------------------------------------------------------
        // 0. calculate percentage
        // ------------------------------------------------------------------
        let totalValue = 0;
        for (let i = 0; i < data.length; ++i) {
            totalValue += data[i].value;
        }
        for (let j = 0; j < data.length; ++j) {
            data[j].percentage = data[j].value / totalValue;
        }
        // ------------------------------------------------------------------
        // 1. arc calculation
        // ------------------------------------------------------------------
        arcs = this.options.arcCalculator.calculateNewArcsOnly(data);
        // ------------------------------------------------------------------
        // 2. update arcs
        // ------------------------------------------------------------------
        // data binding
        let sel = this.svgArcs.selectAll("path").data(arcs, PieChart.getIdOfArc);
        // remove old arcs
        if (!sel.exit().empty()) {
            sel.exit().remove();
        }
        // change existing arcs + change size to zero for arcs to be removed and then remove them
        if (!sel.empty()) {
            sel.attr("d", function (d) {
                const path = that.svgArcGen(d);
                return path(d);
            })
                .attr("transform", function (d) {
                    let translateStr;
                    if (d.data.selected) {
                        translateStr = PieChart.translateStr4Padding(
                            d.startAngle,
                            d.endAngle,
                            that.options.padding4click,
                            0,
                            0
                        );
                    } else {
                        translateStr = "translate(0,0)";
                    }
                    return translateStr;
                })
                .style("stroke", function (d) {
                    let strokeColor;
                    if (d.data.stroke === "none") {
                        strokeColor = d.data.stroke;
                    } else if (d.data.selected || d.data.hovered) {
                        strokeColor = "#dadada";
                    } else {
                        strokeColor = "white";
                    }
                    return strokeColor;
                })
                .style("stroke-width", function (d) {
                    let strokeWidth;
                    if (d.data.selected || d.data.hovered) {
                        strokeWidth = that.options.strokewidthHover;
                    } else {
                        strokeWidth = that.options.strokewidth;
                    }
                    return strokeWidth;
                })
                .style("opacity", function (d) {
                    let opacityValue;
                    if (d.data.selected || d.data.hovered) {
                        opacityValue = "1";
                    } else if (d.data.initial) {
                        opacityValue = "0.75";
                    } else {
                        opacityValue = "0.5";
                    }
                    return opacityValue;
                })
                .each(function (d) {
                    while (this.hasChildNodes()) {
                        this.removeChild(this.lastChild);
                    }
                    SearchFacetPieChart.d3
                        .select(this)
                        .append("svg:title")
                        .text("" + d.data.tooltip);
                });
        }
        // create new arcs
        sel.enter()
            .append("svg:path")
            .attr("data-label", (d) => d.data.label)
            .attr("transform", function (d) {
                let translateStr;
                if (d.data.selected) {
                    // in case that any clicked segments already existing (_onLarge,_onSmall, switch between bar and pie)
                    that.clickedSegment[d.data.id] = this;
                    translateStr = PieChart.translateStr4Padding(
                        d.startAngle,
                        d.endAngle,
                        that.options.padding4click,
                        0,
                        0
                    );
                }
                return translateStr;
            })
            .attr("shape-rendering", "geometricPrecision")
            .attr("tabindex", "0")
            .style("stroke", function (d) {
                let strokeColor;
                if (d.data.stroke === "none") {
                    strokeColor = d.data.stroke;
                } else if (d.data.selected || d.data.hovered) {
                    strokeColor = "#dadada";
                } else {
                    strokeColor = "white";
                }
                return strokeColor;
            })
            .style("stroke-width", function (d) {
                let strokeWidth;
                if (d.data.selected || d.data.hovered) {
                    strokeWidth = that.options.strokewidthHover;
                } else {
                    strokeWidth = that.options.strokewidth;
                }
                return strokeWidth;
            })
            .style("opacity", function (d) {
                let opacityValue;
                if (d.data.selected || d.data.hovered) {
                    opacityValue = "1";
                } else if (d.data.initial) {
                    opacityValue = "0.75";
                } else {
                    opacityValue = "0.5";
                }
                return opacityValue;
            })
            .attr("fill", function (d) {
                return d.data.fill;
            })
            .on("keydown", function () {
                const e = SearchFacetPieChart.d3.event;
                const code = e.keyCode || e.which;
                if (code == 32) {
                    e.target.__onclick();
                }
            })
            .on("click", function (d, i) {
                let oEvent;
                if (d.data.click && d.data.pieupdateuionly === false) {
                    const returnCode = d.data.click(d, i);
                    if (!that.options.multipleselectable && !returnCode) {
                        return;
                    }
                }
                let translateStr, translateStrLabel;
                let labelposition;
                const labelElem = that.getLabelElementtbyLabel(d.data.label);
                if (labelElem) {
                    let labelText = " ";
                    if (
                        labelElem.childNodes[1] &&
                        labelElem.childNodes[1].childNodes[0] &&
                        labelElem.childNodes[1].childNodes[0].data
                    ) {
                        labelText = labelElem.childNodes[1].childNodes[0].data;
                    }
                    labelposition = new Labelposition(
                        that.options.width,
                        that.options.height,
                        d.startAngle,
                        d.endAngle,
                        that.options.outerRadius,
                        labelElem.childNodes[1].getBoundingClientRect().width,
                        labelElem.childNodes[1].getBoundingClientRect().height,
                        that.svgArcGen(d).centroid(d),
                        labelText,
                        that.svg
                    );
                    labelposition.update();
                    // in case that label shall be cut
                    if (labelposition.labelWidth < labelElem.childNodes[1].getBoundingClientRect().width) {
                        that.adjustLabelWidth(labelElem, labelposition.labelWidth);
                    }
                }
                if (d.data.selected) {
                    // already clicked,unclick
                    if (!that.options.multipleselectable && Object.keys(that.clickedSegment).length > 0) {
                        // delete existing segment from stack
                        delete that.clickedSegment[d.data.id];
                    }
                    // back to old origin
                    translateStr = "translate(0,0)";
                    if (labelElem) {
                        translateStrLabel = "translate(" + labelposition.x + "," + labelposition.y + ")";
                    }
                    // ################################################### remove filter
                    //  avr - remove filter
                    // ###################################################
                    d.data.selected = false; // avr hack for large pie chart
                    if (that.options.oSearchFacetDialog) {
                        oEvent = {}; // build object to pass to external fn
                        oEvent.cnt = that.getNumberOfClickedSegments();
                        oEvent.dataObject = d.data;
                        that.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
                    } else {
                        that.model.removeFilterCondition(d.data.filterCondition, true);
                    }
                } else {
                    // click (non animated)
                    if (!that.options.multipleselectable) {
                        // single selection mode, check whether already any segment was clicked
                        if (Object.keys(that.clickedSegment).length > 0) {
                            // not blank
                            for (const key in that.clickedSegment) {
                                // existing segment goes back to origin
                                // simulate click event on it
                                // log.debug("clicking new segments : " + key + "value: " + that.clickedSegment[key]);
                                const clickedSegment = that.clickedSegment[key];
                                if (typeof clickedSegment.__onclick === "function") {
                                    clickedSegment.__data__.data.pieupdateuionly = true;
                                    clickedSegment.__onclick.apply(clickedSegment);
                                }
                                // delete existing segment from stack
                                delete that.clickedSegment[key];
                            }
                        }
                        if (Object.keys(that.clickedSegment).length < 1) {
                            that.clickedSegment[d.data.id] = this;
                        }
                    }

                    translateStr = PieChart.translateStr4Padding(
                        d.startAngle,
                        d.endAngle,
                        that.options.padding4click,
                        0,
                        0
                    );
                    if (labelElem) {
                        translateStrLabel = PieChart.translateStr4Padding(
                            d.startAngle,
                            d.endAngle,
                            that.options.padding4click,
                            labelposition.x,
                            labelposition.y
                        );
                    }
                    // ################################################### add filter
                    //   avr - add new filter
                    // ###################################################
                    d.data.selected = true; // avr hack for large pie chart
                    if (d.data.filterCondition) {
                        if (that.options.oSearchFacetDialog) {
                            oEvent = {}; // build object to pass to external fn
                            oEvent.cnt = that.getNumberOfClickedSegments();
                            oEvent.dataObject = d.data;
                            that.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
                        } else {
                            that.model.addFilterCondition(d.data.filterCondition, true);
                        }
                    }
                }
                SearchFacetPieChart.d3
                    .select(this)
                    .transition()
                    .duration(1000)
                    .ease(SearchFacetPieChart.d3.ease("elastic"))
                    .attr("transform", translateStr)
                    .style("stroke", (d) => {
                        let strokeColor;
                        if (d.data.stroke === "none") {
                            strokeColor = d.data.stroke;
                        } else if (d.data.selected) {
                            strokeColor = "#dadada";
                        } else {
                            strokeColor = "white";
                        }
                        return strokeColor;
                    })
                    .style("stroke-width", (d) => {
                        let strokeWidth;
                        if (d.data.selected) {
                            strokeWidth = that.options.strokewidthHover;
                        } else {
                            strokeWidth = that.options.strokewidth;
                        }
                        return strokeWidth;
                    })
                    .style("opacity", (d) => {
                        let opacityValue;
                        if (d.data.selected || d.data.hovered) {
                            opacityValue = "1";
                        } else if (d.data.initial) {
                            opacityValue = "0.75";
                        } else {
                            opacityValue = "0.5";
                        }
                        return opacityValue;
                    });
                // transform corresponding label
                const labelElement = that.getLabelElementtbyLabel(d.data.label);
                if (labelElement) {
                    SearchFacetPieChart.d3
                        .select(labelElement)
                        .transition()
                        .duration(1000)
                        .ease(SearchFacetPieChart.d3.ease("elastic"))
                        .attr("transform", translateStrLabel);
                }
            })
            .on("mouseover", function (d, i) {
                // no hover event for single selection mode when any segment already has been clicked
                if (!that.options.multipleselectable && Object.keys(that.clickedSegment).length > 0) {
                    return;
                }
                // no hover event for a clicked segment
                if (d.data.selected || d.data.hovered) {
                    return;
                }
                if (d.data.mouseover) {
                    const returnCode = d.data.mouseover(d, i);
                    if (!that.options.multipleselectable && !returnCode) {
                        return;
                    }
                }
            })
            .on("mouseout", function (d, i) {
                if (d.data.selected) {
                    SearchFacetPieChart.d3.select(this).style("opacity", 1);
                }
                // no hover event for single selection mode when any segment already has been clicked
                if (!that.options.multipleselectable && Object.keys(that.clickedSegment).length > 0) {
                    return;
                }
                // no hover event for a clicked segment
                if (d.data.selected) {
                    return;
                }
                if (d.data.mouseout) {
                    const returnCode = d.data.mouseout(d, i);
                    if (!that.options.multipleselectable && !returnCode) {
                        return;
                    }
                }
            })
            .attr("d", (d) => {
                const path = that.svgArcGen(d);
                return path(d);
            })
            .append("svg:title")
            .text((d) => {
                return "" + d.data.tooltip;
            });
        // ------------------------------------------------------------------
        // 3. update labels of arcs
        // ------------------------------------------------------------------
        // data binding
        sel = that.svgLabels.selectAll("g").data(arcs, PieChart.getIdOfArc);
        // remove
        if (!sel.exit().empty()) {
            sel.exit().remove();
        }
        // change existing labels + remove labels
        if (!sel.empty()) {
            sel.style("opacity", function (d) {
                if (d.removed || d.data.percentage < that.options.labelHideThreshold) {
                    return 0;
                }
                return 1;
            }).attr("transform", function (d) {
                let translateStr;
                let labelposition;
                if (this.childNodes[1] && this.childNodes[1].childNodes[0]) {
                    labelposition = new Labelposition(
                        that.options.width,
                        that.options.height,
                        d.startAngle,
                        d.endAngle,
                        that.options.outerRadius,
                        this.getBoundingClientRect().width,
                        this.getBoundingClientRect().height,
                        that.svgArcGen(d).centroid(d),
                        d.data.label,
                        that.svg
                    );
                    // log.debug("non animation change/remove existing labels, text exists: ", this.childNodes[1].childNodes[0].data);
                } else {
                    labelposition = new Labelposition(
                        that.options.width,
                        that.options.height,
                        d.startAngle,
                        d.endAngle,
                        that.options.outerRadius,
                        this.getBoundingClientRect().width,
                        this.getBoundingClientRect().height,
                        that.svgArcGen(d).centroid(d),
                        " ",
                        that.svg
                    );
                    // log.debug("non animation change/remove existing labels, no existing text ");
                }
                labelposition.update();
                // in case that label shall be cut
                if (labelposition.labelWidth < this.childNodes[1].getBoundingClientRect().width) {
                    that.adjustLabelWidth(this, labelposition.labelWidth);
                }
                // translate all texts that.options.padding4arcs in outer direction
                if (d.data.selected) {
                    translateStr = PieChart.translateStr4Padding(
                        d.startAngle,
                        d.endAngle,
                        that.options.padding4click,
                        labelposition.x,
                        labelposition.y
                    );
                } else {
                    translateStr = "translate(" + labelposition.x + "," + labelposition.y + ")";
                }
                return translateStr;
            });
        }
        if (!sel.enter().empty()) {
            // create new labels
            const textsG = sel.enter().append("svg:g").style("opacity", 0);
            textsG
                .append("svg:text")
                .attr("class", "labelshadow")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return "" + d.data.label;
                })
                .style("pointer-events", "none");
            textsG
                .append("svg:text")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return "" + d.data.label;
                })
                .style("pointer-events", "none");
            textsG
                .style("opacity", function (d) {
                    if (d.removed || d.data.percentage < that.options.labelHideThreshold) {
                        return 0;
                    }
                    return 1;
                })
                .attr("transform", function (d) {
                    let translateStr;
                    // log.debug("non animation new labels, text exists: ", this.childNodes[1].childNodes[0].data);
                    const labelposition = new Labelposition(
                        that.options.width,
                        that.options.height,
                        d.startAngle,
                        d.endAngle,
                        that.options.outerRadius,
                        this.getBoundingClientRect().width,
                        this.getBoundingClientRect().height,
                        that.svgArcGen(d).centroid(d),
                        d.data.label,
                        that.svg
                    );
                    labelposition.update();
                    // in case that label shall be cut
                    if (labelposition.labelWidth < this.childNodes[1].getBoundingClientRect().width) {
                        that.adjustLabelWidth(this, labelposition.labelWidth);
                    }
                    // translate all texts that.options.padding4arcs in outer direction
                    if (d.data.selected) {
                        translateStr = PieChart.translateStr4Padding(
                            d.startAngle,
                            d.endAngle,
                            that.options.padding4click,
                            labelposition.x,
                            labelposition.y
                        );
                    } else {
                        translateStr = "translate(" + labelposition.x + "," + labelposition.y + ")";
                    }
                    return translateStr;
                });
        }
        // save arcs for next update call (removed arcs are no longer needed)
        that.oldArcs = PieChart.removeDeletedArcs(arcs);
    }
    getNumberOfClickedSegments(): number {
        let cnt = 0;
        const ar = this.chartElements;
        for (let i = 0; i < ar.length; i++) {
            if (ar[i].selected === true) {
                cnt++;
            }
        }
        return cnt;
    }
    // cut label to target widthl
    // ======================================================================
    adjustLabelWidth(element, targetWidth) {
        const shadowElement = element.childNodes[0];
        const textElement = element.childNodes[1];
        // just remove all children when targetWidth is 0
        if (targetWidth <= 0) {
            shadowElement.childNodes[0].data = "";
            textElement.childNodes[0].data = "";
            return;
        }
        let textLength = shadowElement.childNodes[0].data.length;
        shadowElement.childNodes[0].data += "...";
        let tmpText = "";
        while (shadowElement.getBBox().width > targetWidth) {
            tmpText = shadowElement.childNodes[0].data;
            tmpText = tmpText.substr(0, textLength - 1) + tmpText.substr(textLength, 3);
            shadowElement.childNodes[0].data = tmpText;
            textLength--;
            if (textLength <= 0) {
                shadowElement.childNodes[0].data = "";
                break;
            }
        }
        textElement.childNodes[0].data = shadowElement.childNodes[0].data;
        // log.debug("label svg width:", shadowElement.getBBox().width, " label text: ", shadowElement.childNodes[0].data, " targetWidth: ", targetWidth, " original text: ", originalText, " originBoundingWidth: ", originBoundingWidth);
    }
    // get arcs with label
    // ======================================================================
    getArcsWithLabel(arcs): Array<any> {
        const arcsWithLabel = [];
        for (let i = 0; i < arcs.length; ++i) {
            const arc = arcs[i];
            if (arc.data.percentage > this.options.labelHideThreshold) {
                arcsWithLabel.push(arc);
            }
        }
        return arcsWithLabel;
    }
    // function for generating the svg:path of the d attribute from an arc
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    svgArcGen(...args: Array<any>) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const a = SearchFacetPieChart.d3.svg
            .arc()
            .innerRadius(function () {
                return that.options.innerRadius;
            })
            .outerRadius(function () {
                return that.options.outerRadius;
            })
            .startAngle((d) => {
                return d.startAngle;
            })
            .endAngle((d) => {
                return d.endAngle;
            });
        return a;
    }
    // get arc dom element by label
    // ======================================================================
    getArcElementtbyLabel(label) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let that = this; // ToDo, try to get rid of 'that' but take care, it is reassigned
        that.svgArcs.selectAll("g").each(function (data) {
            if (data.data.label === label) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                that = this;
            }
            return;
        });
        return that;
    }
    // get label element by label
    // ======================================================================
    getLabelElementtbyLabel(label): any {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let that = this; // ToDo, try to get rid of 'that' but take care, it is reassigned
        that.svgLabels.selectAll("g").each(function (data) {
            if (data.data.label === label) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                that = this;
            }
        });
        return that;
    }
    // helper: remove deleted arcs
    // ======================================================================
    static removeDeletedArcs(arcs) {
        const tmpArcs = [];
        for (let i = 0; i < arcs.length; ++i) {
            const arc = arcs[i];
            if (!arc.removed) {
                tmpArcs.push(arc);
            }
        }
        return tmpArcs;
    }
    // helper: create zero sized arc
    // ======================================================================
    static createZeroArc(angle, element) {
        return {
            startAngle: angle,
            endAngle: angle,
            data: element,
            removed: true,
        };
    }
    // helper: insert zero sized arc after insertIndex into arcs
    // ======================================================================
    insertAfter(arcs, insertIndex, arc) {
        let newArc;
        if (insertIndex >= 0) {
            const beforeArc = arcs[insertIndex];
            newArc = PieChart.createZeroArc(beforeArc.endAngle, arc.data);
        } else {
            newArc = PieChart.createZeroArc(0, arc.data);
        }
        newArc.oldArc = arc;
        arcs.splice(insertIndex + 1, 0, newArc);
    }
    // helper: get id of arc
    // ======================================================================
    static getIdOfArc(arc) {
        return arc.data.id;
    }
    // function for generating an arc from a element
    // ======================================================================
    static arcsGen = function () {
        return SearchFacetPieChart.d3.layout
            .pie()
            .value(function (d) {
                return d.value;
            })
            .sort(null);
    };
    // helper: get index of arc with given id in arcs
    // ======================================================================
    static getIndexById(arcs, id) {
        for (let i = 0; i < arcs.length; ++i) {
            const arc = arcs[i];
            if (PieChart.getIdOfArc(arc) === id) {
                return i;
            }
        }
        return null;
    }
    // helper: add new data (if any) to arcSequence before sort (only for IE)
    // ie sort has reverse order of parameter comparing to FF and Chrome
    // ======================================================================
    static add2arcSequence(data, arcSequence) {
        if (SearchFacetPieChart.isIE()) {
            const addNewData2Sequence = function (x) {
                arcSequence.getIndex(x.id);
            };
            data.forEach(addNewData2Sequence);
        }
        return data;
    }
    // helper: get translate string of a arc with giving padding
    // ======================================================================
    static translateStr4Padding(startAngle, endAngle, padding, xOldOrig, yOldOrig) {
        // cal origin of transformed coordinate system (in case startangle = 0)
        const apexAngle = endAngle - startAngle;
        let xNewOrig = padding * Math.sin(apexAngle / 2);
        let yNewOrig = -(padding * Math.cos(apexAngle / 2));
        // rotate it by startAngle
        const tmp = xNewOrig * Math.cos(startAngle) - yNewOrig * Math.sin(startAngle);
        yNewOrig = xNewOrig * Math.sin(startAngle) + yNewOrig * Math.cos(startAngle);
        xNewOrig = tmp;
        const translateStr = "translate(" + (xOldOrig + xNewOrig) + ", " + (yOldOrig + yNewOrig) + ")";
        return translateStr;
    }
    // generator: default arc calculation
    // ======================================================================
    generateDefaultArcCalculator(): DefaultArcCalculator {
        return new DefaultArcCalculator(this);
    }
    // calculate new arcs based on new data
    // ======================================================================
    calculateNewArcsOnly(data) {
        // sort data
        data = data.slice();
        // ie sort has reverse order of parameter comparing to FF and Chrome
        // new data has to be added (if any) to sequence at first, only necessary for IE
        PieChart.add2arcSequence(data, this.arcSequence);
        data.sort((a, b) => {
            return this.arcSequence.getIndex(a.id) - this.arcSequence.getIndex(b.id);
        });
        // calculate new arcs based on new data
        const newArcs = PieChart.arcsGen()(data);
        return newArcs;
    }
    // calculate new arcs based on old arcs + new data
    // ======================================================================
    calculateArcs(oldArcs, data) {
        const newArcs = PieChart.arcsGen()(data);
        // insert new elements with size 0 (startAngle=endAngle) into old arcs
        this.insertMissingArcs(oldArcs, newArcs, true);
        // insert removed elements with size 0 (startAngle=endAngle) into new arcs
        this.insertMissingArcs(newArcs, oldArcs, false);
        return newArcs;
    }
    // insert arcs included in arcs2 but not in arcs1 into arcs1
    // ======================================================================
    insertMissingArcs(arcs1, arcs2, ic) {
        let arc1InsertIndex = -1;
        for (let arc2Index = 0; arc2Index < arcs2.length; ++arc2Index) {
            const arc2 = arcs2[arc2Index];
            const arc1Index = PieChart.getIndexById(arcs1, arc2.data.id);
            let arc1;
            if (arc1Index !== null) {
                // --------------------------------------------------------
                // 1) there is a corresponding arc in arcs1
                // --------------------------------------------------------
                arc1 = arcs1[arc1Index];
                arc1.oldArc = arc2;
                arc1InsertIndex = arc1Index;
                continue;
            } else {
                // --------------------------------------------------------
                // 2) no corresponding arc in arcs1 -> create zero sized arc
                // --------------------------------------------------------
                if (ic) {
                    arc1InsertIndex = this.determineInsertIndex(arcs1, arc1InsertIndex, arcs2, arc2Index);
                }
                let newArc;
                if (arc1InsertIndex >= 0) {
                    const beforeArc = arcs1[arc1InsertIndex];
                    newArc = PieChart.createZeroArc(beforeArc.endAngle, arc2.data);
                } else {
                    newArc = PieChart.createZeroArc(0, arc2.data);
                }
                newArc.oldArc = arc2;
                arcs1.splice(arc1InsertIndex + 1, 0, newArc);
                arc1InsertIndex++;
            }
        }
    }
    // determination of insertion index
    // ======================================================================
    determineInsertIndex(arcs1, arc1InsertIndex, arcs2, arc2Index) {
        // determination is based on
        // (1) historical information (this.arcSequence)
        // (2) only arcs to be removed can be overtaken
        // initialization
        const arc2 = arcs2[arc2Index];
        const sequenceIndex = this.arcSequence.getIndex(arc2.data.id);
        let index;
        // determine index
        for (index = arc1InsertIndex + 1; index < arcs1.length; ++index) {
            const sequenceIndex2 = this.arcSequence.getIndex(arcs1[index].data.id);
            // exit condition based on historial information
            if (sequenceIndex2 > sequenceIndex) {
                break;
            }
            // exit condition: only arcs to be removed can be overtaken
            if (PieChart.getIndexById(arcs2, arcs1[index].data.id) !== null) {
                break;
            }
        }
        return index - 1;
    }
    // generator: historical arc calculation
    // ======================================================================
    static generateHistoricalArcCalculator(pieChart: PieChart, ...args: Array<any>): HistoricalArcCalculator {
        return new HistoricalArcCalculator(pieChart, args);
    }
}

/*** LABEL POSITIO ***/
// helper class for label positioning
// ======================================================================

class Labelposition {
    x: number;
    y: number;
    backgroundWidth: number;
    backgroundHeight: number;
    startAngle: number;
    endAngle: number;
    r: number; // radius
    labelPaddingX: number;
    labelPaddingY: number;
    radiusPadding: number;
    labelWidth: number;
    labelHeight: number;
    outsetMin: number;
    outsetMax: number;
    outsetStep: number;
    apexAngle: number;
    startLabelWidth: number;
    d3centroid: any;
    text: string;
    svgBackground: SvgBackground;
    translateStr: string;
    debug: boolean;

    constructor(
        backgroundWidth: number,
        backgroundHeight: number,
        startAngle: number,
        endAngle: number,
        r: number,
        labelWidth: number,
        labelHeight: number,
        d3centroid: any,
        text: string,
        svgBackground: SvgBackground
    ) {
        this.backgroundWidth = backgroundWidth;
        this.backgroundHeight = backgroundHeight;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.r = r;
        this.labelPaddingX = 3;
        this.labelPaddingY = 3;
        this.radiusPadding = 4.24;
        this.labelWidth = labelWidth + 2 * this.labelPaddingX;
        this.labelHeight = labelHeight;
        this.outsetMin = 0.3;
        this.outsetMax = 1.2;
        this.outsetStep = 0.025;
        this.apexAngle = endAngle - startAngle;
        this.startLabelWidth = this.labelWidth;
        this.d3centroid = d3centroid;
        this.text = text;
        this.svgBackground = svgBackground;
        this.debug = false;
        this.labelHeight = this.labelHeight + 2 * this.labelPaddingY;
        const xOrigin = Math.round(this.backgroundWidth / 2);
        const yOrigin = Math.round(this.backgroundHeight / 2);
        // translation to center
        this.translateStr = "translate(" + xOrigin + "," + yOrigin + ")";
    }
    update() {
        // log.debug("");
        // log.debug("**** new calculation with parameters start:", (this.startAngle * 360) / (2 * Math.PI), " size:", (this.apexAngle * 360) / (2 * Math.PI));
        // log.debug("**** Labelwidth:", this.labelWidth, " d3centroid:", this.d3centroid, " label text:", this.text);
        let outset = Math.max(
            this.outsetMin,
            ((Math.sin(this.apexAngle / 2) / (this.apexAngle / 2)) * 2) / 3
        ); // Outset for centroid (Schwerpunkt) of segment
        let placementSuccessful = true;
        let iterations = Math.max(100, this.labelWidth * 2, 1 / this.outsetStep);
        let optimizationDirection = 0;
        let c;
        do {
            placementSuccessful = true;
            c = this.calc(outset, this.labelWidth);
            if (outset > this.outsetMax || outset < this.outsetMin) {
                // log.debug("outset became too small or too large. END");
                break;
            }
            if (this.labelWidth < 0) {
                break;
            }
            // log.debug("outset", outset);
            let c1, c2, c1v, c2v;
            if (optimizationDirection === 0) {
                // direction not determined
                /// calculate new proposed solution
                c1 = this.calc(outset + this.outsetStep, this.labelWidth);
                c2 = this.calc(outset - this.outsetStep, this.labelWidth);
                /// value solutions
                c1v = this.value(c1, c);
                c2v = this.value(c2, c);
                // log.debug("           current ", " labelShortened", c.labelShortened, "labelWidth", c.labelWidth, "xSpace", c.xSpace, "asymmetry", c.asymmetry, " x:", c.centroidX, " y:", c.centroidY);
                // log.debug("           outset++", " labelShortened", c1.labelShortened, "labelWidth", c1.labelWidth, "xSpace", c1.xSpace, "asymmetry", c1.asymmetry, " value=>", c1v, " x:", c1.centroidX, " y:", c.centroidY);
                // log.debug("           outset--", " labelShortened", c2.labelShortened, "labelWidth", c2.labelWidth, "xSpace", c2.xSpace, "asymmetry", c2.asymmetry, "value=>", c2v, " x:", c2.centroidX, " y:", c.centroidY);
                if (c1v < c2v && c2v > 0.5) {
                    // further inwards is better
                    optimizationDirection = -1;
                    // log.debug("           -> going inwards");
                    outset += this.outsetStep * optimizationDirection;
                    placementSuccessful = false; // try again, we are not finished yet
                } else if (c1v > 0.5 || c.labelWidth <= 0) {
                    // outwards is better, or equal,   if text cannot be placed, try going outwards
                    optimizationDirection = 1;
                    // log.debug("           -> going outwards");
                    outset += this.outsetStep * optimizationDirection;
                    placementSuccessful = false;
                }
            } else {
                c1 = this.calc(outset + this.outsetStep * optimizationDirection, this.labelWidth);
                c1v = this.value(c1, c);
                // log.debug("           current ", " labelShortened", c.labelShortened, "labelWidth", c.labelWidth, "xSpace", c.xSpace, "asymmetry", c.asymmetry, " x:", c.centroidX, " y:", c.centroidY);
                // log.debug("           outset+-", "labelShortened", c1.labelShortened, "labelWidth", c1.labelWidth, "xSpace", c1.xSpace, "asymmetry", c1.asymmetry, " value=>", c1v, " x:", c1.centroidX, " y:", c.centroidY);
                if (c1v > 0.5 || c.labelWidth <= 0) {
                    outset += this.outsetStep * optimizationDirection;
                    placementSuccessful = false;
                }
            }
            iterations--;
        } while (!placementSuccessful && iterations > 0 && !isNaN(outset));
        c = this.calc(outset, this.labelWidth); // re-calculate just to draw debug lines correctly (otherwise they would be at the last tested position, not the final chosen)
        /// this is the new result
        this.labelWidth = c.labelWidth;
        const x = c.x;
        const y = c.y;
        /// drawing
        this.svgBackground.select("circle.centroid").remove();
        if (this.debug) {
            this.svgBackground
                .append("svg:circle")
                .attr("class", "centroid")
                .attr("cx", c.centroidX)
                .attr("cy", c.centroidY)
                .attr("r", 2)
                .style("fill", "blue");
        }
        this.svgBackground.selectAll("line.helper").remove();
        if (this.debug) {
            this.svgBackground
                .append("svg:line")
                .attr("class", "helper helper2")
                .attr("x1", -this.backgroundWidth / 2)
                .attr("x2", this.backgroundWidth / 2)
                .attr("y1", y - this.labelHeight / 2)
                .attr("y2", y - this.labelHeight / 2);
            this.svgBackground
                .append("svg:line")
                .attr("class", "helper helper2")
                .attr("x1", -this.backgroundWidth / 2)
                .attr("x2", this.backgroundWidth / 2)
                .attr("y1", y + this.labelHeight / 2)
                .attr("y2", y + this.labelHeight / 2);
            this.svgBackground
                .append("svg:line")
                .attr("class", "helper")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", Math.sin(this.startAngle) * (this.r + this.radiusPadding))
                .attr("y2", -Math.cos(this.startAngle) * (this.r + this.radiusPadding));
            this.svgBackground
                .append("svg:line")
                .attr("class", "helper")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", Math.sin(this.endAngle) * (this.r + this.radiusPadding))
                .attr("y2", -Math.cos(this.endAngle) * (this.r + this.radiusPadding));
            this.svgBackground
                .append("svg:line")
                .attr("class", "helper")
                .attr("x1", Math.sin(this.startAngle) * (this.r + this.radiusPadding))
                .attr("y1", -Math.cos(this.startAngle) * (this.r + this.radiusPadding))
                .attr("x2", this.isStartAngleOnRight() ? this.backgroundWidth / 2 : -this.backgroundWidth / 2)
                .attr("y2", -Math.cos(this.startAngle) * (this.r + this.radiusPadding));
            this.svgBackground
                .append("svg:line")
                .attr("class", "helper")
                .attr("x1", Math.sin(this.endAngle) * (this.r + this.radiusPadding))
                .attr("y1", -Math.cos(this.endAngle) * (this.r + this.radiusPadding))
                .attr("x2", this.isEndAngleOnRight() ? this.backgroundWidth / 2 : -this.backgroundWidth / 2)
                .attr("y2", -Math.cos(this.endAngle) * (this.r + this.radiusPadding));
        }
        if (this.labelWidth < 2 * this.labelPaddingX) {
            // label too short, it makes no sense to draw
            this.labelWidth = 0; //this.startLabelWidth;
        } else if (this.labelWidth < this.startLabelWidth) {
            // label truncated;
            this.labelWidth = this.labelWidth - 2 * this.labelPaddingX;
        }
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(x) ? 0 : y;
        // log.debug("=======final x:" + this.x + " y:" + this.y + " labelwidth:" + this.labelWidth);
    }
    calc(outset: number, labelWidth: number) {
        let centroidX, centroidY, leftBorder, rightBorder, perimeterRightBorder, perimeterLeftBorder;
        /// full circle?
        if (this.startAngle - this.endAngle + 2 * Math.PI < 1e-9) {
            centroidX = 0;
            centroidY = 0;
            rightBorder = this.backgroundWidth / 2;
            leftBorder = -this.backgroundWidth / 2;
            perimeterLeftBorder = -this.r;
            perimeterRightBorder = this.r;
            // log.debug("full circle -> placement at 0,0 regardless of outset");
        } else {
            // Calculate Centroid
            centroidX = Math.sin(this.apexAngle / 2) * this.r * outset; // calculation as if this.startAngle was 0
            centroidY = Math.cos(this.apexAngle / 2) * -this.r * outset;
            const tmp = centroidX * Math.cos(this.startAngle) - centroidY * Math.sin(this.startAngle); //rotate by this.startAngle
            centroidY = centroidX * Math.sin(this.startAngle) + centroidY * Math.cos(this.startAngle); //rotate by this.startAngle
            centroidX = tmp;
            // log.debug("======Schwerpunkt x:" + centroidX + " y:" + centroidY);
            const upperLabelBorder = centroidY - this.labelHeight / 2;
            const lowerLabelBorder = centroidY + this.labelHeight / 2;
            leftBorder = Math.max(
                this.calcLeftBorder(centroidX, upperLabelBorder),
                this.calcLeftBorder(centroidX, lowerLabelBorder),
                -this.backgroundWidth / 2
            );
            if (
                Math.abs(this.startAngle - (this.endAngle % (2 * Math.PI))) > 1e-9 &&
                centroidX > 0 &&
                upperLabelBorder <= 0 &&
                lowerLabelBorder >= 0
            ) {
                // label at "mouth of Pacman" (<
                leftBorder = Math.max(leftBorder, 0);
            }
            // see if height fits
            if (!this.doesFitHeight(leftBorder, upperLabelBorder, lowerLabelBorder, centroidX < 0, true)) {
                leftBorder = this.backgroundWidth / 2;
            }
            rightBorder = Math.min(
                this.calcRightBorder(centroidX, upperLabelBorder),
                this.calcRightBorder(centroidX, lowerLabelBorder),

                this.backgroundWidth / 2
            );
            if (
                Math.abs(this.startAngle - (this.endAngle % (2 * Math.PI))) > 1e-9 &&
                centroidX < 0 &&
                upperLabelBorder <= 0 &&
                lowerLabelBorder >= 0
            ) {
                // Pacman
                rightBorder = Math.min(rightBorder, 0);
            }
            // see if height fits
            if (!this.doesFitHeight(rightBorder, upperLabelBorder, lowerLabelBorder, centroidX < 0, false)) {
                rightBorder = -this.backgroundWidth / 2;
            }
            let perimeterUpperRightBorder = this.calcPerimeterBorder(1, centroidY - this.labelHeight / 2);
            if (perimeterUpperRightBorder < centroidX) {
                perimeterUpperRightBorder = this.backgroundWidth / 2;
            }
            let perimeterLowerRightBorder = this.calcPerimeterBorder(1, centroidY + this.labelHeight / 2);
            if (perimeterLowerRightBorder < centroidX) {
                perimeterLowerRightBorder = this.backgroundWidth / 2;
            }
            perimeterRightBorder = Math.min(
                perimeterUpperRightBorder,
                perimeterLowerRightBorder,
                rightBorder
            );
            let perimeterUpperLeftBorder = this.calcPerimeterBorder(-1, centroidY - this.labelHeight / 2);
            if (perimeterUpperLeftBorder > centroidX) {
                perimeterUpperLeftBorder = -this.backgroundWidth / 2;
            }
            let perimeterLowerLeftBorder = this.calcPerimeterBorder(-1, centroidY + this.labelHeight / 2);
            if (perimeterLowerLeftBorder > centroidX) {
                perimeterLowerLeftBorder = -this.backgroundWidth / 2;
            }
            perimeterLeftBorder = Math.max(perimeterUpperLeftBorder, perimeterLowerLeftBorder, leftBorder);
            if (isNaN(perimeterRightBorder)) {
                perimeterRightBorder = rightBorder;
            }
            if (isNaN(perimeterLeftBorder)) {
                perimeterLeftBorder = leftBorder;
            }
        }
        /// debug drawing
        this.svgBackground.select("line.left").remove();
        this.svgBackground.select("line.right").remove();
        this.svgBackground.select("line.perimeterLeft").remove();
        this.svgBackground.select("line.perimeterRight").remove();
        if (this.debug) {
            this.svgBackground
                .append("svg:line")
                .attr("class", "left")
                .attr("y1", -this.backgroundHeight / 2)
                .attr("y2", this.backgroundHeight / 2)
                .attr("x1", leftBorder)
                .attr("x2", leftBorder);
            this.svgBackground
                .append("svg:line")
                .attr("class", "right")
                .attr("y1", -this.backgroundHeight / 2)
                .attr("y2", this.backgroundHeight / 2)
                .attr("x1", rightBorder)
                .attr("x2", rightBorder);
            this.svgBackground
                .append("svg:line")
                .attr("class", "perimeterLeft")
                .attr("y1", -this.backgroundHeight / 2)
                .attr("y2", this.backgroundHeight / 2)
                .attr("x1", perimeterLeftBorder)
                .attr("x2", perimeterLeftBorder);
            this.svgBackground
                .append("svg:line")
                .attr("class", "perimeterRight")
                .attr("y1", -this.backgroundHeight / 2)
                .attr("y2", this.backgroundHeight / 2)
                .attr("x1", perimeterRightBorder)
                .attr("x2", perimeterRightBorder);
        }
        const oldLabelWidth = labelWidth;
        labelWidth = Math.min(labelWidth, Math.floor(rightBorder - leftBorder));
        // calculate x
        let x = centroidX;
        x = Math.max(x, perimeterLeftBorder + labelWidth / 2);
        x = Math.min(x, perimeterRightBorder - labelWidth / 2);
        if (
            x - labelWidth / 2 < perimeterLeftBorder - 1e-9 ||
            x + labelWidth / 2 > perimeterRightBorder + 1e-9
        ) {
            // centered
            x = (perimeterLeftBorder + perimeterRightBorder) / 2;
        }
        if (centroidX >= 0) {
            x = Math.max(x, leftBorder + labelWidth / 2);
            x = Math.min(x, rightBorder - labelWidth / 2);
        } else {
            x = Math.min(x, rightBorder - labelWidth / 2);
            x = Math.max(x, leftBorder - labelWidth / 2);
        }
        // calculate y
        const y = centroidY;
        // return coordinates and parameters of the placement
        return {
            x: x,
            y: y,
            labelWidth: labelWidth,
            labelShortened: labelWidth !== oldLabelWidth,
            xSpace: rightBorder - leftBorder,
            centroidX: centroidX,
            centroidY: centroidY,
            asymmetry: Math.abs(x - centroidX),
        };
    }
    /// value function - how good is the new proposed solution compared to the current?
    value(cNew, cOld) {
        if (cNew.labelWidth < 0) {
            return -10000;
        }
        if (cNew.labelWidth < cOld.labelWidth) {
            return -100;
        }
        if (cNew.labelWidth > cOld.labelWidth) {
            return (cNew.labelWidth - cOld.labelWidth) * 1000;
        }
        if (cOld.labelShortened && cNew.labelWidth === cOld.labelWidth) {
            return (cNew.xSpace - cOld.xSpace) * 100;
        }
        return 0;
    }
    doesFitHeight(border, upper, lower, isLeftLabel, isLeftBorder) {
        let y1 = -Math.cos(this.startAngle) * (this.r + this.radiusPadding);
        let y2 = -Math.cos(this.endAngle) * (this.r + this.radiusPadding);
        if (Math.abs(this.startAngle - (this.endAngle % (2 * Math.PI))) < 1e-9) {
            y1 = -this.backgroundHeight / 2;
            y2 = this.backgroundHeight / 2;
        } else if (border === 0) {
            // for "Pacman" slices (<  >)
            y1 = -this.backgroundHeight / 2;
            y2 = this.backgroundHeight / 2;
        } else if (border > 0) {
            if (!this.isStartAngleOnRight()) {
                y1 = -this.backgroundHeight / 2;
            } else if (border <= Math.sin(this.startAngle) * (this.r + this.radiusPadding)) {
                // intersection of edge with this.startAngle at radiale (or horizontal part)?
                y1 = border / -Math.tan(this.startAngle);
            }
            if (!this.isEndAngleOnRight()) {
                y2 = this.backgroundHeight / 2;
            } else if (border <= Math.sin(this.endAngle) * (this.r + this.radiusPadding)) {
                // intersection of edge with this.startAngle at radiale (or horizontal part)?
                y2 = border / -Math.tan(this.endAngle);
            }
            if (isLeftLabel && !isLeftBorder && y1 >= lower) {
                y1 = -this.backgroundHeight / 2;
            }
            if (isLeftLabel && !isLeftBorder && y2 <= upper) {
                y2 = this.backgroundHeight / 2;
            }
        } else {
            if (this.isStartAngleOnRight()) {
                y1 = this.backgroundHeight / 2;
            } else if (border > Math.sin(this.startAngle) * (this.r + this.radiusPadding)) {
                // intersection of edge with this.startAngle at radiale (or horizontal part)?
                y1 = border / -Math.tan(this.startAngle);
            }
            if (this.isEndAngleOnRight()) {
                y2 = -this.backgroundHeight / 2;
            } else if (border > Math.sin(this.endAngle) * (this.r + this.radiusPadding)) {
                // intersection of edge with this.startAngle at radiale (or horizontal part)?
                y2 = border / -Math.tan(this.endAngle);
            }
            if (!isLeftLabel && isLeftBorder && y2 >= lower) {
                y2 = -this.backgroundHeight / 2;
            }
            if (!isLeftLabel && isLeftBorder && y1 <= upper) {
                y1 = this.backgroundHeight / 2;
            }
        }
        /// debug drawing
        if (!isLeftBorder) {
            this.svgBackground.selectAll(".rightBorder").remove();
            if (this.debug) {
                this.svgBackground
                    .append("svg:rect")
                    .attr("class", "rightBorder")
                    .attr("x", border - 3)
                    .attr("y", y1 - 3)
                    .attr("width", 6)
                    .attr("height", 6)
                    .style("fill", "green");
                this.svgBackground
                    .append("svg:circle")
                    .attr("class", "rightBorder")
                    .attr("cx", border)
                    .attr("cy", y2)
                    .attr("this.r", 3)
                    .style("fill", "green");
            }
        } else {
            this.svgBackground.selectAll(".leftBorder").remove();
            if (this.debug) {
                this.svgBackground
                    .append("svg:rect")
                    .attr("class", "leftBorder")
                    .attr("x", border - 3)
                    .attr("y", y1 - 3)
                    .attr("width", 6)
                    .attr("height", 6)
                    .style("fill", "red");
                this.svgBackground
                    .append("svg:circle")
                    .attr("class", "leftBorder")
                    .attr("cx", border)
                    .attr("cy", y2)
                    .attr("this.r", 3)
                    .style("fill", "red");
            }
        }
        /// does the text fit the height?
        return upper >= Math.min(y1, y2) - 1e-9 && lower <= Math.max(y1, y2) + 1e-9;
    }
    ///// calculate left border
    calcLeftBorder(x, y) {
        let border = -this.backgroundWidth / 2;
        if (Math.abs(this.startAngle - (this.endAngle % (2 * Math.PI))) < 1e-9) {
            return border;
        }
        if (y <= 0) {
            // upper half
            if (y > -Math.cos(this.startAngle) * (this.r + this.radiusPadding)) {
                // intersection with edge, this.startAngle at radial (or horizontal part)?
                border = Math.tan(this.startAngle) * -y;
            }
        } else if (y < -Math.cos(this.endAngle) * (this.r + this.radiusPadding)) {
            border = Math.tan(this.endAngle) * -y;
        }
        return border;
    }
    ///// calculate right border
    calcRightBorder(x, y) {
        let border = this.backgroundWidth / 2;
        if (Math.abs(this.startAngle - (this.endAngle % (2 * Math.PI))) < 1e-9) {
            return border;
        }
        if (y >= 0) {
            // lower half
            if (-y > Math.cos(this.startAngle) * (this.r + this.radiusPadding)) {
                // intersection with edge, this.endAngle at radial (or horizontal part)?
                border = Math.tan(this.startAngle) * -y;
            }
        } else if (-y < Math.cos(this.endAngle) * (this.r + this.radiusPadding)) {
            border = Math.tan(this.endAngle) * -y;
        }
        return border;
    }
    // calculate Perimeter Border
    calcPerimeterBorder(x, y) {
        let border = x > 0 ? this.backgroundWidth / 2 : -this.backgroundWidth / 2;
        border = Math.sqrt(this.r * this.r - y * y);
        if (x < 0) {
            border *= -1;
        }
        return border;
    }
    // check wether this.startAngle on right side
    isStartAngleOnRight() {
        return this.startAngle > 0 && this.startAngle <= ((2 * Math.PI) / 360) * 180;
    }
    // check wether this.endAngle on right side
    isEndAngleOnRight() {
        return this.endAngle % (2 * Math.PI) < ((2 * Math.PI) / 360) * 180;
    }
}

/*** ARC CALCULATOR ***/
class Sequence {
    maxIndex: number;
    objectMap: any;
    constructor(...args: Array<any>) {
        this.init(args);
    }
    //  helper class for storing objects in order
    //  ======================================================================
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    init(...args: Array<any>) {
        this.maxIndex = 0;
        this.objectMap = {};
    }
    // get index of object if it exists in map, otherwise add it to map and return newly created index
    // actually this is also an add function
    getIndex(object) {
        let index = this.objectMap[object];
        if (typeof index !== "undefined") {
            return index;
        }
        index = this.maxIndex;
        this.maxIndex++;
        this.objectMap[object] = index;
        return index;
    }
}
class HistoricalArcCalculator {
    private _pieChart: PieChart;
    constructor(pieChart: PieChart, ...args: Array<any>) {
        this._pieChart = pieChart;
        this.init(pieChart, args);
    }
    init(pieChart: PieChart, ...args: Array<any>) {
        pieChart.arcSequence = new Sequence(args);
    }
    // calculate new arcs based on new data
    // ======================================================================
    calculateNewArcsOnly(data) {
        // sort data
        data = data.slice();
        // ie sort has reverse order of parameter comparing to FF and Chrome
        // new data has to be added (if any) to sequence at first, only necessary for IE
        PieChart.add2arcSequence(data, this._pieChart.arcSequence);
        // calculate new arcs based on new data
        const newArcs = PieChart.arcsGen()(data);
        return newArcs;
    }
    // calculate new arcs based on old arcs + new data
    // ======================================================================
    calculateArcs(oldArcs, data) {
        // sort data
        data = data.slice();
        // ie sort has reverse order of parameter comparing to FF and Chrome
        // new data has to be added (if any) to sequence at first, only necessary for IE
        PieChart.add2arcSequence(data, this._pieChart.arcSequence);
        data.sort(function (a, b) {
            return this._pieChart.arcSequence.getIndex(a.id) - this._pieChart.arcSequence.getIndex(b.id);
        });
        // calculate new arcs based on new data
        const newArcs = PieChart.arcsGen()(data);
        // insert new elements with size 0 (startAngle=endAngle) into old arcs
        this.insertMissingArcs(oldArcs, newArcs);
        // insert removed elements with size 0 (startAngle=endAngle) into new arcs
        this.insertMissingArcs(newArcs, oldArcs);
        return newArcs;
    }
    // insert arcs included in arcs2 but not in arcs1 into arcs1
    // ======================================================================
    insertMissingArcs(arcs1, arcs2) {
        let arc1Index = 0;
        for (let arc2Index = 0; arc2Index < arcs2.length; ++arc2Index) {
            const arc2 = arcs2[arc2Index];
            const arc2SortIndex = this._pieChart.arcSequence.getIndex(arc2.data.id);
            let arc1;
            let found = false;
            for (; arc1Index < arcs1.length; ++arc1Index) {
                arc1 = arcs1[arc1Index];
                const arc1SortIndex = this._pieChart.arcSequence.getIndex(arc1.data.id);
                if (arc1SortIndex === arc2SortIndex) {
                    found = true;
                    break;
                }
                if (arc1SortIndex > arc2SortIndex) {
                    break;
                }
            }
            if (found) {
                arc1.oldArc = arc2;
            } else {
                let newArc;
                if (arc1Index - 1 >= 0 && arc1Index - 1 < arcs1.length) {
                    const beforeArc = arcs1[arc1Index - 1];
                    newArc = PieChart.createZeroArc(beforeArc.endAngle, arc2.data);
                } else {
                    newArc = PieChart.createZeroArc(0, arc2.data);
                }
                arcs1.splice(arc1Index, 0, newArc);
                newArc.oldArc = arc2;
            }
            arc1Index++;
        }
    }
}
class DefaultArcCalculator {
    constructor(pieChart: PieChart, ...args: Array<any>) {
        this.init(pieChart, args);
    }
    init(pieChart: PieChart, ...args: Array<any>) {
        pieChart.arcSequence = new Sequence(args);
    }
}
