declare module "sap/cux/home/BasePanel" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    import GridContainer from "sap/f/GridContainer";
    import FlexBox from "sap/m/FlexBox";
    import HeaderContainer from "sap/m/HeaderContainer";
    import { DropInfo$DropEvent } from "sap/ui/core/dnd/DropInfo";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import Element from "sap/ui/core/Element";
    import { dnd } from "sap/ui/core/library";
    import { $BasePanelSettings } from "sap/cux/home/BasePanel";
    import { DeviceType } from "sap/cux/home/utils/Device";
    /**
     *
     * Abstract base class for all panels placed in {@link sap.cux.home.BaseContainer}.
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
     * @alias sap.cux.home.BasePanel
     */
    export default abstract class BasePanel extends Element {
        protected _i18nBundle: ResourceBundle;
        constructor(id?: string | $BasePanelSettings);
        constructor(id?: string, settings?: $BasePanelSettings);
        static readonly metadata: MetadataOptions;
        /**
         * Init lifecycle method
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Updates the count information of IconTabFilter of IconTabBar inner control
         * in case of SideBySide layout
         *
         * @private
         * @param {string} count - updated count information
         */
        _setCount(count?: string): void;
        /**
         * Retrieves the device type for the current panel.
         *
         * @private
         * @returns {DeviceType} - The device type of the parent container if it exists,
         * otherwise calculates and returns the device type based on the current device width.
         */
        protected getDeviceType(): DeviceType;
        protected addDragDropConfigTo(container: GridContainer | FlexBox | HeaderContainer, dropHandler: (event: DropInfo$DropEvent) => void, keyboardHandler?: (event: KeyboardEvent) => void, dropPositionType?: dnd.DropPosition): void;
    }
}
//# sourceMappingURL=BasePanel.d.ts.map