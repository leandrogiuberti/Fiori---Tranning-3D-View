declare module "sap/esh/search/ui/SearchUrlParserInav2" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { LogicalOperator } from "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator";
    interface INAV2ConditionJSON {
        label: string;
        attribute: string;
        attributeLabel: string;
        value: string;
        valueLabel: string;
    }
    interface SimpleConditionJSON extends INAV2ConditionJSON {
        operator: "=" | ">" | ">=" | "<" | "<=";
    }
    interface ComplexConditionJSON extends INAV2ConditionJSON {
        operator: LogicalOperator;
        conditions?: Array<INAV2ConditionJSON>;
    }
    interface Context {
        attribute?: string;
        dataSource: DataSource;
    }
    function isComplexConditionJSON(conditionJSON: unknown): conditionJSON is ComplexConditionJSON;
    export default class SearchUrlParserInav2 {
        private model;
        constructor(properties: {
            model: SearchModel;
        });
        parseUrlParameters(oParametersLowerCased: {
            searchterm?: string;
            top?: string;
            datasource?: string;
            filter?: string;
        }): Promise<void>;
        private parseCondition;
        private parseComplexCondition;
        private parseSimpleCondition;
        private parseValue;
        private parseOperator;
    }
}
//# sourceMappingURL=SearchUrlParserInav2.d.ts.map