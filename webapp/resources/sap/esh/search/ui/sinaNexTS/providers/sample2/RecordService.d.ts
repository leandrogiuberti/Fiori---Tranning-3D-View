declare module "sap/esh/search/ui/sinaNexTS/providers/sample2/RecordService" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Value as RawValue } from "sap/esh/search/ui/sinaNexTS/sina/types";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    interface SimpleConditionData {
        attributeId: string;
        rawValue: RawValue;
        operator: string;
    }
    interface RecordResponse {
        results: Record[];
        resultsToDisplay: Record[];
        totalCount: number;
    }
    interface StringRawValuePair {
        stringValue: string;
        rawValue: RawValue;
    }
    interface AttributeValueMap {
        [key: string]: StringRawValuePair;
    }
    interface Record {
        id: string;
        dataSourceId: string;
        valueMap: AttributeValueMap;
        rawValues: RawValue[];
        stringValues: string[];
    }
    class RecordService {
        sina: Sina;
        dataSourceIds: string[];
        records: Record[];
        constructor(sina: Sina, dataSourceIds: string[]);
        loadRecords(): Promise<void>;
        private parseCsv2RecordSet;
        private parseCsv2ArraySet;
        private createAttributeValueMap;
        getRecordsByDataSourceId(dataSourceId: string, records?: Record[]): Record[];
        getResponse(query: Query): RecordResponse;
        getRecordsByConditions(records: Record[], condition: SimpleCondition | ComplexCondition): Record[];
        private getRecordsBySimpleCondition;
        private intersectRecords;
        private uniteRecords;
        private getDisplayedRecords;
        sortRecords(records: Record[], attributeId: string, sort?: "Ascending" | "Descending"): Record[];
    }
}
//# sourceMappingURL=RecordService.d.ts.map