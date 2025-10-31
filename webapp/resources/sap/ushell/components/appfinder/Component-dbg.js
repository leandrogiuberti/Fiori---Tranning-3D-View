// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/components/CatalogsManager",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/ushell/bootstrap/common/common.load.model",
    "sap/ushell/components/SharedComponentUtils",
    "sap/base/util/UriParameters",
    "sap/ushell/Container"
], (
    UIComponent,
    hasher,
    CatalogsManager,
    resources,
    Config,
    oModelWrapper,
    oSharedComponentUtils,
    UriParameters,
    Container
) => {
    "use strict";

    return UIComponent.extend("sap.ushell.components.appfinder.Component", {

        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // model instantiated by the model wrapper
            this.oModel = oModelWrapper.getModel();
            this.setModel(this.oModel);

            // Model defaults are set now --- let`s continue.

            const bPersonalizationActive = Config.last("/core/shell/enablePersonalization");

            if (bPersonalizationActive) {
                // trigger the reading of the homepage group display personalization
                // this is also needed when the app finder starts directly as the tab mode disables
                // the blind loading which is already prepared in the homepage manager
                oSharedComponentUtils.getEffectiveHomepageSetting("/core/home/homePageGroupDisplay", "/core/home/enableHomePageSettings");
            }

            /**
             * Relevant for functions in views and controllers, used by CLASSIC HOMEPAGE
             * @deprecated since 1.120
             */
            this.oCatalogsManager = new CatalogsManager("dashboardMgr", {
                model: this.oModel
            });

            this.setModel(resources.i18nModel, "i18n");

            oSharedComponentUtils.toggleUserActivityLog();
            // handle direct navigation with the old catalog intent format
            const sHash = hasher.getHash();

            Promise.all([
                Container.getServiceAsync("ShellNavigationInternal"),
                Container.getServiceAsync("URLParsing")
            ]).then((aServices) => {
                const oShellNavigationInternal = aServices[0];
                const oUrlParsing = aServices[1];
                const oShellHash = oUrlParsing.parseShellHash(sHash);
                if (oShellHash && oShellHash.semanticObject === "shell" && oShellHash.action === "catalog") {
                    const mParameters = this.parseOldCatalogParams(sHash);
                    const oComponentConfig = this.getManifestEntry("/sap.ui5/config");

                    oShellNavigationInternal.toExternal({
                        target: {
                            semanticObject: oComponentConfig.semanticObject,
                            action: oComponentConfig.action
                        }
                    });

                    this.getRouter().navTo("catalog", {
                        filters: JSON.stringify(mParameters)
                    });
                }
            });
        },

        parseOldCatalogParams: function (sUrl) {
            const mParameters = UriParameters.fromURL(sUrl).mParams;
            // Create a new object without a prototype to prevent prototype pollution
            const oSafeParameters = Object.create(null);

            for (const sKey in mParameters) {
                if (Object.prototype.hasOwnProperty.call(mParameters, sKey)) {
                    const sValue = mParameters[sKey][0];
                    oSafeParameters[sKey] = sValue.includes("/") ? encodeURIComponent(sValue) : sValue;
                }
            }
            return oSafeParameters;
        },

        destroy: function () {
            return Promise.all([
                UIComponent.prototype.destroy.apply(this, arguments),
                this.oCatalogsManager && this.oCatalogsManager.destroy()
            ]);
        }
    });
});
