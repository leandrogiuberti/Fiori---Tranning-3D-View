// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Utility functions for component instantiation used in multiple APIs.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ushell/ApplicationType",
    "sap/ushell/Container",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], (
    Log,
    deepExtend,
    ApplicationType,
    Container,
    UI5ComponentType,
    ushellUtils,
    UrlParsing
) => {
    "use strict";

    /**
     * @alias sap.ushell.api.common.ComponentInstantiation
     * @namespace
     * @description Some apps or plugins need to instantiate components based on intents
     *   for which this API provides utility functions.
     *
     * @since 1.129.0
     * @private
     */
    class ComponentInstantiation {
        /**
         * Resolves a given navigation intent (if valid) and returns the respective component instance for further processing.
         *
         * @param {string} sIntent Semantic object and action as a string with a "#" as prefix
         * @param {sap.ushell.services.Ui5ComponentLoader.ComponentData} [oComponentData={}] The componentData relevant for this component.
         *   <b>Note:</b> Please don't pass <code>startupParameters</code>, <code>config</code>
         *   and <code>["sap-xapp-state"]</code>
         * @param {sap.ui.core.Component} [oOwnerComponent] If specified, the created component will be called within the context of the oOwnerComponent
         *    (via oOwnerComponent.runAsOwner(fn))
         * @returns {Promise<sap.ui.core.Component>} A promise resolving the component instance.
         *
         * @since 1.129.0
         * @private
         */
        async createComponentInstance (sIntent, oComponentData, oOwnerComponent) {
            const Ui5ComponentLoader = await Container.getServiceAsync("Ui5ComponentLoader");

            let oModifiedInstantiationData = await this.createComponentInstantiationData(sIntent, oComponentData);
            oModifiedInstantiationData = await Ui5ComponentLoader.modifyComponentProperties(oModifiedInstantiationData, UI5ComponentType.Application);
            oModifiedInstantiationData.loadDefaultDependencies = false;

            if (oOwnerComponent) {
                return new Promise((resolve, reject) => {
                    oOwnerComponent.runAsOwner(() => {
                        this.#createComponent(oModifiedInstantiationData, Ui5ComponentLoader)
                            .then(resolve)
                            .catch(reject);
                    });
                });
            }

            return this.#createComponent(oModifiedInstantiationData, Ui5ComponentLoader);
        }

        /**
         * Creates a UI5 component instance based on the given component properties.
         *
         * @param {sap.ushell.services.Ui5ComponentLoader.InstantiationData} oInstantiationData The properties of the component to create.
         * @param {sap.ushell.services.Ui5ComponentLoader} Ui5ComponentLoader The UI5 component loader service.
         * @returns {Promise<sap.ui.core.Component>} A promise resolving the component instance.
         *
         * @since 1.129.0
         * @private
         */
        async #createComponent (oInstantiationData, Ui5ComponentLoader) {
            try {
                const oComponentPropertiesWithComponentHandle = await Ui5ComponentLoader.instantiateComponent(oInstantiationData);
                return oComponentPropertiesWithComponentHandle.componentHandle.getInstance();
            } catch (oError) {
                Log.error(`Cannot create UI5 component: ${oError.toString()}`, oError.stack, "sap.ushell.api.common.ComponentInstantiation");
                throw oError;
            }
        }

        /**
         * Resolves a given navigation intent (if valid) and returns the respective component data only for further processing.
         *
         * @param {string} sIntent Semantic object and action as a string with a "#" as prefix
         * @param {sap.ushell.services.Ui5ComponentLoader.ComponentData} [oComponentData] The componentData relevant for this component.
         *   <b>Note:</b> Please don't pass <code>startupParameters</code>, <code>config</code>
         *   and <code>["sap-xapp-state"]</code>
         * @returns {Promise<sap.ushell.services.Ui5ComponentLoader.InstantiationData>} A promise resolving the instantiation data for the component.
         *
         * @since 1.129.0
         * @private
         */
        async createComponentInstantiationData (sIntent, oComponentData) {
            const oInstantiationData = {
                componentData: oComponentData
            };

            if (oInstantiationData.componentData) {
                // cleanup componentData
                delete oInstantiationData.componentData.startupParameters;
                delete oInstantiationData.componentData.config;
                delete oInstantiationData.componentData["sap-xapp-state"];
            }

            const sCanonicalIntent = UrlParsing.constructShellHash(UrlParsing.parseShellHash(sIntent));
            if (!sCanonicalIntent) {
                throw new Error("Navigation intent invalid!");
            }

            const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");
            const oResolvedHashFragment = await NavTargetResolutionInternal.resolveHashFragment(`#${sCanonicalIntent}`);

            // If the app is running in cFLP inside an iframe, we have to call the app index
            // to get the app info, so that the component can be created and embedded inside the app.
            if (oResolvedHashFragment.applicationType === ApplicationType.URL.type &&
                oResolvedHashFragment.appCapabilities &&
                oResolvedHashFragment.appCapabilities.appFrameworkId === "UI5" &&
                Container.inAppRuntime()) {
                // This module is only required in this case to avoid adding dependencies for non-cFLP scenarios.
                const [AppLifeCycleAgent] = await ushellUtils.requireAsync(["sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent"]);

                let sAppId;
                // We try to fetch the app id from the URL. As this also considers app variants and not just standard apps.
                try {
                    const sUrl = new URL(oResolvedHashFragment.url);
                    const oURLParameters = new URLSearchParams(sUrl.search);
                    sAppId = oURLParameters.get("sap-ui-app-id");
                } catch (oError) {
                    // If the URL is not a complete URL but only a URIComponent, we do a regex to find the required parameter value.
                    sAppId = oResolvedHashFragment.url.match(/[?&]sap-ui-app-id=([^&]+)/)[1];
                }

                let oAppInfo = await AppLifeCycleAgent.getAppInfo(sAppId);
                if (oAppInfo.hasOwnProperty("oResolvedHashFragment")) {
                    oAppInfo = oAppInfo.oResolvedHashFragment;
                }
                oAppInfo = this.#finalizeHashFragment(oAppInfo, oInstantiationData);
                if (oAppInfo.url && sIntent.indexOf("?") > 0) {
                    oAppInfo.url += `?${sIntent.split("?")[1]}`;
                }

                return this.#createInstantiationData({
                    ui5ComponentName: sAppId,
                    applicationDependencies: oAppInfo,
                    url: oAppInfo.url
                },
                oInstantiationData);
            } else if (oResolvedHashFragment.applicationType !== ApplicationType.URL.type && !(/^SAPUI5\.Component=/.test(oResolvedHashFragment.additionalInformation))) {
                // For applications that are not of type 'URL', the additionalInformation has to provide a UI5 component.
                throw new Error("The resolved target mapping is not of type UI5 component.");
            }

            return this.#createInstantiationData(oResolvedHashFragment, oInstantiationData);
        }

        /**
         * Creates the component data
         *
         * @param {object} oResolvedHashFragment The resolved hash fragment
         * @param {sap.ushell.services.Ui5ComponentLoader.InstantiationData} oInstantiationData The component configuration
         * @returns {Promise<sap.ushell.services.Ui5ComponentLoader.InstantiationData>} The component data
         *
         * @since 1.129.0
         * @private
        */
        async #createInstantiationData (oResolvedHashFragment, oInstantiationData) {
            try {
                oResolvedHashFragment = this.#finalizeHashFragment(oResolvedHashFragment, oInstantiationData);
                oResolvedHashFragment.loadDefaultDependencies = false;
                const Ui5ComponentLoader = await Container.getServiceAsync("Ui5ComponentLoader");
                return Ui5ComponentLoader.createComponentData(oResolvedHashFragment);
            } catch (oError) {
                Log.error("Cannot get UI5 component data:", oError, "sap.ushell.api.common.ComponentInstantiation");
                throw oError;
            }
        }

        /**
         * Finalizes the hash fragment
         *
         * @param {object} oResolvedHashFragment The resolved hash fragment
         * @param {sap.ushell.services.Ui5ComponentLoader.InstantiationData} oInstantiationData The component configuration
         * @returns {object} The finalized hash fragment
         *
         * @since 1.129.0
         * @private
         */
        #finalizeHashFragment (oResolvedHashFragment, oInstantiationData) {
            oResolvedHashFragment = deepExtend({}, oResolvedHashFragment, oInstantiationData);

            if (!oResolvedHashFragment.ui5ComponentName) {
                if (oResolvedHashFragment.additionalInformation) {
                    oResolvedHashFragment.ui5ComponentName = oResolvedHashFragment.additionalInformation.replace(/^SAPUI5\.Component=/, "");
                } else if (oResolvedHashFragment.name) {
                    oResolvedHashFragment.ui5ComponentName = oResolvedHashFragment.name;
                }
            }

            return oResolvedHashFragment;
        }
    }

    return new ComponentInstantiation();
});
