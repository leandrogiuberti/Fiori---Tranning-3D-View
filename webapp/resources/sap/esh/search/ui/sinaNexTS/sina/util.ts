/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ComparisonOperator } from "./ComparisonOperator";
import { ComplexCondition } from "./ComplexCondition";
import { DataSource } from "./DataSource";
import { Filter } from "./Filter";
import { LogicalOperator } from "./LogicalOperator";
import { SearchResultSetItem } from "./SearchResultSetItem";
import { SearchResultSetItemAttribute } from "./SearchResultSetItemAttribute";
import { SearchResultSetItemAttributeBase } from "./SearchResultSetItemAttributeBase";
import { SearchResultSetItemAttributeGroup } from "./SearchResultSetItemAttributeGroup";
import { SearchResultSetItemAttributeGroupMembership } from "./SearchResultSetItemAttributeGroupMembership";
import { SimpleCondition } from "./SimpleCondition";
import { Sina } from "./Sina";
import { Value } from "./types";
import { HierarchyDisplayType } from "./HierarchyDisplayType";
import { AttributeMetadata } from "./AttributeMetadata";

export function convertOperator2Wildcards(value: string, operator: ComparisonOperator): string {
    if (operator === ComparisonOperator.Eq) {
        return value;
    }

    const result = [];
    const values = value.split(" ");
    for (let i = 0; i < values.length; i++) {
        let trimedValue = values[i].trim();
        if (trimedValue.length === 0) {
            continue;
        }

        switch (operator) {
            case ComparisonOperator.Co:
                trimedValue = "*" + trimedValue + "*";
                break;
            case ComparisonOperator.Bw:
                trimedValue = trimedValue + "*";
                break;
            case ComparisonOperator.Ew:
                trimedValue = "*" + trimedValue;
                break;
            default:
                break;
        }

        result.push(trimedValue);
    }

    return result.join(" ");
}

export function getNavigationHierarchyDataSources(
    sina: Sina,
    hierarchyAttrId: string,
    hierarchyName: string,
    dataSource: DataSource
): Array<DataSource> {
    const navigationDataSources = [];
    if (hierarchyAttrId?.length && sina) {
        const boDataSources: Array<DataSource> = sina.getBusinessObjectDataSources();
        boDataSources.forEach((boDataSource) => {
            if (boDataSource.getHierarchyDataSource() === dataSource) {
                navigationDataSources.push(boDataSource);
            } else if (boDataSource.hierarchyName === hierarchyAttrId) {
                // avoid self reference
                return;
            } else {
                boDataSource.attributesMetadata.forEach((attribute) => {
                    if (
                        ((attribute as AttributeMetadata).hierarchyName === hierarchyName &&
                            attribute.id === hierarchyAttrId &&
                            (attribute as AttributeMetadata).hierarchyDisplayType ===
                                HierarchyDisplayType.HierarchyResultView) ||
                        (attribute as AttributeMetadata).hierarchyDisplayType ===
                            HierarchyDisplayType.StaticHierarchyFacet
                    ) {
                        navigationDataSources.push(boDataSource);
                    }
                });
            }
        });
    }
    return navigationDataSources;
}

// Prepare title as value label in filter condition
export function assembleTitle(result: SearchResultSetItem): string {
    const titleValueArray = [];
    result.titleAttributes.forEach((titleAttr: SearchResultSetItemAttributeBase) => {
        if (titleAttr instanceof SearchResultSetItemAttributeGroup && Array.isArray(titleAttr.attributes)) {
            titleAttr.attributes.forEach((subAttributeGroup: SearchResultSetItemAttributeGroupMembership) => {
                if (
                    subAttributeGroup.attribute &&
                    subAttributeGroup.attribute instanceof SearchResultSetItemAttribute &&
                    subAttributeGroup.attribute.value?.startsWith("sap-icon://") !== true
                ) {
                    titleValueArray.push(subAttributeGroup.attribute.valueFormatted);
                }
            });
        } else if (titleAttr instanceof SearchResultSetItemAttribute) {
            if (titleAttr.value.startsWith("sap-icon://") !== true) {
                titleValueArray.push(titleAttr.valueFormatted);
            }
        }
    });
    return titleValueArray.filter((item) => typeof item === "string" && item.trim() !== "").join(" ");
}

// Assemble down navigation to related descendants as bottom navigation toolbar link
export function assembleHierarchyDecendantsNavigations(
    result: SearchResultSetItem,
    attrName: string,
    attrValue: Value,
    attrValueLabel: string,
    navigationDataSources: Array<DataSource>
): void {
    const datasetCondition = new SimpleCondition({
        attribute: attrName,
        operator: ComparisonOperator.DescendantOf,
        value: attrValue,
        valueLabel: attrValueLabel,
    });
    const wrapComplexConditionDS = new ComplexCondition({
        operator: LogicalOperator.And,
        conditions: [datasetCondition],
    });
    const rootConditionDS = new ComplexCondition({
        operator: LogicalOperator.And,
        conditions: [wrapComplexConditionDS],
    });
    navigationDataSources.forEach((navigationDataSource) => {
        const filterDS = new Filter({
            dataSource: navigationDataSource,
            searchTerm: "", //navigation mode, ignore content in search input box
            rootCondition: rootConditionDS,
            sina: result.sina,
        });
        result.navigationTargets.push(
            result.sina.createSearchNavigationTarget(filterDS, navigationDataSource.labelPlural)
        );
    });
}

export function stringifyValue(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "object") {
        if (typeof value.toString === "function") {
            return value.toString();
        } else {
            return JSON.stringify(value);
        }
    }
    return "" + value;
}
