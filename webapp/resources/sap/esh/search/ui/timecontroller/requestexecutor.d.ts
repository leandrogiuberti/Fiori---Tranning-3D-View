declare module "sap/esh/search/ui/timecontroller/requestexecutor" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Request } from "sap/esh/search/ui/timecontroller/request";
    class ResponseListener<Response> {
        requestExecutor: RequestExecutor<Response>;
        resolve: (response: Response) => void;
        reject: (error: unknown) => void;
        promise: Promise<Response>;
        constructor(requestExecutor: RequestExecutor<Response>);
        notify(): void;
    }
    enum RequestExecutorStatus {
        INITIAL = "INITIAL",
        PENDING = "PENDING",
        COMPLETED = "COMPLETED"
    }
    interface ExecutionResult<Response> {
        error?: unknown;
        response?: Response;
        hasError?: boolean;
    }
    class RequestExecutor<Response> {
        request: Request<Response>;
        copiedRequest: Request<Response>;
        time: number;
        status: RequestExecutorStatus;
        executionResult: ExecutionResult<Response>;
        responseListeners: Array<ResponseListener<Response>>;
        constructor(request: Request<Response>);
        getRequest(): Request<Response>;
        delete(): void;
        createResponseListener(): Promise<Response>;
        clearResponseListeners(): void;
        execute(): void;
        private notifyResponseListeners;
    }
}
//# sourceMappingURL=requestexecutor.d.ts.map