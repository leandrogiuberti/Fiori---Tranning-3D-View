declare module "sap/cux/home/SideBySideIconTabFilter" {
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import BasePanel from "sap/cux/home/BasePanel";
import { $IconTabFilterSettings } from "sap/m/IconTabFilter";

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $SideBySideIconTabFilterSettings extends $IconTabFilterSettings {
        panel?: BasePanel | string;
    }

    export default interface SideBySideIconTabFilter {

        // association: panel

        /**
         * ID of the element which is the current target of the association "panel", or "null".
         */
        getPanel(): string;

        /**
         * Sets the associated panel.
         *
         * @param panel ID of an element which becomes the new target of this "panel" association; alternatively, an element instance may be given
         * @returns Reference to "this" in order to allow method chaining
         */
        setPanel(panel?: string | BasePanel): this;
    }
}
