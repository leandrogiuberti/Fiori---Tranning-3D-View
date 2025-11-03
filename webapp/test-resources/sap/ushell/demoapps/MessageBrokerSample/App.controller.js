// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Container"
], (Controller, Container) => {
    "use strict";

    let oMessageBrokerService;

    return Controller.extend("sap.ushell.demo.MessageBrokerSample.App", {
        onInit: function () {
            Container.getServiceAsync("MessageBroker").then((oService) => {
                oMessageBrokerService = oService;
                oMessageBrokerService.addAcceptedOrigin(window.location.origin);
            });

            this.getView().addEventDelegate({
                onAfterRendering: () => {
                    document.getElementById("idAppUI5").addEventListener("click", (event) => { this.showTab(event, "tabAppUI5"); });
                    document.getElementById("idAppRuntime").addEventListener("click", (event) => { this.showTab(event, "tabAppRuntime"); });
                    document.getElementById("idAppHTML").addEventListener("click", (event) => { this.showTab(event, "tabAppHTML"); });
                    document.getElementById("idPlugin1").addEventListener("click", (event) => { this.showTab(event, "tabPlugin1"); });
                    document.getElementById("idPlugin2").addEventListener("click", (event) => { this.showTab(event, "tabPlugin2"); });
                }
            });
        },

        showTab: function (evt, cityName) {
            let i;
            const tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            const tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(cityName).style.display = "block";
            evt.currentTarget.className += " active";
        }
    });
});
