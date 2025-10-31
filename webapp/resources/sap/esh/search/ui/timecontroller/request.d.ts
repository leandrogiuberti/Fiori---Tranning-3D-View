declare module "sap/esh/search/ui/timecontroller/request" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    interface Request<Response> {
        execute: () => Promise<Response>;
        equals: (other: Request<Response>) => boolean;
        clone: () => Request<Response>;
    }
}
//# sourceMappingURL=request.d.ts.map