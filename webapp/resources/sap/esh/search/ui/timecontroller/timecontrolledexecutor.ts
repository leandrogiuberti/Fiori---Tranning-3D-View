/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Request } from "./request";
import { RequestExecutor, RequestExecutorStatus } from "./requestexecutor";

interface TimeControlledExecutorOptions<Response> {
    createTooManyRequestsError?: (request: Request<Response>) => Error;
    outdatedTimeLimit: number;
}

function defaultCreateTooManyRequestsError(): Error {
    return new Error("Too many requests");
}

export class TimeControlledExecutor<Response> {
    requestExecutor: RequestExecutor<Response>;
    outdatedLimit: number;
    createTooManyRequestsError?: (request: Request<Response>) => Error;

    constructor(options: TimeControlledExecutorOptions<Response>) {
        this.outdatedLimit = options.outdatedTimeLimit;
        this.createTooManyRequestsError =
            options.createTooManyRequestsError ?? defaultCreateTooManyRequestsError;
    }

    createNewRequest(request: Request<Response>) {
        // delete old request
        if (this.requestExecutor) {
            this.requestExecutor.delete();
        }
        // create new request
        this.requestExecutor = new RequestExecutor(request);
        const promise = this.requestExecutor.createResponseListener();
        this.requestExecutor.execute();
        return promise;
    }

    reuseOldRequest() {
        // remove old promise (will never be resolved)
        this.requestExecutor.clearResponseListeners();
        // create new promise
        return this.requestExecutor.createResponseListener();
    }

    denyRequest(request: Request<Response>) {
        // remove old promise (will never be resolved)
        this.requestExecutor.clearResponseListeners();
        // create rejected promise
        return Promise.reject(this.createTooManyRequestsError(request));
    }

    execute(request: Request<Response>): Promise<Response> {
        // simple case: no old request -> just create new request
        if (!this.requestExecutor) {
            return this.createNewRequest(request);
        }

        // goals
        // =====
        // - prevent request overtaking
        // - prevent two many call in a short time interval

        // input:
        // ======
        // - old request: pending or completed
        // - request: changed or not
        // - time interval between request: small or large

        // output:
        // =======
        // - new request (forget old request)
        // - reuse old request
        // - deny request (too many requests error)

        // time between old and new request
        const timeInterval = new Date().getTime() - this.requestExecutor.time;

        if (this.requestExecutor.status === RequestExecutorStatus.PENDING) {
            // 1. old request pending
            if (this.requestExecutor.getRequest().equals(request)) {
                // 1.1 request not changed
                if (timeInterval <= this.outdatedLimit) {
                    // 1.1.1 reuse old request
                    return this.reuseOldRequest();
                }
                // 1.1.2 create new request
                return this.createNewRequest(request);
            } else {
                // 1.2 request changed
                return this.createNewRequest(request);
            }
        } else {
            // 2. old request completed
            return this.createNewRequest(request);
        }
    }
}
