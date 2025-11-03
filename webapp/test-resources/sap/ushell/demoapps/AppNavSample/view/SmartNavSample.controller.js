// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ushell/Container"], (Controller, Container) => {
    "use strict";

    let oSmartNavServicePromise;

    return Controller.extend("sap.ushell.demo.AppNavSample.view.SmartNavSample", {
        onInit: function () {
            oSmartNavServicePromise = Container.getServiceAsync("SmartNavigation");
        },

        onBeforeRendering: function () {
            oSmartNavServicePromise.then((oSmartNavService) => {
                return oSmartNavService.getLinks({ semanticObject: "Action" });
            }).then((links) => {
                this.getView().getModel("SOmodel").setProperty("/links", links);
            });
        },

        onSemanticObjectSelected: function (oEvent) {
            const sSemObject = oEvent.getParameter("selectedItem").getText();

            oSmartNavServicePromise.then((oSmartNavService) => {
                return oSmartNavService.getLinks({ semanticObject: sSemObject });
            }).then((links) => {
                this.getView().getModel("SOmodel").setProperty("/links", links);
            });
        },

        onItemPressed: function (oEvt) {
            const intent = oEvt.getSource().getText();
            oSmartNavServicePromise.then((oSmartNavService) => {
                oSmartNavService.toExternal({ target: { shellHash: intent } });
            });
        }
    });
});
