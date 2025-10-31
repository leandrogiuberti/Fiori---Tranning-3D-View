/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchResultListSelectionHandler from "./controls/resultview/SearchResultListSelectionHandler";
import Control from "sap/ui/core/Control";

export interface DataSourceConfiguration {
    id?: string;
    regex?: string;
    regexFlags?: string;
    regexObject?: RegExp;
    searchResultListItem?: string;
    searchResultListItemControl?: Control;
    searchResultListItemContent?: Control;
    searchResultListItemContentControl?: Control;
    searchResultListSelectionHandler?: string;
    searchResultListSelectionHandlerControl?: typeof SearchResultListSelectionHandler;
}
