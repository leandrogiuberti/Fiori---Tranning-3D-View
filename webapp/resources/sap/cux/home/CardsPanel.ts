/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import GridContainer from "sap/f/GridContainer";
import GridContainerSettings from "sap/f/GridContainerSettings";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import CardHelper from "sap/insights/CardHelper";
import InsightsInMemoryCachingHost from "sap/insights/base/InMemoryCachingHost";
import Button from "sap/m/Button";
import HBox from "sap/m/HBox";
import HeaderContainer from "sap/m/HeaderContainer";
import VBox from "sap/m/VBox";
import Event from "sap/ui/base/Event";
import ManagedObject, { MetadataOptions } from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import { DropInfo$DropEventParameters } from "sap/ui/core/dnd/DropInfo";
import Host from "sap/ui/integration/Host";
import Card from "sap/ui/integration/widgets/Card";
import JSONModel from "sap/ui/model/json/JSONModel";
import Container from "sap/ushell/Container";
import S4MyHome from "sap/ushell/api/S4MyHome";
import { Intent } from "sap/ushell/services/AppLifeCycle";
import Navigation from "sap/ushell/services/Navigation";
import BasePanel from "./BasePanel";
import { $CardsPanelSettings } from "./CardsPanel";
import InsightsContainer from "./InsightsContainer";
import MenuItem from "./MenuItem";
import {
	ICard,
	ICardAction,
	ICardActionParameters,
	ICardDetails,
	ICardHelper,
	ICardHelperInstance,
	ICardManifest,
	InsightsCacheData,
	IRegeneratedCard,
	ISapApp,
	ISapCard
} from "./interface/CardsInterface";
import AppManager from "./utils/AppManager";
import { getPageManagerInstance } from "./utils/CommonUtils";
import { PREFERED_CARDS, SETTINGS_PANELS_KEYS } from "./utils/Constants";
import { recycleId } from "./utils/DataFormatUtils";
import { calculateCardWidth, DeviceType, fetchElementProperties } from "./utils/Device";
import { focusDraggedItem } from "./utils/DragDropUtils";
import { addFESRId } from "./utils/FESRUtil";
import {
	createShowMoreActionButton,
	createShowMoreMenuItem,
	getAssociatedFullScreenMenuItem,
	sortMenuItems,
	targetsAreEqual
} from "./utils/InsightsUtils";
import PageManager from "./utils/PageManager";
import PersonalisationUtils from "./utils/PersonalisationUtils";
import UShellPersonalizer, { IPersonalizationData } from "./utils/UshellPersonalizer";

export enum cardsMenuItems {
	REFRESH = "cards-refresh",
	EDIT_CARDS = "cards-editCards",
	AI_INSIGHT_CARD = "cards-addAIInsightCard"
}

export enum cardsContainerMenuItems {
	REFRESH = "container-cards-refresh",
	EDIT_CARDS = "container-cards-editCards",
	SHOW_MORE = "cardsContainerFullScreenMenuItem",
	AI_INSIGHT_CARD = "container-cards-addAIInsightCard"
}

export enum cardsContainerActionButtons {
	SHOW_MORE = "cardsContanerFullScreenActionButton"
}
const sortedMenuItems: (cardsMenuItems | string)[] = [
	cardsMenuItems.REFRESH,
	cardsMenuItems.EDIT_CARDS,
	cardsMenuItems.AI_INSIGHT_CARD,
	"showMore",
	"settings"
];

interface IcardActionEvent {
	getParameter(sParam: string): unknown;
	preventDefault(): void;
}

const Constants = {
	PLACEHOLDER_CARD_COUNT: 10,
	CARDS_GAP: 16
};

export interface TargetIntent {
	target: Partial<Intent>;
	params?: {
		[key: string]: string;
	};
}
const RECOMMENDATION_PATH = "showRecommendation";
let runtimeHostCreated = false;

/**
 *
 * Panel class for managing and storing Insights Cards.
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
 * @alias sap.cux.home.CardsPanel
 */

export default class CardsPanel extends BasePanel {
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			title: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" },
			key: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" },
			fullScreenName: { type: "string", group: "Misc", defaultValue: "SI2", visibility: "hidden" }
		},
		defaultAggregation: "cards",
		aggregations: {
			/**
			 * Specifies the content aggregation of the panel.
			 */
			content: { multiple: true, singularName: "content", visibility: "hidden" },
			/**
			 * Aggregation of cards available within the cards panel
			 */
			cards: { type: "sap.ui.integration.widgets.Card", multiple: true, singularName: "card", visibility: "hidden" },
			/**
			 * Aggregation of the integration host used by the cards panel.
			 */
			host: { type: "sap.ui.integration.Host", multiple: false, singularName: "host", visibility: "hidden" }
		},
		events: {
			handleHidePanel: {
				parameters: {}
			},
			handleUnhidePanel: {
				parameters: {}
			},
			/**
			 * Event is fired when cards in viewport are updated.
			 */
			visibleCardsUpdated: {
				parameters: {
					cards: { type: "sap.ui.integration.widgets.Card[]" }
				}
			}
		}
	};
	private cardHelperInstance!: ICardHelperInstance;
	private _cardsFlexWrapper!: VBox;
	private cardsContainer!: GridContainer;
	private cardsMobileContainer!: HeaderContainer;
	private aVisibleCardInstances: Card[] = [];
	private _oData!: Record<string, unknown>;
	private _controlModel!: JSONModel;
	private oPersonalizer!: UShellPersonalizer;
	private appManagerInstance!: AppManager;
	private cardsContainerSettings!: GridContainerSettings;
	private cardWidth!: string;
	private cardHeight!: string;
	private cardsInViewport: Card[] = [];
	private oEventBus!: EventBus;
	private _appSwitched: boolean = false;
	private _containerMenuItems!: MenuItem[];
	private _containerActionButtons!: Button[];
	private insightsContainer!: InsightsContainer;
	private _headerVisible: boolean = false;
	private _controlMap!: Map<string, UI5Element>;
	private _cardsRendered!: Promise<void> | undefined;
	private pageManagerInstance!: PageManager;
	private hasCustomSpace!: boolean;

	constructor(idOrSettings?: string | $CardsPanelSettings);
	constructor(id?: string, settings?: $CardsPanelSettings);
	/**
	 * Constructor for a new card panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $CardsPanelSettings) {
		super(id, settings);
	}

	/**
	 * Initializes the Cards Panel.
	 *
	 * @private
	 * @override
	 */
	public init() {
		super.init();
		this.setProperty("key", "cards");
		this.setProperty("enableFullScreen", true);
		this.cardWidth = "19rem";
		this.cardHeight = this.getDeviceType() === DeviceType.Mobile ? "25.5rem" : "33rem";

		//Initialize Tiles Model
		this._oData = {
			userVisibleCards: [] as ICard[],
			userAllCards: [] as ICard[],
			isPhone: this.getDeviceType() === DeviceType.Mobile
		};
		this._controlModel = new JSONModel(this._oData);
		this.appManagerInstance = AppManager.getInstance();
		this._controlMap = new Map();
		// Setup Menu Items
		const refreshMenuItem = this._createRefreshMenuItem(cardsMenuItems.REFRESH, "cardsRefresh");
		const editCardsMenuItem = this._createEditCardsMenuItem(cardsMenuItems.EDIT_CARDS, "manageCards");

		const menuItems = [refreshMenuItem, editCardsMenuItem];
		menuItems.forEach((menuItem) => this.addAggregation("menuItems", menuItem));
		this._sortMenuItems(sortedMenuItems);

		this.oEventBus = EventBus.getInstance();
		// Subscribe to the event
		this.oEventBus.subscribe(
			"importChannel",
			"cardsImport",
			async (sChannelId?: string, sEventId?: string, oData?) => {
				await this._createCards(oData as ICardManifest[]);
				await this.rerenderCards();
				this._importdone();
			},
			this
		);

		// Setup Wrapper for Cards
		this._setupWrapper();

		// Toggles the activity of cards
		this._toggleCardActivity();
	}

	/**
	 * Toggles the activity of cards on route change.
	 *
	 * @private
	 * @returns {void}
	 */
	private _toggleCardActivity(): void {
		const toggleUserActions = async (event: Event<{ isMyHomeRoute: boolean }>) => {
			const show = event.getParameter("isMyHomeRoute");
			if (show) {
				if (this._appSwitched) {
					await this.rerenderCards();
					this._appSwitched = false;
				}
			} else {
				this._appSwitched = true;
			}
		};

		try {
			S4MyHome.attachRouteMatched({}, toggleUserActions, this);
		} catch (error) {
			Log.warning(error instanceof Error ? error.message : String(error));
		}
	}

	/**
	 * Create imported cards
	 * @param {ICardManifest[]} aCards - array of card manifests
	 * @returns {any}
	 */
	private async _createCards(aCards: ICardManifest[]) {
		await this.cardHelperInstance?._createCards(aCards);
		return this.rerenderCards();
	}

	/**
	 * Retrieves a manifest entry from a card.
	 * If the manifest entry is not immediately available, it waits for the manifest to be ready.
	 *
	 * @param {object} oCard - The card object from which to retrieve the manifest entry.
	 * @param {string} sEntry - The manifest entry key to retrieve.
	 * @returns {Promise<ICardManifest | undefined>} A promise that resolves with the manifest entry value.
	 */
	private _getManifestEntryFromCard(oCard: Card, sEntry: string): Promise<ICardManifest | undefined> {
		const cardWithManifestPromise = oCard as Card & { _pManifestReady?: Promise<ICardManifest | undefined> };
		const manifestEntry = oCard.getManifestEntry(sEntry) as ICardManifest | undefined;
		if (manifestEntry) {
			return Promise.resolve(manifestEntry);
		} else {
			if (!cardWithManifestPromise._pManifestReady) {
				cardWithManifestPromise._pManifestReady = new Promise<ICardManifest | undefined>((resolve) => {
					oCard.attachManifestReady(() => {
						resolve(oCard.getManifestEntry(sEntry) as ICardManifest | undefined);
					});
				});
			}
			return cardWithManifestPromise._pManifestReady;
		}
	}

	/**
	 * Adds a runtime host for the cards panel.
	 *
	 * @private
	 */
	private _addRuntimeHost() {
		const host = (this.getAggregation("host") || new InsightsInMemoryCachingHost("runtimeHost")) as Host;
		const action = async (oEvent: IcardActionEvent) => {
			const sType = oEvent.getParameter("type") as string;
			let oParameters = (oEvent.getParameter("parameters") as ICardActionParameters) || {};

			if (sType === "Navigation" && oParameters.ibnTarget) {
				oEvent.preventDefault();
				const oCard = (oEvent.getParameter("card") as Card) || {},
					oIntegrationCardManifest = (oCard?.getManifestEntry("sap.card") || {}) as ISapCard,
					aHeaderActions = oIntegrationCardManifest?.header?.actions || [];

				//processing semantic date as param for navigation
				//check to verify if _semanticDateRangeSetting property is present in manifest
				let oCheckSemanticProperty;
				if (oIntegrationCardManifest?.configuration?.parameters?._semanticDateRangeSetting?.value) {
					oCheckSemanticProperty = JSON.parse(
						oIntegrationCardManifest.configuration.parameters._semanticDateRangeSetting.value
					) as object;
				}
				if (oCheckSemanticProperty && Object.keys(oCheckSemanticProperty).length) {
					oParameters = this.cardHelperInstance.processSemanticDate(
						oParameters,
						oIntegrationCardManifest
					) as ICardActionParameters;
				}

				let aContentActions = this.getContentActions(oIntegrationCardManifest);

				const oHeaderAction = aHeaderActions[0] || {},
					oContentAction = aContentActions[0] || {};

				const bOldCardExtension = !!(
					(oHeaderAction?.parameters &&
						typeof oHeaderAction.parameters === "string" &&
						oHeaderAction.parameters.indexOf("{= extension.formatters.addPropertyValueToAppState") > -1) ||
					(oContentAction?.parameters &&
						typeof oContentAction.parameters === "string" &&
						oContentAction.parameters.indexOf("{= extension.formatters.addPropertyValueToAppState") > -1)
				);

				this._manageOldCardExtension(bOldCardExtension, oEvent, oParameters);

				const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
				await navigationService.navigate({
					target: oParameters.ibnTarget,
					params: oParameters.ibnParams
				});
			}
		};
		const actions = [
			{
				type: "Custom",
				text: this._i18nBundle?.getText("refresh") as string,
				icon: "sap-icon://refresh",
				action: (oCard: Card) => {
					this._refreshCardData(oCard);
				},
				visible: async (oCard: Card) => {
					const oEntry = await this._getManifestEntryFromCard(oCard, "sap.insights");
					return oEntry && !oEntry.cacheType;
				}
			},
			{
				type: "Custom",
				text: this._i18nBundle?.getText("viewFilteredBy") as string,
				icon: "sap-icon://filter",
				action: (oCard: Card) => {
					const cardId = (oCard.getManifestEntry("sap.app") as ISapApp).id;
					(this.getParent() as InsightsContainer)
						?._getLayout()
						.openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_CARDS, { cardId });
				},
				visible: async (oCard: Card) => {
					const oEntry = await this._getManifestEntryFromCard(oCard, "sap.insights");
					if (oEntry) {
						const oCardParams = (oCard.getManifestEntry("sap.card") as ISapCard)?.configuration?.parameters;
						const aRelevantFilters = oCardParams?._relevantODataFilters?.value || [];
						const bRelevantFilters = aRelevantFilters?.length;
						const aRelevantParams = oCardParams?._relevantODataParameters?.value || [];
						const bRelevantParams = aRelevantParams?.length;
						const oCardDataSource = (oCard.getManifestEntry("sap.app") as ISapApp).dataSources;
						const oFilterService = oCardDataSource?.filterService;
						const oDataSourceSettings = oFilterService?.settings;
						// show ViewFilteredBy Option only if relevantFilters or relevantParameters are there and is OdataV2 version
						return !!(
							(bRelevantFilters || bRelevantParams) &&
							oDataSourceSettings &&
							oDataSourceSettings.odataVersion === "2.0"
						);
					} else {
						return false;
					}
				}
			},
			{
				type: "Custom",
				text: this._i18nBundle?.getText("navigateToParent") as string,
				icon: "sap-icon://display-more",
				visible: async (oCard: Card) => {
					return this._getManifestEntryFromCard(oCard, "sap.insights").then(async (oEntry: ICardManifest | undefined) => {
						if (oEntry) {
							const parentApp = await this.cardHelperInstance.getParentAppDetails({
								descriptorContent: oCard.getManifestEntry("/") as ICardManifest
							});
							if (parentApp.semanticObject && parentApp.action) {
								const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
								const intents: TargetIntent[] = [
									{
										target: {
											semanticObject: parentApp.semanticObject,
											action: parentApp.action
										}
									}
								];
								const aResponses = (await navigationService.isNavigationSupported(intents)) as { supported: boolean }[];
								return aResponses[0].supported || false;
							} else {
								return true;
							}
						} else {
							return false;
						}
					});
				},
				action: async (oCard: Card) => {
					const parentApp = await this.cardHelperInstance.getParentAppDetails({
						descriptorContent: oCard.getManifestEntry("/") as ICardManifest
					});
					const sShellHash = parentApp.semanticURL || parentApp.semanticObject;
					const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
					await navigationService.navigate({
						target: {
							shellHash: sShellHash
						}
					});
				}
			}
		];
		host.attachAction(action);
		host.setProperty("actions", actions);
		this.setAggregation("host", host);
	}

	/**
	 * Updates parameters for an old card extension
	 * @private
	 * @param {boolean} bOldCardExtension - Determines whether the card is using an old card extension.
	 * @param {IcardActionEvent} oEvent - An event object
	 * @param {ICardActionParameters} oParameters - Parameter object
	 */

	private _manageOldCardExtension(bOldCardExtension: boolean, oEvent: IcardActionEvent, oParameters: ICardActionParameters) {
		if (bOldCardExtension) {
			const oCardSV = new SelectionVariant();
			const oCardParams = (oEvent.getParameter("card") as Card).getCombinedParameters();
			(oCardParams?._relevantODataParameters as string[]).forEach((sParamName: string) => {
				if (oParameters.ibnParams) {
					oParameters.ibnParams[sParamName] = oCardParams[sParamName];
				}
			});
			(oCardParams?._relevantODataFilters as string[]).forEach((sFilterName: string) => {
				const oCardParamsFilterName = JSON.parse(oCardParams[sFilterName] as string) as {
					Parameters: unknown;
					SelectOptions: { PropertyName: string; Ranges: { Sign: string; Option: string; Low: string }[] }[];
				};
				const aSelectOptions = oCardParamsFilterName.SelectOptions[0];
				const aRanges = aSelectOptions.Ranges;
				if (aRanges?.length === 1 && aRanges[0].Sign === "I" && aRanges[0].Option === "EQ") {
					if (oParameters.ibnParams) {
						oParameters.ibnParams[sFilterName] = aRanges[0].Low;
					}
				} else if (aRanges?.length > 0) {
					oCardSV.massAddSelectOption(sFilterName, aRanges);
				}
			});
			const oTempParam = JSON.parse(oParameters?.ibnParams?.["sap-xapp-state-data"] as string) as Record<string, unknown>;
			oTempParam.selectionVariant = oCardSV.toJSONObject();
			if (oParameters.ibnParams) {
				oParameters.ibnParams["sap-xapp-state-data"] = JSON.stringify(oTempParam);
			}
		}
	}

	/**
	 * Retrieves actions for a card based on its content type.
	 *
	 * @private
	 * @param {ISapCard} manifest - The manifest object.
	 * @returns {Array} The content actions.
	 */
	private getContentActions(manifest: ISapCard): ICardAction[] {
		let actions;
		if (manifest.type === "List") {
			actions = manifest?.content?.item?.actions;
		} else if (manifest.type === "Table") {
			actions = manifest?.content?.row?.actions;
		} else {
			actions = manifest?.content?.actions;
		}
		return actions || [];
	}

	/**
	 * Handles the completion of the import process.
	 *
	 * @private
	 */
	private _importdone() {
		const stateData = { status: true };
		this.oEventBus.publish("importChannel", "cardsImported", stateData);
	}

	/**
	 * Refreshes the data for a given card.
	 *
	 * @private
	 * @param {Card} oCard - The card to refresh.
	 */
	private _refreshCardData(oCard: Card) {
		sap.ui.require(["sap/insights/base/CacheData"], (InsightsCacheData: InsightsCacheData) => {
			const sCardId = (oCard.getManifestEntry("sap.app") as ISapApp)?.id;
			const cacheDataInstance = InsightsCacheData.getInstance();
			cacheDataInstance.clearCache(sCardId);
			oCard.refreshData();
		});
	}

	/**
	 * Triggers a full refresh of the Insights Cards's data and UI.
	 *
	 * Reloads all the user cards within the Insights Cards section by reinitializing relevant services
	 * and re-rendering the panel.
	 *
	 * @public
	 * @returns {Promise<void>} A promise that resolves once the Insights Cards section has been refreshed.
	 */
	public async refreshData(): Promise<void> {
		try {
			this.cardHelperInstance = await (CardHelper as ICardHelper).getServiceAsync();
			await this.cardHelperInstance._refreshUserCards(false);
			await this.renderPanel();
		} catch (error) {
			Log.error("Failed to refresh cards: ", error instanceof Error ? error.message : (error as string));
		}
	}

	/**
	 * Renders the panel.
	 *
	 * @private
	 * @returns {Promise<void>} A promise that resolves when the panel is rendered.
	 */
	public async renderPanel(): Promise<void> {
		if (!this.cardHelperInstance) {
			this.pageManagerInstance = this.pageManagerInstance || getPageManagerInstance(this);
			const [cardHelperInstance, hasCustomSpace] = await Promise.all([
				(CardHelper as ICardHelper).getServiceAsync(),
				this.pageManagerInstance.hasCustomSpace()
			]);
			this.cardHelperInstance = cardHelperInstance;
			this.hasCustomSpace = hasCustomSpace;
		}
		await this.rerenderCards();
		this.fireEvent("loaded");
	}

	/**
	 * Rerenders the cards.
	 *
	 * @private
	 * @returns {Promise<void>} A promise that resolves when the cards are rerendered.
	 */
	private async rerenderCards(skipRecommendation: boolean = false): Promise<void> {
		if (!this._cardsRendered) {
			this._cardsRendered = new Promise((resolve, reject) => {
				void (async () => {
					try {
						// Enable placeholders after updating/rerendering cards
						const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();

						this._getCardContainer().removeAllAggregation(sDefaultAggreName);
						this._showPlaceHolders();
						// Fetch Cards from insights service
						const preferedCardIDs = this.hasCustomSpace ? PREFERED_CARDS : [];
						const userVisibleCardModel = await this.cardHelperInstance?._getUserVisibleCardModel(preferedCardIDs);
						const aCards = userVisibleCardModel.getProperty("/cards") as ICard[];
						const listBinding = userVisibleCardModel?.bindList("/cards");
						if (!listBinding.hasListeners("change")) {
							listBinding?.enableExtendedChangeDetection(true, "/cards", {});
							listBinding?.attachChange(async () => {
								await (this._cardsRendered ?? Promise.resolve());
								const visibleCards = userVisibleCardModel.getProperty("/cards") as ICard[];
								if (visibleCards.length !== this.aVisibleCardInstances.length && visibleCards.length > 0) {
									this._showCards(visibleCards);
								} else if (!visibleCards.length) {
									this.fireHandleHidePanel();
								}
							});
						}

						this._controlModel.setProperty("/userVisibleCards", aCards);
						let showRecommendation = await this.getPersonalisationProperty(RECOMMENDATION_PATH);
						if (aCards.length === 0 && showRecommendation === undefined && !skipRecommendation) {
							await this._getRecommendationCards();
						} else if (aCards.length) {
							if (showRecommendation === undefined) {
								await this._updateRecommendationStatus();
							}
							// from available cards, check for old recommended cards and update it if present,
							// else show available visible cards
							await this.checkForRecommendedCards(aCards);
						} else {
							this.fireHandleHidePanel();
						}
						this._cardsRendered = undefined;
						resolve();
					} catch (error) {
						this.fireHandleHidePanel();
						this._cardsRendered = undefined;
						if (error instanceof Error) {
							Log.error(error.message);
							reject(error);
						}
					}
				})();
			});
		}
		return this._cardsRendered;
	}
	/**
	 * Sets the new visible cards in the model and updates the UI.
	 * @private
	 */
	private async setNewVisibleCards() {
		const preferedCardIDs = this.hasCustomSpace ? PREFERED_CARDS : [];
		const visibleCardModel = await this.cardHelperInstance._getUserVisibleCardModel(preferedCardIDs);
		const aNewCards = visibleCardModel.getProperty("/cards") as ICard[];
		this._controlModel.setProperty("/userVisibleCards", aNewCards);
		this._showCards(aNewCards);
	}

	/**
	 * Checks for recommended cards and updates their manifests if necessary.
	 *
	 * This method iterates through the provided cards to identify recommended cards that need to be updated.
	 * It regenerates the manifests for these cards, updates the model with the regenerated cards, and displays
	 * the updated cards. If no recommended cards are found, it displays the original cards.
	 *
	 * @param {ICard[]} aCards - An array of card objects to check for recommendations.
	 * Each card contains a `descriptorContent` property with metadata about the card.
	 * @returns {Promise<void>} A promise that resolves when the check and updates are complete.
	 * @private
	 */
	private async checkForRecommendedCards(aCards: ICard[]): Promise<void> {
		let manifestIds: ICardDetails[] = [];
		aCards.forEach((oVisCard, idx) => {
			let oCard = oVisCard.descriptorContent;
			if (
				oCard["sap.card"]?.rec === true &&
				(!oCard["sap.card"]["configuration"] || !oCard["sap.card"]["configuration"]["csrfTokens"])
			) {
				manifestIds.push({
					cardId: oCard?.["sap.app"]?.id as string,
					rank: oCard?.["sap.insights"]?.ranking || oVisCard?.rank,
					id: oCard?.["sap.insights"]?.["parentAppId"] || "",
					target: oCard?.["sap.card"]?.["header"]?.["actions"]?.length
						? (oCard["sap.card"]["header"]["actions"][0]?.["parameters"] as ICardActionParameters)?.ibnTarget
						: undefined,
					index: idx
				});
			}
		});
		if (manifestIds.length) {
			const uniqueManifestDetails: ICardDetails[] = this.getUniqueManifestDetails(manifestIds);
			const aUpdatedCards = await this.regenerateCards(uniqueManifestDetails, manifestIds);
			if (aUpdatedCards?.length) {
				// Update the model with updated cards
				await this.cardHelperInstance._updateCards(
					aUpdatedCards.map((oCard: ICardDetails) => oCard?.newManifest?.descriptorContent) as ICardManifest[]
				);
			} else {
				return;
			}
			await this.setNewVisibleCards();
		} else {
			this._showCards(aCards);
		}
	}

	/**
	 * Filters and returns a list of unique manifest IDs.
	 *
	 * This method iterates through the provided list of manifest IDs and ensures that only unique entries
	 * are included in the returned list. Uniqueness is determined based on the `id` and `target` properties.
	 *
	 * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to filter for uniqueness.
	 * Each object contains properties such as `id` and `target`.
	 * @returns {ICardDetails[]} An array of unique manifest ID objects.
	 * @private
	 */
	private getUniqueManifestDetails(manifestIds: ICardDetails[]): ICardDetails[] {
		const uniqueManifestDetails: ICardDetails[] = [];
		manifestIds.forEach((item) => {
			const exists = uniqueManifestDetails.some(
				(existingItem) => existingItem.id === item.id && targetsAreEqual(existingItem.target, item.target)
			);
			if (!exists) {
				uniqueManifestDetails.push(JSON.parse(JSON.stringify(item)) as ICardDetails);
			}
		});
		return uniqueManifestDetails;
	}

	/**
	 * Retrieves and processes card manifests based on the provided manifest IDs.
	 *
	 * This method fetches card manifests using the `AppManager` instance,
	 * and removes duplicate regenerated cards to ensure uniqueness.
	 *
	 * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to fetch and process.
	 * Each object contains details such as `id`, `target`, and other card-specific properties.
	 * @returns {Promise<ICardDetails[]>} A promise that resolves to an array of processed and unique card manifest details.
	 * @private
	 */
	private async _getManifests(manifestIds: ICardDetails[]): Promise<ICardDetails[]> {
		// from the provided manifestIds which are unique generate new recommended card manifests
		let aManifests = await this.appManagerInstance._getCardManifest(undefined, manifestIds);
		if (aManifests?.length) {
			let aRegeneratedCards = aManifests.map(function (oCard) {
				if (oCard?.["sap.card"]) {
					oCard["sap.card"].rec = true;
				}
				return {
					id: oCard["sap.app"]?.id,
					descriptorContent: oCard
				} as IRegeneratedCard;
			});
			// sometimes same card is recommended more than once, hence remove such duplicates
			let mappedResults = this._removeDuplicateRegeneratedCards(aRegeneratedCards, manifestIds);
			return mappedResults;
		} else {
			return [];
		}
	}

	/**
	 * Regenerates card manifests and updates the original manifest list with the regenerated data.
	 *
	 * This method fetches updated card manifests, maps them to their corresponding original cards,
	 * and updates the `newManifest` property of the original cards. It ensures that the regenerated
	 * cards are correctly associated with their original counterparts based on a unique key.
	 *
	 * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to regenerate.
	 * Each object contains details such as `id`, `target`, and other card-specific properties.
	 * @param {ICardDetails[]} allManifestIds - An array of all manifest ID objects, including those
	 * that need to be updated with regenerated manifests.
	 * @returns {Promise<ICardDetails[] | undefined>} A promise that resolves to an array of updated card details,
	 * or `undefined` if an error occurs.
	 * @private
	 */
	private async regenerateCards(manifestIds: ICardDetails[], allManifestIds: ICardDetails[]): Promise<ICardDetails[] | undefined> {
		try {
			let aMappedManifest = await this._getManifests(manifestIds);

			// create unique identifier for each card based on its id and target properties.
			const createUniqueKey = (item: ICardDetails): string => {
				if (item?.target?.semanticObject && item?.target?.action) {
					return item.id + "|" + item.target.semanticObject + "|" + item.target.action;
				}
				return item.id; // Return just the id if the target is invalid
			};

			let uniqueMap: Record<string, IRegeneratedCard> = {};
			// Create a map of unique keys to newManifest data
			// Iterate through the aMappedManifest array and populate the uniqueMap with unique keys and their corresponding newManifest data
			// This ensures that each unique key maps to its respective newManifest data, allowing for easy retrieval later.
			// This is done to avoid duplicates and ensure that each card is only represented once in the final output.
			aMappedManifest.forEach(function (item) {
				let uniqueKey = createUniqueKey(item);
				if (item.newManifest) {
					uniqueMap[uniqueKey] = item.newManifest;
				}
			});

			let aUpdatedCards: ICardDetails[] = [];
			if (aMappedManifest.length) {
				// Map newManifest data back into allManifestIds based on the uniquekey
				allManifestIds.forEach(function (oCard) {
					let uniqueKey = createUniqueKey(oCard);
					// Check if the uniqueKey exists in the uniqueMap, if present, assign the corresponding newManifest data to the oCard object
					// This effectively updates the oCard object with the newManifest data, allowing for further processing or rendering.
					// This is done to ensure that the original card objects are updated with the newManifest data, allowing for further processing or rendering.
					if (uniqueMap[uniqueKey]) {
						oCard.newManifest = uniqueMap[uniqueKey];
					}

					const newManifest = oCard["newManifest"];
					const descriptorContent = newManifest?.descriptorContent;
					if (descriptorContent) {
						descriptorContent["sap.insights"] = {
							...descriptorContent["sap.insights"],
							ranking: oCard.rank
						};

						if (descriptorContent["sap.app"]) {
							descriptorContent["sap.app"].id = oCard.cardId;
						}
						newManifest.id = oCard.cardId;
						aUpdatedCards.push(JSON.parse(JSON.stringify(oCard)) as ICardDetails);
					}
				});
			}

			return aUpdatedCards;
		} catch (oError) {
			Log.error(oError instanceof Error ? oError.message : String(oError));
			return undefined;
		}
	}

	/**
	 * Removes duplicate regenerated cards and maps them to their corresponding original cards.
	 *
	 * This method processes a list of regenerated cards and maps them to their corresponding original cards
	 * based on their `id`. If a regenerated card matches an original card, it is added as the `newManifest`
	 * property of the original card. The method ensures that each original card is updated with its corresponding
	 * regenerated card, if available.
	 *
	 * @param {IRegeneratedCard[]} aCards - An array of regenerated cards. Each card contains a `descriptorContent` property
	 * that includes metadata about the card.
	 * @param {ICardDetails[]} aOriginalList - An array of original card details. Each card contains an `id` property
	 * that is used to match it with regenerated cards.
	 * @returns {ICardDetails[]} An array of original card details, with the `newManifest` property updated for cards
	 * that have matching regenerated cards.
	 * @private
	 */
	private _removeDuplicateRegeneratedCards(aCards: IRegeneratedCard[], aOriginalList: ICardDetails[]): ICardDetails[] {
		// Create a mapping from aOriginalList for easy access (grouping by id)
		const originalMap = {} as Record<string, ICardDetails>;
		aOriginalList.forEach((originalItem) => {
			if (originalItem.id) {
				originalMap[originalItem.id] = JSON.parse(JSON.stringify(originalItem)) as ICardDetails;
			}
		});

		// Process each card in aCards
		aCards.forEach(function (oCard) {
			const sCardId = oCard?.descriptorContent?.["sap.insights"]?.parentAppId as string;
			// Check if we have a matching original list item
			if (sCardId && originalMap[sCardId]) {
				const originalItem = originalMap[sCardId];
				// Check if updatedManifest already added
				if (!originalItem["newManifest"]) {
					// Map newManifest to the original item
					originalItem["newManifest"] = oCard;
				}
			}
		});
		return Object.values(originalMap);
	}

	/**
	 * Retrieves personalization data from the personalization service.
	 *
	 * This method ensures that the personalization service (`oPersonalizer`) is initialized
	 * and fetches the latest personalization data. If no data is found, it returns an empty object.
	 *
	 * @private
	 * @returns {Promise<IPersonalizationData>} A promise that resolves to the personalization data.
	 * If no data is available, an empty object is returned.
	 */
	private async _getPersonalizationData(): Promise<IPersonalizationData> {
		if (!this.oPersonalizer) {
			this.oPersonalizer = await this._getPersonalization();
		}
		const oPersData = await this.oPersonalizer.read();
		return oPersData || {};
	}

	// Fetch personalization data property value
	private async getPersonalisationProperty(propertyKey: string) {
		const oPersData = await this._getPersonalizationData();
		return oPersData?.[propertyKey as keyof IPersonalizationData];
	}

	/**
	 * Checks for recommendation cards.
	 *
	 * @private
	 * @returns {Promise<void>} A promise that resolves when the check is complete.
	 */
	private async _getRecommendationCards() {
		const aRecommendedCards = await this.appManagerInstance.getRecommenedCards();
		if (aRecommendedCards?.length) {
			return this._handleRecommendationCards(aRecommendedCards);
		}
		this.fireHandleHidePanel();
	}

	/**
	 * Handle Recommendation Cards
	 * @param aRecommendedCards
	 * @private
	 */
	private async _handleRecommendationCards(aRecommendedCards: ICard[]) {
		const cardManifests = aRecommendedCards.map((oCard) => oCard.descriptorContent);
		await this.cardHelperInstance?._createCards(cardManifests);
		await this._updateRecommendationStatus();
		return this.setNewVisibleCards();
	}

	/**
	 * Sets up the wrapper for the cards.
	 *
	 * @private
	 */
	private _setupWrapper() {
		if (!this._cardsFlexWrapper) {
			this._cardsFlexWrapper = new VBox(`${this.getId()}-cardsFlexWrapper`, {
				renderType: "Bare",
				width: "100%",
				items: [this._createCardContainer(), this._createMobileCardContainer()]
			});
			this._cardsFlexWrapper.setModel(this._controlModel);
			this.addContent(this._cardsFlexWrapper);
		}
	}

	/**
	 * Creates the card container.
	 *
	 * @private
	 * @returns {GridContainer} The card container.
	 */
	private _createCardContainer() {
		this.cardsContainerSettings = new GridContainerSettings(`${this.getId()}-insightsCardsContainerSettings`, {
			columnSize: this.cardWidth,
			rowSize: this.cardHeight,
			gap: "1rem"
		});
		this.cardsContainer = new GridContainer(`${this.getId()}-insightsCardsFlexBox`, {
			visible: "{= !${/isPhone}}"
		})
			.addStyleClass("sapUiSmallMarginTop")
			.setLayout(this.cardsContainerSettings);
		this.cardsContainer.setModel(this._controlModel);
		this.addDragDropConfigTo(this.cardsContainer, (oEvent) => this._handleCardsDnd(oEvent));

		return this.cardsContainer;
	}

	/**
	 * Creates the mobile card container.
	 *
	 * @private
	 * @returns {HeaderContainer} The mobile card container.
	 */
	private _createMobileCardContainer() {
		this.cardsMobileContainer = new HeaderContainer(`${this.getId()}-insightsCardsMobileFlexBox`, {
			scrollStep: 0,
			scrollStepByItem: 1,
			gridLayout: true,
			scrollTime: 1000,
			showDividers: false,
			visible: "{/isPhone}"
		});
		this.cardsMobileContainer.setModel(this._controlModel);
		this.addDragDropConfigTo(this.cardsMobileContainer, (oEvent) => this._handleCardsDnd(oEvent));

		return this.cardsMobileContainer;
	}

	/**
	 * Displays placeholder cards while loading.
	 *
	 * @private
	 * @returns {void}
	 */
	private _showPlaceHolders() {
		const cardManifest = this.appManagerInstance._getAnalyticalCardManifest();
		const placeholderArray = new Array(this._calculatePlaceholderCardCount()).fill(null);
		const aInsightsCards = placeholderArray.map((_, index: number) => {
			const card = new Card(recycleId(`${this.getId()}--placeHolderCard--${index}`), {
				width: this.cardWidth,
				height: this.cardHeight,
				previewMode: "Abstract",
				manifest: cardManifest,
				host: this.getAggregation("host") as Control
			}).addStyleClass("sapUiSmallMarginEnd");
			return card;
		});
		// Create Wrapper HBox for Card
		const oPreviewHBox = new HBox(recycleId(`${this.getId()}--wrapperBox`), {
			justifyContent: "SpaceBetween",
			items: aInsightsCards
		});

		// add HBox as item to GridList
		const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
		if (sDefaultAggreName) {
			this._getCardContainer().addAggregation(sDefaultAggreName, oPreviewHBox);
		}
	}

	/**
	 * Calculates the number of placeholder cards that can fit within the available container width.
	 *
	 * @private
	 * @returns {number} The number of placeholder cards that should be displayed. Defaults to 1 if no valid count is determined.
	 */
	private _calculatePlaceholderCardCount(): number {
		const layoutDomRef = this._getInsightsContainer()?._getLayout()?.getDomRef();
		let count = 0;
		if (layoutDomRef) {
			const sectionDomRef = layoutDomRef.childNodes[0] as Element;
			const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
			let availableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
			const cardLayoutConfig = {
				containerWidth: availableWidth,
				totalCards: Constants.PLACEHOLDER_CARD_COUNT,
				minWidth: 304,
				maxWidth: 583,
				gap: 16
			};
			const cardWidth = this.getDeviceType() === DeviceType.Mobile ? 19 : calculateCardWidth(cardLayoutConfig);

			// Calculate and log the number of cards that can fit
			count =
				this.getDeviceType() === DeviceType.Mobile
					? this.aVisibleCardInstances.length
					: Math.floor(availableWidth / (cardWidth + Constants.CARDS_GAP));
			this.cardWidth = `${cardWidth / 16}rem`;
		}

		return count || 1;
	}

	/**
	 * Displays the cards.
	 *
	 * @private
	 * @param {ICard[]} aCards - The cards to display.
	 */
	private _showCards(aCards: ICard[]) {
		const panelName = this.getMetadata().getName();
		this.fireHandleUnhidePanel();
		this._getInsightsContainer()?.updatePanelsItemCount(aCards.length, panelName);
		if (this._headerVisible) {
			this.setProperty("title", `${this._i18nBundle?.getText("insightsCards")} (${aCards.length})`);
		}
		const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
		this._getCardContainer().removeAllAggregation(sDefaultAggreName);
		this.aVisibleCardInstances = [];
		this.cardsInViewport = [];

		// Setup Host For Cards
		if (!runtimeHostCreated) {
			this._addRuntimeHost();
			runtimeHostCreated = true;
		}

		aCards.forEach((oCard, index) => {
			const manifest = oCard.descriptorContent;
			// Create Card Instance
			const oUserCard = new Card(recycleId(`${this.getId()}--userCard--${index}`), {
				width: this.cardWidth,
				height: this.cardHeight,
				manifest,
				host: this.getAggregation("host") as Control
			});

			this.aVisibleCardInstances.push(oUserCard);

			this.addAggregation("cards", oUserCard, true);

			const items: Control[] = [oUserCard];

			// Add overlay in case of List and Table Card
			const sType = manifest["sap.card"]?.type;
			if (sType === "Table" || sType === "List") {
				const overlay = new HBox(recycleId(`${this.getId()}--overlay--${index}`), {
					width: this.cardWidth,
					height: "2rem"
				}).addStyleClass("insightsCardOverflowTop");
				const overlayHBoxWrapper = new HBox(recycleId(`${this.getId()}--overlayHBoxId--${index}`), {
					height: "0"
				}).addStyleClass("sapMFlexBoxJustifyCenter");
				overlayHBoxWrapper.addItem(overlay);
				items.push(overlayHBoxWrapper);
			}

			// Create Wrapper VBox for Card
			const oPreviewVBox = new VBox(recycleId(`${this.getId()}--previewBoxId--${index}`), {
				direction: "Column",
				justifyContent: "Center",
				items: items
			});

			// add VBox as item to GridList
			const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
			this._getCardContainer().addAggregation(sDefaultAggreName, oPreviewVBox);
		});
	}

	/**
	 * Handles the edit cards event.
	 *
	 * @private
	 * @param {Event} event - The event object.
	 */
	private _handleEditCards(event: Event) {
		/* If called from Panel Header event.source() will return TilesPanel, if called from Insights Container event.source() will return InsightsContainer.
		_getLayout is available at Container Level*/
		let parent: ManagedObject = event.getSource<CardsPanel>().getParent() || this;
		if (parent instanceof CardsPanel) {
			parent = parent.getParent() as ManagedObject;
		}
		(parent as InsightsContainer)?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_CARDS);
	}

	/**
	 * Hides the header of the cards panel.
	 *
	 * @private
	 */
	public handleHideHeader() {
		this._headerVisible = false;
		this.setProperty("title", "");
		this._toggleHeaderActions(false);
	}

	/**
	 * Adds the header to the cards panel.
	 *
	 * @private
	 */
	public handleAddHeader() {
		this._headerVisible = true;
		this.setProperty(
			"title",
			`${this._i18nBundle?.getText("insightsCards")} (${(this._controlModel.getProperty("/userVisibleCards") as ICard[])?.length})`
		);
		this._toggleHeaderActions(true);
	}

	/**
	 * Refreshes the cards.
	 *
	 * @private
	 */
	private refreshCards() {
		// This should be done via Host once implemented
		this.aVisibleCardInstances.forEach((card) => this._refreshCardData(card));
	}

	/**
	 * Handles the drag and drop of cards.
	 *
	 * @private
	 * @param {Event<DropInfo$DropEventParameters>} oEvent - The drop event parameters.
	 */
	private async _handleCardsDnd(oEvent: Event<DropInfo$DropEventParameters>) {
		const sInsertPosition = oEvent.getParameter("dropPosition") as string,
			oDragItem = oEvent.getParameter("draggedControl") as Control,
			iDragItemIndex = (oDragItem.getParent() as GridContainer)?.indexOfItem(oDragItem),
			oDropItem = oEvent.getParameter("droppedControl") as Control,
			iDropItemIndex = (oDragItem.getParent() as GridContainer).indexOfItem(oDropItem);

		this._cardsFlexWrapper?.setBusy(true);
		// take the moved item from dragIndex and add to dropindex
		try {
			if (!(this._controlModel.getProperty("/userAllCards") as ICard[]).length) {
				const userAllCardsModel = await this.cardHelperInstance._getUserAllCardModel();
				this._controlModel.setProperty("/userAllCards", userAllCardsModel.getProperty("/cards"));
				await this.updateCardList(sInsertPosition, iDropItemIndex, iDragItemIndex);
			} else {
				await this.updateCardList(sInsertPosition, iDropItemIndex, iDragItemIndex);
			}
			setTimeout(() => {
				focusDraggedItem(this._getCardContainer(), iDropItemIndex);
			}, 0);
		} catch (error) {
			if (error instanceof Error) {
				Log.error(error.message);
			}
		} finally {
			this._cardsFlexWrapper?.setBusy(false);
		}
	}

	/**
	 * Updates the card list based on the drag and drop operation.
	 *
	 * @private
	 * @param {string} sInsertPosition - The position to insert the item.
	 * @param {number} iDropItemIndex - The index of the dropped item.
	 * @param {number} iDragItemIndex - The index of the dragged item.
	 * @returns {Promise<void>} A promise that resolves when the card list is updated.
	 */
	private async updateCardList(sInsertPosition: string, iDropItemIndex: number, iDragItemIndex: number) {
		const aUserVisibleCards = this._controlModel.getProperty("/userVisibleCards") as ICard[],
			aUserAllCards = this._controlModel.getProperty("/userAllCards") as ICard[],
			sDragedPositionRank = aUserVisibleCards[iDragItemIndex]?.rank,
			sDropedPositionRank = aUserVisibleCards[iDropItemIndex]?.rank;
		let iUpdatedDragItemIndex = aUserAllCards.findIndex((oCard: ICard) => oCard.rank === sDragedPositionRank),
			iUpdatedDropItemIndex = aUserAllCards.findIndex((oCard: ICard) => oCard.rank === sDropedPositionRank);

		if (
			(sInsertPosition === "Before" && iDragItemIndex === iDropItemIndex - 1) ||
			(sInsertPosition === "After" && iDragItemIndex === iDropItemIndex + 1) ||
			iDragItemIndex === iDropItemIndex
		) {
			return;
		}
		if (sInsertPosition === "Before" && iUpdatedDragItemIndex < iUpdatedDropItemIndex) {
			iUpdatedDropItemIndex--;
		} else if (sInsertPosition === "After" && iUpdatedDragItemIndex > iUpdatedDropItemIndex) {
			iUpdatedDropItemIndex++;
		}
		if (iUpdatedDragItemIndex !== iUpdatedDropItemIndex) {
			const aUpdatedCards = this.cardHelperInstance.handleDndCardsRanking(
				iUpdatedDragItemIndex,
				iUpdatedDropItemIndex,
				aUserAllCards
			);
			await this.cardHelperInstance._updateMultipleCards(aUpdatedCards, "PUT");
			this._sortCardsOnRank(aUserAllCards);
			this._controlModel.setProperty("/userAllCards", aUserAllCards);
			this._controlModel.setProperty(
				"/userVisibleCards",
				aUserAllCards.filter((oCard: ICard) => oCard.visibility)
			);
			await this.rerenderCards();
		}
	}

	/**
	 * Sorts the cards based on their rank property.
	 *
	 * @private
	 * @param {ICard[]} aCards - The array of cards to sort.
	 */
	private _sortCardsOnRank(aCards: ICard[]) {
		// Sort Cards based on it rank property where rank is a alphanumeric string
		aCards.sort((a, b) => {
			if (a.rank && b.rank) {
				if (a.rank < b.rank) {
					return -1;
				} else if (a.rank > b.rank) {
					return 1;
				}
			}
			return 0;
		});
	}

	/**
	 * Retrieves the personalization instance.
	 *
	 * @private
	 * @returns {UShellPersonalizer} The personalization instance.
	 */
	public _getPersonalization() {
		const persContainerId = PersonalisationUtils.getPersContainerId(this);
		const ownerComponent = PersonalisationUtils.getOwnerComponent(this) as Component;
		return UShellPersonalizer.getInstance(persContainerId, ownerComponent);
	}

	/**
	 * Updates the recommendation status based on the feature toggle.
	 * @returns {Promise} A promise that resolves when the recommendation status is updated.
	 */
	private async _updateRecommendationStatus() {
		const oPersData = await this._getPersonalizationData();
		oPersData[RECOMMENDATION_PATH] = true;
		return this.oPersonalizer.write(oPersData);
	}

	/**
	 * Calculates the number of visible cards that can fit within the available width of the parent container.
	 *
	 * @private
	 * @returns {number} - The number of visible cards.
	 */
	private _calculateVisibleCardCount() {
		const layout = this._getInsightsContainer()._getLayout();
		const pageDomRef = layout.getDomRef();
		const deviceType = this.getDeviceType();
		let count = 1;

		if (pageDomRef) {
			const isHeaderVisible = layout.getProperty("showHeader") as boolean;
			const sectionNodeIndex = isHeaderVisible ? 1 : 0;
			const sectionDomRef = pageDomRef.childNodes[sectionNodeIndex] as Element;
			const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
			const iAvailableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
			const totalCards = this.aVisibleCardInstances.length;

			const cardLayoutConfig = { containerWidth: iAvailableWidth, totalCards: totalCards, minWidth: 304, maxWidth: 583, gap: 16 };
			const cardWidth = calculateCardWidth(cardLayoutConfig);
			this.cardWidth = `${cardWidth / 16}rem`;
			if (deviceType === DeviceType.Mobile) {
				count = totalCards;
			} else {
				// Multiply by 16 because `cardWidth` is in rems
				count = Math.max(Math.floor(iAvailableWidth / cardWidth), 1);
			}
		}

		return count;
	}

	/**
	 * Adjusts the layout of the cards panel based on the current layout and device type.
	 *
	 * @private
	 * @override
	 */
	public _adjustLayout() {
		const layout = this._getInsightsContainer()?._getLayout();
		let cardWidth = this.cardWidth;
		const isMobileDevice = this.getDeviceType() === DeviceType.Mobile;

		if (layout && this.aVisibleCardInstances?.length > 0) {
			const isElementExpanded = layout._getCurrentExpandedElementName() === this.getProperty("fullScreenName");

			//_calculateVisibleCardCount needs to be called in all scenarios to get the correct card width according to device width.
			//if expanded, again the card count is reset to available cards count
			let cardCount = this._calculateVisibleCardCount();
			if (isElementExpanded) {
				cardCount = this.aVisibleCardInstances.length;
			}
			this._controlModel.setProperty("/isPhone", isMobileDevice);

			// update cards in viewport
			if (cardCount !== this.cardsInViewport.length) {
				this.cardsInViewport = this.aVisibleCardInstances.slice(0, cardCount);

				const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
				this._getCardContainer().removeAllAggregation(sDefaultAggreName);
				this.cardsInViewport.forEach((card) => {
					const manifest = card.getManifest() as ICardManifest;
					const sType = manifest["sap.card"]?.type;
					let overlayHBoxWrapper!: HBox;
					if (sType === "Table" || sType === "List") {
						const overlay = new HBox({
							width: this.cardWidth,
							height: "2rem"
						}).addStyleClass("insightsCardOverflowLayer insightsCardOverflowTop");
						overlayHBoxWrapper = new HBox({
							height: "0"
						}).addStyleClass("sapMFlexBoxJustifyCenter");
						overlayHBoxWrapper.addItem(overlay);
					}
					const cardWrapper = new VBox({
						direction: "Column",
						justifyContent: "Center",
						items: [card]
					});
					if (overlayHBoxWrapper) {
						cardWrapper.addItem(overlayHBoxWrapper);
					}
					const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
					this._getCardContainer().addAggregation(sDefaultAggreName, cardWrapper);
				});

				this.shareCardsInViewport();
			}

			// show/hide Full Screen Button if available
			const showFullScreenButton = isElementExpanded || this.aVisibleCardInstances.length > cardCount;
			if (this._headerVisible) {
				this._getInsightsContainer()?.toggleFullScreenElements(this, showFullScreenButton);
			} else {
				const fullScreenButton = getAssociatedFullScreenMenuItem(this);
				const fullScreenText = fullScreenButton?.getTitle();
				this._getInsightsContainer()?.updateMenuItem(
					this._controlMap.get(`${this.getId()}-${cardsContainerMenuItems.SHOW_MORE}`) as MenuItem,
					showFullScreenButton,
					fullScreenText
				);
				this._getInsightsContainer()?.updateActionButton(
					this._controlMap.get(`${this.getId()}-${cardsContainerActionButtons.SHOW_MORE}`) as Button,
					showFullScreenButton,
					fullScreenText
				);
			}
		} else {
			this.cardWidth = this.getDeviceType() === DeviceType.Mobile ? "19rem" : "22rem";
		}

		// update width of cards on resize
		if (cardWidth !== this.cardWidth) {
			this.aVisibleCardInstances.forEach((card) => card.setWidth(this.cardWidth));
			this.cardsContainerSettings?.setColumnSize(this.cardWidth);
		}
	}

	/**
	 * Retrieves the menu items for the container.
	 *
	 * @private
	 * @returns {MenuItem[]} An array of MenuItem instances.
	 */
	public getContainerMenuItems(): MenuItem[] {
		if (!this._containerMenuItems) {
			const containerRefreshMenuItem = this._createRefreshMenuItem(cardsContainerMenuItems.REFRESH, "containerCardsRefresh");
			const containerEditCardsMenuItem = this._createEditCardsMenuItem(cardsContainerMenuItems.EDIT_CARDS, "containerManageCards");
			const containerShowMoreMenuItem = createShowMoreMenuItem(this, cardsContainerMenuItems.SHOW_MORE, "containerCardsShowMore");
			this._controlMap.set(`${this.getId()}-${cardsContainerMenuItems.SHOW_MORE}`, containerShowMoreMenuItem);
			this._containerMenuItems = [containerRefreshMenuItem, containerEditCardsMenuItem, containerShowMoreMenuItem];
		}
		return this._containerMenuItems;
	}

	/**
	 * Retrieves the action buttons for the container.
	 *
	 * @private
	 * @returns {Button[]} An array of Button instances.
	 */
	public getContainerActionButtons(): Button[] {
		if (!this._containerActionButtons) {
			this._containerActionButtons = [];
			const actionButton = createShowMoreActionButton(this, cardsContainerActionButtons.SHOW_MORE, "containerCardsShowMore");
			if (actionButton) {
				this._controlMap.set(`${this.getId()}-${cardsContainerActionButtons.SHOW_MORE}`, actionButton);
				this._containerActionButtons.push(actionButton);
			}
		}

		return this._containerActionButtons;
	}

	/**
	 * Retrieves the insights container.
	 *
	 * @private
	 * @returns {InsightsContainer} - The insights container.
	 */
	private _getInsightsContainer(): InsightsContainer {
		if (!this.insightsContainer) {
			this.insightsContainer = this.getParent() as InsightsContainer;
		}
		return this.insightsContainer;
	}

	/**
	 * Creates the refresh menu item.
	 *
	 * @param {string} id - The ID of the menu item.
	 * @param {string} fesrId - The FESR ID of the menu item.
	 * @returns {MenuItem} - The created menu item.
	 * @private
	 */
	private _createRefreshMenuItem(id: string, fesrId?: string): MenuItem {
		const menuItem = new MenuItem(`${this.getId()}-${id}`, {
			title: this._i18nBundle.getText("refresh"),
			icon: "sap-icon://refresh",
			visible: false,
			press: () => this.refreshCards()
		});
		this._controlMap.set(`${this.getId()}-${id}`, menuItem);
		if (fesrId) {
			addFESRId(menuItem, fesrId);
		}

		return menuItem;
	}

	/**
	 * Creates the edit cards menu item.
	 *
	 * @param {string} id - The ID of the menu item.
	 * @param {string} fesrId - The FESR ID of the menu item.
	 * @returns {MenuItem} - The created menu item.
	 * @private
	 */
	private _createEditCardsMenuItem(id: string, fesrId?: string): MenuItem {
		const menuItem = new MenuItem(`${this.getId()}-${id}`, {
			title: this._i18nBundle.getText("manageCards"),
			icon: "sap-icon://edit",
			visible: false,
			press: (event: Event) => this._handleEditCards(event)
		});
		this._controlMap.set(`${this.getId()}-${id}`, menuItem);
		if (fesrId) {
			addFESRId(menuItem, fesrId);
		}
		return menuItem;
	}

	/**
	 * Toggles the visibility of the header actions.
	 *
	 * @param {boolean} bShow - Whether to show or hide the header actions.
	 * @private
	 */
	private _toggleHeaderActions(bShow: boolean) {
		(this.getAggregation("menuItems") as MenuItem[])?.forEach((menuItem) => {
			this._getInsightsContainer()?.toggleMenuListItem(menuItem, bShow);
		});
		(this.getAggregation("actionButtons") as Button[])?.forEach((actionButton) =>
			this._getInsightsContainer()?.toggleActionButton(actionButton, bShow)
		);
	}

	/**
	 * Retrieves the card container based on the device type.
	 *
	 * @private
	 * @returns {GridContainer | HeaderContainer} - The card container.
	 *
	 */
	private _getCardContainer() {
		if (this.getDeviceType() === DeviceType.Mobile) {
			return this.cardsMobileContainer;
		}
		return this.cardsContainer;
	}

	/**
	 * Sorts the menu items based on the provided order.
	 *
	 * @private
	 * @param {string[]} menuItems - The order of the menu items.
	 */
	private _sortMenuItems(menuItems: string[]) {
		const panelMenuItems = this.getAggregation("menuItems") as MenuItem[];
		let sortedMenuItems = sortMenuItems(menuItems, panelMenuItems);
		this.removeAllAggregation("menuItems");
		sortedMenuItems?.forEach((menuItem) => this.addAggregation("menuItems", menuItem));
	}

	/**
	 * Shares the cards that are currently in the viewport by firing the "visibleCardsUpdated" event.
	 *
	 * @private
	 */
	private shareCardsInViewport() {
		const cardCount = this._calculateVisibleCardCount();
		const visibleCards = this._controlModel.getProperty("/userVisibleCards") as ICard[];
		const cardsInViewport = visibleCards?.slice(0, cardCount);
		if (cardsInViewport?.length) {
			this.fireEvent("visibleCardsUpdated", { cards: cardsInViewport });
		}
	}

	/**
	 * Exit lifecycle method.
	 *
	 * @private
	 * @override
	 */
	public exit() {
		runtimeHostCreated = false;
		(this.getAggregation("host") as Host)?.destroy();
	}
}
