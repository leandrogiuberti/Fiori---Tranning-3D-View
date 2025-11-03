// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./ContentFinderVisualizations",
    "./ContentFinderContextData",
    "./ContentFinderCategoryTree"
], (JSONModel, visualizations, contextData, categoryTree) => {
    "use strict";

    const oModel = {
        vizData: visualizations,
        contextData: contextData,
        categoryTree: categoryTree
    };

    return new JSONModel(oModel);
});
