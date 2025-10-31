/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { RequestProperties, ResponseProperties } from "./ajax";
import { addEncodedUrlParameters } from "./ajaxUtil";

export async function requestNodePlain(properties: RequestProperties): Promise<ResponseProperties> {
    const https = properties.url.startsWith("https") ? await import("node:https") : await import("node:http");
    const { Buffer } = await import("node:buffer");
    return new Promise((resolve) => {
        const url = addEncodedUrlParameters(properties.url, properties.parameters);
        const urlObj = new URL(url);
        const options = {
            rejectUnauthorized: false,
            //requestCert: true,
            //agent: false,
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            port: urlObj.port,
            method: properties.method,
            headers: properties.headers,
        };

        if (properties.data) {
            options.headers["Content-Length"] = "" + Buffer.byteLength(properties.data);
        }

        const req = https.request(options, (res) => {
            let responseData = "";

            res.on("data", (chunk) => {
                responseData += chunk;
            });

            res.on("end", () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    data: responseData,
                    headers: res.headers,
                });
            });
        });

        req.on("error", (error) => {
            resolve({
                status: 0,
                statusText: "" + error,
                data: "",
                headers: {},
            });
        });

        if (properties.data) {
            req.write(properties.data);
        }

        req.end();
    });
}
