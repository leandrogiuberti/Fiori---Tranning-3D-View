/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";

export function isManagedObject(managedObject: unknown): managedObject is ManagedObject {
    return managedObject instanceof ManagedObject;
}

export function isControl(control: ManagedObject): control is Control {
    return control instanceof Control;
}

export function typesafeRender(
    control: void | ManagedObject | Array<ManagedObject>,
    oRm: RenderManager
): void {
    if (control) {
        if (isManagedObject(control)) {
            if (isControl(control)) {
                oRm.renderControl(control);
            }
        } else {
            for (const child of control) {
                if (isControl(child)) {
                    oRm.renderControl(child);
                }
            }
        }
    }
}
