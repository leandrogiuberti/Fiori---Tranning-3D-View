// sap.ushell.bootstrap("sandbox").then(function () {
//   sap.ushell.Container.createRenderer().placeAt("content");
// });

// sap.ushell.Container = sap.ushell.Container || {};
// sap.ushell.Container.getServiceAsync = function () {
//   return Promise.resolve({
//     getGroups: function () {
//       return [
//         {
//           id: "group_1",
//           title: "Meus Apps",
//           tiles: [
//             {
//               id: "tile_myapp",
//               title: "Treinamento 3D",
//               size: "1x1",
//               targetURL: "#myapp-display"
//             }
//           ]
//         }
//       ];
//     }
//   });
// };

sap.ui.define([
  "sap/ushell/services/Container"
], function () {
  "use strict";

  // Configuração do Launchpad Sandbox
  window["sap-ushell-config"] = {
    defaultRenderer: "fiori2",
    bootstrapPlugins: {},
    renderers: {
      fiori2: {
        componentData: {
          config: {
            search: "hidden"
          }
        }
      }
    },
    services: {
      LaunchPage: {
        adapter: {
          config: {
            groups: [{
              tiles: [{
                tileType: "sap.ushell.ui.tile.StaticTile",
                properties: {
                  title: "3D Viewer App",
                  targetURL: "#3dview-display"
                }
              }]
            }]
          }
        }
      },
      NavTargetResolution: {
        adapter: {
          config: {
            inbounds: {
              "3dview-display": {
                semanticObject: "3dview",
                action: "display",
                title: "3D Viewer App",
                resolutionResult: {
                  applicationType: "SAPUI5",
                  additionalInformation: "SAPUI5.Component=leandrogiuberti.FioriTranning3DView",
                  url: "./"
                }
              }
            }
          }
        }
      }
    }
  };

  // Inicializa o sandbox
  sap.ushell.bootstrap("local").then(function () {
    sap.ushell.Container.createRenderer().placeAt("content");
  });
});
