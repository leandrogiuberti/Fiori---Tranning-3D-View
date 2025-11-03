declare module "sap/esh/search/ui/error/errors" {
    export interface ESHUIErrorOptions {
        name: string;
        message: string;
        details?: string;
        previous?: Error & {
            previous?: Error;
        };
        solution?: string;
    }
    export class ESHUIError extends Error {
        name: string;
        message: string;
        details?: string;
        previous?: ESHUIError;
        solution?: string;
        constructor(propertiesOrMessage: string | ESHUIErrorOptions);
    }
    export class ESHUIConstructionError extends ESHUIError {
        constructor(previousError: Error);
    }
    export class ConfigurationExitError extends ESHUIError {
        constructor(customerExitName: string, applicationComponent: string, previousError?: Error);
    }
    export class UnknownDataSourceType extends ESHUIError {
        constructor(previousError: Error);
    }
    export class UnknownFacetType extends ESHUIError {
        constructor(previousError: Error);
    }
    export class ProgramError extends ESHUIError {
        constructor(previousError: Error, message?: string);
    }
    export class AppSearchError extends ESHUIError {
        constructor(previousError: Error, message?: string);
    }
    export class AppSearchSearchTermExceedsLimitsError extends ESHUIError {
        constructor(searchTermLimit: number);
    }
    export class RequestTooLargeError extends ESHUIError {
        constructor(previousError: Error, message?: string);
    }
    export class UrlParseError extends ESHUIError {
        constructor(previousError: Error, message?: string);
    }
    export class SearchTermExceedsLimitsError extends ESHUIError {
        constructor(searchTermLimit: number);
    }
    export class TCodeNotFoundError extends ESHUIError {
        constructor(previousError: Error, message?: string);
    }
    export class TCodeUnknownError extends ESHUIError {
        constructor(previousError: Error, message?: string);
    }
    const module: {
        ESHUIConstructionError: typeof ESHUIConstructionError;
        ConfigurationExitError: typeof ConfigurationExitError;
        UnknownDataSourceType: typeof UnknownDataSourceType;
        UnknownFacetType: typeof UnknownFacetType;
        ProgramError: typeof ProgramError;
    };
    export default module;
}
//# sourceMappingURL=errors.d.ts.map