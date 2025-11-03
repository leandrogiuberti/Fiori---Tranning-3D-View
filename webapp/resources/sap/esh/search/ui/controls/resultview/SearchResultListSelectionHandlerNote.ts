/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchResultListSelectionHandler from "./SearchResultListSelectionHandler";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchResultListSelectionHandlerNote extends SearchResultListSelectionHandler {
    isMultiSelectionAvailable(): boolean {
        return true;
    }
}
