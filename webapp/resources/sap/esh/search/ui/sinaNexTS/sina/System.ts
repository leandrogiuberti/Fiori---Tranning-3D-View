/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export interface SystemProperties {
    id: string; // for example "XYZ.100"
    label: string; // for example "XYZ 100"
}

export class System {
    private readonly _id: string;
    private readonly _label: string;

    constructor(system: SystemProperties) {
        this._id = system.id;
        this._label = system.label;
    }

    public get id(): string {
        return this._id;
    }

    public get label(): string {
        return this._label;
    }

    public equals(system: System) {
        return this?._id === system?.id && this?._label === system?.label;
    }
}
