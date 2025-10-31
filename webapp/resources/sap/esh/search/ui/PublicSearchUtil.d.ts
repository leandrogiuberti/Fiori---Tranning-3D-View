declare module "sap/esh/search/ui/PublicSearchUtil" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { SimpleCondition, SimpleConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    function createSimpleCondition(props: SimpleConditionProperties): SimpleCondition;
    function createComplexCondition(): ComplexCondition;
    function boldTagUnescaper(domref: HTMLElement, highlightStyle?: string): void;
}
//# sourceMappingURL=PublicSearchUtil.d.ts.map