declare module "sap/cux/home/utils/BatchHelper" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import BaseObject from "sap/ui/base/Object";
    enum methods {
        GET = "GET",
        POST = "POST",
        PUT = "PUT",
        PATCH = "PATCH",
        DELETE = "DELETE",
        HEAD = "HEAD"
    }
    interface Options {
        headers: Record<string, string>;
        method: methods;
        body?: string;
    }
    const isEncoded: (url: string) => boolean;
    /**
     * Represents a multipart request.
     */
    class MultiPartRequest {
        private url;
        private batchRequests;
        private boundary;
        options: Options;
        payload?: unknown;
        /**
         * Creates a MultiPartRequest object.
         *
         * @param {string} url - The URL for the multipart request.
         * @constructor
         */
        constructor(url: string, requestMethod: methods, csrfToken?: string);
        /**
         * Constructs the body for the multipart request.
         *
         * @returns {string} - The constructed body.
         * @private
         */
        _constructBody(): string;
        /**
         * Adds a request to the MultiPartRequest batch.
         *
         * @public
         * @param {Object} request - The request to add to the batch.
         */
        addRequest(request: MultiPartRequest): void;
        /**
         * Constructs the body for the multipart request with payload
         *
         * @returns {string} - The constructed body.
         * @private
         */
        constructBodyWithPayload(): string;
    }
    /**
     * Parses multipart body response and returns an array of values called in the batch request.
     *
     * @param {string} value - Multipart body response.
     * @returns {Object[]} - Array of values in the multipart request.
     * @returns {Object[]} - An array of values in the multipart request.
     */
    const getDataFromRawValue: (value: string) => (string | object)[];
    /**
     * Fetches the CSRF token from the specified base URL.
     *
     * @async
     * @param {string} baseURL - The base URL to fetch the CSRF token from.
     * @returns {Promise<string>} A Promise that resolves when all batch requests are completed. A promise that resolves to the CSRF token.
     * @throws {Error} An error if the CSRF token cannot be fetched.
     */
    const fetchCSRFToken: (baseURL: string) => Promise<string>;
    /**
     *
     * Helper class for managing batch requests.
     *
     * @extends BaseObject
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     * @private
     *
     * @alias sap.cux.home.utils.BatchHelper
     */
    export default class BatchHelper extends BaseObject {
        private url;
        /**
         * Fetches data from a multipart request.
         *
         * @private
         * @param {MultiPartRequest} multiPartRequest - The multipart request object.
         * @returns {Promise<Array<string | object>>} - A promise that resolves to the data from the request.
         */
        private fetchData;
        /**
         * Creates a multipart batch request with multiple URLs.
         *
         * @public
         * @param {string} baseURL - The base URL for creating the batch request.
         * @param {string[]} urls - An array of URLs for individual requests.
         * @returns {Promise<Array<string | object>>} - A promise that resolves to the data from the batch request.
         */
        createMultipartRequest(baseURL: string, urls: string[]): Promise<Array<string | object>>;
        /**
         * Creates a multipart batch request with given payloads and sends it to the specified base URL.
         *
         * @public
         * @param {string} baseURL - The base URL for creating the batch request.
         * @param payloads - An array of objects containing the URL and data for each part of the multipart request.
         * @param requestMethod - The HTTP method to be used for the request (e.g., POST).
         * @returns {Promise<Array<string | object>>} A promise that resolves to the data from the batch request.
         */
        createMultipartRequestWithPayload(baseURL: string, payloads: {
            url: string;
            data: unknown;
        }[], requestMethod: methods): Promise<Array<string | object>>;
        /**
         * Builds a multipart request from an array of URLs.
         *
         * @private
         * @param {string[]} urls - An array of URLs for individual requests.
         * @returns {MultiPartRequest} - The multipart request object.
         */
        private buildMultipartRequest;
        /**
         * Builds a multipart request with the given payloads, CSRF token, and request method.
         *
         * @param payloads - An array of objects containing the URL and data for each part of the request.
         * @param csrfToken - The CSRF token to be included in the request headers.
         * @param requestMethod - The HTTP method to be used for the request.
         * @returns {MultiPartRequest} A `MultiPartRequest` object containing the constructed multipart request.
         */
        private buildMultipartRequestWithPayload;
    }
}
//# sourceMappingURL=BatchHelper.d.ts.map