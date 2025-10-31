/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/EventBus", "./BaseAppPanel", "./Group", "./utils/CommonUtils", "./utils/Constants", "./utils/DataFormatUtils", "./utils/PersonalisationUtils", "./utils/UshellPersonalizer"], function (EventBus, __BaseAppPanel, __Group, ___utils_CommonUtils, ___utils_Constants, ___utils_DataFormatUtils, __PersonalisationUtils, __UshellPersonalizer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseAppPanel = _interopRequireDefault(__BaseAppPanel);
  const Group = _interopRequireDefault(__Group);
  const getPageManagerInstance = ___utils_CommonUtils["getPageManagerInstance"];
  const DEFAULT_APP_ICON = ___utils_Constants["DEFAULT_APP_ICON"];
  const DEFAULT_BG_COLOR = ___utils_Constants["DEFAULT_BG_COLOR"];
  const FALLBACK_ICON = ___utils_Constants["FALLBACK_ICON"];
  const MYHOME_PAGE_ID = ___utils_Constants["MYHOME_PAGE_ID"];
  const getLeanURL = ___utils_DataFormatUtils["getLeanURL"];
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  const UshellPersonalizer = _interopRequireDefault(__UshellPersonalizer);
  /**
   *
   * Provides the BaseAppPersPanel Class which is BaseAppPanel with personalisation.
   *
   * @extends sap.cux.home.BaseAppPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121.0
   *
   * @abstract
   * @private
   *
   * @alias sap.cux.home.BaseAppPersPanel
   */
  const BaseAppPersPanel = BaseAppPanel.extend("sap.cux.home.BaseAppPersPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        persContainerId: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        }
      }
    },
    constructor: function _constructor(id, settings) {
      BaseAppPanel.prototype.constructor.call(this, id, settings);
      this.firstLoad = true;
    },
    init: function _init() {
      BaseAppPanel.prototype.init.call(this);
      this._eventBus = EventBus.getInstance();
      //apply personalization on page update
      this._eventBus.subscribe("pageChannel", "pageUpdated", () => {
        void this.applyPersonalization(!this.firstLoad);
      }, this);
    },
    /**
     * Retrieves the personalizer instance.
     * @returns {Promise<sap.cux.home.UshellPersonalizer>} A promise resolving to the personalizer instance.
     * @throws {Error} Throws an error if no container ID is provided for personalization.
     * @private
     */
    _getPersonalizer: function _getPersonalizer() {
      try {
        const _this = this;
        const persContainerId = _this._getPersContainerId();
        if (!persContainerId) {
          throw new Error("No Container ID Provided for personalisation!");
        }
        return Promise.resolve(UshellPersonalizer?.getInstance(persContainerId, PersonalisationUtils.getOwnerComponent(_this)));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves personalization data.
     * @returns {Promise<IPersonalizationData>} A promise that resolves with the personalization data.
     * @private
     */
    getPersonalization: function _getPersonalization() {
      try {
        const _this2 = this;
        return Promise.resolve(_this2._getPersonalizer()).then(function (personalizer) {
          return Promise.resolve(personalizer?.read()).then(function (persData) {
            return persData || {};
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sets the personalization data.
     * @param {IPersonalizationData} persData - The personalization data to set.
     * @returns {Promise<void>} A promise that resolves when the personalization data is set.
     * @private
     */
    setPersonalization: function _setPersonalization(persData) {
      try {
        const _this3 = this;
        return Promise.resolve(_this3._getPersonalizer()).then(function (personalizer) {
          return Promise.resolve(personalizer.write(persData)).then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Returns array of personalized favorite apps
     *
     * @returns {Promise} resolves to return array of personalized favorite apps
     */
    _getAppPersonalization: function _getAppPersonalization() {
      try {
        const _this4 = this;
        return Promise.resolve(_this4.getPersonalization()).then(function (personalization) {
          return personalization?.favoriteApps || [];
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sets the personalization data.
     * @param {IAppPersonalization[]} appsPersonalization - Personalization data for favorite apps.
     * @returns {Promise<void>} A promise that resolves when the personalization data is set.
     * @private
     */
    setFavAppsPersonalization: function _setFavAppsPersonalization(appsPersonalization) {
      try {
        const _this5 = this;
        return Promise.resolve(_this5.getPersonalization()).then(function (personalization) {
          const _temp = function () {
            if (personalization) {
              personalization.favoriteApps = appsPersonalization;
              return Promise.resolve(_this5.setPersonalization(personalization)).then(function () {});
            }
          }();
          if (_temp && _temp.then) return _temp.then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Applies personalization settings to the tiles.
     * Retrieves tiles from the generated apps wrapper and applies personalization settings to each tile.
     * Personalization settings include background color and icon customization.
     * @param {boolean} [shouldReload=true] - A flag indicating whether to reload page visualizations.
     * @private
     * @async
     */
    applyPersonalization: function _applyPersonalization(shouldReload = false) {
      try {
        const _this6 = this;
        let tiles = _this6.fetchTileVisualization();
        return Promise.resolve(_this6._applyTilesPersonalization(tiles, undefined, shouldReload)).then(function () {
          if (_this6.firstLoad) {
            _this6.firstLoad = false;
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Applies personalization settings to the provided tiles.
     * @param {Array} tiles - An array of tiles to apply personalization settings to.
     * @param {string} [groupId] - Optional group ID for filtering personalization settings.
     * @param {boolean} [shouldReload=true] - A flag indicating whether to reload page visualizations.
     * @returns {Promise<void>} A promise that resolves when personalization settings are applied to the tiles.
     * @private
     */
    _applyTilesPersonalization: function _applyTilesPersonalization(tiles, groupId, shouldReload = false) {
      try {
        const _this7 = this;
        return Promise.resolve(Promise.all([_this7._getAppPersonalization(), _this7._getFavPages()])).then(function ([personalizations, favPages]) {
          return Promise.resolve(_this7.appManagerInstance._getAllFavPageApps(favPages, shouldReload)).then(function (favPageVisualizations) {
            const groups = _this7.getAggregation("groups") || [];
            const apps = groupId ? _this7._getGroup(groupId)?.getApps() || [] : _this7.getApps() || [];
            for (const tile of tiles) {
              const item = _this7._getItem(tile, groups, apps);
              const {
                color,
                icon
              } = _this7._getItemPersonalization(item, personalizations, favPageVisualizations, groupId);
              if (color) {
                item?.setProperty("bgColor", color, true);
                tile.setBackgroundColor(color);
              }
              if (icon) {
                item?.setProperty("icon", icon, true);
                tile.setTileIcon(icon);
              }
            }
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the corresponding App or Group object associated with the given tile.
     * @param {GenericTile} tile - The tile for which to retrieve the corresponding item.
     * @param {Group[]} groups - An array of Group objects.
     * @param {App[]} apps - An array of App objects.
     * @returns {App | Group | undefined} The corresponding App or Group object, or undefined if not found.
     * @private
     */
    _getItem: function _getItem(tile, groups, apps) {
      const tileGroupId = tile.data("groupId");
      if (tileGroupId) {
        return groups.find(oGroup => oGroup.getGroupId() === tileGroupId);
      } else {
        return apps.find(oApp => getLeanURL(oApp.getUrl()) === tile.getUrl());
      }
    },
    /**
     * Retrieves the color and icon associated with the specified item based on personalizations.
     * @param {App | Group | undefined} item - The App or Group object for which to retrieve personalization data.
     * @param {IAppPersonalization[] | undefined} personalizations - An array of personalization objects.
     * @param {ICustomVisualization[]} favPageVisualizations - An array of favorite page visualizations.
     * @param {string | undefined} groupId - The ID of the group to which the item belongs.
     * @returns {IItemPersonalization} An object containing the color and icon associated with the item.
     * @private
     */
    _getItemPersonalization: function _getItemPersonalization(item, personalizations, favPageVisualizations, groupId) {
      let color = "";
      let icon = "";
      if (!item) return {
        color,
        icon
      };
      if (item instanceof Group) {
        const personalization = personalizations?.find(personalization => personalization.isSection && personalization.sectionId === item.getGroupId());
        color = personalization?.BGColor;
      } else {
        const app = item;
        const appIds = [app.getUrl()];
        const oldAppId = app.data("oldAppId");
        if (oldAppId) {
          appIds.push(oldAppId);
        }
        const vizId = app.getVizId();
        const personalization = groupId ? personalizations?.find(personalization => !personalization.isSection && personalization.sectionId === groupId && personalization.appId && appIds.includes(personalization.appId)) : personalizations?.find(oPersonalization => this?.getMetadata().getName() === "sap.cux.home.FavAppPanel" ? oPersonalization.isRecentlyAddedApp && oPersonalization.appId && appIds.includes(oPersonalization.appId) : oPersonalization.appId && appIds.includes(oPersonalization.appId));
        const favPageVisualization = favPageVisualizations.find(oVisualization => oVisualization.vizId === vizId || oVisualization.appId && appIds.includes(oVisualization.appId));
        const colorInfo = personalization?.BGColor || favPageVisualization?.BGColor || DEFAULT_BG_COLOR().key;
        const panelName = this?.getMetadata().getName();
        color = typeof colorInfo === "object" ? colorInfo.key : colorInfo;
        icon = panelName === "sap.cux.home.FavAppPanel" || panelName === "sap.cux.home.SpacePanel" ? this._getFavAppIcon(app, favPageVisualization?.icon) : this.getAppIcon();
      }
      return {
        color,
        icon
      };
    },
    /**
     * Retrieves favorite pages.
     * @returns {Promise<Array>} A promise that resolves with an array of favorite pages.
     * @private
     */
    _getFavPages: function _getFavPages() {
      try {
        const _this8 = this;
        return Promise.resolve(_this8._getPageManagerInstance().getFavoritePages()).then(function (aFavPages) {
          return aFavPages.concat({
            pageId: MYHOME_PAGE_ID,
            BGColor: DEFAULT_BG_COLOR().key
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Returns default app icon.
     * @returns {string} The icon URL for the app.
     * @private
     */
    getAppIcon: function _getAppIcon() {
      return DEFAULT_APP_ICON;
    },
    /**
     * Retrieves the icon for the specified app, prioritizing the favorite page icon if available.
     * @param {sap.cux.home.App} app - The app object.
     * @param {string} favPageIcon - The icon for the app from the favorite page.
     * @returns {string} The icon URL for the app.
     * @private
     */
    _getFavAppIcon: function _getFavAppIcon(app, favPageIcon) {
      return favPageIcon || app?.getIcon() || FALLBACK_ICON;
    },
    _getPageManagerInstance: function _getPageManagerInstance() {
      this._pageManagerInstance = this._pageManagerInstance || getPageManagerInstance(this);
      return this._pageManagerInstance;
    },
    _getPersContainerId: function _getPersContainerId() {
      let persContainerId = this.getProperty("persContainerId");
      if (!persContainerId) {
        persContainerId = PersonalisationUtils.getPersContainerId(this);
      }
      return persContainerId;
    }
  });
  return BaseAppPersPanel;
});
//# sourceMappingURL=BaseAppPersPanel-dbg.js.map
