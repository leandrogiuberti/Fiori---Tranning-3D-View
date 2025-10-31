/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Event } from "./EventBase";

export enum TechnicalEventType {
    SESSION_START = "SESSION_START",
    HASH_CHANGE = "HASH_CHANGE",
    DATASOURCE_CHANGE = "DATASOURCE_CHANGE",
    SEARCH_REQUEST = "SEARCH_REQUEST",
    SEARCH_WITH_FILTERS = "SEARCH_WITH_FILTERS",
    SEARCH_WITH_SEARCHTERM = "SEARCH_WITH_SEARCHTERM",
    SEARCH_WITH_SEARCHTERM_FILTERS = "SEARCH_WITH_SEARCHTERM_FILTERS",
    SEARCH_WITHOUT_SEARCHTERM_FILTERS = "SEARCH_WITHOUT_SEARCHTERM_FILTERS",
}

export type AllTechnicalEvents =
    | SessionStartEvent
    | HashChangeEvent
    | DataSourceChangeEvent
    | SearchRequestEvent;

export interface HashChangeEvent extends Event {
    type: TechnicalEventType.HASH_CHANGE;
    targetUrl?: string;
    sourceUrlArray?: Array<string>;
    systemAndClient?: {
        systemId: string;
        client: string;
    };
}

export interface SessionStartEvent extends Event {
    type: TechnicalEventType.SESSION_START;
    searchTerm: string;
    dataSourceKey: string;
    top: number;
    filter?: string;
}

export interface DataSourceChangeEvent extends Event {
    type: TechnicalEventType.DATASOURCE_CHANGE;
    dataSourceKey: string;
    dataSourceKeyOld: string;
}

export interface SearchRequestEvent extends Event {
    type:
        | TechnicalEventType.SEARCH_REQUEST
        | TechnicalEventType.SEARCH_WITH_FILTERS
        | TechnicalEventType.SEARCH_WITH_SEARCHTERM
        | TechnicalEventType.SEARCH_WITH_SEARCHTERM_FILTERS
        | TechnicalEventType.SEARCH_WITHOUT_SEARCHTERM_FILTERS;
    searchTerm: string;
    dataSourceKey: string;
    top: number;
    filter?: string;
}
