/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Sina } from "./Sina";

export interface SinaObjectProperties {
    sina?: Sina; // not optional for instances which are not created via the sina object factory
    /**
     * @deprecated use native private properties instead
     */
    _private?: Record<string, unknown>; // used for not public visible data
}

export class SinaObject {
    sina?: Sina;
    /**
     * @deprecated use native private properties instead
     */
    _private: Record<string, unknown> = {};

    constructor(properties: SinaObjectProperties = {}) {
        this.sina = properties.sina ?? this.sina;
        this._private = properties._private ?? this._private;
    }

    getSina(): Sina {
        return this.sina;
    }
}
