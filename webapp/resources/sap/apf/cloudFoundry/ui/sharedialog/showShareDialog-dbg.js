sap.ui.define([
    "sap/apf/cloudFoundry/ui/utils/ComponentCorrector",
    "sap/ui/core/mvc/ViewType"
], function(ComponentCorrector, ViewType) {
    'use strict';

    var PACKAGE = "sap.apf.cloudFoundry.ui.sharedialog";
    //var ViewType = CoreLibrary.mvc.ViewType;

    async function showShareDialog(oCoreApi, oController) {
        ComponentCorrector.createView(oCoreApi.getComponent(), {
            viewName : PACKAGE + ".view.ShareDialog",
            type : ViewType.XML,
            viewData : {
                oCoreApi : oCoreApi,
                oController : oController
            }
        });
    }

    return {
        show: showShareDialog
    };
});
