/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Button from "sap/m/Button";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import VBox from "sap/m/VBox";
import { MetadataOptions } from "sap/ui/core/Component";
import BasePanel from "./BasePanel";
import { $ErrorPanelSettings } from "./ErrorPanel";
import InsightsContainer from "./InsightsContainer";
import { SETTINGS_PANELS_KEYS } from "./utils/Constants";

/**
 *
 * Panel class for displaying Error Message.
 *
 * @extends sap.cux.home.BasePanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.122.0
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.ErrorPanel
 */

export default class ErrorPanel extends BasePanel {
	constructor(idOrSettings?: string | $ErrorPanelSettings);
	constructor(id?: string, settings?: $ErrorPanelSettings);
	/**
	 * Constructor for a new Error Panel.
	 *
	 * @param {string} [id] ID for the new panel, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new panel
	 */
	public constructor(id?: string, settings?: $ErrorPanelSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Title text of the message.
			 */
			messageTitle: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Description text of the message.
			 */
			messageDescription: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Action button displayed with the message.
			 */
			actionButton: { type: "sap.m.Button", group: "Misc" }
		},
		aggregations: {
			/**
			 * Specifies the content aggregation of the panel.
			 */
			content: { multiple: true, singularName: "content", visibility: "hidden" }
		}
	};
	private _oWrapperNoCardsVBox!: VBox;

	getData() {
		this.setProperty("enableSettings", false);
		if (!this._oWrapperNoCardsVBox) {
			const oIllustratedMessage = new IllustratedMessage(`${this.getId()}-errorPanelIllustratedMessage`, {
				illustrationSize: IllustratedMessageSize.ExtraSmall,
				illustrationType: IllustratedMessageType.AddDimensions,
				title: this.getProperty("messageTitle") as string,
				description: this.getProperty("messageDescription") as string,
				additionalContent: [
					new Button(`${this.getId()}-addInsightsBtn`, {
						text: this._i18nBundle.getText("manageInsightBtn"),
						type: "Emphasized",
						press: this.handleAddInsights.bind(this)
					})
				]
			}).addStyleClass("sapUiTinyMarginTop");

			this._oWrapperNoCardsVBox = new VBox(`${this.getId()}-wrapperNoCardsVBox`, {
				backgroundDesign: "Solid"
			}).addStyleClass("sapUiSmallMarginTop");
			const oActionButton = this.getProperty("actionButton") as Button;
			if (oActionButton) {
				oIllustratedMessage.insertAdditionalContent(oActionButton, 0);
			}
			this._oWrapperNoCardsVBox.addItem(oIllustratedMessage);
			this.addContent(this._oWrapperNoCardsVBox);
		}
	}

	/**
	 * Opens the Insights Cards dialog.
	 * @private
	 */
	private handleAddInsights() {
		const parentContainer = this.getParent() as InsightsContainer;
		parentContainer?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_CARDS);
	}
}
