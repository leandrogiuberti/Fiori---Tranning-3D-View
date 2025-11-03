declare module "sap/esh/search/ui/sinaNexTS/core/ajaxUtil" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    function encodeUrlParameters(parameters: Record<string, unknown>): string;
    function addEncodedUrlParameters(url: string, parameters: Record<string, unknown>): string;
    function parseHeaders(header: string): Record<string, string>;
    type EncodableData = Record<string | number | symbol, string | number | boolean>;
    function isNumberStringBooleanRecord(data: Record<string | number | symbol, unknown>): data is EncodableData;
}
//# sourceMappingURL=ajaxUtil.d.ts.map