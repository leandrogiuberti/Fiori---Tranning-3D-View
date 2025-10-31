declare module "sap/cux/home/utils/DataFormatUtils" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import { ValueColor } from "sap/m/library";
    import DateFormat from "sap/ui/core/format/DateFormat";
    import { IVisualization } from "sap/cux/home/interface/AppsInterface";
    import { TaskPriority } from "sap/cux/home/utils/TaskUtils";
    const oRelativeDateTimeFormatter: DateFormat;
    const oRelativeDateFormatter: DateFormat;
    function toPriority(oTask: {
        criticality: ValueColor;
    }): 1 | 2 | 3 | 99;
    function toTaskPriorityText(sPriority: TaskPriority): "veryHighPriority" | "highPriority" | "mediumPriority" | "lowPriority" | "nonePriority";
    /**
     * Formats a given date as a relative date and time string.
     *
     * @param {Date} oDate - The input date to format as a relative date and time string.
     * @returns {string} A string representing the input date in a relative date and time format.
     */
    function toRelativeDateTime(oDate: Date): string;
    /**
     * Converts a given date to a relative date string.
     *
     * @param {Date} iTimeStamp - The input timestamp to convert to a relative date string.
     * @returns {string} A relative date string with the first letter capitalized.
     */
    function toRelativeDate(iTimeStamp: Date): string;
    function createBookMarkData(oBookMark: IVisualization): BookmarkParameters;
    function getImportance(oDataField: unknown): number;
    function sortCollectionByImportance(aCollection: Array<unknown>): unknown[];
    function getLeanURL(targetURL: string): string;
    /**
     * Destroys the element if it already exist with given ID
     *
     * @private
     * @param {string} id - ID of the element.
     */
    function recycleId(id: string): string;
}
//# sourceMappingURL=DataFormatUtils.d.ts.map