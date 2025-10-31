/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import CheckBox from "sap/m/CheckBox";
import CustomListItem from "sap/m/CustomListItem";
import HBox from "sap/m/HBox";
import Label from "sap/m/Label";
import List from "sap/m/List";
import ListItemBase from "sap/m/ListItemBase";
import Switch from "sap/m/Switch";
import Text from "sap/m/Text";
import Title from "sap/m/Title";
import VBox from "sap/m/VBox";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import CustomData from "sap/ui/core/CustomData";
import BaseSettingsPanel from "./BaseSettingsPanel";
import { NewsType } from "./library";
import NewsAndPagesContainer from "./NewsAndPagesContainer";
import NewsPanel, { INewsFeed } from "./NewsPanel";
import { getInvisibleText } from "./utils/Accessibility";
import { SETTINGS_PANELS_KEYS } from "./utils/Constants";
import { addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";
import PersonalisationUtils from "./utils/PersonalisationUtils";
import UshellPersonalizer from "./utils/UshellPersonalizer";

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
	private oShowSwitch!: Switch;
	private oCustNewsSwitchContainer!: HBox;
	private oList!: List;
	private oPersonalizer!: UshellPersonalizer;
	private oNewsPanel!: NewsPanel;
	private aFavNewsFeed!: INewsFeed[] | string[];
	private deselectedDefaultFeeds!: string[];
	private headerText!: Text;
	private title!: Title;

	/**
	 * Init lifecycle method
	 *
	 * @public
	 * @override
	 */
	public init(): void {
		super.init();

		//setup panel
		this.setProperty("key", SETTINGS_PANELS_KEYS.NEWS);
		this.setProperty("title", this._i18nBundle.getText("news"));
		this.setProperty("icon", "sap-icon://newspaper");

		//setup layout content
		this.addAggregation("content", this.getContent());

		//fired every time on panel navigation
		this.attachPanelNavigated(() => {
			void this.loadNewsFeedSettings();
		});
		this.aFavNewsFeed = [];
	}

	/**
	 * Returns the content for the News Settings Panel.
	 *
	 * @private
	 * @returns {Control} The control containing the News Settings Panel content.
	 */
	private getContent(): Control {
		const oHeader = this.setHeader();
		const oTitle = this.setTitleMessage();
		const oContentVBox = new VBox(this.getId() + "--idNewsPageOuterVBoX", {
			alignItems: "Start",
			justifyContent: "SpaceBetween",
			items: [oHeader, oTitle, this.setNewsList()]
		});
		return oContentVBox;
	}

	/**
	 * Get personalization instance
	 */
	private async getPersonalization() {
		if (!this.oPersonalizer) {
			this.oPersonalizer = await UshellPersonalizer.getInstance(
				PersonalisationUtils.getPersContainerId(this._getPanel()),
				PersonalisationUtils.getOwnerComponent(this._getPanel()) as Component
			);
		}
		return this.oPersonalizer;
	}

	/**
	 * Returns the content for the News Settings Panel Header.
	 *
	 * @private
	 * @returns {sap.ui.core.Control} The control containing the News Settings Panel's Header content.
	 */
	private setHeader() {
		this.headerText = new Text(this.getId() + "--idCustNewsFeedSettingsText", {
			text: this._i18nBundle.getText("newsFeedSettingsText")
		});
		const oHeaderVBox = new VBox(this.getId() + "--idCustNewsFeedSettingsTextContainer", {
			alignItems: "Start",
			justifyContent: "SpaceBetween",
			items: [this.headerText]
		}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
		return oHeaderVBox;
	}

	/**
	 * Returns the content for the News Settings Panel Title description.
	 *
	 * @private
	 * @returns {sap.ui.core.Control} The control containing the News Settings Panel's Title description.
	 */
	private setTitleMessage() {
		this.title = new Title(this.getId() + "--idCustNewsFeedSettignsTitle", {
			text: this._i18nBundle.getText("newsFeedSettingsHeading"),
			titleStyle: "H3"
		});
		const oTitleHbox = new HBox(this.getId() + "--idCustNewsFeedSettingsTitleContainer", {
			alignItems: "Center",
			justifyContent: "SpaceBetween",
			items: [this.title]
		});
		const oTitleVBox = new VBox(this.getId() + "--idCustNewsFeedSettingsTitleVBox", {
			alignItems: "Start",
			justifyContent: "SpaceBetween",
			items: [oTitleHbox]
		}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
		return oTitleVBox;
	}

	/**
	 * Returns the content for the news List
	 *
	 * @private
	 * @returns {sap.ui.core.Control} The control containing the News Settings Panel's List
	 */
	private setNewsList() {
		//showAllPrepRequired Switch
		const oShowSwitchLabel = new Label(this.getId() + "--idShowAllCustNewsSwitchLabel", {
			text: this._i18nBundle.getText("showAllPreparationRequiredSwitchLabel")
		});
		this.oShowSwitch = new Switch(`${this.getId()}-showSwitch`, {
			// 'ariaLabelledBy': "idShowAllCustNewsSwitchLabel idShowAllCustNewsSwitch",
			customTextOn: " ",
			customTextOff: " ",
			change: () => {
				void this.saveNewsFeedSettings();
			},
			// 'fesr:change': "showPrepRequire",
			state: false,
			ariaLabelledBy: [`${this.getId()}--idShowAllCustNewsSwitchLabel`]
		});
		addFESRSemanticStepName(this.oShowSwitch, FESR_EVENTS.CHANGE, "showPrepRequire");
		this.oCustNewsSwitchContainer = new HBox(this.getId() + "--idShowAllCustNewsSwitchContainer", {
			alignItems: "Center",
			items: [oShowSwitchLabel, this.oShowSwitch],
			width: "94%"
		}).addStyleClass("sapUiSmallMarginTop");

		const oShowAllPrep = new VBox(this.getId() + "--idShowAllCustNewsSwitchVBox", {
			items: [this.oCustNewsSwitchContainer],
			width: "94%"
		}).addStyleClass("sapUiSmallMarginTop");
		const oInvisibleText = getInvisibleText(`${this.getId()}--newsTitleText`, this._i18nBundle.getText("newsTitle"));
		//List of news items
		this.oList = new List(this.getId() + "--idCustNewsFeedList", {
			ariaLabelledBy: [
				oInvisibleText.getId(),
				`${this.getId()}--idCustNewsFeedSettingsText`,
				`${this.getId()}--idCustNewsFeedSettignsTitle`
			]
		});
		//Outer VBox
		const oNewsListVBox = new VBox(this.getId() + "--idCustNewsFeedListContainer", {
			direction: "Column",
			items: [this.oList, oShowAllPrep, oInvisibleText],
			width: "96%"
		}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
		return oNewsListVBox;
	}

	/**
	 * Checks if the custom file format is CSV based on the custom file name.
	 *
	 * @param {string} fileName - The custom file name.
	 * @returns {boolean} True if the file format is CSV, otherwise false.
	 */
	private isCSVFileFormat(fileName: string): boolean {
		return fileName.split(".").pop()?.toLowerCase() === "csv";
	}

	/**
	 *
	 * Saves news feed settings and shows news feed based on selection change of list of switch
	 *
	 * @private
	 */
	private async saveNewsFeedSettings(): Promise<void> {
		const selectedFeeds: string[] = [];
		const deselectedDefaultFeeds: string[] = [];
		const newsType = this.oNewsPanel?.getNewsType();
		const showDefault = newsType === NewsType.Default;
		const customFileName = this.oNewsPanel.getProperty("customFileName") as string;
		const feedKey = this.oNewsPanel.getCustomFeedKey();

		this.oList.getItems().forEach((item: ListItemBase) => {
			const newsListContent = item.getAggregation("content") as Control[];
			const newsListHBox = newsListContent[0] as HBox;
			const [checkbox, label] = newsListHBox.getItems() as [CheckBox, Text];
			const isSelected = checkbox.getSelected();

			if (showDefault) {
				const groupId = this.getDefaultGroupId(newsListHBox);
				if (!isSelected && groupId) {
					deselectedDefaultFeeds.push(groupId);
				}
			} else if (isSelected) {
				selectedFeeds.push(label.getText());
			}
		});

		const personalizer = await this.getPersonalization();
		const personalizationData = (await personalizer.read()) || {};

		if (showDefault) {
			personalizationData.defaultNewsFeed = { items: deselectedDefaultFeeds };
		} else {
			personalizationData.favNewsFeed = {
				items: selectedFeeds,
				showAllPreparationRequired: this.isCSVFileFormat(customFileName) ? false : this.oShowSwitch.getState()
			} as IFavNewsFeed;
		}

		await personalizer.write(personalizationData);

		// get the latest value of switch and set the state
		if (!showDefault) {
			this.oShowSwitch.setState(personalizationData.favNewsFeed?.showAllPreparationRequired);
		}
		await this.oNewsPanel.setCustomNewsFeed(showDefault ? "" : feedKey);
	}

	/** Get groupId info  for the default NewsList
	 * @param {HBox} [contentBox] content Hbox
	 * @returns {string} groupId
	 * @private
	 */
	private getDefaultGroupId(contentBox: HBox): string {
		const customData = contentBox.getCustomData();
		return customData?.length ? (customData[0].getValue() as string) : "";
	}

	/** Set items for the NewsList
	 * @param {Array} [aItems] news items to be set as items aggregation
	 * @private
	 */
	private setItems(aItems: INewsFeed[]) {
		this.oList.destroyAggregation("items", true);
		const newsType = this.oNewsPanel?.getNewsType();
		let showDefault = newsType === NewsType.Default;
		(aItems || []).forEach((oItem: INewsFeed, i: number) => {
			let oNewsListItemHbox = new HBox({
				id: `${this.getId()}--idCustNewsFeedItemContent--${i}`,
				alignItems: "Center",
				items: [
					new CheckBox(`${this.getId()}--custNewsFeedItemCheckBox--${i}`, {
						select: () => {
							void this.saveNewsFeedSettings();
						},
						selected: oItem.selected as boolean,
						enabled: !oItem.disabled
					}),
					new Text(`${this.getId()}--custNewsFeedItemText--${i}`, { text: oItem.title })
				],
				width: "100%"
			});
			if (showDefault) {
				// if showDefault is true, add group_id as custom data to the item
				oNewsListItemHbox.addCustomData(new CustomData({ key: "newsGroupId", value: oItem.group_id }));
			}
			const customListItem = new CustomListItem({
				id: `${this.getId()}--idCustNewsFeedItem--${i}`,
				content: [oNewsListItemHbox]
			});
			this.oList.addItem(customListItem);
		});
	}

	/**
	 * Loads news feed settings
	 *
	 * @returns {Promise} resolves to news feed settings
	 */
	private async loadNewsFeedSettings(): Promise<INewsFeed[] | undefined> {
		this.oNewsPanel = this._getPanel() as NewsPanel;
		const sFeedKey = this.oNewsPanel.getCustomFeedKey();
		const newsType = this.oNewsPanel?.getNewsType();
		const showDefaultNewsFeed = newsType === NewsType.Default;

		const customFileName = this.oNewsPanel.getProperty("customFileName") as string;
		if (this.isCSVFileFormat(customFileName) || showDefaultNewsFeed) {
			this.oCustNewsSwitchContainer.setVisible(false);
		}

		const oPersonalizer = await this.getPersonalization();
		const oPersData = await oPersonalizer.read();
		const aPersNewsFeed = (showDefaultNewsFeed ? oPersData?.["defaultNewsFeed"] : oPersData?.["favNewsFeed"]) as IFavNewsFeed;
		const showAllPreparationRequired = aPersNewsFeed?.showAllPreparationRequired ?? !aPersNewsFeed;

		let aNewsFeed: INewsFeed[] = await this.oNewsPanel.getCustomOrDefaultNewsFeed(showDefaultNewsFeed ? "" : sFeedKey, false);

		if (showDefaultNewsFeed) {
			return this._handleDefaultNewsFeed(aNewsFeed, aPersNewsFeed);
		} else {
			return this._handleCustomNewsFeed(aNewsFeed, aPersNewsFeed, showAllPreparationRequired);
		}
	}

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
	private _handleDefaultNewsFeed(aNewsFeed: INewsFeed[], aPersNewsFeed: IFavNewsFeed): INewsFeed[] | undefined {
		this.headerText.setText(this._i18nBundle.getText("defaultNewsSettingsText"));
		this.title.setText(this._i18nBundle.getText("defaultNewsSettingsHeading"));
		const mandatoryNewsFeed = this.oNewsPanel.getMandatoryDefaultNewsFeed();
		this.deselectedDefaultFeeds = aPersNewsFeed?.items || [];

		if (!aNewsFeed || aNewsFeed.length === 0) {
			return;
		}

		aNewsFeed = aNewsFeed.map((oNewsFeed: INewsFeed) => {
			// if group_id not available in deselectedDefaultFeeds, then mark it as selected
			const isDeselected = oNewsFeed.group_id ? this.deselectedDefaultFeeds.includes(oNewsFeed.group_id) : false;
			oNewsFeed.selected = !aPersNewsFeed ? true : !isDeselected;
			// if group_id is available in mandatoryNewsFeed, then mark it as disabled, user cannot hide mandatory feeds
			if (mandatoryNewsFeed.includes(oNewsFeed.group_id ?? "")) {
				oNewsFeed.selected = true;
				oNewsFeed.disabled = true;
			}

			return oNewsFeed;
		});

		this.setItems(aNewsFeed);
		this.oShowSwitch.setState(false);
		return aNewsFeed;
	}

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
	private _handleCustomNewsFeed(
		aNewsFeed: INewsFeed[],
		aPersNewsFeed: IFavNewsFeed,
		showAllPreparationRequired: boolean
	): INewsFeed[] | undefined {
		this.headerText.setText(this._i18nBundle.getText("newsFeedSettingsText"));
		this.title.setText(this._i18nBundle.getText("newsFeedSettingsHeading"));

		if (!aNewsFeed || aNewsFeed.length === 0) {
			return;
		}

		const favFeedTitles: string[] = aPersNewsFeed?.items || aNewsFeed;
		aNewsFeed = aNewsFeed.map((oNewsFeed: INewsFeed) => {
			const isFavorite = favFeedTitles.includes(oNewsFeed.title);
			oNewsFeed.selected = !aPersNewsFeed ? true : isFavorite;
			return oNewsFeed;
		});

		this.aFavNewsFeed = aNewsFeed;
		this.setItems(this.aFavNewsFeed);
		this.oShowSwitch.setState(!!showAllPreparationRequired);
		return aNewsFeed;
	}

	/**
	 * Checks if the News Settings Panel is supported based on the properties of the News Panel.
	 *
	 * @returns {Promise<boolean>} A promise that resolves to true if the News Settings Panel is supported, otherwise false.
	 */
	public async isSupported(): Promise<boolean> {
		const newsPanel = this._getPanel() as NewsPanel;
		if (!newsPanel || !(newsPanel?.getParent() as NewsAndPagesContainer).getProperty("newsFeedVisibility")) {
			return Promise.resolve(false);
		}

		return Promise.resolve(
			(newsPanel.getNewsType() === NewsType.Custom || newsPanel.getNewsType() === NewsType.Default) &&
				!newsPanel.isNoUpdatesNewsFeed()
		);
	}
}
