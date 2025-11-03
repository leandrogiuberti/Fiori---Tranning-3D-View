declare module "sap/cux/home/utils/PerformanceUtils" {
    import BaseContainer from "sap/cux/home/BaseContainer";
    import Layout from "sap/cux/home/Layout";
    type ElementInfo = {
        name: keyof typeof UIElements;
        startMarked: boolean;
        endMarked: boolean;
        control?: Layout | BaseContainer;
    };
    const layoutElement = "sap.cux.home.Layout";
    const homePageLoadStartMarker = "FLP-TTI-Homepage-Custom-Start";
    const homePageLoadEndMarker = "FLP-TTI-Homepage-Custom";
    let setupTracking: boolean;
    /**
     * An object representing the UI elements and their corresponding marker names.
     *
     */
    const UIElements: {
        "sap.cux.home.AppsContainer": string;
        "sap.cux.home.InsightsContainer": string;
        "sap.cux.home.NewsAndPagesContainer": string;
        "sap.cux.home.ToDosContainer": string;
        "sap.cux.home.Layout": string;
    };
    let availableElements: ElementInfo[];
    /**
     * Checks if the current application is the home app.
     *
     * @returns {Promise<boolean>} - A promise that resolves to true if the current application is the home app, otherwise false.
     */
    function isHomeApp(): Promise<boolean>;
    /**
     * Records the start of the homepage load.
     *
     * @returns {Promise<void>} - A promise that resolves when the start of the homepage load is recorded.
     */
    function markHomePageStart(): Promise<void>;
    /**
     * Records the end of the homepage load.
     *
     * @returns {Promise<void>} - A promise that resolves when the end of the homepage load is recorded.
     */
    function markHomePageEnd(): Promise<void>;
    /**
     * Finds the UI element information by container name.
     *
     * @param {keyof typeof UIElements} containerName - The name of the container.
     * @returns {ElementInfo | undefined} - The element information if found, otherwise undefined.
     */
    function findUIElement(containerName: keyof typeof UIElements): ElementInfo | undefined;
    /**
     * Sets a performance mark with the given name.
     *
     * @param {string} markName - The name of the performance mark.
     */
    function setPerformanceMark(markName: string): void;
    /**
     * Records the load of an element.
     *
     * @param {keyof typeof UIElements} containerName - The name of the container.
     * @param {string} [customMarkName] - The custom mark name.
     * @param {boolean} [isStartMaker] - Indicates if it is a start marker.
     */
    function recordElementLoad(containerName: keyof typeof UIElements, customMarkName?: string, isStartMaker?: boolean): void;
    /**
     * Sets up performance tracking for the given layout.
     *
     * @param {Layout} layout - The layout object containing the UI elements.
     */
    function setupPerformanceTracking(layout: Layout): Promise<void>;
    /**
     * Records the start of the element load.
     *
     * @param {keyof typeof UIElements} containerName - The name of the container.
     * @param {string} [customMarkName] - The custom mark name.
     */
    function recordElementLoadStart(containerName: keyof typeof UIElements, customMarkName?: string): void;
    /**
     * Records the end of the element load.
     *
     * @param {keyof typeof UIElements} containerName - The name of the container.
     * @param {string} [customMarkName] - The custom mark name.
     */
    function recordElementLoadEnd(containerName: keyof typeof UIElements, customMarkName?: string): void;
}
//# sourceMappingURL=PerformanceUtils.d.ts.map