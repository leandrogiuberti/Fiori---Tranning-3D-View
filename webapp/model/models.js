sap.ui.define(["sap/ui/model/json/JSONModel"], function(JSONModel){
  return {
    createMockModel: function(){
      return new JSONModel({
        objects: [
          { id: "obj1", name: "Cubo", modelUrl: "model/cube.gltf", thumbnail: "img/cube.png" },
          { id: "obj2", name: "Polvo", modelUrl: "model/octopus.gltf", thumbnail: "img/octopus.png" }
        ]
      });
    }
  };
});
