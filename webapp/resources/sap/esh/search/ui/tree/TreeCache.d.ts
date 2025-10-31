declare module "sap/esh/search/ui/tree/TreeCache" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    class TreeCache {
        data: {
            [id: string]: unknown;
        };
        active: boolean;
        constructor();
        activate(): void;
        deActivate(): void;
        set(key: string, value: unknown): void;
        get(key: string): unknown;
        clear(): void;
    }
}
//# sourceMappingURL=TreeCache.d.ts.map