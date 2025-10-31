/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import GenericTile from "sap/m/GenericTile";
import SlideTile from "sap/m/SlideTile";
import { FrameType, Priority } from "sap/m/library";
import Event from "sap/ui/base/Event";
import Component from "sap/ui/core/Component";
import type { MetadataOptions } from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import DateFormat from "sap/ui/core/format/DateFormat";
import Context from "sap/ui/model/Context";
import XMLModel from "sap/ui/model/xml/XMLModel";
import Container from "sap/ushell/Container";
import Navigation from "sap/ushell/services/Navigation";
import BaseLayout from "./BaseLayout";
import type { $BaseNewsPanelSettings } from "./BaseNewsPanel";
import BaseNewsPanel from "./BaseNewsPanel";
import MenuItem from "./MenuItem";
import NewsAndPagesContainer from "./NewsAndPagesContainer";
import NewsGroup from "./NewsGroup";
import NewsItem from "./NewsItem";
import { NewsType } from "./library";
import { DEFAULT_NEWS_PLACEHOLDER, DEFAULT_NEWS_URL } from "./utils/Constants";
import { recycleId } from "./utils/DataFormatUtils";
import { DeviceType } from "./utils/Device";
import { addFESRId } from "./utils/FESRUtil";
import HttpHelper from "./utils/HttpHelper";
import PersonalisationUtils from "./utils/PersonalisationUtils";
import UshellPersonalizer from "./utils/UshellPersonalizer";

interface IBindingInfo {
	path: string;
	length: number;
}

interface INewsResponse {
	value: INewsFeed[];
}

export interface INewsFeed {
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

export interface INewsItem {
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

export interface INewsLink {
	[key: string]: string;
}

export interface INewsParam {
	[key: string]: { [key: string]: string };
}

export type FileFormat = "xlsx" | "csv";

const BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/",
	NEWS_FEED_READ_API = BASE_URL + "insights_read_srv/0001/" + "NEWS_FEED",
	NEWS_FEED_TRANSLATION_API = BASE_URL + "insights_read_srv/0001/" + "NewsFeedColumnTranslation",
	DEFAULT_FEED_COUNT = 7,
	NEWS_HEIGHT = {
		LargeDesktop: "17rem",
		XLargeDesktop: "17rem",
		Desktop: "17rem",
		Tablet: "14rem",
		Mobile: "11rem"
	},
	fnImagePlaceholder = function (sPath: string, N: number) {
		return Array.from({ length: N }, function (v, i) {
			return sPath + "/" + (i + 1) + ".jpg";
		});
	};

const CUSTOM_NEWS_FEED = {
		TITLE: "LineOfBusiness",
		LINK: "WhatsNewDocument",
		VALIDITY: "ValidAsOf",
		PREPARATION_REQUIRED: "PreparationRequired",
		EXCLUDE_FIELDS: [
			"ChangeId",
			"LineNumber",
			"LineOfBusiness",
			"SolutionArea",
			"Title",
			"Description",
			"Type",
			"ValidAsOf",
			"WhatsNewDocument",
			"Link"
		],
		IMAGE_URL: "sap/cux/home/img/CustomNewsFeed/",
		FESR_STEP_NAME: "custNewsSlide-press",
		EMPTY_DATA_ERROR_CODE: "NODATA"
	},
	CUSTOM_IMAGES: { [key: string]: string[] } = {
		"Application Platform and Infrastructure": fnImagePlaceholder("ApplicationPlatformandInfrastructure", 3),
		"Asset Management": fnImagePlaceholder("AssetManagement", 3),
		"Cross Applications": fnImagePlaceholder("CrossApplications", 3),
		Finance: fnImagePlaceholder("Finance", 3),
		Manufacturing: fnImagePlaceholder("Manufacturing", 3),
		"R&D / Engineering": fnImagePlaceholder("RnDandEngineering", 3),
		Sales: fnImagePlaceholder("Sales", 3),
		"Sourcing and Procurement": fnImagePlaceholder("SourcingandProcurement", 3),
		"Supply Chain": fnImagePlaceholder("SupplyChain", 3),
		default: ["default.jpg"]
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
	private oNewsTile!: SlideTile;
	private oNewsModel!: XMLModel;
	private oManageMenuItem!: MenuItem;
	private image!: number;
	private customNewsFeedCache: Map<string, unknown>;
	private bNewsLoad!: boolean;
	private persDataNewsFeed!: IPersDataNewsFeed; // hold the fav news feed for custom news and unselected group ids for default news
	private _eventBus!: EventBus;
	private _defaultNewsResponse!: ODataResponse;
	private mandatoryNewsFeed!: string[];
	private _defaultNewsPromise: Promise<ODataResponse> | null = null;
	private fetchedFeedUrl!: string;
	private defaultUrl!: string;
	private _noUpdatesNewsFeed: boolean = false; // flag to check if no updates news tile is shown or not
	private _endUserResponse!: ODataResponse;

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * The URL of the news item.
			 *
			 * @public
			 */
			url: { type: "string", group: "Misc", defaultValue: "", visibility: "public" },
			/**
			 * Type of the news item.
			 *
			 * @private
			 */
			type: {
				type: "sap.cux.home.NewsType",
				group: "Misc",
				visibility: "hidden",
				defaultValue: NewsType.Default
			},
			/**
			 * The key of custom news feed.
			 *
			 * @private
			 */
			customFeedKey: { type: "string", group: "Misc", defaultValue: "", visibility: "public" },
			/**
			 * The filename of custom news feed.
			 *
			 * @private
			 */
			customFileName: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * The flag to determine rss feed will load or not.
			 *
			 * @private
			 */
			newsAvailable: { type: "boolean", group: "Misc", defaultValue: true, visibility: "hidden" },
			/**
			 * Supported file formats for news.
			 *
			 * @private
			 */
			supportedFileFormats: { type: "FileFormat[]", group: "Misc", defaultValue: ["xlsx"], visibility: "hidden" }
		},
		aggregations: {
			/**
			 * newsGroup aggregation for News
			 */
			newsGroup: { type: "sap.cux.home.NewsGroup", singularName: "newsGroup", multiple: true, visibility: "hidden" }
		}
	};

	constructor(idOrSettings?: string | $BaseNewsPanelSettings);
	constructor(id?: string, settings?: $BaseNewsPanelSettings);
	/**
	 * Constructor for a new News Panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BaseNewsPanelSettings) {
		super(id, settings);
		this.customNewsFeedCache = new Map();
	}

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();
		const deviceType = this.getDeviceType();

		this.oNewsTile = new SlideTile(this.getId() + "--idNewsSlide", {
			displayTime: 20000,
			width: "100%",
			height: NEWS_HEIGHT[deviceType as keyof typeof NEWS_HEIGHT],
			tiles: [
				new GenericTile(this.getId() + "--placeholder", {
					state: "Loading",
					mode: "ArticleMode",
					frameType: "Stretch" as FrameType
				})
			]
		}).addStyleClass("newsTileMaxWidth sapUiSmallMarginTop");
		addFESRId(this.oNewsTile, "newsSlidePress");
		this.getNewsWrapper().addContent(this.oNewsTile);
		this.getNewsWrapper().addStyleClass("newsWrapper");
		this.setProperty("title", this._i18nBundle.getText("newsTitle"));
		this._eventBus = EventBus.getInstance();

		this.oManageMenuItem = new MenuItem(`${this.getId()}-manageNews`, {
			title: this._i18nBundle.getText("mngNews"),
			icon: "sap-icon://edit",
			press: this.handleEditNews.bind(this),
			visible: this.setManageNewsItemVisibility()
		});
		this.addAggregation("menuItems", this.oManageMenuItem);
		addFESRId(this.oManageMenuItem, "manageNews");
	}

	/**
	 * Retrieves news data asynchronously.
	 * If the news model is not initialized, it initializes the XML model and loads news feed data.
	 * @private
	 * @returns {Promise} A promise that resolves when the news data is retrieved.
	 */
	public async getData() {
		let sUrl: string = this.getUrl();
		let showCustom = this.getProperty("type") === NewsType.Custom;
		let showDefault = this.getProperty("type") === NewsType.Default;
		let showRssAtom = this.getProperty("type") === NewsType.NewsUrl;

		this.mandatoryNewsFeed = [];
		if (this.fetchedFeedUrl && this.fetchedFeedUrl === sUrl) {
			return;
		}
		const endUserChange = (this.getParent() as NewsAndPagesContainer).getIsEndUserChange();
		if (endUserChange.isEndUser) {
			//url scenario (developer side)
			const response = await fetch(sUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				this._endUserResponse = (await response.json()) as ODataResponse;
				await this.setNewsFeedFromUrl(this._endUserResponse?.value);
			} else {
				endUserChange.newsType = NewsType.NewsUrl;
				this.oNewsModel = await this.initializeXmlModel(sUrl);
				this.oNewsTile.setModel(this.oNewsModel);
				this.oManageMenuItem.setVisible(false);
			}
		} else {
			//key user scenarios
			if (!this.persDataNewsFeed) {
				await this.setPersDataNewsFeed(showDefault);
			}
			if (showDefault) {
				//default news scenario
				this.bNewsLoad = this.bNewsLoad || false;
				await this.setDefaultNews();
			} else if (sUrl && showRssAtom) {
				//rss feed scenario
				this.oNewsModel = await this.initializeXmlModel(sUrl);
				this.oNewsTile.setModel(this.oNewsModel);
				this.oManageMenuItem.setVisible(false);
			} else if (showCustom) {
				//custom news scenario
				this.bNewsLoad = this.bNewsLoad || false;
				this.oManageMenuItem.setVisible(true);
				const sCustomNewsFeedKey = this.getCustomFeedKey();
				if (sCustomNewsFeedKey) {
					await this.setCustomNewsFeed(sCustomNewsFeedKey);
				} else {
					this.handleFeedError();
				}
			} else {
				this.handleFeedError();
			}
		}
		this.fireEvent("loaded");
		this.adjustLayout();
	}

	/**
	 * Set default news feed based on the showDefault property.
	 * @param {boolean} showDefault - Indicates whether to show the default news feed.
	 * @param {boolean} [isKeyUserChange=false] - Indicates if the change is made by a key user.
	 * @private
	 */
	public async setDefaultNews() {
		// default news scenario, if url property is passed or showDefault is true

		let sUrl: string = this.getUrl();
		const isEndUser = (this.getParent() as NewsAndPagesContainer).getIsEndUserChange().isEndUser;
		this.defaultUrl = isEndUser ? sUrl : DEFAULT_NEWS_URL;
		this.fetchedFeedUrl = this.defaultUrl;

		//reset properties
		this.setProperty("newsAvailable", true);
		this.generateErrorMessage().setVisible(false);
		this.setVisible(true);
		this.oManageMenuItem.setVisible(true);
		this.setManageNewsItemVisibility(true);

		await this.setCustomNewsFeed("");
	}
	/**
	 * Set the visibility of the manage news item in the menu.
	 * @param visible - A boolean indicating whether the manage news item should be visible or not.
	 */
	private setManageNewsItemVisibility(visible: boolean = true): boolean {
		if (this.isParentBaseLayout() && this.oManageMenuItem) {
			this.oManageMenuItem.setVisible(visible);
			return visible;
		}
		this.oManageMenuItem?.setVisible(false);
		return false;
	}

	/**
	 * Check if the parent container layout is of BaseLayout.
	 * @returns {boolean} True if the parent container layout is a BaseLayout, otherwise false.
	 * @private
	 */
	private isParentBaseLayout(): boolean {
		const parentContainer = this.getParent() as NewsAndPagesContainer;
		const parentLayout = parentContainer?._getLayout();
		return !!(parentLayout && parentLayout instanceof BaseLayout);
	}

	/**
	 * Set the pressEnabled property for news groups based on the feed articles.
	 * If no description is found in any of the articles within a group, the pressEnabled property is set to false.
	 * @param feeds - An array of news feeds to check for descriptions.
	 * @returns {void}
	 */
	private setPressEnabledForNewsGroup(feeds: INewsFeed[] = []) {
		const newsGroups = this.getAggregation("newsGroup") as NewsGroup[] | undefined;
		if (!Array.isArray(newsGroups)) return;

		// Build groupDetailsMap for group details to avoid multiple iterations and clean up descriptions by removing inline styles if any
		const groupDetailsMap: IGroupDetailsMap = {};
		const groupHasDescription: Record<string, boolean> = {};

		(this._defaultNewsResponse.value || []).forEach((group) => {
			// Clean group description
			if (group?.description && group.description.trim().length > 0) {
				group.description = this.removeInlineStylesFromDescription(group.description);
			}
			if (group?.group_id) {
				const articles = group._group_to_article || [];
				// Clean article descriptions and check if any article has a valid description
				let hasDescription = false;
				articles.forEach((article: INewsFeed) => {
					if (article?.description && article.description.trim().length > 0) {
						article.description = this.removeInlineStylesFromDescription(article.description);
						hasDescription = true;
					}
				});
				groupDetailsMap[group.group_id] = articles;
				groupHasDescription[group.group_id] = hasDescription;
			}
		});

		const newsGroupMap: INewsGroupMap = {};
		// Iterate through the news groups and map group IDs to NewsGroup instances
		newsGroups
			.filter((group) => group instanceof NewsGroup)
			.forEach((group) => {
				const groupId = this.getCurrentNewsGroup(group.getId())?.group_id;
				if (groupId) {
					newsGroupMap[groupId] = group;
				}
			});

		//  If no description is found in any of the articles within the group,
		// 	disable the pressEnabled property for the news group to prevent user interaction.
		feeds.forEach((feed) => {
			if (!feed.group_id) return;
			const newsGroup = newsGroupMap[feed.group_id];
			if (newsGroup && !groupHasDescription[feed.group_id]) {
				newsGroup.getTile()?.setProperty("pressEnabled", false);
			}
		});
	}

	/**
	 *
	 * @param description - The description from which inline styles need to be removed.
	 * @returns {string} The description with inline styles removed.
	 */
	private removeInlineStylesFromDescription(description: string): string {
		return description.replace(/\s*style\s*=\s*(['"])[\s\S]*?\1/gi, "");
	}

	/**
	 * Retrieves the current news group data based on the provided id.
	 *
	 * @param id - The group ID
	 * @returns The news group object that matches the extracted group ID, or `undefined`
	 *          if no matching group is found.
	 * @private
	 */
	public getCurrentNewsGroup(id: string) {
		const newsGroupList = this._defaultNewsResponse?.value;
		const idParts = id.split("-newsgroup-");
		const groupId = idParts.length > 1 ? idParts[1] : null;

		if (!groupId || !newsGroupList) {
			return undefined;
		}

		return groupId === "placeholderNews" ? newsGroupList[0] : newsGroupList.find((group) => group.group_id === groupId);
	}

	/**
	 * Returns the custom news feed key property of NewsPanel
	 * @returns {string} custom news feed key
	 */
	public getCustomFeedKey(): string {
		return this.getProperty("customFeedKey") as string;
	}

	/**
	 * Returns the Url property of NewsPanel
	 * @returns {any}
	 */
	public getUrl(): string {
		return this.getProperty("url") as string;
	}

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
	private async initializeXmlModel(sUrl: string): Promise<XMLModel> {
		const oParent = this.getParent() as NewsAndPagesContainer;
		return new Promise((resolve) => {
			const oNewsModel = new XMLModel(sUrl);
			this.fetchedFeedUrl = sUrl;
			oNewsModel.setDefaultBindingMode("OneWay");
			oNewsModel.attachRequestCompleted((oEvent: Event) => {
				void (async () => {
					if (!this.bNewsLoad) {
						oParent?.panelLoadedFn("News", { loaded: true, count: DEFAULT_FEED_COUNT });
						this.bNewsLoad = true;
					}
					const oDocument = oEvent.getSource<XMLModel>().getData() as XMLDocument;
					await this.loadNewsFeed(oDocument, 0);
					this._eventBus.publish("KeyUserChanges", "newsFeedLoadFailed", { showError: false, date: new Date() });
					resolve(oNewsModel);
				})();
			});
			oNewsModel.attachRequestFailed(() => {
				this.handleFeedError();
				if (!this.bNewsLoad) {
					oParent?.panelLoadedFn("News", { loaded: false, count: 0 });
					this.bNewsLoad = true;
				}
				this._eventBus.publish("KeyUserChanges", "newsFeedLoadFailed", { showError: true, date: new Date() });
				resolve(oNewsModel);
			});
		});
	}

	/**
	 * Loads the news feed based on the provided document and number of feeds.
	 * Determines the feed type (RSS, feed, custom) and binds the news tile accordingly.
	 * @param {Document} oDocument - The document containing the news feed data.
	 * @param {number} [noOfFeeds] - The number of feeds to be displayed. Defaults to a predefined value.
	 */
	private async loadNewsFeed(oDocument: Document, noOfFeeds: number) {
		let oBindingInfo: IBindingInfo;
		if (!oDocument?.querySelector("customFeed") && !oDocument?.querySelector("defaultFeed")) {
			await this.extractAllImageUrls(oDocument, noOfFeeds || DEFAULT_FEED_COUNT);
		}

		if (!!oDocument?.querySelector("rss") && !!oDocument?.querySelector("item")) {
			oBindingInfo = {
				path: "/channel/item/",
				length: noOfFeeds || DEFAULT_FEED_COUNT
			};
		} else if (!!oDocument?.querySelector("atom") && !!oDocument?.querySelector("entry")) {
			oBindingInfo = {
				path: "/entry/",
				length: noOfFeeds || DEFAULT_FEED_COUNT
			};
		} else if (
			(!!oDocument?.querySelector("customFeed") || !!oDocument?.querySelector("defaultFeed")) &&
			!!oDocument?.querySelector("item")
		) {
			this.destroyAggregation("newsGroup");
			oBindingInfo = {
				path: "/item/",
				length: noOfFeeds || DEFAULT_FEED_COUNT
			};
		} else {
			this.handleFeedError();
			return;
		}
		this.bindNewsTile(this.oNewsTile, oBindingInfo);
	}

	/**
	 * Handles errors that occur during the loading of the news feed.
	 * @returns {void}
	 */
	public handleFeedError(): void {
		if (this.getNewsType() === NewsType.Custom || this.getNewsType() === NewsType.Default) {
			this.generateErrorMessage().setVisible(true);
			if (!this.isParentBaseLayout()) {
				this.setManageNewsButtonVisibility(false);
			}
			this.oNewsTile.setVisible(false);
		} else {
			this.setVisible(false);
			this.setProperty("newsAvailable", false);
			this.oManageMenuItem.setVisible(false);
		}
	}

	/**
	 * Sets the URL for the news tile and triggers data fetch.
	 *
	 * @param {string} url - The news URL to be set.
	 * @returns {Promise<void>} A promise that resolves once data fetching is complete.
	 *
	 * @private
	 */
	public async setURL(url: string) {
		this.setProperty("type", NewsType.NewsUrl);
		this.setProperty("newsAvailable", true);
		this.generateErrorMessage().setVisible(false);
		this.setVisible(true);
		this.oNewsTile.setVisible(true);
		this.setProperty("url", url);
		await this.getData();
	}

	/**
	 * Adjust layout based on the device type
	 *
	 * @private
	 */
	public adjustLayout() {
		const deviceType = this.getDeviceType();
		this.oNewsTile.setHeight(NEWS_HEIGHT[deviceType as keyof typeof NEWS_HEIGHT]);

		if (deviceType === DeviceType.Mobile) {
			this.generateErrorMessage().setWidth("100%");
			this.oNewsTile.removeStyleClass("sapUiSmallMarginTop");
		} else {
			this.oNewsTile.addStyleClass("sapUiSmallMarginTop");
		}
	}

	/**
	 * Binds the news tile with the provided binding information.
	 * @param {sap.m.SlideTile} oSlideTile - The SlideTile control to be bound.
	 * @param {IBindingInfo} oBindingInfo - The binding information containing the path and length of the aggregation.
	 */
	private bindNewsTile(oSlideTile: SlideTile, oBindingInfo: IBindingInfo): void {
		if (oBindingInfo) {
			oSlideTile.bindAggregation("tiles", {
				path: oBindingInfo.path,
				length: oBindingInfo.length,
				templateShareable: false,
				factory: (sId: string, oContext: Context) => {
					const newsInfo = oContext.getObject() as XMLDocument;
					let oTile;
					if (newsInfo.getElementsByTagName("link").length > 0) {
						oTile = new NewsItem(recycleId(`${sId}-news-item`), {
							url: String(this.getPropertyValue(newsInfo, "link") ?? ""),
							title: String(this.getPropertyValue(newsInfo, "title") ?? ""),
							subTitle: String(this.getPropertyValue(newsInfo, "description") ?? ""),
							imageUrl: String(this.getPropertyValue(newsInfo, "imageUrl") ?? ""),
							footer: this.formatDate(String(this.getPropertyValue(newsInfo, "pubDate") ?? ""))
						});
						this.addAggregation("newsItems", oTile, true);
					} else {
						let sGroupId = this.getPropertyValue(newsInfo, "group_id") ?? "";
						let newsId = sGroupId && sGroupId.trim() ? `${sId}-newsgroup-${sGroupId}` : `${sId}-newsgroup`;
						let subTitleNews = this.getPropertyValue(newsInfo, "subTitle") ?? "";
						oTile = new NewsGroup(recycleId(newsId), {
							title: String(this.getPropertyValue(newsInfo, "title") ?? ""),
							subTitle: subTitleNews || this._i18nBundle.getText("newsFeedDescription"),
							imageUrl: String(this.getPropertyValue(newsInfo, "imageUrl") ?? ""),
							footer: String(this.getPropertyValue(newsInfo, "footer") ?? ""),
							priority: this.getPropertyValue(newsInfo, "priority") as Priority,
							priorityText: String(this.getPropertyValue(newsInfo, "priorityText") ?? "")
						});
						this.addAggregation("newsGroup", oTile, true);
					}
					return oTile.getTile();
				}
			});
		}
	}

	private getPropertyValue(newsInfo: XMLDocument, propertyName: string) {
		return newsInfo.getElementsByTagName(propertyName)?.[0]?.textContent;
	}

	/**
	 * Extracts images for all the news tiles
	 * @param {Document} oDocument - The document containing the news feed data.
	 * @param {number} [noOfFeeds] - The number of feeds to be displayed. Defaults to a predefined value.
	 */
	private async extractAllImageUrls(oDocument: Document, noOfFeeds: number) {
		for (let i = 0; i < noOfFeeds; i++) {
			const oItemElement = oDocument?.getElementsByTagName("item")[i];
			const sUrl: string = await this.extractImage(String(oItemElement.getElementsByTagName("link")[0].textContent ?? ""));
			const oImageUrl = oDocument.createElement("imageUrl");
			oImageUrl.textContent = sUrl;
			oItemElement.appendChild(oImageUrl);
		}
	}

	/**
	 * Converts the given date to a relative date-time format.
	 * @param {string} timeStamp - The timestamp to be converted.
	 * @returns {string} The date in relative date-time format.
	 */
	private formatDate(timeStamp: string): string {
		const relativeDateFormatter = DateFormat.getDateTimeInstance({
			style: "medium",
			relative: true,
			relativeStyle: "short"
		});
		return relativeDateFormatter.format(new Date(timeStamp));
	}

	/**
	 * Returns the favourite news feed for the custom news
	 * @returns {IPersDataNewsFeed}
	 * @private
	 */
	public getPersDataNewsFeed() {
		return this.persDataNewsFeed;
	}

	/**
	 * Extracts the image URL from the provided HREF link or link.
	 * @param {string} sHrefLink - The HREF link containing the image URL.
	 * @returns {Promise} A promise that resolves to the extracted image URL.
	 */
	private extractImage(sHrefLink: string): Promise<string> {
		const fnLoadPlaceholderImage = () => {
			const sPrefix = sap.ui.require.toUrl("sap/cux/home/img");
			this.image = this.image ? this.image + 1 : 1;
			this.image = this.image < 9 ? this.image : 1;
			return `${sPrefix}/${this.image}.jpg`;
		};

		return fetch(sHrefLink)
			.then((res) => res.text())
			.then((sHTML) => {
				const aMatches = sHTML.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
				return Array.isArray(aMatches) && aMatches[1] ? aMatches[1] : fnLoadPlaceholderImage();
			})
			.catch(fnLoadPlaceholderImage);
	}

	public getNewsType(): NewsType {
		return (this.getParent() as NewsAndPagesContainer)?.getIsEndUserChange?.()?.newsType || (this.getProperty("type") as NewsType);
	}
	/**
	 * Checks if the custom file format is CSV based on the custom file name.
	 *
	 * @param {string} fileName - The custom file name.
	 * @returns {boolean} True if the file format is CSV, otherwise false.
	 */
	private isCSVFileFormat(fileName: string): boolean {
		return fileName.split(".").pop()?.toLowerCase() === ("csv" as string);
	}
	/**
	 * Sets the favorite news feed for the user by retrieving personalization data.
	 *
	 * This method asynchronously fetches the user's personalization data and if  defaultFeed is true, updates favNewsFeed as
	 * `defaultNewsFeed`. If defaultFeed is false, it updates it with the `favNewsFeed` news feed information.
	 * @param {boolean} [defaultFeed] - Indicates whether to set the default news feed or favorite (custom) news feed.
	 * @returns {Promise<void>} A promise that resolves when the favorite news feed is set.
	 * @private
	 */
	private async setPersDataNewsFeed(defaultFeed?: boolean): Promise<void> {
		const personalizer = await this._getUserPersonalization();
		const persData = await personalizer?.read();
		this.persDataNewsFeed = (defaultFeed ? persData?.defaultNewsFeed : persData?.favNewsFeed) as IPersDataNewsFeed;
	}

	/**
	 * Sets the news feed type (Default or Custom) based on the provided data structure.
	 *
	 * @param {INewsFeed[]} data - News feed data from the URL.
	 * @returns {Promise<void>} Resolves after setting the appropriate feed.
	 */
	public async setNewsFeedFromUrl(data: INewsFeed[]): Promise<void> {
		const item = data?.[0];

		if (item && "group_id" in item && "title" in item) {
			(this.getParent() as NewsAndPagesContainer).getIsEndUserChange().newsType = NewsType.Default;
			await this.setDefaultNews();
		} else if (item && "LineOfBusiness" in item) {
			(this.getParent() as NewsAndPagesContainer).getIsEndUserChange().newsType = NewsType.Custom;
			this.oManageMenuItem.setVisible(true);
			await this.setCustomNewsFeed("");
		} else {
			this.handleFeedError();
		}
	}

	/**
	 * This method retrieves the count and feeds of the custom news feed asynchronously.
	 * If the count is not zero, it loads the custom news feed data and returns the feeds.
	 * @param {string} sFeedId - The ID of the custom news feed to set.
	 * @returns {Promise} A promise that resolves to an array of news feeds.
	 * @private
	 */
	public async setCustomNewsFeed(sFeedId: string): Promise<void> {
		try {
			this.oNewsTile.setVisible(true);
			this.generateErrorMessage().setVisible(false);
			const feedType = this.getNewsType();
			const isDefaultNews = feedType === NewsType.Default;
			await this.setPersDataNewsFeed(isDefaultNews);
			const customFileName = this.getProperty("customFileName") as string;
			const showAllPrepRequired = this.isCSVFileFormat(customFileName)
				? false
				: (this.persDataNewsFeed?.showAllPreparationRequired ?? true);

			if (this.isCSVFileFormat(customFileName)) {
				CUSTOM_NEWS_FEED.EXCLUDE_FIELDS.push("PreparationRequired");
			}
			const showPrep = isDefaultNews ? true : showAllPrepRequired;
			let newsFeeds = await this.getCustomOrDefaultNewsFeed(sFeedId || "", showPrep);

			if (newsFeeds.length === 0) {
				throw new Error("Error: No news feed available");
			}
			const selectedItems = this.persDataNewsFeed?.items;

			// Handle no favorite feed case
			const isSelectedEmpty = selectedItems?.length === 0;

			if (!isDefaultNews && isSelectedEmpty) {
				(this.getParent() as NewsAndPagesContainer)?.panelLoadedFn("News", { loaded: true, count: 0 });
				throw new Error("Error: No fav news feed available");
			}

			// Filter feeds based on personalization
			if (selectedItems?.length) {
				newsFeeds = newsFeeds.filter((feed) => {
					// if its defaultNews then we show everything except the group ids present inside persDataNewsFeed items
					// if the group id is mandatory then we show it
					if (isDefaultNews) {
						return !selectedItems.includes(feed.group_id as string) || this.mandatoryNewsFeed.includes(feed.group_id as string);
					} else {
						// if its customNews we show only the groups that is present in persDataNewsFeed items
						return selectedItems.includes(feed.title);
					}
				});
				if (newsFeeds.length === 0) {
					(this.getParent() as NewsAndPagesContainer)?.panelLoadedFn("News", { loaded: true, count: 0 });
					throw new Error("Error: No news feed available after filtering");
				}
			}

			await this.loadCustomNewsFeed(newsFeeds, sFeedId ? "customFeed" : "defaultFeed");
			if (isDefaultNews) {
				this.fetchedFeedUrl = this.defaultUrl;
				// If no description is found in any of the articles within a group, the pressEnabled property is set to false
				this.setPressEnabledForNewsGroup(newsFeeds);
			} else {
				this.fetchedFeedUrl = "";
			}
		} catch (err) {
			Log.error(err as string);
			this.handleFeedError();
		}
	}

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
	private filterMandatoryNews(newsGroups: INewsFeed[]): INewsFeed[] {
		return newsGroups.filter(
			({ mandatory_text, mandatory }) => mandatory_text?.toUpperCase() === "TRUE" || mandatory?.toUpperCase() === "X"
		);
	}

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
	private markGroupsWithCriticalArticles(newsGroups: INewsFeed[]): void {
		for (const group of newsGroups) {
			const criticalArticle = group._group_to_article?.find((article) => article.priority === "1");
			//make newsgroup priority to Veryhigh
			if (criticalArticle) {
				group.priority = criticalArticle.priority;
				group.priorityText = criticalArticle.priorityText;
			}
		}
	}

	/**
	 * Retrieves the default news feed details from the given OData response.
	 *
	 * @param newsResponse - The OData response containing the news feed data.
	 * @param showAllPreparationRequired - A boolean flag indicating whether to filter news items that require preparation.
	 * @returns An array of default news feed items.
	 * @private
	 */
	private getDefaultNewsFeedDetails(newsResponse: ODataResponse) {
		let newsFeedItems: INewsFeed[] = JSON.parse(JSON.stringify(newsResponse.value || [])) as INewsFeed[];
		const defaultNews: INewsFeed[] = [];
		const defaultFeedDict = {} as Record<string, string>;
		this.mandatoryNewsFeed = [];
		if (newsFeedItems?.length > 0) {
			this.mandatoryNewsFeed = this.filterMandatoryNews(newsFeedItems).map((oFeed) => oFeed.group_id || "");
			this.markGroupsWithCriticalArticles(newsFeedItems);

			for (const feed of newsFeedItems) {
				const title = feed.title;
				let subTitle = "";
				if (!defaultFeedDict[title]) {
					subTitle = feed.subTitle || feed.description || "";
					defaultNews.push({
						title: title,
						footer: feed?.footer_text,
						imageUrl: this.getDefaultFeedImage(feed),
						group_id: feed.group_id,
						subTitle: subTitle,
						priority: feed?.priority == "1" ? Priority.Medium : Priority.None,
						priorityText: feed?.priority == "1" ? this._i18nBundle.getText("criticalNews") : ""
					});
					defaultFeedDict[title] = title;
				}
			}
		}
		return defaultNews;
	}

	/**
	 * Returns the mandatory news feed details
	 * If the mandatory news feed is not set, it returns an empty array.
	 *
	 * @returns {INewsFeed[]} The mandatory news feed details.
	 * @private
	 */
	public getMandatoryDefaultNewsFeed() {
		return this.mandatoryNewsFeed || [];
	}

	/**
	 * Retrieves the default news response, either from cache or by fetching it.
	 * @returns {Promise<ODataResponse>} A promise that resolves to the default news data
	 * @private
	 */
	private getDefaultNewsResponse(): Promise<ODataResponse> {
		// Return cached data if available
		if (this._defaultNewsResponse) {
			return Promise.resolve(this._defaultNewsResponse);
		}

		if (!this._defaultNewsPromise) {
			this._defaultNewsPromise = this.fetchDefaultNews();
		}

		return this._defaultNewsPromise;
	}

	/**
	 *
	 * @returns {ODataResponse} The no update placeholder news group with enriched titles and descriptions to show when there are no updates
	 * @private
	 */
	private getNoUpdatesPlaceholder(): ODataResponse {
		const placeholderTitle = this._i18nBundle.getText("placeholderNewsTitle") as string;
		const placeholderDescription = this._i18nBundle.getText("placeholderNewsDescription");

		const enrichedNewsPlaceholder = {
			...DEFAULT_NEWS_PLACEHOLDER,
			value: DEFAULT_NEWS_PLACEHOLDER.value.map((group) => ({
				...group,
				title: placeholderTitle,
				description: placeholderDescription,
				_group_to_article: group._group_to_article.map((article) => ({
					...article,
					title: placeholderTitle,
					description: ""
				}))
			}))
		};
		return enrichedNewsPlaceholder;
	}

	/**
	 * Returns if its a no updates new feed group or not
	 * This indicates whether the news feed is a static no updates placeholder news feed.
	 * @private
	 */
	public isNoUpdatesNewsFeed(): boolean {
		return this._noUpdatesNewsFeed;
	}

	/**
	 * Fetches the default news data from the server.
	 * @returns {Promise<ODataResponse>} A promise that resolves to the fetched news data
	 * @throws {Error} If the network request fails or returns a non-OK status
	 * @private
	 */
	private async fetchDefaultNews(): Promise<ODataResponse> {
		try {
			const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
			const [{ supported }] = await navigationService.isNavigationSupported([
				{
					target: {
						semanticObject: "NewsArticle",
						action: "display"
					}
				}
			]);
			if (supported) {
				if (this._endUserResponse) {
					this._defaultNewsResponse = this._endUserResponse;
				} else {
					const response = await fetch(this.defaultUrl || DEFAULT_NEWS_URL);

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					this._defaultNewsResponse = (await response.json()) as ODataResponse;
				}
			}
			// If the response is not supported or empty, set the default news response to placeholder news
			if (!supported || !this._defaultNewsResponse?.value?.length) {
				this._defaultNewsResponse = this.getNoUpdatesPlaceholder();
				this._noUpdatesNewsFeed = true;
				this.oManageMenuItem.setVisible(false);
			}

			return this._defaultNewsResponse;
		} catch (error) {
			this._defaultNewsPromise = null;
			Log.error(error as string);
			throw error;
		}
	}

	/**
	 * Retrieves a custom news feed based on the provided feed ID.
	 * If no feed ID is provided, it returns the default news feed.
	 *
	 * @param {string} sFeedId - The ID of the custom news feed to retrieve. If not provided, the default news feed is returned.
	 * @param {boolean} showAllPreparationRequired - A flag indicating whether to show all preparation required.
	 * @returns {Promise<INewsFeed[]>} A promise that resolves to an array of custom news feed items.
	 * @private
	 */
	public async getCustomOrDefaultNewsFeed(sFeedId: string, showAllPreparationRequired: boolean): Promise<INewsFeed[]> {
		const feedType = this.getNewsType();
		const isDefaultNews = feedType === NewsType.Default;
		if (isDefaultNews) {
			await this.getDefaultNewsResponse();
			let aDefaultgroups = this.getDefaultNewsFeedDetails(this._defaultNewsResponse);
			return aDefaultgroups;
		} else {
			return this.getCustomFeedData(sFeedId, showAllPreparationRequired);
		}
	}

	/**
	 * Retrieves custom news feed items identified by the provided feed ID and settings.
	 * It processes the response data and returns an array of custom news feed items.
	 * @param {string} sFeedId - The ID of the custom news feed.
	 * @param {boolean} showAllPreparationRequired - Indicates whether to show all preparation required.
	 * @returns {Promise} A Promise that resolves to an array of custom news feed items.
	 * @private
	 */
	private async getCustomFeedData(sFeedId: string, showAllPreparationRequired: boolean): Promise<INewsFeed[]> {
		try {
			let newsDetailUrl;
			const isEnduser = (this.getParent() as NewsAndPagesContainer).getIsEndUserChange().isEndUser;
			newsDetailUrl = isEnduser ? this.getUrl() : this.getNewsFeedDetailsUrl({ changeId: sFeedId, showAllPreparationRequired });
			if (!this.customNewsFeedCache.has(newsDetailUrl)) {
				this.customNewsFeedCache.set(newsDetailUrl, this.getAuthNewsFeed(newsDetailUrl));
			}
			const authorizedNewsFeeds = (await this.customNewsFeedCache.get(newsDetailUrl)) as INewsFeed[];
			const oFeedDict: { [key: string]: string } = {};
			const aFeeds: INewsFeed[] = [];
			if (authorizedNewsFeeds?.length > 0) {
				authorizedNewsFeeds.forEach((oFeed: INewsFeed) => {
					const title = oFeed[CUSTOM_NEWS_FEED.TITLE] as INewsLink;
					if (!oFeedDict[title.value]) {
						aFeeds.push({
							title: title.value,
							footer: (oFeed[CUSTOM_NEWS_FEED.VALIDITY] as INewsLink)?.value,
							imageUrl: this.getCustomFeedImage(title.value)
						});
						oFeedDict[title.value] = title.value;
					}
				});
			}
			return aFeeds; // group details
		} catch (err) {
			Log.error(err as string);
			throw new Error(err as string);
		}
	}

	/**
	 * Generates the URL for retrieving news feed details based on the provided news object.
	 * The generated URL limits the number of results to 999.
	 * @param {INewsItem} oNews - The news object containing properties such as changeId, title, and showAllPreparationRequired.
	 * @returns {string} The URL for retrieving news feed details.
	 */
	public getNewsFeedDetailsUrl(oNews: INewsItem) {
		let sUrl = NEWS_FEED_READ_API + "?$filter=ChangeId eq " + "'" + oNews.changeId + "'";
		const customFileName = this.getProperty("customFileName") as string;
		if (!this.isCSVFileFormat(customFileName) && oNews.showAllPreparationRequired) {
			sUrl = sUrl + " and PreparationRequired eq true";
		}
		return sUrl + "&$top=999";
	}

	/**
	 * Retrieves the news feed from the specified URL after applying authorization filtering based on the available apps.
	 * If the news feed contains impacted artifacts, it checks if the current user has access to any of the impacted apps.
	 * If the user has access to at least one impacted app, the news feed is included in the returned array.
	 * @param {string} sNewsUrl - The URL of the news feed.
	 * @returns {Array} The filtered array of news feed items authorized for the user.
	 */
	public async getAuthNewsFeed(sNewsUrl: string, newsTitle?: string) {
		try {
			const [aAvailableApps, aNewsFeed] = await Promise.all([
				this.getAllAvailableApps(),
				this.getNewsFeedDetails(sNewsUrl, newsTitle)
			]);
			if (aAvailableApps.length === 0) {
				return aNewsFeed;
			}
			return this.arrangeNewsFeeds(aNewsFeed, aAvailableApps);
		} catch (err) {
			Log.error(err as string);
		}
	}

	/**
	 * If the news feed contains impacted artifacts, it checks if the current user has access to any of the impacted apps.
	 * If the user has access to at least one impacted app, the news feed is included in the returned array.
	 * @param {INewsFeed[]} aNewsFeed - array of news feed
	 * @param {IAvailableApp[]} aAvailableApps - array of all availabel apps
	 * @returns {Array} The filtered array of news feed items authorized for the user.
	 */
	private arrangeNewsFeeds(aNewsFeed: INewsFeed[], aAvailableApps: IAvailableApp[]) {
		const aAuthNewsFeed: INewsFeed[] = [];

		aNewsFeed.forEach((oNewsFeed: INewsFeed) => {
			if ((oNewsFeed.Category as INewsLink).value !== "App" || !(oNewsFeed.ImpactedArtifacts as INewsLink).value) {
				aAuthNewsFeed.push(oNewsFeed);
			} else {
				const aImpactedArtifacts: string[] = (oNewsFeed.ImpactedArtifacts as INewsLink).value.split("\n");
				for (let impactedArtifact of aImpactedArtifacts) {
					const oImpactedArtifact = impactedArtifact;
					if (oImpactedArtifact && this.isAuthFeed(aAvailableApps, impactedArtifact)) {
						aAuthNewsFeed.push(oNewsFeed);
						break;
					}
				}
			}
		});
		return aAuthNewsFeed;
	}

	/**
	 * takes all available apps list and the impacted atifact from the news and returns if it's valid
	 * @param {IAvailableApp[]} aAvailableApps - Array of all available apps
	 * @param {string} oImpactedArtifact - impacted artifact form the news
	 * @returns {boolean} checks if the news is authenticated with the available apps list
	 */
	private isAuthFeed(aAvailableApps: IAvailableApp[], oImpactedArtifact: string) {
		const fioriIdSplitter = "|";
		if (oImpactedArtifact.includes(fioriIdSplitter)) {
			const aTokens = oImpactedArtifact.split(fioriIdSplitter);
			const sFioriId = (aTokens[aTokens.length - 1] || "").trim();
			if (sFioriId) {
				const index = aAvailableApps.findIndex((oApp: IAvailableApp) => {
					return sFioriId === oApp?.signature?.parameters["sap-fiori-id"]?.defaultValue?.value;
				});
				return index > -1;
			}
		}
		return true;
	}

	/**
	 * Retrieves all available apps from the ClientSideTargetResolution service for authorization filtering.
	 * @returns {Array} An array of available apps.
	 */
	private async getAllAvailableApps(): Promise<IAvailableApp[]> {
		try {
			const oService = await Container.getServiceAsync<IAppConfiguration>("ClientSideTargetResolution");
			return oService?._oAdapter._aInbounds || [];
		} catch (err) {
			if (err instanceof Error) {
				Log.error(err.message);
			}
			return [];
		}
	}

	/**
	 * Retrieves the news feed details from the specified URL, including translation and formatting of field labels.
	 * @param {string} sUrl - The URL of the news feed details.
	 * @returns {Array} The array of news feed items with translated and formatted field labels.
	 */
	private async getNewsFeedDetails(sUrl: string, newsTitle?: string): Promise<INewsFeed[]> {
		if (this.customNewsFeedCache.has(sUrl)) {
			const newsFeedDetails = await this.customNewsFeedCache.get(sUrl);
			return this.filterNewsOnTitle(newsFeedDetails as INewsFeed[], newsTitle);
		}

		const fnFormattedLabel = (sLabel: string) => sLabel.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
		const [newsResponse, translationResponse] = await Promise.all([
			this._endUserResponse ? Promise.resolve(this._endUserResponse) : (HttpHelper.GetJSON(sUrl) as Promise<{ value: INewsFeed[] }>),
			this.getTranslatedText(this.getCustomFeedKey())
		]);
		let aNews: INewsFeed[] = JSON.parse(JSON.stringify((newsResponse as INewsResponse).value || [])) as INewsFeed[];
		const aTranslation = JSON.parse(JSON.stringify((translationResponse as INewsResponse).value || [])) as ITranslatedText[];
		aNews = this.filterNewsOnTitle(aNews, newsTitle);
		return aNews.map((oNews: INewsFeed) => {
			const aFields = Object.keys(oNews);
			const aExpandFields: INewsLink[] = [];
			aFields.forEach((oField) => {
				const oTranslatedField = aTranslation.find(
					(oTranslation: ITranslatedText) => oTranslation?.ColumnName?.toUpperCase() === oField.toUpperCase()
				);
				const oTranslatedFieldName = (oTranslatedField?.TranslatedName as string) || fnFormattedLabel(oField);
				oNews[oField] = { label: oTranslatedFieldName, value: oNews[oField] as string } as INewsLink;
				if (!CUSTOM_NEWS_FEED.EXCLUDE_FIELDS.includes(oField)) {
					aExpandFields.push(oNews[oField] as INewsLink);
				}
			});
			oNews.Link = {
				label: this._i18nBundle.getText("readMoreLink") as string,
				value: oNews[CUSTOM_NEWS_FEED.LINK] as string,
				text: "Link"
			};
			oNews.expanded = aNews.length === 1;
			oNews.expandFields = aExpandFields;
			return oNews;
		});
	}

	/**
	 * Filters the news feed data based on the LOB title for the news detail dialog
	 *
	 * @private
	 * @param {INewsFeed[]} aNews complete news feed data
	 * @param {?string} [newsTitle] title of the line of business to be filtered on
	 * @returns {INewsFeed[]} filtered news feed for provided LOB title
	 */
	private filterNewsOnTitle(aNews: INewsFeed[], newsTitle?: string): INewsFeed[] {
		if (newsTitle) {
			return aNews.filter((newsDetail: INewsFeed) => {
				return (newsDetail.LineOfBusiness as INewsLink).value === newsTitle;
			});
		}
		return aNews;
	}

	/**
	 * Retrieves translated text for news feed fields based on the specified feed ID.
	 * @param {string} sFeedId - The ID of the custom news feed
	 * @returns {Promise} A promise resolving to the translated text for news feed fields.
	 */
	private getTranslatedText(sFeedId: string) {
		try {
			const sUrl = NEWS_FEED_TRANSLATION_API + "?$filter=Changeid eq '" + sFeedId + "'";
			if (!this.customNewsFeedCache.has(sUrl)) {
				this.customNewsFeedCache.set(sUrl, HttpHelper.GetJSON(sUrl) as Promise<INewsFeed[]>);
			}
			return this.customNewsFeedCache.get(sUrl);
		} catch (err) {
			if (err instanceof Error) {
				Log.error(err.message);
			}
			return [];
		}
	}

	/**
	 * Loads custom news feed into the news panel after parsing JSON feed data to XML format.
	 * @param {Array} feeds - The array of custom news feed items.
	 */
	private async loadCustomNewsFeed(feeds: INewsFeed[], feedType: string) {
		const oXMLResponse = this.parseJsonToXml(JSON.parse(JSON.stringify(feeds)) as JSON[], feedType);
		const oParent = this.getParent() as NewsAndPagesContainer;
		if (!this.oNewsModel) {
			this.oNewsModel = new XMLModel(oXMLResponse);
			if (!this.bNewsLoad) {
				oParent?.panelLoadedFn("News", { loaded: true, count: DEFAULT_FEED_COUNT });
				this.bNewsLoad = true;
			}
			this.oNewsTile.setModel(this.oNewsModel);
		} else {
			this.oNewsTile.unbindAggregation("tiles", false); // Unbind the bound aggregation
			this.oNewsTile.destroyAggregation("tiles"); // Removes old tiles
			this.oNewsModel.setData(oXMLResponse);
		}
		await this.loadNewsFeed(oXMLResponse, feeds.length);
	}

	/**
	 * Parses JSON data into XML format.
	 * @param {JSON[]} json - The JSON data to be parsed into XML.
	 * @returns {XMLDocument} The XML document representing the parsed JSON data.
	 */
	private parseJsonToXml(json: JSON[], feedType: string): XMLDocument {
		const _transformJsonForXml = (aData: JSON[]) => aData.map((data: JSON) => ({ item: data }));
		const _jsonToXml = (json: JSON) => {
			let xml = "";
			let key: string;
			for (key in json) {
				const value = json[key as keyof typeof json];
				if (value) {
					if (typeof value === "object") {
						xml += `<${key}>${_jsonToXml(value)}</${key}>`;
					} else {
						xml += `<${key}>${value as string}</${key}>`;
					}
				}
			}
			return xml.replace(/<\/?\d+>/g, "");
		};
		const transformedJson: JSON = JSON.parse(JSON.stringify(_transformJsonForXml(json))) as JSON;
		let xml = "<?xml version='1.0' encoding='UTF-8'?>";
		const rootToken = feedType;
		xml += `<${rootToken}>`;
		xml += _jsonToXml(transformedJson);
		xml += `</${rootToken}>`;
		xml = xml.replaceAll("&", "&amp;");
		const parser = new DOMParser();
		return parser.parseFromString(xml, "text/xml");
	}

	/**
	 * Randomly selects an image from the available images for the feed item.
	 * @param {string} sFileName - The file name of the custom news feed item.
	 * @returns {string} The URL of the image for the feed item.
	 * @private
	 */
	private getCustomFeedImage(sFileName: string) {
		const sFileBasePath = sap.ui.require.toUrl(CUSTOM_NEWS_FEED.IMAGE_URL);
		let sFilePath = sFileBasePath + CUSTOM_IMAGES.default[0];
		const files = CUSTOM_IMAGES[sFileName] || [];
		let randomIndex = 0;
		if (files.length > 0) {
			const randomArray = new window.Uint32Array(1);
			window.crypto.getRandomValues(randomArray);
			randomIndex = randomArray[0] % 3;
			sFilePath = sFileBasePath + files[randomIndex];
		}
		return sFilePath;
	}

	/**
	 * Retrieves the default feed image for a given news feed.
	 *
	 * @param {INewsFeed} oFeed - The custom news feed object.
	 * @returns {string} The base64 encoded image string with the appropriate MIME type, or an empty string if no valid image is found.
	 * @private
	 */
	private getDefaultFeedImage(oFeed: INewsFeed): string {
		const imgId = oFeed?.bg_image_id;
		const groupImg = oFeed?._group_to_image;
		const getRandomDefaultImage = () => {
			const sPrefix = sap.ui.require.toUrl("sap/cux/home/img");
			const random = Math.floor(Math.random() * 15) + 1;
			return `${sPrefix}/${random}.jpg`;
		};
		if (!groupImg || groupImg?.image_id !== imgId || !groupImg?.bg_image) {
			return getRandomDefaultImage();
		}

		let mimeType = groupImg?.mime_type;
		const groupBgImg = groupImg?.bg_image;

		if (mimeType === "application/octet-stream") {
			mimeType = "image/jpeg";
		}

		// if the image is not a valid base64 string, convert it to a standard base64 string
		// and return the data URL else return the data URL directly
		if (!this.isValidBase64(groupBgImg)) {
			const base64Data = this.base64UrlToBase64(groupBgImg);
			return `data:${mimeType};base64,${base64Data}`;
		}
		return `data:${mimeType};base64,${groupBgImg}`;
	}

	/**
	 * Converts a base64 URL string to a standard base64 string.
	 *
	 * @param {string} base64Url - The base64 URL string to convert.
	 * @returns {string} The converted base64 string.
	 * @private
	 */
	private base64UrlToBase64(base64Url: string) {
		let base64 = base64Url?.replace(/_/g, "/").replace(/-/g, "+");

		// Add padding if missing (Base64 should be a multiple of 4)
		while (base64.length % 4 !== 0) {
			base64 += "=";
		}
		return base64;
	}

	/**
	 * Checks if a string is a valid base64 encoded string.
	 * @param input The string to validate
	 * @returns boolean indicating if the string is valid base64
	 * @private
	 */
	private isValidBase64(input: string): boolean {
		// Check if the string exists and isn't empty
		if (!input || input.length === 0) {
			return false;
		}

		// Canonical base64 strings use these characters
		// A-Z, a-z, 0-9, +, /, and = for padding
		const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

		// Check if the string matches the base64 character set
		if (!base64Regex.test(input)) {
			return false;
		}

		// Check if the length is valid
		// Base64 strings have a length that is a multiple of 4
		if (input.length % 4 !== 0) {
			return false;
		}

		// Check padding rules
		if (input.includes("=")) {
			// If there is padding, it must be at the end
			const paddingIndex = input.indexOf("=");
			const lastPaddingIndex = input.lastIndexOf("=");
			// Padding should only occur at the end
			if (paddingIndex !== input.length - (input.length - paddingIndex)) {
				return false;
			}

			// Can only have 1 or 2 padding characters
			if (input.length - paddingIndex > 2) {
				return false;
			}

			// Make sure all padding is at the end
			if (paddingIndex !== lastPaddingIndex && lastPaddingIndex !== paddingIndex + 1) {
				return false;
			}
		}

		return true;
	}

	private _getUserPersonalization() {
		const persContainerId = PersonalisationUtils.getPersContainerId(this);
		const ownerComponent = PersonalisationUtils.getOwnerComponent(this) as Component;
		return UshellPersonalizer.getInstance(persContainerId, ownerComponent);
	}
}
