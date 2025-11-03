// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.UI5brokerClientSample.App", {
        onInit: async function () {},
        onAfterRendering: function () {
            const oTextArea = document.getElementById("txtMessage");
            oTextArea.innerHTML = "{&#13;&#10;   \"x\": 100,&#13;&#10;   \"y\": 200&#13;&#10;}";
        }
    });
});
