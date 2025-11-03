/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define([], function () {
  "use strict";

  var ODataModelVersion = /*#__PURE__*/function (ODataModelVersion) {
    ODataModelVersion["V2"] = "V2";
    ODataModelVersion["V4"] = "V4";
    return ODataModelVersion;
  }(ODataModelVersion || {});
  /**
   * Abstract class for Application Info
   * Provides methods to validate card generation, retrieve entity-related information,
   * and fetch details about the application.
   * @abstract
   */
  class Application {
    /**
     * Constructor for the class Application
     * @param {Component} rootComponent - The root component of the application
     */
    constructor(rootComponent) {
      this._rootComponent = rootComponent;
      const model = rootComponent.getModel();
      this._oDataModelVersion = model.isA("sap.ui.model.odata.v4.ODataModel") ? ODataModelVersion.V4 : ODataModelVersion.V2;
    }

    /**
     * Returns the root component of the application
     */
    getRootComponent() {
      return this._rootComponent;
    }

    /**
     * Fetches details for the given application eg: Object Page, Freestyle
     */
    fetchDetails() {
      const model = this._rootComponent.getModel();
      const bODataV4 = this._oDataModelVersion === ODataModelVersion.V4;
      const serviceUrl = bODataV4 ? model.getServiceUrl() : model.sServiceUrl;
      const hash = window.hasher.getHash();
      const sapApp = this._rootComponent.getManifestEntry("sap.app");
      const componentName = sapApp.id;
      const [hashPartial] = hash.split("&/");
      const navigationURI = Application.floorplan === "FreeStyle" ? hashPartial[1] : null;
      const [semanticObject, action] = hashPartial.includes("?") ? hashPartial.split("?")[0].split("-") : hashPartial.split("-");
      const {
        entitySet,
        entitySetWithObjectContext
      } = this.getEntityRelatedInfo();
      const searchParams = new URLSearchParams(hash.split("?")[1]);
      const variantParameter = searchParams.get("sap-appvar-id");
      return {
        rootComponent: this._rootComponent,
        floorPlan: Application.floorplan,
        odataModel: bODataV4 ? ODataModelVersion.V4 : ODataModelVersion.V2,
        entitySet,
        serviceUrl,
        entitySetWithObjectContext: entitySetWithObjectContext,
        componentName,
        semanticObject,
        action,
        variantParameter,
        navigationURI
      };
    }

    /**
     * Gets the singleton instance of the Application class.
     *
     * @returns {Application} - The singleton instance of the Application class.
     * @throws {Error} - Throws an error if the instance is not found.
     */
    static getInstance() {
      if (Application.instance) {
        return Application.instance;
      }
      throw new Error("Application instance not found");
    }

    /**
     * for testing purposes only
     */
    _resetInstance() {
      Application.instance = null;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataModelVersion = ODataModelVersion;
  __exports.Application = Application;
  return __exports;
});
//# sourceMappingURL=Application-dbg-dbg.js.map
