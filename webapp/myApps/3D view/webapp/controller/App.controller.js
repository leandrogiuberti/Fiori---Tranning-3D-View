sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.example.fiorilist.controller.App", {
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

		onSearch: function (oEvent) {
			var sValue = oEvent.getSource().getValue();
			var oTable = this.byId("objectsTable");
			var oBinding = oTable.getBinding("items");

			// Array de filtros
			var aFilters = [];

			if (sValue) {
				// Criar filtros para cada coluna
				aFilters.push(
					new Filter("ObjectID", FilterOperator.Contains, sValue),
					new Filter("Name", FilterOperator.Contains, sValue),
					new Filter("Attribute1", FilterOperator.Contains, sValue),
					new Filter("Attribute2", FilterOperator.Contains, sValue)
				);

				// Combinar filtros com OR
				var oFilter = new Filter({
					filters: aFilters,
					and: false
				});

				oBinding.filter(oFilter);
			} else {
				// Se vazio, remover filtro
				oBinding.filter([]);
			}
		}
	});
});
