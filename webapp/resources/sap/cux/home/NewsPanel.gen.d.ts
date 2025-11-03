declare module "sap/cux/home/NewsPanel" {
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $BaseNewsPanelSettings } from "sap/cux/home/BaseNewsPanel";

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $NewsPanelSettings extends $BaseNewsPanelSettings {

        /**
         * The URL of the news item.
         */
        url?: string | PropertyBindingInfo;

        /**
         * The key of custom news feed.
         */
        customFeedKey?: string | PropertyBindingInfo;

        /**
         * The filename of custom news feed.
         */
        customFileName?: string | PropertyBindingInfo;
    }

    export default interface NewsPanel {

        // property: url

        /**
         * Gets current value of property "url".
         *
         * The URL of the news item.
         *
         * Default value is: ""
         * @returns Value of property "url"
         */
        getUrl(): string;

        /**
         * Sets a new value for property "url".
         *
         * The URL of the news item.
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [url=""] New value for property "url"
         * @returns Reference to "this" in order to allow method chaining
         */
        setUrl(url: string): this;

        // property: customFeedKey

        /**
         * Gets current value of property "customFeedKey".
         *
         * The key of custom news feed.
         *
         * Default value is: ""
         * @returns Value of property "customFeedKey"
         */
        getCustomFeedKey(): string;

        /**
         * Sets a new value for property "customFeedKey".
         *
         * The key of custom news feed.
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [customFeedKey=""] New value for property "customFeedKey"
         * @returns Reference to "this" in order to allow method chaining
         */
        setCustomFeedKey(customFeedKey: string): this;

        // property: customFileName

        /**
         * Gets current value of property "customFileName".
         *
         * The filename of custom news feed.
         *
         * Default value is: ""
         * @returns Value of property "customFileName"
         */
        getCustomFileName(): string;

        /**
         * Sets a new value for property "customFileName".
         *
         * The filename of custom news feed.
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [customFileName=""] New value for property "customFileName"
         * @returns Reference to "this" in order to allow method chaining
         */
        setCustomFileName(customFileName: string): this;
    }
}
