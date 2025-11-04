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
                    // targetURL CORRIGIDO para o ID COMPLETO do seu app
                    targetURL: "#leandrogiuberti.FioriTranning3DView-display" 
                  },
                  {
                    id: "tile_App1ContentProviderA",
                    title: "App1ContentProviderA",
                    size: "1x1",
                    targetURL: "sap.ushell.demo.app1ContentProviderA-display" 
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
      // Bootstrap do Launchpad Sandbox usando a chamada global padrão
      sap.ushell.bootstrap("sandbox").then(function () {
        sap.ushell.Container.createRenderer().placeAt("content");
      });
    }
  };
});
