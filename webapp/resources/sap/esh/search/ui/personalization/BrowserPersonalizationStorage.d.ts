declare module "sap/esh/search/ui/personalization/BrowserPersonalizationStorage" {
    import { IKeyValueStore } from "sap/esh/search/ui/personalization/PersonalizationStorage";
    export default class BrowserPersonalizationStorage implements IKeyValueStore {
        private prefix;
        static create(prefix: string): Promise<BrowserPersonalizationStorage>;
        private storage;
        private _oLogger;
        constructor(prefix?: string, type?: "local" | "session");
        isStorageOfPersonalDataAllowed(): boolean;
        save(): Promise<unknown>;
        getItem(key: string): unknown;
        setItem(key: string, data: unknown): boolean;
        deleteItem(key: string): void;
    }
}
//# sourceMappingURL=BrowserPersonalizationStorage.d.ts.map