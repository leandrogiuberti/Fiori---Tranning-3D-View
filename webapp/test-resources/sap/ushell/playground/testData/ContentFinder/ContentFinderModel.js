// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./ContentFinderTiles",
    "./ContentFinderCards",
    "./ContentFinderRoles",
    "./ContentFinderCatalog",
    "./ContentFinderTree"
], (JSONModel, aTiles, aCards, oRoles, oContentFinderCatalog, aTree) => {
    "use strict";

    const oModel = {
        data: {
            Catalog: oContentFinderCatalog
        }
    };

    return new JSONModel(oModel);
});
