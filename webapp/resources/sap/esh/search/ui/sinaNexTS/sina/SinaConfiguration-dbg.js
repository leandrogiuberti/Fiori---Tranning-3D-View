/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  function __ui5_require_async(path) {
    return new Promise(function (resolve, reject) {
      sap.ui.require([path], function (module) {
        if (!(module && module.__esModule)) {
          module = module === null || !(typeof module === "object" && path.endsWith("/library")) ? {
            default: module
          } : module;
          Object.defineProperty(module, "__esModule", {
            value: true
          });
        }
        resolve(module);
      }, function (err) {
        reject(err);
      });
    });
  }
  async function _normalizeConfiguration(configuration) {
    // check whether configuration is a string with a javascript module name
    if (typeof configuration === "string") {
      configuration = configuration.trim();

      // configuration is a string with a url -> load configuration dynamically via require
      if (configuration.indexOf("/") >= 0 && configuration.indexOf("Provider") < 0 && configuration[0] !== "{") {
        configuration = await __ui5_require_async(configuration);
        return await _normalizeConfiguration(configuration);
      }

      // configuration is a string with the provider name -> assemble json
      if (configuration[0] !== "{") {
        configuration = '{ "provider" : "' + configuration + '"}';
      }

      // parse json
      configuration = JSON.parse(configuration);
    }
    return configuration;
  }
  var AvailableProviders = /*#__PURE__*/function (AvailableProviders) {
    AvailableProviders["ABAP_ODATA"] = "abap_odata";
    AvailableProviders["HANA_ODATA"] = "hana_odata";
    AvailableProviders["INAV2"] = "inav2";
    AvailableProviders["MULTI"] = "multi";
    AvailableProviders["SAMPLE"] = "sample";
    AvailableProviders["SAMPLE2"] = "sample2";
    AvailableProviders["MOCK_SUGGESTIONTYPES"] = "mock_suggestiontypes";
    AvailableProviders["MOCK_NLQRESULTS"] = "mock_nlqresults";
    AvailableProviders["MOCK_DELETEANDREORDER"] = "mock_deleteandreorder";
    AvailableProviders["DUMMY"] = "dummy";
    return AvailableProviders;
  }(AvailableProviders || {});
  var __exports = {
    __esModule: true
  };
  __exports._normalizeConfiguration = _normalizeConfiguration;
  __exports.AvailableProviders = AvailableProviders;
  return __exports;
});
//# sourceMappingURL=SinaConfiguration-dbg.js.map
