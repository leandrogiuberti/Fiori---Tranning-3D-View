/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// read and write recently used data into personalization storage

import Log, { Logger } from "sap/base/Log";
import PersonalizationStorage from "./personalization/PersonalizationStorage";
import SearchModel from "./SearchModel";
import { DataSource } from "./sinaNexTS/sina/DataSource";
import { Type, SuggestionType, RecentEntriesPosition } from "./suggestions/SuggestionType";
import { NavigationTarget, NavigationTargetJson } from "./sinaNexTS/sina/NavigationTarget";
import { Filter } from "./sinaNexTS/sina/Filter";
import { PersonalizationKeys } from "./personalization/PersonalizationKeys";

enum StorageVersion {
    V2 = 2,
}

const objectSuggestionCopyProperties = [
    "uiSuggestionType",
    "label",
    "label1",
    "label2",
    "imageUrl",
    "imageIsCircular",
    "imageExists",
];

const searchSuggestionCopyProperties = ["uiSuggestionType", "label", "icon", "filterIcon"];

const transactionSuggestionsCopyProperties = ["uiSuggestionType", "label", "url", "icon", "searchTerm"];

export interface RecentItem {
    label: string;
    label1?: string;
    label2?: string;
    icon?: string;
    uiSuggestionType?: Type;
    imageUrl?: string;
    imageExists?: true;
    imageIsCircular?: boolean;
    titleNavigation?: NavigationTarget;
    dataSource?: DataSource;
    // --
    position?: number;
    isRecentEntry?: boolean;
    filter?: Filter;
}

export interface RecentItemInStorage {
    label?: string;
    label1?: string;
    label2?: string;
    icon?: string;
    uiSuggestionType?: Type;
    imageUrl?: string;
    imageExists?: true;
    imageIsCircular?: string;
    titleNavigation?: NavigationTargetJson;
    // --
    dataSource?: string;
    key: string;
    version?: StorageVersion;
}

export default class RecentlyUsedStorage {
    private personalizationStorage: PersonalizationStorage;
    private _oLogger: Logger;
    private maxItems;
    private readonly key = PersonalizationKeys.recentSearches;
    private readonly searchModel: SearchModel;

    constructor(properties: {
        personalizationStorage: PersonalizationStorage;
        maxItems?: number;
        searchModel: SearchModel;
    }) {
        this.personalizationStorage = properties.personalizationStorage;
        this._oLogger = Log.getLogger("sap.esh.search.ui.RecentlyUsedStorage");
        this.maxItems = properties.maxItems || 10;
        this.searchModel = properties.searchModel;
    }

    public async deleteAllItems(): Promise<unknown> {
        this.personalizationStorage.deleteItem(this.key);
        return this.personalizationStorage.save();
    }

    private getSerializedItemsInternal(): Array<RecentItemInStorage> {
        const serializedItems =
            (this.personalizationStorage.getItem(this.key) as Array<RecentItemInStorage>) ?? [];
        return serializedItems.filter((item: RecentItemInStorage) => item.version >= StorageVersion.V2);
    }

    public getItems(): Array<RecentItem> {
        const currentFilter = this.searchModel?.query?.filter;
        return this.getSerializedItemsInternal()
            .map((serializedItem) => this.deSerialize(serializedItem))
            .filter((item: RecentItem) => {
                if (item.uiSuggestionType === Type.Search && item.filter.equals(currentFilter)) {
                    return false;
                }
                return true;
            });
    }

    private copyProperties(target: object, source: object, properties: Array<string>) {
        for (const property of properties) {
            target[property] = source[property];
        }
    }

    private deSerialize(serializedItem: RecentItemInStorage): RecentItem {
        const item: RecentItem = { label: "" };
        let tmpResult;
        switch (serializedItem.uiSuggestionType) {
            case SuggestionType.Object:
                this.copyProperties(item, serializedItem, objectSuggestionCopyProperties);
                item.titleNavigation = this.searchModel.sinaNext.parseNavigationTargetFromJson(
                    serializedItem.titleNavigation
                );
                item.dataSource = this.searchModel.sinaNext.getDataSource(serializedItem.dataSource);
                break;
            case SuggestionType.Search:
                this.copyProperties(item, serializedItem, searchSuggestionCopyProperties);
                tmpResult = this.deSerializeSearchNavigationTarget(serializedItem.titleNavigation);
                item.titleNavigation = tmpResult.navigationTarget;
                item.filter = tmpResult.filter;
                break;
            case SuggestionType.Transaction:
                this.copyProperties(item, serializedItem, transactionSuggestionsCopyProperties);
                break;
        }
        item.position = RecentEntriesPosition;
        item.isRecentEntry = true;
        return item;
    }

    private serialize(item: RecentItem): RecentItemInStorage {
        const serializedRecentItem: RecentItemInStorage = { key: "" };
        switch (item.uiSuggestionType) {
            case SuggestionType.Object:
                this.copyProperties(serializedRecentItem, item, objectSuggestionCopyProperties);
                serializedRecentItem.titleNavigation = item.titleNavigation.toJson();
                serializedRecentItem.dataSource = item.dataSource.id;
                serializedRecentItem.key = item.uiSuggestionType + "/" + item.label1 + "/" + item.label2;
                break;
            case SuggestionType.Search:
                this.copyProperties(serializedRecentItem, item, searchSuggestionCopyProperties);
                serializedRecentItem.titleNavigation = this.serializeSearchNavigationTarget(
                    item.titleNavigation
                );
                serializedRecentItem.key = item.uiSuggestionType + "/" + item.label;
                break;
            case SuggestionType.Transaction:
                this.copyProperties(serializedRecentItem, item, transactionSuggestionsCopyProperties);
                serializedRecentItem.key = item.uiSuggestionType + "/" + item.label;
                break;
        }
        serializedRecentItem.version = StorageVersion.V2;
        return serializedRecentItem;
    }

    private serializeSearchNavigationTarget(searchNavigationTarget: NavigationTarget): NavigationTargetJson {
        // parse navigation target
        const navigationTargetParamters =
            this.searchModel.parseSearchNavigationTarget(searchNavigationTarget);
        // recreate navigation target with forced updateUrl=true
        return this.searchModel
            .createSearchNavigationTarget(Object.assign(navigationTargetParamters, { updateUrl: true }))
            .toJson();
    }

    private deSerializeSearchNavigationTarget(navigationTargetJson: NavigationTargetJson): {
        filter: Filter;
        navigationTarget: NavigationTarget;
    } {
        // json -> navigation target
        const searchNavigationTarget =
            this.searchModel.sinaNext.parseNavigationTargetFromJson(navigationTargetJson);
        // parse navigation target
        const navigationTargetParameters =
            this.searchModel.parseSearchNavigationTarget(searchNavigationTarget);
        // recreate navigation target (this evaluates model.config.updateUrl and create a url based or target function based navigation target)
        return {
            filter: navigationTargetParameters.filter,
            navigationTarget: this.searchModel.createSearchNavigationTarget(navigationTargetParameters),
        };
    }

    /**
     * Adds a search to the recent store. Item at index 0 is newest entry. If item is omitted, the current search will be saved.
     **/
    public addItem(item: RecentItem): void {
        // check storage enabled
        if (!this.personalizationStorage.isStorageOfPersonalDataAllowed()) return;

        // serialize item
        const serializedItem = this.serialize(item);

        // remove existing items (with identical key)
        const serializedItems = this.getSerializedItemsInternal();
        serializedItems.some((item: RecentItemInStorage, index, items) => {
            if (item.key === serializedItem.key) {
                this._oLogger.debug(
                    "Removing already existing item " + serializedItem.key + " at pos " + index
                );
                items.splice(index, 1);
                return true;
            }
        });

        // remove oldest item if limit reached
        if (serializedItems.length >= this.maxItems) {
            const oldest = serializedItems.pop();
            this._oLogger.debug("Removing oldest item " + oldest.key);
        }

        // add new item
        this._oLogger.debug("Adding item " + serializedItem.key);
        serializedItems.unshift(serializedItem);
        this.personalizationStorage.setItem(this.key, serializedItems);
    }
}
