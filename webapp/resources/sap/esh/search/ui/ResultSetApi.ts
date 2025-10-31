/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Event from "sap/ui/base/Event";

/**
 * Result set
 */
export interface ResultSet {
    items: Array<ResultSetItem>;
}

/**
 * Result set item
 */
export interface ResultSetItem {
    key: string;
    data: ResultSetItemData;
    title: string;
    selected: boolean;
    setSelected: (select: boolean) => void;
    selectionEnabled: boolean;
    setSelectionEnabled: (enable: boolean) => void;
    customItemStyleClass: string;
    setCustomItemStyleClass: (customItemStyleClass: string) => void;
}

export interface ResultSetItemData {
    attributes: Array<ResultSetItemAttribute>;
    attributesMap: { [id: string]: ResultSetItemAttribute };
    dataSource: DataSource;
    defaultNavigationTarget: NavigationTarget;
    detailAttributes: Array<ResultSetItemAttribute>;
    navigationTargets: Array<NavigationTarget>;
    titleAttributes: Array<ResultSetItemAttribute>;
    titleDescriptionAttributes: Array<ResultSetItemAttribute>;
}

export interface ResultSetItemAttribute {
    defaultNavigationTarget: NavigationTarget;
    id: string;
    isHighlighted: boolean;
    metadata: AttributeMetadata;
    navigationTargets: Array<NavigationTarget>;
    value: string | number | boolean;
    valueFormatted: string;
    valueHighlighted: string;
}

export interface DataSource {
    id: string;
    label: string;
    labelPlural: string;
}

export interface NavigationTarget {
    text: string;
    tooltip: string;
    icon: string;
    target: string;
    targetUrl: string;
    targetFunction: (event: Event) => void;
    performNavigation: (obj: NavigationTarget) => void;
}

export interface AttributeMetadata {
    id: string;
    isKey: boolean;
    label: string;
    type: AttributeType;
    format: string;
}

export enum AttributeType {
    Double = "Double",
    Integer = "Integer",
    String = "String",
    ImageUrl = "ImageUrl",
    ImageBlob = "ImageBlob",
    Timestamp = "Timestamp",
}
