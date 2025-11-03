// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file The URL Template Processor.
 *
 * This module can be used to generate URLs, based on a template and a given context.
 * A URL template shows the structure of the desired URL, reporting
 * the name of the target parameters in the various parts of this structure.
 *
 * A URL template is expressed according to the proposed standard rfc6570, for example:
 * <code>http://www.example.com{?queryParam}</code>
 *
 * The parameters that appear in the URL template are then resolved as specified
 * by a mini-language that expresses how the parameter can be recovered.
 *
 * For example, the set below allows to recover <code>queryParam</code> from a specific path in the site:
 * <pre>
 * {
 *   queryParam: "{/path/to/my/section}"
 * }
 * </pre>
 *
 * The following URL results when the template of the example above is expanded with the above set of parameters:
 * <code>http://www.example.com?queryParam=myValue</code>
 *
 * The language to define parameters in the URL Template parameter set contains a minimal set of conditionals,
 * logical operators, and functions that allow to define the parameter set with a certain degree of control.
 *
 * @version 1.141.0
 * @private
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/thirdparty/URI",
    "sap/ui/thirdparty/URITemplate", // needed for "URI#expand"
    "sap/ushell/URLTemplateProcessor/DefinitionParameterSetBuilder",
    "sap/ushell/URLTemplateProcessor/DependencyGraph",
    "sap/ushell/URLTemplateProcessor/Resolvers",
    "sap/ushell/URLTemplateProcessor/TemplateParameterParser",
    "sap/ushell/URLTemplateProcessor/utils"
], (
    Log,
    URI,
    URITemplate,
    _DefinitionParameterSetBuilder,
    _DependencyGraph,
    _Resolvers,
    _TemplateParameterParser,
    _utils
) => {
    "use strict";

    function log (s) {
        Log.debug(s, "sap.ushell.URLTemplateProcessor");
    }

    function formatValueForLogging (vValue) {
        if (typeof vValue === "undefined") {
            return "<undefined>";
        }
        if (typeof vValue === "string") {
            if (vValue === "") {
                return "<empty string>";
            }
            return `'${vValue}'`;
        }
        if (typeof vValue === "number") {
            return `(number) ${vValue}`;
        }
        if (typeof vValue === "boolean") {
            return `(bool) ${vValue}`;
        }

        let sSerializedObject;
        if (typeof vValue === "object") {
            sSerializedObject = JSON.stringify(vValue);
            if (sSerializedObject.length > 255) {
                sSerializedObject = `${sSerializedObject.substr(0, 255)}...`;
            }
        } else {
            sSerializedObject = "{other type}";
        }

        return sSerializedObject;
    }

    function extractPostExpansionOperations (oParameterSet) {
        const aParametersWithOperations = Object.keys(oParameterSet).filter((sParamName) => {
            return typeof oParameterSet[sParamName] === "object"
                && oParameterSet[sParamName].hasOwnProperty("renameTo");
        });

        const aOperations = [];

        aParametersWithOperations.forEach((sParamName) => {
            const oParamDef = oParameterSet[sParamName];
            if (oParamDef.hasOwnProperty("renameTo")) {
                aOperations.push((sUrlTemplate, sUrl) => {
                    // limit replacement to query only
                    let sReplacedUrl = sUrl;

                    sReplacedUrl = sUrl.replace(
                        new RegExp(`${sParamName}=`, "g"),
                        `${oParamDef.renameTo}=`
                    );

                    return sReplacedUrl;
                });
            }
        });

        return aOperations;
    }

    function prepareExpandData (oTemplatePayload, oSite, oRuntime, oApplicationContext, sDefaultNamespace) {
        log(`[TEMPLATE EXPANSION] ${oTemplatePayload.urlTemplate}`);

        const oDefinitionParamsSet = _DefinitionParameterSetBuilder.buildDefinitionParameterSet(oTemplatePayload.parameters, oSite, sDefaultNamespace) || {};
        const oRuntimeParamsSimpleSet = _utils.removeArrayParameterNotation(oRuntime[sDefaultNamespace] || {});
        const oDefinitionParameterSetParsed = _TemplateParameterParser.parseTemplateParameterSet(oDefinitionParamsSet, sDefaultNamespace);
        const oRuntimeParamsSimpleSetParsed = _TemplateParameterParser.parseTemplateParameterSetAsLiterals(oRuntimeParamsSimpleSet);
        const oParameterSetParsed = _utils.mergeObject(oRuntimeParamsSimpleSetParsed, oDefinitionParameterSetParsed);

        log(`- parsed template parameters: ${JSON.stringify(oParameterSetParsed, null, 3)}`);

        const oGraph = _DependencyGraph.buildDependencyGraph(oParameterSetParsed);

        log(`- created dependency graph: ${JSON.stringify(oGraph, null, 3)}`);

        const aResolutionOrder = _DependencyGraph.getDependencyResolutionOrder(oGraph);

        log(`- resolving in order: ${aResolutionOrder.join(" > ")}`);

        const oResolvedParameters = _Resolvers.resolveAllParameters(
            oParameterSetParsed,
            aResolutionOrder,
            oSite,
            oRuntime,
            oApplicationContext,
            sDefaultNamespace
        );

        Object.keys(oResolvedParameters).forEach((sParamName) => {
            const sParamValue = oResolvedParameters[sParamName];
            log(`${sParamName} --> ${formatValueForLogging(sParamValue)}`);
        });

        return {
            oDefinitionParamsSet: oDefinitionParamsSet,
            oResolvedParameters: oResolvedParameters
        };
    }

    function _expand (oTemplatePayload, oExpandProcessData) {
        const aPostExpansionOperations = extractPostExpansionOperations(oExpandProcessData.oDefinitionParamsSet || {});
        const sUrlTemplate = oTemplatePayload.urlTemplate;

        let sUrl = URI.expand(sUrlTemplate, oExpandProcessData.oResolvedParameters).toString();
        log(`- created URL: ${sUrl}`);

        aPostExpansionOperations.forEach((fnOperation) => {
            sUrl = fnOperation(sUrlTemplate, sUrl);
        });

        if (aPostExpansionOperations.length > 0) {
            log(`- created URL (post expansion): ${sUrl}`);
        }

        return sUrl;
    }

    /**
     * Expands a URL Template, logging any activity via <code>Log.debug</code>.
     *
     * @param {object} oTemplatePayload The template payload, an object including the url template and the url template parameter set.
     * @param {object} oSite The reference to the site containing all data. This is used to resolve parameters of (absolute) path types.
     * @param {object} oRuntime The runtime. It is an object containing namespaces defined by the runtime
     *   that exposes URL templating functionality (e.g., ClientSideTargetResolution).
     *   Each namespace can be a single string value, or an object containing a set of parameters, for example like:
     *   <pre>
     *   {
     *     innerAppRoute: "/some/app/route",
     *     intentParameters: {
     *       p1: ["v1"],
     *       p2: "v2"
     *     }
     *   }
     *   </pre>
     * @param {object} oApplicationContext The application context. This is an object used to resolve parameters with relative path type.
     *   It's normally a subset of the site, but this is not a necessity.  It can be a completely separate object.
     * @param {string} sDefaultNamespace The default namespace from <code>oRuntime</code>
     *   where the values of parameters without specified namespace can be recovered.
     * @param {string} sURIHashContext The URI context to be used during expansion. This is normally the current window location,
     *   but can be different in some cases (e.g. during navigation target resolution).
     * @returns {string} A URL expanded according to the given template.
     */
    function expand (oTemplatePayload, oSite, oRuntime, oApplicationContext, sDefaultNamespace, sURIHashContext) {
        // Set context for any access to URI during expansion
        _utils.setURIHashContext(sURIHashContext);

        const oExpandProcessData = prepareExpandData(oTemplatePayload, oSite, oRuntime, oApplicationContext, sDefaultNamespace);
        const sExpandedUrl = _expand(oTemplatePayload, oExpandProcessData);

        // Clear context after expansion
        _utils.setURIHashContext(undefined);

        return sExpandedUrl;
    }

    return {
        prepareExpandData: prepareExpandData,
        expand: expand
    };
});
