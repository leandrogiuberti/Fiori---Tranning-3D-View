/// <reference types="openui5" />
declare module "sap/cards/ap/common/helpers/ApplicationInfo" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    import Component from "sap/ui/core/Component";
    import { default as V2ODataModel } from "sap/ui/model/odata/v2/ODataModel";
    import { default as V4ODataModel } from "sap/ui/model/odata/v4/ODataModel";
    import type { ObjectPageFetchOptions } from "sap/cards/ap/common/types/CommonTypes";
    enum ODataModelVersion {
        V2 = "V2",
        V4 = "V4"
    }
    enum AppType {
        FreeStyle = "FreeStyle",
        ObjectPage = "ObjectPage"
    }
    type ODataModel = V2ODataModel | V4ODataModel;
    type App = {
        appModel: ODataModel;
        odataModel: ODataModelVersion;
        entitySet: string;
        context: string;
        entitySetWithObjectContext: string;
        componentName: string;
        resourceBundle: ResourceBundle;
        semanticObject: string;
        action: string;
        appType: string;
        contextParameters: string;
        navigationURI: string | null;
        variantParameter: string | null;
        contextParametersKeyValue: Array<{
            key: string;
            value: string;
        }>;
    };
    type ResourceBundleWithURL = ResourceBundle & {
        oUrlInfo: {
            url: string;
        };
    };
    type ManifestContentSapCardsAP = {
        embeds: {
            ObjectPage?: {
                default: string;
                manifests: {
                    [key: string]: Array<{
                        localUri: string;
                        hideActions: boolean;
                    }>;
                };
            };
        };
    };
    type AppManifest = {
        "sap.app": {
            id: string;
        };
        "sap.ui5": {};
        "sap.ui": {};
        "sap.fe"?: {};
        "sap.platform.abap"?: {
            uri: string;
        };
        "sap.cards.ap"?: ManifestContentSapCardsAP;
    };
    /**
     * Determines the application floorplan type based on the manifest entries of the provided app component.
     *
     * @param {Component} appComponent - The application component containing the manifest entries.
     * @returns {string} The floorplan type, either "ObjectPage" or "FreeStyle".
     */
    function getApplicationFloorplan(appComponent: Component): string;
    class ApplicationInfo {
        static instance: ApplicationInfo | null;
        appInfo: App | null;
        _rootComponent: Component;
        constructor(rootComponent: Component);
        static getInstance(rootComponent: Component): ApplicationInfo;
        fetchDetails(fetchOptions?: ObjectPageFetchOptions): Promise<App>;
        /**
         * Parses a context parameter string into an array of key-value objects.
         *
         * The context parameter string should be in the format: "key1=value1,key2=value2,...".
         * Each value is decoded and unquoted using `unquoteAndDecode`.
         *
         * @param {string} contextParameters - The context parameter string to parse.
         * @returns {Array<{ key: string; value: string }>} An array of objects with `key` and `value` properties.
         */
        private getContextParametersKeyValue;
        /**
         * for testing purposes only
         */
        _resetInstance(): void;
    }
}
//# sourceMappingURL=ApplicationInfo.d.ts.map