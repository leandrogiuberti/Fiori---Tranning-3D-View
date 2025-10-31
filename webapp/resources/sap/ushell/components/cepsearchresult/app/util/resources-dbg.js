// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview This file handles the resource bundles.
 */

sap.ui.define([
    "sap/ui/model/resource/ResourceModel"
], (
    ResourceModel
) => {
    "use strict";

    const oResources = {};

    oResources.bundle = null;
    oResources.model = new ResourceModel({
        bundleName: "sap.ushell.components.cepsearchresult.app.util.i18n.i18n",
        async: true
    });

    oResources._pResourceBundle = oResources.model.getResourceBundle().then((oResourceBundle) => {
        oResources.bundle = oResourceBundle;
    });

    oResources.awaitResourceBundle = async function () {
        await oResources._pResourceBundle;
    };

    return oResources;
});
