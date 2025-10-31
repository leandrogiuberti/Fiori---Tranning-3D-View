declare module "sap/esh/search/ui/personalization/PersonalizationStorage" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import Personalizer from "sap/esh/search/ui/personalization/Personalizer";
    interface IKeyValueStore {
        isStorageOfPersonalDataAllowed(context: {
            searchModel: SearchModel;
        }): boolean;
        save(context: {
            searchModel: SearchModel;
        }): Promise<unknown>;
        /**
         * Remove item with given key from storage.
         * @param key Key to search for data in the storage
         * @returns void
         */
        deleteItem(key: string, context: {
            searchModel: SearchModel;
        }): void;
        /**
         * Return item with given key from storage if found.
         * @param key the key to search for data in the storage
         * @returns the data if found or otherwise null
         */
        getItem(key: string, context: {
            searchModel: SearchModel;
        }): unknown;
        /**
         * Add item with given key and data to the storage.
         * @param key Key for to access the data later on
         * @param data Data to store
         * @returns true if save was successful, otherwise false
         */
        setItem(key: string, data: unknown, context: {
            searchModel: SearchModel;
        }): boolean;
    }
    interface IPersonalizationStorage {
        saveNotDelayed(): Promise<void>;
        getPersonalizer(key: string): Personalizer;
    }
    export default class PersonalizationStorage implements IPersonalizationStorage {
        readonly keyValueStore: IKeyValueStore;
        readonly searchModel: SearchModel;
        readonly prefix: string;
        constructor(keyValueStore: IKeyValueStore, searchModel: SearchModel, prefix?: string);
        isStorageOfPersonalDataAllowed(): boolean;
        saveNotDelayed(): Promise<void>;
        save(): Promise<unknown>;
        getPersonalizer(key: string): Personalizer;
        deleteItem(key: string): void;
        getItem(key: string): unknown;
        setItem(key: string, data: unknown): boolean;
    }
}
//# sourceMappingURL=PersonalizationStorage.d.ts.map