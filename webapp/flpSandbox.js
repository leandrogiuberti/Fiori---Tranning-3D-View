sap.ushell.Container = {
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

// Bootstrap do Launchpad Sandbox
sap.ushell.bootstrap("sandbox").then(function () {
  sap.ushell.Container.createRenderer().placeAt("content");
});
