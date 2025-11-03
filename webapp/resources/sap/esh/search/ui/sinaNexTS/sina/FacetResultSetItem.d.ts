declare module "sap/esh/search/ui/sinaNexTS/sina/FacetResultSetItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/ResultSetItem";
    import { SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    interface FacetResultSetItemOptions extends SinaObjectProperties {
        dimensionValueFormatted: string;
        measureValue: number;
        measureValueFormatted: string;
    }
    class FacetResultSetItem extends ResultSetItem {
        dimensionValueFormatted: string;
        measureValue: number;
        measureValueFormatted: string;
        constructor(properties: FacetResultSetItemOptions);
        toString(): string;
    }
}
//# sourceMappingURL=FacetResultSetItem.d.ts.map