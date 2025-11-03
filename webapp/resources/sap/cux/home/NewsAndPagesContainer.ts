/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import type { MetadataOptions } from "sap/ui/core/Element";
import BaseContainer from "./BaseContainer";
import BasePanel from "./BasePanel";
import type { $NewsAndPagesContainerSettings } from "./NewsAndPagesContainer";
import { getNewsPagesPlaceholder } from "./utils/placeholder/NewsAndPagesPlaceholder";
import NewsPanel from "./NewsPanel";
import PagePanel from "./PagePanel";
import { INewsFeedVisibiliyChange, INewsPersData, ISpacePagePersonalization } from "./interface/KeyUserInterface";
import { NewsType, OrientationType } from "./library";
import { DeviceType } from "./utils/Device";
import VBox from "sap/m/VBox";

interface IpanelLoaded {
	[key: string]: { loaded: boolean; count: number };
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
	static renderer = {
		...BaseContainer.renderer,
		apiVersion: 2
	};
	static readonly metadata: MetadataOptions = {
		properties: {
			/**
			 * Color Personalizations for Spaces & Pages
			 */
			colorPersonalizations: { type: "array", group: "Misc", defaultValue: [], visibility: "hidden" },
			/**
			 * Icon Personalizations for Spaces & Pages
			 */
			iconPersonalizations: { type: "array", group: "Misc", defaultValue: [], visibility: "hidden" },
			/**
			 * News feed visibility flag
			 */
			newsFeedVisibility: { type: "boolean", group: "Misc", defaultValue: true, visibility: "hidden" }
		}
	};

	private panelLoaded: IpanelLoaded = {};
	private pagePanel!: PagePanel;
	private newsPanel!: NewsPanel;
	private keyUserChange: boolean = false;
	private isEndUserChange: EndUserChangeStatus = { isEndUser: false, newsType: NewsType.None };

	constructor(id?: string | $NewsAndPagesContainerSettings);
	constructor(id?: string, settings?: $NewsAndPagesContainerSettings);
	/**
	 * Constructor for the new News and Pages container.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $NewsAndPagesContainerSettings) {
		super(id, settings);
	}

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();
		this.panelLoaded = {};

		this.setProperty(
			"orientation",
			this.getDeviceType() === DeviceType.Desktop ||
				this.getDeviceType() === DeviceType.LargeDesktop ||
				this.getDeviceType() === DeviceType.XLargeDesktop
				? OrientationType.Horizontal
				: OrientationType.Vertical
		);
		this.addCustomSetting("title", this._i18nBundle.getText("myInterestMsg") as string);
		this.addStyleClass("sapCuxNewsAndPagesContainer");
	}

	/**
	 * Loads the News and Pages section.
	 * Overrides the load method of the BaseContainer.
	 *
	 * @private
	 * @override
	 */
	public async load() {
		const aContent = this.getContent() as PagePanel[] | NewsPanel[];
		for (const oContent of aContent) {
			if (!this.keyUserChange) {
				this.checkEndUserChanges(oContent);
			}
			await oContent.getData();

			// If the newsVisibilityChangeHandler is invoked before the data is loaded,
			// it may result in the news panel being incorrectly displayed if it was already set hidden by the handler.
			// newsFeedVisibility is set as false, then hide the news panel
			const newsFeedVisibility = this.getProperty("newsFeedVisibility") as boolean;
			// if newsFeedVisibility is false, hide the news panel
			if (oContent && oContent.getMetadata().getName() === "sap.cux.home.NewsPanel" && !newsFeedVisibility) {
				oContent.setVisible(false);
			}
		}
	}

	/**
	 * Sets property value for colorPersonalization.
	 * Overridden to update cached personalizations.
	 *
	 * @private
	 * @override
	 * @returns {NewsAndPagesContainer} the container for chaining
	 */
	setColorPersonalizations(personalizations: Array<ISpacePagePersonalization>): NewsAndPagesContainer {
		const existingPers = (this.getProperty("colorPersonalizations") as ISpacePagePersonalization[]) || [];
		const updatedPers = existingPers.concat(personalizations);
		this.setProperty("colorPersonalizations", updatedPers);
		this.getContent().forEach((oContent) => {
			if (oContent.getMetadata().getName() === "sap.cux.home.PagePanel") {
				(oContent as PagePanel).applyColorPersonalizations(updatedPers);
			}
		});
		return this;
	}

	/**
	 * Sets property value for iconPersonalization.
	 * Overridden to update cached personalizations.
	 *
	 * @private
	 * @override
	 * @returns {NewsAndPagesContainer} the container for chaining
	 */
	setIconPersonalizations(personalizations: Array<ISpacePagePersonalization>): NewsAndPagesContainer {
		const existingPers = (this.getProperty("iconPersonalizations") as ISpacePagePersonalization[]) || [];
		const updatedPers = existingPers.concat(personalizations);
		this.setProperty("iconPersonalizations", updatedPers);
		this.getContent().forEach((oContent) => {
			if (oContent.getMetadata().getName() === "sap.cux.home.PagePanel") {
				(oContent as PagePanel).applyIconPersonalizations(updatedPers);
			}
		});
		return this;
	}

	/**
	 * Marks the change as an end-user change if the content is a NewsPanel with a URL and no key user changes exist.
	 *
	 * @private
	 * @param {BasePanel} oContent - The content panel to evaluate, typically of type `sap.cux.home.NewsPanel`.
	 */
	public checkEndUserChanges(oContent: BasePanel) {
		if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel" && oContent.getProperty("url") && !this.keyUserChange) {
			this.isEndUserChange.isEndUser = true;
		}
	}

	/**
	 * Returns the current end-user change status.
	 *
	 * @private
	 * @returns {EndUserChangeStatus} An object containing the end-user change flag and the news type.
	 */
	public getIsEndUserChange(): EndUserChangeStatus {
		return this.isEndUserChange;
	}

	public newsVisibilityChangeHandler(personalization: INewsFeedVisibiliyChange) {
		const aContent = this.getContent();
		aContent.forEach((oContent: BasePanel) => {
			if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel") {
				let newsPanel = oContent as NewsPanel;
				if (personalization.isNewsFeedVisible) {
					this.setProperty("newsFeedVisibility", true);
					newsPanel.setVisible(true);
				} else {
					this.setProperty("newsFeedVisibility", false);
					newsPanel.setVisible(false);
				}
			}
		});
	}

	public newsPersonalization(personalizations: INewsPersData) {
		const aContent = this.getContent();
		let type: NewsType;
		aContent.forEach((oContent: BasePanel) => {
			this.checkEndUserChanges(oContent);
			if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel" && !this.isEndUserChange.isEndUser) {
				let newsPanel = oContent as NewsPanel;
				const newsFeedVisibility = Boolean(this.getProperty("newsFeedVisibility"));
				this.keyUserChange = true;

				if (personalizations.showCustomNewsFeed) {
					type = NewsType.Custom;
				} else if (personalizations.showRssNewsFeed) {
					type = NewsType.NewsUrl;
				} else {
					type = NewsType.Default;
				}
				newsPanel.setProperty("type", type);
				newsPanel.setProperty("url", personalizations.newsFeedURL);
				newsPanel.setProperty("customFeedKey", personalizations.customNewsFeedKey);
				newsPanel.setProperty("customFileName", personalizations.customNewsFeedFileName);

				if (newsFeedVisibility) {
					const url = personalizations.newsFeedURL as string;
					newsPanel.setVisible(true);
					const customFeedKey = String(newsPanel.getProperty("customFeedKey"));
					if (personalizations.showCustomNewsFeed && customFeedKey) {
						newsPanel.setProperty("newsAvailable", true);
						void newsPanel.setCustomNewsFeed(customFeedKey);
					} else if (personalizations.showDefaultNewsFeed) {
						void newsPanel.setDefaultNews();
					} else if (personalizations.showRssNewsFeed && url) {
						void newsPanel.setURL(url);
					} else {
						newsPanel.setVisible(false);
						this.setProperty("newsFeedVisibility", false);
					}
				}
			}
		});
	}

	public panelLoadedFn(sPanelType: string, oVal: { loaded: boolean; count: number }) {
		// same issue of panelwrapper not available at this time
		const aContent = this.getContent();
		aContent.forEach((oContent: BasePanel) => {
			if (oContent.getMetadata().getName() === "sap.cux.home.PagePanel") {
				this.pagePanel = oContent as PagePanel;
			} else if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel") {
				this.newsPanel = oContent as NewsPanel;
			}
		});
		this.panelLoaded[sPanelType] = oVal;
		this.adjustLayout();
	}

	public adjustStyleLayout(bIsNewsTileVisible: boolean) {
		const sDeviceType = this.getDeviceType();
		const newsContentWrapper = this.newsPanel ? this.newsPanel.getContent()?.[0] as VBox : undefined;
		const pagesContentWrapper = this.pagePanel ? this.pagePanel.getContent()?.[0] as VBox : undefined;
		if (bIsNewsTileVisible) {
			this.newsPanel.adjustLayout();
		}
		if (sDeviceType === DeviceType.Desktop || sDeviceType === DeviceType.LargeDesktop || sDeviceType === DeviceType.XLargeDesktop) {
			if (bIsNewsTileVisible) {
				pagesContentWrapper?.setWidth("100%");
			}
			this.setOrientation(OrientationType.Horizontal);
			newsContentWrapper?.setWidth("100%");
			newsContentWrapper?.addStyleClass("newsTileMaxWidth");
		} else if (sDeviceType === DeviceType.Tablet) {
			this.setOrientation(OrientationType.Vertical);
			pagesContentWrapper?.setWidth("100%");
			pagesContentWrapper?.setJustifyContent("Start");
			newsContentWrapper?.setWidth("calc(100vw - 64px)");
			newsContentWrapper?.removeStyleClass("newsTileMaxWidth");
		} else {
			this.setOrientation(OrientationType.Vertical);
			newsContentWrapper?.setWidth("calc(100vw - 16px)");
		}

		if (pagesContentWrapper) {
			setTimeout(
				this.pagePanel.attachResizeHandler.bind(
					this.pagePanel,
					bIsNewsTileVisible,
					this.getDomRef()?.clientWidth || 0,
					pagesContentWrapper
				)
			);
		}
	}

	/**
	 * Adjusts the layout of the all panels in the container.
	 *
	 * @private
	 * @override
	 */
	public adjustLayout() {
		if (this.pagePanel && this.newsPanel && this.newsPanel.getVisible()) {
			let bIsNewsTileVisible = true;
			if (this.panelLoaded["Page"]?.loaded || this.panelLoaded["News"]?.loaded) {
				// In case News Panel fails to load remove the panel and apply styles for page to take full width
				if (this.panelLoaded["News"]?.loaded === false) {
					bIsNewsTileVisible = false;
					this.removeContent(this.newsPanel);
				} else if (this.panelLoaded["Page"]?.loaded === false) {
					this.removeContent(this.pagePanel);
				}
				this.adjustStyleLayout(bIsNewsTileVisible);
			}
		} else if (this.pagePanel && this.panelLoaded["Page"]?.loaded) {
			// If News Panel is not present apply styles for page to take full width
			this.adjustStyleLayout(false);
		}
	}

	/**
	 * Retrieves the generic placeholder content for the News and Pages container.
	 *
	 * @returns {string} The HTML string representing the News and Pages container's placeholder content.
	 */
	protected getGenericPlaceholderContent(): string {
		return getNewsPagesPlaceholder();
	}
}
