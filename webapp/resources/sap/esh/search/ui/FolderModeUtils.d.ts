declare module "sap/esh/search/ui/FolderModeUtils" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    class FolderModeResultViewTypeCalculator {
        model: SearchModel;
        constructor(model: SearchModel);
        calculate(resultViewTypes: Array<string>, resultViewType: string, filter: Filter): string;
    }
}
//# sourceMappingURL=FolderModeUtils.d.ts.map