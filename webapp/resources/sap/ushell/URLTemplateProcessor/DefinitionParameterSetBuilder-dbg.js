// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Methods to build the set of parameters used by the URL template.
 *
 *
 * @version 1.141.1
 *
 * @private
 *
 */
sap.ui.define([
    "sap/ushell/URLTemplateProcessor/TemplateParameterParser",
    "sap/ushell/URLTemplateProcessor/Resolvers",
    "sap/ushell/URLTemplateProcessor/utils",
    "sap/ushell/utils/type"
], (oTemplateParameterParser, oResolvers, oUtils, oType) => {
    "use strict";

    /* eslint-disable no-use-before-define */

    const S_PARAMETER_NAMES_PATH = "/payload/parameters/names";

    function buildDefinitionParameterSet (oParamDefs, oSite, sDefaultNamespace) {
        if (!oParamDefs || !oParamDefs.names) {
            // no parameters or no parameter names
            return {};
        }
        if (!oParamDefs.hasOwnProperty("mergeWith")) {
            // no merge with specified
            return oParamDefs.names;
        }
        const vMergeWithOption = oParamDefs && oParamDefs.mergeWith;
        if (Array.isArray(vMergeWithOption) === false
            && typeof vMergeWithOption !== "string") {
            throw new Error("The value of 'mergeWith' can only be a string or an array");
        }

        const oParamNames = oParamDefs && oParamDefs.names;

        const aDependingParameterPaths = findDependingParameterPaths(oParamDefs.mergeWith, oSite, sDefaultNamespace, {} /* oVisitedPaths */);

        const oMergedParamNames = aDependingParameterPaths
            .map((sMergeWithNamesPath) => {
                const oParsedPath = oTemplateParameterParser.parsePath(sDefaultNamespace, sMergeWithNamesPath);
                validateMergeWithPath(oParsedPath);
                const oTargetParamNames = oResolvers.resolvePath(
                    oParsedPath, // oParamDef
                    {}, // oResolvedParameters
                    oSite, // oSite
                    {}, // oApplicationContext
                    {} // oRuntime
                );

                if (!oType.isPlainObject(oTargetParamNames)) {
                    throw new Error(`Cannot merge parameters from '${sMergeWithNamesPath}'. The path must point to an object`);
                }

                return oTargetParamNames;
            })
            .reduce((oMerged, oDependencyParamNames) => {
                oMerged = oUtils.mergeObject(oMerged, oDependencyParamNames);
                return oMerged;
            }, {});

        return oUtils.mergeObject(oMergedParamNames, oParamNames);
    }

    function validateMergeWithPath (oParsedPath) {
        if (oParsedPath.pathType === "relative") {
            throw new Error("Please only specify absolute paths via mergeWith");
        }

        oParsedPath.value.forEach((oPathPart) => {
            if (oPathPart.type !== "literal") {
                throw new Error("Please do not specify references in mergeWith paths");
            }
        });
    }

    function findDependingParameterPaths (vMergeWith, oSite, sDefaultNamespace, oVisitedPaths) {
        if (Array.isArray(vMergeWith)) {
            /* Array notation: just merge a set of names (don't follow mergeWiths) */
            return vMergeWith.slice().reverse(); // reverse: mergeWith array syntax has the base as its last element
        }
        if (typeof vMergeWith === "string") {
            if (oVisitedPaths[vMergeWith]) {
                throw new Error("Detected circular dependency of templates caused by mergeWith statements: ensure the template merges its parameters with a base template.");
            }
            oVisitedPaths[vMergeWith] = true; // mark as visited

            /* String notation: add names of the template + follow merges */
            const oParsedPath = oTemplateParameterParser.parsePath(sDefaultNamespace, vMergeWith);
            validateMergeWithPath(oParsedPath);
            const oTemplateDef = oResolvers.resolvePath(
                oParsedPath, // oParamDef
                {}, // oResolvedParameters
                oSite, // oSite
                {}, // oApplicationContext
                {} // oRuntime
            );

            if (!oTemplateDef) {
                throw new Error(`The specified mergeWith path does cannot be resolved: '${vMergeWith}'`);
            }

            const bHasAllNecessaryTemplateProperties = S_PARAMETER_NAMES_PATH.split("/").slice(1).reduce((o, sSegment) => {
                if (o.result && o.obj && o.obj.hasOwnProperty(sSegment)) {
                    o.obj = o.obj[sSegment];
                } else {
                    o.result = false;
                }
                return o;
            }, { obj: oTemplateDef, result: true }).result;

            if (!bHasAllNecessaryTemplateProperties) {
                throw new Error(`${vMergeWith} does not contain ${S_PARAMETER_NAMES_PATH}. Please make sure ${vMergeWith} points to the root of a URL template.`);
            }

            return findDependingParameterPaths(
                oTemplateDef.payload.parameters.mergeWith,
                oSite,
                sDefaultNamespace,
                oVisitedPaths
            )
                .concat(
                    [vMergeWith + S_PARAMETER_NAMES_PATH]
                );
        }

        return [];
    }

    return {
        buildDefinitionParameterSet: buildDefinitionParameterSet
    };
}, false /* bExport */);
