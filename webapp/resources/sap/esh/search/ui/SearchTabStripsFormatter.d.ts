declare module "sap/esh/search/ui/SearchTabStripsFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ErrorHandler from "sap/esh/search/ui/error/ErrorHandler";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    interface IDataSource {
        dataSource: DataSource;
        isFavDataSource: boolean;
        isAppDataSource: boolean;
        dimensionValueFormatted: string;
        measureValue: number;
        measureValueFormatted: string;
    }
    class Node {
        dataSource: DataSource;
        count: number;
        children: Array<Node>;
        parent: Node;
        unsureWhetherNodeisBelowRoot?: boolean;
        tree: Tree;
        constructor(dataSource: DataSource, count: number, tree: Tree);
        equals(other: Node): boolean;
        setCount(count: number): void;
        getAncestors(): Array<Node>;
        getChildren(): Array<Node>;
        getChildrenSortedByCount(): Array<Node>;
        clearChildren(): void;
        appendNode(node: Node): void;
        appendNodeAtIndex(node: Node, index: number): void;
        insertNode(node: Node): void;
        removeChildNode(node: Node): void;
        hasChild(node: Node): boolean;
        hasSibling(node: Node): boolean;
        _findNode(dataSource: DataSource, result: Array<Node>): void;
    }
    class Tree {
        rootNode: Node;
        model: SearchModel;
        constructor(rootDataSource: DataSource, model: SearchModel);
        reset(): void;
        invalidate(dataSource: DataSource): void;
        findNode(dataSource: DataSource): Node;
        hasChild(ds1: DataSource, ds2: DataSource): boolean;
        hasSibling(ds1: DataSource, ds2: DataSource): boolean;
        removeObsoleteTreeNodes(node: Node, resultDataSources: Array<IDataSource>): void;
        updateFromSearchResultSet(dataSource: DataSource, searchResultSet: SearchResultSet): void;
        updateMyFavTreeNode(currentNode: Node, resultDataSources: Array<IDataSource>): void;
        updateCountMyFavorites(currentNode: Node, resultDataSources: Array<IDataSource>): void;
        getFacets(currentNode: Node, searchResultSet: SearchResultSet): Array<FacetResultSet>;
        isIncludedInMyFavorites(dataSource: DataSource): boolean;
        collectDataSourcesFromResult(currentNode: Node, searchResultSet: SearchResultSet): Array<IDataSource>;
        private updateTreeFromResultDataSources;
    }
    interface TabStrips {
        selected: DataSource;
        strips: Array<DataSource>;
    }
    class Formatter {
        errorHandler: ErrorHandler;
        tree: Tree;
        constructor(rootDataSource: DataSource, model: SearchModel);
        format(dataSource: DataSource, searchResultSet: SearchResultSet, model: SearchModel): TabStrips;
        invalidate(dataSource: DataSource): void;
        generateTabStrips(dataSource: DataSource, model: SearchModel): TabStrips;
        doGenerateTabStrips(dataSource: DataSource, model: SearchModel): TabStrips;
    }
}
//# sourceMappingURL=SearchTabStripsFormatter.d.ts.map