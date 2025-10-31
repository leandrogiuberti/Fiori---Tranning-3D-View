/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ResultSet } from "../sina/ResultSet";
import { getText } from "../sina/i18n";
import { RequestProperties, ResponseProperties } from "./ajax";

// =========================================================================
// Base Exception Class
// =========================================================================
export interface SinaErrorProperties {
    message: string;
    details?: string;
    solution?: string;
    context?: Record<string, unknown>;
    name: string;
    previous?: Error;
}

export abstract class SinaError extends Error {
    message: string;
    details?: string;
    solution?: string;
    context?: Record<string, unknown>;
    //stack: string; // remove stack here because it is base class defined
    name: string;
    previous: Error;

    constructor(properties: SinaErrorProperties) {
        super(properties.message);
        this.message = properties.message;
        this.details = properties?.details;
        this.solution = properties.solution;
        this.context = properties?.context;
        this.name = properties.name ?? "SinaError";
        this.previous = properties.previous;
    }

    toString(): string {
        return this.name + ": " + this.message;
    }
}

// =========================================================================
// List of all Sina Exceptions
// =========================================================================

export class InternalSinaError extends SinaError {
    constructor(props: { message?: string; details?: string; previous?: Error }) {
        const properties: SinaErrorProperties = {
            name: "InternalSinaError",
            message: props.message ?? getText("error.sina.InternalSinaError"),
            details: props.details,
            previous: props.previous,
        };
        super(properties);
    }
}

// provider independent error codes
export enum ServerErrorCode {
    E001 = "E001", // error
    E100 = "E100", // The search result is incomplete because some search connectors are temporary not available.
    E101 = "E101", // The metadata response is incomplete because some search connectors are temporary not available.
    E102 = "E102", // All search connectors are temporarily not available
    E200 = "E200", // The search term is too long in order to be processed.
    E201 = "E201", // The search term contains too many tokens in order to be processed.
    E202 = "E202", // Regular expression is too complex (input query is too complex and should be simplified).
    E203 = "E203", // Search query contains only characters that are defined as separators. Please adjust the search query.
    E300 = "E300", // The search request is invalid because the request does match to the metadata of the search connector.
    E400 = "E400", // Duplicate search result list items
    E500 = "E500", // AI/nlq service is not available
}

export interface DataSourceError {
    dataSource: string;
    code: ServerErrorCode;
    message: string;
    details?: string;
}

interface ServerErrorProperties {
    request: RequestProperties;
    response: ResponseProperties;
    code: ServerErrorCode;
    message: string;
    details?: string;
    dataSourceErrors?: Array<DataSourceError>;
    previous?: Error;
}

export class ServerError extends SinaError {
    code: ServerErrorCode;
    dataSourceErrors: Array<DataSourceError>;
    request: RequestProperties;
    response: ResponseProperties;
    resultSet?: ResultSet;
    constructor(properties: ServerErrorProperties) {
        super({
            name: "ServerError",
            message: properties.message,
            details: properties.details,
            previous: properties.previous,
        });
        this.code = properties.code;
        this.dataSourceErrors = properties.dataSourceErrors;
        this.request = properties.request;
        this.response = properties.response;
    }
}

export class NoConnectionError extends SinaError {
    constructor(url: string) {
        super({
            name: "NoConnectionError",
            message: getText("error.sina.NoConnectionError", [url]),
        });
    }
}

export class LanguageHeaderError extends SinaError {
    constructor(props: { message?: string; details?: string; previous?: Error }) {
        super({
            name: "LanguageHeaderError",
            message: props.message || getText("errr.sina.LanguageHeaderError"),
            details: props.details,
            previous: props.previous,
        });
    }
}

export class NoJSONDateError extends SinaError {
    constructor(message?: string) {
        const properties: SinaErrorProperties = {
            name: "NoJSONDateError",
            message: message ?? getText("error.sina.NoJSONDateError"),
        };
        super(properties);
    }
}

export class TimeOutError extends SinaError {
    constructor(message?: string) {
        const properties: SinaErrorProperties = {
            name: "TimeOutError",
            message: message ?? getText("error.sina.TimeOutError"),
        };
        super(properties);
    }
}

export class NotImplementedError extends SinaError {
    constructor() {
        super({ message: "Not implemented", name: "ESHNotImplementedError" });
    }
}

export class ForcedBySearchTermTestError extends SinaError {
    public static readonly forcedBySearchTerm = "EshForceErrorSearchterm";
    constructor() {
        const properties: SinaErrorProperties = {
            name: "ForcedBySearchTermTestError",
            message: `Forced error, triggered by search term '${ForcedBySearchTermTestError.forcedBySearchTerm}'.`,
        };
        super(properties);
    }
}

export class UnknownAttributeTypeError extends SinaError {
    constructor(attributeType: string, previous?: Error) {
        const properties: SinaErrorProperties = {
            name: "UnknownAttributeTypeError",
            message: getText("error.sina.UnknownAttributeTypeError", [attributeType]),
            previous,
        };
        super(properties);
    }
}

export class JSONParseError extends SinaError {
    constructor(message?: string, previous?: Error) {
        const properties: SinaErrorProperties = {
            name: "JSONParseError",
            message: message ?? getText("error.sina.JSONParseError"),
            previous,
        };
        super(properties);
    }
}

export class MetadataParserError extends SinaError {
    constructor(message?: string, previous?: Error) {
        const properties: SinaErrorProperties = {
            name: "MetadataParserError",
            message: message ?? getText("error.sina.MetadataParserError"),
            previous,
        };
        super(properties);
    }
}

export class UnknownComparisonOperatorError extends SinaError {
    constructor(operator: string) {
        const properties: SinaErrorProperties = {
            name: "UnknownComparisonOperatorError",
            message: getText("error.sina.UnknownComparisonOperatorError", [operator]),
        };
        super(properties);
    }
}

export class UnknownLogicalOperatorError extends SinaError {
    constructor(operator: string) {
        const properties: SinaErrorProperties = {
            name: "UnknownLogicalOperatorError",
            message: getText("error.sina.UnknownLogicalOperatorError", [operator]),
        };
        super(properties);
    }
}

export class UnknownPresentationUsageError extends SinaError {
    constructor(presentationUsage: string) {
        const properties: SinaErrorProperties = {
            name: "UnknownPresentationUsageError",
            message: getText("error.sina.UnknownPresentationUsageError", [presentationUsage]),
        };
        super(properties);
    }
}

export class UnknownDataTypeError extends SinaError {
    constructor(dataType: string) {
        const properties: SinaErrorProperties = {
            name: "UnknownDataTypeError",
            message: getText("error.sina.UnknownDataTypeError", [dataType]),
        };
        super(properties);
    }
}

export class UnknownConditionTypeError extends SinaError {
    constructor(conditionType: string) {
        const properties: SinaErrorProperties = {
            name: "UnknownConditionTypeError",
            message: getText("error.sina.UnknownConditionTypeError", [conditionType]),
        };
        super(properties);
    }
}

export class OnlyComplexConditionAllowedError extends SinaError {
    constructor() {
        const properties: SinaErrorProperties = {
            name: "OnlyComplexConditionAllowedError",
            message: getText("error.sina.OnlyComplexConditionAllowedError"),
        };
        super(properties);
    }
}

export class ResponseFormatError extends SinaError {
    constructor(previous: Error, expectedResponseDataFormat: "JSON" | "XML", responseData: string) {
        let detectedformat = "undetected";
        if (responseData?.startsWith("<html") || responseData?.startsWith("<HTML")) {
            detectedformat = "HTML";
        } else if (responseData?.startsWith("<?xml") || responseData?.startsWith("<?XML")) {
            detectedformat = "XML";
        }
        const properties: SinaErrorProperties = {
            name: "ResponseFormatError",
            message: getText("error.sina.ResponseFormatError", [
                expectedResponseDataFormat,
                detectedformat,
                responseData.substring(0, 25),
            ]),
            previous: previous,
        };
        super(properties);
    }
}

export class ESHNotActiveError extends SinaError {
    constructor(message?: string) {
        const properties: SinaErrorProperties = {
            name: "ESHNotActiveError",
            message: message ?? getText("error.sina.ESHNotActiveError"),
        };
        super(properties);
    }
}

export class ESHNoBusinessObjectDatasourceError extends SinaError {
    constructor(message?: string) {
        const properties: SinaErrorProperties = {
            name: "ESHNoBusinessObjectDatasourceError",
            message: message ?? getText("error.sina.ESHNoBusinessObjectDatasourceError"),
        };
        super(properties);
    }
}

export class FacetsParseError extends SinaError {
    constructor(message?: string) {
        const properties: SinaErrorProperties = {
            name: "FacetsParseError",
            message: message ?? getText("error.sina.FacetsParseError"),
        };
        super(properties);
    }
}

export class WhyFoundAttributeMetadataMissingError extends SinaError {
    constructor(attributeId: string) {
        const properties: SinaErrorProperties = {
            name: "WhyFoundAttributeMetadataMissingError",
            message: getText("error.sina.WhyFoundAttributeMetadataMissingError", [attributeId]),
        };
        super(properties);
    }
}

export class TimeConversionError extends SinaError {
    constructor(value: string) {
        const properties: SinaErrorProperties = {
            name: "TimeConversionError",
            message: getText("error.sina.TimeConversionError", [value]),
        };
        super(properties);
    }
}

export class DateConversionError extends SinaError {
    constructor(value: string) {
        const properties: SinaErrorProperties = {
            name: "DateConversionError",
            message: getText("error.sina.DateConversionError", [value]),
        };
        super(properties);
    }
}

export class CanOnlyAutoInsertComplexConditionError extends SinaError {
    constructor() {
        const properties: SinaErrorProperties = {
            name: "CanOnlyAutoInsertComplexConditionError",
            message: getText("error.sina.CanOnlyAutoInsertComplexConditionError"),
        };
        super(properties);
    }
}
export class CanNotCreateAlreadyExistingDataSourceError extends SinaError {
    constructor(dataSourceId: string) {
        const properties: SinaErrorProperties = {
            name: "CanNotCreateAlreadyExistingDataSourceError",
            message: getText("error.sina.CanNotCreateAlreadyExistingDataSourceError", [dataSourceId]),
        };
        super(properties);
    }
}

export class DataSourceInURLDoesNotExistError extends SinaError {
    constructor(dataSourceId: string) {
        const properties: SinaErrorProperties = {
            name: "DataSourceInURLDoesNotExistError",
            message: getText("error.sina.DataSourceInURLDoesNotExistError", [dataSourceId]),
        };
        super(properties);
    }
}

export class DataSourceAttributeMetadataNotFoundError extends SinaError {
    constructor(attributeId: string, dataSourceId: string) {
        const properties: SinaErrorProperties = {
            name: "DataSourceAttributeMetadataNotFoundError",
            message: getText("error.sina.DataSourceAttributeMetadataNotFoundError.message", [
                attributeId,
                dataSourceId,
            ]),
            solution: getText("error.sina.DataSourceAttributeMetadataNotFoundError.solution"),
        };
        super(properties);
    }
}

export class NoValidEnterpriseSearchAPIConfigurationFoundError extends SinaError {
    constructor(providersTried: string, err?: Error) {
        const originalMessage = err?.message ?? "";
        const properties: SinaErrorProperties = {
            name: "NoValidEnterpriseSearchAPIConfigurationFoundError",
            message: getText("error.sina.NoValidEnterpriseSearchAPIConfigurationFoundError.error", [
                providersTried,
                originalMessage,
            ]),
            solution: getText("error.sina.NoValidEnterpriseSearchAPIConfigurationFoundError.solution"),
        };
        if (err) {
            properties.previous = err;
        }
        super(properties);
    }
}

export class SinaConfigurationError extends SinaError {
    constructor(functionName: string, err: Error) {
        const properties: SinaErrorProperties = {
            name: "SinaConfigurationError",
            message: getText("error.sina.SinaConfigurationError", [functionName]),
            previous: err,
        };
        super(properties);
    }
}

export class QueryIsReadOnlyError extends SinaError {
    constructor() {
        const properties: SinaErrorProperties = {
            name: "QueryIsReadOnlyError",
            message: getText("error.sina.QueryIsReadOnlyError"),
        };
        super(properties);
    }
}

export class InBetweenConditionInConsistent extends SinaError {
    constructor(message?: string) {
        const properties: SinaErrorProperties = {
            name: "InBetweenConditionInConsistent",
            message: message ?? getText("error.sina.InBetweenConditionInConsistent.message"),
            solution: getText("error.sina.InBetweenConditionInConsistent.solution"),
        };
        super(properties);
    }
}
