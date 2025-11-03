/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import {
    SearchResultSetItemAttributeBase,
    SearchResultSetItemAttributeBaseOptions,
} from "./SearchResultSetItemAttributeBase";
import { NavigationTarget } from "./NavigationTarget";
import { AttributeMetadataBase } from "./AttributeMetadataBase";
// import { Value } from "./types";

export interface SearchResultSetItemAttributeOptions extends SearchResultSetItemAttributeBaseOptions {
    value: any; //Value;
    valueFormatted?: string;
    valueHighlighted?: string;
    isHighlighted: boolean;
    unitOfMeasure?: SearchResultSetItemAttribute;
    description?: SearchResultSetItemAttribute;
    defaultNavigationTarget?: NavigationTarget;
    navigationTargets?: Array<NavigationTarget>;
    metadata: AttributeMetadataBase;
    iconUrl?: string;
    tooltip?: string;
}
export class SearchResultSetItemAttribute extends SearchResultSetItemAttributeBase {
    // _meta: {
    //     properties: {
    //         label: {
    //             required: true
    //         },
    //         value: {
    //             required: true
    //         },
    //         valueFormatted: {
    //             required: false
    //         },
    //         valueHighlighted: {
    //             required: false
    //         },
    //         isHighlighted: {
    //             required: true
    //         },
    //         unitOfMeasure: {
    //             required: false
    //         },
    //         description: {
    //             required: false
    //         },
    //         defaultNavigationTarget: {
    //             required: false,
    //             aggregation: true
    //         },
    //         navigationTargets: {
    //             required: false,
    //             aggregation: true
    //         }
    //     }
    // },

    value: any;
    valueFormatted: string;
    valueHighlighted: string;
    isHighlighted: boolean;
    unitOfMeasure: SearchResultSetItemAttribute;
    description: SearchResultSetItemAttribute;
    defaultNavigationTarget: NavigationTarget;
    navigationTargets: Array<NavigationTarget>;
    iconUrl?: string;
    tooltip?: string;

    constructor(properties: SearchResultSetItemAttributeOptions) {
        super(properties);
        this.value = properties.value;
        this.valueFormatted = properties.valueFormatted;
        this.valueHighlighted = properties.valueHighlighted;
        this.isHighlighted = properties.isHighlighted;
        this.unitOfMeasure = properties.unitOfMeasure;
        this.description = properties.description;
        this.setDefaultNavigationTarget(properties.defaultNavigationTarget);
        this.setNavigationTargets(properties.navigationTargets || []);
        this.metadata = properties.metadata;
        this.iconUrl = properties.iconUrl;
        this.tooltip = properties.tooltip;
    }

    setDefaultNavigationTarget(navigationTarget: NavigationTarget) {
        if (!navigationTarget) {
            this.defaultNavigationTarget = null;
            return;
        }
        this.defaultNavigationTarget = navigationTarget;
        navigationTarget.parent = this;
    }

    setNavigationTargets(navigationTargets: Array<NavigationTarget>) {
        this.navigationTargets = [];
        if (!navigationTargets) {
            return;
        }
        for (const navigationTarget of navigationTargets) {
            this.addNavigationTarget(navigationTarget);
        }
    }

    addNavigationTarget(navigationTarget: NavigationTarget) {
        this.navigationTargets.push(navigationTarget);
        navigationTarget.parent = this;
    }

    toString(): string {
        return this.label + ": " + this.valueFormatted;
    }

    getSubAttributes(): Array<SearchResultSetItemAttribute> {
        return [this];
    }
}
