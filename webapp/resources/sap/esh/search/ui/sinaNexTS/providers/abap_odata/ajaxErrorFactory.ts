/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { RequestProperties, ResponseProperties } from "../../core/ajax";
import { ServerErrorCode, SinaError, ServerError, InternalSinaError } from "../../core/errors";
import { getText } from "../../sina/i18n";

export function ajaxErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError {
    const errorFactories = [ajaxNlqErrorFactory, ajaxDefaultErrorFactory];
    const errors: Array<SinaError> = [];
    for (const errorFactory of errorFactories) {
        const error = errorFactory(request, response);
        if (error) {
            errors.push(error);
        }
    }
    return mergeErrors(errors);
}

function mergeErrors(errors: SinaError[]): SinaError {
    if (errors.length === 0) {
        return;
    }
    if (errors.length === 1) {
        return errors[0];
    }
    const details = [];
    for (const error of errors) {
        if (!(error instanceof ServerError)) {
            return new InternalSinaError({
                message: "program error: error factory returned an error that is not a ServerError",
            });
        }
        details.push(error.message + "\n");
        details.push(error.details + "\n");
    }
    return new ServerError({
        request: (errors[0] as ServerError).request,
        response: (errors[0] as ServerError).response,
        code: ServerErrorCode.E001,
        message: getText("error.sina.generalServerError2"),
        details: details.join("\n"),
    });
}

// AI error factory
function ajaxNlqErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError {
    //

    // factory is only active if nlq is activated
    if (!request?.data?.includes('"ActivateNLQ":true')) {
        return;
    }

    // check for repsonse data
    if (!response.data) {
        return;
    }

    // check for json
    const responseData: any = response.dataJSON;
    if (!responseData) {
        return;
    }

    // check for execution details existence
    if (!(responseData?.d?.ExecutionDetails?.results?.length > 0)) {
        return;
    }

    // loop through execution details
    const serverMessages = [];
    for (const executionDetail of responseData.d.ExecutionDetails.results) {
        if (
            // very special check for AI not available error
            executionDetail?.DataSourceId === "0_GENERIC" &&
            executionDetail?.Failed === false &&
            executionDetail?.ErrorMessage
        ) {
            serverMessages.push(executionDetail.ErrorMessage);
        }
    }

    // generate error
    if (serverMessages.length > 0) {
        return new ServerError({
            request: request,
            response: response,
            code: ServerErrorCode.E500,
            message: getText("error.sina.nlqNotAvailableError"),
            details: serverMessages.join("\n"),
        });
    }
}

// default error factory
function ajaxDefaultErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError {
    //
    // check for repsonse data
    if (!response.data) {
        return;
    }

    // check for json
    const responseData: any = response.dataJSON;
    if (!responseData) {
        return;
    }

    // check for error
    if (typeof responseData !== "object") {
        return;
    }
    if (!responseData?.error?.code) {
        return;
    }

    // parse messages
    const messages = [];
    messages.push(getText("error.sina.generalServerError2"));
    messages.push(getText("error.sina.errorCode", [responseData.error.code]));
    if (responseData?.error?.message?.value) {
        const value = responseData.error.message.value.trim();
        messages.push(value);
    }

    // parse details
    const details = [];
    if (responseData?.error?.innererror) {
        const innererror = responseData?.error?.innererror;
        if (innererror?.application?.component_id) {
            details.push(getText("error.sina.applicationComponent", [innererror?.application?.component_id]));
        }
        if (innererror?.Error_Resolution?.SAP_Note) {
            details.push(getText("error.sina.solutionNote", [innererror?.Error_Resolution?.SAP_Note]));
        }
    }

    // create error
    return new ServerError({
        request: request,
        response: response,
        code: ServerErrorCode.E001,
        message: messages.join("\n"),
        details: details.join("\n"),
    });
}
