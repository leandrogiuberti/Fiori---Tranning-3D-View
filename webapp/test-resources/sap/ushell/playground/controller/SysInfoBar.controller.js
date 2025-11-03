// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/playground/controller/BaseController"
], (
    BaseController
) => {
    "use strict";

    return BaseController.extend("sap.ushell.playground.controller.SysInfoBar", {

        onInit: function () {
            this.oSysInfoBar = this.byId("sysInfoBar");
        },

        onApply: function () {
            const sColor = this.byId("selectColor").getSelectedKey();
            const sColorPicker = this.byId("colorPicker").getColorString();
            const sText = this.byId("inputText").getValue();
            const sSubText = this.byId("inputSubText").getValue();
            const sIcon = this.byId("inputSubIcon").getValue();
            // Apply to SysInfoBar
            this.oSysInfoBar.setText(sText);
            this.oSysInfoBar.setSubText(sSubText);
            this.oSysInfoBar.setIcon(sIcon);
            if (sColor === "custom") {
                this.oSysInfoBar.setColor(sColorPicker);
            } else {
                this.oSysInfoBar.setColor(sColor);
            }
        }
    });
});
