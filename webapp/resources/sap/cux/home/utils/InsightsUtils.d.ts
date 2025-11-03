declare module "sap/cux/home/utils/InsightsUtils" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Button from "sap/m/Button";
    import UI5Element from "sap/ui/core/Element";
    import { Intent } from "sap/ushell/services/AppLifeCycle";
    import MenuItem from "sap/cux/home/MenuItem";
    /**
     * Retrieves the associated full screen menu item.
     *
     * @returns {MenuItem} The associated full screen menu item.
     * @private
     */
    const getAssociatedFullScreenMenuItem: (control: UI5Element) => MenuItem;
    /**
     * Retrieves the associated full screen button.
     *
     * @returns {Button} The associated full screen button.
     * @private
     *
     */
    const getAssociatedFullScreenButton: (control: UI5Element) => Button;
    /**
     * Creates a "Show More" menu item.
     *
     * @private
     * @param {string} id - The ID of the menu item.
     * @param {string} [fesrId] - The FESR ID for the menu item.
     * @returns {MenuItem} The created MenuItem instance.
     */
    const createShowMoreMenuItem: (control: UI5Element, id: string, fesrId?: string) => MenuItem;
    /**
     * Creates a "Show More" action button.
     *
     * @private
     * @param {string} id - The ID of the button.
     * @param {string} [fesrId] - The FESR ID for the button.
     * @returns {Button} The created Button instance.
     */
    const createShowMoreActionButton: (control: UI5Element, id: string, fesrId?: string) => Button;
    /**
     * Sort Menuitems based on the order provided
     *
     * @private
     * @param {string[]} menuItemOrder - The Ids of the menu item in the order in which to be sorted.
     * @param {MenuItem[]} menuItems- The menuitems list to be sorted.
     * @returns {MenuItem[]} The sorted MenuItems.
     */
    const sortMenuItems: (menuItemOrder: string[], menuItems: MenuItem[]) => MenuItem[];
    /**
     * Compares two intent objects to determine if they are equal.
     *
     * The function checks the following conditions:
     * 1. If both objects are empty (i.e., have no keys), they are considered equal.
     * 2. If both objects have keys, their `semanticObject` and `action` properties are compared for equality.
     * 3. If either object is `undefined` or the conditions above are not met, they are considered not equal.
     *
     * @param targetA - The first intent object to compare.
     * @param targetB - The second intent object to compare.
     * @returns `true` if the objects are considered equal, otherwise `false`.
     */
    const targetsAreEqual: (targetA?: Partial<Intent>, targetB?: Partial<Intent>) => boolean;
}
//# sourceMappingURL=InsightsUtils.d.ts.map