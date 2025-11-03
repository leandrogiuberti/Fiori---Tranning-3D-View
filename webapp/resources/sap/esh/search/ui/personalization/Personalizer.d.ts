declare module "sap/esh/search/ui/personalization/Personalizer" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import PersonalizationStorage from "sap/esh/search/ui/personalization/PersonalizationStorage";
    export default class Personalizer {
        readonly key: string;
        readonly personalizationStorageInstance: PersonalizationStorage;
        constructor(key: string, personalizationStorageInstance: PersonalizationStorage);
        getKey(): string;
        setPersData(data: unknown): JQueryDeferred<unknown>;
        getPersData(): JQueryDeferred<unknown>;
        getResetPersData(): JQueryDeferred<unknown>;
    }
}
//# sourceMappingURL=Personalizer.d.ts.map