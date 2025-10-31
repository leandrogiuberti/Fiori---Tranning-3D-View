declare module "sap/cux/home/NewsSettingsPanel" {
    import BaseSettingsPanel from "sap/cux/home/BaseSettingsPanel";
    interface IFavNewsFeed {
        items: string[];
        showAllPreparationRequired?: boolean;
    }
    /**
     *
     * Class for My Home News Settings Panel.
     *
     * @extends BaseSettingsPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     * @private
     *
     * @alias sap.cux.home.NewsSettingsPanel
     */
    export default class NewsSettingsPanel extends BaseSettingsPanel {
        private oShowSwitch;
        private oCustNewsSwitchContainer;
        private oList;
        private oPersonalizer;
        private oNewsPanel;
        private aFavNewsFeed;
        private deselectedDefaultFeeds;
        private headerText;
        private title;
        /**
         * Init lifecycle method
         *
         * @public
         * @override
         */
        init(): void;
        /**
         * Returns the content for the News Settings Panel.
         *
         * @private
         * @returns {Control} The control containing the News Settings Panel content.
         */
        private getContent;
        /**
         * Get personalization instance
         */
        private getPersonalization;
        /**
         * Returns the content for the News Settings Panel Header.
         *
         * @private
         * @returns {sap.ui.core.Control} The control containing the News Settings Panel's Header content.
         */
        private setHeader;
        /**
         * Returns the content for the News Settings Panel Title description.
         *
         * @private
         * @returns {sap.ui.core.Control} The control containing the News Settings Panel's Title description.
         */
        private setTitleMessage;
        /**
         * Returns the content for the news List
         *
         * @private
         * @returns {sap.ui.core.Control} The control containing the News Settings Panel's List
         */
        private setNewsList;
        /**
         * Checks if the custom file format is CSV based on the custom file name.
         *
         * @param {string} fileName - The custom file name.
         * @returns {boolean} True if the file format is CSV, otherwise false.
         */
        private isCSVFileFormat;
        /**
         *
         * Saves news feed settings and shows news feed based on selection change of list of switch
         *
         * @private
         */
        private saveNewsFeedSettings;
        /** Get groupId info  for the default NewsList
         * @param {HBox} [contentBox] content Hbox
         * @returns {string} groupId
         * @private
         */
        private getDefaultGroupId;
        /** Set items for the NewsList
         * @param {Array} [aItems] news items to be set as items aggregation
         * @private
         */
        private setItems;
        /**
         * Loads news feed settings
         *
         * @returns {Promise} resolves to news feed settings
         */
        private loadNewsFeedSettings;
        /**
         *
         * @param {INewsFeed[]} aNewsFeed
         * @param {IFavNewsFeed} aPersNewsFeed
         * @returns {INewsFeed[] | undefined}
         * @private
         * @description Handles the default news feed settings by setting the header text, title, and items.
         * It maps the news feed items to set their selected and disabled states based on the personalisation data.
         * If no news feed is provided, it returns undefined.
         */
        private _handleDefaultNewsFeed;
        /**
         * @param {INewsFeed[]} aNewsFeed
         * @param aPersNewsFeed
         * @param showAllPreparationRequired
         * @returns {INewsFeed[] | undefined}
         * @private
         * This method is responsible for managing the custom news feed settings in the News Settings Panel.
         * It updates the header text and title, checks if the news feed is available, and maps the news feed items to set their selected state.
         * If the news feed is not available or empty, it returns undefined.
         * It also sets the state of the show switch based on the `showAllPreparationRequired` parameter.
         */
        private _handleCustomNewsFeed;
        /**
         * Checks if the News Settings Panel is supported based on the properties of the News Panel.
         *
         * @returns {Promise<boolean>} A promise that resolves to true if the News Settings Panel is supported, otherwise false.
         */
        isSupported(): Promise<boolean>;
    }
}
//# sourceMappingURL=NewsSettingsPanel.d.ts.map