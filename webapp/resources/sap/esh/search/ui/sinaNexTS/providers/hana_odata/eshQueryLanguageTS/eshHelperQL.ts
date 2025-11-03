/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// file copied from DSP (DSP specifica removed), src/components/shell/utility/Crud.ts
// import * as eshObjectsQL from "../sinaNexTS/providers/hana_odata/eshObjects/src/index";
import {
    Expression,
    IESSearchOptions,
    LogicalOperator,
    SEARCH_DEFAULTS,
    parseFreeStyleText,
} from "../eshObjects/src/index";

interface ParametersType {
    $apply?: string;
    $orderby?: string;
    [key: string]: string;
}
export function createEshSearchQueryUrl(options?: IESSearchOptions): string {
    let searchPath = options.resourcePath || "/$all";
    if (options.metadataCall === true) {
        if (options.metadataObjects) {
            if (options.metadataObjects.entitySets) {
                searchPath += "/EntitySets(" + options.metadataObjects.entitySets + ")";
            }
        }
        return searchPath;
    }
    if (options.suggestTerm) {
        searchPath =
            searchPath +
            `/${encodeURIComponent("GetSuggestion(term='" + options.suggestTerm.replace(/'/g, "''") + "')")}`;
    }
    const newODataFilter = new Expression({
        operator: LogicalOperator.and,
        items: [],
    });
    if (!options) {
        options = {
            query: SEARCH_DEFAULTS.query,
            scope: SEARCH_DEFAULTS.scope,
            $select: [],
            facets: [],
        };
    } else {
        if (!options.query) {
            options.query = SEARCH_DEFAULTS.query;
        }
        if (!options.scope) {
            options.scope = SEARCH_DEFAULTS.scope;
        }
        if (!options.$select) {
            options.$select = [];
        }
        if (!options.facets) {
            options.facets = [];
        }
    }
    if (options.oDataFilter) {
        newODataFilter.items.push(options.oDataFilter);
    }
    if (newODataFilter.items.length > 0) {
        options.oDataFilter = newODataFilter;
    }
    const urlSearchPath = searchPath;
    let query = "SCOPE:" + options.scope;

    if (options.searchQueryFilter) {
        const searchQueryFilterStatement = options.searchQueryFilter.toStatement().trim();
        if (searchQueryFilterStatement.length > 0) {
            if (query !== "") {
                query += " ";
            }
            query += searchQueryFilterStatement;
        }
    }
    if (options.freeStyleText) {
        if (query !== "") {
            query += " ";
        }
        const freeStyleTextExpression = parseFreeStyleText(options.freeStyleText);
        query += freeStyleTextExpression.toStatement();
    }
    const parameters: ParametersType = {};
    for (const optionKey of Object.keys(options)) {
        switch (optionKey) {
            case "query":
                if (options.$apply) {
                    // it is not allowed to use query and $apply together
                    break;
                }
                // eslint-disable-next-line no-case-declarations
                let filter = query === "" ? "" : "filter(Search.search(query='" + query + "')";
                if (options.oDataFilter && options.oDataFilter.items.length > 0) {
                    filter += " and " + options.oDataFilter.toStatement();
                }
                if (query !== "") {
                    filter += ")";
                }
                if (options.groupby && options.groupby.properties && options.groupby.properties.length > 0) {
                    filter += `/groupby((${options.groupby.properties.join(",")})`;
                    if (options.groupby.aggregateCountAlias && options.groupby.aggregateCountAlias !== "") {
                        filter += `,aggregate($count as ${options.groupby.aggregateCountAlias})`;
                    }
                    filter += ")";
                }
                if (filter !== "") {
                    parameters.$apply = filter;
                }
                break;
            case "$orderby":
                if (options.$orderby) {
                    parameters.$orderby = options.$orderby.map((i) => i.key + " " + i.order).join(",");
                }
                break;
            case "facets":
            case "$select":
                if (options[optionKey].length > 0) {
                    parameters[optionKey] = options[optionKey].join(",");
                }
                break;
            case "$top":
            case "$skip":
            case "$count":
            case "whyfound":
            case "estimate":
            case "wherefound":
            case "language":
            case "facetlimit":
                parameters[optionKey] = options[optionKey];
                break;
            case "resourcePath":
            default:
                break;
        }
    }
    const queryParameters = Object.keys(parameters)
        .map((i) => encodeURIComponent(i) + "=" + encodeURIComponent(parameters[i]))
        .join("&");
    return queryParameters === "" ? urlSearchPath : urlSearchPath + "?" + queryParameters;
}
