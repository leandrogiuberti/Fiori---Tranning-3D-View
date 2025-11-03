/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export function encodeUrlParameters(parameters: Record<string, unknown>): string {
    const result = [];
    for (const name in parameters) {
        const value = parameters[name];
        result.push(encodeURIComponent(name) + "=" + encodeURIComponent(value + ""));
    }
    return result.join("&");
}

export function addEncodedUrlParameters(url: string, parameters: Record<string, unknown>): string {
    if (!parameters) {
        return url;
    }
    const encodedParameters = encodeUrlParameters(parameters);
    if (encodedParameters.length > 0) {
        const index = url.indexOf("?");
        if (index >= 0) {
            url = url.slice(0, index) + "?" + encodedParameters + "&" + url.slice(index + 1);
        } else {
            url += "?" + encodedParameters;
        }
    }
    return url;
}

export function parseHeaders(header: string): Record<string, string> {
    const headers = {};
    const lines = header.split("\n");
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        const index = line.indexOf(":");
        if (index >= 0) {
            const name = line.slice(0, index).toLowerCase(); // headers are case insensitive -> normalize to lower case
            const value = line.slice(index + 1);
            headers[name] = value.trim();
        }
    }
    return headers;
}

type EncodableData = Record<string | number | symbol, string | number | boolean>;
export function isNumberStringBooleanRecord(
    data: Record<string | number | symbol, unknown>
): data is EncodableData {
    for (const entry in data) {
        if (
            typeof data[entry] !== "boolean" &&
            typeof data[entry] !== "string" &&
            typeof data[entry] !== "number"
        ) {
            return false;
        }
    }
    return true;
}
