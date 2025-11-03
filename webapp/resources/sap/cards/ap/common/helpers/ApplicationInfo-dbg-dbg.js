/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/base/i18n/ResourceBundle", "../odata/ODataUtils"], function (ResourceBundle, ___odata_ODataUtils) {
  "use strict";

  const createContextParameter = ___odata_ODataUtils["createContextParameter"];
  const getEntitySetWithObjectContext = ___odata_ODataUtils["getEntitySetWithObjectContext"];
  const unquoteAndDecode = ___odata_ODataUtils["unquoteAndDecode"];
  var ODataModelVersion = /*#__PURE__*/function (ODataModelVersion) {
    ODataModelVersion["V2"] = "V2";
    ODataModelVersion["V4"] = "V4";
    return ODataModelVersion;
  }(ODataModelVersion || {});
  var AppType = /*#__PURE__*/function (AppType) {
    AppType["FreeStyle"] = "FreeStyle";
    AppType["ObjectPage"] = "ObjectPage";
    return AppType;
  }(AppType || {});
  /**
   * Determines the application floorplan type based on the manifest entries of the provided app component.
   *
   * @param {Component} appComponent - The application component containing the manifest entries.
   * @returns {string} The floorplan type, either "ObjectPage" or "FreeStyle".
   */
  function getApplicationFloorplan(appComponent) {
    const isV2FioriElementsApp = appComponent.getManifestEntry("sap.ui.generic.app");
    if (isV2FioriElementsApp) {
      return AppType.ObjectPage;
    }
    const sapUI5Config = appComponent.getManifestEntry("sap.ui5");
    const appTargets = sapUI5Config?.routing?.targets;
    if (appTargets) {
      const appTargetKeys = Object.keys(appTargets);
      const fioriElementsApp = appTargetKeys.some(key => {
        const target = appTargets[key];
        return target.name === "sap.fe.templates.ObjectPage" || target.name === "sap.fe.templates.ListReport";
      });
      return fioriElementsApp ? AppType.ObjectPage : AppType.FreeStyle;
    }
    return AppType.FreeStyle;
  }
  class ApplicationInfo {
    constructor(rootComponent) {
      this._rootComponent = rootComponent;
      this.appInfo = null;
    }
    static getInstance(rootComponent) {
      if (!ApplicationInfo.instance) {
        ApplicationInfo.instance = new ApplicationInfo(rootComponent);
      }
      return ApplicationInfo.instance;
    }
    fetchDetails(fetchOptions) {
      try {
        let _exit = false;
        const _this = this;
        function _temp9(_result) {
          if (_exit) return _result;
          function _temp7(entitySetWithObjectContext) {
            function _temp6(contextParameters) {
              return Promise.resolve(i18nModel.getResourceBundle()).then(function (resourceBundle) {
                function _temp5() {
                  _this.appInfo = {
                    odataModel,
                    appModel,
                    entitySet,
                    entitySetWithObjectContext,
                    context,
                    componentName,
                    resourceBundle,
                    semanticObject,
                    action,
                    appType,
                    contextParameters,
                    navigationURI,
                    variantParameter,
                    contextParametersKeyValue: contextParameters.length ? _this.getContextParametersKeyValue(contextParameters) : []
                  };
                  return _this.appInfo;
                }
                const _temp4 = function () {
                  if (isDesignMode) {
                    /* Refreshing or destroying the i18nModel does not fetch the latest values because of caching.
                    For cache busting, we are appending a unique identifier to the i18nBundleUrl to fetch the latest i18n values everytime dialog is opened. */
                    const i18nBundleUrl = resourceBundle?.oUrlInfo?.url;
                    const timeStamp = Date.now();
                    return Promise.resolve(ResourceBundle.create({
                      url: `${i18nBundleUrl}?v=${timeStamp}`,
                      async: true
                    })).then(function (_ResourceBundle$creat) {
                      resourceBundle = _ResourceBundle$creat;
                    });
                  }
                }();
                return _temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4);
              });
            }
            const isODataV4 = odataModel === ODataModelVersion.V4;
            return entitySetWithObjectContext ? Promise.resolve(createContextParameter(entitySetWithObjectContext, appModel, isODataV4)).then(_temp6) : _temp6("");
          }
          const isDesignMode = fetchOptions?.isDesignMode || false;
          const componentName = _this._rootComponent.getManifest()["sap.app"].id;
          const appModel = _this._rootComponent.getModel();
          const hash = window.hasher.getHash();
          const [hashPartial] = hash.split("&/");
          const [semanticObject, action] = hashPartial.includes("?") ? hashPartial.split("?")[0].split("-") : hashPartial.split("-");
          let path = hash.split("&/")[1] || "";
          const navigationURI = appType === AppType.FreeStyle ? path : null;
          path = path.includes("/") ? path.split("/")[0] : path;
          path = path.startsWith("/") ? path.slice(1) : path;
          path = path.includes("?") ? path.split("?")[0] : path;
          const searchParams = new URLSearchParams(hash.split("?")[1]);
          const variantParameter = searchParams.get("sap-appvar-id");
          const index = path.indexOf("(");
          const entitySetObjectPage = index > -1 ? path.substring(0, index) : path;
          const entitySet = appType === AppType.FreeStyle ? fetchOptions.entitySet : entitySetObjectPage;
          const context = index > -1 ? path.substring(index + 1, path.indexOf(")")) : "";
          const odataModel = appModel.isA("sap.ui.model.odata.v4.ODataModel") ? ODataModelVersion.V4 : ODataModelVersion.V2;
          const i18nModel = _this._rootComponent.getModel("i18n") || _this._rootComponent.getModel("@i18n");
          const _temp3 = appType === AppType.FreeStyle;
          return _temp3 ? Promise.resolve(getEntitySetWithObjectContext(_this._rootComponent, fetchOptions)).then(_temp7) : _temp7(path);
        }
        const appType = getApplicationFloorplan(_this._rootComponent);
        // Reuse cached appInfo without re-parsing hash if possible
        const _temp8 = function () {
          if (_this.appInfo !== null && ApplicationInfo.instance !== null) {
            function _temp2(path) {
              if (_this.appInfo.entitySetWithObjectContext && path.includes(_this.appInfo.entitySetWithObjectContext)) {
                const _this$appInfo = _this.appInfo;
                _exit = true;
                return _this$appInfo;
              }
            }
            const hash = window.hasher.getHash();
            const _temp = appType === AppType.FreeStyle;
            return _temp ? Promise.resolve(getEntitySetWithObjectContext(_this._rootComponent, fetchOptions)).then(_temp2) : _temp2(hash.split("&/")[1]);
          }
        }();
        return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Parses a context parameter string into an array of key-value objects.
     *
     * The context parameter string should be in the format: "key1=value1,key2=value2,...".
     * Each value is decoded and unquoted using `unquoteAndDecode`.
     *
     * @param {string} contextParameters - The context parameter string to parse.
     * @returns {Array<{ key: string; value: string }>} An array of objects with `key` and `value` properties.
     */
    getContextParametersKeyValue(contextParameters) {
      return contextParameters.split(",").map(param => {
        const [key, value] = param.split("=");
        const cleanedValue = unquoteAndDecode(value);
        return {
          key: key.trim(),
          value: cleanedValue
        };
      });
    }

    /**
     * for testing purposes only
     */
    _resetInstance() {
      ApplicationInfo.instance = null;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataModelVersion = ODataModelVersion;
  __exports.AppType = AppType;
  __exports.getApplicationFloorplan = getApplicationFloorplan;
  __exports.ApplicationInfo = ApplicationInfo;
  return __exports;
});
//# sourceMappingURL=ApplicationInfo-dbg-dbg.js.map
