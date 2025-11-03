declare module "sap/cux/home/utils/CommonUtils" {
    import BasePanel from "sap/cux/home/BasePanel";
    import { ICustomVisualization, ISectionAndVisualization } from "sap/cux/home/interface/AppsInterface";
    import PageManager from "sap/cux/home/utils/PageManager";
    function isURLParamEnabled(paramName: string): boolean;
    function getPageManagerInstance(control: BasePanel): PageManager;
    /**
     * Filters visualizations by removing static tiles (count or Smart Business tiles) unless dynamic tiles are requested.
     *
     * @param {ISectionAndVisualization[]} visualizations - The array of visualizations to filter.
     * @param {boolean} [filterDynamicTiles=false] - If true, only dynamic tiles are included; otherwise, static tiles are included.
     * @returns {ISectionAndVisualization[]} The filtered array of visualizations.
     */
    function filterVisualizations(visualizations: ISectionAndVisualization[], filterDynamicTiles?: boolean): (ISectionAndVisualization | ICustomVisualization)[];
}
//# sourceMappingURL=CommonUtils.d.ts.map