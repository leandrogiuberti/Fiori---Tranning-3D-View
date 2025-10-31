/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ComplexCondition } from "./sinaNexTS/sina/ComplexCondition";
import { SimpleCondition, SimpleConditionProperties } from "./sinaNexTS/sina/SimpleCondition";
import { boldTagUnescaper as privateBoldTagUnescaper } from "./SearchHelper";

export function createSimpleCondition(props: SimpleConditionProperties): SimpleCondition {
    return new SimpleCondition(props);
}

export function createComplexCondition(): ComplexCondition {
    return new ComplexCondition({});
}

export function boldTagUnescaper(domref: HTMLElement, highlightStyle?: string) {
    return privateBoldTagUnescaper(domref, highlightStyle);
}
