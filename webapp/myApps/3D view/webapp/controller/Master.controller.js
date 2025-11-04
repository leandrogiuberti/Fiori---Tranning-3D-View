sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.example.fiorilist.controller.Master", {
		onInit: function () {
			// O modelo OData é definido no manifest.json
			// Aqui apenas configuramos a view para usar o modelo padrão
			var oView = this.getView();
			var oModel = oView.getModel();
			
			// Garantir que o modelo está pronto antes de fazer requisições
			if (oModel) {
				oModel.attachMetadataLoaded(() => {
					// Metadados carregados, a lista será atualizada automaticamente
				});
			}
		},
        onItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext();
            const sObjectId = oCtx.getProperty("ObjectID");

            this.getOwnerComponent().getRouter().navTo("detail", {
                objectId: sObjectId
            });
        }

	});
});