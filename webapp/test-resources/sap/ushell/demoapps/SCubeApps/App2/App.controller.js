// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Container"
], (Controller, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.SCubeApps.App2.App", {
        onCrossNavigate1: function () {
            const oView = this.getView();

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({
                    target: {
                        semanticObject: oView.byId("txtSemantic").getValue(),
                        action: oView.byId("txtAction").getValue()
                    },
                    params: {
                    }
                });
            });
        },
        onCrossNavigate2: function () {
            const oView = this.getView();

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({
                    target: {
                        shellHash: oView.byId("txtFullHash").getValue()
                    }
                });
            });
        }
    });
});
