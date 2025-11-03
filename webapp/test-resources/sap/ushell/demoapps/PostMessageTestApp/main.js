// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/App"
], (
    View,
    App
) => {
    "use strict";

    View.create({
        viewName: "module:sap/ushell/demo/PostMessageTestApp/PostMessageTestView"
    }).then((oView) => {
        new App({ pages: [oView] }).placeAt("content");
    });
});
