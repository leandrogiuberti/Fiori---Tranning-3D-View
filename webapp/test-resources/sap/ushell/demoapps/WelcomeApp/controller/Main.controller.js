// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/Container"
], (Controller, oAppConfiguration, Container) => {
    "use strict";
    return Controller.extend("sap.ushell.demoapps.WelcomeApp.controller.Main", {
        onInit: function () {
            oAppConfiguration.setApplicationFullWidthInternal(true);
        },

        onHomePress: function () {
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({ target: { shellHash: "#" } });
            });
        },
        onFinderPress: function () {
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({ target: { shellHash: "#Shell-appfinder" } });
            });
        },

        onInputSubmit: function (oEvt) {
        },
        onSpacePress: function (oEvt) {
            const oIntent = oEvt.getSource().getCustomData()[0].getValue();
            Container.getServiceAsync("CrossApplicationNavigation").then((oCANService) => {
                const oParams = {};
                oIntent.parameters.forEach((oParameter) => {
                    if (oParameter.name && oParameter.value) {
                        oParams[oParameter.name] = [oParameter.value];
                    }
                });

                oCANService.toExternal({
                    target: {
                        semanticObject: oIntent.semanticObject,
                        action: oIntent.action
                    },
                    params: oParams
                });
            });
        },

        onItemPress: function (oEvt) {
            const sIntent = oEvt.getSource().getCustomData()[0].getValue();

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({ target: { shellHash: sIntent } });
            });
        },

        onSuggestionSelect: function (oEvt) {
            const sIntent = oEvt.getParameter("selectedItem").getKey();

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({ target: { shellHash: sIntent } });
            });
        }
    });
});
