declare module "sap/cux/home/BaseSettingsPanel" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    import Button from "sap/m/Button";
    import Table from "sap/m/Table";
    import { DropInfo$DropEvent } from "sap/ui/core/dnd/DropInfo";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import Element from "sap/ui/core/Element";
    import BaseLayout from "sap/cux/home/BaseLayout";
    import BasePanel from "sap/cux/home/BasePanel";
    import BaseSettingsDialog from "sap/cux/home/BaseSettingsDialog";
    import { $BaseSettingsPanelSettings } from "sap/cux/home/BaseSettingsPanel";
    import { IKeyUserChange } from "sap/cux/home/interface/KeyUserInterface";
    /**
     *
     * Abstract base class for panels inside My Home Settings Dialog.
     *
     * @extends sap.ui.core.Element
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @abstract
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.BaseSettingsPanel
     */
    export default abstract class BaseSettingsPanel extends Element {
        protected _i18nBundle: ResourceBundle;
        private _keyuserChanges;
        private _actionButtonsCache;
        constructor(id?: string | $BaseSettingsPanelSettings);
        constructor(id?: string, settings?: $BaseSettingsPanelSettings);
        static readonly metadata: MetadataOptions;
        /**
         * Init lifecycle method
         *
         * @public
         * @override
         */
        init(): void;
        /**
         * Retrieves the BasePanel or BaseLayout associated with the BaseSettingsPanel.
         *
         * @returns {BasePanel | BaseLayout} The panel or layout associated with the BaseSettingsPanel
         * @private
         */
        protected _getPanel(): BasePanel | BaseLayout;
        /**
         * Persists the dialog state by setting a property on the parent layout
         * indicating that the settings dialog should be persisted.
         *
         * @private
         */
        protected _persistDialog(dialog: BaseSettingsDialog): void;
        /**
         * Checks if the dialog is persisted by examining the parent layout's persistence properties.
         *
         * @param {BaseSettingsDialog} dialog - The dialog to check for persistence status
         * @returns {boolean} True if the dialog is persisted (either settings dialog or content addition dialog), false otherwise
         *
         * @private
         */
        protected _isDialogPersisted(dialog: BaseSettingsDialog): boolean;
        /**
         * Returns the KeyUser Changes made by user.
         *
         * @public
         */
        getKeyUserChanges(): Array<IKeyUserChange>;
        /**
         * Add Changes made by user in case of KeyUser Settings Panel.
         *
         * @public
         */
        addKeyUserChanges(change: IKeyUserChange): void;
        /**
         * Clear all KeyUser Changes made by user.
         *
         * @public
         */
        clearKeyUserChanges(): void;
        protected addDragDropConfigTo(container: Table, dropHandler: (event: DropInfo$DropEvent) => void): void;
        /**
         * Retrieves the action buttons from the panel.
         *
         * @public
         * @returns {Button[]} array of action buttons.
         */
        getActionButtons(): Button[];
        /**
         * Adds an action button to the panel.
         *
         * @public
         * @param {Button} button - The button to add.
         * @returns {BaseSettingsPanel} The instance of the panel for chaining.
         */
        addActionButton(button: Button): BaseSettingsPanel;
        /**
         * Inserts an action button at a specific index in the panel.
         *
         * @public
         * @param {Button} button - The button to insert.
         * @param {number} index - The index at which to insert the button.
         * @returns {BaseSettingsPanel} The instance of the panel for chaining.
         */
        insertActionButton(button: Button, index: number): BaseSettingsPanel;
        /**
         * Removes an action button from the panel.
         *
         * @public
         * @param {Button} button - The button to remove.
         * @returns {Button | null} The removed button or null if not found.
         */
        removeActionButton(button: Button): Button | null;
        /**
         * Checks if the panel is supported. To be overridden by subclasses.
         *
         * @public
         * @async
         * @returns {Promise<boolean>} A promise that resolves to true if the panel is supported.
         */
        isSupported(): Promise<boolean>;
    }
}
//# sourceMappingURL=BaseSettingsPanel.d.ts.map