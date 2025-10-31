/// <reference types="openui5" />
declare module "sap/cards/ap/generator/pages/Application" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Component from "sap/ui/core/Component";
    import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
    import V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
    type Model = V2ODataModel | V4ODataModel;
    type ObjectPageApplication = {
        rootComponent: Component;
        floorPlan: string;
        odataModel: string;
        entitySet: string;
        serviceUrl: string;
        entitySetWithObjectContext: string;
        componentName: string;
        semanticObject: string;
        action: string;
        variantParameter: string | null;
        navigationURI: string | null;
    };
    enum ODataModelVersion {
        V2 = "V2",
        V4 = "V4"
    }
    type LibVersionInfo = {
        buildTimestamp: string;
        name: string;
        scmRevision: string;
        version: string;
    };
    /**
     * Abstract class for Application Info
     * Provides methods to validate card generation, retrieve entity-related information,
     * and fetch details about the application.
     * @abstract
     */
    abstract class Application {
        static instance: Application | null;
        _oDataModelVersion: ODataModelVersion;
        _rootComponent: Component;
        static floorplan: string;
        abstract validateCardGeneration(): boolean;
        abstract getEntityRelatedInfo(): {
            entitySet: string;
            entitySetWithObjectContext: string;
        };
        /**
         * Constructor for the class Application
         * @param {Component} rootComponent - The root component of the application
         */
        constructor(rootComponent: Component);
        /**
         * Returns the root component of the application
         */
        getRootComponent(): Component;
        /**
         * Fetches details for the given application eg: Object Page, Freestyle
         */
        fetchDetails(): ObjectPageApplication;
        /**
         * Gets the singleton instance of the Application class.
         *
         * @returns {Application} - The singleton instance of the Application class.
         * @throws {Error} - Throws an error if the instance is not found.
         */
        static getInstance(): Application;
        /**
         * for testing purposes only
         */
        _resetInstance(): void;
    }
}
//# sourceMappingURL=Application.d.ts.map