declare module "sap/esh/search/ui/navigationtrackers/EventLoggerNavigationTracker" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { ItemNavigateEvent, ObjectSuggestionNavigateEvent, ResultListItemAttributeNavigateEvent, ResultListItemNavigateContextEvent, ResultListItemNavigateEvent } from "../eventlogging/UserEvents";
    import { NavigationTarget, NavigationTracker } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { ResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/ResultSetItem";
    function assembleResultData(resultSetItem: ResultSetItem, model: SearchModel): {
        executionId: string;
        positionInList: number;
        dataSourceKey: string;
        searchTerm: string;
    };
    function assembleEventData(navigationTarget: NavigationTarget, model: SearchModel): ObjectSuggestionNavigateEvent | ResultListItemNavigateEvent | ResultListItemNavigateContextEvent | ResultListItemAttributeNavigateEvent | ItemNavigateEvent;
    function generateEventLoggerNavigationTracker(model: SearchModel): NavigationTracker;
}
//# sourceMappingURL=EventLoggerNavigationTracker.d.ts.map