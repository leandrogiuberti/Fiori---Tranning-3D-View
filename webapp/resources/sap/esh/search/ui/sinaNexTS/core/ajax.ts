/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { requestNodePlain } from "./requestNodePlain";
import { requestBrowser } from "./requestBrowser";
import { isBrowserEnv } from "./core";
import { SinaError } from "./errors";
import { Log } from "./Log";

export interface RequestProperties {
    data?: string;
    headers?: Record<string, string>;
    url: string;
    parameters?: Record<string, unknown>;
    method: string;
    cookies?: string; // only for node-fetch
}

export type RequestFormatter = (request: RequestProperties) => RequestProperties;

export interface ResponseProperties {
    data: string;
    dataJSON?: JSONValue;
    headers: Record<string, string | string[]>;
    status: number;
    statusText: string;
}

export interface JSONResponseProperties {
    data: JSONValue;
    headers: Record<string, string | string[]>;
    status: number;
    statusText: string;
}

export type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export type ResponseFormatter = (
    request: RequestProperties,
    response: ResponseProperties
) => ResponseProperties;

export type AjaxErrorFormatter = (
    request: RequestProperties,
    response: ResponseProperties,
    error: SinaError
) => SinaError;

export async function request(properties: RequestProperties): Promise<ResponseProperties> {
    let result;
    if (isBrowserEnv()) {
        result = await requestBrowser(properties);
    } else {
        result = await requestNodePlain(properties);
    }
    try {
        delete result.dataJSON;
        result.dataJSON = JSON.parse(result.data);
    } catch (e) {
        const log = new Log("ajax");
        log.warn("Could not parse response data as JSON: " + result?.data + " (" + e + ")");
    }
    return result;
}

export type AjaxErrorFactory = (request: RequestProperties, response: ResponseProperties) => SinaError;

export function applyResponseFormattersAndUpdateJSON(
    request: RequestProperties,
    response: ResponseProperties,
    formatters: Array<ResponseFormatter>
): ResponseProperties {
    const data = response.data;
    for (const formatter of formatters) {
        response = formatter(request, response);
    }
    if (response.data !== data) {
        // in case data changed also update dataJSON
        try {
            delete response.dataJSON;
            response.dataJSON = JSON.parse(response.data);
        } catch (e) {
            const log = new Log("ajax");
            log.warn("Could not parse response data as JSON: " + response?.data + " (" + e + ")");
        }
    }
    return response;
}
