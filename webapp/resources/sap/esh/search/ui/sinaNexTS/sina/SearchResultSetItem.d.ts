declare module "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/ResultSetItem";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SearchResultSetItemAttributeBase } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeBase";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { SearchResultSetItemAttributeGroup } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroup";
    interface SearchResultSetItemOptions extends SinaObjectProperties {
        dataSource: DataSource;
        attributes: Array<SearchResultSetItemAttribute>;
        titleAttributes: Array<SearchResultSetItemAttributeBase>;
        titleDescriptionAttributes?: Array<SearchResultSetItemAttribute>;
        detailAttributes: Array<SearchResultSetItemAttributeBase>;
        defaultNavigationTarget?: NavigationTarget;
        navigationTargets?: Array<NavigationTarget>;
        score?: number;
        hierarchyNodePaths?: Array<HierarchyNodePath>;
    }
    class SearchResultSetItem extends ResultSetItem {
        dataSource: DataSource;
        attributes: Array<SearchResultSetItemAttribute>;
        attributesMap: Record<string, SearchResultSetItemAttribute>;
        titleAttributes: Array<SearchResultSetItemAttributeBase>;
        titleDescriptionAttributes: Array<SearchResultSetItemAttribute | SearchResultSetItemAttributeGroup>;
        detailAttributes: Array<SearchResultSetItemAttributeBase>;
        defaultNavigationTarget: NavigationTarget;
        navigationTargets: Array<NavigationTarget>;
        score: number;
        hierarchyNodePaths?: Array<HierarchyNodePath>;
        constructor(properties: SearchResultSetItemOptions);
        setDefaultNavigationTarget(navigationTarget: NavigationTarget): void;
        setNavigationTargets(navigationTargets: Array<NavigationTarget>): void;
        addNavigationTarget(navigationTarget: NavigationTarget): void;
        setAttributes(attributes: Array<SearchResultSetItemAttribute>): void;
        setTitleAttributes(titleAttributes: Array<SearchResultSetItemAttributeBase>): SearchResultSetItem;
        setTitleDescriptionAttributes(titleDescriptionAttributes: Array<SearchResultSetItemAttribute>): SearchResultSetItem;
        setDetailAttributes(detailAttributes: Array<SearchResultSetItemAttributeBase>): SearchResultSetItem;
        get key(): string;
        toString(): string;
    }
}
//# sourceMappingURL=SearchResultSetItem.d.ts.map