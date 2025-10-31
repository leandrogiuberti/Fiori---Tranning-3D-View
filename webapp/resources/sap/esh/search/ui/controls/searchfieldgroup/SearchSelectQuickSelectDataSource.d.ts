declare module "sap/esh/search/ui/controls/searchfieldgroup/SearchSelectQuickSelectDataSource" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Select, { $SelectSettings } from "sap/m/Select";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchSelectQuickSelectDataSource extends Select {
        constructor(sId?: string, options?: Partial<$SelectSettings>);
        handleSelectDataSource(dataSource: DataSource): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchSelectQuickSelectDataSource.d.ts.map