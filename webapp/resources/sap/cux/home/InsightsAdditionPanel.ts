/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import CardHelper from "sap/insights/CardHelper";
import Button from "sap/m/Button";
import { BackgroundDesign, ButtonType } from "sap/m/library";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import VBox from "sap/m/VBox";
import Control from "sap/ui/core/Control";
import { Target } from "sap/ushell/services/Navigation";
import BaseLayout from "./BaseLayout";
import BaseSettingsPanel from "./BaseSettingsPanel";
import CardsPanel from "./CardsPanel";
import ContentAdditionDialog from "./ContentAdditionDialog";
import InsightsContainer from "./InsightsContainer";
import { ICardHelper, ICardHelperInstance, ICardManifest } from "./interface/CardsInterface";
import { CONTENT_ADDITION_PANEL_TYPES, FEATURE_TOGGLES, FESR_IDS } from "./utils/Constants";
import { isNavigationSupportedForFeature } from "./utils/FeatureUtils";
import { addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";

/**
 *
 * Class for Apps Addition Panel in MyHome.
 *
 * @extends BaseSettingsPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.136
 * @private
 *
 * @alias sap.cux.home.InsightsAdditionPanel
 */
export default class InsightsAdditionPanel extends BaseSettingsPanel {
	private addCardsButton!: Button;
	private cardHelperInstance!: ICardHelperInstance;
	private isPanelSupported!: boolean;
	private _latestGeneratedManifest!: ICardManifest;
	/**
	 * Init lifecycle method
	 *
	 * @public
	 * @override
	 */
	public init() {
		super.init();

		//setup panel
		this.setProperty("key", CONTENT_ADDITION_PANEL_TYPES.AI_INSIGHTS_CARDS);
		this.setProperty("title", this._i18nBundle.getText("insightsCards"));

		//setup actions
		this.addCardsButton = new Button(`${this.getId()}-add-cards-btn`, {
			text: this._i18nBundle.getText("addFromInsightsDialogBtn"),
			type: ButtonType.Emphasized,
			enabled: false,
			press: this.onPressAddCards.bind(this)
		});
		addFESRSemanticStepName(this.addCardsButton, FESR_EVENTS.PRESS, FESR_IDS.ADD_AI_CARD);
		this.addActionButton(this.addCardsButton);
		//setup content
		void this._setupContent();
		this.attachEvent("onDialogClose", this.resetAddCardInnerContent.bind(this));
	}

	/**
	 * Enables or disables the "Add Cards" button.
	 *
	 * @param {boolean} action - If true, the button is enabled; if false, it is disabled.
	 */
	private enableAddButton(action: boolean) {
		this.addCardsButton.setEnabled(action);
	}

	/**
	 * It sets up the content for the "Insights card" dialog.
	 * It fetches the inner dialog content for adding a card.
	 * Adds the VBox to the panel's content aggregation.
	 *
	 * This also enables the "Add" button once content is fetched.
	 *
	 * @private
	 * @returns {Promise<void>} A promise that resolves when setup is complete.
	 */
	private async _setupContent(): Promise<void> {
		try {
			const dialogContent = await this._fetchAddCardDialogContent();
			if (dialogContent) {
				const wrapperVBox = new VBox(`${this.getId()}-wrapperVBox`, {
					items: dialogContent,
					backgroundDesign: BackgroundDesign.Solid,
					height: "100%"
				});
				this.addAggregation("content", wrapperVBox);
			}
		} catch (error) {
			Log.error((error as Error).message);
		}
	}

	/**
	 * Fetches the dialog content for adding a new card and sets up the callback
	 * to handle the card generation event, storing the generated manifest and enabling the add button.
	 *
	 * @private
	 * @returns {Promise<Control[]>} A promise that resolves with an array of dialog content controls.
	 */
	private async _fetchAddCardDialogContent(): Promise<Control[]> {
		this.cardHelperInstance = await (CardHelper as ICardHelper).getServiceAsync();
		return this.cardHelperInstance.fetchAddCardInnerContent((event) => {
			this._latestGeneratedManifest = event.getParameters();
			const isValidManifest = Object.keys(this._latestGeneratedManifest).length > 1;
			this.enableAddButton(isValidManifest);
		});
	}

	/**
	 * Retrieves the InsightsContainer instance from the parent layout.
	 *
	 * @private
	 * @returns {InsightsContainer | undefined} The InsightsContainer instance or undefined if not found.
	 */
	private getInsightsContainer(): InsightsContainer | undefined {
		const layout = this.getParent()?.getParent() as BaseLayout;
		return layout.getContent().find((container) => container instanceof InsightsContainer);
	}

	/**
	 * Checks if the Insights Addition Panel is supported.
	 *
	 * @public
	 * @async
	 * @returns {Promise<boolean>} A promise that resolves to true if supported.
	 */
	public async isSupported(): Promise<boolean> {
		const insightsCardIntent: Target = {
			target: {
				semanticObject: "IntelligentPrompt",
				action: "personalize"
			}
		};
		if (this.isPanelSupported === undefined) {
			this.isPanelSupported = false;
			this.isPanelSupported = await isNavigationSupportedForFeature(FEATURE_TOGGLES.AI_GENERATED_CARD, insightsCardIntent);
		}
		//remove panel if it's not supported
		if (!this.isPanelSupported) {
			this.removeActionButton(this.addCardsButton);
			const contentAdditionDialog = this.getParent() as ContentAdditionDialog;
			contentAdditionDialog.removePanel(this);
			contentAdditionDialog.updateActionButtons();
		}
		return this.isPanelSupported;
	}

	/**
	 * Retrieves the `CardsPanel` instance from the `InsightsContainer`.
	 *
	 * @private
	 * @returns {CardsPanel | undefined} The found `CardsPanel` instance, or `undefined` if not found.
	 */
	private _fetchCardsPanel(): CardsPanel | undefined {
		return this.getInsightsContainer()
			?.getContent()
			.find((panel): panel is CardsPanel => panel instanceof CardsPanel);
	}

	/**
	 * Handles the logic for creating and adding a new insight card to cards Panel.
	 *
	 * - Sets the dialog to busy while the card creation is in progress.
	 * - It adds a new card using the latest generated manifest.
	 * - On success, shows a message toast and closes the dialog.
	 * - Refreshes the insights cards panel data.
	 *
	 * @private
	 * @returns {Promise<void>} A promise that resolves when the card creation flow completes.
	 */
	private async onPressAddCards() {
		const addContentDialog = this.getParent() as ContentAdditionDialog;
		try {
			addContentDialog.setBusy(true);

			const createdCardResponse = await this.cardHelperInstance._createCard(this._latestGeneratedManifest);
			const cardTitle = createdCardResponse["sap.card"]?.header?.title;
			MessageToast.show(this._i18nBundle.getText("Card_Created", [cardTitle]) as string);
			addContentDialog.close();
			if (!createdCardResponse?.["sap.insights"]?.visible) {
				MessageBox.information(this._i18nBundle.getText("INT_CARD_LIMIT_MESSAGEBOX") as string, {
					styleClass: "msgBoxAlign"
				});
			}

			const cardsPanel = this._fetchCardsPanel();
			await cardsPanel?.refreshData();
		} catch (error) {
			Log.error((error as Error).message);
		} finally {
			addContentDialog.setBusy(false);
		}
	}

	/**
	 * Resets the internal content related to card addition.
	 * Disables the "Add" button.
	 *
	 * @private
	 */
	private resetAddCardInnerContent() {
		this.cardHelperInstance?.resetAddCardInnerContent();
		this.enableAddButton(false);
	}
}
