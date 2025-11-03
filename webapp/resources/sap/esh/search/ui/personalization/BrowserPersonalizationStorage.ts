/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Storage from "sap/ui/util/Storage";
import { IKeyValueStore } from "./PersonalizationStorage";
import { ESHUIError } from "../error/errors";
import Log from "sap/base/Log";

export default class BrowserPersonalizationStorage implements IKeyValueStore {
    static async create(prefix: string): Promise<BrowserPersonalizationStorage> {
        return Promise.resolve(new BrowserPersonalizationStorage(prefix));
    }

    private storage: Storage;
    private _oLogger = Log.getLogger("sap.esh.search.ui.personalization.BrowserPersonalizationStorage");

    constructor(
        private prefix = "default",
        type: "local" | "session" = "local"
    ) {
        this.prefix = prefix + ".Search.Personalization.";
        this._oLogger.debug("Using BrowserPersonalizationStorage with prefix: " + this.prefix);
        this.storage = new Storage(type);
        if (!this.storage.isSupported()) {
            throw new Error(`Storage of type ${type} is not supported by UI5 in this environment`);
        }
    }
    isStorageOfPersonalDataAllowed(): boolean {
        return true;
    }

    save(): Promise<unknown> {
        return Promise.resolve();
    }

    getItem(key: string): unknown {
        this._oLogger.debug("getItem: " + this.prefix + key);
        return this.storage.get(this.prefix + key);
    }

    setItem(key: string, data: unknown): boolean {
        this._oLogger.debug("setItem: " + this.prefix + key);
        // officially this store only accepts data which can be serialized using JSON.stringify, see
        // https://sapui5.hana.ondemand.com/#/api/module:sap/ui/util/Storage
        try {
            JSON.stringify(data);
            return this.storage.put(this.prefix + key, data as string);
        } catch (err) {
            const serializationError = new ESHUIError("data with key '" + key + "' is not serializable");
            serializationError.previous = err;
            this._oLogger.error(serializationError.message);
        }
    }

    deleteItem(key: string): void {
        this._oLogger.debug("deleteItem: " + this.prefix + key);
        this.storage.remove(this.prefix + key);
    }
}
