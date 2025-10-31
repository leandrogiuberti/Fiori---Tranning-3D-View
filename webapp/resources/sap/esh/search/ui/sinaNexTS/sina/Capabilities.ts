/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";

export interface CapabilitiesOptions extends SinaObjectProperties {
    fuzzy?: boolean;
    nlq?: boolean;
    nlqEnabledInfoOnDataSource?: boolean;
}
export class Capabilities extends SinaObject {
    fuzzy = false;
    nlq = false;
    nlqEnabledInfoOnDataSource = false;

    constructor(properties?: CapabilitiesOptions) {
        super(properties);
        this.fuzzy = properties.fuzzy ?? false;
        this.nlq = properties.nlq ?? false;
        this.nlqEnabledInfoOnDataSource = properties.nlqEnabledInfoOnDataSource ?? false;
    }
}
