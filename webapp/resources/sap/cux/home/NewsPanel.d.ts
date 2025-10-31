declare module "sap/cux/home/NewsPanel" {
    import type { MetadataOptions } from "sap/ui/core/Element";
    import type { $BaseNewsPanelSettings } from "sap/cux/home/BaseNewsPanel";
    import BaseNewsPanel from "sap/cux/home/BaseNewsPanel";
    import NewsGroup from "sap/cux/home/NewsGroup";
    import { NewsType } from "sap/cux/home/library";
    interface IBindingInfo {
        path: string;
        length: number;
    }
    interface INewsResponse {
        value: INewsFeed[];
    }
    interface INewsFeed {
        title: string;
        subTitle?: string;
        description?: string;
        footer_text?: string;
        mandatory_text?: string;
        mandatory?: string;
        _group_to_image?: Record<string, string>;
        _group_to_article?: INewsFeed[];
        priority?: string;
        group_id?: string;
        [key: string]: unknown;
    }
    interface INewsItem {
        changeId: string;
        title?: string;
        showAllPreparationRequired?: boolean;
    }
    interface ITranslatedText {
        ColumnName?: string;
        TranslatedName?: string;
    }
    interface IAppConfiguration {
        _oAdapter: {
            _aInbounds: IAvailableApp[];
        };
    }
    interface ODataResponse {
        "@odata.context": string;
        "@odata.metadataEtag": string;
        value: INewsFeed[];
    }
    interface IAvailableApp {
        semanticObject?: string;
        action?: string;
        id?: string;
        title?: string;
        permanentKey?: string;
        contentProviderId?: string;
        resolutionResult?: {
            [key: string]: string;
        };
        deviceTypes?: {
            [key: string]: boolean;
        };
        signature: {
            parameters: {
                [key: string]: IAppParameter;
            };
            additionalParameters?: string;
        };
    }
    interface IAppParameter {
        defaultValue?: {
            value: string;
            format: string;
        };
        required: boolean;
    }
    interface IPersDataNewsFeed {
        items: string[];
        showAllPreparationRequired?: boolean;
    }
    interface INewsGroupMap {
        [key: string]: NewsGroup;
    }
    interface IGroupDetailsMap {
        [key: string]: INewsFeed[];
    }
    interface INewsLink {
        [key: string]: string;
    }
    interface INewsParam {
        [key: string]: {
            [key: string]: string;
        };
    }
    type FileFormat = "xlsx" | "csv";
    const BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/", NEWS_FEED_READ_API: string, NEWS_FEED_TRANSLATION_API: string, DEFAULT_FEED_COUNT = 7, NEWS_HEIGHT: {
        LargeDesktop: string;
        XLargeDesktop: string;
        Desktop: string;
        Tablet: string;
        Mobile: string;
    }, fnImagePlaceholder: (sPath: string, N: number) => string[];
    const CUSTOM_NEWS_FEED: {
        TITLE: string;
        LINK: string;
        VALIDITY: string;
        PREPARATION_REQUIRED: string;
        EXCLUDE_FIELDS: string[];
        IMAGE_URL: string;
        FESR_STEP_NAME: string;
        EMPTY_DATA_ERROR_CODE: string;
    }, CUSTOM_IMAGES: {
        [key: string]: string[];
    };
    /**
     *
     * Panel class for managing and storing News.
     *
     * @extends sap.cux.home.BaseNewsPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.NewsPanel
     */
    export default class NewsPanel extends BaseNewsPanel {
        private oNewsTile;
        private oNewsModel;
        private oManageMenuItem;
        private image;
        private customNewsFeedCache;
        private bNewsLoad;
        private persDataNewsFeed;
        private _eventBus;
        private _defaultNewsResponse;
        private mandatoryNewsFeed;
        private _defaultNewsPromise;
        private fetchedFeedUrl;
        private defaultUrl;
        private _noUpdatesNewsFeed;
        private _endUserResponse;
        static readonly metadata: MetadataOptions;
        constructor(idOrSettings?: string | $BaseNewsPanelSettings);
        constructor(id?: string, settings?: $BaseNewsPanelSettings);
        /**
         * Init lifecycle method
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Retrieves news data asynchronously.
         * If the news model is not initialized, it initializes the XML model and loads news feed data.
         * @private
         * @returns {Promise} A promise that resolves when the news data is retrieved.
         */
        getData(): Promise<void>;
        /**
         * Set default news feed based on the showDefault property.
         * @param {boolean} showDefault - Indicates whether to show the default news feed.
         * @param {boolean} [isKeyUserChange=false] - Indicates if the change is made by a key user.
         * @private
         */
        setDefaultNews(): Promise<void>;
        /**
         * Set the visibility of the manage news item in the menu.
         * @param visible - A boolean indicating whether the manage news item should be visible or not.
         */
        private setManageNewsItemVisibility;
        /**
         * Check if the parent container layout is of BaseLayout.
         * @returns {boolean} True if the parent container layout is a BaseLayout, otherwise false.
         * @private
         */
        private isParentBaseLayout;
        /**
         * Set the pressEnabled property for news groups based on the feed articles.
         * If no description is found in any of the articles within a group, the pressEnabled property is set to false.
         * @param feeds - An array of news feeds to check for descriptions.
         * @returns {void}
         */
        private setPressEnabledForNewsGroup;
        /**
         *
         * @param description - The description from which inline styles need to be removed.
         * @returns {string} The description with inline styles removed.
         */
        private removeInlineStylesFromDescription;
        /**
         * Retrieves the current news group data based on the provided id.
         *
         * @param id - The group ID
         * @returns The news group object that matches the extracted group ID, or `undefined`
         *          if no matching group is found.
         * @private
         */
        getCurrentNewsGroup(id: string): INewsFeed;
        /**
         * Initializes an XML model for managing news data.
         * This method returns a Promise that resolves to the initialized XML model.
         */
        /**
         * Initializes an XML model for managing news data.
         * This method returns a Promise that resolves to the initialized XML model.
         * @param {string} sUrl rss url to load the news feed
         * @returns {Promise<XMLModel>} XML Document containing the news feeds
         */
        private initializeXmlModel;
        /**
         * Loads the news feed based on the provided document and number of feeds.
         * Determines the feed type (RSS, feed, custom) and binds the news tile accordingly.
         * @param {Document} oDocument - The document containing the news feed data.
         * @param {number} [noOfFeeds] - The number of feeds to be displayed. Defaults to a predefined value.
         */
        private loadNewsFeed;
        /**
         * Handles errors that occur during the loading of the news feed.
         * @returns {void}
         */
        handleFeedError(): void;
        /**
         * Sets the URL for the news tile and triggers data fetch.
         *
         * @param {string} url - The news URL to be set.
         * @returns {Promise<void>} A promise that resolves once data fetching is complete.
         *
         * @private
         */
        setURL(url: string): Promise<void>;
        /**
         * Adjust layout based on the device type
         *
         * @private
         */
        adjustLayout(): void;
        /**
         * Binds the news tile with the provided binding information.
         * @param {sap.m.SlideTile} oSlideTile - The SlideTile control to be bound.
         * @param {IBindingInfo} oBindingInfo - The binding information containing the path and length of the aggregation.
         */
        private bindNewsTile;
        private getPropertyValue;
        /**
         * Extracts images for all the news tiles
         * @param {Document} oDocument - The document containing the news feed data.
         * @param {number} [noOfFeeds] - The number of feeds to be displayed. Defaults to a predefined value.
         */
        private extractAllImageUrls;
        /**
         * Converts the given date to a relative date-time format.
         * @param {string} timeStamp - The timestamp to be converted.
         * @returns {string} The date in relative date-time format.
         */
        private formatDate;
        /**
         * Returns the favourite news feed for the custom news
         * @returns {IPersDataNewsFeed}
         * @private
         */
        getPersDataNewsFeed(): IPersDataNewsFeed;
        /**
         * Extracts the image URL from the provided HREF link or link.
         * @param {string} sHrefLink - The HREF link containing the image URL.
         * @returns {Promise} A promise that resolves to the extracted image URL.
         */
        private extractImage;
        getNewsType(): NewsType;
        /**
         * Checks if the custom file format is CSV based on the custom file name.
         *
         * @param {string} fileName - The custom file name.
         * @returns {boolean} True if the file format is CSV, otherwise false.
         */
        private isCSVFileFormat;
        /**
         * Sets the favorite news feed for the user by retrieving personalization data.
         *
         * This method asynchronously fetches the user's personalization data and if  defaultFeed is true, updates favNewsFeed as
         * `defaultNewsFeed`. If defaultFeed is false, it updates it with the `favNewsFeed` news feed information.
         * @param {boolean} [defaultFeed] - Indicates whether to set the default news feed or favorite (custom) news feed.
         * @returns {Promise<void>} A promise that resolves when the favorite news feed is set.
         * @private
         */
        private setPersDataNewsFeed;
        /**
         * Sets the news feed type (Default or Custom) based on the provided data structure.
         *
         * @param {INewsFeed[]} data - News feed data from the URL.
         * @returns {Promise<void>} Resolves after setting the appropriate feed.
         */
        setNewsFeedFromUrl(data: INewsFeed[]): Promise<void>;
        /**
         * This method retrieves the count and feeds of the custom news feed asynchronously.
         * If the count is not zero, it loads the custom news feed data and returns the feeds.
         * @param {string} sFeedId - The ID of the custom news feed to set.
         * @returns {Promise} A promise that resolves to an array of news feeds.
         * @private
         */
        setCustomNewsFeed(sFeedId: string): Promise<void>;
        /**
         * Filters the provided list of news groups to include only those that are marked as mandatory.
         *
         * A news group is considered mandatory if:
         * - Its `mandatory_text` property (at the top level) is set to "TRUE" (case-insensitive).
         *
    
         * @param newsGroups - An array of news groups to filter.
         * @returns An array of news groups that are marked as mandatory.
         * @private
         */
        private filterMandatoryNews;
        /**
         * Set the priority of group to critical if any article within the group is critical.
         *
         * A news group is considered critical if:
         * - The group's `priority` is set to `"1"`.
         * - Any article within the group's `_group_to_article` array has a `priority` of `"1"`.
         *
         * If any article within a group is critical, the group's `priority` is updated to `"1"` and group's `priorityText` changed to "Very high".
         *
         * @param newsGroups - An array of news groups.
         *
         */
        private markGroupsWithCriticalArticles;
        /**
         * Retrieves the default news feed details from the given OData response.
         *
         * @param newsResponse - The OData response containing the news feed data.
         * @param showAllPreparationRequired - A boolean flag indicating whether to filter news items that require preparation.
         * @returns An array of default news feed items.
         * @private
         */
        private getDefaultNewsFeedDetails;
        /**
         * Returns the mandatory news feed details
         * If the mandatory news feed is not set, it returns an empty array.
         *
         * @returns {INewsFeed[]} The mandatory news feed details.
         * @private
         */
        getMandatoryDefaultNewsFeed(): string[];
        /**
         * Retrieves the default news response, either from cache or by fetching it.
         * @returns {Promise<ODataResponse>} A promise that resolves to the default news data
         * @private
         */
        private getDefaultNewsResponse;
        /**
         *
         * @returns {ODataResponse} The no update placeholder news group with enriched titles and descriptions to show when there are no updates
         * @private
         */
        private getNoUpdatesPlaceholder;
        /**
         * Returns if its a no updates new feed group or not
         * This indicates whether the news feed is a static no updates placeholder news feed.
         * @private
         */
        isNoUpdatesNewsFeed(): boolean;
        /**
         * Fetches the default news data from the server.
         * @returns {Promise<ODataResponse>} A promise that resolves to the fetched news data
         * @throws {Error} If the network request fails or returns a non-OK status
         * @private
         */
        private fetchDefaultNews;
        /**
         * Retrieves a custom news feed based on the provided feed ID.
         * If no feed ID is provided, it returns the default news feed.
         *
         * @param {string} sFeedId - The ID of the custom news feed to retrieve. If not provided, the default news feed is returned.
         * @param {boolean} showAllPreparationRequired - A flag indicating whether to show all preparation required.
         * @returns {Promise<INewsFeed[]>} A promise that resolves to an array of custom news feed items.
         * @private
         */
        getCustomOrDefaultNewsFeed(sFeedId: string, showAllPreparationRequired: boolean): Promise<INewsFeed[]>;
        /**
         * Retrieves custom news feed items identified by the provided feed ID and settings.
         * It processes the response data and returns an array of custom news feed items.
         * @param {string} sFeedId - The ID of the custom news feed.
         * @param {boolean} showAllPreparationRequired - Indicates whether to show all preparation required.
         * @returns {Promise} A Promise that resolves to an array of custom news feed items.
         * @private
         */
        private getCustomFeedData;
        /**
         * Generates the URL for retrieving news feed details based on the provided news object.
         * The generated URL limits the number of results to 999.
         * @param {INewsItem} oNews - The news object containing properties such as changeId, title, and showAllPreparationRequired.
         * @returns {string} The URL for retrieving news feed details.
         */
        getNewsFeedDetailsUrl(oNews: INewsItem): string;
        /**
         * Retrieves the news feed from the specified URL after applying authorization filtering based on the available apps.
         * If the news feed contains impacted artifacts, it checks if the current user has access to any of the impacted apps.
         * If the user has access to at least one impacted app, the news feed is included in the returned array.
         * @param {string} sNewsUrl - The URL of the news feed.
         * @returns {Array} The filtered array of news feed items authorized for the user.
         */
        getAuthNewsFeed(sNewsUrl: string, newsTitle?: string): Promise<INewsFeed[]>;
        /**
         * If the news feed contains impacted artifacts, it checks if the current user has access to any of the impacted apps.
         * If the user has access to at least one impacted app, the news feed is included in the returned array.
         * @param {INewsFeed[]} aNewsFeed - array of news feed
         * @param {IAvailableApp[]} aAvailableApps - array of all availabel apps
         * @returns {Array} The filtered array of news feed items authorized for the user.
         */
        private arrangeNewsFeeds;
        /**
         * takes all available apps list and the impacted atifact from the news and returns if it's valid
         * @param {IAvailableApp[]} aAvailableApps - Array of all available apps
         * @param {string} oImpactedArtifact - impacted artifact form the news
         * @returns {boolean} checks if the news is authenticated with the available apps list
         */
        private isAuthFeed;
        /**
         * Retrieves all available apps from the ClientSideTargetResolution service for authorization filtering.
         * @returns {Array} An array of available apps.
         */
        private getAllAvailableApps;
        /**
         * Retrieves the news feed details from the specified URL, including translation and formatting of field labels.
         * @param {string} sUrl - The URL of the news feed details.
         * @returns {Array} The array of news feed items with translated and formatted field labels.
         */
        private getNewsFeedDetails;
        /**
         * Filters the news feed data based on the LOB title for the news detail dialog
         *
         * @private
         * @param {INewsFeed[]} aNews complete news feed data
         * @param {?string} [newsTitle] title of the line of business to be filtered on
         * @returns {INewsFeed[]} filtered news feed for provided LOB title
         */
        private filterNewsOnTitle;
        /**
         * Retrieves translated text for news feed fields based on the specified feed ID.
         * @param {string} sFeedId - The ID of the custom news feed
         * @returns {Promise} A promise resolving to the translated text for news feed fields.
         */
        private getTranslatedText;
        /**
         * Loads custom news feed into the news panel after parsing JSON feed data to XML format.
         * @param {Array} feeds - The array of custom news feed items.
         */
        private loadCustomNewsFeed;
        /**
         * Parses JSON data into XML format.
         * @param {JSON[]} json - The JSON data to be parsed into XML.
         * @returns {XMLDocument} The XML document representing the parsed JSON data.
         */
        private parseJsonToXml;
        /**
         * Randomly selects an image from the available images for the feed item.
         * @param {string} sFileName - The file name of the custom news feed item.
         * @returns {string} The URL of the image for the feed item.
         * @private
         */
        private getCustomFeedImage;
        /**
         * Retrieves the default feed image for a given news feed.
         *
         * @param {INewsFeed} oFeed - The custom news feed object.
         * @returns {string} The base64 encoded image string with the appropriate MIME type, or an empty string if no valid image is found.
         * @private
         */
        private getDefaultFeedImage;
        /**
         * Converts a base64 URL string to a standard base64 string.
         *
         * @param {string} base64Url - The base64 URL string to convert.
         * @returns {string} The converted base64 string.
         * @private
         */
        private base64UrlToBase64;
        /**
         * Checks if a string is a valid base64 encoded string.
         * @param input The string to validate
         * @returns boolean indicating if the string is valid base64
         * @private
         */
        private isValidBase64;
        private _getUserPersonalization;
    }
}
//# sourceMappingURL=NewsPanel.d.ts.map