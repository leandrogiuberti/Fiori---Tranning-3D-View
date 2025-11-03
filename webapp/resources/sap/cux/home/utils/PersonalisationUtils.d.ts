declare module "sap/cux/home/utils/PersonalisationUtils" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import ManagedObject from "sap/ui/base/ManagedObject";
    import BaseObject from "sap/ui/base/Object";
    import UIComponent from "sap/ui/core/UIComponent";
    const defaultContainerId = "sap.cux";
    /**
     *
     * Provides the util methods used for UshellPersonalizer.
     *
     * @extends sap.ui.BaseObject
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.122.0
     * @private
     *
     * @alias sap.cux.home.utils.PersonalisationUtils
     */
    class PersonalisationUtils extends BaseObject {
        private persContainerId;
        constructor();
        getPersContainerId(oManagedObject: ManagedObject, bNewId?: boolean): string;
        setPersContainerId(persContainerId: string): void;
        getOwnerComponent(oManagedObject: ManagedObject): UIComponent | undefined;
    }
    const _default: PersonalisationUtils;
    export default _default;
}
//# sourceMappingURL=PersonalisationUtils.d.ts.map