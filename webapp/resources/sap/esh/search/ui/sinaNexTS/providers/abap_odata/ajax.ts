/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AjaxClientProperties } from "../../core/AjaxClient";
import { AjaxClient } from "../../core/AjaxClient";
import { ajaxErrorFactory } from "./ajaxErrorFactory";
import {
    isSearchRequest,
    searchRequest,
    isChartRequest,
    chartRequest,
    isValueHelperRequest,
    valueHelperRequest,
    isSuggestionRequest,
    suggestionRequest,
    isObjectSuggestionRequest,
    objectSuggestionRequest,
    isNavigationEvent,
    InavigationEvent,
} from "./ajaxTemplates";
import { createDefaultAjaxErrorFactory } from "../../core/defaultAjaxErrorFactory";

const _removeActAsQueryPart = function (node) {
    if (node.SubFilters !== undefined) {
        // not a leaf
        delete node.ActAsQueryPart;
        for (let i = 0; i < node.SubFilters.length; i++) {
            this._removeActAsQueryPart(node.SubFilters[i]);
        }
    }
};

export function createAjaxClient(properties?: AjaxClientProperties): AjaxClient {
    const defaults: AjaxClientProperties = {
        csrf: true,
        errorFactories: [ajaxErrorFactory, createDefaultAjaxErrorFactory()],
        errorFormatters: [],
        requestNormalization: function (
            payload:
                | typeof searchRequest
                | typeof chartRequest
                | typeof valueHelperRequest
                | typeof suggestionRequest
                | typeof objectSuggestionRequest
                | InavigationEvent
        ) {
            if (payload === null) {
                return "";
            }
            if (isNavigationEvent(payload)) {
                return {
                    NotToRecord: true,
                };
            }
            if (
                isSearchRequest(payload) ||
                isChartRequest(payload) ||
                isValueHelperRequest(payload) ||
                isSuggestionRequest(payload) ||
                isObjectSuggestionRequest(payload)
            ) {
                delete payload.d.QueryOptions.ClientSessionID;
                delete payload.d.QueryOptions.ClientCallTimestamp;
                delete payload.d.QueryOptions.ClientServiceName;
                delete payload.d.QueryOptions.ClientLastExecutionID;

                // insert "ExcludedDataSources" in payload
                // properties' ordering is important in stringified payload
                // "ExcludedDataSources" should follow "DataSources"
                // find "DataSources":[...], and insert "ExcludedDataSources" after
                let payloadString = JSON.stringify(payload); // object -> string

                const headString = '"DataSources":[';

                const endString = "]";
                const headIndex = payloadString.indexOf(headString);
                const endIndex =
                    headIndex + payloadString.substring(headIndex).indexOf(endString) + endString.length;

                const insertedString = ',"ExcludedDataSources":[]';
                payloadString = [
                    payloadString.slice(0, endIndex),
                    insertedString,
                    payloadString.slice(endIndex),
                ].join("");
                payload = JSON.parse(payloadString); // string -> object
                if (
                    (
                        payload as
                            | typeof searchRequest
                            | typeof chartRequest
                            | typeof valueHelperRequest
                            | typeof suggestionRequest
                            | typeof objectSuggestionRequest
                    ).d.Filter &&
                    (isSearchRequest(payload) ||
                        isChartRequest(payload) ||
                        isValueHelperRequest(payload) ||
                        isSuggestionRequest(payload) ||
                        isObjectSuggestionRequest(payload))
                ) {
                    _removeActAsQueryPart(payload.d.Filter);
                }
            }
            return payload;
        },
        //csrfByPassCache: true
    };
    properties = Object.assign({}, defaults, properties);

    const client = new AjaxClient(properties);
    return client;
}
