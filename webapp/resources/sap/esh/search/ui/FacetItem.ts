/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Condition } from "./sinaNexTS/sina/Condition";

export interface FacetItemOptions {
    selected: boolean;
    level: number;
    filterCondition: Condition;
    value: string;
    label: string;
    facetTitle: string;
    facetAttribute: string;
    valueLabel: string;
    advanced: boolean;
    listed: boolean;
    icon: string;
    visible: boolean;
}

export default class FacetItem {
    selected: boolean;
    level: number;
    filterCondition: Condition;
    value: string;
    label: string;
    facetTitle: string;
    facetAttribute: string;
    valueLabel: string;
    advanced: boolean;
    listed: boolean;
    icon: string;
    visible: boolean;

    constructor(properties?: Partial<FacetItemOptions>) {
        const oProperties = properties || {};
        this.selected = oProperties.selected || false;
        this.level = oProperties.level || 0;
        this.filterCondition = oProperties.filterCondition;
        this.value = oProperties.value || ""; // value here means count
        this.label = typeof oProperties.label === "undefined" ? "" : oProperties.label + "";
        this.facetTitle = oProperties.facetTitle || "";
        this.facetAttribute = oProperties.facetAttribute || "";
        this.valueLabel = this.value;
        this.advanced = oProperties.advanced || false;
        this.listed = oProperties.listed || false;
        this.icon = oProperties.icon;
        this.visible = oProperties.visible || true;
    }

    equals(otherFacetItem: FacetItem): boolean {
        return (
            this.facetTitle === otherFacetItem.facetTitle &&
            this.label === otherFacetItem.label &&
            this.value === otherFacetItem.value &&
            this.filterCondition.equals(otherFacetItem.filterCondition)
        );
    }

    clone(): FacetItem {
        const newFacetItem = new FacetItem();
        newFacetItem.facetTitle = this.facetTitle;
        newFacetItem.selected = this.selected;
        newFacetItem.label = this.label;
        newFacetItem.icon = this.icon;
        newFacetItem.level = this.level;
        newFacetItem.value = this.value;
        newFacetItem.valueLabel = this.valueLabel;
        newFacetItem.filterCondition = this.filterCondition.clone();
        return newFacetItem;
    }
}
