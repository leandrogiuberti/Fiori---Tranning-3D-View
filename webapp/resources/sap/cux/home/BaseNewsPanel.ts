/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Button from "sap/m/Button";
import FlexItemData from "sap/m/FlexItemData";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import VBox from "sap/m/VBox";
import type { MetadataOptions } from "sap/ui/core/Element";
import VerticalLayout from "sap/ui/layout/VerticalLayout";
import { $BaseNewsPanelSettings } from "./BaseNewsPanel";
import BasePanel from "./BasePanel";
import NewsAndPagesContainer from "./NewsAndPagesContainer";
import { SETTINGS_PANELS_KEYS } from "./utils/Constants";

/**
 *
 * Base Panel class for managing and storing News.
 *
 * @extends sap.cux.home.BasePanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @abstract
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BaseNewsPanel
 */
export default abstract class BaseNewsPanel extends BasePanel {
	constructor(idOrSettings?: string | $BaseNewsPanelSettings);
	constructor(id?: string, settings?: $BaseNewsPanelSettings);
	/**
	 * Constructor for a new Base News Panel.
	 *
	 * @param {string} [id] ID for the new panel, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new panel
	 */
	public constructor(id?: string, settings?: $BaseNewsPanelSettings) {
		super(id, settings);
	}

	private errorCard!: VBox;
	private newsVerticalLayout!: VerticalLayout;
	private newsWrapper!: VBox;
	private manageNewsButton!: Button;

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		aggregations: {
			/**
			 * Specifies the content aggregation of the panel.
			 */
			content: { multiple: true, singularName: "content", visibility: "hidden" },
			/**
			 * Holds the news aggregation
			 */
			newsItems: { type: "sap.cux.home.BaseNewsItem", singularName: "newsItem", multiple: true }
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

		this.newsVerticalLayout = new VerticalLayout(`${this.getId()}-newsContent`, {
			content: [this.generateErrorMessage()],
			layoutData: new FlexItemData({
				id: `${this.getId()}-flexItemdata`,
				order: 0,
				growFactor: 1
			})
		}).setWidth("100%");
		this.newsWrapper = new VBox(`${this.getId()}-newsContentWrapper`, { items: [this.newsVerticalLayout] });
		this.addContent(this.newsWrapper);
	}

	/**
	 * Generates app wrapper for displaying apps.
	 * @private
	 * @returns The generated apps wrapper.
	 */
	public getNewsWrapper(): VerticalLayout {
		return this.newsVerticalLayout;
	}

	/**
	 * Generates the error message wrapper with illustrated message.
	 * @private
	 * @returns Wrapper with illustrated message.
	 */
	protected generateErrorMessage(): VBox {
		if (!this.errorCard) {
			this.manageNewsButton = new Button(`${this.getId()}-idManageNewsBtn`, {
				text: this._i18nBundle.getText("editLinkNews"),
				tooltip: this._i18nBundle.getText("editLinkNews"),
				type: "Emphasized",
				press: this.handleEditNews.bind(this)
			});
			const oErrorMessage = new IllustratedMessage(`${this.getId()}-errorMessage`, {
				illustrationSize: IllustratedMessageSize.Small,
				illustrationType: IllustratedMessageType.NoNotifications,
				title: this._i18nBundle.getText("noNewsTitle"),
				description: this._i18nBundle.getText("noNewsDescription"),
				additionalContent: [this.manageNewsButton]
			}).addStyleClass("customIllustratedMessage");
			this.errorCard = new VBox(`${this.getId()}-errorCard`, {
				wrap: "Wrap",
				backgroundDesign: "Solid",
				items: [oErrorMessage],
				visible: false,
				height: "17rem",
				width: "100%"
			}).addStyleClass("sapUiRoundedBorder noCardsBorder sapUiSmallMarginTopBottom");
		}
		return this.errorCard;
	}

	/**
	 * Set the visibility of the manage news button.
	 * @param visible - A boolean indicating whether the manage news should be visible or not.
	 * @private
	 */
	protected setManageNewsButtonVisibility(visible: boolean): void {
		this.manageNewsButton.setVisible(visible);
	}

	/**
	 * Handles the edit news event.
	 * Opens the news dialog for managing news data.
	 * @private
	 */
	protected handleEditNews() {
		const parentContainer = this.getParent() as NewsAndPagesContainer;
		parentContainer?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.NEWS);
	}
}
