// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Utility functions for the My Inbox app.
 */
sap.ui.define([
    "sap/ushell/api/common/ComponentInstantiation"
], (
    ComponentInstantiation
) => {
    "use strict";

    /**
     * @typedef {object} sap.ushell.api.Inbox.ComponentInstantiationData
     *
     * @property {object} componentData The component data
     * @property {object} [componentData.config] Application configuration, or technical parameter if not present
     * @property {object} [componentData.startupParameters] Application startup parameters
     * @property {object} componentProperties The component properties
     * @property {sap.ui.core.URI} componentProperties.url URL of the component
     * @property {string} [componentProperties.ui5ComponentName]  Name of the UI5 component
     * @property {object} [componentProperties.applicationDependencies]  Application dependencies
     *
     * @since 1.135.0
     * @private
     * @ui5-restricted cross.fnd.fiori.inbox
     */

    /**
     * @alias sap.ushell.api.Inbox
     * @namespace
     * @description The My Inbox app needs to instantiate app components based on intents
     *   for which this API provides utility functions.
     *
     * @since 1.128.0
     * @private
     * @ui5-restricted cross.fnd.fiori.inbox
     */
    class Inbox {
        /**
         * Resolves a given navigation intent (if valid) and returns the respective component instance for further processing.
         *
         * @param {string} sIntent Semantic object and action as a string with a "#" as prefix
         * @param {object} [oComponentData={}] The componentData relevant for this component.
         *   <b>Note:</b> Don't pass <code>startupParameters</code>, <code>config</code>
         *   and <code>["sap-xapp-state"]</code>
         * @param {sap.ui.core.Component} [oOwnerComponent] If specified, the created component will be called within the context of the oOwnerComponent
         *    (via oOwnerComponent.runAsOwner(fn))
         * @returns {Promise<sap.ui.core.Component>} A promise resolving the component instance.
         *
         * @since 1.128.0
         * @private
         * @ui5-restricted cross.fnd.fiori.inbox
         */
        async createComponentInstance (sIntent, oComponentData, oOwnerComponent) {
            return ComponentInstantiation.createComponentInstance(sIntent, oComponentData, oOwnerComponent);
        }

        /**
         * Resolves a given navigation intent (if valid) and returns the respective component data only for further processing.
         *
         * @param {string} sIntent Semantic object and action as a string with a "#" as prefix
         * @param {object} [oComponentData] The componentData relevant for this component.
         *   <b>Note:</b> Don't pass <code>startupParameters</code>, <code>config</code>
         *   and <code>["sap-xapp-state"]</code>
         * @returns {Promise<sap.ushell.api.Inbox.ComponentInstantiationData>} A promise resolving the instantiation data for the component.
         *
         * @since 1.128.0
         * @private
         * @ui5-restricted cross.fnd.fiori.inbox
         */
        async createComponentInstantiationData (sIntent, oComponentData) {
            return ComponentInstantiation.createComponentInstantiationData(sIntent, oComponentData);
        }
    }

    return new Inbox();
});
