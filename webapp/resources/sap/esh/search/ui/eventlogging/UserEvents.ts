/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Type as SuggestionType } from "../suggestions/SuggestionType";
import { Event } from "./EventBase";

export enum UserEventType {
    SUGGESTION_SELECT = "SUGGESTION_SELECT",
    SUGGESTION_REQUEST = "SUGGESTION_REQUEST",
    TILE_NAVIGATE = "TILE_NAVIGATE",
    SHOW_MORE = "SHOW_MORE",
    ITEM_NAVIGATE = "ITEM_NAVIGATE",
    RESULT_LIST_ITEM_NAVIGATE = "RESULT_LIST_ITEM_NAVIGATE",
    RESULT_LIST_ITEM_NAVIGATE_CONTEXT = "RESULT_LIST_ITEM_NAVIGATE_CONTEXT",
    RESULT_LIST_ITEM_ATTRIBUTE_NAVIGATE = "RESULT_LIST_ITEM_ATTRIBUTE_NAVIGATE",
    OBJECT_SUGGESTION_NAVIGATE = "OBJECT_SUGGESTION_NAVIGATE",
    DROPDOWN_SELECT_DS = "DROPDOWN_SELECT_DS",
    FACET_FILTER_ADD = "FACET_FILTER_ADD",
    FACET_FILTER_DEL = "FACET_FILTER_DEL",
    ITEM_SHOW_DETAILS = "ITEM_SHOW_DETAILS",
    ITEM_HIDE_DETAILS = "ITEM_HIDE_DETAILS",
    CLEAR_ALL_FILTERS = "CLEAR_ALL_FILTERS",
    FACET_SHOW_MORE = "FACET_SHOW_MORE",
    FACET_SHOW_MORE_CLOSE = "FACET_SHOW_MORE_CLOSE",
    FACETS_SHOW = "FACETS_SHOW",
    FACETS_HIDE = "FACETS_HIDE",
    QUICK_SELECT_SWITCH = "QUICK_SELECT_SWITCH",
    RESULT_VIEW_SWITCH = "RESULT_VIEW_SWITCH",
    STATIC_FACET_SELECT = "STATIC_FACET_SELECT",
    TABLE_CONFIG_OPEN = "TABLE_CONFIG_OPEN",
}

export type AllUserEvents =
    | SuggestionSelectEvent
    | SuggestionRequestEvent
    | TileNavigateEvent
    | ShowMoreEvent
    | ItemNavigateEvent
    | ResultListItemNavigateEvent
    | ResultListItemNavigateContextEvent
    | ResultListItemAttributeNavigateEvent
    | ObjectSuggestionNavigateEvent
    | DropdownSelectDsEvent
    | FacetFilterAddEvent
    | FacetFilterDelEvent
    | ItemShowDetailsEvent
    | ItemHideDetailsEvent
    | ClearAllFiltersEvent
    | FacetShowMoreEvent
    | FacetShowMoreCloseEvent
    | FacetsShowEvent
    | FacetsHideEvent
    | QuickSelectSwitchEvent
    | ResultViewSwitchEvent
    | StaticFacetSelectEvent
    | TableConfigOpenEvent;

export interface SuggestionSelectEvent extends Event {
    type: UserEventType.SUGGESTION_SELECT;
    suggestionType: SuggestionType;
    suggestionTerm: string;
    suggestionTitle?: string; // only for apps
    searchTerm: string;
    targetUrl?: string;
    dataSourceKey: string;
}

export interface SuggestionRequestEvent extends Event {
    type: UserEventType.SUGGESTION_REQUEST;
    suggestionTerm: string;
    dataSourceKey: string;
}
export interface TileNavigateEvent extends Event {
    type: UserEventType.TILE_NAVIGATE;
    tileTitle: string;
    targetUrl: string;
}
export interface ShowMoreEvent extends Event {
    type: UserEventType.SHOW_MORE;
}

export interface ItemNavigateEvent extends Event {
    type: UserEventType.ITEM_NAVIGATE;
    targetUrl: string;
    executionId: string;
    positionInList: number;
    dataSourceKey: string;
    searchTerm: string;
}

export interface ResultListItemNavigateEvent extends Event {
    type: UserEventType.RESULT_LIST_ITEM_NAVIGATE;
    itemPosition: number;
    targetUrl: string;
    dataSourceKey: string;
    searchTerm: string;
}

export interface ResultListItemNavigateContextEvent extends Event {
    type: UserEventType.RESULT_LIST_ITEM_NAVIGATE_CONTEXT;
    targetUrl: string;
}

export interface ResultListItemAttributeNavigateEvent extends Event {
    type: UserEventType.RESULT_LIST_ITEM_ATTRIBUTE_NAVIGATE;
    targetUrl: string;
    dataSourceKey: string;
    searchTerm: string;
}

export interface ObjectSuggestionNavigateEvent extends Event {
    type: UserEventType.OBJECT_SUGGESTION_NAVIGATE;
    dataSourceKey: string;
    searchTerm: string;
    targetUrl: string;
}

export interface DropdownSelectDsEvent extends Event {
    type: UserEventType.DROPDOWN_SELECT_DS;
    dataSourceKey: string;
    dataSourceKeyOld: string;
}

export interface FacetFilterAddEvent extends Event {
    type: UserEventType.FACET_FILTER_ADD;
    referencedAttribute: string;
    clickedValue: string;
    clickedLabel: string;
    clickedPosition: number;
    dataSourceKey: string;
}

export interface FacetFilterDelEvent extends Event {
    type: UserEventType.FACET_FILTER_DEL;
    referencedAttribute: string;
    clickedValue: string;
    clickedLabel: string;
    clickedPosition: number;
    dataSourceKey: string;
}

export interface ItemShowDetailsEvent extends Event {
    type: UserEventType.ITEM_SHOW_DETAILS;
    itemPosition: number;
    dataSourceKey: string;
}

export interface ItemHideDetailsEvent extends Event {
    type: UserEventType.ITEM_HIDE_DETAILS;
    itemPosition: number;
    executionId: string;
    dataSourceKey: string;
}

export interface ClearAllFiltersEvent extends Event {
    type: UserEventType.CLEAR_ALL_FILTERS;
    dataSourceKey: string;
}

export interface FacetShowMoreEvent extends Event {
    type: UserEventType.FACET_SHOW_MORE;
    referencedAttribute: string;
    dataSourceKey: string;
}

export interface FacetShowMoreCloseEvent extends Event {
    type: UserEventType.FACET_SHOW_MORE_CLOSE;
    dataSourceKey: string;
}

export interface FacetsShowEvent extends Event {
    type: UserEventType.FACETS_SHOW;
    dataSourceKey: string;
}

export interface FacetsHideEvent extends Event {
    type: UserEventType.FACETS_HIDE;
    dataSourceKey: string;
}

export interface QuickSelectSwitchEvent extends Event {
    type: UserEventType.QUICK_SELECT_SWITCH;
    dataSourceKey: string;
}

export interface ResultViewSwitchEvent extends Event {
    type: UserEventType.RESULT_VIEW_SWITCH;
    resultViewType: string;
}
export interface StaticFacetSelectEvent extends Event {
    type: UserEventType.STATIC_FACET_SELECT;
    clickedValue: string;
    clickedLabel: string;
    clickedPosition: number;
    dataSourceKey: string;
}

export interface TableConfigOpenEvent extends Event {
    type: UserEventType.TABLE_CONFIG_OPEN;
    dataSourceKey: string;
}
