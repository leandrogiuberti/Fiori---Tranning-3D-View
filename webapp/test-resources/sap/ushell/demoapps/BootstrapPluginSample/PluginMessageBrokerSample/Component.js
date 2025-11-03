// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container"
], (Component, ComponentContainer, Dialog, Button, mobileLibrary, Text, jQuery, Container) => {
    "use strict";

    const oRenderer = Container.getRendererInternal("fiori2");
    const ID_DIALOG = "idMessageBrokerPluginPopup";
    let oDraggableDialog;
    let oText;

    return Component.extend("sap.ushell.demo.BootstrapPluginSample.PluginMessageBrokerSample.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.BootstrapPluginSample.PluginMessageBrokerSample"
        },

        init: function () {
            const that = this;

            that.createLogScreen();
            oRenderer.addHeaderEndItem(
                "sap.ushell.ui.shell.ShellHeadItem", {
                    icon: "sap-icon://flight",
                    id: "idMessageBrokerPluginIcon",
                    press: function () {
                        oDraggableDialog.$().toggleClass("hidden");
                    }
                },
                true,
                false);
        },

        createLogScreen: function () {
            if (!oDraggableDialog) {
                oText = new Text();
                oDraggableDialog = new Dialog({
                    id: ID_DIALOG,
                    title: "Message Broker Shell Plugin",
                    contentWidth: "100%",
                    contentHeight: "100%",
                    draggable: true,
                    resizable: true,
                    content: oText,
                    endButton: new Button({
                        text: "Close",
                        press: function () {
                            oDraggableDialog.$().toggleClass("hidden");
                        }
                    })
                });

                oDraggableDialog.onAfterRendering = function () {
                    Dialog.prototype.onAfterRendering();
                    jQuery("<iframe src='../../demoapps/MessageBrokerSample/brokerClient.html?type=plugin' style='width:100%;height:100%'></iframe>").appendTo(oText.$().parent());
                    oText.$().remove();
                    oText = undefined;
                };
                oDraggableDialog.oPopup.setModal(false);
                oDraggableDialog.open();
                oDraggableDialog.$().toggleClass("hidden");
            }
        },

        exit: function () { }
    });
});
