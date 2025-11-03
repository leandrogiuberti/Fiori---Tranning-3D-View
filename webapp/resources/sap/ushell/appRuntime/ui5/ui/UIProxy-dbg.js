// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/appRuntime/ui5/renderers/fiori2/Renderer",
    "sap/m/Button",
    "sap/base/util/ObjectPath"
], (Renderer, Button, ObjectPath) => {
    "use strict";

    function UIProxy () {
        ObjectPath.set("sap.ushell.ui.shell.ShellHeadItem", function (params) {
            const that = this;

            Object.keys(params).forEach((sProp) => {
                that[sProp] = params[sProp];
                that[`get${sProp[0].toUpperCase()}${sProp.slice(1)}`] = function () {
                    return params[sProp];
                };
            });

            Renderer.createShellHeadItem(params);
        });
    }

    return new UIProxy();
});
