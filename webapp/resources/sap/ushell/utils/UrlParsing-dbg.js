// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview URL Parsing
 *
 * URL Parsing util for shell compliant hashes
 *
 * [ SO-Action~[Context]]
 * [ ? [A=B(&C=D)+]
 * &/
 *
 * The parsing functions are deliberately restrictive and fragile, only shell compliant hashes are parsed correctly,
 * invalid or completely empty results ( not silently ignored parts) are returned if the hash is not deemed parseable
 */
sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/Log",
    "sap/base/util/deepEqual",
    "sap/base/util/merge",
    "sap/ushell/TechnicalParameters",
    "sap/ushell/utils"
], (
    URI,
    Log,
    deepEqual,
    merge,
    TechnicalParameters,
    ushellUtils
) => {
    "use strict";

    /**
     * @typedef {object} sap.ushell.utils.URLParsing.HashComparison
     * Type for HashComparison
     * @property {boolean} sameIntent The intent is the semantic object, action and contextRaw of the hash
     * @property {boolean} sameParameters The intent parameters are the parameters of the hash that are not technical parameters
     * @property {boolean} sameAppSpecificRoute The app specific route is the part of the hash after the shell part
     *
     * @since 1.128.0
     * @private
     */

    /**
     * @alias sap.ushell.utils.UrlParsing
     * @namespace
     * @description The Unified Shell's internal URL parsing utils (platform independent)
     *
     * Methods in this class allow to break down a shell compliant hash into it's respective parts
     * (SemanticObject,Action,Context, Parameters, appSpecificHash) or (ShellPart,appSpecificHash) respectively
     * or construct a hash from its constituents.
     *
     * All methods deal with the *internal* shellHash format.
     *
     * Most of the parse methods are robust w.r.t. a leading "#".
     *
     * Note: The functions were designed with a "truthy" behaviour for not present values,
     * Thus a client should not rely on the difference between null, "undefined", "" when testing for the result of a parse action.
     *
     * The parsing functions are deliberately restrictive and fragile, only shell compliant hashes are parsed correctly,
     * behaviour for non-compliant hashes is undefined and subject to change,
     * notably we do not aim do "degrade" nicefully or support partial parsing of corrupted urls.
     *
     * @since 1.94.0
     * @private
     */
    const UrlParsing = {};
    const reValidShellPart = /^(([A-Za-z0-9_/]+)-([A-Za-z0-9_/-]+)(~([A-Z0-9a-z=+/]+))?)?([?]([^&]|(&[^/]))*&?)?$/;

    /**
     * Extract the Shell hash# part from an URL
     * The application specific route part is removed
     * See {@link #getHash} for a function which retains the app specific route.
     *
     * Shell services shall use this service to extract relevant parts of an URL from an actual URL string
     * (which should be treated as opaque)
     * <p>
     * The URL has to comply with the Fiori-Wave 2 agreed upon format
     * <p>
     * This service shall be used to extract a hash part from an url.
     * The result can be further broken up by parseShellHash
     *
     * Examples<p>
     * http://a.b.c?defhij#SemanticObject-Action~Context?PV1=A&PV2=B&/appspecific
     * <br/>
     * returns : "#SemanticObject-Action~Context?PV1=A&PV2=B&/appspecific"
     *
     * Note: the results when passing an illegal (non-compliant) url are undefined and subject to change w.o. notice.
     * Notably further checks may added.
     * The design is deliberately restrictive and non-robust.
     *
     * @param {string} sShellHashString a valid (Shell) url, e.g. <br/>
     *   <code>http://xx.b.c#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     * @returns {object} the parsed result
     * @since 1.94.0
     * @protected
     */
    UrlParsing.getShellHash = function (sShellHashString) {
        const re = /[^#]*#(([^&]|&[^/])*)(&\/.*)?/;
        const match = re.exec(sShellHashString);
        if (match) {
            return match[1];
        }
        return undefined;
    };

    /**
     * Extract a hash part from an URL, including an app-specific part
     *
     * @param {string} sURL any value
     * @returns {string} <code>extracted string</code> if and only if a hash is present, undefined otherwise
     * @since 1.94.0
     * @protected
     */
    UrlParsing.getHash = function (sURL) {
        const re = /#(.*)/;
        const match = re.exec(sURL);
        if (match) {
            return match[1];
        }
        return undefined;
    };

    /**
     * Check if a URL has an intent based navigation part which can be parsed into a semantic object and action part.
     * Accepts only a relative URL (must contain #) or fully qualified Urls for which
     * origin and filename must correspond to the running launchpad.
     *
     * Given actual url
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html?sap-language=DE#SO-action?P1=value1</code>, the following parts
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html</code> must match.
     *
     * The actual test is synchronous and *only* tests whether the hash part can be parsed and contains a semantic object and action.
     * It does not test whether the intent or its parameters are valid for a given user
     *
     * This function does not work properly when used inside the app runtime as it compares the given URL to the app runtime's URL
     * instead of the outer FLP's URL.
     * It can still be used for synchronous use cases in the ushell that do not run inside the app runtime.
     *
     * @param {string} sUrl the URL to test. Note: this url must be in internal format.
     * @returns {boolean} true if the conditions are fulfilled.
     * @since 1.94.0
     * @protected
     */
    UrlParsing.isIntentUrl = function (sUrl) {
        return this._isIntentUrl(sUrl, window.location.href);
    };

    /**
     * Check if a URL has an intent based navigation part which can be parsed into a semantic object and action part.
     * Accepts only a relative URL (must contain #) or fully qualified Urls for which
     * origin and filename must correspond to the running launchpad.
     *
     * Given actual url
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html?sap-language=DE#SO-action?P1=value1</code>, the following parts
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html</code> must match.
     *
     * This function *only* tests whether the hash part can be parsed and contains a semantic object and action.
     * It does not test whether the intent or its parameters are valid for a given user
     *
     * @param {string} sUrl the URL to test. Note: this url must be in internal format.
     * @returns {Promise<boolean>} true if the conditions are fulfilled.
     * @since 1.94.0
     * @protected
     */
    UrlParsing.isIntentUrlAsync = async function (sUrl) {
        const [Container] = await ushellUtils.requireAsync(["sap/ushell/Container"]);
        const sFlpUrl = await Container.getFLPUrlAsync(true);
        return this._isIntentUrl(sUrl, sFlpUrl);
    };

    /**
     * The internal implementation of isIntentUrl. See isIntentUrl and isIntentURLAsync for more information.
     *
     * @param {string} sUrl the URL to test. Note: this url must be in internal format.
     * @param {string} sFlpUrl the FLP URL to test against.
     * @returns {boolean} true if the conditions are fulfilled.
     * @since 1.94.0
     * @private
     */
    UrlParsing._isIntentUrl = function (sUrl, sFlpUrl) {
        const reStartWithHash = /^#/;
        if (typeof sUrl !== "string") {
            return false;
        }
        if (!reStartWithHash.test(sUrl)) {
            const oTestUri = (new URI(sUrl)).normalize();
            const sTestUriFullResource = `${oTestUri.protocol()}://${oTestUri.host()}${oTestUri.pathname()}`;
            const oLaunchpadUri = (new URI(sFlpUrl)).normalize();
            const sLaunchpadUriFullResource = `${oLaunchpadUri.protocol()}://${oLaunchpadUri.host()}${oLaunchpadUri.pathname()}`;
            if (sTestUriFullResource !== sLaunchpadUriFullResource) {
                return false;
            }
        }
        // sUrl is to be processed by our launchpad
        const sHash = UrlParsing.getHash(sUrl);
        if (!sHash) {
            return false;
        }
        const oParsedHash = UrlParsing.parseShellHash(sHash);
        if (oParsedHash && oParsedHash.semanticObject && oParsedHash.action) {
            return true;
        }
        return false;
    };

    /**
     * Parses parameters from a URI query string (starting with "?") into a parameter object.
     * Keys are decoded twice. This assumes that literal "%" characters are not used on keys, otherwise parsing will fail.
     *
     * @param {string} sParams Parameter string, e.g. <code>?ABC=1&ABC=1%202DEF=4</code>
     * @returns {object} Any value, e.g. <code>{ ABC: ["1", "1 2DEF=4"] }</code>
     * @since 1.94.0
     * @protected
     */
    UrlParsing.parseParameters = function (sParams) {
        try {
            const oUriParams = new URLSearchParams(sParams);
            const vKeys = oUriParams.keys();
            let oKey = vKeys.next();
            const oParamObject = {};

            while (oKey.done === false) {
                // decodeURIComponent: required when a key has double encoding, e.g. "%2524" (BCP: 2180415300)
                // this extra decode is fine as long as literal "%" characters are not used on keys
                oParamObject[decodeURIComponent(oKey.value)] = oUriParams.getAll(oKey.value);
                oKey = vKeys.next();
            }
            return oParamObject;
        } catch (oError) {
            Log.error(`URL parsing - malformed URL parameters string: ${sParams}`, oError);
            return {};
        }
    };

    /**
     * Combines members of a JavaScript object into a parameter string.
     * Parameters are ordered in an arbitrary manner which might change.
     *
     * @param {object} parameters The parameter object, e.g. <code>{ ABC: [1, "1 2"], DEF: ["4"] }</code>.
     * @param {string} delimiter The parameter delimiter. Default is "&".
     * @param {string} assign The parameter assignment. Default is "=".
     * @returns {string} The result parameter string, e.g. <code>ABC=1&ABC=1%202&DEF=4</code>.
     *   The result is *not* prefixed with a "?". Parameter values are URI encoded.
     * @since 1.94.0
     * @private
     */
    function _urlParametersToString (parameters, delimiter, assign) {
        let shellPart = "";

        delimiter = delimiter || "&";
        assign = assign || "=";

        let first = "";
        const lst = [];
        for (const a in parameters) {
            if (parameters.hasOwnProperty(a)) {
                lst.push(a);
            }
        }
        lst.sort();
        for (let k = 0; k < lst.length; k = k + 1) {
            const a = lst[k];
            if (Array.isArray(parameters[a])) {
                for (let i = 0; i < parameters[a].length; i = i + 1) {
                    shellPart += first + encodeURIComponent(a) + assign + encodeURIComponent(parameters[a][i]);
                    first = delimiter;
                }
            } else {
                shellPart += first + encodeURIComponent(a) + assign + encodeURIComponent(parameters[a]);
                first = delimiter;
            }
        }
        return shellPart;
    }

    /**
     * combine members of a javascript object into a parameter string,
     * note that parameters are ordered in an arbitrary manner which is subject to change
     *
     * @param {object} oParams any value { ABC : [1,"1 2"], DEF : ["4"]}
     * @returns {string} <code>ABC=1&ABC=1%202DEF=4</code>
     *   Note that the result is *not* prefixed with a "?", parameter values are encodeURIComponent encoded.
     * @since 1.94.0
     * @protected
     */
    UrlParsing.paramsToString = function (oParams) {
        return _urlParametersToString(oParams);
    };

    /**
     * Removes parameters with empty values from it.
     *
     * Parameters with "no" value are expressed as an array with empty string, e.g. {sap-system: [""]}.
     * This is used to express that a parameter is present, but has no value.
     * This function removes such parameters from the object. Thus the object is modified in place.
     * Note that this is used in the URLTemplateProcessor that expects parameters with "no" value to be expressed as undefined.
     * Combined values, e.g an empty value and a normal value are not changed.
     * @param {object} oParams  any value { ABC : [1,"1 2"], DEF : ["4"]}
     * @param {string[]} aParams  an array of parameter names to remove if they have an empty value
     */
    UrlParsing.removeParametersWithEmptyValue = function (oParams, aParams) {
        if (!oParams) {
            return;
        }
        Object.keys(oParams).forEach((key) => {
            if (aParams.includes(key) &&
                oParams[key].length === 1 // must be an array with one element
                && oParams[key][0] === "") {
                delete oParams[key];
            }
        });
    };

    /**
     * Internal function
     *
     * @param {object} oParams parameter object
     * @param {string} sDelimiter string to use as parameter delimiter (e.g., "&")
     * @param {string} sAssign string to use for parameter assignment (e.g., "=")
     * @returns {string} the result parameters
     * @since 1.94.0
     * @private
     */
    UrlParsing.urlParametersToString = function (oParams, sDelimiter, sAssign) {
        return _urlParametersToString(oParams, sDelimiter, sAssign);
    };

    /**
     * adds parameter to a url
     * which can be relative or a hash
     * @param {string} sUrlorHash "url" which can be relative or a hash
     * @param {object} oUrlParams Url parameter
     * @returns {string} new url with the parameters
     * @since 1.131.0
     *
     */
    UrlParsing.addParamsToUrl = function (sUrlorHash, oUrlParams) {
        const oUri = new URI(sUrlorHash);
        Object.keys(oUrlParams)
            .forEach((key)=>{
                oUri.addSearch(key, oUrlParams[key]);
            });
        return oUri.toString();
    };

    /**
     * add parameters of the shell specific part to the URL or hash
     * makes sure they are before the app specific hash
     * @param {string} sUrlorHash Url can be relative or a hash
     * @param {object} oShellParams Shell parameters
     * @returns {string} url with added parameters
     *
     * @since 1.131.0
     *
     */
    UrlParsing.addShellParamsToURL = function (sUrlorHash, oShellParams) {
        const oURI = new URI(sUrlorHash);

        // split hash into shell part and app specific route
        const sHashPart = oURI.hash();
        const sBeforeHashPart = oURI.toString().replace(sHashPart, "");

        // merge the parameters
        const oParseHash = UrlParsing.parseShellHash(sHashPart) || {};
        Object.assign(oParseHash.params, oShellParams.params);

        // now put it back together

        // new hash
        // construct Shell Hash
        const sNewHash = `#${UrlParsing.constructShellHash(oParseHash)}`;

        return sBeforeHashPart + sNewHash;
    };

    /**
     * Decompose a shell hash into the respective parts
     *
     * @param {string} sHash Hash part of a shell compliant URL
     *   <code>#SO-Action~Context?P1=a&P2=x&/route?RPV=1</code> the hash part of an URL, <br/>
     *   e.g. <code>"#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     * @returns {object} <code>undefined</code> if not a parseable hash<br/>
     * <pre>
     *   {
     *     semanticObject : string, <br/>
     *     action : string, <br/>
     *     contextRaw : string, <br/>
     *     params :  MapObject<String,Array[String]>, <br/>
     *     appSpecificRoute : string <br/>
     *   }
     * </pre>
     *   Note that params always has an Array for each parameter value!
     * @since 1.94.0
     * @protected
     */
    UrlParsing.parseShellHash = function (sHash) {
        const re = reValidShellPart;
        if (!sHash) {
            return undefined;
        }
        // split shell-hash and app-specific parts first
        const oSplitHash = UrlParsing.splitHash(sHash);

        const match = re.exec(oSplitHash.shellPart);
        if (match) {
            const sSemanticObject = match[2];
            const sAction = match[3];
            const sContext = match[5];
            const sParams = match[6];
            const pm = UrlParsing.parseParameters(sParams);
            return {
                semanticObject: sSemanticObject,
                action: sAction,
                contextRaw: sContext,
                params: pm,
                appSpecificRoute: oSplitHash.appSpecificRoute
            };
        }
        if (oSplitHash.appSpecificRoute) {
            return {
                semanticObject: undefined,
                action: undefined,
                contextRaw: undefined,
                params: {},
                appSpecificRoute: oSplitHash.appSpecificRoute
            };
        }
        return undefined;
    };

    /**
     * Internal function
     *
     * @param {string} sHash Shell hash
     * @returns {string} the string without a leading #
     * @since 1.94.0
     * @private
     */
    UrlParsing.privstripLeadingHash = function (sHash) {
        if (sHash[0] === "#") {
            return sHash.substring(1);
        }
        return sHash;
    };

    /**
     * Ensures a leading # in a hash.
     * @param {string} sHash Shell hash.
     * @returns {string} the string with a leading #.
     *
     * @since 1.129.0
     * @private
     */
    UrlParsing.ensureLeadingHash = function (sHash) {
        if (!sHash) {
            sHash = "#";
        } else if (sHash.charAt(0) !== "#") {
            sHash = `#${sHash}`;
        }
        return sHash;
    };

    /**
     * Reduces a hash to the semantic object and action part.
     * Does not include the leading '#'.
     * Returns empty string if the hash is not parseable.
     *
     * @param {string} sHash Shell hash.
     * @returns {string} The basic hash.
     *
     * @since 1.129.0
     * @private
     */
    UrlParsing.getBasicHash = function (sHash) {
        const oShellHash = this.parseShellHash(sHash);

        if (!oShellHash) {
            return "";
        }

        return `${oShellHash.semanticObject}-${oShellHash.action}`;
    };

    /**
     * split a Unified Shell compliant hash into an Object containing a shell specific part and an app specific parts</br>
     * for non compliant hash strings, the empty object {} is returned.
     * an optional leading # is stripped
     *
     * @param {string} sHash Hash part of a shell conformant URL
     *   <code>#SO-Action~Context?P1=a&P2=x&/route?RPV=1<code>
     *   the hash part of an URL, e.g. <code>"#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH<code>
     * @returns {object}
     *   <code>{}</code>(empty object) if not a parseable hash
     * <pre>
     *   {
     *     shellPart : "Object-name~AFE2==?PV1=PV2&PV4=V5",
     *     appSpecificRoute : "display/detail/7?UU=HH"
     *   }
     * </pre> otherwise
     *   Note that params always has an Array for each parameter value!
     * @since 1.94.0
     * @protected
     */
    UrlParsing.splitHash = function (sHash) {
        const re = /^(?:#|)([\S\s]*?)(&\/[\S\s]*)?$/;

        if (sHash === undefined || sHash === null || sHash === "") {
            return {};
        }
        // break down hash into parts
        // "#SO-ABC~CONTXT?ABC=3A&DEF=4B&/detail/1?A=B");
        const aMatch = re.exec(sHash);
        const sShellPart = aMatch[1];
        if (sShellPart !== "" && !reValidShellPart.test(sShellPart)) {
            return {};
        }
        const sAppSpecificRoute = aMatch[2];
        if (sShellPart || sAppSpecificRoute) {
            return {
                shellPart: sShellPart,
                appSpecificRoute: sAppSpecificRoute // ,"&/detail/1?A=B");
            };
        }
        return {};
    };

    function appendIf (sUrl, app) {
        if (app) {
            return sUrl + app;
        }
        return sUrl;
    }

    /**
     * compose a shell Hash from it's respective parts
     * Note that it also may append an app specific route !
     *
     * @returns {string} the hash part of an URL, e.g. <code>"Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     *   returns "" for an undefined object
     * @param {object} oShellHash The action must be a valid action, it may not contain "?" or directly a parameter string
     *   <code>undefined</code> if not a parseable hash
     * <pre>
     *   {
     *     target: {
     *       semanticObject: string,
     *       action: string,
     *       contextRaw: string
     *     },
     *     params: MapObject<String,Array[String]>,
     *     appStateKey: string
     *     appSpecificRoute: string
     *   }
     * </pre>
     *   xor
     *   <code>{ target: { shellHash } }</code>
     *   Note: in general it is preferred to add an appStateKey directly to the params object
     * @since 1.94.0
     * @protected
     */
    UrlParsing.constructShellHash = function (oShellHash) {
        let shellPart;
        if (!oShellHash) {
            return "";
        }
        // align lack of target
        if (!oShellHash.target) {
            oShellHash.target = {};
            oShellHash.target.semanticObject = oShellHash.semanticObject;
            oShellHash.target.action = oShellHash.action;
            oShellHash.target.contextRaw = oShellHash.contextRaw;
        }
        if (oShellHash.target.shellHash || oShellHash.target.shellHash === "") {
            const result = UrlParsing.privstripLeadingHash(oShellHash.target.shellHash);
            return appendIf(result, oShellHash.appSpecificRoute);
        }

        if (oShellHash.target.semanticObject && oShellHash.target.action) {
            shellPart = `${oShellHash.target.semanticObject}-${oShellHash.target.action.replace(/[?].*/, "")}`;
        } else {
            return appendIf("", oShellHash.appSpecificRoute);
        }

        if (oShellHash.target.contextRaw) {
            shellPart += `~${oShellHash.target.contextRaw}`;
        }
        let first = "?";
        const lst = [];
        for (const a in oShellHash.params) {
            if (oShellHash.params.hasOwnProperty(a)) {
                lst.push(a);
            }
        }
        const paramsCopy = (oShellHash.params && JSON.parse(JSON.stringify(oShellHash.params))) || {};
        if (oShellHash.appStateKey) {
            lst.push("sap-xapp-state");
            paramsCopy["sap-xapp-state"] = oShellHash.appStateKey;
        }
        lst.sort();
        for (let k = 0; k < lst.length; k = k + 1) {
            const a = lst[k];
            if (Array.isArray(paramsCopy[a])) {
                if (paramsCopy[a].length > 1) {
                    Log.error("Array startup parameters violate the designed intent of the Unified Shell Intent, use only single-valued parameters!");
                }
                for (let i = 0; i < paramsCopy[a].length; i = i + 1) {
                    shellPart += `${first + encodeURIComponent(a)}=${encodeURIComponent(paramsCopy[a][i])}`;
                    first = "&";
                }
            } else {
                shellPart += `${first + encodeURIComponent(a)}=${encodeURIComponent(paramsCopy[a])}`;
                first = "&";
            }
        }
        return appendIf(shellPart, oShellHash.appSpecificRoute);
    };

    /**
     * Calculates the similarities of the hashes
     *
     * @param {sap.ushell.services.Navigation.TargetIntent} sHash1 The first hash
     * @param {sap.ushell.services.Navigation.TargetIntent} sHash2 The second hash
     * @returns {sap.ushell.utils.URLParsing.HashComparison} A object describing the similarities
     *
     * @since 1.128.0
     * @private
     */
    UrlParsing.compareHashes = function (sHash1, sHash2) {
        const oNewHash = this.parseShellHash(sHash1) || {};
        const oOldHash = this.parseShellHash(sHash2) || {};
        return {
            sameIntent: this.haveSameIntent(oNewHash, oOldHash),
            sameParameters: this.haveSameIntentParameters(oNewHash, oOldHash),
            sameAppSpecificRoute: oNewHash.appSpecificRoute === oOldHash.appSpecificRoute
        };
    };

    /**
     * Determines whether two hash fragments have the same intent during an
     * app-to-app navigation.
     *
     * @param {sap.ushell.services.URLParsing.DecomposedHash} oHash1 The first hash split by parseShellHash
     * @param {sap.ushell.services.URLParsing.DecomposedHash} oHash2 The second hash split by parseShellHash
     *
     * @returns {boolean}
     *   Whether two hash fragments have the same semantic object and action
     *   during an app-to-app navigation.
     *
     * @since 1.128.0
     * @private
     */
    UrlParsing.haveSameIntent = function (oHash1, oHash2) {
        oHash1 = oHash1 || {};
        oHash2 = oHash2 || {};
        return oHash1.semanticObject === oHash2.semanticObject &&
            oHash1.action === oHash2.action &&
            oHash1.contextRaw === oHash2.contextRaw;
    };

    /**
     * Determines whether two sets of parameters have the same intent parameters.
     *
     * @param {sap.ushell.services.URLParsing.DecomposedHash} oHash1 The first hash split by parseShellHash
     * @param {sap.ushell.services.URLParsing.DecomposedHash} oHash2 The second hash split by parseShellHash
     * @returns {boolean} Whether the two given set of parameters have the same intent parameters.
     *
     * @since 1.128.0
     * @private
     */
    UrlParsing.haveSameIntentParameters = function (oHash1, oHash2) {
        oHash1 = oHash1 || {};
        oHash2 = oHash2 || {};
        const oParams1Copy = merge({}, oHash1.params);
        const oParams2Copy = merge({}, oHash2.params);
        return !this._parametersChanged(
            this._removeNonIntentParameters(oParams1Copy),
            this._removeNonIntentParameters(oParams2Copy)
        );
    };

    /**
     * Calculates the stable intent part of the hash
     * @param {string} sHash Hash part of a shell compliant URL
     *   <code>#SO-Action~Context?P1=a&P2=x&/route?RPV=1</code> the hash part of an URL, <br/>
     *   e.g. <code>"#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     * @returns {string} the stable intent part of the hash
     *
     * @since 1.135.0
     * @private
     */
    UrlParsing.getStableIntent = function (sHash) {
        const oHash = this.parseShellHash(sHash) || {};
        const oParamsWithoutTechnicalParameters = this._removeNonIntentParameters(oHash.params);
        // stabilize the "order" of the parameters and values to make the hash comparison stable
        const oSortedParams = Object.keys(oParamsWithoutTechnicalParameters)
            .sort()
            .reduce((oResult, sKey) => {
                const aValue = oParamsWithoutTechnicalParameters[sKey];
                aValue.sort();
                oResult[sKey] = aValue;
                return oResult;
            }, {});
        return this.constructShellHash({
            target: {
                semanticObject: oHash.semanticObject,
                action: oHash.action,
                contextRaw: oHash.contextRaw
            },
            params: oSortedParams
            // ignore appSpecificRoute
        });
    };

    /**
     * Removes all technical parameters from the hash parameters that are not intent parameters
     * and returns the new hash parameters
     *
     * @param {Object<string, string[]>} oHashParams the hash parameters that should be checked for non-intent parameters
     * @returns {Object<string, string[]>} the given hash parameters with the non-intent parameters
     *
     * @since 1.128.0
     * @private
     */
    UrlParsing._removeNonIntentParameters = function (oHashParams) {
        const aTechnicalParameters = TechnicalParameters.getParameters({ isIntentParameter: false });
        let oTechnicalParam;

        if (oHashParams) {
            for (let i = 0; i < aTechnicalParameters.length; i++) {
                oTechnicalParam = aTechnicalParameters[i];
                if (oHashParams[oTechnicalParam.name]) {
                    delete oHashParams[oTechnicalParam.name];
                }
            }
        }

        return oHashParams || {};
    };

    /**
     * Checks whether shell hash parameters have changed
     *
     * @param {Object<string, string[]>} oNewParameters the new parameters
     * @param {Object<string, string[]>} oOldParameters the old parameters
     * @returns {boolean} <code>true</code> if oNewParameters are not equal to oOldParameters
     *
     * @since 1.128.0
     * @private
     */
    UrlParsing._parametersChanged = function (oNewParameters, oOldParameters) {
        return !deepEqual(oNewParameters, oOldParameters);
    };

    return UrlParsing;
});
