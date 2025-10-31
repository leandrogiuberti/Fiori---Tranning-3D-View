/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { RequestProperties, ResponseProperties } from "../../core/ajax";
import { ServerErrorCode, SinaError, ServerError } from "../../core/errors";
import { getText } from "../../sina/i18n";

export function deprecatedAjaxErrorFactory(
    request: RequestProperties,
    response: ResponseProperties
): SinaError {
    //
    // check for response data and http status
    if (response.status !== 500 || !response.data) {
        return;
    }

    // check for json
    const parsedError: any = response.dataJSON;
    if (!parsedError) {
        return;
    }

    // check for error
    if (typeof parsedError !== "object") {
        return;
    }
    if (!parsedError.code && !parsedError.message && !parsedError.details) {
        return;
    }

    // parse messages
    const messages = [];
    messages.push(getText("error.sina.searchServiceCallFailed"));
    if (parsedError?.code) {
        messages.push(getText("error.sina.errorCode", [parsedError.code]));
    }
    if (parsedError?.message) {
        messages.push(getText("error.sina.errorMessage", [parsedError.message]));
    }

    // create error
    return new ServerError({
        request: request,
        response: response,
        code: ServerErrorCode.E001,
        message: messages.join("\n"),
        details: "" + parsedError.details,
    });
}
