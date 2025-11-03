sap.ui.define([], function () {
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
                    targetURL: "#myapp-display"
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

  // ESTA PARTE É CRUCIAL: O módulo deve retornar o objeto com a função init
  return {
    init: function () {
      // Bootstrap do Launchpad Sandbox
      sap.ushell.bootstrap("sandbox").then(function () {
        sap.ushell.Container.createRenderer().placeAt("content");
      });
    }
  };
});
