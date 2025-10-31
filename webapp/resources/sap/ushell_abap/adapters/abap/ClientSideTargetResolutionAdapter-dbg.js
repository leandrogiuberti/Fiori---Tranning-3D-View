// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview ClientSideTargetResolutionAdapter for the abap platform.
 *
 * The ClientSideTargetResolutionAdapter must perform the following two task:
 *   <ul>
 *     <li>provide the getInbounds method to return the list of Target Mappings used by ClientSideTargetResolution service;</li>
 *     <li>provide the resolveHashFragmentFallback function, a fallback method called by ClientSideTargetResolution service.</li>
 *   </ul>
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/base/util/isPlainObject",
    "sap/base/util/deepExtend",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing",
    "sap/base/Log",
    "sap/ushell_abap/pbServices/ui2/ODataWrapper",
    "sap/ushell_abap/pbServices/ui2/Utils",
    "sap/ui/thirdparty/URI",
    "sap/ushell/Container"
], (
    ObjectPath,
    isPlainObject,
    deepExtend,
    ushellUtils,
    UrlParsing,
    Log,
    ODataWrapper,
    Utils,
    URI,
    Container
) => {
    "use strict";

    const S_COMPONENT = "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter";
    // list of parameters which are wd relevant and should not be compacted
    const aNotCompactedWDAParameters = [
        "sap-wd-configId",
        "SAP-WD-CONFIGID",
        "sap-client",
        "SAP-CLIENT",
        "System",
        "SYSTEM",
        "sap-language",
        "SAP-LANGUAGE",
        "sap-wd-htmlrendermode",
        "sap-wd-deltarendering",
        "wdallowvaluesuggest",
        "sap-wd-lightspeed",
        "sap-wd-remotedesktop",
        "sap-wd-flashdebug",
        "sap-accessibility",
        "sap-theme",
        "sap-*",
        "SAP-*",
        "wd*",
        "WD*"
    ];

    /**
     * @typedef {object} sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter.TargetMapping
     * @property {string} text The text of the source.
     * @property {sap.ushell.services.ClientSideTargetResolution.ApplicationType} applicationType The application type of the source.
     * @property {string} applicationDependencies The application dependencies of the source.
     * @property {string} applicationData The application data of the source.
     * @property {string} postParameters The post parameters of the source.
     * @property {string} url The URL of the source.
     * @property {string} systemAlias The system alias of the source.
     * @property {sap.ushell.services.ClientSideTargetResolution.DeviceTypes} [formfactors] The form factors of the source.
     * @property {sap.ushell.services.ClientSideTargetResolution.DeviceTypes} [formFactors] The form factors of the source.
     * @property {sap.ushell.services.ClientSideTargetResolution.Signature} signature The signature of the source.
     * @property {object} parameterMappings The parameter mappings of the source.
     * @property {object} parameterMappings.target The target of the parameter mapping.
     * @property {object} urlTemplate The URL template of the source.
     * @property {string} urlTemplate.id The ID of the URL template.
     * @property {string} catalogId The catalog ID of the source.
     * @property {string} tmChipId The TM chip ID of the source.
     * @property {string} tcode The transaction code of the LADI/Target Mapping.
     *
     * @since 1.135.0
     * @private
     */

    /**
     * Constructs a new instance of the ClientSideTargetResolutionAdapter for the ABAP platform
     *
     * @param {object} oSystem The system served by the adapter
     * @param {string} sParameters Parameter string, not in use
     * @param {object} oAdapterConfig A potential adapter configuration
     *
     * This adapter has the following peculiarity: a member initialSegmentPromise may be present as a configuration member.
     *
     * This member is a thenable which may resolve to invoke a function with a first argument:
     * <code>[aSegments, oTargetMappings, oSystemAliases]</code>
     *
     * When satisfying request to the inbounds, if aSegments is a subset of this initial request, this response may
     * be used if faster than the full request.
     *
     * There is at most one such promise.
     *
     * @class
     * @since 1.34.0
     * @private
     */
    function ClientSideTargetResolutionAdapter (oSystem, sParameters, oAdapterConfig) {
        const that = this;
        // as the method getProductVersion returns the product name, the following holds true.
        const oContainer = Container;
        let sProductName = "";

        if (oContainer) {
            sProductName = oContainer.getLogonSystem().getProductName() || "";
        }

        // The local system alias. This adapter uses this hardcoded object to resolve "", the local system alias.
        this._oLocalSystemAlias = {
            http: {
                id: "",
                host: "",
                port: "",
                pathPrefix: "/sap/bc/"
            },
            https: {
                id: "",
                host: "",
                port: "",
                pathPrefix: "/sap/bc/"
            },
            rfc: {
                id: "",
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

        // if this property is true, the adapter can provide:
        //   a) efficiently cached Full Target results,
        //   and b) optionally a segmented result
        this.hasSegmentedAccess = true;
        this._oAdapterConfig = oAdapterConfig && oAdapterConfig.config;

        // the Application container will add some more parameters,
        // thus the URL limit here is lower than the technical target url length limit (<2000).
        this._wdLengthLimit = 1800;

        this._oODataWrapper = undefined;
        this._getODataWrapper = function () {
            if (!this._oODataWrapper) {
                this._oODataWrapper = ODataWrapper.createODataWrapper("/sap/opu/odata/UI2/INTEROP/");
            }
            return this._oODataWrapper;
        };

        /*
         * The variable below is the most complete list of inbounds (i.e., converted target mappings) received so far.
         *
         * Note that it is always overwritten when a full target mapping response is received.
         *
         * Note that it is only set by the initial request if it has not been set by a non-empty result yet!
         * So it's value evolves towards the full response either:
         *   [] -> [initial response] -> [full response]
         *   or
         *   [] -> [full response]
         */
        this._aTargetMappings = []; // write in target mappings initially (convert when needed)
        this._aInbounds = []; // read from here (the converted target mappings)

        // this variable *may* reflect an initial segment as received by the oInitialSegmentPromise
        this._aInitialSegment = undefined;

        this._oSystemAliasBuffer = new ushellUtils.Map();
        // Cache URL Template object from start_up response
        this._oURLTemplates = {};

        this._storeFromFullStartupResponse = function (oFullStartupResult) {
            if (oFullStartupResult) {
                if (oFullStartupResult.targetMappings) {
                    // inbound conversion
                    that._aTargetMappings = oFullStartupResult.targetMappings;
                }
                if (oFullStartupResult.systemAliases) {
                    that._writeUserSystemAliasesToBuffer(oFullStartupResult.systemAliases);
                }
                if (oFullStartupResult.urlTemplates) {
                    // cache urlTemplates
                    that._oURLTemplates = oFullStartupResult.urlTemplates;
                }
            }
        };

        this._fallbackToFullStartupRequest = function (fnResolve, fnReject) {
            Log.debug(
                "Falling back to full start_up request from adapter",
                "",
                "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
            );
            that._requestAllTargetMappings()
                .then((oFullStartupResult) => {
                    that._storeFromFullStartupResponse(oFullStartupResult);
                    fnResolve(); // resolve the full promise
                })
                .catch((oError) => {
                    fnReject(oError); // reject the full promise
                });
        };

        this._iTargetMappingsUnusedPromiseRejectCount = 0;
        this._oInitialSegmentPromise = oAdapterConfig && oAdapterConfig.config && oAdapterConfig.config.initialSegmentPromise
            || (new Promise((fnResolve, fnReject1) => {
                that._iTargetMappingsUnusedPromiseRejectCount++;
                if (that._iTargetMappingsUnusedPromiseRejectCount === 2) {
                    that._fallbackToFullStartupRequest(fnResolve, fnReject1);
                }
            }));
        this._oNavTargetPromise = oAdapterConfig && oAdapterConfig.config && oAdapterConfig.config.navTargetDataPromise
            || (new Promise((fnResolve, fnReject2) => {
                that._iTargetMappingsUnusedPromiseRejectCount++;
                if (that._iTargetMappingsUnusedPromiseRejectCount === 2) {
                    that._fallbackToFullStartupRequest(fnResolve, fnReject2);
                }
            }));

        this._oInitialSegmentPromise.then((aArgs) => {
            if (aArgs === null) {
                Log.debug(
                    "Initial target mappings segment promise resolved with 'null'",
                    "Will not process initial target mappings segments again (mostly likely because this is no longer needed)",
                    "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                );
                return;
            }

            if (that._aTargetMappings.length === 0) { // ignore if != 0, because the full response came already
                Log.debug(
                    "Segmented start_up response returned",
                    "storing system aliases and inbounds from segment",
                    "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                );
                const aRequestedSegments = aArgs[0];
                const aTargetMappings = aArgs[1];
                const aSystemAliases = aArgs[2];

                if (aArgs.length > 3) {
                    that._oURLTemplates = aArgs[3];
                }

                // we use this as an indicator whether the full request has succeeded
                // can't get worse
                that._aTargetMappings = aTargetMappings;
                that._writeUserSystemAliasesToBuffer(aSystemAliases);
                that._aInitialSegment = aRequestedSegments;
            } else {
                Log.debug(
                    "Segmented start_up response returned",
                    "ignoring response because the full target mapping response returned before",
                    "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                );
            }
        }).catch((oError) => {
            Log.error(
                "Initial segment promise was rejected.",
                oError,
                "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
            );
        });

        this._oNavTargetPromise.then((oFullStartupResult) => {
            Log.debug(
                "Full start_up response returned",
                "storing system aliases and inbounds",
                "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
            );
            that._storeFromFullStartupResponse(oFullStartupResult);
        });
    }

    /**
     * Checks the Resolve Link/Start Up result for Application Dependencies and if present modifies the results
     * Additionally amends the post parameters if present
     * @param {sap.ushell.services.ClientSideTargetResolution.ResolutionResult} oResult oResult
     *
     * @returns {sap.ushell.services.ClientSideTargetResolution.ResolutionResult} Results
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._adjustNavTargetResult = function (oResult) {
        if (oResult) {
            let sUrl = oResult.url;
            let oUri;
            const oAdjustedResult = {
                applicationType: oResult.applicationType,
                additionalInformation: oResult.applicationData
            };
            let sComponentName;
            let aMatches;
            let oAppDependencies;

            if (oResult.text) {
                oAdjustedResult.text = oResult.text;
            }
            if ((oResult.applicationType === "URL" || oResult.applicationType === "SAPUI5")) {
                aMatches = /^SAPUI5\.Component=(.*)/.exec(oResult.applicationData);
                sComponentName = aMatches && aMatches[1];

                if (sComponentName || oResult.applicationDependencies) {
                    if (sComponentName) {
                        oAdjustedResult.ui5ComponentName = sComponentName;
                    }
                    // we only want to assign oAsyncHints if parsing succeeds, otherwise we're happy with undefined
                    if (oResult.applicationDependencies) {
                        try {
                            oAppDependencies = JSON.parse(oResult.applicationDependencies);
                            if (!oAdjustedResult.ui5ComponentName && oAppDependencies.name) {
                                oAdjustedResult.ui5ComponentName = oAppDependencies.name;
                                oAdjustedResult.additionalInformation = `SAPUI5.Component=${oAdjustedResult.ui5ComponentName}`;
                            }
                            if (oAppDependencies && oAppDependencies.url && typeof oAppDependencies.url === "string") {
                                oUri = sUrl && new URI(sUrl);

                                if (oUri) {
                                    if (oAppDependencies.url.toUpperCase().indexOf(oUri.path().toUpperCase()) !== 0) {
                                        // No applicationDependencies in this case as they belong to the wrong app
                                        Log.debug("Component URL defined in target mapping "
                                                + "does not match the URL retrieved from application index. "
                                                + "The URL of the application index is used for further processing.",
                                        `Target mapping URL: ${oResult.url}\nApplication index URL: ${oAppDependencies.url}`,
                                        "sap.ushell_abap.bootstrap.abap");
                                    }
                                    oUri.path(oAppDependencies.url);
                                    sUrl = oUri.toString();
                                    Log.debug("ResolveLink result's component url has been replaced with the url specified " +
                                        "in Application Dependencies, which includes cache buster token");
                                } else {
                                    sUrl = oAppDependencies.url;
                                }
                            }

                            oAdjustedResult.applicationDependencies = oAppDependencies;
                        } catch (oError) {
                            Log.error(
                                `Parsing of applicationDependencies attribute in resolveLink result failed for SAPUI5 component '${
                                    sComponentName}'`,
                                oError,
                                "sap.ushell_abap.bootstrap.abap"
                            );
                        }
                    }

                    // add cache-buster token to URL
                    // although we stub the registerModulePath() method,
                    // we have to replace it in the URL already, because the AppConfiguration service
                    // loads the component's resource bundle already before the module path is registered
                    // by the ApplicationContainer
                    //
                    // we only do this for SAPUI5 applications - if a plain URL or NWBC app is launched,
                    // we keep it as it is
                    // see internal BCP incident 1580137234 2015
                    sUrl = Utils.addCacheBusterTokenUsingUshellConfig(sUrl);
                }
            }

            oAdjustedResult.url = sUrl;
            return oAdjustedResult;
        }
    };

    /**
     * Provides fallback resolution for {@link sap.ushell.services.ClientSideTargetResolution#resolveHashFragment}
     * in case the resolution result cannot be determined on the client.
     *
     * @param {string} sOriginalShellHash the hash fragment string originally passed to the resolveHashFragment call
     * @param {sap.ushell.services.ClientSideTargetResolution.Inbound} oInbound the target mapping that matched <code>sOriginalShellHash</code> during
     *   {@link sap.ushell.services.ClientSideTargetResolution#resolveHashFragment}
     * @param {object.<string, string[]>} oParams the intent parameters (including default parameters) that should be added to the resulting shell hash.
     *   <p>This is an object like:</p>
     *   <pre>
     *   {
     *     "paramName1": ["value1", "value2"], // multiple parameters in URL
     *     "paramName2": ["value3"]
     *   }
     *   </pre>
     * @returns {Promise<sap.ushell.services.ClientSideTargetResolution.ResolutionResult>} Resolves to an object containing the resolution result as in
     *   {@link sap.ushell.services.ClientSideTargetResolution#resolveHashFragment}
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype.resolveHashFragmentFallback = function (sOriginalShellHash, oInbound, oParams) {
        const sShellHashForLpdCust = this._constructShellHashForLpdCust(oInbound, oParams);
        const sSapSystem = oParams && oParams["sap-system"] && oParams["sap-system"][0];

        return this._resolveHashFragmentBE(
            sShellHashForLpdCust || sOriginalShellHash
        ).then((oResult) => {
            // if a sap-system is "only" added per defaulting in the Target Mapping,
            // it is not returned as part of the (NWBC/WDA/WebGui) URL, thus it must be propagated here
            if (oResult && sSapSystem) {
                oResult["sap-system"] = oResult["sap-system"] || sSapSystem;
            }
            return oResult;
        });
    };

    // functions past this point are helpers for the getInbounds function

    /**
     * Produces a list of Inbounds suitable for ClientSideTargetResolution.
     * When aSegment is defined, an initial promise matching the segment may be used to supply the result
     *
     * @param {object[]} aSegment if present, restricting segment. The function may then return the segment matching this
     * @returns {Promise<sap.ushell.services.ClientSideTargetResolution.Inbound[]>} Resolves to an array of Inbounds in ClientSideTargetResolution format.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype.getInbounds = function (aSegment) {
        return new Promise((fnResolve, fnReject) => {
            this._oInitialSegmentPromise.then((aInitialSegmentAndTargetMappings) => {
                if (aInitialSegmentAndTargetMappings === null) {
                // When this promise resolved with null it means that target mappings won't be taken from an initial segment ever
                // in the future (mostly likely because this is not needed, e.g., no direct start).
                    return;
                }

                if (this._isInSegment(aSegment, this._aInitialSegment)) {
                    Log.debug(
                        "Got inbounds from initial segment",
                        "",
                        "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                    );
                    this._aInbounds = this._formatDirectStart(this._aTargetMappings);
                    fnResolve(this._aInbounds);
                } else {
                    Log.debug(
                        "Did not get inbound in initial segment",
                        "",
                        "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                    );
                }
            });

            // must wait on the full target mappings promise to complete before returning
            this._oNavTargetPromise
                .then(() => {
                    Log.debug(
                        "Got inbounds from full start_up response",
                        "",
                        "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                    );

                    // convert (once) when needed
                    this._aInbounds = this._formatDirectStart(this._aTargetMappings);

                    // we don't want to check for the initial segment in the future anymore, since we've got all the inbounds now.
                    this.getInbounds = function () {
                        // replace implementation of this method (no conversion in future calls anymore!)
                        return Promise.resolve(this._aInbounds);
                    };

                    fnResolve(this._aInbounds);
                })
                .catch(fnReject);
        });
    };

    /**
     * Test whether aSubSegment is completely contained in aSegment
     *
     * @param {object[]} aSubSegment the segment to test
     * @param {object[]} aSegment the full segment
     * @returns {boolean} true if aSubSegment is contained in aSegment
     */
    ClientSideTargetResolutionAdapter.prototype._isInSegment = function (aSubSegment, aSegment) {
        if (!Array.isArray(aSegment) || !Array.isArray(aSubSegment)) {
            return false;
        }
        return aSubSegment.every((oEntry) => {
            return !aSegment.every((oTestEntry) => {
                return !(oEntry.semanticObject === oTestEntry.semanticObject
                    && oEntry.action === oTestEntry.action);
            });
        });
    };

    /**
     * Obtain the full set of inbounds via the start_up service.
     *
     * @returns {Promise} Resolves the target mappings.
     */
    ClientSideTargetResolutionAdapter.prototype._requestAllTargetMappings = function () {
        const mParameterMap = Utils.getParameterMap();
        let sRequestUrl = "/sap/bc/ui2/start_up?so=%2A&action=%2A&";
        const sCacheId = (ObjectPath.create("services.targetMappings", this._oAdapterConfig).cacheId
                && (`&sap-cache-id=${ObjectPath.create("services.targetMappings", this._oAdapterConfig).cacheId}`)) || "";

        // add client and language if in url

        /**
         * Copies the URL parameter with the given name from <code>mParameterMap</code> to
         * <code>sRequestUrl</code> if within the relevant list.
         *
         * @param {string} sName URL parameter name
         * @private
         */
        function copyParameter (sName) {
            const sValue = mParameterMap[sName];
            if (sValue) {
                sRequestUrl += `${sName}=${encodeURIComponent(sValue[0])}&`;
            }
        }
        copyParameter("sap-language");
        copyParameter("sap-client");

        return new Promise((fnResolve, fnReject) => {
            Utils.get(
                `${sRequestUrl}&shellType=${ushellUtils.getShellType()}&depth=0${sCacheId}`,
                false, /* xml= */
                (sNavTargetDataResult) => {
                    const oNavTargetDataResult = JSON.parse(sNavTargetDataResult);
                    if (!oNavTargetDataResult) {
                        fnReject(new Error("Malformed Full TM Result"));
                    }
                    fnResolve(oNavTargetDataResult);
                },
                (sErrorMessage) => {
                    fnReject(new Error(sErrorMessage));
                }
            );
        });
    };

    /**
     * Formats a set of target mappings returned by the start_up result into inbounds.
     *
     * @param {sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter.TargetMapping[]} [oDirectStartResponse] the targetMappings member of the start_up response. This is an object like:
     *   <pre>
     *   {
     *     Object-action: {
     *       semanticObject: "Object",
     *       semanticAction: "action",
     *       allowParams: true,
     *       formFactors: {
     *         desktop: true,
     *         tablet: true,
     *         phone: true
     *       },
     *       parameterMappings: {
     *         NAME1: { target: "NEW_NAME1" },
     *         ...
     *       },
     *       text: "Text ",
     *       applicationType: "SAPUI5",
     *       applicationDependencies: "...",
     *       url: "/sap/bc/ui5_ui5/ui2/test_path",
     *       createdOn: "2015-08-04",
     *       catalogId: "X-SAP-UI2-CATALOGPAGE:/UI2/CATALOG",
     *       tmChipId: "01O2TR99M0M42Q838RE8YGK0Z"
     *     },
     *     ...
     *   }
     *   </pre>
     * @returns {sap.ushell.services.ClientSideTargetResolution.Inbound[]} an array of inbounds suitable for ClientSideTargetResolution service consumption.
     *   This array may be empty in case the input oDirectStartResponse parameter was <code>undefined</code>.
     */
    ClientSideTargetResolutionAdapter.prototype._formatDirectStart = function (oDirectStartResponse) {
        const that = this;
        if (!oDirectStartResponse) {
            this._aInitialSegment = undefined; // disable for now!
            return [];
        }

        function mapOne (sSrcId, oSrc) {
            // the result inbound
            const oTarget = {};

            const aMatch = sSrcId.match(/^([^-]+)-([^~]+)/);
            if (!aMatch) {
                Log.warning(
                    `The target mapping id ${sSrcId} is not valid`,
                    "this target mapping will be discarded",
                    "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                );
                return undefined;
            }

            // TODO: remove once this is fixed on the backend
            if (!oSrc.hasOwnProperty("text")) {
                oSrc.text = "";
            }

            oTarget.semanticObject = aMatch[1];
            oTarget.action = aMatch[2];
            oTarget.id = sSrcId;
            oTarget.title = oSrc.text;
            oTarget.permanentKey = `X-SAP-UI2-PAGE:${oSrc.catalogId}:${oSrc.tmChipId}`;
            oTarget.contentProviderId = "";

            // resolution result
            const oFakeResolutionResult = {};
            ["applicationType", "applicationDependencies", "applicationData", "postParameters", "text", "url", "systemAlias"].forEach((sPropName) => {
                oFakeResolutionResult[sPropName] = oSrc[sPropName];
            });

            // take component name from applicationDependencies if not supplied
            oTarget.resolutionResult = ClientSideTargetResolutionAdapter.prototype._adjustNavTargetResult(oFakeResolutionResult);
            oTarget.resolutionResult.additionalInformation = oTarget.resolutionResult.additionalInformation || "";

            // enable usage of the app ID hint
            oTarget.resolutionResult.appId = oTarget.permanentKey;

            /*
             * Keep the systemAliasSemantics to "apply" for Shell-WCF URLs, because these URLs,
             * like other URLs are expressed under this assumption (that the server does not already interpolate system alias data).
             * At least on ABAP. This fix is necessary because the default behavior for the WCF URL resolver was changed in
             * ClientSideTargetResolution after support for WCF application types was introduced.
             */
            const oResolutionResult = oTarget.resolutionResult;
            const sOriginalApplicationType = oResolutionResult.applicationType;
            if (sSrcId.indexOf("Shell-startWCF") === 0 && sOriginalApplicationType === "URL") {
                oTarget.resolutionResult.systemAliasSemantics = "apply";
            }

            // ClientSideTargetResolution relies on different application types than the ones returned by the OData service.
            oTarget.resolutionResult.applicationType = that._formatApplicationType(sSrcId, oTarget.resolutionResult);

            // Forward the name of the systemAlias used to interpolate the URL
            // ClientSideTargetResolution will de-interpolate the URL before applying sap-system
            oTarget.resolutionResult.systemAlias = oSrc.systemAlias || ""; // NOTE: "" is the local system alias

            oTarget.deviceTypes = oSrc.formfactors;
            oTarget.resolutionResult["sap.ui"] = {};
            oTarget.resolutionResult["sap.ui"].technology = oTarget.resolutionResult.applicationType;
            if (oTarget.resolutionResult["sap.ui"].technology === "SAPUI5") {
                oTarget.resolutionResult["sap.ui"].technology = "UI5";
            }
            if (oTarget.resolutionResult["sap.ui"].technology === "TR") {
                oTarget.resolutionResult["sap.ui"].technology = "GUI";
            }
            if (!oTarget.deviceTypes) {
                oTarget.deviceTypes = oSrc.formFactors || {};
            }
            oTarget.deviceTypes.desktop = oTarget.deviceTypes.desktop || false;
            oTarget.deviceTypes.phone = oTarget.deviceTypes.phone || false;
            oTarget.deviceTypes.tablet = oTarget.deviceTypes.tablet || false;

            // signature
            if (Array.isArray(oSrc.signature)) {
                oTarget.signature = {};
                oTarget.signature.additionalParameters = oSrc.allowParams ? "allowed" : "ignored";
                oTarget.signature.parameters = {};
                oSrc.signature.forEach((oBadParam) => {
                    const oParam = {};
                    let sUserDefaultValue;
                    const sName = oBadParam.name;
                    if (oBadParam.defaultValue && oBadParam.defaultValue.value) {
                        oParam.defaultValue = {};
                        oParam.defaultValue.value = oBadParam.defaultValue.value;
                        oParam.defaultValue.format = oBadParam.defaultValue.format || "plain";
                        sUserDefaultValue = that._extractUserDefaultValue(oParam.defaultValue.value);
                        if (sUserDefaultValue) {
                            // a user default value
                            oParam.defaultValue = {
                                value: sUserDefaultValue,
                                format: "reference"
                            };
                        }
                    }
                    if (oBadParam.filter && oBadParam.filter.value) {
                        oParam.filter = {};
                        oParam.filter.value = oBadParam.filter.value;
                        oParam.filter.format = oBadParam.filter.format || "plain";
                        sUserDefaultValue = that._extractUserDefaultValue(oParam.filter.value);
                        if (sUserDefaultValue) {
                            // a user default value
                            oParam.filter = {
                                value: sUserDefaultValue,
                                format: "reference"
                            };
                        }
                    }
                    if (oBadParam.renameTo) {
                        oParam.renameTo = oBadParam.renameTo;
                    }
                    oParam.required = oBadParam.required || false;
                    oTarget.signature.parameters[sName] = oParam;
                });
            } else {
                oTarget.signature = deepExtend({ parameters: {} }, oSrc.signature);
                oTarget.signature.additionalParameters = oTarget.signature.additionalParameters || (oSrc.allowParams ? "allowed" : "ignored");
                Object.keys(oTarget.signature.parameters).forEach((sKey) => {
                    const oParam = oTarget.signature.parameters[sKey];
                    if (oParam.filter) {
                        oParam.filter.format = oParam.filter.format || "plain";
                    }
                    if (oParam.defaultValue) {
                        oParam.defaultValue.format = oParam.defaultValue.format || "plain";
                    }
                    oParam.required = oParam.required || false;

                    // TODO: remove once fixed on backend
                    if (oParam.filter && oParam.filter.hasOwnProperty("format") && !(oParam.filter.hasOwnProperty("value"))) {
                        delete oParam.filter;
                    }
                    if (oParam.defaultValue && oParam.defaultValue.hasOwnProperty("format") && !(oParam.defaultValue.hasOwnProperty("value"))) {
                        delete oParam.defaultValue;
                    }
                });
            }

            const oSapHideIntentLinkParam = oTarget.signature && oTarget.signature.parameters && oTarget.signature.parameters["sap-hide-intent-link"];
            if (oSapHideIntentLinkParam && oSapHideIntentLinkParam.hasOwnProperty("defaultValue")) {
                oTarget.hideIntentLink = oSapHideIntentLinkParam.defaultValue.value === "true";
            }

            if (oSapHideIntentLinkParam && !oSapHideIntentLinkParam.required && oSapHideIntentLinkParam.hasOwnProperty("defaultValue")) {
                // NOTE: we actually delete it only if it's a default value
                delete oTarget.signature.parameters["sap-hide-intent-link"];
            }

            // process parameter mappings if they are there
            if (typeof oSrc.parameterMappings === "object") {
                Object.keys(oSrc.parameterMappings).forEach((sKey) => {
                    const oMapping = oSrc.parameterMappings[sKey];
                    if (sKey && oMapping.target) {
                        oTarget.signature.parameters[sKey] = oTarget.signature.parameters[sKey] || {};
                        oTarget.signature.parameters[sKey].renameTo = oMapping.target;
                    }
                });
            }
            if (oTarget.resolutionResult.applicationType === "URL" && isPlainObject(oSrc.urlTemplate)) {
                oTarget.templateContext = that.getUrlTemplateContext(oSrc);
            }

            if (oSrc.tcode) {
                oTarget.resolutionResult.appInfo = {
                    "abap.transaction": oSrc.tcode
                };
            }

            return oTarget;
        }

        const aRes = [];
        Object.keys(oDirectStartResponse).forEach((sKey) => {
            const r = mapOne(sKey, oDirectStartResponse[sKey]);
            if (r) {
                aRes.push(r);
            }
        });
        return aRes;
    };

    /**
     * Extracts a valid <code>applicationType</code> field for ClientSideTargetResolution from the given object.
     *
     * @param {string} sTargetMappingId A unique identified
     * @param {object} oResolutionResult The (pre-resolution) resolutionResult of the navigation target.
     * @returns {string} One of the following application types compatible with ClientSideTargetResolution service:
     *   "TR", "SAPUI5", "WDA", "URL".
     */
    ClientSideTargetResolutionAdapter.prototype._formatApplicationType = function (sTargetMappingId, oResolutionResult) {
        const sApplicationType = oResolutionResult.applicationType;
        const sUrl = oResolutionResult.url || "";

        function logErrorMessage (oNavTargetExpand, sDefault) {
            Log.warning(
                `Cannot detect application type for TargetMapping id '${sTargetMappingId}', will default to ${sDefault} application type`,
                `TargetMapping URL is '${sUrl}'`,
                S_COMPONENT
            );
        }

        if (sApplicationType === "SAPUI5") {
            return "SAPUI5";
        }

        if (sApplicationType === "URL" &&
            oResolutionResult.additionalInformation &&
            oResolutionResult.additionalInformation.indexOf("SAPUI5.Component=") === 0) {
            return "SAPUI5";
        }
        if (sApplicationType === "WDA" || sApplicationType === "TR" || sApplicationType === "WCF") {
            // trust the server

            // NOTE: "WDA" is there for robustness, in case the right application type is sent at some point from the server.
            return sApplicationType;
        }

        // Change the application type to WCF
        // Check FLPINTEGRATION2015-1463
        if (sTargetMappingId.indexOf("Shell-startWCF") === 0 && sApplicationType === "URL") {
            return "WCF";
        }

        if (sApplicationType === "NWBC") {
            if (sUrl.indexOf("/~canvas;window=app/wda") >= 0) {
                return "WDA";
            }
            if (sUrl.indexOf("/~canvas;window=app/transaction") >= 0) {
                return "TR";
            }

            logErrorMessage(oResolutionResult, "TR" /* default */);

            // There is no special reason the default is "TR" at this point,
            // it's 50% chance the right type is chosen for NWBC applicationType.
            return "TR";
        }

        if (sApplicationType !== "URL") {
            logErrorMessage(oResolutionResult, "URL" /* default */);
        }

        return "URL";
    };

    /**
     * Extracts a user default value from the given string.
     *
     * @param {string} sString any string that may contain a user default placeholder. A valid placeholder has the following properties:
     *   <ul>
     *     <li>Starts with the sequence "%%"</li>
     *     <li>Ends with the sequence "%%"</li>
     *     <li>Contains at least one character between the start and the end sequence</li>
     *   </ul>
     *
     *   Example:<br/>
     *   <pre>
     *   %%UserDefault.desktopMode%%
     *   </pre>
     * @returns {string} the recognized user default parameter contained within the placeholder,
     *   or undefined if not found or not valid placeholder was found in the string.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._extractUserDefaultValue = function (sString) {
        let sRes;
        const rPlaceholderParser = new RegExp("^%%(UserDefault[.].+)%%$");
        const aMatch = rPlaceholderParser.exec(sString);

        return aMatch ? aMatch[1] : sRes;
    };

    /**
     * Format a ABAP proprietary OData response signature (TargetMapping/Signature)
     * into a canonical "Signature" format as used in the AppDescriptor.
     *
     * @param {object} oODataResponse the proprietary OData response parameter signature
     * @param {string} sAllowAdditionalParameters the value of allowAdditionalParameters in the ODataResponse
     * @returns {object} canonical response
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._formatSignature = function (oODataResponse, sAllowAdditionalParameters) {
        const that = this;
        const oRes = {
            parameters: {},
            additionalParameters: sAllowAdditionalParameters === false ? "ignored" : "allowed"
        };

        if (!oODataResponse.results) {
            return oRes;
        }

        oODataResponse.results.forEach((oEntry) => {
            const sEntryName = oEntry.name;
            let sUserDefaultValue;

            if (Object.prototype.hasOwnProperty.call(oRes.parameters, sEntryName)) {
                Log.error(
                    `Duplicate property name ${sEntryName} in ${JSON.stringify(oODataResponse)}`,
                    "ClientSideTargetResolutionAdapter._formatSignature");
            }

            oRes.parameters[sEntryName] = {
                required: that._getObjectDefaulting(oEntry, "required", false)
            };

            const oParam = oRes.parameters[sEntryName];
            const sEntryValue = that._getObjectDefaulting(oEntry, "value", "");

            if (oEntry.regexp === true) {
                oParam.filter = {
                    value: (sEntryValue === "" ? ".*" : sEntryValue),
                    format: "regexp"
                };
                return;
            }

            if (oEntry.required === false) {
                // if not required, the value represents a default value
                sUserDefaultValue = that._extractUserDefaultValue(sEntryValue);

                if (sUserDefaultValue) {
                    // a user default value
                    oParam.defaultValue = {
                        value: sUserDefaultValue,
                        format: "reference"
                    };
                    return;
                }

                if (sEntryValue !== "") { // note: empty string -> no default value
                    // a regular default value
                    oParam.defaultValue = { value: sEntryValue };
                }
                return;
            }

            if (oEntry.required === true && oEntry.value) {
                // if required, the value represents a filter value
                sUserDefaultValue = that._extractUserDefaultValue(sEntryValue);

                if (sUserDefaultValue) {
                    // a user default value
                    oParam.filter = {
                        value: sUserDefaultValue,
                        format: "reference"
                    };
                    return;
                }

                if (sEntryValue !== "") { // note: empty string -> no filter value
                    oParam.filter = {
                        value: sEntryValue
                    };
                }
            }
        });
        return oRes;
    };

    /**
     * Format a ABAP proprietary OData response parameter mappings (TargetMappings/NavTargetFLP/ParameterMappings or
     * TargetMappings/NavTargetNWBC/ParameterMappings) by blending it into the SignatureParameters section of a
     * constructed oSignature object, ("target" property becomes "renameTo" member of the Signature).
     *
     * If necessary, the parameter is created.
     *
     * @param {object} oSignature the signature object
     * @param {object} oODataParameterMappings the ParameterMappings object returned in the ODataResponse
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._mergeParameterMappingsIntoSignature = function (oSignature, oODataParameterMappings) {
        const aParameterMappingsOriginal = oODataParameterMappings.results;
        // no results
        if (!aParameterMappingsOriginal) {
            return;
        }
        aParameterMappingsOriginal.forEach((oParameterMappingOriginal) => {
            const sSource = oParameterMappingOriginal.source;
            const sTarget = oParameterMappingOriginal.target;
            // find a parameter, if not, create one
            if (sTarget) {
                oSignature.parameters[sSource] = oSignature.parameters[sSource] || {};
                if (oSignature.parameters[sSource].renameTo) {
                    Log.warning(
                        `duplicate parameter mapping for'${sSource}'`,
                        `OData Parameter mappings is ${JSON.stringify(oParameterMappingOriginal, null, "   ")}`,
                        S_COMPONENT
                    );
                }
                oSignature.parameters[sSource].renameTo = sTarget;
            }
        });
    };

    /**
     * Format a ABAP proprietary OData response FormFactors object into a canonical "deviceTypes" object as used in the AppDescriptor
     *
     * @param {object} oFormFactors form factors as they appear in the OData response
     * @returns {object} canonical response
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._formatDeviceTypes = function (oFormFactors) {
        const oRes = {};
        const that = this;

        ["desktop", "tablet", "phone"].forEach((sProp) => {
            oRes[sProp] = that._getObjectDefaulting(oFormFactors, sProp, false);
        });
        return oRes;
    };

    /**
     * Return the member of an object, if undefined, return the provided default value.
     *
     * @param {object} oRoot root object
     * @param {string} sStr path to property
     * @param {variant} vDefault the default value
     * @returns {variant} the evaluated property value may be an original reference to a sub entity of root
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._getObjectDefaulting = function (oRoot, sStr, vDefault) {
        const o = ObjectPath.get(sStr || "", oRoot);
        return (o === undefined) ? vDefault : o;
    };

    // functions past this point are helpers for the resolveHashFragmentFallback function

    /**
     * Constructs a shell hash for LPD_CUST resolution.
     *
     * @param {sap.ushell.services.ClientSideTargetResolution.Inbound} oInbound an inbound object matched via ClientSideTargetResolution service. This object is a structure like:
     *   <pre>
     *   {
     *     "semanticObject": <string>,
     *     "action": <action>,
     *     "title": <string>,
     *     "deviceTypes": <object>,
     *     "signature": <object>,
     *     "resolutionResult": {
     *       "applicationType": <string>,
     *       "additionalInformation": <string>,
     *       "text": <string>,
     *       "ui5ComponentName": <string>,
     *       "applicationDependencies": <object>,
     *       "url": <string>,
     *       "systemAlias": <string>,
     *       "_original": {
     *         "__metadata": <object>,
     *         "id": <string>,
     *         "shellType": <string>,
     *         "postParameters": <string>,
     *         "text": <string>,
     *         "applicationData": <string>,
     *         "applicationAlias": <string>,
     *         "applicationType": <string>,
     *         "url": <string>,
     *         "xappState": <string>,
     *         "iappState": <string>,
     *         "systemAlias": <string>,
     *         "applicationDependencies": <string>
     *       }
     *     }
     *   }
     *   </pre>
     * @param {object} oParams the intent parameters (including default parameters) that should be added to the resulting shell hash.
     *   This is an object like:
     *   <pre>
     *   {
     *     "paramName1": ["value1", "value2"], // multiple parameters in URL
     *     "paramName2": ["value3"]
     *   }
     *   </pre>
     * @returns {string} a shell hash suitable for LPD_CUST resolution, that is, with the tilde-prefixed Target Mapping id and parameters.
     *   Through these ids ResolveLink can be pointed to a specific target mapping,
     *   skipping the matching and filtering steps of nav target resolution.<br />
     *
     *   Example shell hash: <code>Action-toappnavsample~6cn?p1=v1&p2=v2</code>
     *   <br />
     *   Returns undefined if it is not possible to obtain the tilde-prefixed id from the given target mapping.
     *
     *   NOTE: the resulting shell hash does not have a leading "#".
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._constructShellHashForLpdCust = function (oInbound, oParams) {
        let sLpdCustShellHash = "";
        let sFailReason;
        // Extract the id from the target mapping
        const oTargetMappingOriginal = ObjectPath.get("resolutionResult._original", oInbound);

        if (!isPlainObject(oTargetMappingOriginal)) {
            sFailReason = "the given target mapping is not an object";
        }
        if (!sFailReason && !oTargetMappingOriginal.hasOwnProperty("id")) {
            sFailReason = "no id found in target mapping _original object";
        }
        if (!sFailReason && typeof oTargetMappingOriginal.id !== "string") {
            sFailReason = "the target mapping id was not a string";
        }
        if (!sFailReason && oTargetMappingOriginal.id.length === 0) {
            sFailReason = "the target mapping id was an empty string";
        }
        if (sFailReason) {
            Log.error("Cannot construct Shell Hash for LPD_CUST resolution",
                sFailReason, "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter");

            return undefined;
        }

        sLpdCustShellHash += oTargetMappingOriginal.id;

        // Concatenate parameters if any
        const sBusinessParams = UrlParsing.paramsToString(oParams);

        if (sBusinessParams.length > 0) {
            sLpdCustShellHash += `?${sBusinessParams}`;
        }

        return sLpdCustShellHash;
    };

    /**
     * Open the batch queue if it is not already open.
     * The method has no effect if the queue is already open
     *
     * @param {object} oODataWrapper a {@link sap.ushell_abap.pbServices.ui2.ODataWrapper} object.
     * @returns {boolean} true iff batch queue was opened by this method
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._openBatchQueueUnlessOpen = function (oODataWrapper) {
        if (oODataWrapper.isBatchQueueOpen()) {
            return false;
        }
        oODataWrapper.openBatchQueue();
        return true;
    };

    /**
     * Resolves the URL hash fragment.
     *
     * The hash fragment is resolved with the /sap/opu/odata/UI2/INTEROP/ResolveLink OData function import.
     * This is an asynchronous operation. The form factor of the current device is used to filter the navigation targets returned.
     *
     * @param {string} sFragmentNoHash The URL hash fragment in internal format (as obtained by the hasher service from SAPUI5,
     *   not as given in <code>location.hash</code>) without the leading "#".
     * @returns {Promise} Resolves an object that you can use to create a {@link sap.ushell.components.container.ApplicationContainer}
     *   or <code>undefined</code> in case the hash fragment was empty.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._resolveHashFragmentBE = function (sFragmentNoHash) {
        const that = this;
        const sFormFactor = Utils.getFormFactor();

        /**
         * @param {string} sUnencoded an OData URL query parameter
         * @returns {string} the encoded OData URL query parameter
         */
        function encodeODataQueryParameter (sUnencoded) {
            /*
             * parameters for OData queries must be url-encoded and single quotes must be escaped
             * by an additional single quote (single quote is not encoded by encodeURIComponent)
             * see internal CSN 0003969932 2013
             */
            return encodeURIComponent(sUnencoded).replace(/'/g, "''");
        }

        const bBatchQueueOpened = this._openBatchQueueUnlessOpen(this._getODataWrapper());

        /**
         * Adds the given post parameters to a url
         *
         * @param {string} sPostParameters
         *    the postParameters field from a NavTargetResult
         *
         * @param {string} sUrl
         *    the url string to add the postParameters to
         *
         * @returns {string}
         *    sUrl with the post parameter added
         */
        function _addPostParametersToNavTargetResultUrl (sPostParameters, sUrl) {
            // add POST parameters to URL
            if (sPostParameters) {
                sUrl += (sUrl.indexOf("?") < 0) ? "?" : "&";
                sUrl += sPostParameters;
            }
            return sUrl;
        }

        return new Promise((fnResolve, fnReject) => {
            this._oODataWrapper.read(`ResolveLink?linkId='${
                encodeODataQueryParameter(sFragmentNoHash)}'&shellType='${ushellUtils.getShellType()}'${
                sFormFactor ?
                    `&formFactor='${encodeODataQueryParameter(sFormFactor)}'` : ""}`,
            (oResult) => {
                let i;
                let sDetails = "";
                let oAdjustedResult;

                if (oResult.results.length) {
                    if (oResult.results.length > 1) {
                    // console log because of multiple targets
                        for (i = 0; i < oResult.results.length; i += 1) {
                            delete oResult.results[i].__metadata; // simplify output
                            sDetails += (i === 0 ? "used target: " : "\nignored target: ")
                                + JSON.stringify(oResult.results[i]);
                        }
                        Log.error("INTEROP service's ResolveLink operation "
                            + `returned ${oResult.results.length} targets for hash '#${
                                sFragmentNoHash}', first one is used.`,
                        sDetails,
                        "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter");
                    }

                    oResult = oResult.results[0];
                    oAdjustedResult = ClientSideTargetResolutionAdapter.prototype._adjustNavTargetResult(oResult);
                    oAdjustedResult.url = _addPostParametersToNavTargetResultUrl(
                        oResult.postParameters, oAdjustedResult.url);

                    // Fix application type to ensure backward compatible behavior after incompatible server-side change.
                    if (oAdjustedResult && oAdjustedResult.applicationType === "SAPUI5") {
                        oAdjustedResult.applicationType = "URL";
                    }

                    that._compactTooLongWdaUrl(oAdjustedResult).then((oCompactedResult) => {
                        fnResolve(oCompactedResult);
                    }).catch((oError) => {
                        Log.error(`Could not resolve link '${sFragmentNoHash}' due to compactation failure`, oError);
                        fnReject(oError);
                    });
                } else {
                    fnReject(new Error(`Could not resolve link '${sFragmentNoHash}'`));
                }
            }, (sErrorMessage) => {
                fnReject(new Error(sErrorMessage));
            });

            if (bBatchQueueOpened) {
                that._getODataWrapper().submitBatchQueue(() => { }, (sErrorMessage) => {
                    fnReject(new Error(sErrorMessage));
                });
            }
        });
    };

    ClientSideTargetResolutionAdapter.prototype._compactTooLongWdaUrl = function (oResult) {
        const sUrl = oResult && oResult.url;

        return new Promise((fnResolve, fnReject) => {
            if (oResult && oResult.applicationType === "NWBC" && sUrl && sUrl.indexOf("/ui2/nwbc/~canvas;window=") === 0 && sUrl.length > this._getWDAUrlShorteningLengthLimit()) {
                this._compactUrl(sUrl)
                    .then((sCompactedUrl) => {
                        oResult.url = sCompactedUrl;
                        fnResolve(oResult);
                    })
                    .catch(fnReject);
            } else {
                // we do not compact
                fnResolve(oResult);
            }
        });
    };

    ClientSideTargetResolutionAdapter.prototype._compactUrl = function (sUrl) {
        const aMatches = sUrl.match(/\?.*/);
        const sMatch = aMatches && aMatches[0];
        const iLengthLimit = this._getWDAUrlShorteningLengthLimit() - 200;

        return new Promise((fnResolve, fnReject) => {
            if (sMatch && sMatch.length < iLengthLimit) {
                return fnResolve(sUrl);
            }

            const oParams = UrlParsing.parseParameters(aMatches[0]);

            Container.getServiceAsync("ShellNavigationInternal")
                .then((oShellNavigationInternal) => {
                    oShellNavigationInternal.compactParams(oParams, aNotCompactedWDAParameters, undefined /* no Component */)
                        .done((oCompactedParams) => {
                            const sReconstructedUrl = `${sUrl.match(/^[^?]*/)[0]}?${UrlParsing.paramsToString(oCompactedParams)}`;
                            fnResolve(sReconstructedUrl);
                        })
                        .fail(fnReject);
                })
                .catch(fnReject);
        });
    };

    ClientSideTargetResolutionAdapter.prototype._getWDAUrlShorteningLengthLimit = function () {
        /*
         * URL compaction for WDA only works if the WDA backend is of a sufficient high release thus this is potentially incompatible
         * if we start compacting URLs for an "old" release on a platform which supports longer urls
         * (where one may have gotten away with overly long URLs before).
         */
        const vNoWDACompact = ushellUtils.getParameterValueBoolean("sap-ushell-nowdaurlshortening");
        if (vNoWDACompact) {
            return 6000000;
        }
        return this._wdLengthLimit;
    };

    /**
     * Resolves a specific system alias.
     *
     * @param {string} sSystemAlias the system alias name to be resolved
     * @returns {Promise} Resolves to a system alias data object. A live object is returned!
     *   The service must not change it. If the alias could not be resolved the promise is rejected.
     *
     *   Format of system alias data object. Example:
     *   <pre>
     *   {
     *     id: "AB1CLNT000",
     *     client: "000",
     *     language: "EN",
     *       http: {
     *         id: "AB1CLNT000_HTTP",
     *         host: "ldcab1.xyz.com",
     *         port: 10000,
     *         pathPrefix: "/abc/def/"
     *       },
     *       https: {
     *         id: "AB1CLNT000_HTTPS",
     *         host: "ldcab1.xyz.com",
     *         port: 20000,
     *         pathPrefix: "/abc/def/"
     *       },
     *       rfc: {
     *         id: "AB1CLNT000",
     *         systemId: "AB1",
     *         host: "ldcsab1.xyz.com",
     *         port: 0,
     *         loginGroup: "PUBLIC",
     *         sncNameR3: "",
     *         sncQoPR3: "8"
     *       }
     *   }
     *   </pre>
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype.resolveSystemAlias = function (sSystemAlias) {
        let sMessage;
        const that = this;
        let oSystemAliasData;

        // check if we have it already
        return new Promise((fnResolve, fnReject) => {
            /*
             * Trigger call to front-end server. This case may occur, for example, during application direct start with
             * a system alias that is not sent by the backend. Backend only sends data about the system aliases that are
             * mentioned in the systemAlias fields of the target mappings (or for virtual target mappings).
             */
            function fnRetryBufferOrUseInterop () {
                oSystemAliasData = that._readSystemAliasFromBuffer(sSystemAlias); // note: already in ClientSideTargetResolutionAdapter format
                if (oSystemAliasData) {
                    Log.debug(
                        `System alias '${sSystemAlias}' is now in buffer`,
                        "Skipping INTEROP service call",
                        "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                    );
                    fnResolve(oSystemAliasData);
                } else {
                    Log.debug(
                        `System alias '${sSystemAlias}' still not in buffer`,
                        "Resolving via INTEROP service",
                        "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                    );
                    that._readSystemAliasViaInterop(sSystemAlias)
                        .catch((oError) => {
                            fnReject(oError);
                        })
                        .then((oOdataSystemAliasData) => {
                            oSystemAliasData = that._fixSystemAlias(oOdataSystemAliasData);

                            if (oSystemAliasData && oSystemAliasData.id) {
                                that._writeSystemAliasToBuffer(oSystemAliasData);
                                fnResolve(oSystemAliasData);
                            } else {
                                sMessage = "Data returned for system alias is not valid. Has no 'id'. System alias data will not be cached.";
                                Log.warning(`ClientSideTargetResolutionAdapter: ${sMessage}`);
                                fnResolve(oSystemAliasData);
                            }
                        });
                }
            }

            oSystemAliasData = this._readSystemAliasFromBuffer(sSystemAlias); // note: already in ClientSideTargetResolutionAdapter format
            if (oSystemAliasData) {
                Log.debug(
                    `System alias '${sSystemAlias}' was already buffered`,
                    "",
                    "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                );
                window.setTimeout(() => {
                    fnResolve(oSystemAliasData);
                }, 0);
            } else {
                Log.debug(
                    `System alias '${sSystemAlias}' is not in buffer`,
                    "",
                    "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                );

                // must wait at least on the small start_up response before using INTEROP

                this._oInitialSegmentPromise.finally(fnRetryBufferOrUseInterop);
            }
        });
    };

    /**
     * Writes an array of objects representing system alias data into the runtime buffer.
     *
     * @param {object|object[]} [vSystemAliases] Array or Object of system aliases
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._writeUserSystemAliasesToBuffer = function (vSystemAliases) {
        const that = this;

        if (typeof vSystemAliases === "undefined") {
            // nop in case no argument or undefined is passed
            return;
        }

        if (isPlainObject(vSystemAliases)) {
            Object.keys(vSystemAliases).forEach((sSystemAliasKey) => {
                that._writeSystemAliasToBuffer(that._fixSystemAlias(vSystemAliases[sSystemAliasKey]));
            });
            return;
        }

        vSystemAliases.forEach((oSystemAlias) => {
            that._writeSystemAliasToBuffer(that._fixSystemAlias(oSystemAlias));
        });
    };

    /**
     * Reads system alias data from the runtime buffer
     *
     * If there is no entry in the buffer for this ID <code>undefined</code> is returned.
     *
     * @param {string} sSystemAliasId ID of the system alias to be retrieved from the buffer.
     * @returns {object} A system alias data object is returned which can be directly passed to the service.
     *   If the buffer does not contain data for that system alias <code> undefined</code> is returned.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._readSystemAliasFromBuffer = function (sSystemAliasId) {
        // note "" means local system alias
        const oResolvedSystemAlias = this._oSystemAliasBuffer.get(sSystemAliasId);

        if (sSystemAliasId === "") {
            if (!oResolvedSystemAlias) {
                return this._oLocalSystemAlias;
            }
            oResolvedSystemAlias.properties = deepExtend({}, this._oLocalSystemAlias.properties, oResolvedSystemAlias.properties || {});
        }

        return oResolvedSystemAlias;
    };

    /**
     * Writes a system alias data from the runtime buffer
     * If there is no entry in the buffer for this ID <code>undefined</code> is returned.
     *
     * @param {string} oSystemAliasData Data to be added to the buffer. The data format has to be the one described in
     *   <code>resolveSystemAlias</code>.
     * @returns {object} The provided system alias data object.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._writeSystemAliasToBuffer = function (oSystemAliasData) {
        if (oSystemAliasData && oSystemAliasData.id) {
            this._oSystemAliasBuffer.put(oSystemAliasData.id, oSystemAliasData);
        }
        return oSystemAliasData;
    };

    /**
     * Amends system alias sent from the backend for robustness.
     * Mostly because the backend serializer deletes any key that has an empty value.
     *
     * @param {object} oSystemAlias System alias data in Odata JSON format
     * @returns {object} The fixed system alias.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._fixSystemAlias = function (oSystemAlias) {
        oSystemAlias = oSystemAlias || {};

        delete oSystemAlias.__metadata;

        const oFixedSystemAlias = {};
        oFixedSystemAlias.id = oSystemAlias.id || "";
        oFixedSystemAlias.client = oSystemAlias.client || "";
        oFixedSystemAlias.language = oSystemAlias.language || "";

        ["http", "https"].forEach((sDestination) => {
            if (oSystemAlias.hasOwnProperty(sDestination)) {
                delete oSystemAlias[sDestination].__metadata;

                if (oSystemAlias[sDestination].id !== "") {
                    oFixedSystemAlias[sDestination] = deepExtend({
                        id: "",
                        host: "",
                        port: "",
                        pathPrefix: ""
                    }, oSystemAlias[sDestination]);
                }
            }
        });

        if (oSystemAlias.hasOwnProperty("rfc") && oSystemAlias.rfc.id) {
            delete oSystemAlias.rfc.__metadata;
            oFixedSystemAlias.rfc = deepExtend({
                id: "",
                systemId: "",
                host: "",
                service: 0,
                loginGroup: "",
                sncNameR3: "",
                sncQoPR3: ""
            }, oSystemAlias.rfc);
        }

        return oFixedSystemAlias;
    };

    /**
     * Reads the system alias data for one system alias ID using the interop service.
     *
     * @param {string} sSystemAliasId System alias ID
     * @returns {Promise} Resolves to a system alias data object in OData JSON format.
     *   If the alias could not be resolved the promise is rejected.
     *   If an empty object is received the promise is resolved.
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype._readSystemAliasViaInterop = function (sSystemAliasId) {
        const sRelativeUrl = `SystemAliases(id='${encodeURIComponent(sSystemAliasId)}')?$format=json`;

        return new Promise((fnResolve, fnReject) => {
            this._getODataWrapper().read(
                sRelativeUrl,
                (oSystemAliasData) => {
                    fnResolve(oSystemAliasData);
                },
                (sErrorMessage) => {
                    fnReject(new Error(sErrorMessage));
                }
            );
        });
    };

    /**
     * Reads and returns the available system aliases from the internal buffer
     *
     * @returns {object} A object containing information about all available system aliases
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype.getSystemAliases = function () {
        return (this._oSystemAliasBuffer && this._oSystemAliasBuffer.entries) || {};
    };

    /**
     * Get the URL template context from the direct startup response and the cached templates.
     *
     * @param {object} oDirectStartResponse The targetMappings member of the start_up response.
     * @returns {object} URL template context.
     */
    ClientSideTargetResolutionAdapter.prototype.getUrlTemplateContext = function (oDirectStartResponse) {
        const oUrlTemplate = this._oURLTemplates[oDirectStartResponse.urlTemplate.id];
        if (!oUrlTemplate) {
            Log.error("No URL template found.");
            return null;
        }

        const site = {
            systemAliases: this.getSystemAliases(),
            urlTemplates: this._oURLTemplates
        };

        return {
            payload: oUrlTemplate.payload,
            site: site,
            siteAppSection: oDirectStartResponse
        };
    };

    return ClientSideTargetResolutionAdapter;
});
