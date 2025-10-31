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

const isEncoded = (url: string) => {
	return /%[0-9A-F]{2}/i.test(url);
};

/**
 * Represents a multipart request.
 */
class MultiPartRequest {
	private url: string;
	private batchRequests: MultiPartRequest[] = [];
	private boundary: string;
	public options: Options;
	public payload?: unknown;

	/**
	 * Creates a MultiPartRequest object.
	 *
	 * @param {string} url - The URL for the multipart request.
	 * @constructor
	 */
	constructor(url: string, requestMethod: methods, csrfToken?: string) {
		//encode the URL if it is not already encoded
		this.url = isEncoded(url) ? url : encodeURI(url);
		this.boundary = `batch_id_${Date.now()}_01`;
		this.options = {
			headers: {
				"Content-Type": `multipart/mixed;boundary=${this.boundary}`
			},
			method: requestMethod
		};

		// Add CSRF token to headers if available
		if (csrfToken) {
			this.options.headers["X-CSRF-Token"] = csrfToken;
		}
	}

	/**
	 * Constructs the body for the multipart request.
	 *
	 * @returns {string} - The constructed body.
	 * @private
	 */
	public _constructBody(): string {
		const BOUNDARY = `--${this.boundary}`;
		const REQUEST_HEADERS = `Content-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n`;
		const REQUEST_BODY = `Accept: application/json\r\n\r\n\r\n`;

		let body = `${BOUNDARY}\r\n`;

		for (let index = 0; index < this.batchRequests.length; index++) {
			const request = this.batchRequests[index];
			const boundaryEnd = index === this.batchRequests.length - 1 ? "--\r\n" : "\r\n";
			body += `${REQUEST_HEADERS}\r\n`;
			body += `${request.options.method} ${request.url} HTTP/1.1\r\n${REQUEST_BODY}`;
			body += `${BOUNDARY}${boundaryEnd}`;
		}

		return body;
	}

	/**
	 * Adds a request to the MultiPartRequest batch.
	 *
	 * @public
	 * @param {Object} request - The request to add to the batch.
	 */
	public addRequest(request: MultiPartRequest): void {
		this.batchRequests.push(request);
	}

	/**
	 * Constructs the body for the multipart request with payload
	 *
	 * @returns {string} - The constructed body.
	 * @private
	 */
	public constructBodyWithPayload(): string {
		const BOUNDARY = `--${this.boundary}`;
		const REQUEST_HEADERS = "Content-Type:application/http\r\nContent-Transfer-Encoding:binary\r\n";
		let body = `${BOUNDARY}\r\n`;
		const changeSet = "changeset_001";
		const CHANGESET_BOUNDARY = `--${changeSet}`;
		const CHANGESET_HEADER = `Content-Type: multipart/mixed; boundary=${changeSet}\r\n`;
		body += `${CHANGESET_HEADER}\r\n${CHANGESET_BOUNDARY}\r\n`;
		for (let index = 0; index < this.batchRequests.length; index++) {
			const request = this.batchRequests[index];
			body += `\r\n${REQUEST_HEADERS}`;
			body += `Content-ID: ${index + 1}\r\n\r\n`;
			body += `${request.options.method} ${request.url} HTTP/1.1\r\n`;
			body += "sap-context-accept: header\r\nContent-Type:application/json\r\n\r\n";
			body += `${JSON.stringify(request.payload)}\r\n\r\n`;
			body += CHANGESET_BOUNDARY;
			if (index === this.batchRequests.length - 1) {
				body += "--\r\n";
				body += `${BOUNDARY}--`;
			}
		}
		return body;
	}
}

/**
 * Parses multipart body response and returns an array of values called in the batch request.
 *
 * @param {string} value - Multipart body response.
 * @returns {Object[]} - Array of values in the multipart request.
 * @returns {Object[]} - An array of values in the multipart request.
 */
const getDataFromRawValue = function (value: string): (string | object)[] {
	const parsedValue = value
		.replace(/\r\n/g, "\n")
		.split("\n")
		.filter((data) => data !== "");

	const finalData: (string | object)[] = [];
	let contentTypeValue = "";

	for (let index = 1; index < parsedValue.length - 1; index++) {
		contentTypeValue = parsedValue[index].includes("Content-Type: ") ? parsedValue[index].split("Content-Type: ")[1] : contentTypeValue;

		if (parsedValue[index + 1].includes(parsedValue[0])) {
			if (contentTypeValue === "application/json") {
				finalData.push(JSON.parse(parsedValue[index]) as string);
			} else {
				finalData.push(parsedValue[index]);
			}
		}
	}

	return finalData;
};

/**
 * Fetches the CSRF token from the specified base URL.
 *
 * @async
 * @param {string} baseURL - The base URL to fetch the CSRF token from.
 * @returns {Promise<string>} A Promise that resolves when all batch requests are completed. A promise that resolves to the CSRF token.
 * @throws {Error} An error if the CSRF token cannot be fetched.
 */
const fetchCSRFToken = async function (baseURL: string): Promise<string> {
	try {
		const response = await fetch(baseURL, {
			method: methods.HEAD,
			headers: {
				"X-CSRF-Token": "Fetch"
			}
		});

		if (response.ok) {
			const token = response.headers.get("X-CSRF-Token");
			if (token) {
				return token;
			}
		}

		throw new Error("Cannot fetch X-CSRF-Token.");
	} catch (error: unknown) {
		throw new Error((error as Error).message);
	}
};

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
	private url!: string;

	/**
	 * Fetches data from a multipart request.
	 *
	 * @private
	 * @param {MultiPartRequest} multiPartRequest - The multipart request object.
	 * @returns {Promise<Array<string | object>>} - A promise that resolves to the data from the request.
	 */
	private async fetchData(multiPartRequest: MultiPartRequest): Promise<Array<string | object>> {
		multiPartRequest.options.body =
			multiPartRequest.options.method === methods.GET
				? multiPartRequest._constructBody()
				: multiPartRequest.constructBodyWithPayload();

		multiPartRequest.options.method = methods.POST;

		const response = await fetch(this.url, multiPartRequest.options);

		if (!response.ok) {
			throw new Error("Failed to fetch data from the server.");
		}

		const text = await response.text();
		return getDataFromRawValue(text);
	}

	/**
	 * Creates a multipart batch request with multiple URLs.
	 *
	 * @public
	 * @param {string} baseURL - The base URL for creating the batch request.
	 * @param {string[]} urls - An array of URLs for individual requests.
	 * @returns {Promise<Array<string | object>>} - A promise that resolves to the data from the batch request.
	 */
	public async createMultipartRequest(baseURL: string, urls: string[]): Promise<Array<string | object>> {
		this.url = `${baseURL}$batch`;
		const csrfToken = await fetchCSRFToken(baseURL);
		const request = this.buildMultipartRequest(urls, csrfToken);
		return await this.fetchData(request);
	}

	/**
	 * Creates a multipart batch request with given payloads and sends it to the specified base URL.
	 *
	 * @public
	 * @param {string} baseURL - The base URL for creating the batch request.
	 * @param payloads - An array of objects containing the URL and data for each part of the multipart request.
	 * @param requestMethod - The HTTP method to be used for the request (e.g., POST).
	 * @returns {Promise<Array<string | object>>} A promise that resolves to the data from the batch request.
	 */
	public async createMultipartRequestWithPayload(
		baseURL: string,
		payloads: { url: string; data: unknown }[],
		requestMethod: methods
	): Promise<Array<string | object>> {
		this.url = `${baseURL}$batch`;
		const csrfToken = await fetchCSRFToken(baseURL);
		const request = this.buildMultipartRequestWithPayload(payloads, csrfToken, requestMethod);
		return await this.fetchData(request);
	}

	/**
	 * Builds a multipart request from an array of URLs.
	 *
	 * @private
	 * @param {string[]} urls - An array of URLs for individual requests.
	 * @returns {MultiPartRequest} - The multipart request object.
	 */
	private buildMultipartRequest(urls: string[], csrfToken: string, requestMethod: methods = methods.GET): MultiPartRequest {
		// create base request from first URL
		const request = new MultiPartRequest(urls[0], requestMethod, csrfToken);

		// Add all URLs as sub-requests
		urls.forEach((url) => {
			request.addRequest(new MultiPartRequest(url, requestMethod, csrfToken));
		});

		return request;
	}

	/**
	 * Builds a multipart request with the given payloads, CSRF token, and request method.
	 *
	 * @param payloads - An array of objects containing the URL and data for each part of the request.
	 * @param csrfToken - The CSRF token to be included in the request headers.
	 * @param requestMethod - The HTTP method to be used for the request.
	 * @returns {MultiPartRequest} A `MultiPartRequest` object containing the constructed multipart request.
	 */
	private buildMultipartRequestWithPayload(
		payloads: { url: string; data: unknown }[],
		csrfToken: string,
		requestMethod: methods
	): MultiPartRequest {
		const request = new MultiPartRequest(payloads[0].url, requestMethod, csrfToken);
		request.payload = payloads[0].data;
		payloads.forEach(({ url, data }) => {
			const multipartRequest = new MultiPartRequest(url, requestMethod, csrfToken);
			multipartRequest.payload = data;
			request.addRequest(multipartRequest);
		});

		return request;
	}
}
