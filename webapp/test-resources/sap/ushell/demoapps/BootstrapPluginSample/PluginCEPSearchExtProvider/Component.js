// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container"
], (Component, ComponentContainer, Core, jQuery, Container) => {
    "use strict";

    const oRenderer = Container.getRendererInternal("fiori2");

    return Component.extend("sap.ushell.demo.BootstrapPluginSample.PluginCEPSearchExtProvider.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.CEPSearchExtProvider"
        },

        init: function () {
            this.createLogScreen();
            oRenderer.addHeaderEndItem(
                "sap.ushell.ui.shell.ShellHeadItem", {
                    icon: "sap-icon://flight",
                    id: "PluginCEPSearchIcon",
                    press: function () {
                        oRenderer.setFloatingContainerVisibility(!oRenderer.getFloatingContainerVisiblity());
                    }
                },
                true,
                false
            );
        },

        createLogScreen: async function () {
            const oComponent = await Component.create({
                name: "sap.ushell.demo.BootstrapPluginSample.PluginCEPSearchExtProvider.floatingWindow"
            });

            this._oPluginComponentContainer = new ComponentContainer(
                "PluginCEP-floatingContainer", {
                    height: this._calculateContainerHeight(),
                    width: "100%",
                    component: oComponent
                });

            oRenderer.setFloatingContainerContent(this._oPluginComponentContainer);
            setTimeout(() => {
                oRenderer.setFloatingContainerDragSelector(".copilotDragableHandle");

                const oContainerWrapper = document.querySelector("#PluginCEP-floatingContainer").parentElement;
                const oPageWrapper = document.querySelector(".CEP-plugin-body").parentElement;

                oContainerWrapper.style.overflowY = "hidden";
                oPageWrapper.style.overflowY = "hidden";
            }, 1000);
            oRenderer.setFloatingContainerVisibility(false);

            const oStyleElement = document.createElement("style");
            oStyleElement.type = "text/css";
            oStyleElement.innerHTML = ".CEP-plugin-body{height:100%;align-items:center;padding:1rem;}";
            oStyleElement.innerHTML += ".CEP-plugin-display-wrapper{" +
                "background-color:white;" +
                "justify-content:center;" +
                "align-items:center;" +
                "height:35%;" +
                "width:100%;" +
                "border-radius:0.5rem;" +
                "border:0.1rem solid #DCDCDC;}";
            oStyleElement.innerHTML += ".CEP-plugin-display-content{" +
                "padding:1rem;" +
                "font-size:1.1rem!important;" +
                "color:#63686c;}";
            document.getElementsByTagName("head")[0].appendChild(oStyleElement);
        },

        _calculateContainerHeight: function (iModify) {
            const nWindowREMHeight = parseInt(jQuery(window).height() / parseFloat(jQuery("html").css("font-size")), 10) - 8;
            return `${Math.min(nWindowREMHeight, 28)}rem`;
        },

        exit: function () { }
    });
});
