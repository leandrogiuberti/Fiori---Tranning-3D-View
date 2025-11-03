/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import BrowserPersonalizationStorage from "./BrowserPersonalizationStorage";
import FLPPersonalizationStorage from "./FLPPersonalizationStorage";
import MemoryPersonalizationStorage from "./MemoryPersonalizationStorage";
import { IKeyValueStore } from "./PersonalizationStorage";

async function create(
    personalizationStorage: "auto" | "browser" | "flp" | "memory" | IKeyValueStore,
    isUshell: boolean,
    prefix: string
): Promise<IKeyValueStore> {
    if (typeof personalizationStorage === "object") {
        return personalizationStorage;
    }
    switch (personalizationStorage) {
        case "auto":
            if (isUshell) {
                return FLPPersonalizationStorage.create();
            } else {
                return BrowserPersonalizationStorage.create(prefix);
            }
        case "browser":
            return BrowserPersonalizationStorage.create(prefix);
        case "flp":
            return FLPPersonalizationStorage.create();
        case "memory":
            return MemoryPersonalizationStorage.create();
        default: {
            let personalizationStorageTypes = `    - 'auto' (automatic)\n    - 'browser' (browser storage)\n    - 'memory' (browser session storage)`;
            if (!isUshell) {
                personalizationStorageTypes += `\n    - 'flp' (Fiori Lauchpad, user storage service)`;
            }
            const errorText = `Unknown Personalization Storage: '${personalizationStorage}'\n\nDetails:\n${personalizationStorageTypes}\n\nYou can also provide a custom personalization storage (instance of a class, implementing the interface 'IKeyValueStore').`;
            return Promise.reject(new Error(errorText));
        }
    }
}

const module = { create: create };
export default module;
