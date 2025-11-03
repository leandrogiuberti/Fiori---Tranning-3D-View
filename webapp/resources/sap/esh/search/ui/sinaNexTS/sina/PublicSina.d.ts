declare module "sap/esh/search/ui/sinaNexTS/sina/PublicSina" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ComplexCondition, ComplexConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { SimpleCondition, SimpleConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import type { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    class PublicSina {
        sina: Sina;
        constructor(sina: Sina);
        createSimpleCondition(props: SimpleConditionProperties): SimpleCondition;
        createComplexCondition(props: ComplexConditionProperties): ComplexCondition;
    }
}
//# sourceMappingURL=PublicSina.d.ts.map