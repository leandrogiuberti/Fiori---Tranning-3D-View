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
  const searchScopePath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchScope";
  const searchItemPath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItem";
  const searchItemGroupPath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemGroup";
  const searchItemShowMorePath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemShowMore";
  async function loadUShellWebComps() {
    const UShellSearchScopeModule = await __ui5_require_async(searchScopePath);
    const UShellSearchItemModule = await __ui5_require_async(searchItemPath);
    const UShellSearchItemGroupModule = await __ui5_require_async(searchItemGroupPath);
    const UShellSearchItemShowMoreModule = await __ui5_require_async(searchItemShowMorePath);
    return {
      SearchScope: UShellSearchScopeModule.default,
      SearchItem: UShellSearchItemModule.default,
      SearchItemGroup: UShellSearchItemGroupModule.default,
      SearchItemShowMore: UShellSearchItemShowMoreModule.default
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.loadUShellWebComps = loadUShellWebComps;
  return __exports;
});
//# sourceMappingURL=UShellWebCompLoader-dbg.js.map
