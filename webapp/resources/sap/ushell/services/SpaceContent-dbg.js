// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview APIs for the S/4 MyHome
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/base/util/deepClone",
    "sap/ushell/library",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils/WindowUtils",
    "sap/base/Log",
    "sap/ushell/EventHub",
    "sap/ushell/Container"
], (
    Config,
    deepClone,
    ushellLibrary,
    hasher,
    WindowUtils,
    Log,
    EventHub,
    Container
) => {
    "use strict";

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    /**
     * @alias sap.ushell.services.SpaceContent
     * @class
     * @classdesc This service provides APIs for the S/4 MyHome.
     * For FLP internal usage, the internal APIs should be used directly.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const SpaceContent = await Container.getServiceAsync("SpaceContent");
     *     // do something with the SpaceContent service
     *   });
     * </pre>
     *
     * @hideconstructor
     *
     * @since 1.103.0
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    function SpaceContent () { }

    /**
     * Returns the personalization enabled flag
     *
     * @returns {boolean} Whether personalization enabled
     * @since 1.106.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.isPersonalizationEnabled = function () {
        return Config.last("/core/shell/enablePersonalization");
    };

    /**
     * Returns the data of a page
     *
     * @param {string} pageId ID of the page
     * @returns {Promise<sap.ushell.services.Pages.PageData>} Promise that resolves with the page data
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.getPage = async function (pageId) {
        const oPagesService = await Container.getServiceAsync("Pages");
        const sPagePath = await oPagesService.loadPage(pageId);

        // clone the data to keep the caller from changing the original object
        return deepClone(oPagesService.getModel().getProperty(sPagePath), 20);
    };

    /**
     * Returns the data of multiple pages
     *
     * @param {string[]} pageIds IDs of the pages
     * @returns {Promise<sap.ushell.services.Pages.PageData[]>} Promise that resolves with the page data
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.getPages = async function (pageIds) {
        const oPagesService = await Container.getServiceAsync("Pages");
        const oPagePaths = await oPagesService.loadPages(pageIds);

        const oPages = {};
        Object.keys(oPagePaths).forEach((sPageId) => {
            // clone the data to keep the caller from changing the original object
            oPages[sPageId] = deepClone(oPagesService.getModel().getProperty(oPagePaths[sPageId]), 20);
        });
        return oPages;
    };

    /**
     * Adds a section to a page
     *
     * @param {string} pageId The ID of the page to which the section is added
     * @param {int} sectionIndex The index of the added section on the page
     * @param {sap.ushell.services.Pages.Section} [sectionProperties] Properties of the added section
     *
     * @returns {Promise} Promise which resolves after the personalization was saved
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.addSection = async function (pageId, sectionIndex, sectionProperties) {
        const oPagesService = await Container.getServiceAsync("Pages");
        const iPageIndex = oPagesService.getPageIndex(pageId);
        return oPagesService.addSection(iPageIndex, sectionIndex, sectionProperties);
    };

    /**
     * Adds a new visualization to a page
     *
     * If no section ID is specified, the visualization is added to the 'Recently Added' section automatically.
     *
     * @param {string} pageId The ID of the page the visualization should be added to
     * @param {string} [sectionId] The ID of the section the visualization should be added to
     * @param {string} vizId The ID of the visualization to add
     *
     * @returns {Promise} Promise which resolves after the personalization was saved
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.addVisualization = async function (pageId, sectionId, vizId) {
        const oPagesService = await Container.getServiceAsync("Pages");
        return oPagesService.addVisualization(pageId, sectionId, vizId);
    };

    /**
     * Moves a visualization on a page
     *
     * @param {string} pageId The ID of the page containing the moved visualization
     * @param {int} sourceSectionIndex The index of the section from where the visualization is moved
     * @param {int} sourceVisualizationIndex The index of the moved visualization
     * @param {int} targetSectionIndex The index of the section to which the visualization should be moved
     * @param {int} targetVisualizationIndex The new index of the moved visualization. If -1 is passed, the visualization is moved to the last position.
     *
     * @returns {Promise<{visualizationIndex: int}>} Promise which resolves with an object containing the visualizationIndex after the personalization was saved.
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.moveVisualization = async function (pageId, sourceSectionIndex, sourceVisualizationIndex, targetSectionIndex, targetVisualizationIndex) {
        const oPagesService = await Container.getServiceAsync("Pages");
        const iPageIndex = oPagesService.getPageIndex(pageId);

        return oPagesService.moveVisualization(iPageIndex, sourceSectionIndex, sourceVisualizationIndex, targetSectionIndex, targetVisualizationIndex);
    };

    /**
     * Updates the properties of a visualization.
     * Properties that are not supplied are not updated.
     * Currently only the display format, title and subtitle are supported.
     *
     * @param {string} pageId The ID of the page containing the updated visualization
     * @param {int} sectionIndex The index of the section from where the visualization is updated
     * @param {int} visualizationIndex The index of the updated visualization
     * @param {object} visualizationData The updated visualization properties
     * @param {string} [visualizationData.displayFormatHint] The format in which the visualization is displayed
     * @param {string} [visualizationData.title] The title of the visualization
     * @param {string} [visualizationData.subtitle] The subtitle of the visualization
     * @param {string} [visualizationData.info] The information text of the visualization
     *
     * @returns {Promise} The promise resolves when the visualization has been updated successfully
     *
     * @since 1.105
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.updateVisualization = async function (pageId, sectionIndex, visualizationIndex, visualizationData) {
        // keep the API limited to the minimally required functionality
        const oVisualizationDataToUpdate = {
            displayFormatHint: visualizationData.displayFormatHint,
            title: visualizationData.title,
            subtitle: visualizationData.subtitle,
            info: visualizationData.info
        };

        const oPagesService = await Container.getServiceAsync("Pages");
        const iPageIndex = oPagesService.getPageIndex(pageId);

        return oPagesService.updateVisualization(iPageIndex, sectionIndex, visualizationIndex, oVisualizationDataToUpdate);
    };

    /**
     * Deletes a visualization from a page
     *
     * @param {string} pageId The ID of the page containing the deleted visualization
     * @param {int} sectionIndex The index of the section from where the visualization is deleted
     * @param {int} visualizationIndex The index of the deleted visualization
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.103.0
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.deleteVisualization = async function (pageId, sectionIndex, visualizationIndex) {
        const oPagesService = await Container.getServiceAsync("Pages");
        const iPageIndex = oPagesService.getPageIndex(pageId);

        return oPagesService.deleteVisualization(iPageIndex, sectionIndex, visualizationIndex);
    };

    /**
     * Creates VizInstance controls from the visualization data returned by getPage and getPages.
     *
     * @param {sap.ushell.services.Pages.Visualization} vizData Data for a visualization
     *
     * @returns {Promise<sap.ushell.ui.launchpad.VizInstanceBase>} A VizInstance control
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.instantiateVisualization = async function (vizData) {
        const oVisualizationInstantiationService = await Container.getServiceAsync("VisualizationInstantiation");
        return oVisualizationInstantiationService.instantiateVisualization(vizData);
    };

    /**
     * Starts an app based on the provided URL.
     * If an intent is provided an intent based navigation is triggered.
     * If a fully qualified URL is provided the app is opened in a new tab.
     * This API must only be used to start tile targets.
     *
     * @param {string} url
     *      URL of the app
     * @param {string} [title]
     *      Title of the app. This is only used for non-intent based navigation in order to add
     *      an entry to the recently used apps. If no title is provided for such a target no
     *      recently used entry is added.
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.launchTileTarget = function (url, title) {
        if (typeof url !== "string") {
            Log.error("Invalid target URL", null, "sap.ushell.services.SpaceContent");
            return;
        }
        EventHub.emit("UITracer.trace", {
            reason: "LaunchApp",
            source: "Tile",
            data: {
                targetUrl: url
            }
        });
        if (url.indexOf("#") === 0) {
            hasher.setHash(url);
        } else {
            if (title) {
                // add the URL to recent activity log
                const bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                if (bLogRecentActivity) {
                    const oRecentEntry = {
                        title: title,
                        appType: AppType.URL,
                        url: url,
                        appId: url
                    };
                    Container.getRendererInternal("fiori2").logRecentActivity(oRecentEntry);
                }
            }

            WindowUtils.openURL(url, "_blank");
        }
    };

    /**
     * Type for describing a parameter value range.
     *
     * @typedef {object} sap.ushell.services.SpaceContent.Range
     * @property {string} Sign The sign value of the range.
     * @property {string} Option The option value of the range.
     * @property {string} Low The low value of the range.
     * @property {string} High The high value of the range.
     *
     * @since 1.120.0
     * @public
     */

    /**
     * Type for the value of a UserDefault parameter. It contains either a value, an extendedValue, or both.
     *
     * Example:
     * <pre>
     *      {
     *          "value": "ZMAT1",
     *          "extendedValue": {
     *              "Ranges": [
     *                  {
     *                      "Sign": "I",
     *                      "Option": "BT",
     *                      "Low": "A*",
     *                      "High": "F*"
     *                  }
     *              ]
     *          }
     *      }
     * </pre>
     *
     * @typedef {object} sap.ushell.services.SpaceContent.ParameterValue
     * @property {string} [value] The value of a single-parameter.
     * @property {{Ranges: sap.ushell.services.SpaceContent.Range[]}} [extendedValue] Object containing the ranges for a range-parameter.
     *
     * @since 1.120.0
     * @public
     */

    /**
     * Attempt to determine a value for the parameter name.
     *
     * @param {string} parameterName The parameter name
     *
     * @returns {Promise<null|sap.ushell.services.SpaceContent.ParameterValue>}
     *    A Promise that resolves to an object containing the parameter values.
     *    Returns single parameters in property value and range parameters in
     *    property extendedValue. Returns null if the parameter has no value.
     *
     * @since 1.103.0
     *
     * @private
     * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
     */
    SpaceContent.prototype.getUserDefaultParameter = async function (parameterName) {
        const oCSTRService = await Container.getServiceAsync("ClientSideTargetResolution");
        const oUserDefaultsService = await Container.getServiceAsync("UserDefaultParameters");
        // The S/4 MyHome does not know the concept of content providers as it is
        // currently only targeted for the ABAP environment.
        const oSystemContext = await oCSTRService.getSystemContext("");
        const oParameterValue = await oUserDefaultsService.getValue(parameterName, oSystemContext);
        if (!oParameterValue.value && !oParameterValue.extendedValue) {
            return null;
        }

        // return only the properties defined by the API
        const oValue = {};
        if (oParameterValue.value) {
            oValue.value = oParameterValue.value;
        }
        if (oParameterValue.extendedValue) {
            oValue.extendedValue = oParameterValue.extendedValue;
        }
        return oValue;
    };

    SpaceContent.hasNoAdapter = true;
    return SpaceContent;
});
