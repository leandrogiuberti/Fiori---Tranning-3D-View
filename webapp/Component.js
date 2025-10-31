sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device"
], function (UIComponent) {
  "use strict";

  return UIComponent.extend("leandrogiuberti.FioriTranning3DView.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      // enable routing
      this.getRouter().initialize();

    }
  });
});
