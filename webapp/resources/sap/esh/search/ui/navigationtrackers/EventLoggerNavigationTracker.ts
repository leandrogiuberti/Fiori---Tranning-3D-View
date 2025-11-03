/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "../SearchModel";
import {
    ItemNavigateEvent,
    ObjectSuggestionNavigateEvent,
    ResultListItemAttributeNavigateEvent,
    ResultListItemNavigateContextEvent,
    ResultListItemNavigateEvent,
    UserEventType,
} from "../eventlogging/UserEvents";
import { NavigationTarget, NavigationTracker } from "../sinaNexTS/sina/NavigationTarget";
import { ObjectSuggestion } from "../sinaNexTS/sina/ObjectSuggestion";
import { ResultSet } from "../sinaNexTS/sina/ResultSet";
import { ResultSetItem } from "../sinaNexTS/sina/ResultSetItem";
import { SearchResultSetItem } from "../sinaNexTS/sina/SearchResultSetItem";
import { SearchResultSetItemAttributeBase } from "../sinaNexTS/sina/SearchResultSetItemAttributeBase";

// interface EventData {
//     type: UserEventType;
//     targetUrl: string;
//     positionInList: number;
//     executionId: string;
// }

function assembleResultData(
    resultSetItem: ResultSetItem,
    model: SearchModel
): {
    executionId: string;
    positionInList: number;
    dataSourceKey: string;
    searchTerm: string;
} {
    if (!resultSetItem) {
        return {
            executionId: "-1",
            positionInList: -1,
            dataSourceKey: "-1",
            searchTerm: "-1",
        };
    }
    const resultSet = resultSetItem.parent;
    if (!(resultSet instanceof ResultSet)) {
        return {
            executionId: "-1",
            positionInList: -1,
            dataSourceKey: "-1",
            searchTerm: "-1",
        };
    }
    return {
        executionId: resultSet.id,
        positionInList: resultSet?.items.indexOf(resultSetItem),
        dataSourceKey: model.getDataSource().id,
        searchTerm: model.getSearchBoxTerm(),
    };
}

function assembleEventData(
    navigationTarget: NavigationTarget,
    model: SearchModel
):
    | ObjectSuggestionNavigateEvent
    | ResultListItemNavigateEvent
    | ResultListItemNavigateContextEvent
    | ResultListItemAttributeNavigateEvent
    | ItemNavigateEvent {
    const parent = navigationTarget.parent;

    // check for nav target on result set attribute
    if (parent instanceof SearchResultSetItemAttributeBase) {
        return Object.assign(
            {
                type: UserEventType.RESULT_LIST_ITEM_ATTRIBUTE_NAVIGATE,
                targetUrl: navigationTarget.targetUrl,
            },
            assembleResultData(parent.parent, model)
        ) as ResultListItemAttributeNavigateEvent;
    }

    // check for nav target on object suggestion
    if (parent instanceof SearchResultSetItem && parent.parent instanceof ObjectSuggestion) {
        return Object.assign(
            {
                type: UserEventType.OBJECT_SUGGESTION_NAVIGATE,
                targetUrl: navigationTarget.targetUrl,
            },
            assembleResultData(parent.parent, model)
        ) as ObjectSuggestionNavigateEvent;
    }

    // check for nav target on result set item
    if (parent instanceof SearchResultSetItem) {
        const type =
            parent.defaultNavigationTarget === navigationTarget
                ? UserEventType.RESULT_LIST_ITEM_NAVIGATE
                : UserEventType.RESULT_LIST_ITEM_NAVIGATE_CONTEXT;
        return Object.assign(
            {
                type: type,
                targetUrl: navigationTarget.targetUrl,
            },
            assembleResultData(parent, model)
        ) as ResultListItemNavigateEvent | ResultListItemNavigateContextEvent;
    }

    // fallback
    return {
        type: UserEventType.ITEM_NAVIGATE,
        targetUrl: navigationTarget.targetUrl,
        executionId: "",
        positionInList: -1,
        dataSourceKey: model.getDataSource().id,
        searchTerm: model.getSearchBoxTerm(),
    };
}

export function generateEventLoggerNavigationTracker(model: SearchModel): NavigationTracker {
    return (navigationTarget: NavigationTarget) => {
        const eventData = assembleEventData(navigationTarget, model);
        model.eventLogger.logEvent(eventData);
    };
}
