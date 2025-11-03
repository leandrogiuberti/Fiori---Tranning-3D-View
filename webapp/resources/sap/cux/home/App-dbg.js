/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/GenericTile", "sap/m/library", "sap/ushell/Container", "./BaseApp", "./utils/AppManager"], function (Log, GenericTile, mobileLibrary, Container, __BaseApp, __AppManager) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseApp = _interopRequireDefault(__BaseApp);
  const AppManager = _interopRequireDefault(__AppManager);
  /**
   *
   * App class for managing and storing Apps.
   *
   * @extends sap.cux.home.BaseApp
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121.0
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.App
   */
  const App = BaseApp.extend("sap.cux.home.App", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Url of the app where the user navigates to on click
         */
        url: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        },
        /**
         * VizId of the app. Used for enabling addition of apps to FavoriteApp panel
         */
        vizId: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        }
      }
    },
    /**
     * Constructor for a new App.
     *
     * @param {string} [id] ID for the new app, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new app
     */
    constructor: function _constructor(id, settings) {
      BaseApp.prototype.constructor.call(this, id, settings);
    },
    _getSSBRootControl: function _getSSBRootControl(oSmartBusinessAppViz) {
      try {
        return oSmartBusinessAppViz.getContent().getComponentInstance().getRootControl();
      } catch (oError) {
        Log.error(oError instanceof Error ? oError.message : String(oError));
        return null;
      }
    },
    _getInnerGenericTile: function _getInnerGenericTile(oControl) {
      if (!oControl) {
        return null;
      }
      const oControlMetadata = oControl.getMetadata();
      const oDefaultAggregationDefinition = oControlMetadata.getDefaultAggregation();
      const sDefaultAggregationName = oDefaultAggregationDefinition ? oDefaultAggregationDefinition?.name : "content";
      const aAggregationData = sDefaultAggregationName ? oControl.getAggregation(sDefaultAggregationName) : null;
      const oAggregationValue = Array.isArray(aAggregationData) ? aAggregationData[0] : aAggregationData;
      if (!oAggregationValue) {
        return null;
      }
      if (oAggregationValue instanceof GenericTile && oAggregationValue.getState() === mobileLibrary.LoadState.Loaded) {
        return oAggregationValue;
      }
      return this._getInnerGenericTile(oAggregationValue);
    },
    /**
     * Navigates to the clicked app
     * @private
     */
    _launchApp: function _launchApp(event) {
      try {
        const _this = this;
        _this.appManagerInstance = _this.appManagerInstance || AppManager.getInstance();
        const tile = event.getSource();
        return Promise.resolve(_this.appManagerInstance.fetchFavVizs(false, true)).then(function (favoriteApps) {
          const selectedApp = favoriteApps.find(app => {
            const appUrl = app.url || "";
            return tile.getUrl().includes(appUrl);
          });
          const smartBusinessAppViz = selectedApp?.vizInstance;
          const isSmartBusinessTile = selectedApp?.isSmartBusinessTile;
          if (smartBusinessAppViz) {
            const ssbRootControl = _this._getSSBRootControl(smartBusinessAppViz);
            const ssbGenericTile = isSmartBusinessTile && _this._getInnerGenericTile(ssbRootControl);
            if (ssbGenericTile) {
              ssbGenericTile.firePress();
              return;
            }
          }
          // Fallback in case smartBusinessAppViz is undefined or ssbGenericTile is not present
          return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (spaceContentService) {
            return Promise.resolve(spaceContentService.launchTileTarget(_this.getUrl(), _this.getTitle())).then(function () {});
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * App Press Handler
     * @private
     */
    _handlePress: function _handlePress(event) {
      try {
        const _this2 = this;
        const _temp = function () {
          if (_this2.getUrl()) {
            return Promise.resolve(_this2._launchApp(event)).then(function () {});
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
  return App;
});
//# sourceMappingURL=App-dbg.js.map
