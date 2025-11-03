/// <reference types="openui5" />
declare module "sap/cards/ap/generator/pages/ObjectPage" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Component from "sap/ui/core/Component";
    import { Application } from "sap/cards/ap/generator/pages/Application";
    /**
     * Class for Object Page Application Info
     * Extends Application
     * implements the abstract function of the parent class validateCardGeneration, getEntityRelatedInfo, createInstance
     */
    class ObjectPage extends Application {
        /**
         * Constructor for ObjectPage class
         *
         * @param rootComponent The root component of the application.
         */
        constructor(rootComponent: Component);
        /**
         * Function to validate the card generation
         *
         * @returns boolean
         */
        validateCardGeneration(): boolean;
        /**
         * Function to get the entity related information i.e. eentitySet and entitySetWithObjectContext
         *
         * @returns object
         */
        getEntityRelatedInfo(): {
            entitySet: any;
            entitySetWithObjectContext: any;
        };
        /**
         * Function to create an instance of ObjectPage
         *
         * @param rootComponent The root component of the application.
         * @returns Application
         */
        static createInstance(rootComponent: Component): Application;
    }
}
//# sourceMappingURL=ObjectPage.d.ts.map