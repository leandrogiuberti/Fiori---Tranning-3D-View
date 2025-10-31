declare module "sap/esh/search/ui/controls/TypeGuardForControls" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ManagedObject from "sap/ui/base/ManagedObject";
    import Control from "sap/ui/core/Control";
    import RenderManager from "sap/ui/core/RenderManager";
    function isManagedObject(managedObject: unknown): managedObject is ManagedObject;
    function isControl(control: ManagedObject): control is Control;
    function typesafeRender(control: void | ManagedObject | Array<ManagedObject>, oRm: RenderManager): void;
}
//# sourceMappingURL=TypeGuardForControls.d.ts.map