/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ui/base/ManagedObject", "sap/ui/core/Control"], function (ManagedObject, Control) {
  "use strict";

  function isManagedObject(managedObject) {
    return managedObject instanceof ManagedObject;
  }
  function isControl(control) {
    return control instanceof Control;
  }
  function typesafeRender(control, oRm) {
    if (control) {
      if (isManagedObject(control)) {
        if (isControl(control)) {
          oRm.renderControl(control);
        }
      } else {
        for (const child of control) {
          if (isControl(child)) {
            oRm.renderControl(child);
          }
        }
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.isManagedObject = isManagedObject;
  __exports.isControl = isControl;
  __exports.typesafeRender = typesafeRender;
  return __exports;
});
//# sourceMappingURL=TypeGuardForControls-dbg.js.map
