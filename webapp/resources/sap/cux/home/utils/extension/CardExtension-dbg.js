/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/library", "sap/ui/core/library", "sap/ui/integration/Extension"], function (mobileLibrary, coreLibrary, Extension) {
  "use strict";

  const ValueState = coreLibrary.ValueState;
  const ValueColor = mobileLibrary.ValueColor;
  const formatCriticality = (sCriticality, sType) => {
    if (sType === "state") {
      switch (String(sCriticality)) {
        case "1":
        case "Error":
          return ValueState.Error;
        case "2":
        case "Warning":
          return ValueState.Warning;
        case "3":
        case "Success":
          return ValueState.Success;
        default:
          return ValueState.None;
      }
    }
    if (sType === "color") {
      switch (String(sCriticality)) {
        case "1":
        case "Error":
          return ValueColor.Error;
        case "2":
        case "Critical":
          return ValueColor.Critical;
        case "3":
        case "Good":
          return ValueColor.Good;
        default:
          return ValueColor.Neutral;
      }
    }
  };
  class CardExtension extends Extension {
    init() {
      Extension.prototype.setFormatters.apply(this, [{
        formatCriticality: formatCriticality
      }]);
    }
  }
  return CardExtension;
});
//# sourceMappingURL=CardExtension-dbg.js.map
