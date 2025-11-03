declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ajaxErrorFactory" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { RequestProperties, ResponseProperties } from "sap/esh/search/ui/sinaNexTS/core/ajax";
    import { SinaError } from "sap/esh/search/ui/sinaNexTS/core/errors";
    function ajaxErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError;
    function mergeErrors(errors: SinaError[]): SinaError;
    function ajaxNlqErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError;
    function ajaxDefaultErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError;
}
//# sourceMappingURL=ajaxErrorFactory.d.ts.map