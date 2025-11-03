/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export enum LogicalOperator {
    And = "And",
    Or = "Or",
    Not = "Not",
    // Usage instruction:
    // A Row operator based ComplexCondition must have a And operator based ComplexCondition as direct child.
    // Related SimpleConditions must be added to that And operator based ComplexCondition at first.
    Row = "Row",
}
