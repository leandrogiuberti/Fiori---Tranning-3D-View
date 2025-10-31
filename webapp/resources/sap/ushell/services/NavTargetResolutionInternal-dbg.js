// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The NavTargetResolutionInternal service.
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils/UrlShortening",
    "sap/ushell/utils/HttpClient",
    "sap/ushell/navigationMode",
    "sap/ui/thirdparty/jquery",
    "sap/ui/performance/Measurement",
    "sap/base/util/deepExtend",
    "sap/base/util/isPlainObject",
    "sap/base/Log",
    "sap/ushell/Container"
], (
    utils,
    UrlParsing,
    UrlShortening,
    HttpClient,
    NavigationMode,
    jQuery,
    Measurement,
    deepExtend,
    isPlainObject,
    Log,
    Container
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.NavTargetResolutionInternal
     * @class
     * @classdesc The Unified Shell's internal navigation target resolution service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");
     *     // do something with the NavTargetResolutionInternal service
     *   });
     * </pre>
     *
     * Methods in this class deal with *internal* representations of the shell hash.
     *
     * configurations:
     *   <code>config : { allowTestUrlComponentConfig  : true }</code>
     *   allow to redefine the Test-url, Test-local1, Test-local2 applications via url parameters
     *   (sap-ushell-test-local1-url=  / sap-ushell-test-local1-additionalInformation=  ... )
     *
     * @param {object} oAdapter Adapter
     * @param {object} oContainerInterface not used
     * @param {string} sParameters not used
     * @param {object} oServiceConfiguration oServiceConfiguration
     *
     * @augments sap.ushell.services.Service
     * @hideconstructor
     *
     * @since 1.120.0
     * @private
     */
    function NavTargetResolutionInternal (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        const oServiceConfig = oServiceConfiguration?.config;
        const fnResolveHashFragment = function (sHashFragment) {
            const oResolutionPromise = this._isClientSideTargetResolutionEnabled()
                ? this._resolveHashFragmentClientSide(sHashFragment)
                : oAdapter.resolveHashFragment(sHashFragment);

            return oResolutionPromise;
        }.bind(this);
        let aLocalResolvedNavTargets;
        // oAdapter resolver is the "last" custom resolver
        const aResolvers = [{
            name: "DefaultAdapter",
            isApplicable: function () { return true; },
            resolveHashFragment: fnResolveHashFragment.bind(this)
        }];
        let oCurrentResolution;

        const oHttpClient = new HttpClient();

        this._isClientSideTargetResolutionEnabled = function () { // need this declaration for fnResolveHashFragment
            return !!(oServiceConfig && oServiceConfig.enableClientSideTargetResolution);
        };

        this._nextResolveHashFragment = function (aCustomResolvers, sHashFragment) {
            const oResolver = aCustomResolvers.pop();

            if (oResolver.isApplicable(sHashFragment)) {
                Log.info(`NavTargetResolutionInternal: custom resolver ${oResolver.name} resolves ${sHashFragment}`);
                const fnNextResolve = this._nextResolveHashFragment.bind(this, aCustomResolvers);

                return oResolver.resolveHashFragment(sHashFragment, fnNextResolve);
            }

            return this._nextResolveHashFragment(aCustomResolvers, sHashFragment);
        };

        /**
         * Resolves shell hash fragment via ClientSideTargetResolution service.
         *
         * @param {string} sHashFragment the hash fragment to be resolved
         * @returns {jQuery.Promise} Resolves the resolution result object.
         * @private
         * @since 1.34.0
         */
        this._resolveHashFragmentClientSide = function (sHashFragment) {
            const oHashValidationResult = this._validateHashFragment(sHashFragment);
            if (!oHashValidationResult.success) {
                return new jQuery.Deferred().reject(new Error(`${sHashFragment} is not a valid hash fragment`)).promise();
            }

            const sFragmentNoHash = oHashValidationResult.hashFragmentWithoutHash;
            return this._resolveHashFragmentClientSideAndFixApplicationType(sFragmentNoHash);
        };

        /**
         * Invokes {@link sap.ushell.services.ClientSideTargetResolution#resolveHashFragment}
         * and fixes any "SAPUI5" applicationType returned in the response to "URL", to avoid backward compatibility problems.
         *
         * @param {string} sFragmentNoHash the hash fragment to resolve
         * @returns {jQuery.Promise} Resolves to an object representing the resolution result
         * @private
         * @since 1.34.0
         */
        this._resolveHashFragmentClientSideAndFixApplicationType = function (sFragmentNoHash) {
            const oDeferred = new jQuery.Deferred();

            Container.getServiceAsync("ClientSideTargetResolution")
                .then((ClientSideTargetResolutionService) => {
                    return ClientSideTargetResolutionService.resolveHashFragment(sFragmentNoHash);
                })
                .then((oResolutionResult) => {
                    // Ensure backward compatible behavior after incompatible server-side change.
                    if (oResolutionResult && oResolutionResult.applicationType === "SAPUI5") {
                        oResolutionResult.applicationType = "URL";
                    }

                    oDeferred.resolve(oResolutionResult);
                })
                .catch(oDeferred.reject);
            return oDeferred.promise();
        };

        /**
         * Determines whether the given hash fragment can be used to navigate to an app.
         *
         * NOTE: throws a {@link sap.ushell.utils#Error} in case the given hash fragment does not start with "#".
         *
         * @param {string} sHashFragment the hash fragment to be validated
         * @returns {object} the validation result. An object like:
         *   <pre>
         *   {
         *     success: {boolean},               // whether the hash fragment looks valid
         *     hashFragmentWithoutHash: {string} // the hash fragment without leading "#"
         *   }
         *   </pre>
         * @private
         * @since 1.34.0
         */
        this._validateHashFragment = function (sHashFragment) {
            let sHashFragmentWithoutHash = "";
            const oValidationResult = {
                success: false
            };

            if (sHashFragment && sHashFragment.charAt(0) !== "#") {
                throw new utils.Error(
                    "Hash fragment expected in _validateHashFragment",
                    "sap.ushell.services.NavTargetResolutionInternal"
                );
            }

            sHashFragmentWithoutHash = sHashFragment.substring(1);

            if (sHashFragmentWithoutHash) {
                oValidationResult.success = true;
            }
            oValidationResult.hashFragmentWithoutHash = sHashFragmentWithoutHash;

            return oValidationResult;
        };

        /**
         * expands a URL hash fragment
         *
         * This function gets the hash part of the URL and expands a sap-intent-param if present and retrievable
         *
         * This is an asynchronous operation.
         *
         * @param {string} sHashFragment The formatted URL hash fragment in internal format
         *   (as obtained by the SAPUI5 hasher service, not as given in <code>location.hash</code>)
         * @returns {jQuery.Promise} Resolves expanded shell hash (in internal format).
         *
         * @private
         */
        this.expandCompactHash = function (sHashFragment) {
            const oDeferred = new jQuery.Deferred();

            // augment URL with application parameters from sHashFragment
            const oParsedShellHash = UrlParsing.parseShellHash(sHashFragment);
            if (oParsedShellHash && oParsedShellHash.params && oParsedShellHash.params["sap-intent-param"]) {
                Container.getServiceAsync("AppState")
                    .then((AppStateService) => {
                        AppStateService.getAppState(oParsedShellHash.params["sap-intent-param"][0])
                            .done((oContainer) => {
                                const sValue = oContainer.getData("sap-intent-param");
                                let sHashFragmentPotentiallyExpanded = sHashFragment;

                                if (sValue) {
                                    sHashFragmentPotentiallyExpanded = UrlShortening.expandParamGivenRetrievalFunction(sHashFragment, "sap-intent-param", () => {
                                        return sValue;
                                    });
                                }

                                oDeferred.resolve(sHashFragmentPotentiallyExpanded);
                            })
                            .fail(() => {
                                oDeferred.resolve(sHashFragment);
                            });
                    })
                    .catch(oDeferred.reject);
            } else {
                oDeferred.resolve(sHashFragment);
            }
            return oDeferred.promise();
        };

        const aWDAGUIAppType = ["NWBC", "WDA", "TR"];

        /**
         * Adjusts the applicationType &quot;SAPUI5&quot; to &quot;URL&quot; and extracts the component name from a resolution result and
         * sets it as separate property <code>ui5ComponentName</code> in the specified object.
         * <p>
         * This is done centrally in the NavTargetResolutionInternal service to avoid parsing of the additionalInformation property at several places.
         * As long as we keep the applicationType URL for ui5 components for backwards compatibility, this is also an indicator that it's a UI5 component.
         * <p>
         * Certain platforms like EP may use results from ABAP backend with custom adapters that do not fix the applicationType back to URL.
         * This is normally done in ABAP adapters which we cannot assume to be present.
         *
         * As soon as the impact for current consumers is clarified, this logic should be done vice versa.
         *
         * @param {object} oResolvedHashFragment the hash fragment resolved by one of the registered resolvers
         * @private
         */
        this._adjustResolutionResultForUi5Components = function (oResolvedHashFragment) {
            if (typeof oResolvedHashFragment !== "object") {
                return;
            }
            delete oResolvedHashFragment["sap.platform.runtime"];
            // TODO: use application type SAPUI5 when impact of incompatibility is clear
            if (oResolvedHashFragment && oResolvedHashFragment.applicationType && oResolvedHashFragment.applicationType === "SAPUI5") {
                oResolvedHashFragment.applicationType = "URL";
            }

            if (oResolvedHashFragment.applicationType === "URL") {
                const aMatches = /^SAPUI5\.Component=(.*)/.exec(oResolvedHashFragment.additionalInformation);
                const sComponentName = aMatches && aMatches[1];
                if (sComponentName) {
                    oResolvedHashFragment.ui5ComponentName = sComponentName;
                }
            }
        };

        /**
         * Determines the sap-system of given resolution result, if present
         *
         * @param {object} sHashFragment the hash fragment resolved by one of the registered resolvers
         * @param {object} oResolutionResult the resolution result
         * @returns {string} a sap-system, if present, or undefined. The result is taken from the following sequence:
         *   <ol>
         *     <li><code>result url</code>if the result url contains a parameter value sap-system, this is the value determined by this function </li>
         *     <li><code>NWBC/TR/WDA</code>If the application type is of one NWBC/TR/WDA and no sap-system is part of the *resolved* url or already,
         *     sap-system is taken from the these original hash if present </li>
         *     <li><code>undefined</code> otherwise </li>
         *   </ol>
         *   Note: in this manner sap-system can be overwritten for SAPUI5 applications within the target mapping
         * @private
         */
        this._getSapSystem = function (sHashFragment, oResolutionResult) {
            let sSystem;
            if (oResolutionResult && oResolutionResult["sap-system"]) {
                return oResolutionResult["sap-system"];
            }
            if (oResolutionResult && oResolutionResult.url) {
                sSystem = new URL(oResolutionResult.url, window.location.href).searchParams.get("sap-system");
                if (sSystem) {
                    return sSystem;
                }
            }
            if (aWDAGUIAppType.indexOf(oResolutionResult.applicationType) >= 0 && sHashFragment && sHashFragment.substring(1)) {
                sSystem = new URL(sHashFragment.substring(1), window.location.href).searchParams.get("sap-system");
                if (sSystem) {
                    return sSystem;
                }
            }
            return undefined;
        };

        /**
         * Resolves a navigation target taking into account the sap-system
         *
         * This function should be used by the NWBC browser in order to get a resolved target corresponding to a certain configuration object describing the target.
         * Do not use this function for developing Fiori applications.
         *
         * @param {object} oArgs
         * <pre>
         *   {
         *     target : {
         *       semanticObject : "semantic object",
         *       action : "action",
         *     },
         *     params :  {
         *       "sap-system-src": "e.g. sid(UR5.120)",
         *       "sap-system": {
         *         ... data related to the sap-system
         *       }
         *     }
         *   }
         * </pre>
         * @returns {jQuery.Promise} Resolves an object. Typically it contains the following information:
         *   <pre>
         *   {
         *     "url": "/sap/bc/",
         *     "text": "My targetmapping description",
         *     "externalNavigationMode": boolean
         *   }
         *   </pre>
         *
         * @protected
         */
        this.resolveTarget = function (oArgs) {
            const oArgsClone = deepExtend({}, oArgs);
            const oDeferred = new jQuery.Deferred();

            Measurement.average("sap.ushell.navigation.resolveTarget");

            utils.storeSapSystemToLocalStorage(oArgsClone);
            const sHashFragment = UrlParsing.constructShellHash(oArgsClone);

            Container.getServiceAsync("NavTargetResolutionInternal")
                .then((NavTargetResolutionService) => {
                    NavTargetResolutionService.resolveHashFragment(`#${sHashFragment}`)
                        .done((oResolved) => {
                            Measurement.end("sap.ushell.navigation.resolveTarget");

                            oDeferred.resolve({
                                url: oResolved.url,
                                text: oResolved.text,
                                externalNavigationMode: oResolved.targetNavigationMode === "explace"
                            });
                        })
                        .fail(oDeferred.reject);
                })
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Resolves the URL hash fragment.
         *
         * This function should be used by a custom renderer in order to implement custom navigation. Do not use this function for developing Fiori applications.
         *
         * This function gets the hash part of the URL and returns data of the target application.
         *
         * Example of the returned data:
         *   <pre>
         *   {
         *     "additionalInformation": "SAPUI5.Component=sap.ushell.renderer.search.container",
         *     "applicationType": "URL",
         *     "url": "/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderer/search/container",
         *     "navigationMode": "embedded"
         *   }
         *   </pre>
         *
         * This is an asynchronous operation.
         *
         * @param {string} sHashFragment The formatted URL hash fragment in internal format (as obtained by the SAPUI5 hasher service) not as given in <code>location.hash</code>)!
         *   Example: <code>#SemanticObject-action?P1=V1&P2=A%20B%20C</code>
         * @returns {jQuery.Promise} Resolves an object that you can use to create a {@link sap.ushell.components.container.ApplicationContainer}
         *   or <code>undefined</code> in case the hash fragment was empty. Typically it contains the following information:
         *   <pre>
         *   {
         *     "applicationType": "URL",
         *     "url": "/sap/bc/",
         *     "additionalInformation": "SAPUI5.Component=com.sap.AComponent",
         *     "text": "My targetmapping description",
         *     "navigationMode": "embedded"
         *   }
         *   </pre>
         *   <p>
         *   The <code>navigationMode</code> indicates how the target application should be navigated.
         *   It is added to the result using the logic in {@link navigationMode#getNavigationMode} if none of the resolvers in the chain added it.
         *   </p>
         *   <p>No navigation should occur when the promise is resolved to <code>undefined</code>.</p>
         *
         * @private
         */
        this.resolveHashFragment = function (sHashFragment) {
            const oDeferred = new jQuery.Deferred();

            Measurement.average("sap.ushell.navigation.resolveHashFragment");

            this.expandCompactHash(sHashFragment)
                .done((sHashFragmentPotentiallyExpanded) => {
                    let oErrorDeferred = jQuery.when();

                    if (sHashFragmentPotentiallyExpanded.indexOf("sap-ushell-enc-test") >= 0) {
                        const aMatch = /sap-ushell-enc-test=([^&]*)(&.*)?$/.exec(sHashFragmentPotentiallyExpanded);
                        if (aMatch) {
                            const sSapUshellEncTestValue = aMatch[1];

                            if (sSapUshellEncTestValue !== "A%20B%2520C") {
                                oErrorDeferred = new jQuery.Deferred();

                                Container.getServiceAsync("MessageInternal")
                                    .then((MessageService) => {
                                        MessageService.error("This navigation is flagged as erroneous because" +
                                            " (likely the calling procedure) generated a wrong encoded hash." +
                                            " Please track down the encoding error and make sure to use the CrossApplicationNavigation service for navigation.",
                                        "Navigation encoding wrong");
                                        oErrorDeferred.resolve();
                                    })
                                    .catch(oErrorDeferred.reject);
                            }
                            sHashFragmentPotentiallyExpanded = sHashFragmentPotentiallyExpanded.replace(/sap-ushell-enc-test=([^&]*)&/, "");
                            sHashFragmentPotentiallyExpanded = sHashFragmentPotentiallyExpanded.replace(/[&?]sap-ushell-enc-test=([^&]*)$/, "");
                        }
                    }
                    let oPromise = this._invokeResolveHashChain(sHashFragmentPotentiallyExpanded);

                    // if method present on adapter, chain through it (adapter has complete freedom to change success into failure etc.)
                    if (typeof oAdapter.processPostResolution === "function") {
                        oPromise = oAdapter.processPostResolution(sHashFragmentPotentiallyExpanded, oPromise);
                    }

                    jQuery.when(oPromise, oErrorDeferred)
                        .done((oResult) => {
                            this._adjustResolutionResultForUi5Components(oResult);

                            if (oResult && oResult.navigationMode !== undefined) {
                                oResult.targetNavigationMode = NavigationMode.getExternalNavigationMode(
                                    oResult.navigationMode
                                );
                            } else {
                                Log.error("Resolution Result doesn't contain mandatory navigationMode!", "sap.ushell.services.NavTargetResolutionInternal");
                            }

                            // add a sap-system if not already there
                            if (isPlainObject(oResult) && !oResult.hasOwnProperty("sap-system")) {
                                const sSapSystem = this._getSapSystem(sHashFragment, oResult);
                                if (sSapSystem) {
                                    oResult["sap-system"] = sSapSystem;
                                }
                            }
                            Measurement.end("sap.ushell.navigation.resolveHashFragment");

                            oDeferred.resolve(oResult);
                        })
                        .fail(oDeferred.reject);
                })
                .fail(oDeferred.reject);

            return oDeferred.promise().done((oResult) => {
                return this._recordNavigation("resolveHashFragment", { sHashFragment: sHashFragment }, oResult);
            });
        };

        this._invokeResolveHashChain = function (sHashFragment) {
            const oCRs = aResolvers.map((a) => { return a; });

            return this._nextResolveHashFragment(oCRs, sHashFragment).done((oResolution) => {
                oCurrentResolution = oResolution;
            });
        };

        this.baseResolveHashFragment = fnResolveHashFragment.bind(this);

        /**
         * Returns the method that allows to return results for the getLinks method along with meta information to handle the method call.
         * @param {object} oArgs argument object
         * @returns {object} an object like:
         *   <pre>
         *   {
         *     resolver: function () { ... },      // a bound resolver that can produce results for getLinks
         *     warning: "some error details",      // a message that can be used to produce a warning
         *     isGetSemanticObjectLinksCall: false // whether the getSemanticObjectLinks (not supporting action will be called)
         *   }
         *   </pre>
         * @private
         * @since 1.38.0
         */
        this._getGetLinksResolver = function (oArgs) {
            let fnGetLinksBound;

            // decide which method to call
            if (this._isClientSideTargetResolutionEnabled()) {
                fnGetLinksBound = this._getLinksClientSide.bind(this);
                return {
                    resolver: fnGetLinksBound,
                    warning: undefined,
                    isGetSemanticObjectLinksCall: false
                };
            }

            // must call the adapter

            if (Object.prototype.toString.apply(oArgs.paramsOptions) === "[object Array]"
                && oArgs.paramsOptions.length > 0) {
                Log.warning(
                    "Parameter options supplied to #getLinks will be ignored because FLP is not configured to use sap.ushell.services.ClientSideTargetResolution for target resolution",
                    `provided parameters options: ${JSON.stringify(oArgs.paramsOptions, null, 4)}`,
                    "sap.ushell.services.NavTargetResolutionInternal"
                );
            }

            // try getLinks
            fnGetLinksBound = oAdapter && oAdapter.getLinks && oAdapter.getLinks.bind(oAdapter);
            if (fnGetLinksBound) {
                return {
                    resolver: fnGetLinksBound,
                    warning: undefined,
                    isGetSemanticObjectLinksCall: false
                };
            }

            // fall back to getSemanticObjectLinks call
            fnGetLinksBound = oAdapter && oAdapter.getSemanticObjectLinks && oAdapter.getSemanticObjectLinks.bind(oAdapter);

            if (fnGetLinksBound) {
                return {
                    resolver: fnGetLinksBound,
                    warning: oArgs.hasOwnProperty("action")
                        ? "the action argument was given, however, NavTargetResolutionAdapter does not implement getLinks method. Action will be ignored."
                        : undefined,
                    isGetSemanticObjectLinksCall: true // force
                };
            }

            return {
                resolver: undefined,
                warning: "Cannot determine resolver for getLinks method",
                isGetSemanticObjectLinksCall: undefined
            };
        };

        /**
         * Resolves a semantic object/action and business parameters to a list of links, taking into account the form factor of the current device.
         *
         * @param {object} oArgs An object containing nominal arguments for the method, having the following structure:
         *   {
         *     semanticObject: "Object", // optional (matches all semantic objects)
         *     action: "action",         // optional (matches all actions)
         *     params: {                 // optional business parameters
         *       A: "B",
         *       C: ["e", "j"]
         *     },
         *     paramsOptions: [ { name: "A", required: true } ], // optional
         *     ignoreFormFactor: true,       // optional, defaults to true
         *     ui5Component: UI5Component,   // optional, the UI5 component invoking the service
         *     treatTechHintAsFilter : true, // optional, defaults to false
         *                                   // if true, only apps that match exactly the supplied technology
         *                                   // (e.g. sap-ui-tech-hint=WDA) will be considered
         *     appStateKey: "abc123...",   // optional, application state key to add to the generated links,
         *                                 // SAP internal usage only
         *     compactIntents: true        // optional, whether intents should be returned in compact (=URLShortened) format.
         *                                 // Defaults to false.
         *   }
         *   <p>
         *   Note: positional arguments supported prior to version 1.38.0 are now deprecated.
         *   The caller should always specify nominal parameters, using an object.
         *   Also, wildcards for semanticObject and action parameters are now expressed via <code>undefined</code>,
         *   or by just omitting the parameter in the object.
         *   </p>
         * @returns {jQuery.Promise} Resolves with an array of links objects containing (at least) the following properties:
         *   <pre>
         *   {
         *     intent: "#AnObject-Action?A=B&C=e&C=j",
         *     text: "Perform action",
         *     icon: "sap-icon://Fiori2/F0018",   //optional
         *     subTitle: "Action", //optional
         *     shortTitle: "Perform" //optional
         *   }
         *   </pre>
         *   <b>NOTE:</b> the intents returned are in <b>internal</b> format and cannot be directly put into a link tag.
         *   <p>
         *   Example: Let the string <code>"C&A != H&M"</code> be a parameter value.
         *   Intent will be encoded as<code>#AnObject-action?text=C%26A%20!%3D%20H%26M<code>.
         *   Note that the intent is in <b>internal</b> format, before putting it into a link tag, you must invoke:
         *     <code>externalHash = oCrossApplicationNavigationService.hrefForExternal({ target : { shellHash :  oLink.intent} }, that.oComponent);</code>
         *   </p>
         * @private
         * @since 1.38.0
         */
        this.getLinks = function (oArgs) {
            const sSemanticObject = oArgs.semanticObject;
            const mParameters = oArgs.params;
            const bIgnoreFormFactor = oArgs.ignoreFormFactor;
            const oComponent = oArgs.ui5Component;
            const sAppStateKey = oArgs.appStateKey;
            const bCompactIntents = oArgs.compactIntents;
            const oDeferred = new jQuery.Deferred();

            if (/\?/.test(sSemanticObject)) {
                throw new Error("Parameter must not be part of semantic object");
            }

            let oParameters = (mParameters === undefined) ? undefined : JSON.parse(JSON.stringify(mParameters));
            if (sAppStateKey) {
                oParameters = oParameters || {};
                oParameters["sap-xapp-state"] = encodeURIComponent(sAppStateKey);
            }

            // outcome determines whether the process of getting links is delegated to ClientSideTargetResolution or NavTargetResolutionAdapter.
            // additional property, 'tags' does not influence how _getGetLinksResolver behaves
            const oResolverResult = this._getGetLinksResolver(oArgs);

            // warn that functionality is lost in this case
            if (oResolverResult.warning) {
                Log.warning("A problem occurred while determining the resolver for getLinks", oResolverResult.warning, "sap.ushell.services.NavTargetResolutionInternal");
            }

            const fnResolverBound = oResolverResult.resolver;

            if (fnResolverBound) {
                const fnHandleGetLinksSuccess = function (aSemanticObjectLinks) {
                    if (bCompactIntents) {
                        this._shortenGetSemanticObjectLinksResults(aSemanticObjectLinks, oComponent)
                            .done(oDeferred.resolve);
                    } else {
                        oDeferred.resolve(aSemanticObjectLinks);
                    }
                }.bind(this);

                // this will be true for old legacy platform
                if (oResolverResult.isGetSemanticObjectLinksCall) {
                    // 'this' in fnResolverBound will be nav target resolution adapter

                    // The portal still does server side resolution on the ABAP server.
                    // In here, long parameters are not sent to the server.
                    // So we use the hrefForExternal to obtain a sap-intent-param and actually truncate the original list of parameters...
                    const oHrefForExternalArg = {
                        target: {
                            semanticObject: sSemanticObject,
                            action: "dummyAction"
                        },
                        params: oParameters
                    };

                    Container.getServiceAsync("ShellNavigationInternal").then((ShellNavigationService) => {
                        ShellNavigationService.hrefForExternal(oHrefForExternalArg, true, oComponent)
                            .then((oResVerboseCompacted) => {
                                // may contain sap-intent-param (but server does nothing with it)
                                const oMaybeCompactedParameters = oResVerboseCompacted.params || oParameters;

                                fnResolverBound(sSemanticObject, oMaybeCompactedParameters, bIgnoreFormFactor)
                                    .then(fnHandleGetLinksSuccess)
                                    .catch(oDeferred.reject);
                            })
                            .catch(oDeferred.reject);
                    });
                } else {
                    // 'this' in fnResolverBound will be client side target resolution
                    fnResolverBound(oArgs) // safe to pass oArgs (it's handled at CrossApplicationNavigation level)
                        .done(fnHandleGetLinksSuccess)
                        .fail(oDeferred.reject);
                }
            } else {
                oDeferred.resolve([]);
            }

            return oDeferred.promise().done((aLinks) => {
                return this._recordNavigation("getLinks", { oArgs: oArgs }, aLinks);
            });
        };

        /**
         * Returns a list of unique semantic objects assigned to the current user.
         * Tries to use client side target resolution if it is enabled, falls back to the NavTargetResolutionInternal adapter implementation otherwise.
         *
         * @returns {jQuery.Promise} Resolves with an array of strings
         *   representing the User's semantic objects or rejects with an error message.
         *   <p>NOTE: semantic objects are returned in lexicographical order in the result array.</p>
         * @private
         * @since 1.38.0
         */
        this.getDistinctSemanticObjects = function () {
            const oDeferred = new jQuery.Deferred();

            if (this._isClientSideTargetResolutionEnabled()) {
                // Only require service if ClientSideTargetResolution is enabled

                Container.getServiceAsync("ClientSideTargetResolution")
                    .then((ClientSideTargetResolutionService) => {
                        return ClientSideTargetResolutionService.getDistinctSemanticObjects();
                    })
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);

                return oDeferred.promise().done((aResults) => {
                    return this._recordNavigation("getDistinctSemanticObjects", {}, aResults);
                });
            }

            // Use the adapter if it implements this functionality
            if (oAdapter && oAdapter.getDistinctSemanticObjects) {
                return oAdapter.getDistinctSemanticObjects();
            }

            Log.error(
                "Cannot execute getDistinctSemanticObjects method",
                "ClientSideTargetResolution must be enabled or NavTargetResolutionAdapter must implement getDistinctSemanticObjects method",
                "sap.ushell.services.NavTargetResolutionInternal"
            );

            return oDeferred.reject(new Error("Cannot execute getDistinctSemanticObjects")).promise();
        };

        this._getLinksClientSide = function (oArgs) {
            const oDeferred = new jQuery.Deferred();
            const oCallWithExpandedParamsDeferred = new jQuery.Deferred(); // always resolved

            /*
             * Expand url parameters in case these come compacted.
             * This is necessary because ClientSideTargetResolution service does not deal with expansion/compaction of parameters.
             *
             * Note that the service returns non-compacted results!
             * This is ok as the client is expected to invoke hrefForExternal again to generate a URL which is effectively compacted
             */
            if ((oArgs.params || {}).hasOwnProperty("sap-intent-param")) {
                const sCompactHash = `#${oArgs.semanticObject}-dummyAction?${UrlParsing.paramsToString(oArgs.params)}`;
                this.expandCompactHash(sCompactHash)
                    .done((sExpandedHash) => {
                        const oParsedHash = UrlParsing.parseShellHash(sExpandedHash);

                        oCallWithExpandedParamsDeferred.resolve(oParsedHash.params); // expanded params
                    })
                    .fail(oDeferred.reject);
            } else {
                oCallWithExpandedParamsDeferred.resolve(oArgs.params);
            }

            oCallWithExpandedParamsDeferred.done(() => {
                Container.getServiceAsync("ClientSideTargetResolution")
                    .then((ClientSideTargetResolutionService) => {
                        return ClientSideTargetResolutionService.getLinks(oArgs);
                    })
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Shortens all URLs found in the result of getSemanticObjectLinks.
         *
         * @param {object[]} aGetSemanticObjectLinksResults the result of {@link #getSemanticObjectLinks}
         * @param {object} oComponent a SAPUI5 component. The same passed to getSemanticObjectLinks}.
         * @returns {jQuery.Promise} Always resolves to an array with the same
         *   structure as the array returned from getSemanticObjectLinks, but with shortened intents.
         *   NOTE: if it's not possible to shorten an intent in the input array, a warning is logged on the console and the entire intent is kept.
         * @private
         * @since 1.32.0
         */
        this._shortenGetSemanticObjectLinksResults = function (aGetSemanticObjectLinksResults, oComponent) {
            const aSemanticObjectLinksShortened = [];
            let i = 0;
            let iPromisesToResolve = aGetSemanticObjectLinksResults.length;
            const oDeferred = new jQuery.Deferred();

            Container.getServiceAsync("ShellNavigationInternal")
                .then((ShellNavigationService) => {
                    aGetSemanticObjectLinksResults.forEach((oIntent) => {
                        const oUrlParts = UrlParsing.parseShellHash(oIntent.intent);
                        const oCompactParamsPromise = ShellNavigationService.compactParams(oUrlParts.params, undefined, oComponent);

                        aSemanticObjectLinksShortened.push(oCompactParamsPromise);

                        aSemanticObjectLinksShortened[i]
                            .done(((index, oCompactParams) => {
                                aSemanticObjectLinksShortened[index] = {
                                    text: oIntent.text,
                                    intent: `#${oUrlParts.semanticObject}-${oUrlParts.action}?${
                                        UrlParsing.paramsToString(oCompactParams)}`
                                };
                            }).bind(null, i))
                            .fail(((iIdx, sMsg) => {
                                Log.warning(
                                    "Cannot shorten GetSemanticObjectLinks result, using expanded form",
                                    `Failure message: ${sMsg}; intent had title ''${oIntent.title}'' and link ''${oIntent.intent}'`,
                                    "sap.ushell.services.NavTargetResolutionInternal"
                                );
                                aSemanticObjectLinksShortened[iIdx] = {
                                    text: oIntent.text,
                                    intent: oIntent.intent
                                };
                            }).bind(null, i))
                            .always(() => {
                                iPromisesToResolve--;

                                if (iPromisesToResolve === 0) {
                                    oDeferred.resolve(aSemanticObjectLinksShortened);
                                }
                            });
                        i++;
                    });
                })
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Tells whether the given intent(s) are supported, taking into account the form factor of the current device.
         * "Supported" means that navigation to the intent is possible.
         *
         * @param {string[]} aIntents the intents (such as <code>"#AnObject-action?A=B&C=e&C=j"</code>) to be checked.
         *   The intents must be in internal format and expanded.
         * @returns {jQuery.Promise} Resolves with a map containing the intents from <code>aIntents</code> as keys.
         *   The map values are objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         *   <pre>
         *   {
         *     "#AnObject-action?A=B&C=e&C=j": { supported: false },
         *     "#AnotherObject-action2": { supported: true }
         *   }
         *   </pre>
         * @deprecated since 1.31. Please use {@link #isNavigationSupported} instead. Note that this has a slightly different response!
         */
        this.isIntentSupported = function (aIntents) {
            const mResult = {};
            const oDeferred = new jQuery.Deferred();

            if (this._isClientSideTargetResolutionEnabled()) {
                // NOTE: request ClientSideTargetResolution service only if enabled!
                Container.getServiceAsync("ClientSideTargetResolution")
                    .then((ClientSideTargetResolutionService) => {
                        return ClientSideTargetResolutionService.isIntentSupported(aIntents);
                    })
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);

                return oDeferred.promise();
            }

            // Adapter based implementation
            if (oAdapter.isIntentSupported) {
                return oAdapter.isIntentSupported(aIntents);
            }

            // Fallback for no adapter available
            aIntents.forEach((sIntent) => {
                mResult[sIntent] = { supported: undefined };
            });
            return oDeferred.resolve(mResult).promise();
        };

        /**
         * Tells whether the given intent(s) are supported, taking into account the form factor of the current device.
         * "Supported" means that navigation to the intent is possible.
         *
         * @param {string[]} aIntents the intents (such as <code>"#AnObject-action?A=B&C=e&C=j"</code>) to be checked.
         *   The intents must be in internal format and expanded.
         * @returns {jQuery.Promise} Resolves with a map containing the intents from <code>aIntents</code> as keys.
         *   The map values are objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         *   <pre>
         *   {
         *     "#AnObject-action?A=B&C=e&C=j": { supported: false },
         *     "#AnotherObject-action2": { supported: true }
         *   }
         *   </pre>
         * @private
         *
         */
        this._isIntentSupported = function (aIntents) {
            const mResult = {};
            const oDeferred = new jQuery.Deferred();

            if (this._isClientSideTargetResolutionEnabled()) {
                // NOTE: request ClientSideTargetResolution service only if enabled!
                Container.getServiceAsync("ClientSideTargetResolution")
                    .then((ClientSideTargetResolutionService) => {
                        return ClientSideTargetResolutionService.isIntentSupported(aIntents);
                    })
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);

                return oDeferred.promise();
            }

            // Adapter based implementation
            if (oAdapter.isIntentSupported) {
                return oAdapter.isIntentSupported(aIntents);
            }

            // Fallback for no adapter available
            aIntents.forEach((sIntent) => {
                mResult[sIntent] = { supported: undefined };
            });
            return oDeferred.resolve(mResult).promise();
        };

        /**
         * Tells whether the given navigation intent(s) are supported for the given parameters
         * Supported" means that a valid navigation target is configured for the user for the given device form factor.
         *
         * This is effectively a test function for {@link toExternal}/ {@link hrefForExternal}.
         * It function accepts the same input as {@link toExternal}/ {@link hrefForExternal}.
         *
         * @param {object[]} aIntents the intents (such as <code>["#AnObject-action?A=B&c=e"]</code>) to be checked
         *   with object being instances the oArgs object of toExternal, hrefForExternal etc.
         *   e.g.
         * <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { A : "B" }
         *   }
         * </pre>
         *   or e.g.
         * <pre>
         *   {
         *     target : { semanticObject : "AnObject", action: "action" },
         *     params : { A : "B", c : "e" }
         *   }
         * </pre>
         *   or
         *   <code>{ target : { shellHash : "AnObject-action?A=B&c=e" } }</code>
         * @returns {jQuery.Promise} Resolves an array of objects representing whether the intent is supported or not objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         *
         *   aIntents:
         *     an array of parameterized (parsed) Intent objects, in the corresponding structure to arguments to
         *     {@link sap.ushell.services.CrossApplicationNavigation.toExternal}, {@link sap.ushell.services.CrossApplicationNavigation.hrefForExternal}
         *     <pre>
         *     [
         *       {
         *         target : {
         *           semanticObject : "AnObject",
         *           action: "action"
         *         },
         *         params : { P1 : "B", P2 : [ "V2a", "V2b"] }
         *       },
         *       {
         *         target : {
         *           semanticObject : "SalesOrder",
         *           action: "display"
         *         },
         *         params : { P3 : "B", SalesOrderIds : [ "4711", "472"] }
         *       }
         *     ]
         *     </pre>
         *
         * The following formats are also supported as input to ease migration of existing code:
         *   <code>[ "#AnObject-action?P1=B&SalesOrderIds=4711&SalesOrderIds=472" ]</code>
         *
         * response:
         *   <pre>
         *   [
         *     { supported: false },
         *     { supported: true }
         *   ]
         *   </pre>
         *
         * Example usage:
         * <pre>
         *   this.oCrossAppNav.isNavigationSupported([ ])
         *   .done(function(aResponses) {
         *     if (oResponse[0].supported===true){
         *       // enable link
         *     }
         *     else {
         *       // disable link
         *     }
         *   })
         *   .fail(function() {
         *     // disable link
         *     // request failed or other fatal error
         *   });
         * </pre>
         *
         * @since 1.32
         * @private
         */
        this.isNavigationSupported = function (aIntents) {
            const oDeferred = new jQuery.Deferred();
            let aIntentsAsString = [];
            aIntentsAsString = aIntents.map((oArg) => {
                if (typeof oArg === "string") {
                    return oArg;
                }
                return `#${UrlParsing.constructShellHash(oArg)}`;
            });
            this._isIntentSupported(aIntentsAsString).done((oResult) => {
                const aResults = aIntentsAsString.map((sIntent) => { return oResult[sIntent] || { supported: false }; });
                oDeferred.resolve(aResults);
            }).fail(oDeferred.reject.bind(oDeferred));

            return oDeferred.promise().done((aResults) => {
                return this._recordNavigation("isNavigationSupported", { aIntents: aIntents }, aResults);
            });
        };

        /**
         * if the usageRecorder config is enabled, records a navigation for the
         * given function name with given input and output.
         *
         * @param {string} sFunctionName The name of the function called.
         * @param {object} oParameters The input parameters of the function.
         * @param {object|array} vResult The output result of the function.
         * @returns {object|array} The output result for further processing.
         * @private
         */
        this._recordNavigation = function (sFunctionName, oParameters, vResult) {
            const oUsageRecorderConfig = oServiceConfig?.usageRecorder || {};
            if (oUsageRecorderConfig.enabled) {
                const sUsageRecorderEndpoint = oUsageRecorderConfig.serviceUrl || "/navigation/api/v2/record";
                oHttpClient.post(sUsageRecorderEndpoint, {
                    headers: {
                        "content-type": "application/json; charset=utf-8"
                    },
                    data: {
                        function: sFunctionName,
                        parameters: JSON.stringify(oParameters),
                        result: JSON.stringify(vResult)
                    }
                });
            }

            return vResult;
        };

        /**
         * Register a custom resolver for semantic objects
         *
         * The resolver must be JavaScript object with a string property name, and two functions
         * resolveHashFragment(sHashFragment,nextResolver) returning a promise and isApplicable(sHashFragment) returning a boolean
         *
         * @param {object} oResolver the custom resolver
         * @returns {boolean} true if resolver was registered, false otherwise
         *
         * @private
         * @ui5-restricted cp.portal
         */
        this.registerCustomResolver = function (oResolver) {
            // verify oResolver
            if (typeof oResolver.name !== "string") {
                Log.error("NavTargetResolutionInternal: Custom Resolver must have name {string} member");
                return false;
            }
            if (typeof oResolver.isApplicable !== "function") {
                Log.error("NavTargetResolutionInternal: Custom Resolver must have isApplicable member");
                return false;
            }
            if (typeof oResolver.resolveHashFragment !== "function") {
                Log.error("NavTargetResolutionInternal: Custom Resolver must have \"resolveHashFragment\" member");
                return false;
            }
            aResolvers.push(oResolver);
            return true;
        };

        // specific custom resolvers enabled by a configuration
        // #1 localResolveNavigationResolver : given an array in config.resolveLocal, resolve
        // given SO-action strings to a locally supplied configuration member of a resolveLocal setting are locally resolved
        if (oServiceConfig && Array.isArray(oServiceConfig.resolveLocal)) {
            // register a custom resolver which redirects all !allowed to defaultOthersTo
            aLocalResolvedNavTargets = oServiceConfig.resolveLocal.map((oArg) => {
                return oArg.linkId;
            });
            this.registerCustomResolver({
                name: "localResolveNavigationResolver",
                cleanHash: function (sHashFragment) {
                    if (sHashFragment === "") {
                        return "#";
                    }
                    const res = UrlParsing.parseShellHash(sHashFragment.substring(1));
                    if (!res) {
                        return "#";
                    }
                    sHashFragment = `#${res.semanticObject}-${res.action}`;
                    return sHashFragment;
                },
                _getIndex: function (sOrigHashFragment) {
                    const sHashFragment = this.cleanHash(sOrigHashFragment);
                    return aLocalResolvedNavTargets.indexOf(sHashFragment.substring(1));
                },
                // applicability test
                isApplicable: function (sOrigHashFragment) {
                    return this._getIndex(sOrigHashFragment) >= 0;
                },
                // replace hash, then resolve to app
                resolveHashFragment: function (sHashFragment) {
                    const idx = this._getIndex(sHashFragment);
                    const oDeferred = new jQuery.Deferred();
                    const oResolvedResult = JSON.parse(JSON.stringify(oServiceConfig.resolveLocal[idx].resolveTo));

                    // augment url with application parameters from sHashFragment
                    const obj = UrlParsing.parseShellHash(sHashFragment);
                    if (obj && obj.params) {
                        const sParams = UrlParsing.paramsToString(obj.params);
                        if (sParams) {
                            const hasQM = oResolvedResult.url.indexOf("?") >= 0;
                            oResolvedResult.url = oResolvedResult.url + (hasQM ? "&" : "?") + sParams;
                        }
                    }

                    oDeferred.resolve(oResolvedResult);
                    return oDeferred.promise();
                }
            });
        }

        /*
         * Register one fixed sample resolver for local resolution (portal use case)
         *     #Test-local1 => local storage key  "sap.ushell#Test-local1"
         *     #Test-local2 => local storage key  "sap.ushell#Test-local1"
         *     #Test-url => sap-ushell-test-local1 , sap-ushell-test-url1-additionalInformation
         *     #Test-config
         */
        this.registerCustomResolver({
            name: "LocalResolver",
            aElement: undefined,
            cleanHash: function (sHashFragment) {
                if (sHashFragment === "") {
                    return undefined;
                }
                const res = UrlParsing.parseShellHash(sHashFragment.substring(1));
                if (!res) {
                    return undefined;
                }
                sHashFragment = `#${res.semanticObject}-${res.action}`;
                return sHashFragment;
            },
            isApplicable: function (sHashFragment) {
                sHashFragment = this.cleanHash(sHashFragment);
                if (!sHashFragment) {
                    return false;
                }
                return sHashFragment === "#Test-url" ||
                    sHashFragment === "#Test-local1" ||
                    sHashFragment === "#Test-local2" ||
                    sHashFragment === "#Test-config" ||
                    sHashFragment === "#Test-clear";
            },
            parseUrl: function (url) {
                if (!this.aElement) {
                    this.aElement = window.document.createElement("a");
                }
                this.aElement.href = url;
                return this.aElement;
            },
            resolveHashFragment: function (sHashFragment) {
                const oDeferred = new jQuery.Deferred();
                const that = this;
                sHashFragment = this.cleanHash(sHashFragment);
                if (!sHashFragment) {
                    return false;
                }
                const hardCoded = {
                    "#Test-config": {
                        applicationType: "URL",
                        url: "/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/demoapps/FioriSandboxConfigApp",
                        additionalInformation: "SAPUI5.Component=sap.ushell.demoapps.FioriSandboxConfigApp",
                        navigationMode: "embedded"
                    },
                    none: {
                        applicationType: "URL",
                        url: "",
                        additionalInformation: ""
                    }
                };
                function getFromLocalStorage (sKey) {
                    if (localStorage) {
                        return localStorage[sKey];
                    }
                    return undefined;
                }
                // return undefined URL if not in same domain
                function localURL (sUrl) {
                    if (utils.calculateOrigin(that.parseUrl(sUrl)) !== utils.calculateOrigin(window.location)) {
                        return undefined;
                    }
                    return sUrl;
                }
                function getURLParameter (sKey) {
                    return new URLSearchParams(window.location.search).get(sKey);
                }
                function addToLocalStorage (sKey, sValue) {
                    if (localStorage) {
                        localStorage[sKey] = sValue;
                    }
                }
                let res;
                if (hardCoded[sHashFragment]) {
                    res = hardCoded[sHashFragment];
                } else if (sHashFragment === "#Test-clear") {
                    addToLocalStorage("sap.ushell.#Test-local1", undefined);
                    addToLocalStorage("sap.ushell.#Test-local2", undefined);
                    Log.info("NavTargetResolutionInternal: Local storage keys for #Test have been cleared");
                    res = hardCoded["#Test-config"];
                } else if (sHashFragment === "#Test-local1" || sHashFragment === "#Test-local2" || sHashFragment === "#Test-url") {
                    res = getFromLocalStorage(`sap.ushell.${sHashFragment}`);
                    let oLocal;
                    if (!res || res === "undefined") {
                        oLocal = { applicationType: "URL", navigationMode: "embedded" };
                    } else {
                        oLocal = JSON.parse(res);
                    }
                    // Configuring an app via url parameters is restricted to localhost for security reasons,
                    // unless explicitly enabled by config
                    if ((window.location.hostname === "localhost") ||
                        (oServiceConfig && oServiceConfig.allowTestUrlComponentConfig)) {
                        const sPrefix = `sap-ushell-test-${sHashFragment.substring(6)}`;
                        const additionalInformation = getURLParameter(`${sPrefix}-additionalInformation`);
                        if (additionalInformation) {
                            oLocal.additionalInformation = additionalInformation;
                        }
                        const url = getURLParameter(`${sPrefix}-url`);
                        if (url) {
                            oLocal.url = localURL(url);
                        }
                    }
                    if (!oLocal.url) {
                        // eslint-disable-next-line max-len
                        Log.info(`NavTargetResolutionInternal: No configured app for ${sHashFragment} found ( local storage or url params sap-ushell-test-local1-url  sap-ushell-test-local1-additionalInfo  not supplied? `);
                        Log.info("NavTargetResolutionInternal: Defaulting to config app ...\n");
                        oDeferred.reject(new Error("URL is not resolvable"));
                        return oDeferred.promise();
                    }
                    oLocal.url = localURL(oLocal.url);
                    res = oLocal;
                }
                if (res.url === undefined) {
                    oDeferred.reject(new Error("URL is not resolvable"));
                    return oDeferred.promise();
                }
                // eslint-disable-next-line max-len
                Log.info(`NavTargetResolutionInternal: As URL:  http://localhost:8080/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-ushell-test-local1-url=${encodeURIComponent((res && res.url) || "")}&sap-ushell-test-local1-additionalInformation=${encodeURIComponent((res && res.additionalInfo) || "")}#Test-local1`);
                Log.info(`NavTargetResolutionInternal: Resolving ${sHashFragment} to ${JSON.stringify(res)}`);
                oDeferred.resolve(res);
                return oDeferred.promise();
            }
        });

        /**
         * Returns the last successful resolution of a hash fragment or <code>undefined</code> if no resolution has been performed yet.
         *
         * @returns {object} the last successful resolution
         * @private
         * @see #resolveHashFragment
         */
        this.getCurrentResolution = function () {
            return oCurrentResolution;
        };
    }

    // Note: we set it to true to allow platforms that did not yet switch to ClientSideTargetResolution to keep using the adapter.
    NavTargetResolutionInternal.hasNoAdapter = false;

    return NavTargetResolutionInternal;
});
