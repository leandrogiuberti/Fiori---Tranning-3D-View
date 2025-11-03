// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/URI",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/ApplicationType/utils",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/services/ClientSideTargetResolution/ParameterMapping",
    "sap/ushell/services/ClientSideTargetResolution/Utils"
], (
    Log,
    deepExtend,
    URI,
    oSystemAlias,
    oApplicationTypeUtils,
    Config,
    Container,
    oParameterMapping,
    oCSTRUtils
) => {
    "use strict";

    /**
     * removes properties of an object
     * @param {object} oObject
     *   Object that is modified and that has its properties deleted
     * @param {string[]} aKeysToRemove The keys of properties to be removed
     */
    function removeObjectKey (oObject, aKeysToRemove) {
        aKeysToRemove.forEach((sKeyToRemove) => {
            delete oObject[sKeyToRemove];
        });
    }

    function isRequiredParameter (sParameterName, oInbound) {
        return oInbound && oInbound.signature && oInbound.signature && oInbound.signature.parameters
            && oInbound.signature.parameters[sParameterName]
            && oInbound.signature.parameters[sParameterName].required === true;
    }

    /**
     * Tells whether the given parameter is a Webgui business parameter
     * This method has a polimorphic signature: it can be called with one or two arguments.
     * If called with one argument both the name and the parameter value
     * should be passed, separated by "=". The first "=" will be treated as
     * parameter separator. Otherwise two parameters (name, value) can be passed.
     *
     * NOTE: the method determines whether the value is passed based on how
     * many arguments are passed.
     *
     * @param {string} sName
     *   A parameter name or a name=value string.
     * @param {string} [sValue]
     *   An optional parameter value to be used in combination with the
     *   name specified in <code>sNameMaybeValue</code>.
     *
     * @returns {boolean}
     *   Whether the given parameter is a Webgui business parameter.
     *
     * @private
     */
    function isWebguiBusinessParameter (sName, sValue) {
        let aNameValue;
        // handle case in which sName is in the form "name=value"
        if (arguments.length === 1) {
            aNameValue = sName.split(/[=](.+)?/); // split on first "="
            if (aNameValue.length > 1) {
                return isWebguiBusinessParameter.apply(null, aNameValue);
            }
        }

        return !(
            sName.indexOf("sap-") === 0 ||
            sName.indexOf("saml") === 0 ||
            sName.charAt(0) === "~"
        );
    }

    /**
     * Finds and returns webgui business parameters.
     *
     * @param {object} oParams
     *   set of WebGUI parameters
     *
     * @returns {object}
     *   the set of business parameters
     *
     * @private
     */
    function getWebguiBusinessParameters (oParams) {
        const oBusinessParameters = oCSTRUtils.filterObject(oParams, isWebguiBusinessParameter);
        return oBusinessParameters;
    }

    /**
     * Returns the name of parameters that should not appear in a WebGUI URL.
     *
     * @param {object} oEffectiveParameters
     *    The array that contains of parameters possibly including parameter DYNP_OKCODE
     *    which might be mandatory, indicating that the first screen to be skipped
     *
     * @param {object} oInbound
     *    The inbound of the matching target
     *
     * @returns {string[]}
     *    The name parameters from <code>oEffectiveParameters</code> that
     *    should not be included in a WebGUI URL.
     */
    function getUnnecessaryWebguiParameters (oEffectiveParameters, oInbound) {
        const bIsRequired = isRequiredParameter("DYNP_OKCODE", oInbound)
            || isRequiredParameter("DYNP_NO1ST", oInbound);

        let aBusinessParameters = [];

        if (bIsRequired) {
            return [];
        }

        const oBusinessParameters = getWebguiBusinessParameters(oEffectiveParameters);

        function upperCaseString (s) {
            return s.toUpperCase();
        }

        const aNormalizedBusinessParameters = Object.keys(oBusinessParameters)
            .map(upperCaseString)
            .sort();

        // checks if 2 arrays of strings are equal, the arrays are assumed to be sorted
        function arraysEqual (aArray1, aArray2) {
            if (aArray1.length !== aArray2.length) {
                return false;
            }

            return aArray1.every((vUnused, iIdx) => {
                return aArray1[iIdx] === aArray2[iIdx];
            });
        }

        // check unnecessary parameter combinations
        if (arraysEqual(["DYNP_NO1ST", "DYNP_OKCODE"], aNormalizedBusinessParameters)
            || arraysEqual(["DYNP_OKCODE"], aNormalizedBusinessParameters)
            || arraysEqual(["DYNP_NO1ST"], aNormalizedBusinessParameters)
        ) {
            aBusinessParameters = Object.keys(oBusinessParameters);
        }

        return aBusinessParameters;
    }

    /**
     * Creates a native webgui URL given the a resolution result "from" nothing (but either a
     * Shell-startURL intent or a  appdescriptor information
     * like Shell-startGUI or Shell-startWDA.
     *
     * @param {string} sTcode
     *   The transaction code to use, must not be empty
     *
     * @param {string} sSapSystem
     *   A sap system as a string
     *
     * @param {string} sSapSystemDataSrc
     *   The name of the system that contains data about the system alias.
     *
     * @param {function} fnExternalSystemAliasResolver
     *   The alias resolver for remote system names.
     *
     * @returns {Promise}
     *   A promise that resolved with the URI object
     *
     * @private
     */
    function buildNativeWebGuiURI (sTcode, sSapSystem, sSapSystemDataSrc, fnExternalSystemAliasResolver) {
        sTcode = encodeURIComponent(sTcode);
        const sUrl = `/gui/sap/its/webgui?%7etransaction=${sTcode}&%7enosplash=1`;
        const oURI = new URI(sUrl);
        return oSystemAlias.spliceSapSystemIntoURI(oURI, oSystemAlias.LOCAL_SYSTEM_ALIAS, sSapSystem, sSapSystemDataSrc,
            "NATIVEWEBGUI", oSystemAlias.SYSTEM_ALIAS_SEMANTICS.apply, fnExternalSystemAliasResolver);
    }

    /**
     * Parses Native Webgui query parameter
     *
     * @param {string} sTransactionQueryParam
     *   The full ~transaction query parameter with or without question
     *   mark. E.g., <code>?%7etransaction=*SU01%20p1%3d%3bP2=v2</code>
     *
     * @returns {object}
     *   An object containing the parsed parts of the URL parameter
     *
     * @private
     */
    function parseWebguiTransactionQueryParam (sTransactionQueryParam) {
        const sTransactionValueRe = "^(.+?)(%20|(%20)(.+))?$";
        const reTransactionValue = new RegExp(sTransactionValueRe, "i");
        const oParsed = {
            hasParameters: null, // whether actual parameters are passed to the transaction
            transactionParamName: "", // ?%7etransaction or %7etransaction
            transactionCode: "", // SU01 or *SU01
            parameters: [] // { name: ..., value: ... }
        };

        const aParamNameValues = sTransactionQueryParam.split("=");

        if (aParamNameValues.length > 2) {
            return {
                error: "Found more than one assignment ('=') in the transaction query parameter",
                details: `Only one '=' sign is expected in ${sTransactionQueryParam}`
            };
        }

        if (aParamNameValues.length < 2 || typeof aParamNameValues[1]
            === "undefined" || aParamNameValues[1].length === 0) {
            return {
                error: "The transaction query parameter must specify at least the transaction name",
                details: `Got ${sTransactionQueryParam} instead.`
            };
        }

        oParsed.transactionParamName = aParamNameValues[0];
        const sTransactionValue = aParamNameValues[1];

        const aMatch = sTransactionValue.match(reTransactionValue);
        if (!aMatch) {
            return {
                error: "Cannot parse ~transaction query parameter value.",
                details: `${sTransactionValue} should match /${sTransactionValueRe}/`
            };
        }

        oParsed.transactionCode = aMatch[1];
        if (aMatch[2] && aMatch[2] !== "%20") { // if !== "%20" -> matches (%20)(.+)
            // must parse parameters
            const sTransactionParams = aMatch[4] || "";
            sTransactionParams
                .split("%3b") // i.e., "="
                .forEach((sNameAndValue) => {
                    const aNameAndValue = sNameAndValue.split("%3d");
                    const sParamName = aNameAndValue[0];

                    if (sParamName && typeof sParamName === "string" && sParamName.length > 0) { // no empty names
                        oParsed.parameters.push({
                            name: sParamName,
                            value: aNameAndValue[1]
                        });
                    }
                });
        }

        // post parsing adjustments

        // detect whether the transaction name had a '*' or if the * was
        // added because of parameters.
        // NOTE: **SU01 would be a valid tcode
        oParsed.hasParameters = false;
        if (oParsed.parameters.length > 0) {
            oParsed.hasParameters = true;

            // must remove the starting "*" from the transaction code if
            // any is found (was added because of parameters).
            oParsed.transactionCode = oParsed.transactionCode.replace(/^[*]/, "");
        }

        return oParsed;
    }

    /**
     * extract the DYNP_SKIP_SEL_SCREEN parameter that indicates whether to
     * how the selection screen even if parameters are sent
     *
     * @param {object} oParamsToInject the parameters to inject.
     * @returns {string} the DYNP_SKIP_SEL_SCREEN value.
     *
     * @private
     */
    function getExplicitSkipSelectionScreenParameter (oParamsToInject) {
        let sSkipValue = "";
        if (oParamsToInject.hasOwnProperty("DYNP_SKIP_SEL_SCREEN")) {
            const sParamVal = oParamsToInject.DYNP_SKIP_SEL_SCREEN[0];
            delete oParamsToInject.DYNP_SKIP_SEL_SCREEN;
            if (sParamVal === "" ||
                sParamVal === " " ||
                sParamVal === "0" ||
                sParamVal === 0 ||
                (typeof sParamVal === "string" && sParamVal.toLowerCase() === "false")) {
                sSkipValue = "0";
            } else if (sParamVal === "1" ||
                sParamVal === 1 ||
                (typeof sParamVal === "string" && sParamVal.toLowerCase() === "true")) {
                sSkipValue = "1";
            }
        }
        return sSkipValue;
    }

    /**
     * Interpolates the given parameters into the webgui ~transaction parameter.
     *
     * The method tries to intepolate the given parameters after the
     * transaction code present in the given ~transaction parameter.
     *
     * <p>For example, given the query string
     * <code>?%7etransaction=SU01</code>
     *
     * and the parameter object
     * <pre>
     * {
     *    B: ["C"],
     *    C: ["D"]
     * }
     * </pre>, the following string is returned:
     * <code>?%7etransaction=*SU01%20B%3dC%3bC%3dD</code
     *
     * @param {string} sTransactionQueryParam
     *   The whole ~transaction parameter. Must start with "?%7etransaction" or "%7etransaction".
     *   For example <ul
     *   <li><code>%7etransaction=*SU01%20AAAA%3d4321</code> (with AAAA=4321 parameter)</li>
     *   <li><code>?%7etransaction=SU01</code> (no parameters)</li>
     *   </ul>
     * @param {object} oParamsToInject
     *   An object ating the parameters that need to be interpolated
     *   into <code>sTransactionQueryParam</code>.
     *
     * @returns {string}
     *   The interpolated ~transaction parameter (the leading ? is
     *   preserved if passed).  The transaction code will have the form
     *   <code>*[CODE]%20[PARAMETERS]]</code> only when the transaction
     *   will be called with parameters, otherwise the format would be
     *   <code>[CODE]</code>.
     */
    function injectEffectiveParametersIntoWebguiQueryParam (sTransactionQueryParam, oParamsToInject) {
        const oParsedTransactionQueryParam = parseWebguiTransactionQueryParam(sTransactionQueryParam);
        if (oParsedTransactionQueryParam.error) {
            Log.error(
                oParsedTransactionQueryParam.error,
                oParsedTransactionQueryParam.details,
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return sTransactionQueryParam;
        }

        // Inject parameters
        const aParametersFinal = oParsedTransactionQueryParam.parameters.map((oParameter) => {
            return `${oParameter.name.toUpperCase()}%3d${oParameter.value}`;
        });

        const sSkipValue = getExplicitSkipSelectionScreenParameter(oParamsToInject);

        // Turn all names upper case
        const oParamsToInjectUpperCase = {};
        Object.keys(oParamsToInject).forEach((sKey) => {
            oParamsToInjectUpperCase[sKey.toUpperCase()] = oParamsToInject[sKey];
        });
        // NOTE: urlParametersToString treats delimiters verbatim and encodes
        //       the parameters if necessary.
        //       Therefore we pass the delimiters already encoded!
        //
        let sParamsToInject = oApplicationTypeUtils.getURLParsing().urlParametersToString(
            oParamsToInjectUpperCase,
            "%3b", // parameters delimiter
            "%3d" // assigment
        );
        if (sParamsToInject) {
            if (Object.keys(oParamsToInject).length > 0) {
                sParamsToInject += "%3b";
            }
            aParametersFinal.push(sParamsToInject);
        }

        // Note: do not rely on oParsedTransactionQueryParam as we may
        // still have injected parameters here.
        const bHasParameters = aParametersFinal.length > 0;

        return `${oParsedTransactionQueryParam.transactionParamName}=${
            bHasParameters && (sSkipValue === "" || sSkipValue === "1") ? "*" : ""
        }${oParsedTransactionQueryParam.transactionCode}${bHasParameters ? "%20" : ""}${aParametersFinal.join("%3b")}`;
    }

    /**
     * Finds and returns webgui non-business parameters.
     *
     * @param {object} oParams
     *   set of WebGUI parameters
     *
     * @returns {object}
     *   the set of non-business parameters
     *
     * @private
     */
    function getWebguiNonBusinessParameters (oParams) {
        const oNonBusinessParams = oCSTRUtils.filterObject(oParams, (sKey, sVal) => {
            return !isWebguiBusinessParameter(sKey, sVal);
        });

        return oNonBusinessParams;
    }

    /**
     * blends parameters of oMatchingTarget into the oWebguiURI,
     * then sets the altered URI constructing a resolution result in oMatchingTarget
     *
     * @param {object} oInbound
     *   The original inbound
     *
     * @param {object} oMappedIntentParamsPlusSimpleDefaults
     *   The set of mapped parameters including simple default parameters
     *
     * @param {function} oWebguiURI
     *   A (native) WebGui URI Object
     *
     * @returns {object} oResolutionResult
     *
     * Note: the method mutates oWebguiURI
     * @private
     */
    function blendParamsIntoNativeWebGUI (oInbound, oMappedIntentParamsPlusSimpleDefaults, oWebguiURI) {
        const oForbiddenParameters = {
            "sap-wd-run-sc": true,
            "sap-wd-auto-detect": true,
            "sap-ep-version": true,
            "sap-system": true
        };

        const oResolutionResult = {};

        // construct effective parameters

        // NOTE: do not include defaultedParameterNames for wrapped URLs,
        // as they may cause a crash the called application.
        const oEffectiveParameters = deepExtend({}, oMappedIntentParamsPlusSimpleDefaults);
        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];
        // before deleting forbidden parameters, back-up sap-system and sap-system-src
        oResolutionResult["sap-system"] = sSapSystem;
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
        }

        // remove "forbidden" parameters
        Object.keys(oEffectiveParameters).forEach((sParamName) => {
            if (oForbiddenParameters[sParamName.toLowerCase()]) {
                delete oEffectiveParameters[sParamName];
            }
        });

        const aUnneccessaryParameters = getUnnecessaryWebguiParameters(oEffectiveParameters, oInbound || {});
        removeObjectKey(oEffectiveParameters, aUnneccessaryParameters);

        const oEffectiveParametersToAppend = getWebguiNonBusinessParameters(oEffectiveParameters);
        removeObjectKey(oEffectiveParameters, Object.keys(oEffectiveParametersToAppend));

        // Reconstruct the final url
        // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.

        const sParams = oWebguiURI.search(); // Webgui parameters
        let sParamsInterpolated = sParams
            .split("&")
            .map((sQueryParam) => {
                let aNonBusinessParam;
                // interpolate effective parameter in the correct
                // place within the ~transaction parameter

                if (!isWebguiBusinessParameter(sQueryParam)) { // non-business parameters go in the end
                    // we need name = value
                    if (sQueryParam.indexOf("=") >= 0) {
                        aNonBusinessParam = sQueryParam.split("=");
                        if (!oEffectiveParametersToAppend.hasOwnProperty(aNonBusinessParam[0])) {
                            // effective parameters have precedence
                            oEffectiveParametersToAppend[
                                aNonBusinessParam[0] // name
                            ] = aNonBusinessParam[1]; // value
                        }
                    } else {
                        Log.error(
                            "Found no '=' separator of Webgui non-business parameter. Parameter will be skipped.",
                            `'${sQueryParam}'`,
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    }

                    return undefined; // do not append the parameter
                }

                if (sQueryParam.indexOf("?%7etransaction") === 0 ||
                    sQueryParam.indexOf("%7etransaction") === 0) { // found transaction
                    // treat transaction as if it was a query parameter
                    return injectEffectiveParametersIntoWebguiQueryParam(sQueryParam, oEffectiveParameters);
                }
                return sQueryParam;
            })
            .filter((sParam) => {
                return typeof sParam !== "undefined";
            }) // remove skipped parameters
            .join("&");

        // append non business parameters
        const sEffectiveParamsToAppend =
            oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParametersToAppend);
        sParamsInterpolated = [
            sParamsInterpolated,
            sEffectiveParamsToAppend.replace("~", "%7e") // encodeURIComponent escapes all characters except:
            // alphabetic, decimal digits, - _ . ! ~ * ' ( )'
        ].join("&");

        oWebguiURI.search(sParamsInterpolated);

        // propagate properties from the inbound in the resolution result
        ["additionalInformation", "applicationDependencies", "sap.platform.runtime"].forEach((sPropName) => {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });
        oResolutionResult.url = oWebguiURI.toString();
        oResolutionResult.text = oInbound.title;
        oResolutionResult.applicationType = "TR"; // Triggers native navigation
        oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

        return oResolutionResult;
    }

    function constructFullWebguiResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        const oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults || {};

        let sSapSystem = oInboundResolutionResult.systemAlias;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system"]) {
            sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
        }

        let sSapSystemDataSrc;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system-src"]) {
            sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];
        }

        return buildNativeWebGuiURI(oInbound.resolutionResult["sap.gui"].transaction, sSapSystem, sSapSystemDataSrc, fnExternalSystemAliasResolver)
            .then((oURIWithSystemAlias) => {
                oParameterMapping.mapParameterNamesAndRemoveObjects(oMatchingTarget);
                const oResolutionResult = blendParamsIntoNativeWebGUI(oMatchingTarget.inbound,
                    oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, oURIWithSystemAlias);
                if (oResolutionResult && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult
                    && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                    oResolutionResult["sap.platform.runtime"]
                        = oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                }

                oResolutionResult["sap-system"] = sSapSystem;
                oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                return oResolutionResult;
            });
    }

    function constructWebguiNowrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;

        const oResolutionResult = {};

        // splice parameters into Webgui url
        const oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters excluding defaults (!)
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        const aUnneccessaryParameters = getUnnecessaryWebguiParameters(oEffectiveParameters, oInbound || {});
        removeObjectKey(oEffectiveParameters, aUnneccessaryParameters);

        return oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oInboundResolutionResult.systemAlias, sSapSystem,
            sSapSystemDataSrc, "WEBGUI", oResolutionResult.systemAliasSemantics
            || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
            .then((oWebguiURI) => {
                // important to extract here to get a potentially modified client
                const sEffectiveStartupParams
                    = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);

                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.
                let sParams = oWebguiURI.search(); // Webgui parameters
                if (sEffectiveStartupParams) {
                    // append effective parameters to Webgui URL
                    sParams = sParams + ((sParams.indexOf("?") < 0) ? "?" : "&") + sEffectiveStartupParams;
                }
                oWebguiURI.search(sParams);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach((sPropName) => {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oResolutionResult.url = oWebguiURI.toString();
                oResolutionResult.text = oInbound.title;
                oResolutionResult.applicationType = "NWBC";
                oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                return oResolutionResult;
            });
    }

    function constructNativeWebguiNowrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oResolutionResult = oInbound && oInbound.resolutionResult;
        const oForbiddenParameters = {
            "sap-wd-run-sc": true,
            "sap-wd-auto-detect": true,
            "sap-ep-version": true,
            "sap-system": true,
            "sap-system-src": true
        };

        // splice parameters into Webgui url
        const oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters

        // NOTE: do not include defaultedParameterNames for wrapped URLs,
        // as they may cause a crash the called application.
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // remove "forbidden" parameters
        Object.keys(oEffectiveParameters).forEach((sParamName) => {
            if (oForbiddenParameters[sParamName.toLowerCase()]) {
                delete oEffectiveParameters[sParamName];
            }
        });

        return oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oResolutionResult.systemAlias, sSapSystem,
            sSapSystemDataSrc, "NATIVEWEBGUI", oResolutionResult.systemAliasSemantics
            || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
            .then((oWebguiURI) => {
                const oResolutionResult = blendParamsIntoNativeWebGUI(oMatchingTarget.inbound,
                    oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, oWebguiURI);

                return oResolutionResult;
            });
    }

    /**
     * Amends a specified GUI param through a given callback function.
     *
     * @param {string} sTargetParamName
     *   The target WebGui parameter to find
     * @param {string} sQuery
     *   The query string to find the parameter in
     * @param {string} sQueryParamDelimiter
     *   The delimiter used to separate parameters and values in <code>sQuery</code>. E.g., "&"
     * @param {string} sQueryParamAssignDelimiter
     *   The delimiter used to separate assignments of a value to a parameter in <code>sQuery</code>. E.g., "="
     * @param {function} fnAmend
     *   A callback used to amend the <code>sTargetParamName</code>
     *   parameter of the query string. It is a function that should return
     *   the value to assign to the target parameter in the query string,
     *   should this target parameter be present.
     *   <p>When this function returns <code>undefined</code>, the target
     *   parameter will be removed from the query string</p>
     *
     * @returns {object}
     *   An object representing the result of the amend operation. It is like:
     *   <pre>
     *   {
     *      found: <boolean> // whether the target parameter was found
     *      query: <string>  // the amended query string or the original
     *                       // query string if the target parameter was not found
     *   }
     *   </pre>
     */
    function amendGuiParam (sTargetParamName, sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter, fnAmend) {
        let bFound = false;
        const sParamSearchPrefix = sTargetParamName + sQueryParamAssignDelimiter; // Param=

        const sAmendedQuery = sQuery
            .split(sQueryParamDelimiter)
            .map((sParam) => {
                if (sParam.indexOf(sParamSearchPrefix) !== 0) {
                    return sParam;
                }

                bFound = true;

                return fnAmend(sParam);
            })
            .filter((sParam) => {
                return typeof sParam !== "undefined";
            })
            .join(sQueryParamDelimiter);

        return {
            found: bFound,
            query: sAmendedQuery
        };
    }

    /**
     * Interpolates the parameters into the given query using transaction
     * interpolation format.
     *
     * The method tries to interpolate the given parameters into the
     * <code>P_OBJECT</code> query parameter if present in the query
     * string.  Otherwise the <code>P_OBJECT</code> parameter is added to
     * the query string.
     *
     * <p>Contrarily to standard URLs, the parameter must be injected into the
     * query parameter double escaped (via encodeURIComponent) and with
     * the nonstandard delimiters passed as input.
     *
     * <p >For example, when using '&' and '=' as delimiters, given the
     * query string <code>A=B&P_OBJECT=</code>
     * and the parameter object
     * <pre>
     * {
     *    B: ["C"],
     *    C: ["D"]
     * }
     * </pre>, the interpolated query string
     * <code>A=B&P_OBJECT=B%2521C%2525C%2521D</code> is returned.
     *
     * <p>
     * IMPORTANT: the <code>P_OBJECT</code> parameter can take maximum 132
     * characters in its value. In case the given parameters form a string
     * that is longer than 132 characters (unescaped), the string will be
     * splitted over multiple <code>P_OBJx</code> parameters that are added
     * to the URL.
     * <br />
     * For example, the method may return the following interpolated query:
     * <code>P_OBJ1=rest_of_p_object_value&P_OBJ2=...&P_OBJECT=...some_long_value...</code>
     * </p>
     *
     * @param {string} sQuery
     *   The query string to interpolate the parameters into
     * @param {object} oParamsToInject
     *   An object indicating the parameters that need to be interpolated.
     * @param {string} sQueryParamDelimiter
     *   The delimiter used to separate parameters and values in <code>sQuery</code>. E.g., "&"
     * @param {string} sQueryParamAssignDelimiter
     *   The delimiter used to separate assignments of a value to a parameter in <code>sQuery</code>. E.g., "="
     *
     * @returns {string}
     *   The interpolated query string.
     */
    function injectEffectiveParametersIntoWebguiPobjectParam (sQuery, oParamsToInject, sQueryParamDelimiter, sQueryParamAssignDelimiter) {
        const sPobjectPlusDelimiter = `P_OBJECT${sQueryParamAssignDelimiter}`;
        const iMaxGUIParamLength = 132;

        // NOTE: the result of urlParametersToString does not encode
        //       delimiters, hence we pass them encoded.
        let sParamsToInject = oApplicationTypeUtils.getURLParsing().urlParametersToString(
            oParamsToInject,
            "%25", // a.k.a. "%", instead of &
            "%21" // a.k.a. "!", instead of =
        );

        if (!sParamsToInject) {
            return sQuery;
        }

        // Parse away existing parameters in P_OBJECT
        let sParamsToInjectPrefix = "";
        amendGuiParam("P_OBJECT", sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter,
            (sParamNameAndValueDoubleEncoded) => {
                const sParamValueDoubleEncoded = sParamNameAndValueDoubleEncoded.replace(sPobjectPlusDelimiter, "");
                sParamsToInjectPrefix = decodeURIComponent(sParamValueDoubleEncoded);
                if (sParamsToInjectPrefix.length > 0) {
                    sParamsToInjectPrefix = `${sParamsToInjectPrefix}%25`;
                }

                return sPobjectPlusDelimiter; // just leave the P_OBJECT= placeholder if found
            });
        sParamsToInject = sParamsToInjectPrefix + sParamsToInject;

        // Generate the injected parameters
        const oParamsSections = {
            pObjX: "",
            pObject: ""
        };
        sParamsToInject
            .match(new RegExp(`.{1,${iMaxGUIParamLength}}`, "g"))
            .map((sParamGroupEncoded) => {
                return encodeURIComponent(sParamGroupEncoded);
            })
            .forEach((sParamGroupDoubleEncoded, iGroupIdx) => {
                // parameter name should be P_OBJECT or P_OBJx for further parameters
                let sParamName = "P_OBJECT";
                let sParamSection = "pObject";
                if (iGroupIdx > 0) {
                    sParamName = `P_OBJ${iGroupIdx}`;
                    sParamSection = "pObjX";
                }

                const sSectionDelimiter = oParamsSections[sParamSection].length === 0 ? "" : sQueryParamDelimiter;

                oParamsSections[sParamSection] = oParamsSections[sParamSection] + sSectionDelimiter + sParamName
                    + sQueryParamAssignDelimiter + sParamGroupDoubleEncoded;
            });

        const sInjectedParams = [oParamsSections.pObjX, oParamsSections.pObject]
            .filter((sParamSection) => {
                return sParamSection.length > 0;
            })
            .join(sQueryParamDelimiter);

        // Place the injected params in the right place in the query
        const oAmendResult = amendGuiParam("P_OBJECT", sQuery, sQueryParamDelimiter,
            sQueryParamAssignDelimiter, (sFoundParamNameAndValue) => {
                return sInjectedParams;
            });

        if (oAmendResult.found) {
            return oAmendResult.query;
        }

        // amendment not performed: just append the concatenation
        return sQuery + (sQuery.length === 0 ? "" : sQueryParamDelimiter) + sInjectedParams;
    }

    function constructWebguiWrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;

        const oResolutionResult = {};

        // splice parameters into Webgui url
        const oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters

        // NOTE: do not include defaultedParameterNames for wrapped URLs,
        // as they may cause a crash the called application.
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oInboundResolutionResult.systemAlias, sSapSystem,
            sSapSystemDataSrc, "WEBGUI", oInboundResolutionResult.systemAliasSemantics
            || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
            .then((oWebguiURI) => {
                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.
                let sParams = oWebguiURI.search(); // Webgui parameters

                // Inject effective startup param
                sParams = injectEffectiveParametersIntoWebguiPobjectParam(sParams, oEffectiveParameters,
                    "&", "=");

                oWebguiURI.search(sParams);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach((sPropName) => {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });

                oResolutionResult.url = oWebguiURI.toString();
                oResolutionResult.text = oInbound.title;
                oResolutionResult.applicationType = "NWBC";
                oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                return oResolutionResult;
            });
    }

    function constructNativeWebguiWrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        const oResolutionResult = {};

        // splice parameters into Webgui url
        const oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters

        // NOTE: do not include defaultedParameterNames for wrapped URLs,
        // as they may cause a crash the called application.
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        // in the Webgui case, the sap-system-src intent parameter is *not* part of the final url
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oInboundResolutionResult.systemAlias, sSapSystem,
            sSapSystemDataSrc, "NATIVEWEBGUI",
            oInboundResolutionResult.systemAliasSemantics
            || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
            .then((oWebguiURI) => {
                // Reconstruct the final url
                // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.

                const sParams = oWebguiURI.search(); // Webgui parameters
                const sParamsInterpolated = sParams
                    .split("&")
                    .map((sQueryParam) => {
                        // interpolate effective parameter in the correct place within the ~transaction parameter

                        let sInterpolatedQueryParam;
                        if (sQueryParam.indexOf("?%7etransaction") === 0 ||
                            sQueryParam.indexOf("%7etransaction") === 0) { // found transaction
                            // treat transaction as if it was a query parameter
                            sInterpolatedQueryParam = injectEffectiveParametersIntoWebguiPobjectParam(
                                sQueryParam,
                                oEffectiveParameters,
                                "%3b", // parameter separator -> ";"
                                "%3d" // parameter assign delimiter -> "="
                            );
                            return sInterpolatedQueryParam;
                        }

                        return sQueryParam;
                    })
                    .join("&");

                oWebguiURI.search(sParamsInterpolated);

                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies"].forEach((sPropName) => {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });
                oResolutionResult.url = oWebguiURI.toString();
                oResolutionResult.text = oInbound.title;
                oResolutionResult.applicationType = "TR"; // Triggers Native navigation
                oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                return oResolutionResult;
            });
    }

    function generateTRResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oResolutionResult = oInbound && oInbound.resolutionResult;
        let oPromise;

        if (
            !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult["sap.gui"]) ||
            !(oResolutionResult.applicationType === "TR"))
        ) {
            oPromise = constructFullWebguiResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(!oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/~canvas;") >= 0) ||
                !(oResolutionResult.url.indexOf("app/transaction/APB_LPD_CALL_") === -1)) // check no WRAPPED transaction
        ) {
            oPromise = constructWebguiNowrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(!oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/~canvas;") >= 0) ||
                !(oResolutionResult.url.indexOf("app/transaction/APB_LPD_CALL_") >= 0)) // check WRAPPED transaction
        ) {
            oPromise = constructWebguiWrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(// a native webgui URL
                !oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/its/webgui") >= 0) ||
                !(oResolutionResult.url.indexOf("APB_LPD_CALL_") === -1) // a non wrapped URL
            )
        ) {
            oPromise = constructNativeWebguiNowrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(// a native webgui URL
                !oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/its/webgui") >= 0) ||
                !(oResolutionResult.url.indexOf("APB_LPD_CALL_") !== -1) // a WRAPPED URL
            )
        ) {
            oPromise = constructNativeWebguiWrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        }

        if (oPromise) {
            return oPromise.then(async (oResult) => {
                if (oResult.url) {
                    oResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-iframe-hint=GUI", oResult.url);
                    if (Config.last("/core/extension/dap/enabled")) {
                        const oPluginManager = await Container.getServiceAsync("PluginManager");
                        const bDapInstalled = oPluginManager.isPluginConfigured(Config.last("/core/extension/dap/pluginName"));
                        oResult.url = oApplicationTypeUtils.appendParametersToUrl(`sap-load-dap=${bDapInstalled}`, oResult.url);
                    } else {
                        oResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-load-dap=false", oResult.url);
                    }
                }
                oResult.extendedInfo = oApplicationTypeUtils.getExtendedInfo(oMatchingTarget);
                oApplicationTypeUtils.checkOpenWithPost(oMatchingTarget, oResult);
                oApplicationTypeUtils.addKeepAliveToURLTemplateResult(oResult);
                return oResult;
            });
        }
        throw new Error("Cannot generate TR resolution result");
    }

    /**
     * Produces a resolution result "from" nothing (but either a
     * Shell-startURL intent or a  appdescriptor information
     * like Shell-startGUI or Shell-startWDA.
     *
     * @param {object} oIntent
     *   The intent to be resolved. It must have semantic object action #Shell-startGUI
     *   If is assumed to have a sap-system and sap-ui2-tcode parameter
     *
     * @param {object} oMatchingTarget
     *   The matching target, an oInbound.resolutionResult["sap.platform.runtime"] member will be propagated
     *
     *   a System Alias in the TM will not be used
     *
     * @param {function} fnExternalSystemAliasResolver
     *   the external system alias resolver.
     *
     * @returns {Promise}
     *   A promise that resolved with the Matching Target(!) amended with the resolution result generated from
     *   the given intent, or rejects with an error message.
     *
     * @private
     */
    function resolveEasyAccessMenuIntentWebgui (oIntent, oMatchingTarget, fnExternalSystemAliasResolver) {
        return new Promise((fnResolve, fnReject) => {
            let sSapSystemDataSrc;
            if (oIntent.params["sap-system-src"]) {
                sSapSystemDataSrc = oIntent.params["sap-system-src"][0];
            }
            const sSapSystem = oIntent.params["sap-system"] ? oIntent.params["sap-system"][0] : undefined;
            const sSapTcode = oIntent.params["sap-ui2-tcode"] ? oIntent.params["sap-ui2-tcode"][0] : undefined;

            buildNativeWebGuiURI(sSapTcode, sSapSystem, sSapSystemDataSrc, fnExternalSystemAliasResolver)
                .then((oURI) => {
                    delete oMatchingTarget.intentParamsPlusAllDefaults["sap-ui2-tcode"];
                    // rename Parameters
                    oParameterMapping.mapParameterNamesAndRemoveObjects(oMatchingTarget);
                    const oResolutionResult = blendParamsIntoNativeWebGUI(oMatchingTarget.inbound,
                        oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, oURI);
                    if (oResolutionResult && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult
                        && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                        oResolutionResult["sap.platform.runtime"] =
                            oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                    }
                    oResolutionResult["sap-system"] = sSapSystem;
                    oResolutionResult.text = sSapTcode;
                    oResolutionResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-iframe-hint=GUI", oResolutionResult.url);
                    fnResolve(oResolutionResult);
                })
                .catch((oError) => {
                    fnReject(oError);
                });
        });
    }

    return {
        generateTRResolutionResult: generateTRResolutionResult,
        resolveEasyAccessMenuIntentWebgui: resolveEasyAccessMenuIntentWebgui,

        // temp for webgui bug fix
        getUnnecessaryWebguiParameters: getUnnecessaryWebguiParameters,
        removeObjectKey: removeObjectKey,
        getExplicitSkipSelectionScreenParameter: getExplicitSkipSelectionScreenParameter,

        // for testing
        injectEffectiveParametersIntoWebguiQueryParam: injectEffectiveParametersIntoWebguiQueryParam,
        injectEffectiveParametersIntoWebguiPobjectParam: injectEffectiveParametersIntoWebguiPobjectParam,
        amendGuiParam: amendGuiParam,
        parseWebguiTransactionQueryParam: parseWebguiTransactionQueryParam,
        getWebguiNonBusinessParameters: getWebguiNonBusinessParameters,
        getWebguiBusinessParameters: getWebguiBusinessParameters,
        isWebguiBusinessParameter: isWebguiBusinessParameter,
        buildNativeWebGuiURI: buildNativeWebGuiURI,
        constructFullWebguiResolutionResult: constructFullWebguiResolutionResult
    };
});
