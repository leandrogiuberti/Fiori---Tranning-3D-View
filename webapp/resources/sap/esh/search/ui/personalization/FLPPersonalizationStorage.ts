/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ContextContainer from "sap/ushell/services/PersonalizationV2/ContextContainer";
import { IKeyValueStore } from "./PersonalizationStorage";
import Container from "sap/ushell/Container";
import PersonalizationV2 from "sap/ushell/services/PersonalizationV2";

export default class FLPPersonalizationStorage implements IKeyValueStore {
    static async create(): Promise<FLPPersonalizationStorage> {
        const service = (await Container.getServiceAsync("PersonalizationV2")) as PersonalizationV2;
        const container = await service.getContainer(
            "ushellSearchPersoServiceContainer",
            { validity: Infinity }, // store data forever
            null
        );
        return new FLPPersonalizationStorage(container);
    }

    private readonly eshIsStorageOfPersonalDataAllowedKey = "ESH-IsStorageOfPersonalDataAllowed";

    constructor(readonly container: ContextContainer) {}

    async deletePersonalData(): Promise<void> {
        //
    }

    setIsStorageOfPersonalDataAllowed(isAllowed: boolean): void {
        this.setItem(this.eshIsStorageOfPersonalDataAllowedKey, isAllowed);
    }

    isStorageOfPersonalDataAllowed(): boolean {
        const isAllowed = this.getItem(this.eshIsStorageOfPersonalDataAllowedKey);
        if (typeof isAllowed === "boolean") {
            return isAllowed;
        }
        return true;
    }

    save(): Promise<unknown> {
        return this.container.save(0);
    }

    getItem(key: string): unknown {
        key = this.limitLength(key);
        return this.container.getItemValue(key);
    }

    setItem(key: string, data: unknown): boolean {
        key = this.limitLength(key);
        const oldData = this.getItem(key);
        if (JSON.stringify(oldData) === JSON.stringify(data)) {
            return true;
        }
        this.container.setItemValue(key, data as object);
        this.save();
        return true;
    }

    deleteItem(key: string): void {
        this.container.deleteItem(key);
    }

    private limitLength(key: string): string {
        return key.slice(-40);
    }
}
