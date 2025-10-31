declare module "sap/cux/home/SpacePanel" {
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $BaseAppPersPanelSettings } from "sap/cux/home/BaseAppPersPanel";

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $SpacePanelSettings extends $BaseAppPersPanelSettings {

        /**
         * Specifies the space whose apps should be loaded.
         */
        spaceId?: string | PropertyBindingInfo;

        /**
         * Title for the tiles panel
         */
        title?: string | PropertyBindingInfo;
    }

    export default interface SpacePanel {

        // property: spaceId

        /**
         * Gets current value of property "spaceId".
         *
         * Specifies the space whose apps should be loaded.
         *
         * Default value is: ""
         * @returns Value of property "spaceId"
         */
        getSpaceId(): string;

        /**
         * Sets a new value for property "spaceId".
         *
         * Specifies the space whose apps should be loaded.
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [spaceId=""] New value for property "spaceId"
         * @returns Reference to "this" in order to allow method chaining
         */
        setSpaceId(spaceId: string): this;

        // property: title

        /**
         * Gets current value of property "title".
         *
         * Title for the tiles panel
         *
         * Default value is: ""
         * @returns Value of property "title"
         */
        getTitle(): string;

        /**
         * Sets a new value for property "title".
         *
         * Title for the tiles panel
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [title=""] New value for property "title"
         * @returns Reference to "this" in order to allow method chaining
         */
        setTitle(title: string): this;
    }
}
