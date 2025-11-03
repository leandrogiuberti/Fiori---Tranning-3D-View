// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/Label",
    "sap/esh/search/ui/SearchCompositeControl",
    "sap/esh/search/ui/SearchModel"
], (View, Label, SearchCompositeControl, SearchModel) => {
    "use strict";
    return View.extend("sap.ushell.renderer.search.searchComponent.view.CEPSearchApp", {

        getControllerName: function () {
            return "sap.ushell.renderer.search.searchComponent.controller.CEPSearchApp";
        },

        createContent: function () {
            const model = SearchModel.getModelSingleton({}, "flp");
            return new SearchCompositeControl({ model: model, applicationComponent: "HAN-AS-INA-UI" });
        }
    });
});
