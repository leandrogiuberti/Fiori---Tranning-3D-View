// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/iconfonts",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/Container"
], (
    iconfonts,
    AppConfiguration,
    Container
) => {
    "use strict";
    iconfonts.registerFiori2IconFont();

    Container.createRendererInternal(null).then((oContent) => {
        oContent.placeAt("canvas");
    });
});
