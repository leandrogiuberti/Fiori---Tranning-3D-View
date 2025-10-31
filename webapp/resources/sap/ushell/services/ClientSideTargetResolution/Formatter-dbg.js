// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * Exposes methods to format complex objects used by ClientSideTargetResolution.
 *
 * This module can be also used to serialize/deserialize these objects (e.g.,
 * inbounds), but only for debugging/testing purposes. Please DO NOT USE this
 * code to build any robust, bullet proof productive feature. It's at the
 * moment ok for debugging purposes only.
 *
 * <p>This is a dependency of ClientSideTargetResolution.  Interfaces exposed
 * by this module may change at any time without notice.</p>
 *
 * @version 1.141.1
 */
sap.ui.define([
], () => {
    "use strict";

    /**
     * Represents an inbound signature as a string.
     *
     * @param {object} oInboundSignature
     *   The signature of an inbound. An object like:
     *   <pre>
     *   {
     *        parameters: {
     *            p1: {
     *                defaultValue: {
     *                    value: "Hi",
     *                    format: "reference"
     *                },
     *                required: false
     *            },
     *            "p2" {
     *                "defaultValue": {
     *                    value: "abc"
     *                },
     *                "filter: {
     *                    value: "Hello",
     *                    format: "regexp"
     *                },
     *                "required": true
     *            }
     *        },
     *        additionalParameters: "ignored"
     *   }
     *   </pre>
     *
     * @returns {string}
     *   The signature in compact notation. For example:
     *
     *   <code>[p1:[@Hi@]],p2:/Hello/<o></code>
     *
     *   Indicating that:
     *      <ul>
     *      <li>the signature has two parameters: p1 and p2</li>
     *      <li>p1 is an optional parameter</li>
     *      <li>p1 has a default value named 'Hi'</li>
     *      <li>Hi is a reference value (e.g., user default)</li>
     *      <li>p2 is a regex value</li>
     *      <li>additional parameters are ignored (because of '<o>')</li>
     *   </ul>
     *
     * @private
     */
    function formatInboundSignature (oInboundSignature) {
        const oInboundSignatureSafe = oInboundSignature || {};
        const mParams = oInboundSignatureSafe.parameters || {};
        const oTypeNotation = {
            optional: "[FORMAT]",
            required: "FORMAT"
        };
        const oFormatNotation = {
            regexp: "/VALUE/",
            reference: "@VALUE@",
            value: "VALUE",
            plain: "VALUE",
            _unknown: "?VALUE?" // unknown format specified
        };
        const oAdditionalParametersSymbol = {
            allowed: "<+>",
            notallowed: "<->",
            ignored: "<o>",
            _unknown: "<?>"
        };

        const bHasParams = mParams && Object.prototype.toString.apply(mParams) === "[object Object]" && Object.keys(mParams).length > 0;
        if (!bHasParams) {
            return `<no params>${
                oAdditionalParametersSymbol[oInboundSignatureSafe.additionalParameters] || oAdditionalParametersSymbol._unknown}`;
        }

        const aResults = [];

        Object.keys(mParams).forEach((sParamName) => {
            const oParamDefinition = mParams[sParamName];
            const sParamType = oParamDefinition.required ? "required" : "optional";
            const sParamFilterValue = oParamDefinition.filter && oParamDefinition.filter.value;
            const sParamDefaultValue = oParamDefinition.defaultValue && oParamDefinition.defaultValue.value;
            const sParamFilterFormat = (oParamDefinition.filter && oParamDefinition.filter.format) || "plain";
            const sParamDefaultFormat = (oParamDefinition.defaultValue && oParamDefinition.defaultValue.format) || "plain";

            const aValueRepr = [];
            const sParamFilterFormatNotation = oFormatNotation[sParamFilterFormat] || oFormatNotation._unknown;
            const sParamDefaultFormatNotation = oFormatNotation[sParamDefaultFormat] || oFormatNotation._unknown;

            if (sParamFilterValue) {
                aValueRepr.push(
                    oTypeNotation.required.replace("FORMAT",
                        sParamFilterFormatNotation.replace("VALUE", sParamFilterValue)
                    )
                );
            }
            if (sParamDefaultValue) {
                aValueRepr.push(
                    oTypeNotation.optional.replace("FORMAT",
                        sParamDefaultFormatNotation.replace("VALUE", sParamDefaultValue)
                    )
                );
            }
            aResults.push(
                oTypeNotation[sParamType].replace("FORMAT",
                    `${sParamName}:${aValueRepr.join("")}`
                )
            );
        });

        return aResults.join(",") + (
            oAdditionalParametersSymbol[oInboundSignatureSafe.additionalParameters] || oAdditionalParametersSymbol._unknown
        );
    }

    /**
     * Represents an inbound as a string.
     *
     * @param {object} oInbound
     *   An inbound object. An object like:
     *   <pre>
     *   {
     *      semanticObject: "SomeSO",
     *      action: "someAction",
     *      signature: {
     *        parameters: {
     *            p1: {
     *                defaultValue: {
     *                    value: "Hi",
     *                    format: "reference"
     *                },
     *                required: false
     *            },
     *            "p2" {
     *                "defaultValue": {
     *                    value: "abc"
     *                },
     *                "filter: {
     *                    value: "Hello",
     *                    format: "regexp"
     *                },
     *                "required": true
     *            }
     *        },
     *        additionalParameters: "ignored"
     *      }
     *   }
     *   </pre>
     *
     * @returns {string}
     *   The inbound in compact notation. For example:
     *
     *   <code>#SomeSO-someAction{[p1:[@Hi@]],p2:/Hello/<o>}</code>
     *
     * @private
     */
    function formatInbound (oInbound) {
        return `#${oInbound.semanticObject}-${oInbound.action
        }{${formatInboundSignature(oInbound.signature)}}`;
    }

    /**
     * Parses a compact signature to an object
     *
     * @param {string} sCompactSignature
     *   The inbound compact signature
     *
     * @returns {object}
     *   The inbound signature object
     *
     * @private
     */
    function parseInboundSignature (sCompactSignature) {
        function parseParameterValue (sValue) {
            const oValue = [
                { re: new RegExp(/^[/](.+)[/]$/), format: "regexp" },
                { re: new RegExp(/^[@](.+)[@]$/), format: "reference" },
                { re: new RegExp(/^[?](.+)[?]$/), format: "???" }
            ].reduce((oResult, oDefinition) => {
                const aMatch = sValue.match(oDefinition.re);

                if (oResult) { // we have it already
                    return oResult;
                }

                if (!aMatch) { // null -> nothing recognized
                    return null;
                }

                return {
                    format: oDefinition.format,
                    value: aMatch[1]
                };
            }, null);

            if (oValue) {
                return oValue;
            }

            return { value: sValue };
        }

        function parseParameter (sParameterToParse) {
            let sParamDefaultValue;
            let sParamFilterValue;
            let sParamName;

            const sNoParamDef = "<no params>";
            const sNoSquareBrackets = "[^\\]\\[]";
            const sRequiredParamDef = `(${sNoSquareBrackets}+?):(${sNoSquareBrackets}*)(.*)`;
            const sOptionalParamDef = `\\[${sRequiredParamDef}\\]`;
            const sParamDef = `${sNoParamDef}|${sOptionalParamDef}|${sRequiredParamDef}`;
            const reCompactSignature = new RegExp(
                `^${sParamDef}$`
            );

            const oParsed = {
                success: false,
                name: null, // no parameter found
                value: {}
            };

            const aMatch = sParameterToParse.match(reCompactSignature);

            if (!aMatch) {
                return oParsed;
            }

            const sWholeParam = aMatch.shift(); // the whole match

            while (aMatch.length > 0) {
                sParamName = aMatch.shift();
                sParamFilterValue = aMatch.shift();
                sParamDefaultValue = aMatch.shift();

                if (sParamName) {
                    oParsed.name = sParamName;

                    if (sParamFilterValue) {
                        oParsed.value.filter = parseParameterValue(sParamFilterValue);
                    }
                    if (sParamDefaultValue) {
                        oParsed.value.defaultValue = parseParameterValue(
                            sParamDefaultValue.replace(/\[(.+)\]/, "$1")
                        );
                    }

                    oParsed.value.required = (sWholeParam.charAt(0) !== "[");
                }
            }

            oParsed.success = true;

            return oParsed;
        }

        // additional parameters
        function parseAdditionalParametersValue (sAdditionalParametersToParse) {
            return [
                { "<+>": "allowed" },
                { "<->": "notallowed" },
                { "<o>": "ignored" }
            ].reduce((sResult, oPossibleResult, iIdx, aPossibilities) => {
                if (sResult) {
                    return sResult;
                }

                const sPossibleAdditionalParameterId = Object.keys(oPossibleResult)[0];

                if (sAdditionalParametersToParse === sPossibleAdditionalParameterId) {
                    return oPossibleResult[sPossibleAdditionalParameterId];
                }

                return null;
            }, null);
        }

        function separateParameters (sParameters) {
            const aIndividualParameters = [];
            sParameters.split(":").reduce((sParameterName, sNextLot, iIdx, aPieces) => {
                let sValues;
                let sNextName;
                let aValuesOrNames;

                // sNextLot can be: name1 (first parameter)
                // or: <values for name1> name2
                // or: <values for name2>
                if (iIdx === 0) { // first split = parameter name
                    return sNextLot;
                }
                if (iIdx < aPieces.length - 1) {
                    aValuesOrNames = sNextLot.split(",");
                    if (aValuesOrNames.length > 1) {
                        // split was successful (more than one parameter)
                        sNextName = aValuesOrNames.pop();
                        sValues = aValuesOrNames.join(",");
                    } else {
                        return `${sParameterName}:${sNextLot}`;
                    }
                } else {
                    sValues = sNextLot;
                }

                aIndividualParameters.push(
                    [sParameterName, sValues].join(":")
                );
                return sNextName;
            }, "");

            return aIndividualParameters;
        }

        const oResult = {
            parameters: {}
        };

        // signature parameters
        const sAdditionalParametersValue
            = sCompactSignature.substr(sCompactSignature.length - 3, 3);

        const bHaveAdditionalParameters = !!sAdditionalParametersValue.match(/<[?o+-]>/);

        let sParameters = sCompactSignature;
        if (bHaveAdditionalParameters) {
            sParameters = sCompactSignature.substr(0, sCompactSignature.length - 3);
        }
        const aSeparatedParameters = separateParameters(sParameters);

        aSeparatedParameters.forEach((sParameterToParse) => {
            const oParsed = parseParameter(sParameterToParse);
            if (!oParsed.success) {
                throw new Error(`Cannot parse parameters from ${sCompactSignature}`);
            }

            if (oParsed.name) {
                oResult.parameters[oParsed.name] = oParsed.value;
            }
        });

        // additional parameters
        if (bHaveAdditionalParameters) {
            const sParsedAdditionalParameters
                = parseAdditionalParametersValue(sAdditionalParametersValue);

            if (sParsedAdditionalParameters) {
                oResult.additionalParameters
                    = parseAdditionalParametersValue(sAdditionalParametersValue);
            }
        } else {
            oResult.additionalParameters = "ignored";
        }

        return oResult;
    }

    function parseInbound (sInbound) {
        const aMatches = sInbound.match(/^#(.+?)-(.+?)({(.+)})?$/);

        if (!aMatches) {
            throw new Error("Cannot parse inbound");
        }

        const oResult = {
            semanticObject: aMatches[1],
            action: aMatches[2],
            signature: {
                parameters: {}
            }
        };

        if (!aMatches[3]) {
            return oResult;
        }

        oResult.signature = parseInboundSignature(aMatches[4]);

        return oResult;
    }

    return {
        formatInboundSignature: formatInboundSignature,
        parseInboundSignature: parseInboundSignature,
        parseInbound: parseInbound,
        formatInbound: formatInbound
    };
});
