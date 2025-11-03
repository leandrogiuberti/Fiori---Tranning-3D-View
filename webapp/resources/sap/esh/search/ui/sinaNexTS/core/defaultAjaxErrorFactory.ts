/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { getText } from "../sina/i18n";
import { AjaxErrorFactory, RequestProperties, ResponseProperties } from "./ajax";
import { ServerErrorCode, SinaError, ServerError, NoConnectionError } from "./errors";

export interface DefaultAjaxErrorFactoryProperties {
    allowedStatusCodes?: Array<number>;
}

export function createDefaultAjaxErrorFactory(props?: DefaultAjaxErrorFactoryProperties): AjaxErrorFactory {
    const allowedStatusCodes = props?.allowedStatusCodes ?? [200, 201, 204];
    return function defaultAjaxErrorFactory(
        request: RequestProperties,
        response: ResponseProperties
    ): SinaError {
        if (allowedStatusCodes.indexOf(response.status) >= 0) {
            return; // no error
        }
        if (response.status == 0) {
            return new NoConnectionError(request.url);
        }
        return new ServerError({
            request: request,
            response: response,
            code: ServerErrorCode.E001,
            message: getText("error.sina.generalServerError", [
                request.url,
                "" + response.status,
                response.statusText,
                response.data,
            ]),
        });
    };
}
