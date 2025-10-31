/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/AppComponent", "sap/fe/core/library", "sap/fe/templates/library", "sap/ui/core/Lib"], function (Log, AppComponent, _library, _library2, Library) {
  "use strict";

  var _exports = {};
  /**
   * Library providing the official templates supported by SAP Fiori elements.
   * @namespace
   */
  const templatesNamespace = "sap.fe.ariba";

  /**
   * @namespace
   */
  _exports.templatesNamespace = templatesNamespace;
  const templatesLRNamespace = "sap.fe.ariba.ListReport";

  /**
   * @namespace
   */
  _exports.templatesLRNamespace = templatesLRNamespace;
  const templatesOPNamespace = "sap.fe.ariba.ObjectPage";
  _exports.templatesOPNamespace = templatesOPNamespace;
  const thisLib = Library.init({
    name: "sap.fe.ariba",
    apiVersion: 2,
    dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.templates"],
    types: [],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.141.1",
    noLibraryCSS: true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
  thisLib.onApplicationStarted = function (manifestContent) {
    // Check if the manifest contains controller extensions for sap.fe.templates and uses ariba lib
    const hasAribaLib = manifestContent.dependencies?.libs?.["sap.fe.ariba"] !== undefined;
    if (hasAribaLib) {
      const controllerExtensionsConfig = manifestContent.extends?.extensions?.["sap.ui.controllerExtensions"] ?? {};
      const configKeys = Object.keys(controllerExtensionsConfig);
      if (configKeys.length > 0) {
        for (const configKey of configKeys) {
          if (configKey.startsWith("sap.fe.templates")) {
            Log.warning(`Controller extensions for "${configKey}" need to match the target library sap.fe.ariba and not sap.fe.templates ` + `This is automatically adjusted here but please make the changes in your manifest file to avoid this warning in the future.`);
            const newKey = configKey.replace("sap.fe.templates.", "sap.fe.ariba.");
            if (controllerExtensionsConfig[newKey] === undefined) {
              controllerExtensionsConfig[newKey] = controllerExtensionsConfig[configKey];
            }
          }
        }
      }
    }
  };

  /**
   * Register Ariba specific configuration handler
   */
  AppComponent.registerConfigurationHandlers(async additionalConfiguration => {
    additionalConfiguration["sap.fe.macros"] = additionalConfiguration["sap.fe.macros"] ?? {};
    additionalConfiguration["sap.fe.macros"].Status = {
      invertedDefaultValue: true,
      colorMap: {
        Negative: "Indication12",
        Critical: "Indication13",
        Positive: "Indication14",
        Information: "Indication15",
        Neutral: "Indication20"
      }
    };
    return Promise.resolve();
  });
  AppComponent.registerInitChecks(thisLib.onApplicationStarted);
  return thisLib;
}, false);
