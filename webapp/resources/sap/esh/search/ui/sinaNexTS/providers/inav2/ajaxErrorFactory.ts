/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { RequestProperties, ResponseProperties } from "../../core/ajax";
import { ServerErrorCode, SinaError, ServerError } from "../../core/errors";
import { getText } from "../../sina/i18n";

export function ajaxErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError {
    //
    // check for response data
    if (!response?.data) {
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
    if (!parsedError?.Error?.Code || !parsedError?.Error?.Message) {
        return;
    }

    // parse error details
    const detailMessages = [];
    if (parsedError?.ErrorDetails) {
        for (let i = 0; i < parsedError.ErrorDetails.length; ++i) {
            const errorDetail = parsedError.ErrorDetails[i];
            detailMessages.push(errorDetail.Code + ": " + errorDetail.Message);
        }
    }

    // parse additional messages
    if (parsedError?.Messages) {
        for (let j = 0; j < parsedError.Messages.length; ++j) {
            const errorMessage = parsedError.Messages[j];
            detailMessages.push(
                errorMessage.Number + ": " + errorMessage.Text + " (" + errorMessage.Type + ")"
            );
        }
    }

    // create error
    return new ServerError({
        request: request,
        response: response,
        code: ServerErrorCode.E001,
        message: getText("error.sina.serverError", [parsedError.Error.Code, parsedError.Error.Message]),
        details: detailMessages.join("\n"),
    });
}
