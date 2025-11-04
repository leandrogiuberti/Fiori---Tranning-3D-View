sap.ui.define([
  "sap/ushell/services/Container"
], function (Container) {
  "use strict";

  var oSandbox = {
    getServiceAsync: function (serviceName) {
      if (serviceName === "LaunchPage") {
        return Promise.resolve({
          getGroups: function () {
            return [
              {
                id: "group_1",
                title: "Meus Apps",
                tiles: [
                  {
                    id: "tile_myapp",
                    title: "Treinamento 3D",
                    size: "1x1",
                    // Intent corrigido para o namespace do seu app
                    targetURL: "#FioriTranning3DView-display" 
                  }
                ]
              }
            ];
          }
        });
      }
      return Promise.resolve({});
    }
  };

  return {
    init: function () {
      // Bootstrap do Launchpad Sandbox usando o objeto Container importado
      Container.bootstrap("sandbox").then(function () {
        Container.getRenderer().placeAt("content");
      });
    }
  };
});
