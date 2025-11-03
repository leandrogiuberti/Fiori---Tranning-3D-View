declare module "sap/esh/search/ui/sinaNexTS/core/errors" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { RequestProperties, ResponseProperties } from "sap/esh/search/ui/sinaNexTS/core/ajax";
    interface SinaErrorProperties {
        message: string;
        details?: string;
        solution?: string;
        context?: Record<string, unknown>;
        name: string;
        previous?: Error;
    }
    abstract class SinaError extends Error {
        message: string;
        details?: string;
        solution?: string;
        context?: Record<string, unknown>;
        name: string;
        previous: Error;
        constructor(properties: SinaErrorProperties);
        toString(): string;
    }
    class InternalSinaError extends SinaError {
        constructor(props: {
            message?: string;
            details?: string;
            previous?: Error;
        });
    }
    enum ServerErrorCode {
        E001 = "E001",// error
        E100 = "E100",// The search result is incomplete because some search connectors are temporary not available.
        E101 = "E101",// The metadata response is incomplete because some search connectors are temporary not available.
        E102 = "E102",// All search connectors are temporarily not available
        E200 = "E200",// The search term is too long in order to be processed.
        E201 = "E201",// The search term contains too many tokens in order to be processed.
        E202 = "E202",// Regular expression is too complex (input query is too complex and should be simplified).
        E203 = "E203",// Search query contains only characters that are defined as separators. Please adjust the search query.
        E300 = "E300",// The search request is invalid because the request does match to the metadata of the search connector.
        E400 = "E400",// Duplicate search result list items
        E500 = "E500"
    }
    interface DataSourceError {
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
    class ServerError extends SinaError {
        code: ServerErrorCode;
        dataSourceErrors: Array<DataSourceError>;
        request: RequestProperties;
        response: ResponseProperties;
        resultSet?: ResultSet;
        constructor(properties: ServerErrorProperties);
    }
    class NoConnectionError extends SinaError {
        constructor(url: string);
    }
    class LanguageHeaderError extends SinaError {
        constructor(props: {
            message?: string;
            details?: string;
            previous?: Error;
        });
    }
    class NoJSONDateError extends SinaError {
        constructor(message?: string);
    }
    class TimeOutError extends SinaError {
        constructor(message?: string);
    }
    class NotImplementedError extends SinaError {
        constructor();
    }
    class ForcedBySearchTermTestError extends SinaError {
        static readonly forcedBySearchTerm = "EshForceErrorSearchterm";
        constructor();
    }
    class UnknownAttributeTypeError extends SinaError {
        constructor(attributeType: string, previous?: Error);
    }
    class JSONParseError extends SinaError {
        constructor(message?: string, previous?: Error);
    }
    class MetadataParserError extends SinaError {
        constructor(message?: string, previous?: Error);
    }
    class UnknownComparisonOperatorError extends SinaError {
        constructor(operator: string);
    }
    class UnknownLogicalOperatorError extends SinaError {
        constructor(operator: string);
    }
    class UnknownPresentationUsageError extends SinaError {
        constructor(presentationUsage: string);
    }
    class UnknownDataTypeError extends SinaError {
        constructor(dataType: string);
    }
    class UnknownConditionTypeError extends SinaError {
        constructor(conditionType: string);
    }
    class OnlyComplexConditionAllowedError extends SinaError {
        constructor();
    }
    class ResponseFormatError extends SinaError {
        constructor(previous: Error, expectedResponseDataFormat: "JSON" | "XML", responseData: string);
    }
    class ESHNotActiveError extends SinaError {
        constructor(message?: string);
    }
    class ESHNoBusinessObjectDatasourceError extends SinaError {
        constructor(message?: string);
    }
    class FacetsParseError extends SinaError {
        constructor(message?: string);
    }
    class WhyFoundAttributeMetadataMissingError extends SinaError {
        constructor(attributeId: string);
    }
    class TimeConversionError extends SinaError {
        constructor(value: string);
    }
    class DateConversionError extends SinaError {
        constructor(value: string);
    }
    class CanOnlyAutoInsertComplexConditionError extends SinaError {
        constructor();
    }
    class CanNotCreateAlreadyExistingDataSourceError extends SinaError {
        constructor(dataSourceId: string);
    }
    class DataSourceInURLDoesNotExistError extends SinaError {
        constructor(dataSourceId: string);
    }
    class DataSourceAttributeMetadataNotFoundError extends SinaError {
        constructor(attributeId: string, dataSourceId: string);
    }
    class NoValidEnterpriseSearchAPIConfigurationFoundError extends SinaError {
        constructor(providersTried: string, err?: Error);
    }
    class SinaConfigurationError extends SinaError {
        constructor(functionName: string, err: Error);
    }
    class QueryIsReadOnlyError extends SinaError {
        constructor();
    }
    class InBetweenConditionInConsistent extends SinaError {
        constructor(message?: string);
    }
}
//# sourceMappingURL=errors.d.ts.map