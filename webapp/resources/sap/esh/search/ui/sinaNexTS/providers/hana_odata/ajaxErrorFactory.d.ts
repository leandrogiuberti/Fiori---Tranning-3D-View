declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/ajaxErrorFactory" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { RequestProperties, ResponseProperties } from "sap/esh/search/ui/sinaNexTS/core/ajax";
    import { ServerErrorCode, SinaError, DataSourceError } from "sap/esh/search/ui/sinaNexTS/core/errors";
    function parseCode(code: string): ServerErrorCode;
    function parseDetails(message: string, details: Array<{
        code: string;
        message: string;
    }>): string;
    function parseGlobalError(parsedError: any): DataSourceError;
    function parseDataSourceErrors(parsedError: any): Array<DataSourceError>;
    function calculateErrorCode(codes: Array<ServerErrorCode>): ServerErrorCode;
    function ajaxErrorFactory(request: RequestProperties, response: ResponseProperties): SinaError;
}
//# sourceMappingURL=ajaxErrorFactory.d.ts.map