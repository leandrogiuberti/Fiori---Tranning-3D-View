declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/typeConverter" {
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    import { ODataValue } from "sap/esh/search/ui/sinaNexTS/sina/odatatypes";
    function sina2Odata(attributeType: AttributeType, value: any, context: any): any;
    function sina2OdataString(value: any, context: any): string;
    function odata2Sina(attributeType: AttributeType, value: ODataValue): Value;
    function convertValueToString(value: Value): string;
    function sina2OdataTimestamp(value: Date | "$$now$$"): string;
    function sina2OdataTime(value: string): string;
    function sina2OdataDate(value: string): string;
    function addLeadingZeros(value: any, length: any): string;
}
//# sourceMappingURL=typeConverter.d.ts.map