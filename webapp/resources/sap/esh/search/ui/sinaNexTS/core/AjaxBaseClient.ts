/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/* global Buffer */
import { Log } from "./Log";
import {
    AjaxErrorFactory,
    AjaxErrorFormatter,
    JSONResponseProperties,
    JSONValue,
    RequestFormatter,
    RequestProperties,
    ResponseFormatter,
    ResponseProperties,
    applyResponseFormattersAndUpdateJSON,
    request,
} from "./ajax";
import { addEncodedUrlParameters } from "./ajaxUtil";
import { isBrowserEnv } from "./core";
import { createDefaultAjaxErrorFactory } from "./defaultAjaxErrorFactory";
import { SinaError, ResponseFormatError, LanguageHeaderError } from "./errors";

export interface AjaxBaseClientProperties {
    csrf?: boolean;
    csrfByPassCache?: boolean;
    csrfFetchRequest?: RequestProperties;
    getLanguage?: () => string;
    authorization?: { user: string; password: string };
    requestFormatters?: Array<RequestFormatter>;
    responseFormatters?: Array<ResponseFormatter>;
    defaultParameters?: Record<string, string>;
    errorFactories?: Array<AjaxErrorFactory>;
    errorFormatters?: Array<AjaxErrorFormatter>;
}

export class AjaxBaseClient {
    handleCookies: boolean;
    cookieStore: Record<string, string> = {};
    csrf: boolean;
    csrfByPassCache: boolean;
    csrfToken: string;
    csrfFetchRequest: RequestProperties;
    csrfFetchRequestPromise: Promise<ResponseProperties>;
    getLanguage?: () => string;
    authorization?: { user: string; password: string };
    requestFormatters: Array<RequestFormatter> = [];
    responseFormatters: Array<ResponseFormatter> = [];
    defaultParameters: Record<string, string> = {};
    errorFactories: Array<AjaxErrorFactory> = [];
    errorFormatters: Array<AjaxErrorFormatter> = [];

    log: Log;

    constructor(properties: AjaxBaseClientProperties) {
        this.csrf = properties.csrf;
        this.csrfByPassCache = properties.csrfByPassCache || false;
        this.csrfToken = null;
        this.csrfFetchRequest = properties.csrfFetchRequest || null;
        this.getLanguage = properties?.getLanguage;
        this.authorization = undefined;
        if (properties.authorization) {
            this.authorization = {
                user: properties.authorization.user,
                password: properties.authorization.password,
            };
        }
        this.requestFormatters = properties.requestFormatters ?? [];
        this.responseFormatters = properties.responseFormatters ?? [];
        this.defaultParameters = properties.defaultParameters ?? {};
        this.errorFactories = properties.errorFactories ?? [createDefaultAjaxErrorFactory()];
        this.errorFormatters = properties.errorFormatters || [];
        // for node env   : cookies are handled by ajax base client
        // for browser env: cookies are handled by browser
        this.handleCookies = !isBrowserEnv();
        this.log = new Log("ajax base client");
    }

    private getJsonHeaders(): Record<string, string> {
        const header = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        this.addLanguageToHeader(header);
        this.addDefaultHeaders(header);
        return header;
    }

    private getXmlHeaders(): Record<string, string> {
        const header = {
            "Content-Type": "application/xml",
            Accept: "application/xml",
        };
        this.addLanguageToHeader(header);
        this.addDefaultHeaders(header);
        return header;
    }

    private addDefaultHeaders(header: Record<string, string>): void {
        header["Cache-Control"] = "no-cache";
    }

    private addLanguageToHeader(header: Record<string, string>): void {
        if (typeof this.getLanguage === "function") {
            try {
                header["Accept-Language"] = this.getLanguage();
            } catch (error) {
                throw new LanguageHeaderError({
                    previous: error,
                });
            }
        }
    }

    public async getJson(url: string): Promise<JSONResponseProperties> {
        const responseProperties = await this.request({
            headers: this.getJsonHeaders(),
            method: "GET",
            url: url,
        });
        try {
            responseProperties.data = JSON.parse(responseProperties.data);
        } catch (error) {
            if (error.name === "SyntaxError") {
                throw new ResponseFormatError(error, "JSON", responseProperties.data);
            } else {
                throw error;
            }
        }
        return responseProperties;
    }

    public async postJson(url: string, data: JSONValue): Promise<JSONResponseProperties> {
        const responseProperties = await this.request({
            headers: this.getJsonHeaders(),
            method: "POST",
            url: url,
            data: JSON.stringify(data),
        });
        try {
            if (responseProperties.data?.length > 0) {
                responseProperties.data = JSON.parse(responseProperties.data);
            }
        } catch (error) {
            if (error.name === "SyntaxError") {
                throw new ResponseFormatError(error, "JSON", responseProperties.data);
            } else {
                throw error;
            }
        }
        return responseProperties;
    }

    public async mergeJson(url: string, data: JSONValue): Promise<JSONResponseProperties> {
        const responseProperties = await this.request({
            headers: this.getJsonHeaders(),
            method: "MERGE",
            url: url,
            data: JSON.stringify(data),
        });
        try {
            if (responseProperties.data?.length > 0) {
                responseProperties.data = JSON.parse(responseProperties.data);
            }
        } catch (error) {
            if (error.name === "SyntaxError") {
                throw new ResponseFormatError(error, "JSON", responseProperties.data);
            } else {
                throw error;
            }
        }
        return responseProperties;
    }

    public async getXML(url): Promise<string> {
        const responseProperties = await this.request({
            headers: this.getXmlHeaders(),
            method: "GET",
            url: url,
        });
        return responseProperties.data;
    }

    private fetchCsrf(): Promise<ResponseProperties> {
        if (this.csrfFetchRequestPromise) {
            return this.csrfFetchRequestPromise;
        }
        this.csrfFetchRequest.headers = this.csrfFetchRequest.headers || {};
        this.csrfFetchRequest.headers["x-csrf-token"] = "fetch";
        this.csrfFetchRequest.parameters = this.csrfFetchRequest.parameters || {};
        if (this.csrfByPassCache) {
            this.csrfFetchRequest.parameters._ = Date.now(); // bypass cache;
        }
        this.csrfFetchRequestPromise = this.requestPlain(this.csrfFetchRequest).then(
            function (this: AjaxBaseClient, response) {
                this.csrfFetchRequestPromise = null;
                this.csrfToken = response.headers["x-csrf-token"];
                return response;
            }.bind(this)
        );
        return this.csrfFetchRequestPromise;
    }

    private async requestWithCsrf(
        properties: RequestProperties,
        renewCsrf: boolean
    ): Promise<ResponseProperties> {
        // if request is identical to csrf fetch request -> always fetch a new csrf token
        if (
            addEncodedUrlParameters(this.csrfFetchRequest.url, this.csrfFetchRequest.parameters) ===
            addEncodedUrlParameters(properties.url, properties.parameters)
        ) {
            return await this.fetchCsrf();
        }

        // no csrf -> fetch csrf
        if (renewCsrf && !this.csrfToken) {
            await this.fetchCsrf();
        }

        // do request with csrf token
        properties.headers = properties.headers || {};
        properties.headers["x-csrf-token"] = this.csrfToken;
        const response = await this.requestPlain(properties);

        // check response, csrf token maybe outdated: fetch csrf, repeat request
        const csrfHeader = response?.headers["x-csrf-token"];
        if (renewCsrf && typeof csrfHeader === "string" && csrfHeader.toLowerCase() === "required") {
            await this.fetchCsrf();
            return await this.requestWithCsrf(properties, false);
        }

        return response;
    }

    createUrlMatchingResponseFormatter(url: string, formatter: ResponseFormatter): { delete: () => void } {
        const responseFormatter = (request: RequestProperties, response: ResponseProperties) => {
            if (request.url.indexOf(url) !== 0) {
                return response;
            }
            return formatter(request, response);
        };
        this.addResponseFormatter(responseFormatter);
        return {
            delete: () => this.removeResponseFormatter(responseFormatter),
        };
    }

    addResponseFormatter(formatter: ResponseFormatter) {
        this.responseFormatters.push(formatter);
    }

    removeResponseFormatter(formatter: ResponseFormatter) {
        const index = this.responseFormatters.indexOf(formatter);
        if (index >= 0) {
            this.responseFormatters.splice(index);
        }
    }

    removeAllResponseFormatters() {
        this.responseFormatters = [];
    }

    private applyRequestFormatters(request: RequestProperties) {
        for (const requestFormatter of this.requestFormatters) {
            request = requestFormatter(request);
        }
        return request;
    }

    private applyResponseFormatters(request: RequestProperties, response: ResponseProperties) {
        return applyResponseFormattersAndUpdateJSON(request, response, this.responseFormatters);
    }

    private setBasicAuth(properties: RequestProperties) {
        properties.headers = Object.assign({}, properties.headers);
        if (this.authorization !== undefined) {
            if (typeof Buffer === "function") {
                // node.js encode
                properties.headers.Authorization =
                    "Basic " +
                    Buffer.from(this.authorization.user + ":" + this.authorization.password).toString(
                        "base64"
                    );
            } else if (window && typeof window.btoa === "function") {
                // javascript encode
                properties.headers.Authorization =
                    "Basic " + window.btoa(this.authorization.user + ":" + this.authorization.password);
            }
        }
    }

    public async request(requestProperties: RequestProperties): Promise<ResponseProperties> {
        const responseProperties = await this.requestInternal(requestProperties);
        this.checkForErrors(requestProperties, responseProperties);
        return responseProperties;
    }

    async requestInternal(properties: RequestProperties): Promise<ResponseProperties> {
        // set authorization header
        this.setBasicAuth(properties);

        // no csrf -> fire plain request
        if (!this.csrf) {
            return await this.requestPlain(properties);
        }

        // if csrf fetch request is not set -> treat first request as csrf fetch request
        if (!this.csrfFetchRequest) {
            this.csrfFetchRequest = properties;
        }

        // main request with csrf renew if neccessary
        return await this.requestWithCsrf(properties, true);
    }

    private saveCookies(properties: ResponseProperties) {
        const setCookieHeaders = properties?.headers["set-cookie"];
        if (!setCookieHeaders) {
            return;
        }
        for (const setCookieHeader of setCookieHeaders) {
            const parts = setCookieHeader.split(";");
            if (parts.length === 0) {
                continue;
            }
            const setPart = parts[0];
            const assignmentOperatorIndex = setPart.indexOf("=");
            if (assignmentOperatorIndex < 0) {
                continue;
            }
            const name = setPart.slice(0, assignmentOperatorIndex).trim();
            if (name.length === 0) {
                continue;
            }
            const value = setPart.slice(assignmentOperatorIndex + 1).trim();
            if (value.length === 0) {
                continue;
            }
            this.cookieStore[name] = value;
        }
    }

    private pasteCookies(properties: RequestProperties) {
        const cookieEntries = Object.entries(this.cookieStore);
        if (cookieEntries.length === 0) {
            return;
        }
        properties.headers = properties.headers || {};
        properties.headers["Cookie"] = cookieEntries.map(([name, value]) => `${name}=${value}`).join(";");
    }

    private addDefaultParameters(properties: RequestProperties) {
        for (const [name, value] of Object.entries(this.defaultParameters)) {
            properties.parameters = properties.parameters || {};
            if (typeof properties.parameters[name] !== "undefined") {
                continue; // do not overwrite
            }
            properties.parameters[name] = value;
        }
    }

    private applyErrorFormatters(
        requestProperties: RequestProperties,
        responseProperties: ResponseProperties,
        error: SinaError
    ): SinaError {
        for (const errorFormatter of this.errorFormatters) {
            error = errorFormatter(requestProperties, responseProperties, error);
        }
        return error;
    }

    private checkForErrors(requestProperties: RequestProperties, responseProperties: ResponseProperties) {
        for (const errorFactory of this.errorFactories) {
            let error;
            try {
                error = errorFactory(requestProperties, responseProperties);
            } catch (e) {
                this.log.error(`ajax error factory raised exception ${e}`); // log and continue with next factory
            }
            if (error) {
                error = this.applyErrorFormatters(requestProperties, responseProperties, error);
                throw error;
            }
        }
    }

    private async requestPlain(requestProperties: RequestProperties): Promise<ResponseProperties> {
        this.addDefaultParameters(requestProperties);
        if (this.handleCookies) {
            this.pasteCookies(requestProperties);
        }
        requestProperties = this.applyRequestFormatters(requestProperties);
        let responseProperties = await request(requestProperties);
        responseProperties = this.applyResponseFormatters(requestProperties, responseProperties);
        if (this.handleCookies) {
            this.saveCookies(responseProperties);
        }
        return responseProperties;
    }
}
