// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/iconfonts",
    "sap/ushell/Container"
], async (
    iconfonts,
    Container
) => {
    "use strict";
    iconfonts.registerFiori2IconFont();

    const oContent = await Container.createRendererInternal(null);
    oContent.placeAt("canvas");
});
