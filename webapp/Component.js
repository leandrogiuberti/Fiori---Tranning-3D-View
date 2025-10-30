sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel" // Dependencia declarada
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("leandrogiuberti.FioriTranning3DView.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      var sUrl = sap.ui.require.toUrl("webapp\model\models.js");
      var oModel = new JSONModel(sUrl);
      this.setModel(oModel);
    }
  });
});

