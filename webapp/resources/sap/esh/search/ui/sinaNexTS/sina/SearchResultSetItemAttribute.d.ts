declare module "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SearchResultSetItemAttributeBase, SearchResultSetItemAttributeBaseOptions } from "./SearchResultSetItemAttributeBase";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { AttributeMetadataBase } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadataBase";
    interface SearchResultSetItemAttributeOptions extends SearchResultSetItemAttributeBaseOptions {
        value: any;
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
    class SearchResultSetItemAttribute extends SearchResultSetItemAttributeBase {
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
        constructor(properties: SearchResultSetItemAttributeOptions);
        setDefaultNavigationTarget(navigationTarget: NavigationTarget): void;
        setNavigationTargets(navigationTargets: Array<NavigationTarget>): void;
        addNavigationTarget(navigationTarget: NavigationTarget): void;
        toString(): string;
        getSubAttributes(): Array<SearchResultSetItemAttribute>;
    }
}
//# sourceMappingURL=SearchResultSetItemAttribute.d.ts.map