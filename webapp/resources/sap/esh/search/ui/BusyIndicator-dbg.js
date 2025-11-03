/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class DummyBusyIndicator {
    show() {
      //
    }
    hide() {
      //
    }
    setBusy() {
      //
    }
  }
  class BusyIndicator {
    model;
    constructor(model) {
      this.model = model;
      this.model.setProperty("/isBusy", false);
    }
    show() {
      this.model.setProperty("/isBusy", true);
    }
    hide() {
      this.model.setProperty("/isBusy", false);
    }
    setBusy(isBusy) {
      if (isBusy) {
        this.show();
      } else {
        this.hide();
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.DummyBusyIndicator = DummyBusyIndicator;
  __exports.BusyIndicator = BusyIndicator;
  return __exports;
});
//# sourceMappingURL=BusyIndicator-dbg.js.map
