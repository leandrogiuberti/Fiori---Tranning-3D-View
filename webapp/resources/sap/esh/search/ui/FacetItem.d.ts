declare module "sap/esh/search/ui/FacetItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    interface FacetItemOptions {
        selected: boolean;
        level: number;
        filterCondition: Condition;
        value: string;
        label: string;
        facetTitle: string;
        facetAttribute: string;
        valueLabel: string;
        advanced: boolean;
        listed: boolean;
        icon: string;
        visible: boolean;
    }
    export default class FacetItem {
        selected: boolean;
        level: number;
        filterCondition: Condition;
        value: string;
        label: string;
        facetTitle: string;
        facetAttribute: string;
        valueLabel: string;
        advanced: boolean;
        listed: boolean;
        icon: string;
        visible: boolean;
        constructor(properties?: Partial<FacetItemOptions>);
        equals(otherFacetItem: FacetItem): boolean;
        clone(): FacetItem;
    }
}
//# sourceMappingURL=FacetItem.d.ts.map