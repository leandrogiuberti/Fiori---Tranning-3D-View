// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/m/MessageToast",
    "sap/ushell/Container"
], (Controller, Log, MessageToast, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.ComponentEmbeddingSample.Main", {
        /**
         * Trigger loading of component.
         */
        handleLoadComponent: async function () {
            const sIntent = this.getView().byId("inputNavigationIntent").getValue();
            const oComponentContainer = this.getView().byId("componentContainer");
            const bSetOwnerComponent = this.getView().byId("checkBoxOwner").getSelected();
            const oOwnerComponent = bSetOwnerComponent ? this.getOwnerComponent() : null;

            const oCANService = await Container.getServiceAsync("CrossApplicationNavigation");
            oCANService.createComponentInstance(sIntent, null, oOwnerComponent)
                .done((oComponent) => {
                    oComponentContainer.setComponent(oComponent);
                })
                .fail((oError) => {
                    MessageToast.show(oError.message);
                    Log.error("createComponentInstance failed:", oError);
                });
        }
    });
});
