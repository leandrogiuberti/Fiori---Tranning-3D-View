// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Methods to parse and execute functions defined for the URL Template parameter language.
 * @version 1.141.1
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/URI",
    "sap/ushell/URLTemplateProcessor/utils",
    "sap/ushell/utils/type"
], (
    deepExtend,
    URI,
    _utils,
    ushellType
) => {
    "use strict";

    /*
     * URL Template functions are instantiated in expressions in the following format:
     * ...
     * names: {
     *   ...
     *   "name": {<functionName>(<arguments>) <value1>[,<value2>,...,<valueN>]
     *
     * Functions are always called with two arguments:
     *
     * - oArgs: the <arguments>.
     *   This is parsed according to the args declaration.
     *   For example, if a function declares:
     *       args: ["argNameX","argNameY?"]
     *       Meaning that the function accepts the first argument as argNameX, and optionally argNameY as a second argument.
     *   it will be possible to access the arguments through their names as oArgs.argNameX, or oArgs.argNameY (may be be undefined)
     *
     * - vValues: an array of values
     *   Because it's possible to specify more arguments, vValues will be always an array the first time the expression is parsed.
     *   Even when a single value is named into the expression.
     *
     *   A function that transforms its input should:
     *
     *   - Attempt to reduce arrays of complex values to a single simple value, and the single value
     *     (not the array of a single value should be returned).
     *     This is because in the end the target place of a single value is the url where all values become a string.
     *
     *   - Return a complex value if the function does not reduce multiple values to a simple single value (string, number, null).
     *     Better if the returned value keeps the same type as the input value.
     *     For example, if multiple values were given, vValues is an array, an array shall be returned.
     *
     *   - Treat an array of a single value as a single value, and return the single value.
     *     If this is not done, the following can happen when the value is transferred across multiple expressions:
     *
     *       nameA: {fn() value} // vValues: [value]      -> returns [value]
     *       nameB: {fn() nameA} // vValues: [[value]]    -> returns [[value]]
     *       nameC: {fn() nameB} // vValues: [[[value]]]  ... and so on
     *
     *     When the function unpacks the array with a single item (which is nicer):
     *
     *       nameA: {fn() value} // vValues: [value] -> returns value
     *       nameB: {fn() nameA} // vValues: [value] -> returns value
     *       nameC: {fn() nameB} // vValues: [value] ... and so on
     *
     * - The number of items in vValues can be controlled by minValues and maxValues, which will cause the engine to throw during parsing.
     */

    function isEmpty (v) {
        if (typeof v === "undefined") {
            return true;
        }
        if (typeof v === "string") {
            return v === "";
        }
        if (typeof v === "object") {
            return Object.keys(v).length === 0;
        }
        if (typeof v === "number") {
            return v === 0;
        }
        if (typeof v === "boolean") {
            return v === false;
        }

        throw new Error("Unexpected type for value");
    }

    function getValuesAsArray (vValues) {
        let aValues;
        if (ushellType.isArray(vValues)) {
            aValues = vValues;
        } else if (ushellType.isPlainObject(vValues)) {
            aValues = [vValues];
        } else if (vValues === undefined) {
            return [];
        } else {
            throw new Error("Unexpected type");
        }
        return aValues;
    }

    const O_FUNCTION = {
        url: {
            args: ["urlPart?"],
            minValues: 0,
            maxValues: 0,
            fn: function (oArgs) {
                let oURL;
                const sURIHashContext = _utils.getURIHashContext();
                if (typeof sURIHashContext === "string") {
                    const sUrlWithoutHash = location.hash ? location.href.split(location.hash)[0] : location.href;
                    oURL = new URI(sUrlWithoutHash + sURIHashContext);
                } else {
                    oURL = new URI();
                }

                const aAllowedPartArg = [
                    "protocol",
                    "scheme",
                    "username",
                    "password",
                    "hostname",
                    "port",
                    "host",
                    "userinfo",
                    "authority",
                    "origin",
                    "subdomain",
                    "domain",
                    "tld",
                    "pathname",
                    "path",
                    "directory",
                    "filename",
                    "suffix",
                    "search",
                    "query",
                    "hash",
                    "fragment",
                    "resource"
                ];

                let sMethod = "toString";
                if (oArgs.urlPart) {
                    if (aAllowedPartArg.indexOf(oArgs.urlPart) === -1) {
                        throw new Error(`The URL part '${oArgs.urlPart}' is not valid. Please use one of ${aAllowedPartArg.join(", ")}`);
                    }
                    sMethod = oArgs.urlPart;
                }

                return oURL[sMethod]();
            }
        },
        if: {
            args: ["trueCondition"],
            minValues: 1,
            maxValues: 2,
            fn: function (oArgs, vValues) {
                const aValues = getValuesAsArray(vValues);

                if (isEmpty(oArgs.trueCondition)) {
                    return aValues.length === 1
                        ? undefined
                        : aValues.pop();
                }

                return aValues[0];
            }
        },
        and: {
            args: ["emptyCondition?"],
            minValues: 1,
            fn: function (oArgs, vValues) {
                const aValues = getValuesAsArray(vValues);

                if (typeof oArgs.emptyCondition === "undefined" && oArgs.length > 0) {
                    return undefined;
                }

                if (typeof oArgs.emptyCondition !== "undefined" && isEmpty(oArgs.emptyCondition)) {
                    return undefined;
                }

                const sLastValue = aValues.pop();
                const bAllValuesDefined = aValues.every(_utils.hasValue);
                return bAllValuesDefined
                    ? sLastValue
                    : undefined;
            }
        },
        or: {
            args: ["emptyCondition?"],
            minValues: 1,
            fn: function (oArgs, vValues) {
                const aValues = getValuesAsArray(vValues);

                if (typeof oArgs.emptyCondition === "undefined" && oArgs.length > 0) {
                    return undefined;
                }
                if (typeof oArgs.emptyCondition !== "undefined" && isEmpty(oArgs.emptyCondition)) {
                    return undefined;
                }

                return aValues.reduce((sPreviousVal, sNextVal) => {
                    if (_utils.hasValue(sPreviousVal)) {
                        return sPreviousVal;
                    }
                    return _utils.hasValue(sNextVal)
                        ? sNextVal
                        : undefined;
                });
            }
        },
        replace: {
            args: ["strRegExp", "strReplace", "flags?"], // sequence of patters follow
            minValues: 1,
            maxValues: 1,
            fn: function (oArgs, vValues) {
                const rRegex = new RegExp(oArgs.strRegExp, oArgs.flags);
                const sReplace = oArgs.strReplace || "";

                /* eslint-disable valid-typeof */
                if (typeof vValues === undefined || vValues === null) {
                    return vValues;
                }
                /* eslint-enable valid-typeof */

                if (ushellType.isArray(vValues)) {
                    if (vValues.length === 1) { // i.e., {replace() <value>}
                        return O_FUNCTION.replace.fn.call(this, oArgs, vValues[0]);
                    }
                    return vValues.map(function (vValue) { // i.e., {replace() <value>,<value>,...}
                        return O_FUNCTION.replace.fn.call(this, oArgs, vValue);
                    });
                }

                if (ushellType.isPlainObject(vValues)) {
                    return Object.keys(vValues).reduce(function (o, sKey) {
                        const vValue = vValues[sKey];
                        o[sKey] = O_FUNCTION.replace.fn.call(this, oArgs, vValue);
                        return o;
                    }, {});
                }

                if (typeof vValues === "string") {
                    return vValues.replace(rRegex, sReplace);
                }

                // boolean or number types are converted to a string
                return O_FUNCTION.replace.fn.call(this, oArgs, `${vValues}`);
            }
        },
        join: {
            args: ["macroSeparator?", "microSeparator?"],
            minValues: 1,
            fnPipe: function (oArgs, oValues) {
                const aValues = [oValues];
                return O_FUNCTION.join.fn.call(this, oArgs, aValues);
            },
            fn: function (oArgs, aValues) {
                const sMacroSeparator = oArgs.macroSeparator || "";
                const sMicroSeparator = oArgs.microSeparator || "";

                aValues = aValues.map((vSimpleOrComplex) => {
                    if (!ushellType.isPlainObject(vSimpleOrComplex) && !ushellType.isArray(vSimpleOrComplex)) {
                        return vSimpleOrComplex;
                    }

                    const sType = Object.prototype.toString.apply(vSimpleOrComplex);

                    if (sType === "[object Object]") {
                        const aSanitizedParameters = _utils.removeArrayParameterNotation(vSimpleOrComplex);
                        return Object.keys(aSanitizedParameters).sort().map((sKey) => {
                            return sKey + sMicroSeparator + vSimpleOrComplex[sKey];
                        }).join(sMacroSeparator);
                    }

                    if (sType === "[object Array]") {
                        return vSimpleOrComplex.join(sMacroSeparator);
                    }
                });

                return aValues.join(sMacroSeparator);
            }
        },
        match: {
            args: ["strRegex"],
            minValues: 1,
            fnPipe: function (oArgs, oValues) {
                const sStrRegex = oArgs.strRegex;
                const rRegex = new RegExp(sStrRegex);
                return Object.keys(oValues).reduce((o, sNextKey) => {
                    if (rRegex.exec(sNextKey)) {
                        o[sNextKey] = oValues[sNextKey];
                    }
                    return o;
                }, {});
            },
            fn: function (oArgs, aValues) {
                if (aValues === undefined) {
                    // nothing matches nothing
                    return undefined;
                }

                const sStrRegex = oArgs.strRegex;
                const rRegex = new RegExp(sStrRegex);

                const aMatchedValues = aValues.filter((vValue) => {
                    let aInnerValues;
                    if (ushellType.isPlainObject(vValue)) {
                        // there is at least one key matching
                        aInnerValues = Object.keys(vValue);
                    } else if (ushellType.isArray(vValue)) {
                        aInnerValues = vValue;
                    } else {
                        aInnerValues = [`${vValue}`];
                    }

                    return aInnerValues.some(rRegex.exec.bind(rRegex));
                });

                return aMatchedValues.length === aValues.length
                    ? true
                    : undefined;
            }
        },
        value: {
            args: ["name"],
            minValues: 1,
            fnPipe: function (oArgs, oValues) {
                if (ushellType.isPlainObject(oValues) && oValues.hasOwnProperty(oArgs.name)) {
                    const aValues = oValues[oArgs.name];
                    return ushellType.isArray(aValues) && aValues.length > 0 && aValues[0];
                }
                return undefined;
            }
        },
        not: {
            args: [],
            minValues: 1,
            fnPipe: function (oArgs, oValues) {
                return Object.keys(oValues).length > 0
                    ? undefined
                    : "";
            },
            fn: function (oArgs, aValues) {
                const vEndResult = O_FUNCTION.and.fn(oArgs, aValues);

                return vEndResult === undefined
                    ? ""
                    : undefined;
            }
        },
        stringify: {
            args: [],
            minValues: 1,
            fn: function (oArgs, vValues) {
                if (ushellType.isArray(vValues)) {
                    if (vValues.length === 0) {
                        return "";
                    }
                    if (vValues.length === 1) {
                        vValues = vValues[0];
                    }
                }

                if (typeof vValues === "string") {
                    return vValues;
                }

                return JSON.stringify(vValues);
            }
        },
        encodeURIComponent: {
            args: [],
            minValues: 1,
            maxValues: 1,
            fnPipe: function (oArgs, oValues) {
                return Object.keys(oValues).reduce((o, sKey) => {
                    o[sKey] = encodeURIComponent(oValues[sKey]);
                    return o;
                }, {});
            },
            fn: function (oArgs, aValues) {
                const vValue = aValues[0];
                if (typeof vValue !== "string") {
                    return vValue;
                }

                return encodeURIComponent(vValue);
            }
        }
    };

    function validateFunctionValuesInPipeContext (sFunctionName, oFnDef, oValues) {
        if (oValues !== undefined && !ushellType.isPlainObject(oValues)) {
            throw new Error(`Invalid value type passed to '${sFunctionName}' in pipe context. An object is expected.`);
        }
    }

    function validateFunctionValuesInValueContext (sFunctionName, oFnDef, aValues) {
        if (aValues !== undefined && !ushellType.isArray(aValues)) {
            throw new Error(`Invalid value type passed to '${sFunctionName}' in value context. An array is expected.`);
        }

        const iNumValues = ushellType.isArray(aValues)
            ? aValues.length
            : 0;

        if (_utils.hasValue(oFnDef.maxValues) && iNumValues > oFnDef.maxValues) {
            throw new Error(`Too many values were passed to '${sFunctionName}'. Please pass maximum ${oFnDef.maxValues} values.`);
        }
        if (_utils.hasValue(oFnDef.minValues) && iNumValues < oFnDef.minValues) {
            throw new Error(`Too few values were passed to '${sFunctionName}'. Please pass minimum ${oFnDef.minValues} values.`);
        }
    }

    function isArgRequired (sArgWithSuffix) {
        return sArgWithSuffix.charAt(sArgWithSuffix.length - 1) !== "?";
    }

    function isInvalidArgSignature (aArgsDef) {
        let bError = false;
        aArgsDef.map(isArgRequired).reduce((bRequired, bNextRequired) => {
            if (!bRequired && bNextRequired) {
                bError = true;
            }
            return bNextRequired;
        }, true);
        return bError;
    }

    function removeArgSuffix (sArgWithSuffix) {
        return sArgWithSuffix.substr(0, sArgWithSuffix.length - 1);
    }

    function parseFunctionArgs (sFunctionName, aArgs) {
        const aArgsDeclaration = deepExtend([], O_FUNCTION[sFunctionName].args);
        if (isInvalidArgSignature(aArgsDeclaration)) {
            throw new Error("Invalid argument signature. Make sure all optional arguments appear in the end.");
        }

        const oArgs = {
            length: aArgs.length
        };

        const iRequiredArgs = aArgsDeclaration.filter(isArgRequired);

        const bMoreParametersRequired = iRequiredArgs > aArgs.length;
        if (bMoreParametersRequired) {
            throw new Error(`${sFunctionName} requires ${iRequiredArgs} arguments but ${aArgs.length} was specified`);
        }

        aArgs.forEach((vValue) => {
            let sNextExpectedArg = aArgsDeclaration.shift();
            const bIsArgOptional = !isArgRequired(sNextExpectedArg);
            if (bIsArgOptional) {
                sNextExpectedArg = removeArgSuffix(sNextExpectedArg);
            }

            if (aArgs.length > 0) {
                oArgs[sNextExpectedArg] = vValue;
            }
        });

        return oArgs;
    }

    function applyFunction (bPipeContext, sFunctionName, aFunctionArgs, aInitialValues) {
        if (!O_FUNCTION.hasOwnProperty(sFunctionName)) {
            throw new Error(`Invalid function: ${sFunctionName}`);
        }

        const oParsedArgs = parseFunctionArgs(sFunctionName, aFunctionArgs);
        if (bPipeContext) {
            validateFunctionValuesInPipeContext(sFunctionName, O_FUNCTION[sFunctionName], aInitialValues);
        } else {
            validateFunctionValuesInValueContext(sFunctionName, O_FUNCTION[sFunctionName], aInitialValues);
        }

        if (bPipeContext) {
            if (!O_FUNCTION[sFunctionName].fnPipe) {
                throw new Error(`The function '${sFunctionName}' cannot be executed in pipe context`);
            }
            return O_FUNCTION[sFunctionName].fnPipe(oParsedArgs, aInitialValues);
        }

        return O_FUNCTION[sFunctionName].fn(oParsedArgs, aInitialValues);
    }

    function toCharacterClass (s) {
        return s.split("").map((ch) => {
            if (ch === "[") {
                return "[\\[]";
            }
            return `[${ch}]`;
        }).join("");
    }

    function getPossibleFunctionsRegExpString () {
        const aAllFunctionSymbols = Object.keys(O_FUNCTION);
        return aAllFunctionSymbols.map(toCharacterClass).join("|");
    }

    return {
        getPossibleFunctionsRegExpString: getPossibleFunctionsRegExpString,
        applyFunctionInValueContext: applyFunction.bind(null, false),
        applyFunctionInPipeContext: applyFunction.bind(null, true),

        // for testing
        _setURIDependency: function (FakeURI) {
            URI = FakeURI;
        }
    };
});
