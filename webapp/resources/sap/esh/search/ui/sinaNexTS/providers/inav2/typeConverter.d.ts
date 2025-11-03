declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/typeConverter" {
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    function sina2Ina(attributeType: AttributeType, value: Value, context?: unknown): string;
    function ina2Sina(attributeType: AttributeType, value: string): any;
    function ina2SinaTimestamp(value: any): Date;
    function sina2InaTimestamp(value: any): string;
    function ina2SinaTime(value: any): string;
    function sina2InaTime(value: any): string;
    function ina2SinaDate(value: any): string;
    function sina2InaDate(value: any, context: any): string;
    function sina2InaString(value: string, context: any): string;
    function addLeadingZeros(value: string, length: int): string;
}
//# sourceMappingURL=typeConverter.d.ts.map