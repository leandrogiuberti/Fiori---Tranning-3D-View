/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export class TreeCache {
    data: { [id: string]: unknown };
    active: boolean;
    constructor() {
        this.data = {};
        this.active = false;
    }
    activate() {
        this.active = true;
    }
    deActivate() {
        this.clear();
        this.active = false;
    }
    set(key: string, value: unknown) {
        if (!this.active) {
            return;
        }
        this.data[key] = value;
    }
    get(key: string): unknown {
        if (!this.active) {
            return undefined;
        }
        return this.data[key];
    }
    clear() {
        this.data = {};
    }
}
