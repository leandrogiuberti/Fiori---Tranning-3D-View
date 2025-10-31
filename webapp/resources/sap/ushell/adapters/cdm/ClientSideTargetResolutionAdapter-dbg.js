// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview ClientSideTargetResolutionAdapter for the CDM platform.
 *
 * The ClientSideTargetResolutionAdapter must perform the following two task:
 * <ul>
 * <li>provide the getInbounds method to return the list of Target Mappings used by ClientSideTargetResolution service;</li>
 * <li>provide the resolveHashFragment function, a fallback method called by ClientSideTargetResolution service.</li>
 * </ul>
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/util/Version",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/deepExtend",
    "sap/base/Log",
    "sap/ushell/Container"
], (
    Version,
    jQuery,
    fnDeepExtend,
    Log,
    Container
) => {
    "use strict";

    /**
     * Constructs a new instance of the ClientSideTargetResolutionAdapter for
     * the CDM platform.
     *
     * @param {object} oSystem
     *   The system served by the adapter
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oAdapterConfig
     *   A potential adapter configuration
     *
     * @class
     *
     * @private
     */

    function ClientSideTargetResolutionAdapter (oSystem, sParameters, oAdapterConfig) {
        this._oAdapterConfig = oAdapterConfig && oAdapterConfig.config;
        let sProductName = "";

        if (Container.isInitialized()) {
            sProductName = Container.getLogonSystem().getProductName() || "";
        }

        // Hardcoded for the time being, we should be able to resolve the local
        // system alias via OData call in the future.
        this._oLocalSystemAlias = {
            http: {
                host: "", // empty host and 0 port generate relative URLs.
                port: 0,
                pathPrefix: "/sap/bc/"
            },
            https: {
                host: "",
                port: 0,
                pathPrefix: "/sap/bc/"
            },
            rfc: {
                systemId: "",
                host: "",
                service: 0,
                loginGroup: "",
                sncNameR3: "",
                sncQoPR3: ""
            },
            id: "",
            label: "local",
            client: "",
            language: "",
            properties: {
                productName: sProductName
            }
        };

        /**
         * Produces a list of Inbounds suitable for ClientSideTargetResolution.
         *
         * @returns {jQuery.Promise} Resolves to an array of Inbounds in
         *   ClientSideTargetResolution format.
         * <p>
         * NOTE: the same promise is returned if this method is called multiple
         * times. Therefore this method can be safely called multiple times.
         * </p>
         * @private
         */
        this.getInbounds = function () {
            const that = this;

            if (!this._getInboundsDeferred) {
                this._getInboundsDeferred = new jQuery.Deferred();

                Container.getServiceAsync("CommonDataModel")
                    .then((oService) => {
                        return oService.getSiteWithoutPersonalization();
                    })
                    .then((oSite) => {
                        // Process utilsCDM module version as needed by FLP site version
                        const sUtilsCdmModule = (oSite._version && Version(oSite._version).getMajor() === 3) ?
                            "sap/ushell/adapters/cdm/v3/utilsCdm" : "sap/ushell/utils/utilsCdm";
                        sap.ui.require([sUtilsCdmModule], (oUtilsCdm) => {
                            // Resolve inbounds
                            const aInbounds = oUtilsCdm.formatSite(oSite) || [];
                            that._getInboundsDeferred.resolve(aInbounds);
                        });
                    })
                    .catch((oError) => {
                        that._getInboundsDeferred.reject(oError);
                    });
            }

            return this._getInboundsDeferred.promise();
        };

        this._createSIDMap = function (oAliases) {
            return Object.keys(oAliases)
                .sort()
                .reduce((oSIDMapping, sId) => {
                    const oCurrentAlias = oAliases[sId];
                    const sSid = `SID(${oCurrentAlias.systemId}.${oCurrentAlias.client})`;
                    if (!oSIDMapping.hasOwnProperty(sSid) && oCurrentAlias.hasOwnProperty("systemId") && oCurrentAlias.hasOwnProperty("client")) {
                        oSIDMapping[sSid] = sId;
                    }
                    return oSIDMapping;
                }, {});
        };

        this._getSystemAliases = function () {
            const that = this;

            if (!this.oSystemAliasesDeferred) {
                this.oSystemAliasesDeferred = new jQuery.Deferred();

                Container.getServiceAsync("CommonDataModel")
                    .then((oService) => {
                        return oService.getSiteWithoutPersonalization();
                    })
                    .then((oSite) => {
                        const oSystemAliases = fnDeepExtend({}, oSite.systemAliases || {});

                        // propagate id in system alias
                        Object.keys(oSystemAliases).forEach((sId) => {
                            oSystemAliases[sId].id = sId;
                        });

                        that.oSystemAliasesDeferred.resolve(oSystemAliases);
                    })
                    .catch((oError) => {
                        that.oSystemAliasesDeferred.reject(oError);
                    });
            }

            return this.oSystemAliasesDeferred.promise();
        };

        /**
         * Resolves a specific system alias.
         *
         * @param {string} sSystemAlias
         *    the system alias name to be resolved
         *
         * @returns {jQuery.Promise} Resolves to a system alias data object.
         *    A live object is returned! The service must not change it.
         *    If the alias could not be resolved the promise is rejected.
         *
         *    Format of system alias data object. Example:
         *    <pre>{
         *        id: "AB1CLNT000",
         *        client: "000",
         *        language: "EN",
         *        http: {
         *            host: "ldcab1.xyz.com",
         *            port: 10000,
         *            pathPrefix: "/abc/def/"
         *        },
         *        https: {
         *            host: "ldcab1.xyz.com",
         *            port: 20000,
         *            pathPrefix: "/abc/def/"
         *        },
         *        rfc: {
         *            systemId: "AB1",
         *            host: "ldcsab1.xyz.com",
         *            port: 0,
         *            loginGroup: "PUBLIC",
         *            sncNameR3: "",
         *            sncQoPR3: "8"
         *        }
         *    }</pre>
         *
         * @private
         */
        this.resolveSystemAlias = function (sSystemAlias) {
            const oDeferred = new jQuery.Deferred();
            const that = this;

            this._getSystemAliases().done((oSystemAliases) => {
                let oSystemAlias;
                // 1. check if system Alias is in the Map returned in the first place
                if (oSystemAliases.hasOwnProperty(sSystemAlias)) {
                    oSystemAlias = oSystemAliases[sSystemAlias];
                    if (sSystemAlias === "") {
                        oSystemAlias.properties = fnDeepExtend({}, that._oLocalSystemAlias.properties, oSystemAlias.properties || {});
                    }
                    oDeferred.resolve(oSystemAlias);
                    return;
                }
                // 2. fallback to home alias if empty string and no custom home alias in site
                if (sSystemAlias === "") {
                    oDeferred.resolve(that._oLocalSystemAlias);
                    return;
                }
                // 3. if it is a SID try to find it in the SID mapping
                sSystemAlias = sSystemAlias.toUpperCase(sSystemAlias);
                if (!that._oSIDMap) {
                    that._oSIDMap = that._createSIDMap(oSystemAliases);
                }
                if (that._oSIDMap.hasOwnProperty(sSystemAlias)) {
                    const oMatchedAlias = oSystemAliases[that._oSIDMap[sSystemAlias]];
                    oDeferred.resolve(oMatchedAlias);
                    return;
                }
                // Alias not found. Log and reject!
                const sMessage = `Cannot resolve system alias ${sSystemAlias}`;
                Log.warning(
                    sMessage,
                    "The system alias cannot be found in the site response",
                    "sap.ushell.adapters.cdm.ClientSideTargetResolutionAdapter"
                );
                oDeferred.reject(new Error(sMessage));
            }).fail((oError) => {
                oDeferred.reject(oError);
            });

            return oDeferred.promise();
        };

        /**
         * Method returns the lookup object of content providers and compatible/known data origins
         *
         * @returns {jQuery.Promise} Resolves to an object of content providers
         *   with supported data origins
         *
         * @private
         *
         */
        this.getContentProviderDataOriginsLookup = function () {
            const that = this;

            if (!this.oContentProviderDataOriginsDeferred) {
                this.oContentProviderDataOriginsDeferred = new jQuery.Deferred();

                Container.getServiceAsync("CommonDataModel")
                    .then((oService) => {
                        return oService.getSiteWithoutPersonalization();
                    })
                    .then((oSite) => {
                        let oLookup = null;
                        if (oSite.contentProviderDataOrigins) {
                            oLookup = fnDeepExtend({}, oSite.contentProviderDataOrigins);
                        }
                        that.oContentProviderDataOriginsDeferred.resolve(oLookup);
                    })
                    .catch((oError) => {
                        that.oContentProviderDataOriginsDeferred.reject(oError);
                    });
            }

            return this.oContentProviderDataOriginsDeferred.promise();
        };
    }
    return ClientSideTargetResolutionAdapter;
}, /* bExport= */ false);
