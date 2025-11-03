/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import FacetItem from "./FacetItem";
import { FacetTypeUI } from "./controls/facets/FacetTypeUI";
import { Condition } from "./sinaNexTS/sina/Condition";

export interface FacetOptions {
    title: string;
    facetType: FacetTypeUI;
    dimension: string;
    dataType: string;
    matchingStrategy: string;
    items: Array<FacetItem>;
    totalCount: number;
    visible: boolean;
}
export default class Facet {
    title: string;
    facetType: FacetTypeUI;
    dimension: string;
    dataType: string;
    matchingStrategy: string;
    items: Array<FacetItem>;
    totalCount: number;
    visible: boolean;
    position?: number;

    constructor(properties: Partial<FacetOptions>) {
        this.title = properties.title;
        this.facetType = properties.facetType; //datasource or attribute
        this.dimension = properties.dimension;
        this.dataType = properties.dataType;
        this.matchingStrategy = properties.matchingStrategy;
        this.items = properties.items || [];
        this.totalCount = properties.totalCount;
        this.visible = properties.visible || true;
    }

    /**
     * Checks if the facet has the given filter condition
     * @param   {object}  filterCondition the condition to check for in this facet
     * @returns {Boolean} true if the filtercondition was found in this facet
     */
    hasFilterCondition(filterCondition: Condition): boolean {
        for (let i = 0, len = this.items.length; i < len; i++) {
            const fc = this.items[i].filterCondition;
            if (fc.equals && fc.equals(filterCondition)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if this facet has at least one filter condition
     * @returns {Boolean} true if it has at least one filter condition, false otherwise
     */
    hasFilterConditions(): boolean {
        for (let i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].filterCondition) {
                return true;
            }
        }
        return false;
    }

    removeItem(facetItem: FacetItem): Array<FacetItem> {
        for (let i = 0, len = this.items.length; i < len; i++) {
            const fc = this.items[i].filterCondition;
            if (fc.equals && facetItem.filterCondition && fc.equals(facetItem.filterCondition)) {
                return this.items.splice(i, 1);
            }
        }
    }
}
