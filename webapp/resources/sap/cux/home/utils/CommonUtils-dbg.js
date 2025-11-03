/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["../BaseLayout", "./PageManager", "./PersonalisationUtils"], function (__BaseLayout, __PageManager, __PersonalisationUtils) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  /**
   *
   * @param paramName name of parameter
   * This method checks if the URL parameter is enabled.
   * @returns {boolean} True if the parameter is enabled, false otherwise.
   * @private
   */
  const BaseLayout = _interopRequireDefault(__BaseLayout);
  const PageManager = _interopRequireDefault(__PageManager);
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  function isURLParamEnabled(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName)?.toUpperCase() === "TRUE" || false;
  }
  function getPageManagerInstance(control) {
    const container = control.getParent();
    const layout = container?.getParent();
    const layoutPersContainerId = layout instanceof BaseLayout ? layout?.getProperty("persContainerId") : "";
    const persContainerId = layoutPersContainerId || PersonalisationUtils.getPersContainerId(control);
    const pageManagerInstance = PageManager.getInstance(persContainerId, PersonalisationUtils.getOwnerComponent(control));
    return pageManagerInstance;
  }

  /**
   * Filters visualizations by removing static tiles (count or Smart Business tiles) unless dynamic tiles are requested.
   *
   * @param {ISectionAndVisualization[]} visualizations - The array of visualizations to filter.
   * @param {boolean} [filterDynamicTiles=false] - If true, only dynamic tiles are included; otherwise, static tiles are included.
   * @returns {ISectionAndVisualization[]} The filtered array of visualizations.
   */
  function filterVisualizations(visualizations, filterDynamicTiles = false) {
    return visualizations.filter(visualization => {
      // Filter out static tiles
      if (!visualization.isSection && (visualization.isCount || visualization.isSmartBusinessTile)) {
        return filterDynamicTiles;
      } else if (visualization.isSection) {
        visualization.apps = filterVisualizations(visualization.apps || [], filterDynamicTiles);
        visualization.badge = visualization.apps.length.toString();
      }
      return !filterDynamicTiles;
    }).filter(visualization => visualization.isSection ? visualization.apps.length > 0 : true);
  }
  var __exports = {
    __esModule: true
  };
  __exports.isURLParamEnabled = isURLParamEnabled;
  __exports.getPageManagerInstance = getPageManagerInstance;
  __exports.filterVisualizations = filterVisualizations;
  return __exports;
});
//# sourceMappingURL=CommonUtils-dbg.js.map
