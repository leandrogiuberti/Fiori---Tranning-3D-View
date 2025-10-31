declare module "sap/esh/search/ui/sinaNexTS/core/AjaxBaseClient" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Log } from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { AjaxErrorFactory, AjaxErrorFormatter, JSONResponseProperties, JSONValue, RequestFormatter, RequestProperties, ResponseFormatter, ResponseProperties } from "./ajax";
    interface AjaxBaseClientProperties {
        csrf?: boolean;
        csrfByPassCache?: boolean;
        csrfFetchRequest?: RequestProperties;
        getLanguage?: () => string;
        authorization?: {
            user: string;
            password: string;
        };
        requestFormatters?: Array<RequestFormatter>;
        responseFormatters?: Array<ResponseFormatter>;
        defaultParameters?: Record<string, string>;
        errorFactories?: Array<AjaxErrorFactory>;
        errorFormatters?: Array<AjaxErrorFormatter>;
    }
    class AjaxBaseClient {
        handleCookies: boolean;
        cookieStore: Record<string, string>;
        csrf: boolean;
        csrfByPassCache: boolean;
        csrfToken: string;
        csrfFetchRequest: RequestProperties;
        csrfFetchRequestPromise: Promise<ResponseProperties>;
        getLanguage?: () => string;
        authorization?: {
            user: string;
            password: string;
        };
        requestFormatters: Array<RequestFormatter>;
        responseFormatters: Array<ResponseFormatter>;
        defaultParameters: Record<string, string>;
        errorFactories: Array<AjaxErrorFactory>;
        errorFormatters: Array<AjaxErrorFormatter>;
        log: Log;
        constructor(properties: AjaxBaseClientProperties);
        private getJsonHeaders;
        private getXmlHeaders;
        private addDefaultHeaders;
        private addLanguageToHeader;
        getJson(url: string): Promise<JSONResponseProperties>;
        postJson(url: string, data: JSONValue): Promise<JSONResponseProperties>;
        mergeJson(url: string, data: JSONValue): Promise<JSONResponseProperties>;
        getXML(url: any): Promise<string>;
        private fetchCsrf;
        private requestWithCsrf;
        createUrlMatchingResponseFormatter(url: string, formatter: ResponseFormatter): {
            delete: () => void;
        };
        addResponseFormatter(formatter: ResponseFormatter): void;
        removeResponseFormatter(formatter: ResponseFormatter): void;
        removeAllResponseFormatters(): void;
        private applyRequestFormatters;
        private applyResponseFormatters;
        private setBasicAuth;
        request(requestProperties: RequestProperties): Promise<ResponseProperties>;
        requestInternal(properties: RequestProperties): Promise<ResponseProperties>;
        private saveCookies;
        private pasteCookies;
        private addDefaultParameters;
        private applyErrorFormatters;
        private checkForErrors;
        private requestPlain;
    }
}
//# sourceMappingURL=AjaxBaseClient.d.ts.map