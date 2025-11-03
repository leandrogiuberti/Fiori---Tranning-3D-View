declare module "sap/cux/home/KeyUserNewsSettingsPanel" {
    import Event from "sap/ui/base/Event";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import BaseSettingsPanel from "sap/cux/home/BaseSettingsPanel";
    import { NewsType } from "sap/cux/home/library";
    const Constants: {
        NEWS_FEED_POST_API: string;
    };
    interface ShowError {
        showError: boolean;
        date: Date;
    }
    interface UploadedFilePayload {
        changeId: string;
        attachment: string | PromiseLike<string>;
        documentType?: string;
    }
    interface FileMetaData {
        type: string;
        content: string | PromiseLike<string>;
    }
    /**
     *
     * Class for News Settings Panel for KeyUser Settings Dialog.
     *
     * @extends BaseSettingsPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     * @private
     *
     * @alias sap.cux.home.KeyUserNewsSettingsPanel
     */
    export default class KeyUserNewsSettingsPanel extends BaseSettingsPanel {
        static readonly metadata: MetadataOptions;
        private controlMap;
        private _eventBus;
        private customNewsVisibility;
        private defaultNewsVisibility;
        private validChanges;
        private rssNewsVisibility;
        /**
         * Init lifecycle method
         *
         * @public
         * @override
         */
        init(): void;
        private getCurrentKeyUserChange;
        /**
         * Returns the content for the KeyUser news Settings Panel.
         *
         * @private
         * @returns {VBox} The control containing the KeyUser news Settings Panel content.
         */
        private getContent;
        checkNewsType(type: NewsType): boolean;
        isValidChanges(newsVisible: boolean): Promise<boolean>;
        clearNewsPanelChanges(): void;
        private addMessageStrip;
        private handleSelectCustomNewsFeed;
        /**
         * Add Radio Button for Custom News Feed.
         *
         * @private
         */
        private addCustomNewsFeedRadioBtn;
        /**
         * Add Radio Button for Manage News Feed.
         *
         * @private
         */
        private addDefaultNewsFeedRadioBtn;
        private addNewsPaneLabel;
        private handleSelectRssNewsFeed;
        private addNewsUrlRadioBtn;
        /**
         * Handle the selection of the Manage News Feed Radio Button.
         *
         * @private
         */
        private handleselectDefaultNewsFeed;
        private onNewsUrlChange;
        private showMessageStrip;
        private getValidURL;
        removeUrlMesageStrip(): void;
        private onUrlLiveChange;
        private getMessageStrip;
        /**
         * Add SimpleForm for News URL.
         *
         * @private
         */
        private addNewsURLSimpleForm;
        private handleFileChange;
        private setNewsFeedEnabled;
        private getNewsFeedUploadBtn;
        private handleFileUploadError;
        handleFileDialogClose(event: Event): void;
        private handleNewsFeedFileUpload;
        private getUploadedFile;
        private getFileUploader;
        /**
         * Add SimpleForm for Custom News Upload Form.
         *
         * @private
         */
        private addCustomNewsUploadSimpleForm;
        /**
         * Load settings for the panel.
         *
         * @private
         */
        private loadSettings;
    }
}
//# sourceMappingURL=KeyUserNewsSettingsPanel.d.ts.map