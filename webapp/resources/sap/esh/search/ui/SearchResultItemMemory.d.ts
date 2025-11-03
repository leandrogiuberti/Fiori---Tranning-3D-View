declare module "sap/esh/search/ui/SearchResultItemMemory" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    interface Item {
        expanded?: boolean;
    }
    export default class SearchResultSetItemMemory {
        items: {
            [key: string]: Item;
        };
        reset(): void;
        getItem(key: string): Item;
        setExpanded(key: string, expanded: boolean): void;
        getExpanded(key: string): boolean;
    }
}
//# sourceMappingURL=SearchResultItemMemory.d.ts.map