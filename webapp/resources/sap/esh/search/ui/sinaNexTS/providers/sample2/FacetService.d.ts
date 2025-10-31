declare module "sap/esh/search/ui/sinaNexTS/providers/sample2/FacetService" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { FacetType } from "sap/esh/search/ui/sinaNexTS/sina/FacetType";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Record } from "sap/esh/search/ui/sinaNexTS/providers/sample2/RecordService";
    import { Value as RawValue } from "sap/esh/search/ui/sinaNexTS/sina/types";
    import { SearchEngine } from "sap/esh/search/ui/sinaNexTS/providers/sample2/SearchEngine";
    interface FacetSet {
        dataSourceId: string;
        facets: Facet[];
    }
    interface Facet {
        id: string;
        label: string;
        type: FacetType;
        facetTotalCount: number;
        position: number;
        items: FacetItem[];
    }
    interface FacetItem {
        description: string;
        count: number;
        rawValueLow: RawValue;
        rawValueHigh: RawValue;
        stringValueLow: string;
        stringValueHigh: string;
    }
    interface FacetItemData {
        lowStringValue: string;
        lowRawValue: RawValue;
        highStringValue: string;
        highRawValue: RawValue;
        count: number;
    }
    class FacetService {
        readonly searchEngine: SearchEngine;
        sina: Sina;
        dataSourceIds: string[];
        constructor(sina: Sina, dataSourceIds: string[], searchEngine: SearchEngine);
        createFacetsByDataSourceId(dataSourceId: string, records: Record[]): FacetSet | undefined;
        createDataSourceFacetSet(records: Record[]): FacetSet;
        createAttributeFacetSet(records: Record[], facetAttributes: Array<AttributeMetadata>, top?: number): FacetSet;
        createAttributeFacet(records: Record[], attribute: AttributeMetadata, top?: number): Facet | undefined;
        private getPointItemsData;
        private getNumberRangeItemsData;
        private getDateRangeItemsData;
    }
}
//# sourceMappingURL=FacetService.d.ts.map