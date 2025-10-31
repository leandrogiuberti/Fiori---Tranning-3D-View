declare module "sap/cux/home/NewsAndPagesContainer" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type { MetadataOptions } from "sap/ui/core/Element";
    import BaseContainer from "sap/cux/home/BaseContainer";
    import BasePanel from "sap/cux/home/BasePanel";
    import type { $NewsAndPagesContainerSettings } from "sap/cux/home/NewsAndPagesContainer";
    import { INewsFeedVisibiliyChange, INewsPersData } from "sap/cux/home/interface/KeyUserInterface";
    import { NewsType } from "sap/cux/home/library";
    interface IpanelLoaded {
        [key: string]: {
            loaded: boolean;
            count: number;
        };
    }
    interface EndUserChangeStatus {
        isEndUser: boolean;
        newsType: NewsType;
    }
    /**
     *
     * Container class for managing and storing News and Pages.
     *
     * @extends BaseContainer
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.NewsAndPagesContainer
     */
    export default class NewsAndPagesContainer extends BaseContainer {
        static renderer: {
            apiVersion: number;
            render: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
            renderContent: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
        };
        static readonly metadata: MetadataOptions;
        private panelLoaded;
        private pagePanel;
        private newsPanel;
        private keyUserChange;
        private isEndUserChange;
        constructor(id?: string | $NewsAndPagesContainerSettings);
        constructor(id?: string, settings?: $NewsAndPagesContainerSettings);
        /**
         * Init lifecycle method
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Loads the News and Pages section.
         * Overrides the load method of the BaseContainer.
         *
         * @private
         * @override
         */
        load(): Promise<void>;
        /**
         * Marks the change as an end-user change if the content is a NewsPanel with a URL and no key user changes exist.
         *
         * @private
         * @param {BasePanel} oContent - The content panel to evaluate, typically of type `sap.cux.home.NewsPanel`.
         */
        checkEndUserChanges(oContent: BasePanel): void;
        /**
         * Returns the current end-user change status.
         *
         * @private
         * @returns {EndUserChangeStatus} An object containing the end-user change flag and the news type.
         */
        getIsEndUserChange(): EndUserChangeStatus;
        newsVisibilityChangeHandler(personalization: INewsFeedVisibiliyChange): void;
        newsPersonalization(personalizations: INewsPersData): void;
        panelLoadedFn(sPanelType: string, oVal: {
            loaded: boolean;
            count: number;
        }): void;
        adjustStyleLayout(bIsNewsTileVisible: boolean): void;
        /**
         * Adjusts the layout of the all panels in the container.
         *
         * @private
         * @override
         */
        adjustLayout(): void;
        /**
         * Retrieves the generic placeholder content for the News and Pages container.
         *
         * @returns {string} The HTML string representing the News and Pages container's placeholder content.
         */
        protected getGenericPlaceholderContent(): string;
    }
}
//# sourceMappingURL=NewsAndPagesContainer.d.ts.map