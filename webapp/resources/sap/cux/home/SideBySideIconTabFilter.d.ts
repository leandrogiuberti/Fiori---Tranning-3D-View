declare module "sap/cux/home/SideBySideIconTabFilter" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import IconTabFilter from "sap/m/IconTabFilter";
    import { MetadataOptions } from "sap/ui/base/ManagedObject";
    import Control from "sap/ui/core/Control";
    import { $SideBySideIconTabFilterSettings } from "sap/cux/home/SideBySideIconTabFilter";
    /**
     *
     * Custom IconTabFilter for SideBySide orientation in the BaseContainer.
     *
     * @extends sap.m.IconTabFilter
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.139.0
     *
     * @private
     *
     * @alias sap.cux.home.SideBySideIconTabFilter
     */
    export default class SideBySideIconTabFilter extends IconTabFilter {
        constructor(id?: string | $SideBySideIconTabFilterSettings);
        constructor(id?: string, settings?: $SideBySideIconTabFilterSettings);
        static readonly renderer = "sap.m.IconTabFilterRenderer";
        static readonly metadata: MetadataOptions;
        /**
         * Returns the content controls from the associated panel.
         *
         * @public
         * @override
         * @returns {Control[]} An array of controls contained in the associated panel, or an empty array if no panel is associated.
         */
        getContent(): Control[];
        /**
         * Adds a control to the content aggregation of the associated panel.
         *
         * @public
         * @override
         * @param {Control} content - The control to add to the panel's content.
         * @returns {this} The instance of SideBySideIconTabFilter, to allow method chaining.
         */
        addContent(content: Control): this;
    }
}
//# sourceMappingURL=SideBySideIconTabFilter.d.ts.map