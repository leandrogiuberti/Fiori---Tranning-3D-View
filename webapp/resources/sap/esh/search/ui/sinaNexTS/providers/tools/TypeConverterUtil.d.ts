declare module "sap/esh/search/ui/sinaNexTS/providers/tools/TypeConverterUtil" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { ODataValue } from "sap/esh/search/ui/sinaNexTS/sina/odatatypes";
    function convertToSinaDouble(value: ODataValue): number;
    function convertToSinaInteger(value: ODataValue): number;
    function convertToSinaStringImageUrlImageBlob(attributeType: AttributeType, value: ODataValue): string;
    function convertToSinaGeoJson(attributeType: AttributeType, value: ODataValue): object;
    function convertToSinaDate(value: ODataValue): string;
    function convertToSinaTime(value: ODataValue): string;
    function convertToSinaTimestamp(value: ODataValue): Date;
    function odata2SinaDate(value: string): string;
    function odata2SinaTime(value: string): string;
    function odata2SinaTimestamp(value: string): Date;
}
//# sourceMappingURL=TypeConverterUtil.d.ts.map