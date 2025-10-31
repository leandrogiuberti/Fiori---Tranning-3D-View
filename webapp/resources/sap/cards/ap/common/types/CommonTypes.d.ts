declare module "sap/cards/ap/common/types/CommonTypes" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    type FreeStyleFetchOptions = ObjectPageFetchOptions & {
        entitySet: string;
        keyParameters: Record<string, unknown>;
    };
    type ObjectPageFetchOptions = {
        isDesignMode?: boolean;
    };
}
//# sourceMappingURL=CommonTypes.d.ts.map