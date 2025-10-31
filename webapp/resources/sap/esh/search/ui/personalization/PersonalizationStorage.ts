/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "../SearchModel";
import Personalizer from "./Personalizer";

export interface IKeyValueStore {
    isStorageOfPersonalDataAllowed(context: { searchModel: SearchModel }): boolean;

    save(context: { searchModel: SearchModel }): Promise<unknown>;

    /**
     * Remove item with given key from storage.
     * @param key Key to search for data in the storage
     * @returns void
     */
    deleteItem(key: string, context: { searchModel: SearchModel }): void;

    /**
     * Return item with given key from storage if found.
     * @param key the key to search for data in the storage
     * @returns the data if found or otherwise null
     */
    getItem(key: string, context: { searchModel: SearchModel }): unknown;

    /**
     * Add item with given key and data to the storage.
     * @param key Key for to access the data later on
     * @param data Data to store
     * @returns true if save was successful, otherwise false
     */
    setItem(key: string, data: unknown, context: { searchModel: SearchModel }): boolean;
}

interface IPersonalizationStorage {
    saveNotDelayed(): Promise<void>;
    getPersonalizer(key: string): Personalizer;
}

export default class PersonalizationStorage implements IPersonalizationStorage {
    constructor(
        readonly keyValueStore: IKeyValueStore,
        readonly searchModel: SearchModel,
        readonly prefix = "default"
    ) {}

    isStorageOfPersonalDataAllowed(): boolean {
        return this.keyValueStore.isStorageOfPersonalDataAllowed({ searchModel: this.searchModel });
    }

    saveNotDelayed(): Promise<void> {
        return Promise.resolve();
    }

    save(): Promise<unknown> {
        return this.keyValueStore.save({ searchModel: this.searchModel });
    }

    getPersonalizer(key: string): Personalizer {
        return new Personalizer(key, this);
    }

    deleteItem(key: string): void {
        this.keyValueStore.deleteItem(key, { searchModel: this.searchModel });
    }

    getItem(key: string): unknown {
        return this.keyValueStore.getItem(key, { searchModel: this.searchModel });
    }

    setItem(key: string, data: unknown): boolean {
        return this.keyValueStore.setItem(key, data, { searchModel: this.searchModel });
    }
}
