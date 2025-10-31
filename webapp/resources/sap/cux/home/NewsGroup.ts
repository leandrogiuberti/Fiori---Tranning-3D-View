/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Button from "sap/m/Button";
import CustomListItem from "sap/m/CustomListItem";
import Dialog from "sap/m/Dialog";
import GenericTile from "sap/m/GenericTile";
import HBox from "sap/m/HBox";
import Image from "sap/m/Image";
import Label from "sap/m/Label";
import { FlexAlignItems, FlexRendertype, Priority } from "sap/m/library";
import Link from "sap/m/Link";
import List from "sap/m/List";
import ObjectStatus from "sap/m/ObjectStatus";
import Text from "sap/m/Text";
import Title from "sap/m/Title";
import VBox from "sap/m/VBox";
import Event from "sap/ui/base/Event";
import CustomData from "sap/ui/core/CustomData";
import type { MetadataOptions } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
import HTML from "sap/ui/core/HTML";
import Icon from "sap/ui/core/Icon";
import { TitleLevel } from "sap/ui/core/library";
import BaseNewsItem from "./BaseNewsItem";
import { NewsType } from "./library";
import NewsAndPagesContainer from "./NewsAndPagesContainer";
import { $NewsGroupSettings } from "./NewsGroup";
import NewsItem from "./NewsItem";
import NewsPanel, { INewsFeed, INewsItem, INewsLink, INewsParam } from "./NewsPanel";
import { recycleId } from "./utils/DataFormatUtils";
import { addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";

/**
 *
 * Class for managing and storing News Group items.
 *
 * @extends sap.cux.home.BaseNewsItem
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 * @private
 *
 * @alias sap.cux.home.NewsGroup
 */
export default class NewsGroup extends BaseNewsItem {
	private oNewsGroupDialog!: Dialog;
	private oNewsGroupImage!: Image;
	private oNewsList!: List;
	private currentDefaultGroup!: INewsFeed;
	private criticalStatus!: ObjectStatus;

	constructor(idOrSettings?: string | $NewsGroupSettings);
	constructor(id?: string, settings?: $NewsGroupSettings);
	constructor(id?: string, settings?: $NewsGroupSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		aggregations: {
			/**
			 * newsItems aggregation of the news. These items will be shown in a dialog on click of the news
			 */
			newsItems: { type: "sap.cux.home.NewsItem", singularName: "newsItem", multiple: true }
		}
	};

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();
		this._oTile.attachPress(this, this.pressNewsItem.bind(this));
		this.createNewsGroupDialog();
	}

	/**
	 * Handles the press event on the news item, opens the dialog.
	 * @returns {void}
	 */
	private pressNewsItem(oEvent: Event): void {
		const tile = oEvent.getSource();
		if (!(tile as GenericTile).getProperty("pressEnabled")) {
			// Prevent dialog opening if the tile's pressEnabled is false
			return;
		}
		void this.openNewsGroupDialog();
	}

	/**
	 * Opens the dialog for news details
	 * @returns {Promise<void>}
	 */
	private async openNewsGroupDialog(): Promise<void> {
		this.oNewsList?.setBusy(true);
		const oNewsPanel = this.getParent() as NewsPanel;
		const customFileName = oNewsPanel.getProperty("customFileName") as string;
		const isCSVFileFormat = customFileName.split(".").pop()?.toLowerCase() === "csv";
		const endUserChanges = (oNewsPanel.getParent() as NewsAndPagesContainer).getIsEndUserChange();
		const feedType = (endUserChanges.newsType || oNewsPanel.getProperty("type")) as NewsType;
		const sImageUrl = this.getImageUrl();
		const persDataNewsFeed = oNewsPanel.getPersDataNewsFeed();
		let newsFeedData: INewsFeed[] = [];
		let imgData;
		const sUrl = oNewsPanel.getUrl();
		let showDefault = feedType === NewsType.Default;
		if (!showDefault) {
			const oNewsConfig: INewsItem = {
				changeId: oNewsPanel.getCustomFeedKey(),
				title: this.getTitle(),
				showAllPreparationRequired: isCSVFileFormat ? false : !persDataNewsFeed ? true : persDataNewsFeed.showAllPreparationRequired
			};

			this.oNewsGroupDialog?.open();
			const sNewsFeedURL = endUserChanges.isEndUser ? sUrl : oNewsPanel.getNewsFeedDetailsUrl(oNewsConfig);

			newsFeedData = (await oNewsPanel.getAuthNewsFeed(sNewsFeedURL, oNewsConfig.title)) as INewsFeed[];
		} else {
			this.criticalStatus.setVisible(this.getPriority() === Priority.Medium);

			this.oNewsGroupDialog?.open();
			this.currentDefaultGroup = oNewsPanel.getCurrentNewsGroup(this.getId()) as INewsFeed;
			newsFeedData = (this.currentDefaultGroup?._group_to_article as INewsFeed[]) || [];
			imgData = this.currentDefaultGroup?._group_to_image as Record<string, string>;
			if (imgData?.image_alt_text) {
				this.oNewsGroupImage?.setAlt(imgData.image_alt_text);
			}
		}
		this.oNewsGroupDialog?.setTitle(this.getTitle());
		this.oNewsGroupImage?.setSrc(sImageUrl);
		this.loadNewsDetails(newsFeedData);
		this.oNewsList?.setBusy(false);
	}

	/**
	 * Iterate through the provided news details data and loads the news items
	 * @param {INewsFeed[]} aNewsDetails array of news items to be shown in the list
	 * @returns {void}
	 */
	private loadNewsDetails(aNewsDetails: INewsFeed[]): void {
		this.clearExistingNewsItems();
		const oNewsPanel = this.getParent() as NewsPanel;
		const showDefault = oNewsPanel?.getNewsType() === NewsType.Default;
		(aNewsDetails || []).forEach((oItem: INewsFeed, i: number) => {
			const newsItemInstance = new NewsItem(recycleId(`${this.getId()}--newsItem--${i}`), {
				title: showDefault ? oItem.title : (oItem.Title as INewsLink).value,
				subTitle: showDefault ? oItem.subTitle : (oItem.Description as INewsLink).value,
				footer: showDefault ? oItem.footer_text : "",
				imageUrl: showDefault ? this.getImageUrl() : "",
				priority: showDefault && oItem.priority == "1" ? Priority.Medium : Priority.None,
				priorityText: showDefault && oItem.priority == "1" ? this._i18nBundle.getText("criticalNews") : ""
			});
			this.addAggregation("newsItems", newsItemInstance);

			this.oNewsList?.addItem(this.generateNewsListTemplate(oItem, i));
		});
	}

	/**
	 * Clears the existing news items from the dialog list and aggregation
	 * @returns {void}
	 */
	private clearExistingNewsItems(): void {
		// Destroy list items
		this.oNewsList?.destroyAggregation("items", true);
		this.destroyAggregation("newsItems", true);
	}
	/**
	 * Generates the custom list item templates for the news details
	 * @param {INewsFeed} oItem news feed item for binding the template
	 * @param {number} i index of the item
	 * @returns {CustomListItem} the template of list item to be shown in the dialog
	 */
	private generateNewsListTemplate(oItem: INewsFeed, i: number): CustomListItem {
		const oNewsPanel = this.getParent() as NewsPanel;
		const showDefault = oNewsPanel?.getNewsType() === NewsType.Default;
		if (!showDefault) {
			const oFieldVBox = new VBox(recycleId(this.getId() + "--idNewsFieldsBox" + "--" + i)).addStyleClass("newsListItemContainer");
			((oItem?.expandFields as INewsLink[]) || []).forEach((oField, idx) => {
				oFieldVBox.addItem(
					new HBox(recycleId(this.getId() + "--idNewsFieldHBox--" + idx), {
						items: [
							new Label(recycleId(this.getId() + "--idNewsFieldsLabel--" + idx), {
								text: oField.label + ":",
								tooltip: oField.label
							}),
							new Text(recycleId(this.getId() + "--idNewsFieldsValue--" + idx), {
								text: oField.value
							})
						]
					}).addStyleClass("newsListItemContainer")
				);
			});
			oFieldVBox.setVisible(false);
			const sInitialText = this._i18nBundle.getText("expand") as string;
			const oExpandButton = new Button(`${this.getId()}--expand--${i}`, {
				text: sInitialText,
				press: this.handleShowNewsFeedDetails.bind(this),
				customData: new CustomData({
					key: "index",
					value: i
				})
			});
			addFESRSemanticStepName(oExpandButton, FESR_EVENTS.PRESS, sInitialText);

			return new CustomListItem(recycleId(`${this.getId()}--idNewsDetailItem--${i}`), {
				content: [
					new VBox(recycleId(`${this.getId()}--newsList--${i}`), {
						items: [
							new Title(recycleId(`${this.getId()}--newsTitle--${i}`), {
								text: (oItem.Title as INewsLink).value,
								titleStyle: "H6"
							}),
							new Text(recycleId(`${this.getId()}--newsText--${i}`), {
								text: (oItem.Description as INewsLink).value
							}),
							new HBox(recycleId(`${this.getId()}--newsHBox--${i}`), {
								items: [
									new Label(recycleId(`${this.getId()}--newsLabel--${i}`), {
										text: (oItem.Type as INewsLink).label + ":",
										tooltip: (oItem.Type as INewsLink).label
									}),
									new Text(recycleId(`${this.getId()}--newsItemText--${i}`), {
										text: (oItem.Type as INewsLink).value
									})
								]
							}).addStyleClass("newsListItemContainer"),
							new HBox(recycleId(`${this.getId()}--newsListItemBox--${i}`), {
								items: [
									new Label(recycleId(`${this.getId()}--newsListItemLabel--${i}`), {
										text: this._i18nBundle.getText("readMoreLink") + ":",
										tooltip: (oItem.Link as INewsParam).value.label + ""
									}),
									new Link(recycleId(`${this.getId()}--newsListItemLink--${i}`), {
										href: (oItem.Link as INewsParam).value.value + "",
										text: (oItem.Link as INewsParam).text,
										target: "_blank"
									})
								]
							}).addStyleClass("newsListItemContainer"),
							oFieldVBox,
							oExpandButton
						]
					}).addStyleClass("newsListItemContainer")
				]
			}).addStyleClass("newsListItem");
		} else {
			return new CustomListItem(recycleId(`${this.getId()}--idDefaultNewsDetailItem--${i}`), {
				content: [
					new VBox(recycleId(`${this.getId()}--defaultNewsItemVbox--${i}`), {
						renderType: FlexRendertype.Bare,
						items: [
							new HBox(recycleId(`${this.getId()}--defaultNewsItemTitle--${i}`), {
								alignItems: FlexAlignItems.Center,
								renderType: FlexRendertype.Bare,
								items: [
									new Icon(recycleId(`${this.getId()}--newsPriorityIcon--${i}`), {
										src: "sap-icon://high-priority",
										width: "1rem",
										height: "1rem",
										size: "1rem",
										visible: oItem.priority === "1",
										tooltip: this._i18nBundle.getText("criticalNewsIcon") as string
									}).addStyleClass("newsCriticalIconColor"),
									new Title(recycleId(`${this.getId()}--newsTitle--${i}`), {
										text: oItem.title,
										titleStyle: TitleLevel.H5
									})
								]
							}).addStyleClass("newsListItemContainer"),
							new Title(recycleId(`${this.getId()}--newsSubTitle--${i}`), {
								text: oItem.subTitle,
								visible: !!oItem.subTitle,
								titleStyle: TitleLevel.H6
							}),
							new HTML(recycleId(`${this.getId()}--defaultNewsItemHTML--${i}`), {
								// add an outer div to add CSS class for styling
								content: `<div class="newsGroupHtmlContent">${oItem.description}</div>`
							})
						]
					}).addStyleClass("newsListItemContainer")
				]
			}).addStyleClass("newsListItem");
		}
	}

	/**
	 * Creates the dialog which contains the news detail items
	 * @returns {void}
	 */
	private createNewsGroupDialog(): void {
		//create the dialog template without binding
		if (!this.oNewsGroupDialog) {
			this.oNewsGroupImage = new Image(recycleId(`${this.getId()}-custNewsImage`), {
				width: "100%",
				height: "100%",
				src: "/resources/sap/cux/home/img/CustomNewsFeed/SupplyChain/3.jpg"
			}).addStyleClass("newsGroupDialogImage");
			this.oNewsList = new List(recycleId(`${this.getId()}-custNewsList`)).addStyleClass("sapUiSmallMarginBottom");
			this.criticalStatus = new ObjectStatus(recycleId(`${this.getId()}-newsDialogCriticalStatus`), {
				visible: false,
				text: this._i18nBundle.getText("criticalNews") as string,
				inverted: true,
				icon: "sap-icon://high-priority",
				state: "Warning"
			}).addStyleClass("newsGroupDialogPriorityStatus");
			let oImagePriorityVBox = new VBox(recycleId(`${this.getId()}-newsDialogPriorityVBox`), {
				renderType: FlexRendertype.Bare,
				height: "15rem",
				items: [this.oNewsGroupImage, this.criticalStatus]
			}).addStyleClass("newsDialogPriorityVBox");
			const closeButton = new Button(recycleId(`${this.getId()}-custNewsFeedDetailsCloseBtn`), {
				text: this._i18nBundle.getText("XBUT_CLOSE"),
				press: this.closeNewsGroupDialog.bind(this),
				type: "Transparent"
			});
			addFESRSemanticStepName(closeButton, FESR_EVENTS.PRESS, "newsDlgCloseBtn");
			this.oNewsGroupDialog = new Dialog(recycleId(`${this.getId()}-custNewsFeedDetailsDialog`), {
				title: this.getTitle() || "",
				contentWidth: "52rem",
				contentHeight: "calc(100% - 2.5rem)",
				content: [oImagePriorityVBox, this.oNewsList],
				buttons: [closeButton]
			});
			this.addDependent(this.oNewsGroupDialog);
		}
	}

	/**
	 * Closes the news details dialog
	 * @returns {void}
	 */
	private closeNewsGroupDialog(): void {
		// Close the dialog first
		this.oNewsGroupDialog?.close();
	}

	/**
	 * Handles the click on the show more button of news detail items in news group dialog
	 * @param {Event} oEvent
	 * @returns {void}
	 */
	private handleShowNewsFeedDetails(oEvent: Event): void {
		const oButton = oEvent.getSource<Button>();
		const listItemIndex = oButton.data("index") as number;
		const fieldsVBox = Element.getElementById(this.getId() + "--idNewsFieldsBox" + "--" + listItemIndex) as VBox;
		const fieldExpanded: boolean = fieldsVBox.getVisible();
		fieldsVBox.setVisible(!fieldExpanded);
		const sButtonShowText = fieldExpanded
			? (this._i18nBundle.getText("expand") as string)
			: (this._i18nBundle.getText("collapse") as string);
		oButton.setText(sButtonShowText);
		addFESRSemanticStepName(oButton, FESR_EVENTS.PRESS, sButtonShowText);
	}
}
