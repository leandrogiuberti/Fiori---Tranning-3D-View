declare module "sap/esh/search/ui/personalization/MemoryPersonalizationStorage" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { IKeyValueStore } from "sap/esh/search/ui/personalization/PersonalizationStorage";
    export default class MemoryPersonalizationStorage implements IKeyValueStore {
        static create(): Promise<MemoryPersonalizationStorage>;
        private dataMap;
        constructor();
        isStorageOfPersonalDataAllowed(): boolean;
        save(): Promise<unknown>;
        getItem(key: string): unknown;
        setItem(key: string, data: unknown): boolean;
        deleteItem(key: string): void;
    }
}
//# sourceMappingURL=MemoryPersonalizationStorage.d.ts.map