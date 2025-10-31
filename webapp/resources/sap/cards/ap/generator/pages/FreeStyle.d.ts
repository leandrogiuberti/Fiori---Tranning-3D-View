/// <reference types="openui5" />
declare module "sap/cards/ap/generator/pages/FreeStyle" {
    import type Component from "sap/ui/core/Component";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import { Application } from "sap/cards/ap/generator/pages/Application";
    type ServiceDetails = {
        name: string;
        labelWithValue: string;
    };
    type EntityDetails = {
        name: string;
        labelWithValue: string;
    };
    type EntitySetWithContext = {
        name: string;
        labelWithValue: string;
    };
    /**
     * Class for Object Page Application Info
     * Extends Application
     * implements the abstract function of the parent class validateCardGeneration, getEntityRelatedInfo, createInstance
     */
    class FreeStyle extends Application {
        freeStyleDialogModel: JSONModel;
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
         * Function to create instance of Application
         *
         * @param rootComponent The root component of the application
         * @returns Application
         */
        static createInstance(rootComponent: Component): Application;
        /**
         * Retrieves service details from the application's manifest.
         *
         * This function iterates over the UI5 models and matches them with the data sources to extract the service URLs.
         * It returns an array of service details, each containing the name and labelWithValue properties.
         *
         * @returns {ServiceDetails[]} An array of service details, each containing the name and labelWithValue properties.
         */
        private getServiceDetails;
        /**
         * Retrieves the entity details from the model.
         *
         * @returns {EntityDetails[]} An array of entity details, each containing the name and labelWithValue properties.
         * @private
         */
        private getEntityDetails;
        /**
         * Fetches data for a given entity set with context.
         *
         * @param {string} entitySetWithObjectContext - The entity set with context to fetch data for.
         * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
         */
        fetchDataForObjectContext(entitySetWithObjectContext: string): Promise<void>;
        /**
         * Updates the FreeStyle model with context information for the selected service and entity set.
         *
         * @returns {Promise<void>} A promise that resolves when the model update is complete.
         */
        updateObjectContextFreeStyleModel(): Promise<void>;
        getFreeStyleModelForDialog(): JSONModel;
    }
}
//# sourceMappingURL=FreeStyle.d.ts.map