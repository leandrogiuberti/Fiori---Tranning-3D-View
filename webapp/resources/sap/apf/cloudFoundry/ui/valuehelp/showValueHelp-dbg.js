sap.ui.define([
    "sap/apf/cloudFoundry/ui/utils/ComponentCorrector",
    "sap/ui/core/mvc/ViewType"
], function(ComponentCorrector, ViewType) {
    'use strict';

    var PACKAGE = "sap.apf.cloudFoundry.ui.valuehelp";
    //var ViewType = CoreLibrary.mvc.ViewType;

    async function showValueHelp(oEventData, oCoreApi) {
        ComponentCorrector.createView(oCoreApi.getComponent(), {
            viewName : PACKAGE + ".view.CatalogBrowser",
            type : ViewType.XML,
            viewData : oEventData
        });
    }

    return {
        show: showValueHelp
    };
});
