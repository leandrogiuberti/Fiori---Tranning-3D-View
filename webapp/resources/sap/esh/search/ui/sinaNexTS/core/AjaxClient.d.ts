declare module "sap/esh/search/ui/sinaNexTS/core/AjaxClient" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AjaxBaseClient, AjaxBaseClientProperties } from "sap/esh/search/ui/sinaNexTS/core/AjaxBaseClient";
    import { RequestProperties, ResponseFormatter, ResponseProperties } from "./ajax";
    type RequestNormalizer = (payload: unknown) => {
        NotToRecord?: boolean;
    } | "" | unknown;
    interface AjaxClientProperties extends AjaxBaseClientProperties {
        recordingHeaders?: Record<string, string>;
        recordingMode?: RecordingMode;
        recordingPath?: string;
        requestNormalization?: RequestNormalizer;
        replayResponseFormatters?: Array<ResponseFormatter>;
    }
    enum RecordingMode {
        NONE = "none",
        RECORD = "record",
        REPLAY = "replay"
    }
    class AjaxClient extends AjaxBaseClient {
        records: Record<string, unknown>;
        recordOptions?: {
            headers: Record<string, string>;
            mode: RecordingMode;
            path: string;
            requestNormalization: RequestNormalizer;
        };
        replayResponseFormatters: Array<ResponseFormatter>;
        constructor(properties: AjaxClientProperties);
        loadRecords(): Promise<void>;
        createUrlMatchingReplayResponseFormatter(url: string, formatter: ResponseFormatter): {
            delete: () => void;
        };
        addReplayResponseFormatter(formatter: ResponseFormatter): void;
        removeReplayResponseFormatter(formatter: ResponseFormatter): void;
        applyReplayResponseFormatters(request: RequestProperties, response: ResponseProperties): any;
        requestInternal(requestProperties: RequestProperties): Promise<ResponseProperties>;
        private normalizeRequestData;
        private calculateKey;
        private record;
        private replay;
        private supportDeprecatedRecording;
        private saveRecording;
        private defaultRequestNormalization;
    }
}
//# sourceMappingURL=AjaxClient.d.ts.map