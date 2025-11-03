// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/model/resource/ResourceModel"
], (
    Localization,
    ResourceModel
) => {
    "use strict";

    const oResources = {
        i18nModel: new ResourceModel({
            async: true,
            bundleLocale: Localization.getLanguage()
        })
    };

    const pCreateBundle = oResources.i18nModel.getResourceBundle().then((oResourceBundle) => {
        oResources.i18n = oResourceBundle;
    });

    oResources.awaitResourceBundle = async function () {
        await pCreateBundle;
    };

    return oResources;
}, /* bExport= */ true);
