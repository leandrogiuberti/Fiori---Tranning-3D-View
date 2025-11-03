/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ComplexCondition } from "./ComplexCondition";

export interface DataSourceConfiguration {
    id: string;
    filterCondition?: ComplexCondition;
}
