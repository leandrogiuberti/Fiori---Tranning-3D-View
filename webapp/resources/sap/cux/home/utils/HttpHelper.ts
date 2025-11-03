/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import BaseObject from "sap/ui/base/Object";
import { REPO_BASE_URL } from "./Constants";

/**
 *
 * @class Provides the HttpHelper Class used for Get and Post Calls.
 *
 * @extends sap.ui.BaseObject
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 * @private
 *
 * @alias sap.cux.home.utils.HttpHelper
 */

export default class HttpHelper extends BaseObject {
	private constructor() {
		super();
	}

	/**
	 * Fetches the CSRF Token
	 * @returns {Promise<string | void>} Promise that resolves with the CSRF Token
	 */
	private static fetchCSRFToken(): Promise<string | void> {
		return fetch(REPO_BASE_URL, {
			method: "HEAD",
			headers: {
				"X-CSRF-Token": "Fetch"
			}
		})
			.then((response) => {
				const token = response.headers.get("X-CSRF-Token");
				if (response.ok && token) {
					return token;
				}
				throw new Error("Cannot fetch X-CSRF-Token.");
			})
			.catch((error: Error) => {
				Log.error(error.message);
			});
	}

	/**
	 * Post Method
	 * @param {string} url - The URL to post to
	 * @param {object} payload - The payload to post
	 * @returns {Promise<unknown>} Promise that resolves with the response
	 */
	public static Post(url: string, payload: object): Promise<unknown> {
		return HttpHelper.fetchCSRFToken()
			.then((csrfToken) => {
				return fetch(url, {
					method: "POST",
					headers: {
						"X-CSRF-Token": csrfToken as string,
						"content-type": "application/json"
					},
					body: JSON.stringify(payload)
				});
			})
			.then((response) => {
				return response.json();
			})
			.catch((error: Error) => {
				Log.error(error.message);
			});
	}

	/**
	 * Get Method for JSON Data
	 * @param {string} url - The URL to get from
	 * @returns {Promise<unknown>} Promise that resolves with the JSON data response
	 */
	public static GetJSON(url: string): Promise<unknown> {
		return fetch(url)
			.then((response) => {
				return response.json();
			})
			.catch((error: Error) => {
				Log.error(error.message);
			});
	}
	/**
	 * Get Method for Multiple Requests
	 *
	 * @param {string[]} urls - An array of URLs to get from
	 * @returns {Promise<(string | object)[]>} Promise that resolves with the responses from the URLs
	 */
	public static async GetMultipleRequests(urls: string[] = []): Promise<(string | object)[]> {
		try {
			const results = await Promise.all(
				urls.map(async (url) => {
					const response = await fetch(url);
					if (response.headers.get("Content-Type")?.includes("application/json")) {
						return (await response.json()) as object;
					} else {
						return await response.text();
					}
				})
			);

			return results;
		} catch (error: unknown) {
			Log.error((error as Error)?.message);
			return [];
		}
	}
}
