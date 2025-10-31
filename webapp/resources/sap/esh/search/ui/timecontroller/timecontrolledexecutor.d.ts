declare module "sap/esh/search/ui/timecontroller/timecontrolledexecutor" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Request } from "sap/esh/search/ui/timecontroller/request";
    import { RequestExecutor } from "sap/esh/search/ui/timecontroller/requestexecutor";
    interface TimeControlledExecutorOptions<Response> {
        createTooManyRequestsError?: (request: Request<Response>) => Error;
        outdatedTimeLimit: number;
    }
    function defaultCreateTooManyRequestsError(): Error;
    class TimeControlledExecutor<Response> {
        requestExecutor: RequestExecutor<Response>;
        outdatedLimit: number;
        createTooManyRequestsError?: (request: Request<Response>) => Error;
        constructor(options: TimeControlledExecutorOptions<Response>);
        createNewRequest(request: Request<Response>): Promise<Response>;
        reuseOldRequest(): Promise<Response>;
        denyRequest(request: Request<Response>): Promise<never>;
        execute(request: Request<Response>): Promise<Response>;
    }
}
//# sourceMappingURL=timecontrolledexecutor.d.ts.map