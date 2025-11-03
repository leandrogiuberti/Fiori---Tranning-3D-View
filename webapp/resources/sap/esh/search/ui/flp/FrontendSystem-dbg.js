/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ushell/Container", "../sinaNexTS/sina/System"], function (Container, ___sinaNexTS_sina_System) {
  "use strict";

  const System = ___sinaNexTS_sina_System["System"];
  class FrontendSystem {
    static fioriFrontendSystemInfo;
    static getSystem() {
      if (typeof FrontendSystem.fioriFrontendSystemInfo === "undefined") {
        FrontendSystem.fioriFrontendSystemInfo = new System({
          id: Container.getLogonSystem().getName() + "." + Container.getLogonSystem().getClient(),
          label: Container.getLogonSystem().getName() + " " + Container.getLogonSystem().getClient()
        });
      }
      return FrontendSystem.fioriFrontendSystemInfo;
    }
  }
  return FrontendSystem;
});
//# sourceMappingURL=FrontendSystem-dbg.js.map
