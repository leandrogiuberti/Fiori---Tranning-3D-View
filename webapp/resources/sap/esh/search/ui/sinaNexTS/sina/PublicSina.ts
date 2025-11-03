/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ComplexCondition, ComplexConditionProperties } from "./ComplexCondition";
import { SimpleCondition, SimpleConditionProperties } from "./SimpleCondition";
import type { Sina } from "./Sina";

export class PublicSina {
    sina: Sina;
    constructor(sina: Sina) {
        this.sina = sina;
    }
    public createSimpleCondition(props: SimpleConditionProperties): SimpleCondition {
        return this.sina.createSimpleCondition(props);
    }
    public createComplexCondition(props: ComplexConditionProperties): ComplexCondition {
        return this.sina.createComplexCondition(props);
    }
}
