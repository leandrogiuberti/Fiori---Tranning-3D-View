/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import PersonalizationStorage from "./PersonalizationStorage";

export default class Personalizer {
    constructor(
        readonly key: string,
        readonly personalizationStorageInstance: PersonalizationStorage
    ) {
        this.key = key;
        this.personalizationStorageInstance = personalizationStorageInstance;
    }

    getKey(): string {
        return this.key;
    }

    setPersData(data: unknown): JQueryDeferred<unknown> {
        // sap.m.TablePersoController uses deferred.done()
        // NOT to convert to promise
        return jQuery.Deferred().resolve(this.personalizationStorageInstance.setItem(this.key, data));
    }

    getPersData(): JQueryDeferred<unknown> {
        // sap.m.TablePersoController uses deferred.done()
        // NOT to convert to promise
        return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key));
    }

    getResetPersData(): JQueryDeferred<unknown> {
        // sap.m.TablePersoController uses deferred.done()
        // NOT to convert to promise
        return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key + "INITIAL"));
    }
}
