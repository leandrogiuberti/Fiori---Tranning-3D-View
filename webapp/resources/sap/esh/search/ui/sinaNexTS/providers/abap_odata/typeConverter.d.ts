declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/typeConverter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    function sina2Odata(attributeType: AttributeType, value: any, context?: {}): any;
    function odata2Sina(attributeType: AttributeType, value: any): any;
    function odata2SinaTimestamp(value: any): Date | string;
    function sina2OdataTimestamp(value: Date | "$$now$$"): string;
    function odata2SinaTime(value: any): any;
    function sina2OdataTime(value: any): any;
    function odata2SinaDate(value: any): string;
    function sina2OdataDate(value: any): string;
    function sina2OdataString(value: any, context: any): string;
    function addLeadingZeros(value: any, length: any): string;
}
//# sourceMappingURL=typeConverter.d.ts.map