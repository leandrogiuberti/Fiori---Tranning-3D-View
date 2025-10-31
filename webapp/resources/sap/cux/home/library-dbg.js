/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/DataType", "sap/ui/core/Lib", "sap/ui/core/library", "sap/ui/integration/library"], function (DataType, Lib, sap_ui_core_library, sap_ui_integration_library) {
  "use strict";

  /**
   * Root namespace for all the libraries related to Common User Experience.
   *
   * @namespace
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   * @since 1.121
   */
  const cuxNamespace = "sap.cux";

  /**
   * This is an SAPUI5 library with controls specialized for common user experience.
   *
   * @namespace
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   * @since 1.121
   */
  const cuxHomeNamespace = "sap.cux.home";
  const thisLib = Lib.init({
    apiVersion: 2,
    name: "sap.cux.home",
    version: "0.0.1",
    dependencies: ["sap.ui.core", "sap.m", "sap.ui.integration", "sap.insights"],
    types: ["sap.cux.home.OrientationType", "sap.cux.home.NewsType"],
    interfaces: [],
    controls: ["sap.cux.home.Layout", "sap.cux.home.ToDosContainer", "sap.cux.home.NewsAndPagesContainer", "sap.cux.home.AppsContainer", "sap.cux.home.InsightsContainer"],
    elements: ["sap.cux.home.MenuItem", "sap.cux.home.TaskPanel", "sap.cux.home.SituationPanel", "sap.cux.home.PagePanel", "sap.cux.home.NewsPanel", "sap.cux.home.FavAppPanel", "sap.cux.home.FrequentAppPanel", "sap.cux.home.RecentAppPanel", "sap.cux.home.RecommendedAppPanel", "sap.cux.home.TilesPanel", "sap.cux.home.CardsPanel"],
    noLibraryCSS: false,
    extensions: {
      flChangeHandlers: {
        "sap.cux.home.Layout": "sap/cux/home/flexibility/Layout",
        "sap.cux.home.BaseContainer": "sap/cux/home/flexibility/BaseContainer",
        "sap.cux.home.ToDosContainer": "sap/cux/home/flexibility/BaseContainer",
        "sap.cux.home.NewsAndPagesContainer": "sap/cux/home/flexibility/BaseContainer",
        "sap.cux.home.InsightsContainer": "sap/cux/home/flexibility/BaseContainer",
        "sap.cux.home.AppsContainer": "sap/cux/home/flexibility/BaseContainer"
      }
    }
  });

  /**
   * Supported layout types for {@link sap.cux.home.BaseContainer}.
   *
   * @enum {string}
   * @private
   * @since 1.121
   */
  var OrientationType = /*#__PURE__*/function (OrientationType) {
    /**
     * Panels are rendered side by side, for example To-Dos and Situaions, and Favorites, Recently Used and Frequently Used apps
     *
     * @public
     */
    OrientationType["SideBySide"] = "SideBySide";
    /**
     * Panels are rendered vertically, for example Insights Tiles and Insights Cards
     *
     * @public
     */
    OrientationType["Vertical"] = "Vertical";
    /**
     * Panels are rendered horizontally, for example Pages and News
     *
     * @public
     */
    OrientationType["Horizontal"] = "Horizontal";
    return OrientationType;
  }(OrientationType || {});
  thisLib.OrientationType = OrientationType;
  DataType.registerEnum("sap.cux.home.OrientationType", OrientationType);

  /**
   * Supported News Types for {@link sap.cux.home.NewsPanel}.
   *
   * @enum {string}
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   * @since 1.121
   */
  var NewsType = /*#__PURE__*/function (NewsType) {
    /**
     * News is of type Url
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */
    NewsType["NewsUrl"] = "newsUrl";
    /**
     * News is of type custom news feed
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */
    NewsType["Custom"] = "customFeed";
    /**
     * News is of type default news feed
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */
    NewsType["Default"] = "default";
    /**
     * News is of type None
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */
    NewsType["None"] = "";
    return NewsType;
  }(NewsType || {});
  thisLib.NewsType = NewsType;
  DataType.registerEnum("sap.cux.home.NewsType", NewsType);
  thisLib.cuxNamespace = cuxNamespace;
  thisLib.cuxHomeNamespace = cuxHomeNamespace;
  return thisLib;
});
//# sourceMappingURL=library-dbg.js.map
