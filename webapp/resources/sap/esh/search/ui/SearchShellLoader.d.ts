declare module "sap/esh/search/ui/SearchShellLoader" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import type ShellBarSearch from "@ui5/webcomponents-fiori/dist/ShellBarSearch";
    export default class SearchShellLoader {
        constructor(opts: {
            getSearchField: () => Promise<ShellBarSearch>;
        });
        initAsync(opts: {
            getSearchField: () => Promise<ShellBarSearch>;
        }): Promise<void>;
    }
}
//# sourceMappingURL=SearchShellLoader.d.ts.map