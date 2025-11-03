declare module "sap/cux/home/SpacePanel" {
    import { MetadataOptions } from "sap/ui/base/ManagedObject";
    import BaseAppPersPanel from "sap/cux/home/BaseAppPersPanel";
    import type { $SpacePanelSettings } from "sap/cux/home/SpacePanel";
    const _showAddApps: () => boolean;
    /**
     *
     * Provides the SpacePanel Class.
     *
     * @extends sap.cux.home.BaseAppPersPanel
     *
     * @author SAP SE
     * @version 0.0.1
     *
     * @private
     * @ui5-experimental-since 1.138.0
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.SpacePanel
     */
    export default class SpacePanel extends BaseAppPersPanel {
        constructor(idOrSettings?: string | $SpacePanelSettings);
        constructor(id?: string, settings?: $SpacePanelSettings);
        private _selectedGroupId;
        private _selectedPageId;
        private allSpaces;
        private pageManager;
        static readonly metadata: MetadataOptions;
        init(): void;
        /**
         * Fetch apps and set apps aggregation
         * @private
         */
        loadApps(): Promise<void>;
        /**
         * Creates and returns group instances for given group objects
         * @private
         * @param {object[]} aGroupObject - Array of group object.
         * @returns {sap.cux.home.Group[]} - Array of group instances
         */
        private _generateGroups;
        /**
         * Add multiple groups in the groups aggregation.
         * @private
         * @param {sap.cux.home.Group[]} groups - Array of groups.
         */
        private _setGroups;
        /**
         * Navigates to the App Finder with optional group Id.
         * @async
         * @private
         * @param {string} [groupId] - Optional group Id
         */
        private navigateToAppFinder;
        /**
         * Shows the detail dialog for a group.
         * @async
         * @param {string} groupId - The Id of the group.
         * @param {boolean} [editMode=false] - Whether to open the dialog in edit mode.
         * @private
         */
        private _showGroupDetailDialog;
        /**
         * Sets the apps for the detail dialog for a group.
         * @async
         * @param {string} groupId - The Id of the group.
         * @returns {Promise<void>} - A Promise that resolves once the apps for the group detail dialog are set.
         * @private
         */
        private _setGroupDetailDialogApps;
        /**
         * Applies personalization to the grouped apps within the specified group.
         * @param {string} groupId - The ID of the group to which the apps belong.
         * @private
         */
        private _applyGroupedAppsPersonalization;
        /**
         * Applies Deprecated Info for apps inside the group.
         * @param {App[]} apps - The ID of the group to which the apps belong.
         * @private
         */
        private _dispatchAppsLoadedEvent;
        /**
         * Generates the group detail dialog.
         * @private
         * @returns {sap.m.Dialog} The generated detail dialog for the group.
         */
        private _generateGroupDetailDialog;
        /**
         * Closes the group detail dialog.
         * @private
         */
        private _closeGroupDetailDialog;
        /**
         * Sets the group name control in the detail dialog.
         * Shows input control to edit the group name in edit mode, otherwise, shows group name as title control.
         * @private
         * @param {string} groupTitle - The title of the group.
         * @param {boolean} editMode - Whether the dialog is in edit mode.
         */
        private _setGroupNameControl;
        /**
         * Handles the press event of a group.
         * @param {Group$PressEvent} event - The press event object.
         * @private
         */
        private _handleGroupPress;
        /**
         * Generates illustrated message for favorite apps panel.
         * @private
         * @override
         * @returns {sap.m.IllustratedMessage} Illustrated error message.
         */
        protected generateIllustratedMessage(): import("sap/m/IllustratedMessage").default;
    }
}
//# sourceMappingURL=SpacePanel.d.ts.map