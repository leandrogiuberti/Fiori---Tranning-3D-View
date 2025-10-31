declare module "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetPieChart" {
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import RenderManager from "sap/ui/core/RenderManager";
    import Dialog from "sap/m/Dialog";
    interface $PieChartSettings extends $ControlSettings {
        "dimension-pie": string;
        backgroundWidth: number;
        backgroundHeight: number;
        width: number;
        height: number;
        innerRadius: number;
        outerRadius: number;
        tweenGen: () => void;
        tweenGenText: () => void;
        arcCalculator: HistoricalArcCalculator | DefaultArcCalculator | HistoricalArcCalculator;
        animationduration: number;
        labelHideThreshold: number;
        easing: string;
        pieChartClass: string;
        pieChartParentClass: string;
        color: string;
        strokewidth: number;
        strokewidthHover: number;
        padding4click: number;
        multipleselectable: boolean;
        oSearchFacetDialog: Dialog;
    }
    interface PieChartItem {
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
        fill?: string;
        stroke?: string;
        maxLabelLength?: number;
    }
    type svgAttr = (property: string, value: any) => {
        attr: svgAttr;
        style: svgStyle;
    };
    type svgStyle = (property: string, value: any) => void;
    type svgSelect = (selector: string) => {
        remove: () => void;
    };
    type svgSelectAll = (selector: string) => {
        remove: () => void;
    };
    type svgAppend = (selector: string) => {
        attr: svgAttr;
        remove: () => void;
    };
    interface SvgBackground {
        select: svgSelect;
        selectAll: svgSelect;
        append: svgAppend;
    }
    type PieChartItems = Array<PieChartItem>;
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetPieChart extends Control {
        static readonly metadata: {
            properties: {
                oSearchFacetDialog: {
                    type: string;
                };
            };
            aggregations: {
                items: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        static d3: any;
        private PieChart;
        private chartElements;
        private iMissingCnt;
        constructor(sId?: string, settings?: Partial<$PieChartSettings>);
        static isIE(): boolean;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchFacetPieChart): void;
        };
        getFacetIndex(): number;
        getFacetIndexByIdForLargePieChart(chartId: string): number;
        getPieChartIndexByFacetIndex(facetIndex: number): number;
        getSumSelected(data: any): number;
        getDataForPieChart(data: any, model: any, facetIndex: number): Array<PieChartItems>;
        getDataForPieChartLarge(facetItems: any, model: any, facetTotalCount: number, maxItemsToShow: number): PieChartItems;
        directUpdate(facetItems: any, piechartParent: any, model: any, facetTotalCount: number, options: any): void;
        isFacetPanel(): boolean;
        onAfterRendering(): void;
    }
    /*** PIE CHART ***/
    class PieChart {
        application: any;
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
        constructor(parentSelector: any, settings: $PieChartSettings, application: any, model: SearchModel);
        init(parentSelector: any, settings: $PieChartSettings, application: any, model: SearchModel): void;
        getParent(): string;
        static Tweens: {
            tweenGenSimple: any;
            tweenGenSimpleText: any;
            translateStr4Padding: any;
            tweenGenEcstasy: any;
            tweenGenLSD: any;
        };
        createAttributeService(cls: any, attribute: any, initFunction?: () => void): void;
        initTween(): void;
        update(data: any): void;
        notAnimatedUpdate(data: any): void;
        getNumberOfClickedSegments(): number;
        adjustLabelWidth(element: any, targetWidth: any): void;
        getArcsWithLabel(arcs: any): Array<any>;
        svgArcGen(...args: Array<any>): any;
        getArcElementtbyLabel(label: any): this;
        getLabelElementtbyLabel(label: any): any;
        static removeDeletedArcs(arcs: any): any[];
        static createZeroArc(angle: any, element: any): {
            startAngle: any;
            endAngle: any;
            data: any;
            removed: boolean;
        };
        insertAfter(arcs: any, insertIndex: any, arc: any): void;
        static getIdOfArc(arc: any): any;
        static arcsGen: () => any;
        static getIndexById(arcs: any, id: any): number;
        static add2arcSequence(data: any, arcSequence: any): any;
        static translateStr4Padding(startAngle: any, endAngle: any, padding: any, xOldOrig: any, yOldOrig: any): string;
        generateDefaultArcCalculator(): DefaultArcCalculator;
        calculateNewArcsOnly(data: any): any;
        calculateArcs(oldArcs: any, data: any): any;
        insertMissingArcs(arcs1: any, arcs2: any, ic: any): void;
        determineInsertIndex(arcs1: any, arc1InsertIndex: any, arcs2: any, arc2Index: any): number;
        static generateHistoricalArcCalculator(pieChart: PieChart, ...args: Array<any>): HistoricalArcCalculator;
    }
    /*** LABEL POSITIO ***/
    class Labelposition {
        x: number;
        y: number;
        backgroundWidth: number;
        backgroundHeight: number;
        startAngle: number;
        endAngle: number;
        r: number;
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
        constructor(backgroundWidth: number, backgroundHeight: number, startAngle: number, endAngle: number, r: number, labelWidth: number, labelHeight: number, d3centroid: any, text: string, svgBackground: SvgBackground);
        update(): void;
        calc(outset: number, labelWidth: number): {
            x: any;
            y: any;
            labelWidth: number;
            labelShortened: boolean;
            xSpace: number;
            centroidX: any;
            centroidY: any;
            asymmetry: number;
        };
        value(cNew: any, cOld: any): number;
        doesFitHeight(border: any, upper: any, lower: any, isLeftLabel: any, isLeftBorder: any): boolean;
        calcLeftBorder(x: any, y: any): number;
        calcRightBorder(x: any, y: any): number;
        calcPerimeterBorder(x: any, y: any): number;
        isStartAngleOnRight(): boolean;
        isEndAngleOnRight(): boolean;
    }
    /*** ARC CALCULATOR ***/
    class Sequence {
        maxIndex: number;
        objectMap: any;
        constructor(...args: Array<any>);
        init(...args: Array<any>): void;
        getIndex(object: any): any;
    }
    class HistoricalArcCalculator {
        private _pieChart;
        constructor(pieChart: PieChart, ...args: Array<any>);
        init(pieChart: PieChart, ...args: Array<any>): void;
        calculateNewArcsOnly(data: any): any;
        calculateArcs(oldArcs: any, data: any): any;
        insertMissingArcs(arcs1: any, arcs2: any): void;
    }
    class DefaultArcCalculator {
        constructor(pieChart: PieChart, ...args: Array<any>);
        init(pieChart: PieChart, ...args: Array<any>): void;
    }
}
//# sourceMappingURL=SearchFacetPieChart.d.ts.map