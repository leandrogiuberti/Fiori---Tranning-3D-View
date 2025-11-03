/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Request } from "./request";

class ResponseListener<Response> {
    requestExecutor: RequestExecutor<Response>;
    resolve: (response: Response) => void;
    reject: (error: unknown) => void;
    promise: Promise<Response>;
    constructor(requestExecutor: RequestExecutor<Response>) {
        this.requestExecutor = requestExecutor;
        this.promise = new Promise<Response>((_resolve, _reject) => {
            this.resolve = _resolve;
            this.reject = _reject;
        });
    }
    notify() {
        if (this.requestExecutor.status !== RequestExecutorStatus.COMPLETED) {
            throw "program error";
        }
        if (!this.requestExecutor.executionResult.hasError) {
            // success
            this.resolve(this.requestExecutor.executionResult.response);
        } else {
            // error
            this.reject(this.requestExecutor.executionResult.error);
        }
    }
}

export enum RequestExecutorStatus {
    INITIAL = "INITIAL",
    PENDING = "PENDING",
    COMPLETED = "COMPLETED", // may be successful or with errors
}

interface ExecutionResult<Response> {
    error?: unknown;
    response?: Response;
    hasError?: boolean;
}

export class RequestExecutor<Response> {
    request: Request<Response>;
    copiedRequest: Request<Response>;
    time: number;
    status: RequestExecutorStatus = RequestExecutorStatus.INITIAL;
    executionResult: ExecutionResult<Response>;
    responseListeners: Array<ResponseListener<Response>> = [];
    constructor(request: Request<Response>) {
        this.request = request;
        this.copiedRequest = request.clone();
    }
    public getRequest(): Request<Response> {
        return this.copiedRequest;
    }
    public delete() {
        this.clearResponseListeners();
    }
    public createResponseListener(): Promise<Response> {
        const responseListener = new ResponseListener<Response>(this);
        if (this.status === RequestExecutorStatus.COMPLETED) {
            responseListener.notify();
        } else {
            this.responseListeners.push(responseListener);
        }
        return responseListener.promise;
    }
    public clearResponseListeners() {
        this.responseListeners = [];
    }
    public execute() {
        this.time = new Date().getTime();
        this.status = RequestExecutorStatus.PENDING;
        if (this.executionResult) {
            throw "program error";
        }
        this.request.execute().then(
            (response: Response) => {
                // success
                this.status = RequestExecutorStatus.COMPLETED;
                this.executionResult = { hasError: false, response: response };
                this.notifyResponseListeners();
            },
            (error) => {
                // error
                this.status = RequestExecutorStatus.COMPLETED;
                this.executionResult = { hasError: true, error: error };
                this.notifyResponseListeners();
            }
        );
    }
    private notifyResponseListeners() {
        for (const responseListener of this.responseListeners) {
            responseListener.notify();
        }
        this.clearResponseListeners();
    }
}
