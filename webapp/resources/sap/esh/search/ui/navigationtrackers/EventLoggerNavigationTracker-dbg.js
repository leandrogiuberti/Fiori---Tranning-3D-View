/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../eventlogging/UserEvents", "../sinaNexTS/sina/ObjectSuggestion", "../sinaNexTS/sina/ResultSet", "../sinaNexTS/sina/SearchResultSetItem", "../sinaNexTS/sina/SearchResultSetItemAttributeBase"], function (___eventlogging_UserEvents, ___sinaNexTS_sina_ObjectSuggestion, ___sinaNexTS_sina_ResultSet, ___sinaNexTS_sina_SearchResultSetItem, ___sinaNexTS_sina_SearchResultSetItemAttributeBase) {
  "use strict";

  const UserEventType = ___eventlogging_UserEvents["UserEventType"];
  const ObjectSuggestion = ___sinaNexTS_sina_ObjectSuggestion["ObjectSuggestion"];
  const ResultSet = ___sinaNexTS_sina_ResultSet["ResultSet"];
  const SearchResultSetItem = ___sinaNexTS_sina_SearchResultSetItem["SearchResultSetItem"];
  const SearchResultSetItemAttributeBase = ___sinaNexTS_sina_SearchResultSetItemAttributeBase["SearchResultSetItemAttributeBase"]; // interface EventData {
  //     type: UserEventType;
  //     targetUrl: string;
  //     positionInList: number;
  //     executionId: string;
  // }
  function assembleResultData(resultSetItem, model) {
    if (!resultSetItem) {
      return {
        executionId: "-1",
        positionInList: -1,
        dataSourceKey: "-1",
        searchTerm: "-1"
      };
    }
    const resultSet = resultSetItem.parent;
    if (!(resultSet instanceof ResultSet)) {
      return {
        executionId: "-1",
        positionInList: -1,
        dataSourceKey: "-1",
        searchTerm: "-1"
      };
    }
    return {
      executionId: resultSet.id,
      positionInList: resultSet?.items.indexOf(resultSetItem),
      dataSourceKey: model.getDataSource().id,
      searchTerm: model.getSearchBoxTerm()
    };
  }
  function assembleEventData(navigationTarget, model) {
    const parent = navigationTarget.parent;

    // check for nav target on result set attribute
    if (parent instanceof SearchResultSetItemAttributeBase) {
      return Object.assign({
        type: UserEventType.RESULT_LIST_ITEM_ATTRIBUTE_NAVIGATE,
        targetUrl: navigationTarget.targetUrl
      }, assembleResultData(parent.parent, model));
    }

    // check for nav target on object suggestion
    if (parent instanceof SearchResultSetItem && parent.parent instanceof ObjectSuggestion) {
      return Object.assign({
        type: UserEventType.OBJECT_SUGGESTION_NAVIGATE,
        targetUrl: navigationTarget.targetUrl
      }, assembleResultData(parent.parent, model));
    }

    // check for nav target on result set item
    if (parent instanceof SearchResultSetItem) {
      const type = parent.defaultNavigationTarget === navigationTarget ? UserEventType.RESULT_LIST_ITEM_NAVIGATE : UserEventType.RESULT_LIST_ITEM_NAVIGATE_CONTEXT;
      return Object.assign({
        type: type,
        targetUrl: navigationTarget.targetUrl
      }, assembleResultData(parent, model));
    }

    // fallback
    return {
      type: UserEventType.ITEM_NAVIGATE,
      targetUrl: navigationTarget.targetUrl,
      executionId: "",
      positionInList: -1,
      dataSourceKey: model.getDataSource().id,
      searchTerm: model.getSearchBoxTerm()
    };
  }
  function generateEventLoggerNavigationTracker(model) {
    return navigationTarget => {
      const eventData = assembleEventData(navigationTarget, model);
      model.eventLogger.logEvent(eventData);
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.generateEventLoggerNavigationTracker = generateEventLoggerNavigationTracker;
  return __exports;
});
//# sourceMappingURL=EventLoggerNavigationTracker-dbg.js.map
