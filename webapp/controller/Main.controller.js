sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/vk/Viewport"
],function(Controller, JSONModel, Viewport) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {

        onInit: function () {
            const oData = {
                objects: [
                    { id: "obj1", name: "Cubo", modelUrl: "model/cube.gltf" },
                    { id: "obj2", name: "Esfera", modelUrl: "model/sphere.gltf" }
                ]
            };
            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel);
        },

        onItemPress: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            const oObject = oCtx.getObject();

            const oPanel = this.getView().byid("viewerPanel");
            oPanel.setVisible(true);

            this._load3D(oObject.modelUrl);
        },

        _load3D: function (sUrl) {
            if(!this._viewport) {
                this._viewport = new Viewport({
                    width: "100%",
                    heigth: "400px"
                });
                this.getView().byid("viewportContainer").addItem(this._viewport);
            }

            //Aqui sera carregado o modelo gltf
            console.log("carregando modelo 3D", sUrl);

            // Placeholder: ate o viewer real ser configurado 
            this._viewport.placeAt(this.getView().byid("viewportContainer".getId()));
        }
    });
});