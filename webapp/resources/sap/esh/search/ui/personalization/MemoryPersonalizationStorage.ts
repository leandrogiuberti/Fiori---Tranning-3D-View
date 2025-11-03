/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { IKeyValueStore } from "./PersonalizationStorage";

export default class MemoryPersonalizationStorage implements IKeyValueStore {
    static async create(): Promise<MemoryPersonalizationStorage> {
        return Promise.resolve(new MemoryPersonalizationStorage());
    }

    private dataMap: Record<string, unknown>;

    constructor() {
        this.dataMap = {};
    }
    isStorageOfPersonalDataAllowed(): boolean {
        return true;
    }

    save(): Promise<unknown> {
        return Promise.resolve();
    }

    getItem(key: string): unknown {
        return this.dataMap[key];
    }

    setItem(key: string, data: unknown): boolean {
        this.dataMap[key] = data;
        return true;
    }

    deleteItem(key: string): void {
        delete this.dataMap[key];
    }
}
