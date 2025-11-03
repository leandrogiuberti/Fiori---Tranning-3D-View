/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/base/Log", "sap/cards/ap/common/helpers/ApplicationInfo", "sap/cards/ap/common/odata/ODataUtils", "sap/cards/ap/generator/odata/ODataUtils", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v2/ODataModel", "sap/ui/model/odata/v4/ODataModel", "./Application"], function (Log, sap_cards_ap_common_helpers_ApplicationInfo, sap_cards_ap_common_odata_ODataUtils, sap_cards_ap_generator_odata_ODataUtils, JSONModel, V2ODataModel, V4ODataModel, ___Application) {
  "use strict";

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
  const AppType = sap_cards_ap_common_helpers_ApplicationInfo["AppType"];
  const getApplicationFloorplan = sap_cards_ap_common_helpers_ApplicationInfo["getApplicationFloorplan"];
  const getEntitySetWithContextURLs = sap_cards_ap_common_odata_ODataUtils["getEntitySetWithContextURLs"];
  const getEntityNames = sap_cards_ap_generator_odata_ODataUtils["getEntityNames"];
  const getPropertyReference = sap_cards_ap_generator_odata_ODataUtils["getPropertyReference"];
  const Application = ___Application["Application"];
  /**
   * Class for Object Page Application Info
   * Extends Application
   * implements the abstract function of the parent class validateCardGeneration, getEntityRelatedInfo, createInstance
   */
  class FreeStyle extends Application {
    /**
     * Constructor for ObjectPage class
     *
     * @param rootComponent The root component of the application.
     */
    constructor(rootComponent) {
      super(rootComponent);
      Application.floorplan = "FreeStyle";
      const appComponent = this._rootComponent;
      const entitySetFromManifest = appComponent.getManifestEntry("/sap.cards.ap/embeds/ObjectPage/default");
      const serviceDetails = this.getServiceDetails();
      const entityDetails = this.getEntityDetails();
      const serviceURL = serviceDetails.length ? serviceDetails[0].name : "";
      this.freeStyleDialogModel = new JSONModel({
        isServiceDetailsView: true,
        serviceDetails: serviceDetails,
        currentService: serviceURL,
        entitySet: entitySetFromManifest ? entitySetFromManifest : "",
        entities: entityDetails,
        entitySetWithObjectContext: "",
        entitySetWithObjectContextList: [],
        isApplyServiceDetailsEnabled: false,
        isContextPathChanged: false,
        isEntityPathChanged: false
      });
    }

    /**
     * Function to validate the card generation
     *
     * @returns boolean
     */
    validateCardGeneration() {
      const {
        serviceUrl
      } = this.fetchDetails();
      if (!serviceUrl) {
        return false;
      }
      return getApplicationFloorplan(this._rootComponent) === AppType.FreeStyle;
    }

    /**
     * Function to get the entity related information i.e. eentitySet and entitySetWithObjectContext
     *
     * @returns object
     */
    getEntityRelatedInfo() {
      return {
        entitySet: this.freeStyleDialogModel.getProperty("/entitySet"),
        entitySetWithObjectContext: this.freeStyleDialogModel.getProperty("/entitySetWithObjectContext")
      };
    }

    /**
     * Function to create instance of Application
     *
     * @param rootComponent The root component of the application
     * @returns Application
     */
    static createInstance(rootComponent) {
      if (!Application.instance) {
        Application.instance = new FreeStyle(rootComponent);
      }
      return Application.instance;
    }

    /**
     * Retrieves service details from the application's manifest.
     *
     * This function iterates over the UI5 models and matches them with the data sources to extract the service URLs.
     * It returns an array of service details, each containing the name and labelWithValue properties.
     *
     * @returns {ServiceDetails[]} An array of service details, each containing the name and labelWithValue properties.
     */
    getServiceDetails() {
      const appComponent = this._rootComponent;
      const dataSources = appComponent.getManifestEntry("/sap.app/dataSources");
      const ui5Models = appComponent.getManifestEntry("/sap.ui5/models");
      return Object.values(ui5Models).map(({
        dataSource
      }) => dataSources[dataSource]?.uri).filter(uri => uri !== undefined).map(uri => ({
        name: uri,
        labelWithValue: uri
      }));
    }

    /**
     * Retrieves the entity details from the model.
     *
     * @returns {EntityDetails[]} An array of entity details, each containing the name and labelWithValue properties.
     * @private
     */
    getEntityDetails() {
      const model = this._rootComponent.getModel();
      const entityNames = getEntityNames(model);
      return entityNames.map(entityName => {
        const propertyRef = getPropertyReference(model, entityName);
        return propertyRef.length > 0 ? {
          name: entityName,
          labelWithValue: entityName
        } : null;
      }).filter(entity => entity !== null);
    }

    /**
     * Fetches data for a given entity set with context.
     *
     * @param {string} entitySetWithObjectContext - The entity set with context to fetch data for.
     * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
     */
    fetchDataForObjectContext(entitySetWithObjectContext) {
      try {
        const _this = this;
        const model = _this._rootComponent.getModel();
        const sFormattedUrl = `/${entitySetWithObjectContext}`;
        const _temp3 = function () {
          if (model instanceof V2ODataModel) {
            return Promise.resolve(new Promise((resolve, reject) => {
              model.read(sFormattedUrl, {
                success: oData => {
                  resolve(oData);
                },
                error: oError => {
                  Log.error("Error fetching data for object context for OData V2 model");
                  reject(oError);
                }
              });
            })).then(function () {});
          } else {
            const _temp2 = function () {
              if (model instanceof V4ODataModel) {
                const _temp = _catch(function () {
                  const context = model.bindContext(sFormattedUrl);
                  return Promise.resolve(context.requestObject()).then(function () {});
                }, function () {
                  Log.error("Error fetching data for object context for OData V4 model");
                });
                if (_temp && _temp.then) return _temp.then(function () {});
              }
            }();
            if (_temp2 && _temp2.then) return _temp2.then(function () {});
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Updates the FreeStyle model with context information for the selected service and entity set.
     *
     * @returns {Promise<void>} A promise that resolves when the model update is complete.
     */
    updateObjectContextFreeStyleModel() {
      try {
        const _this2 = this;
        const serviceUrl = _this2.freeStyleDialogModel.getProperty("/currentService");
        const entitySet = _this2.freeStyleDialogModel.getProperty("/entitySet");
        const model = _this2._rootComponent.getModel();
        const _temp5 = function () {
          if (serviceUrl && entitySet) {
            return Promise.resolve(getEntitySetWithContextURLs(serviceUrl, entitySet, model)).then(function (entitySetWithObjectContextList) {
              const entitySetWithObjectContext = entitySetWithObjectContextList?.length ? entitySetWithObjectContextList[0].name : "";
              const _temp4 = function () {
                if (entitySetWithObjectContext) {
                  return Promise.resolve(_this2.fetchDataForObjectContext(entitySetWithObjectContext)).then(function () {
                    _this2.freeStyleDialogModel.setProperty("/entitySetWithObjectContext", entitySetWithObjectContext);
                    _this2.freeStyleDialogModel.setProperty("/entitySetWithObjectContextList", entitySetWithObjectContextList);
                    _this2.freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", true);
                  });
                }
              }();
              if (_temp4 && _temp4.then) return _temp4.then(function () {});
            });
          }
        }();
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    getFreeStyleModelForDialog() {
      return this.freeStyleDialogModel;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.FreeStyle = FreeStyle;
  return __exports;
});
//# sourceMappingURL=FreeStyle-dbg-dbg.js.map
