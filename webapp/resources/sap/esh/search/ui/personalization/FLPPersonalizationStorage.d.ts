declare module "sap/esh/search/ui/personalization/FLPPersonalizationStorage" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ContextContainer from "sap/ushell/services/PersonalizationV2/ContextContainer";
    import { IKeyValueStore } from "sap/esh/search/ui/personalization/PersonalizationStorage";
    export default class FLPPersonalizationStorage implements IKeyValueStore {
        readonly container: ContextContainer;
        static create(): Promise<FLPPersonalizationStorage>;
        private readonly eshIsStorageOfPersonalDataAllowedKey;
        constructor(container: ContextContainer);
        deletePersonalData(): Promise<void>;
        setIsStorageOfPersonalDataAllowed(isAllowed: boolean): void;
        isStorageOfPersonalDataAllowed(): boolean;
        save(): Promise<unknown>;
        getItem(key: string): unknown;
        setItem(key: string, data: unknown): boolean;
        deleteItem(key: string): void;
        private limitLength;
    }
}
//# sourceMappingURL=FLPPersonalizationStorage.d.ts.map