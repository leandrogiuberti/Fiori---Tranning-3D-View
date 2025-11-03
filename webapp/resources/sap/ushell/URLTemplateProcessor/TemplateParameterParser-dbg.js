// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file the URL Template Parameter parser.
 *
 * This file contains utilities to parse an entire set of template parameter definitions.
 * This parser allows to log what is understood by the machine during runtime (for debugging purposes),
 * but also to dramatically reduce the complexity of the code and its future maintainability.
 *
 * In practice, can be used to turn sets of strings like definitions like:
 *   <pre>
 *   { p1: "{*|match(a)|match(b)}" }
 *   </pre>
 * into something like:
 *   <pre>
 *   {
 *     "type": "expression",
 *     "value": {
 *       "type": "pipe",
 *       "value": [
 *         { "type": "wildcard", "value": "*" },
 *         {
 *           "type": "function",
 *           "args": [{ type: "literal", value: "a" }],
 *           "name": "match",
 *           "params": []
 *         }, {
 *           "type": "function",
 *           "args": [{ type: "literal", value: "b" }],
 *           "name": "match",
 *           "params": []
 *         }
 *       ]
 *     }
 *   }
 *   </pre>
 * @version 1.141.0
 * @private
 */
sap.ui.define([
    "sap/ushell/URLTemplateProcessor/Functions"
], (
    _Functions
) => {
    "use strict";

    function buildExpressionRegExp () {
        const sOptionalNameSpace = "[a-zA-Z0-9]+?:";
        const sVarName = `((&(${sOptionalNameSpace})?)?[.a-zA-Z0-9_-]+?)`;
        const sQuotedLiteral = "('(.*?)')";
        const sUnquotedLiteral = "([^' ]*?)";
        const sVarRef = `{(${sVarName})}`;

        const sPath = "("
            + `[.]?([/](${sVarName}|${sVarRef}))+`
            + ")";

        const sListItem = `(${
            sPath
        }|${
            sQuotedLiteral
        }|${
            sVarName
        }|${
            sVarRef
        })`;

        const sList = `(${sListItem}(,${sListItem})*)`;

        const sFunctionArg = `(${
            sUnquotedLiteral
        }|${
            sVarRef
        })`;

        const sFunctionArgsList = `(${sFunctionArg}(,${sFunctionArg})*)`;

        const sFunctionArgs = "("
            + `[(]${
                sFunctionArgsList
            }[)]`
            + ")?";

        const sAllFunctionsRegExpString = _Functions.getPossibleFunctionsRegExpString();

        const sFunction = "("
            + `(${sAllFunctionsRegExpString})`
            + `(${sFunctionArgs})`
            + ")";

        const sWildcardExpression = `([*]([|]${sFunction})*)`;

        const sExpRegExp = `^{(${
            sWildcardExpression
        }|`
            + `((${sFunction})([ ](${sList}))?)`
            + "|"
            + `(${sListItem})`
            + ")}$";

        const reExpr = new RegExp(sExpRegExp);
        return reExpr;
    }

    function removeSurroundingChars (s) {
        const aChars = s.split("");
        aChars.shift();
        aChars.pop();
        return aChars.join("");
    }

    function parseList (sDefaultNamespace, sList, sSeparator) {
        if (!sList) {
            return [];
        }

        // prevent splitting on escaped separator
        const aSplittedList = sList
            .split(sSeparator)
            .reduce((aArgs, sNextArg, iIdx) => {
                if (iIdx === 0) {
                    aArgs.push(sNextArg);
                    return aArgs;
                }

                const iLastIndex = aArgs.length - 1;
                const sPrevious = aArgs[iLastIndex];

                const bMustMerge = sPrevious.length > 0
                    && sPrevious.charAt(sPrevious.length - 1) === "\\";

                let sPrevArg = "";
                if (bMustMerge) {
                    sPrevArg = aArgs.pop();
                    sPrevArg = sPrevArg.substr(0, sPrevArg.length - 1) + sSeparator;
                }

                aArgs.push(sPrevArg + sNextArg);
                return aArgs;
            }, []);

        return aSplittedList;
    }

    function removePrefix (sTarget, sPrefixToRemove) {
        if (sTarget.indexOf(sPrefixToRemove) === 0) {
            return sTarget.substr(sPrefixToRemove.length);
        }
        throw new Error(`Given string does not start with prefix '${sPrefixToRemove}'`);
    }

    function parseLiteral (sLiteral) {
        return {
            type: "literal",
            value: sLiteral
        };
    }

    function parsePathPart (sDefaultNamespace, sPart) {
        if (sPart.charAt(0) === "{" && sPart.charAt(sPart.length - 1) === "}") {
            // eslint-disable-next-line no-use-before-define
            return parseListItem(sDefaultNamespace, removeSurroundingChars(sPart));
        }

        return {
            type: "literal",
            value: sPart
        };
    }

    function parsePath (sDefaultNamespace, sPath) {
        const aPathParts = sPath.split("/");
        let sPathType = "relative";

        if (aPathParts[0] === "") {
            sPathType = "absolute";
            aPathParts.shift();
        }

        if (aPathParts[0] === ".") {
            aPathParts.shift();
        }

        return {
            type: "path",
            pathType: sPathType,
            value: aPathParts.map(parsePathPart.bind(null, sDefaultNamespace))
        };
    }

    function parseReference (sReference) {
        let sReferenceName = sReference.substr(1);
        let sNamespace;
        if (sReferenceName.indexOf(":") >= 0) {
            const aReferenceParts = sReferenceName.split(":");
            sNamespace = aReferenceParts[0];
            sReferenceName = aReferenceParts[1];
        }

        const oResult = {
            type: "reference",
            value: sReferenceName
        };

        if (sNamespace) {
            oResult.namespace = sNamespace;
        }

        return oResult;
    }

    function parseListItem (sDefaultNamespace, sListItem) {
        if (sListItem.charAt(0) === "{" && sListItem.charAt(sListItem.length - 1) === "}") {
            return parseListItem(sDefaultNamespace, removeSurroundingChars(sListItem));
        }
        if (sListItem.indexOf(".") === 0 || sListItem.indexOf("/") === 0) {
            return parsePath(sDefaultNamespace, sListItem);
        }
        if (sListItem.charAt(0) === "'" && sListItem.charAt(sListItem.length - 1) === "'") {
            return parseLiteral(removeSurroundingChars(sListItem));
        }
        if (sListItem.charAt(0) === "&") {
            return parseReference(sListItem);
        }

        return {
            type: "reference",
            value: sListItem,
            namespace: sDefaultNamespace
        };
    }

    function parseFunction (sDefaultNamespace, sFunction) {
        const sFunctionName = sFunction.split(/[(\s]/)[0];

        let sRemainingFunction = removePrefix(sFunction, sFunctionName);
        sRemainingFunction = sRemainingFunction.replace(/^\s+/, "");

        let sFunctionArgs = "";
        if (sRemainingFunction.charAt(0) === "(") {
            // there are arguments
            const iFunctionArgsEnd = sRemainingFunction.search(/([)]\s)|([)]$)/);
            if (iFunctionArgsEnd === -1) {
                throw new Error(`Cannot find termination of function '${sRemainingFunction}' in '${sFunction}'`);
            }
            sFunctionArgs = sRemainingFunction.substr(1, iFunctionArgsEnd - 1);

            sRemainingFunction = removePrefix(sRemainingFunction, `(${sFunctionArgs})`);
            sRemainingFunction = sRemainingFunction.replace(/^\s+/, "");
        }

        const sFunctionParams = sRemainingFunction;

        return {
            type: "function",
            name: sFunctionName,
            args: parseList(sDefaultNamespace, sFunctionArgs, ",").map((s) => {
                // function arguments use another syntax
                // name -> a literal
                // {name} -> reference
                // ... and these are the only possibilities.
                // so we convert accordingly, to be able to use parseListItem
                return s.charAt(0) === "{"
                    ? removeSurroundingChars(s)
                    : `'${s}'`;
            }).map(parseListItem.bind(null, sDefaultNamespace)),
            params: parseList(sDefaultNamespace, sFunctionParams, ",").map(parseListItem.bind(null, sDefaultNamespace))
        };
    }

    function parsePipeExpression (sDefaultNamespace, sPipeExpression) {
        const aPipeParts = parseList(sDefaultNamespace, sPipeExpression, "|");
        const sWildcard = aPipeParts.shift();
        return {
            type: "pipe",
            value: [{
                type: "wildcard",
                value: sWildcard
            }].concat(aPipeParts.map(parseFunction.bind(null, sDefaultNamespace)))
        };
    }

    function parseExpression (sDefaultNamespace, sExpressionBody) {
        const reExpression = buildExpressionRegExp();
        const aExpressionGroups = reExpression.exec(sExpressionBody);

        if (aExpressionGroups === null) {
            throw new Error(`Cannot parse expression: '${sExpressionBody}'`);
        }

        const sStrippedExpressionBody = removeSurroundingChars(sExpressionBody);

        if (sStrippedExpressionBody.indexOf("*") === 0) {
            return parsePipeExpression(sDefaultNamespace, sStrippedExpressionBody);
        }

        const sAllFunctionsRegExpString =
            `^(${_Functions.getPossibleFunctionsRegExpString()})[^a-z]`;
        const rRegExp = new RegExp(sAllFunctionsRegExpString);
        if (rRegExp.exec(sStrippedExpressionBody)) {
            return parseFunction(sDefaultNamespace, sStrippedExpressionBody);
        }

        return parseListItem(sDefaultNamespace, sStrippedExpressionBody);
    }

    function extractExpressionBody (s) {
        const bExpressionExpected = s.indexOf("{") === 0;
        const reExpr = buildExpressionRegExp();
        const aGroups = reExpr.exec(s);

        if (!aGroups) {
            if (bExpressionExpected) {
                throw new Error(`Expression was expected. But ${s} does not look like a valid expression`);
            }
            return null;
        }

        return aGroups[1];
    }

    function isExpression (s) {
        return extractExpressionBody(s) !== null;
    }

    function isLiteral (s) {
        return typeof s === "string" && !isExpression(s);
    }

    function parseParameterValue (sDefaultNamespace, vParameterValue) {
        let sParameterValue = vParameterValue;
        let sRenameTo = null;
        if (Object.prototype.toString.apply(vParameterValue) === "[object Object]") {
            sParameterValue = vParameterValue.value;
            sRenameTo = vParameterValue.renameTo;
        }

        const bIsLiteral = isLiteral(sParameterValue);
        if (bIsLiteral) {
            return parseLiteral(sParameterValue);
        }

        const sType = "expression";
        const oParsedExpression = parseExpression(sDefaultNamespace, sParameterValue);

        const oParsedParameter = {
            type: sType,
            value: oParsedExpression
        };

        if (sRenameTo) {
            oParsedExpression.renameTo = sRenameTo;
        }

        return oParsedParameter;
    }

    function parseTemplateParameterSet (oParameterSet, sDefaultNamespace) {
        return Object.keys(oParameterSet).reduce((oParsed, sNextParameter) => {
            const vParameterValue = oParameterSet[sNextParameter];
            oParsed[sNextParameter] = parseParameterValue(sDefaultNamespace, vParameterValue);
            return oParsed;
        }, {});
    }

    function parseTemplateParameterSetAsLiterals (oParameterSet, sDefaultNamespace) {
        return Object.keys(oParameterSet).reduce((oParsed, sNextParameter) => {
            const vParameterValue = oParameterSet[sNextParameter];
            oParsed[sNextParameter] = parseLiteral(vParameterValue);
            return oParsed;
        }, {});
    }

    return {
        parseTemplateParameterSet: parseTemplateParameterSet,
        parseTemplateParameterSetAsLiterals: parseTemplateParameterSetAsLiterals,
        parsePath: parsePath,

        _isExpression: isExpression,
        _parseList: parseList,
        _parseParameterValue: parseParameterValue
    };
});
