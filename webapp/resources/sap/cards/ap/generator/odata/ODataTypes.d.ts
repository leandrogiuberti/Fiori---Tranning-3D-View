/// <reference types="openui5" />
declare module "sap/cards/ap/generator/odata/ODataTypes" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
    import type V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
    type PropertyInfo = {
        textArrangement?: string;
        label: string;
        type: string;
        name: string;
        UOM?: string;
        isDate?: boolean;
        value?: string;
        labelWithValue?: string;
        properties?: [];
        category?: string;
        kind?: string;
        $Type?: string;
        $kind?: string;
    };
    enum PropertyInfoType {
        Property = "Property",
        NavigationProperty = "NavigationProperty"
    }
    type PropertyInfoMap = Array<PropertyInfo>;
    type Model = V2ODataModel | V4ODataModel;
}
//# sourceMappingURL=ODataTypes.d.ts.map