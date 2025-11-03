// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/ui/core/mvc/Controller"
], (
    Log,
    Button,
    Dialog,
    Text,
    Controller
) => {
    "use strict";

    function openDialog (sId) {
        const oDP = this.oView.byId(sId);
        const sDate = oDP.getDateValue();
        const oDialog = new Dialog({
            title: "Date",
            type: "Message",
            content: new Text({
                text: sDate
            }),
            beginButton: new Button({
                text: "OK",
                press: function () {
                    oDialog.close();
                }
            }),
            afterClose: function () {
                oDialog.destroy();
            }
        });

        oDialog.open();
    }

    return Controller.extend("sap.ushell.demo.AppNavSample.view.View2", {
        oApplication: null,

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is
         * displayed, to bind event handlers and do other one-time initialization.
         *
         * @memberof view.Detail
         */
        onInit: function () {
            const myComponent = this.getOwnerComponent();
            Log.debug(`startup parameters of appnavsample are ${JSON.stringify(myComponent.getComponentData().startupParameters)}`);
        },

        handleBtnDP2Press: function () {
            openDialog("DP2");
        },

        handleBtnDP3Press: function () {
            openDialog("DP3");
        }
    });
});
