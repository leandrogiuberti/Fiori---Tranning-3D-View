/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { RequestProperties, ResponseProperties } from "../../core/ajax";
import { ServerErrorCode, SinaError, ServerError, DataSourceError } from "../../core/errors";
import { getText } from "../../sina/i18n";

function parseCode(code: string): ServerErrorCode {
    if (["E100", "E101", "E102", "E200", "E201", "E202", "E203", "E300", "E400"].includes(code)) {
        return code as ServerErrorCode; // these hana odata error codes are identical to the sina error codes
    }
    return ServerErrorCode.E001; // unknown error code -> convert to general error
}

function parseDetails(message: string, details: Array<{ code: string; message: string }>): string {
    if (!details) {
        return; // return undefined
    }
    if (!details || !Array.isArray(details)) {
        return JSON.stringify(details);
    }
    const result = [];
    for (const detail of details) {
        if (detail.message === message) {
            continue;
        }
        result.push(detail.code + ":" + detail.message);
    }
    if (result.length === 0) {
        return undefined;
    }
    return result.join("\n");
}

function parseGlobalError(parsedError): DataSourceError {
    // check for error
    if (!parsedError.error) {
        return;
    }
    const error = parsedError.error;
    return {
        dataSource: "dummy",
        code: parseCode(error.code),
        message: error.message,
        details: parseDetails(error.message, error.details),
    };
}

function parseDataSourceErrors(parsedError): Array<DataSourceError> {
    const searchStatistics = parsedError["@com.sap.vocabularies.Search.v1.SearchStatistics"];
    if (!searchStatistics) {
        return [];
    }
    const connectorStatistics = searchStatistics.ConnectorStatistics;
    if (!connectorStatistics) {
        return [];
    }
    if (!Array.isArray(connectorStatistics)) {
        return [];
    }
    const dataSourceErrors: Array<DataSourceError> = [];
    for (const connectorStatistic of connectorStatistics) {
        if (!connectorStatistic.error) {
            continue;
        }
        const error = connectorStatistic.error;
        dataSourceErrors.push({
            dataSource: connectorStatistic.Name,
            code: parseCode(error.code),
            message: error.message,
            details: parseDetails(error.message, error.details),
        });
    }
    return dataSourceErrors;
}

function calculateErrorCode(codes: Array<ServerErrorCode>): ServerErrorCode {
    let resultCode: ServerErrorCode;
    for (const code of codes) {
        if (!resultCode) {
            resultCode = code;
        }
        if (code !== resultCode) {
            return ServerErrorCode.E001; // fallback to general error
        }
    }
    if (!resultCode) {
        resultCode = ServerErrorCode.E001;
    }
    return resultCode;
}

export function ajaxErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError {
    // check for json
    const parsedError = response.dataJSON;
    if (!parsedError) {
        return;
    }

    const globalError = parseGlobalError(parsedError);
    const dataSourceErrors = parseDataSourceErrors(parsedError);

    if (globalError) {
        return new ServerError({
            request: request,
            response: response,
            code: calculateErrorCode([
                globalError.code,
                ...dataSourceErrors.map((dataSourceError) => dataSourceError.code),
            ]),
            message: globalError.message,
            details: globalError.details,
            dataSourceErrors: dataSourceErrors,
        });
    } else {
        let dataSourceLabels;
        switch (dataSourceErrors.length) {
            case 0:
                // no error at all -> return
                return;
            case 1:
                // main error message is taken from error message on datasource level
                return new ServerError({
                    request: request,
                    response: response,
                    code: dataSourceErrors[0].code,
                    message: dataSourceErrors[0].message,
                    details: dataSourceErrors[0].details,
                    dataSourceErrors: dataSourceErrors,
                });
            default:
                // main error message: just list affected datasources
                dataSourceLabels = dataSourceErrors.map((de) => de.dataSource).join(", ");
                return new ServerError({
                    request: request,
                    response: response,
                    code: calculateErrorCode(dataSourceErrors.map((dataSourceError) => dataSourceError.code)),
                    message: getText("error.sina.errorInMultipleDataSources", [dataSourceLabels]),
                    dataSourceErrors: dataSourceErrors,
                });
        }
    }
}
