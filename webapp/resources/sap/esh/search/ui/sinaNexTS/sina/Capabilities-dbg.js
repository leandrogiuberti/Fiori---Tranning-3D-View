/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject"], function (___SinaObject) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  class Capabilities extends SinaObject {
    fuzzy = false;
    nlq = false;
    nlqEnabledInfoOnDataSource = false;
    constructor(properties) {
      super(properties);
      this.fuzzy = properties.fuzzy ?? false;
      this.nlq = properties.nlq ?? false;
      this.nlqEnabledInfoOnDataSource = properties.nlqEnabledInfoOnDataSource ?? false;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Capabilities = Capabilities;
  return __exports;
});
//# sourceMappingURL=Capabilities-dbg.js.map
