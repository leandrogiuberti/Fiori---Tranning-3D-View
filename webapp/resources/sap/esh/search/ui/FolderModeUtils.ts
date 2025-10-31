/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "./SearchModel";
import { Filter } from "./sinaNexTS/sina/Filter";

export class FolderModeResultViewTypeCalculator {
    model: SearchModel;
    constructor(model: SearchModel) {
        this.model = model;
    }
    calculate(resultViewTypes: Array<string>, resultViewType: string, filter: Filter): string {
        if (!this.model.config.folderMode || !this.model.config.autoAdjustResultViewTypeInFolderMode) {
            return resultViewType;
        }
        let calculatedResultViewType;
        if (filter.isFolderMode()) {
            calculatedResultViewType = "searchResultTable";
        } else {
            calculatedResultViewType = "searchResultList";
        }
        if (resultViewTypes.indexOf(calculatedResultViewType) < 0) {
            return resultViewType;
        }
        return calculatedResultViewType;
    }
}
