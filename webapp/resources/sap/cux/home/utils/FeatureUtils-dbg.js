/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ushell/Container", "./Constants", "./HttpHelper"], function (Log, Container, ___Constants, __HttpHelper) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const FEATURE_TOGGLE_SRVC_URL = ___Constants["FEATURE_TOGGLE_SRVC_URL"];
  const FEATURE_TOGGLES = ___Constants["FEATURE_TOGGLES"];
  const HttpHelper = _interopRequireDefault(__HttpHelper);
  const featureToggles = new Map();

  /**
   * Utility to check if a feature toggle is enabled.
   *
   * @param key The key of the feature toggle to check.
   * @returns Promise resolving to `true` if the feature toggle is enabled, `false` otherwise.
   */
  const isFeatureEnabled = function (key) {
    try {
      function _temp2() {
        return featureToggles.get(key) || false;
      }
      if (featureToggles.has(key)) {
        return Promise.resolve(featureToggles.get(key));
      }
      const _temp = _catch(function () {
        const unavailableToggles = Object.values(FEATURE_TOGGLES).filter(toggle => !featureToggles.has(toggle));
        return Promise.resolve(getFeatureToggles(unavailableToggles)).then(function (_getFeatureToggles) {
          _getFeatureToggles.forEach(toggle => featureToggles.set(toggle.key, toggle.enabled));
        });
      }, function (error) {
        Log.error("Error fetching feature toggles", error.message);
        featureToggles.set(key, false);
      });
      return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Utility to fetch feature toggles from the server.
   *
   * @param keys An array of feature toggle keys to fetch.
   * @returns Promise resolving to an array of feature toggles.
   */
  const getFeatureToggles = function (keys) {
    try {
      const filterExpression = `?$filter=(ToggleId eq '${keys.join("' or ToggleId eq '")}')`;
      return Promise.resolve(HttpHelper.GetJSON(FEATURE_TOGGLE_SRVC_URL + filterExpression)).then(function (_HttpHelper$GetJSON) {
        const {
          value = []
        } = _HttpHelper$GetJSON;
        return keys.map(key => ({
          key,
          enabled: value.some(toggle => toggle.ToggleId === key && toggle.State.toUpperCase() === "X")
        }));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Utility to check if a navigation target is supported when a feature toggle is enabled.
   *
   * @param featureToggleCheck A promise that resolves to true if the feature is enabled.
   * @param semanticObject Semantic object to be checked for navigation support.
   * @param action Action name for the semantic object.
   * @returns Promise resolving to `true` if navigation is supported and feature is enabled.
   */
  const isNavigationSupportedForFeature = function (featureToggle, intent) {
    try {
      return Promise.resolve(_catch(function () {
        return Promise.resolve(isFeatureEnabled(featureToggle)).then(function (isFeatureToggleEnabled) {
          return isFeatureToggleEnabled ? Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
            return Promise.resolve(navigationService.isNavigationSupported([intent])).then(function ([{
              supported
            }]) {
              return supported || false;
            });
          }) : false;
        });
      }, function (error) {
        Log.warning(error instanceof Error ? error.message : String(error));
        return false;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var __exports = {
    __esModule: true
  };
  __exports.isFeatureEnabled = isFeatureEnabled;
  __exports.isNavigationSupportedForFeature = isNavigationSupportedForFeature;
  return __exports;
});
//# sourceMappingURL=FeatureUtils-dbg.js.map
