/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AjaxBaseClient, AjaxBaseClientProperties } from "./AjaxBaseClient";
import { Log } from "./Log";
import {
    RequestProperties,
    ResponseFormatter,
    ResponseProperties,
    applyResponseFormattersAndUpdateJSON,
} from "./ajax";
import { InternalSinaError } from "./errors";

export type RequestNormalizer = (payload: unknown) =>
    | {
          NotToRecord?: boolean;
      }
    | ""
    | unknown;
export interface AjaxClientProperties extends AjaxBaseClientProperties {
    recordingHeaders?: Record<string, string>;
    recordingMode?: RecordingMode;
    recordingPath?: string;
    requestNormalization?: RequestNormalizer;
    replayResponseFormatters?: Array<ResponseFormatter>;
}

export enum RecordingMode {
    NONE = "none",
    RECORD = "record",
    REPLAY = "replay",
}

export class AjaxClient extends AjaxBaseClient {
    records: Record<string, unknown>;
    recordOptions?: {
        headers: Record<string, string>;
        mode: RecordingMode;
        path: string;
        requestNormalization: RequestNormalizer;
    };
    replayResponseFormatters: Array<ResponseFormatter> = [];

    constructor(properties: AjaxClientProperties) {
        super(properties);
        this.log = new Log("ajax client");
        this.recordOptions = {
            headers: properties.recordingHeaders,
            mode: properties.recordingMode ?? RecordingMode.NONE,
            path: properties.recordingPath,
            requestNormalization: properties.requestNormalization || this.defaultRequestNormalization,
        };
        if (typeof window !== "undefined" && this.recordOptions.mode !== RecordingMode.NONE) {
            throw new InternalSinaError({ message: "Record/Replay is only supported on Node.js" });
        }
        this.records = {};
        this.authorization = undefined;
        if (properties.authorization) {
            this.authorization = {
                user: properties.authorization.user,
                password: properties.authorization.password,
            };
        }
        this.replayResponseFormatters = properties.replayResponseFormatters ?? [];
    }

    async loadRecords() {
        if (this.recordOptions?.mode === RecordingMode.REPLAY && this.recordOptions?.path) {
            const fs = await import("node:fs");
            this.records = JSON.parse(fs.readFileSync(this.recordOptions.path).toString());
        }
    }

    createUrlMatchingReplayResponseFormatter(
        url: string,
        formatter: ResponseFormatter
    ): { delete: () => void } {
        const replayResponseFormatter = (
            requestProperties: RequestProperties,
            responseProperties: ResponseProperties
        ) => {
            if (requestProperties.url.indexOf(url) !== 0) {
                return responseProperties;
            }
            return formatter(requestProperties, responseProperties);
        };
        this.addReplayResponseFormatter(replayResponseFormatter);
        return {
            delete: () => this.removeReplayResponseFormatter(replayResponseFormatter),
        };
    }

    addReplayResponseFormatter(formatter: ResponseFormatter) {
        this.replayResponseFormatters.push(formatter);
    }

    removeReplayResponseFormatter(formatter: ResponseFormatter) {
        const index = this.replayResponseFormatters.indexOf(formatter);
        if (index >= 0) {
            this.replayResponseFormatters.splice(index);
        }
    }

    applyReplayResponseFormatters(request: RequestProperties, response: ResponseProperties) {
        return applyResponseFormattersAndUpdateJSON(request, response, this.replayResponseFormatters);
    }

    async requestInternal(requestProperties: RequestProperties): Promise<ResponseProperties> {
        if (this.recordOptions.mode === "replay") {
            let replayResponse = await this.replay(requestProperties);
            replayResponse = this.applyReplayResponseFormatters(requestProperties, replayResponse);
            return replayResponse;
        }
        const responseProperties = await super.requestInternal(requestProperties);
        if (this.recordOptions.mode === "record") {
            await this.record(requestProperties, responseProperties);
        }
        return responseProperties;
    }

    private normalizeRequestData(data: string): { data: string; notToRecord: boolean } {
        if (!data) {
            return { data: "", notToRecord: false };
        }
        const normalizedJsonData = this.recordOptions.requestNormalization(JSON.parse(data));
        if (typeof normalizedJsonData === "object" && normalizedJsonData["NotToRecord"]) {
            return { data: "", notToRecord: true };
        }
        return { data: JSON.stringify(normalizedJsonData), notToRecord: false };
    }

    private calculateKey(request: RequestProperties): string {
        const normalizationResult = this.normalizeRequestData(request.data);
        if (normalizationResult.notToRecord) {
            return;
        }
        return request.url + normalizationResult.data;
    }

    private async record(request: RequestProperties, response: ResponseProperties) {
        const key = this.calculateKey(request);
        response = JSON.parse(JSON.stringify(response)); // store copy
        delete response.dataJSON; // parsed JSON is not stored
        this.records[key] = response;
        await this.saveRecording(this.recordOptions.path, this.records);
    }

    private async replay(requestProperties: RequestProperties): Promise<ResponseProperties> {
        const key = this.calculateKey(requestProperties);
        let response = JSON.parse(JSON.stringify(this.records[key])); // return copy
        if (!response) {
            throw new InternalSinaError({
                message: "No recording found for request '" + key + "' in file " + this.recordOptions.path,
            });
        }
        response = this.supportDeprecatedRecording(response);
        try {
            response.dataJSON = JSON.parse(response.data); // restore JSON
        } catch (e) {
            this.log.warn("Could not parse response data as JSON: " + response?.data + " (" + e + ")");
        }
        return response;
    }

    private supportDeprecatedRecording(response: ResponseProperties): ResponseProperties {
        if (response.statusText) {
            return response; // new format, no conversion
        }
        if (typeof response === "object") {
            return { status: 200, statusText: "OK", headers: {}, data: JSON.stringify(response) }; // convert old to new format
        } else {
            return { status: 200, statusText: "OK", headers: {}, data: response as string }; // convert old to new format
        }
    }

    private async saveRecording(
        file: string,
        data: Record<string, unknown>
    ): Promise<ResponseProperties | void> {
        const fs = await import("node:fs");
        return new Promise((resolve, reject) => {
            fs.writeFile(file, JSON.stringify(data, null, 4), "utf8", (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private defaultRequestNormalization(payload: unknown): "" | unknown {
        if (payload === null) {
            return "";
        }
        if (typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "SessionID")) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (payload as any).SessionID;
        }
        if (
            typeof payload === "object" &&
            Object.prototype.hasOwnProperty.call(payload, "SessionTimestamp")
        ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (payload as any).SessionTimestamp;
        }
        return payload;
    }
}
