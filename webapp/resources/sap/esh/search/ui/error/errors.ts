/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";

export interface ESHUIErrorOptions {
    name: string;
    message: string;
    details?: string;
    previous?: Error & { previous?: Error };
    solution?: string;
}

export class ESHUIError extends Error {
    name: string;
    message: string;
    details?: string;
    previous?: ESHUIError;
    solution?: string;

    constructor(propertiesOrMessage: string | ESHUIErrorOptions) {
        if (typeof propertiesOrMessage === "string") {
            propertiesOrMessage = {
                message: propertiesOrMessage,
            } as ESHUIErrorOptions;
        }
        super(propertiesOrMessage.message);
        if (propertiesOrMessage.message) {
            this.message = propertiesOrMessage.message;
        }
        if (propertiesOrMessage.details) {
            this.details = propertiesOrMessage.details;
        }
        if (propertiesOrMessage.previous) {
            this.previous = propertiesOrMessage.previous;
        }
        this.name = propertiesOrMessage.name || "ESHUIError";
        this.solution = propertiesOrMessage.solution;
    }
}

export class ESHUIConstructionError extends ESHUIError {
    constructor(previousError: Error) {
        const name = "ESHUIConstructionError";
        const message = i18n.getText("error.ESHUIConstructionError.message");
        super({
            name,
            message,
            previous: previousError,
        });
    }
}

export class ConfigurationExitError extends ESHUIError {
    constructor(customerExitName: string, applicationComponent: string, previousError?: Error) {
        const name = i18n.getText("error.ConfigurationExitError.title");
        const message = i18n.getText("error.ConfigurationExitError.message", [customerExitName]);
        const solution = i18n.getText("error.ConfigurationExitError.solution", [applicationComponent]);
        super({
            name,
            message,
            solution,
            previous: previousError,
        });
    }
}

export class UnknownDataSourceType extends ESHUIError {
    constructor(previousError: Error) {
        const name = "UnknownDataSourceType";
        const message = i18n.getText("error.UnknownDataSourceType.message");
        const solution = i18n.getText("error.UnknownDataSourceType.solution");
        super({
            name,
            message,
            solution,
            previous: previousError,
        });
    }
}

export class UnknownFacetType extends ESHUIError {
    constructor(previousError: Error) {
        const name = "UnknownFacetType";
        const message = i18n.getText("error.UnknownFacetType.message");
        const solution = i18n.getText("error.UnknownFacetType.solution");
        super({
            name,
            message,
            solution,
            previous: previousError,
        });
    }
}

export class ProgramError extends ESHUIError {
    constructor(previousError: Error, message?: string) {
        const name = "ProgramError";
        const solution = i18n.getText("error.TypeError.solution");
        super({
            name,
            message: message || i18n.getText("error.TypeError.message"),
            solution,
            previous: previousError,
        });
    }
}

export class AppSearchError extends ESHUIError {
    constructor(previousError: Error, message?: string) {
        const name = "AppSearchError";
        const solution = i18n.getText("error.AppSearchError.solution");
        super({
            name,
            message: message || i18n.getText("error.AppSearchError.message"),
            solution,
            previous: previousError,
        });
    }
}

export class AppSearchSearchTermExceedsLimitsError extends ESHUIError {
    constructor(searchTermLimit: number) {
        const name = "AppSearchSearchTermExceedsLimitsError";
        super({
            name,
            message: i18n.getText("error.AppSearchSearchTermExceedsLimitsError.message", [searchTermLimit]),
        });
    }
}

export class RequestTooLargeError extends ESHUIError {
    constructor(previousError: Error, message?: string) {
        const name = "RequestTooLargeError";
        const solution = i18n.getText("error.RequestTooLargeError.solution");
        super({
            name,
            message: message || i18n.getText("error.RequestTooLargeError.message"),
            solution,
            previous: previousError,
        });
    }
}

export class UrlParseError extends ESHUIError {
    constructor(previousError: Error, message?: string) {
        super({
            name: "UrlParseError",
            message: message || i18n.getText("error.UrlParseError.message"),
            solution: i18n.getText("error.UrlParseError.solution"),
            previous: previousError,
        });
    }
}

export class SearchTermExceedsLimitsError extends ESHUIError {
    constructor(searchTermLimit: number) {
        super({
            name: "SearchTermExceedsLimitError",
            message: i18n.getText("error.SearchTermExceedsLimitError.message", [searchTermLimit]),
        });
    }
}

export class TCodeNotFoundError extends ESHUIError {
    constructor(previousError: Error, message?: string) {
        super({
            name: "TCodeNotFoundError",
            message: message || i18n.getText("error.TCodeNotFoundError.message"),
            solution: i18n.getText("error.TCodeNotFoundError.solution"),
            previous: previousError,
        });
    }
}

export class TCodeUnknownError extends ESHUIError {
    constructor(previousError: Error, message?: string) {
        super({
            name: "TCodeUnknownError",
            message: message || i18n.getText("error.TCodeUnknownError.message"),
            solution: i18n.getText("error.TCodeUnknownError.solution"),
            previous: previousError,
        });
    }
}

const module = {
    ESHUIConstructionError,
    ConfigurationExitError,
    UnknownDataSourceType,
    UnknownFacetType,
    ProgramError,
};

export default module;
