/// <reference types="openui5" />
declare module "sap/cards/ap/common/semanticCard/BaseCard" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type Component from "sap/ui/core/Component";
    import type { AppManifest } from "sap/cards/ap/common/helpers/ApplicationInfo";
    type AnnotatedODataModel = {
        aAnnotationURIs?: string[];
        aAnnotationUris?: string[];
    };
    /**
     * Base class for semantic card generation providing common functionality
     * for accessing application metadata, annotations, and OData service information.
     */
    abstract class BaseCard {
        protected readonly appComponent: Component;
        constructor(appComponent: Component);
        /**
         * Abstract method to generate the semantic card object.
         * Must be implemented by concrete card types.
         */
        abstract generateObjectCard(): Promise<any>;
        /**
         * Retrieves the application manifest with validation.
         * @returns The application manifest
         * @throws Error if manifest is not available
         */
        protected getApplicationManifest(): AppManifest;
        /**
         * Retrieves OData service metadata as XML string.
         * @returns Promise resolving to metadata XML string
         * @throws Error if model is not available or metadata fetch fails
         */
        protected getMetadata(): Promise<string>;
        /**
         * Retrieves annotation files from the OData model.
         * @returns Promise resolving to array of annotation XML strings
         * @throws Error if model is not available or annotation fetch fails
         */
        protected getAnnotations(): Promise<string[]>;
    }
}
//# sourceMappingURL=BaseCard.d.ts.map