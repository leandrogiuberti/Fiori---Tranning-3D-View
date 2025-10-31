/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ErrorHandler from "./error/ErrorHandler";
import SearchModel from "./SearchModel";
import { OrderBy, UrlParameters } from "./SearchModelTypes";
import { Filter } from "./sinaNexTS/sina/Filter";

export function renderUrlFromParameters(
    model: SearchModel,
    top: number,
    filter: Filter,
    encodeFilter: boolean,
    orderBy?: OrderBy
): string {
    const parameters: UrlParameters = {
        top: top.toString(),
        filter: encodeFilter
            ? encodeURIComponent(JSON.stringify(filter.toJson()))
            : JSON.stringify(filter.toJson()),
    };
    if (model.config.FF_sortOrderInUrl && orderBy && Object.keys(orderBy).length > 0) {
        if (orderBy.orderBy) {
            parameters.orderby = encodeURIComponent(orderBy.orderBy);
        }
        if (orderBy.sortOrder) {
            parameters.sortorder = orderBy.sortOrder; // ASC | DESC
        }
    }
    try {
        return model.config.renderSearchUrl(parameters);
    } catch (e) {
        const errorHandler = ErrorHandler.getInstance();
        errorHandler.onError(e);
        return "";
    }
}
