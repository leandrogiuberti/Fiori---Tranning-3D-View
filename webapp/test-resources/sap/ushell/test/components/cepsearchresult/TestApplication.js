// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/adapters/cep/SearchCEPAdapter",
    "sap/ushell/components/cepsearchresult/app/util/controls/categories/Application",
    "./app/data/GetAppsResult",
    "sap/ushell/iconfonts",
    "sap/ushell/Container",
    "sap/base/util/ObjectPath"
], (
    SearchCEPAdapter,
    Application,
    GetAppsResult,
    fonts,
    Container,
    ObjectPath
) => {
    "use strict";
    const sampleData = GetAppsResult;
    fonts.registerFonts();
    fonts.registerFiori2IconFont();
    if (!Container.isInitialized()) {
        let oContainer = ObjectPath.create("sap.ushell.Container");
        oContainer = Container || {};
        oContainer.getServiceAsync = function (sService) {
            if (sService === "SearchableContent") {
                return Promise.resolve({
                    getApps: function () {
                        return Promise.resolve(sampleData);
                    }
                });
            } else if (sService === "SearchCEP") {
                return Promise.resolve(new SearchCEPAdapter());
            } else if (sService === "ReferenceResolver") {
                return Promise.resolve({});
            }
        };
    }

    return Application;
});
