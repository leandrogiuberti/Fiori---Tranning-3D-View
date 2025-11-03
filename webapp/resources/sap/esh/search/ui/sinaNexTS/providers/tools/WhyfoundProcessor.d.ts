declare module "sap/esh/search/ui/sinaNexTS/providers/tools/WhyfoundProcessor" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { ODataValue } from "sap/esh/search/ui/sinaNexTS/sina/odatatypes";
    class WhyfoundProcessor {
        sina: Sina;
        constructor(sina: Sina);
        processRegularWhyFoundAttributes(attributeName: string, structuredAttribute: Record<"value", ODataValue>, whyFounds: Record<string, ODataValue>, metadata: AttributeMetadata): string;
        processAdditionalWhyfoundAttributes(whyFounds: Record<string, string | ODataValue>, searchResultSetItem: SearchResultSetItem): Promise<SearchResultSetItem>;
        _getFirstItemIfArray(value: any): any;
        calculateValueHighlighted(structuredAttribute: any, metadata: AttributeMetadata, attrWhyFound: any): any;
        calIsHighlighted(attrWhyFound: any): boolean;
    }
}
//# sourceMappingURL=WhyfoundProcessor.d.ts.map