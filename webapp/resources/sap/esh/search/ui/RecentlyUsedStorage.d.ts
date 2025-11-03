declare module "sap/esh/search/ui/RecentlyUsedStorage" {
    import PersonalizationStorage from "sap/esh/search/ui/personalization/PersonalizationStorage";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Type } from "sap/esh/search/ui/suggestions/SuggestionType";
    import { NavigationTarget, NavigationTargetJson } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    enum StorageVersion {
        V2 = 2
    }
    const objectSuggestionCopyProperties: string[];
    const searchSuggestionCopyProperties: string[];
    const transactionSuggestionsCopyProperties: string[];
    interface RecentItem {
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
        position?: number;
        isRecentEntry?: boolean;
        filter?: Filter;
    }
    interface RecentItemInStorage {
        label?: string;
        label1?: string;
        label2?: string;
        icon?: string;
        uiSuggestionType?: Type;
        imageUrl?: string;
        imageExists?: true;
        imageIsCircular?: string;
        titleNavigation?: NavigationTargetJson;
        dataSource?: string;
        key: string;
        version?: StorageVersion;
    }
    export default class RecentlyUsedStorage {
        private personalizationStorage;
        private _oLogger;
        private maxItems;
        private readonly key;
        private readonly searchModel;
        constructor(properties: {
            personalizationStorage: PersonalizationStorage;
            maxItems?: number;
            searchModel: SearchModel;
        });
        deleteAllItems(): Promise<unknown>;
        private getSerializedItemsInternal;
        getItems(): Array<RecentItem>;
        private copyProperties;
        private deSerialize;
        private serialize;
        private serializeSearchNavigationTarget;
        private deSerializeSearchNavigationTarget;
        /**
         * Adds a search to the recent store. Item at index 0 is newest entry. If item is omitted, the current search will be saved.
         **/
        addItem(item: RecentItem): void;
    }
}
//# sourceMappingURL=RecentlyUsedStorage.d.ts.map