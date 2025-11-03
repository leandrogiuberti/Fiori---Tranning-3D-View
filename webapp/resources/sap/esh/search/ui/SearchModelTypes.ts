/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import MessageType from "sap/ui/core/message/MessageType";
import { DataSource } from "./sinaNexTS/sina/DataSource";
import { Filter } from "./sinaNexTS/sina/Filter";

export interface OrderBy {
    orderBy: string;
    sortOrder: "ASC" | "DESC";
}

export interface UrlParameters {
    datasource?: string; // inav2 format
    searchterm?: string; // only for passing searchterms from external app to search app, not used by search app
    top?: string;
    filter?: string;
    orderby?: string; // for historical reason no camelcase in url
    sortorder?: "ASC" | "DESC"; // for historical reason no camelcase in url
}

export interface ListItem {
    type: ListItemType;
}

export enum ListItemType {
    footer = "footer",
    appcontainer = "appcontainer",
    resultListItem = "resultListItem",
}

export type DataSourcesFilterFunction = (dataSources: Array<DataSource>) => Array<DataSource>;

export interface SearchQueryParameters {
    filter: Filter;
    top?: number;
    orderBy?: OrderBy;
}

export interface SearchNavigationTargetParameters extends SearchQueryParameters {
    label?: string;
    encodeFilter?: boolean;
    updateUrl?: boolean;
}

export interface Message {
    type: MessageType;
    name: string;
    message: string;
    details?: string;
    solution?: string;
}
