/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import Button from "sap/m/Button";
import CustomListItem from "sap/m/CustomListItem";
import ExpandableText from "sap/m/ExpandableText";
import FlexBox from "sap/m/FlexBox";
import GenericTile, { GenericTile$PressEvent } from "sap/m/GenericTile";
import HBox from "sap/m/HBox";
import Label from "sap/m/Label";
import { ButtonType, URLHelper } from "sap/m/library";
import List from "sap/m/List";
import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import MessageToast from "sap/m/MessageToast";
import Text from "sap/m/Text";
import TextArea, { TextArea$LiveChangeEvent } from "sap/m/TextArea";
import VBox from "sap/m/VBox";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import { ValueState } from "sap/ui/core/library";
import ChangeReason from "sap/ui/model/ChangeReason";
import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Sorter from "sap/ui/model/Sorter";
import Container from "sap/ushell/Container";
import Navigation, { Target } from "sap/ushell/services/Navigation";
import SearchableContent, { AppData } from "sap/ushell/services/SearchableContent";
import VisualizationInstantiation from "sap/ushell/services/VisualizationInstantiation";
import AppsContainer from "./AppsContainer";
import BaseLayout from "./BaseLayout";
import BaseSettingsPanel from "./BaseSettingsPanel";
import ContentAdditionDialog from "./ContentAdditionDialog";
import FavAppPanel from "./FavAppPanel";
import InsightsContainer from "./InsightsContainer";
import { ICustomVisualization, ICustomVizInstance, IVisualization } from "./interface/AppsInterface";
import AppManager from "./utils/AppManager";
import {
	AI_APP_FINDER_API,
	AI_APP_FINDER_BASE_URL,
	CONTENT_ADDITION_PANEL_TYPES,
	DEFAULT_APP_ICON,
	FEATURE_TOGGLES,
	FESR_IDS,
	MYINSIGHT_SECTION_ID
} from "./utils/Constants";
import { recycleId } from "./utils/DataFormatUtils";
import { isNavigationSupportedForFeature } from "./utils/FeatureUtils";
import { addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";

const Constants = {
	DeprecatedInfoText: "deprecated",
	MinQueryLength: 2,
	MaxDescriptionLength: 500
};

enum SearchStatus {
	Idle = "idle",
	Searching = "searching",
	Complete = "complete"
}

enum ErrorType {
	NoResultsFound = "noResultsFound",
	ServiceError = "serviceError"
}

enum TileType {
	Static = "STATIC"
}

interface RawAppData {
	title: string;
	subTitle: string;
	appDescription: string;
	chipID: string;
	tileType: TileType;
	iconUrl: string;
	configuration: string;
}
interface SuggestedApp {
	icon: string;
	title: string;
	chipID: string;
	status: string[];
	subTitle: string;
	description: string;
	isStaticApp: boolean;
	addedToHomePage: boolean;
	vizData?: IVisualization;
}

interface QueryResponse {
	value: RawAppData[];
}

interface ErrorResponse {
	error: {
		code: string;
		message: string;
	};
}

interface Configuration {
	tileConfiguration: string;
}

interface TileConfig {
	display_info_text: string;
	[key: string]: string;
}

/**
 *
 * Class for Apps Addition Panel in MyHome.
 *
 * @extends BaseSettingsPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.136
 *
 * @private
 *
 * @alias sap.cux.home.AppsAdditionPanel
 */
export default class AppsAdditionPanel extends BaseSettingsPanel {
	private appManagerInstance: AppManager = AppManager.getInstance();
	private vizInstantiationService!: VisualizationInstantiation;
	private allAvailableVisualizations!: IVisualization[];
	private userSelectedApps!: Set<CustomListItem>;
	private appSuggestionList!: List;
	private model!: JSONModel;
	private addAppsButton!: Button;
	private isPanelSupported!: boolean;

	/**
	 * Init lifecycle method
	 *
	 * @public
	 * @override
	 */
	public init(): void {
		super.init();
		this.userSelectedApps = new Set<CustomListItem>();

		//setup panel
		this.setProperty("key", CONTENT_ADDITION_PANEL_TYPES.AI_APP_FINDER);
		this.setProperty("title", this._i18nBundle.getText("addAppsAndTile"));

		//setup actions
		this._setupActions();

		//setup content
		void this._setupContent();

		//setup events
		this.attachEvent("onDialogClose", () => {
			if (!this._isDialogPersisted(this.getParent() as ContentAdditionDialog)) {
				this.resetPanel();
			}
		});
	}

	/**
	 * Sets up the actions for the Apps Addition Panel.
	 *
	 * @private
	 */
	private _setupActions(): void {
		this.addAppsButton = new Button(recycleId(`${this.getId()}-add-app-btn`), {
			text: this._i18nBundle.getText("addFromInsightsDialogBtn"),
			type: ButtonType.Emphasized,
			press: () => {
				void this.onPressAddApps();
			}
		});

		this.addAppsButton.bindProperty("enabled", {
			parts: ["/hasError", "/searchStatus", "/userSelectedApps"],
			formatter: (hasError: boolean, searchStatus: SearchStatus, userSelectedApps: string[]) => {
				return !hasError && searchStatus === SearchStatus.Complete && userSelectedApps.length > 0;
			}
		});

		addFESRSemanticStepName(this.addAppsButton, FESR_EVENTS.PRESS, FESR_IDS.ADD_AI_APP);
		this.addActionButton(this.addAppsButton);
	}

	/**
	 * Sets up the content for the Apps Addition Panel.
	 *
	 * @private
	 * @async
	 */
	private async _setupContent(): Promise<void> {
		this.vizInstantiationService = await Container.getServiceAsync<VisualizationInstantiation>("VisualizationInstantiation");

		//load ui fragment
		const panelContent = (await Fragment.load({
			id: `${this.getId()}-content`,
			name: "sap.cux.home.utils.fragment.appsAdditionContent",
			controller: this
		})) as Control;
		this.addAggregation("content", panelContent);

		//initialize ui model
		this.model = new JSONModel({
			query: "",
			hasError: false,
			errorType: ErrorType.NoResultsFound,
			errorDescription: "",
			searchStatus: SearchStatus.Idle,
			loadingAnimations: this._generateSearchingAnimations(),
			suggestedAppsCount: 0,
			userSelectedApps: [],
			suggestedApps: [],
			aiPolicyText: this._generateAIPolicyText(),
			invalidQuery: true,
			feedback: {
				thumbsUp: false,
				thumbsDown: false
			},
			sampleQueries: [
				{
					index: 1,
					query: this._i18nBundle.getText("sampleQuery_1") as string
				},
				{
					index: 2,
					query: this._i18nBundle.getText("sampleQuery_2") as string
				},
				{
					index: 3,
					query: this._i18nBundle.getText("sampleQuery_3") as string
				}
			]
		});

		panelContent.setModel(this.model);
		panelContent.setModel(new ResourceModel({ bundleName: "sap.cux.home.i18n.messagebundle" }), "i18n");
		this.addAppsButton.setModel(this.model);

		//bind suggested apps list
		this.appSuggestionList = Fragment.byId(`${this.getId()}-content`, "appsList") as List;
		this.appSuggestionList.bindAggregation("items", {
			path: "/suggestedApps",
			factory: this._generateListItem.bind(this),
			sorter: new Sorter({
				path: "status",
				comparator: (firstApp: string[], secondApp: string[]) => {
					const getPriority = (statusArray: string[]) => {
						if (statusArray.length === 0) return 0; // Empty array has highest priority

						const hasAlreadyAdded = statusArray.includes(this._i18nBundle.getText("alreadyAddedApp") as string);
						const hasDeprecated = statusArray.includes(this._i18nBundle.getText("deprecatedApp") as string);

						if (hasAlreadyAdded && hasDeprecated) return 3; // Both statuses - lowest priority
						if (hasAlreadyAdded) return 1; // Only "Already Added"
						if (hasDeprecated) return 2; // Only "Deprecated"

						return 4; // Any other combination (fallback)
					};

					const firstPriority = getPriority(firstApp);
					const secondPriority = getPriority(secondApp);

					return firstPriority - secondPriority;
				}
			})
		});

		//focus on the first item when the list is updated
		this.appSuggestionList.attachUpdateFinished(() => {
			if (this.model.getProperty("/suggestedAppsCount") > 0 && this.model.getProperty("/searchStatus") === SearchStatus.Complete) {
				this.appSuggestionList.getItems()?.[0]?.focus();
			}
		});

		//bind search field
		const searchTextArea = Fragment.byId(`${this.getId()}-content`, "searchTextArea") as TextArea;
		searchTextArea.onsapenter = this.onPressGo.bind(this);
	}

	/**
	 * Generates a list item for the Apps Addition Panel.
	 *
	 * @private
	 * @param {string} id - The unique ID for the list item.
	 * @param {Context} context - The binding context for the list item.
	 * @returns {CustomListItem} The generated list item control.
	 */
	private _generateListItem(id: string, context: Context): CustomListItem {
		const listItem = new CustomListItem(id, {
			selected: context.getProperty("addedToHomePage") as boolean,
			content: [
				new FlexBox(recycleId(`${id}-result-container`), {
					renderType: "Bare",
					direction: context.getProperty("isStaticApp") ? "Column" : "Row",
					alignItems: context.getProperty("isStaticApp") ? "Start" : "Center",
					items: [this._getAppPreviewContainer(id, context), this._getAppDetailsContainer(id, context)]
				}).addStyleClass("sapUiSmallMargin")
			]
		});

		//bind associated checkbox to disable it when the app is already added to home page
		listItem.getMultiSelectControl(true).setEnabled(!context.getProperty("addedToHomePage"));

		return listItem;
	}

	/**
	 * Creates a preview container for the suggested app.
	 *
	 * @private
	 * @param {string} id - The unique ID for the container.
	 * @param {Context} context - The binding context for the app.
	 * @returns {HBox} The app preview container.
	 */
	private _getAppPreviewContainer(id: string, context: Context): HBox {
		const container = new HBox(recycleId(`${id}-suggestedAppContainer`), {
			renderType: "Bare"
		});

		if (context.getProperty("isStaticApp") as boolean) {
			// create generic tile for static app
			container.addItem(
				new GenericTile(recycleId(`${id}-staticApp`), {
					mode: "IconMode",
					frameType: "TwoByHalf",
					width: "19rem",
					header: context.getProperty("title") as string,
					subheader: context.getProperty("subTitle") as string,
					tileIcon: (context.getProperty("icon") as string) || DEFAULT_APP_ICON,
					visible: context.getProperty("isStaticApp") as boolean,
					url: context.getProperty("url") as string,
					press: (event: GenericTile$PressEvent) => {
						this._persistDialog(this.getParent() as ContentAdditionDialog);
						URLHelper.redirect(event.getSource()?.getUrl(), false);
					}
				}).addStyleClass("suggestedTile")
			);
		} else {
			// create custom visualization for other apps
			const vizData = context.getProperty("vizData") as ICustomVisualization;
			const instance = this.vizInstantiationService.instantiateVisualization(vizData) as ICustomVizInstance;
			instance?.setActive(true);
			instance?.attachPress(() => this._persistDialog(this.getParent() as ContentAdditionDialog));
			container.addItem(instance);
		}

		return container;
	}

	/**
	 * Creates a details container for the suggested app.
	 *
	 * @private
	 * @param {string} id - The unique ID for the container.
	 * @param {Context} context - The binding context for the app.
	 * @returns {VBox} The app details container.
	 */
	private _getAppDetailsContainer(id: string, context: Context): VBox {
		return new VBox(recycleId(`${id}-app-details-container`), {
			renderType: "Bare",
			gap: "0.5rem",
			items: [
				new ExpandableText(recycleId(`${id}-description`), {
					text: context.getProperty("description") as string,
					maxCharacters: Constants.MaxDescriptionLength
				}),
				new HBox(recycleId(`${id}-app-status-container`), {
					renderType: "Bare",
					visible: (context.getProperty("status") as string[]).length > 0,
					items: [
						new Label(recycleId(`${id}-appStatusLabel`), {
							text: this._i18nBundle.getText("appStatus"),
							showColon: true
						}),
						new HBox(recycleId(`${id}-app-status-texts`), {
							renderType: "Bare",
							items: this._generateStatusTexts(id, context.getProperty("status") as string[])
						}).addStyleClass("sapUiTinyMarginBegin statusTextsContainer")
					]
				})
			]
		}).addStyleClass((context.getProperty("isStaticApp") as boolean) ? "sapUiSmallMarginTop" : "sapUiSmallMarginBegin");
	}

	/**
	 * Checks if the Apps Addition Panel is supported. Internally, it checks if the
	 * AI Smart App Finder feature toggle is enabled and if the associated application
	 * is accessible for the user.
	 *
	 * @public
	 * @override
	 * @async
	 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating support.
	 */
	public async isSupported(): Promise<boolean> {
		const appsIntent: Target = {
			target: {
				semanticObject: "IntelligentPrompt",
				action: "propose"
			}
		};
		if (this.isPanelSupported === undefined) {
			this.isPanelSupported = false;

			if (this.getFavAppPanel()) {
				this.isPanelSupported = await isNavigationSupportedForFeature(FEATURE_TOGGLES.AI_SMART_APPFINDER, appsIntent);
			}
		}

		//remove panel if it's not supported
		if (!this.isPanelSupported) {
			this.removeActionButton(this.addAppsButton);
			const contentAdditionDialog = this.getParent() as ContentAdditionDialog;
			contentAdditionDialog.removePanel(this);
			contentAdditionDialog.updateActionButtons();
		}

		return this.isPanelSupported;
	}

	/**
	 * Generates the searching animation SVG as a string.
	 *
	 * @private
	 * @returns {string} The SVG string for the loading animation.
	 */
	private _generateSearchingAnimations(): string[] {
		const loadingShimmer = `<defs>
			<linearGradient id="loadingShimmer" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--sapContent_Placeholderloading_Background)" />
				<stop offset="20%" stop-color="var(--sapContent_Placeholderloading_Background)" />
				<stop offset="50%" stop-color="var(--sapContent_Placeholderloading_Background_Dark)" />
				<stop offset="80%" stop-color="var(--sapContent_Placeholderloading_Background)" />
				<stop offset="100%" stop-color="var(--sapContent_Placeholderloading_Background)" />

				<animate
					attributeName="x1"
					values="-0.6;0.6"
					dur="2.5s"
					repeatCount="indefinite" />
				<animate
					attributeName="x2"
					values="0.4;1.6"
					dur="2.5s"
					repeatCount="indefinite" />
			</linearGradient>
		</defs>`;

		return [
			`<svg height="167" fill="none">
				${loadingShimmer}
				<rect x="16" y="75" width="16" height="16" rx="4" fill="var(--sapContent_Placeholderloading_Background)"/>
				<rect x="48" y="16" width="37%" height="70" rx="16" fill="url(#loadingShimmer)"/>
				<rect x="48" y="102" width="93%" height="48" rx="4" fill="url(#loadingShimmer)"/>
			</svg>`,
			`<svg height="180" fill="none">
				${loadingShimmer}
				<rect x="16" y="82" width="16" height="16" rx="4" fill="var(--sapContent_Placeholderloading_Background)"/>
				<rect x="48" y="16" width="148" height="148" rx="16" fill="url(#loadingShimmer)"/>
				<rect x="212" y="54" width="75%" height="48" rx="4" fill="url(#loadingShimmer)"/>
				<rect x="212" y="110" width="13%" height="16" rx="4" fill="url(#loadingShimmer)"/>
			</svg>`
		];
	}

	/**
	 * Resets the search state in the Apps Addition Panel.
	 *
	 * @private
	 */
	private resetSearch: () => void = () => {
		this.userSelectedApps.clear();
		this.model.setProperty("/hasError", false);
		this.model.setProperty("/suggestedApps", []);
		this.model.setProperty("/suggestedAppsCount", 0);
		this.model.setProperty("/searchStatus", SearchStatus.Searching);
		this.model.setProperty("/userSelectedApps", []);
		this.appSuggestionList.removeSelections(true);
		this.resetFeedback();
	};

	/**
	 * Resets the panel to its default state.
	 *
	 * @private
	 */
	public resetPanel(): void {
		const defaultModelProperties = {
			query: "",
			hasError: false,
			searchStatus: SearchStatus.Idle,
			suggestedAppsCount: 0,
			userSelectedApps: [],
			suggestedApps: [],
			feedback: {
				thumbsUp: false,
				thumbsDown: false
			},
			invalidQuery: true
		};

		this.model?.setData({ ...this.model.getData(), ...defaultModelProperties } as object);
		this.userSelectedApps?.clear();
	}

	/**
	 * Handles the "Go" button press event for searching suggested apps.
	 *
	 * @private
	 * @async
	 */
	public async onPressGo(): Promise<void> {
		// validate query
		const query = this.model.getProperty("/query") as string;
		if (!this.isValidQuery(query)) return;

		try {
			// initiate search
			this.resetSearch();

			const rawApps = await this.fetchAppsFromSearch(query);
			// suggest apps if there are results and search is not cancelled
			if (this.model.getProperty("/searchStatus") === SearchStatus.Searching) {
				const allVisualizations = await this.fetchAllAvailableVisualizations();
				const favoriteApps = await this.appManagerInstance.fetchFavVizs(true, true);
				const insightsApps = await this.appManagerInstance.fetchInsightApps(true, this._i18nBundle.getText("insights") as string);

				// generate suggested apps
				const apps = this._generateApps(rawApps, allVisualizations, [...favoriteApps, ...insightsApps]);
				const suggestedApps = await this._filterUnsupportedApps(apps);

				if (suggestedApps.length === 0 && !this.model.getProperty("/hasError")) {
					this._handleError("", suggestedApps.length);
				} else {
					// update model with filtered apps
					this.model.setProperty("/suggestedApps", suggestedApps);
					this.model.setProperty("/suggestedAppsCount", suggestedApps.length);
					this.appSuggestionList.updateAggregation("items", ChangeReason.Refresh, { detailedReason: ChangeReason.Refresh });
				}
			}
		} catch (err) {
			Log.error((err as Error).message);
			this._handleError();
		} finally {
			// update search status only if search is not cancelled
			if (this.model.getProperty("/searchStatus") === SearchStatus.Searching) {
				this.model.setProperty("/searchStatus", SearchStatus.Complete);
			}
		}
	}

	/**
	 * Filters out unsupported apps based on accessibility.
	 *
	 * @private
	 * @param {SuggestedApp[]} apps - The list of suggested apps to filter.
	 * @returns {Promise<SuggestedApp[]>} A promise that resolves to the filtered list of supported apps.
	 */
	private async _filterUnsupportedApps(apps: SuggestedApp[]): Promise<SuggestedApp[]> {
		const updatedApps = apps.filter((app) => (app.isStaticApp ? true : (app.vizData ?? false)));
		const intents = updatedApps.map((app) => app.vizData?.target) || [];
		const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
		const supportedAppIndices = await navigationService.isNavigationSupported(intents as Target[]);

		return updatedApps.filter((_, index) => supportedAppIndices[index]);
	}

	/**
	 * Generates suggested apps from raw app data and visualizations.
	 *
	 * @private
	 * @param {RawAppData[]} rawApps - The raw app data to process.
	 * @param {IVisualization[]} allVisualizations - All available visualizations.
	 * @param {ICustomVisualization[]} homePageVisualizations - Visualizations available in homepage.
	 * @returns {SuggestedApp[]} The list of suggested apps.
	 */
	private _generateApps(
		rawApps: RawAppData[],
		allVisualizations: IVisualization[],
		homePageVisualizations: ICustomVisualization[]
	): SuggestedApp[] {
		return rawApps.map((app) => {
			const vizData = allVisualizations.find((viz) => viz.vizId === app.chipID);
			const addedToHomePage = homePageVisualizations.some((viz) => viz.visualization?.vizId === app.chipID);
			return {
				title: app.title,
				chipID: app.chipID,
				subTitle: app.subTitle,
				description: app.appDescription,
				icon: app.iconUrl,
				vizData,
				addedToHomePage,
				isStaticApp: app.tileType === TileType.Static,
				status: this.getAppStatusTexts(app.configuration, addedToHomePage),
				url: vizData?.targetURL || ""
			};
		}) as SuggestedApp[];
	}

	/**
	 * Validates the query string based on minimum length.
	 *
	 * @private
	 * @param {string} query - The query string to validate.
	 * @returns {boolean} True if the query is valid, otherwise false.
	 */
	private isValidQuery(query: string = ""): boolean {
		query = query?.trim();
		return query.length >= Constants.MinQueryLength && query.length <= Constants.MaxDescriptionLength;
	}

	/**
	 * Fetches all available visualizations for the user.
	 *
	 * @private
	 * @async
	 * @returns {Promise<IVisualization[]>} A promise that resolves to the list of visualizations.
	 */
	private async fetchAllAvailableVisualizations(): Promise<IVisualization[]> {
		if (!this.allAvailableVisualizations) {
			const searchableContentService = await Container.getServiceAsync<SearchableContent>("SearchableContent");
			const allAvailableApps = await searchableContentService.getApps({ enableVisualizationPreview: false });
			this.allAvailableVisualizations = allAvailableApps.reduce((visualizations: IVisualization[], currentApp: AppData) => {
				return visualizations.concat(currentApp.visualizations);
			}, []);
		}

		return this.allAvailableVisualizations;
	}

	/**
	 * Fetches a CSRF token for secure API requests.
	 *
	 * @private
	 * @async
	 * @returns {Promise<string | null>} A promise that resolves to the CSRF token or null if fetching fails.
	 */
	private async _fetchCSRFToken(): Promise<string | null> {
		try {
			const response = await fetch(AI_APP_FINDER_BASE_URL, { method: "GET", headers: { "X-CSRF-Token": "Fetch" } });
			return response.headers.get("X-CSRF-Token");
		} catch (error) {
			Log.error("Failed to fetch CSRF token", error as Error);
			return null;
		}
	}

	/**
	 * Fetches apps from the search API based on the query.
	 *
	 * @private
	 * @async
	 * @param {string} query - The search query string.
	 * @returns {Promise<RawAppData[]>} A promise that resolves to the list of raw app data.
	 */
	private async fetchAppsFromSearch(query: string): Promise<RawAppData[]> {
		try {
			const token = await this._fetchCSRFToken();
			const headers = {
				"Content-Type": "application/json",
				...(token && { "X-CSRF-Token": token })
			};

			const response = await fetch(AI_APP_FINDER_API, {
				method: "POST",
				headers,
				body: JSON.stringify({ UserInput: query })
			});

			// handle error responses
			if (!response.ok) {
				const errorResponse = (await response.json()) as ErrorResponse;
				this._handleError(errorResponse.error?.message || "");
				return [];
			}

			const queryResult = (await response.json()) as QueryResponse;
			return queryResult.value || [];
		} catch (error) {
			Log.error((error as Error).message);
			this._handleError();
			return [];
		}
	}

	/**
	 * Retrieves status texts for an app based on its configuration and homepage status.
	 *
	 * @private
	 * @param {string} configuration - The app's configuration string.
	 * @param {boolean} addedToHomePage - Indicates if the app is already added to the homepage.
	 * @returns {string[]} An array of status texts for the app.
	 */
	private getAppStatusTexts(configuration: string, addedToHomePage: boolean): string[] {
		let statusTexts = [];

		if (configuration) {
			try {
				const parsedConfig = JSON.parse(configuration) as Configuration;
				const tileConfig = JSON.parse(parsedConfig?.tileConfiguration) as TileConfig;
				const infoText = (tileConfig?.display_info_text || "").toLowerCase();
				if (infoText === Constants.DeprecatedInfoText) {
					statusTexts.push(this._i18nBundle.getText("deprecatedApp") as string);
				}
			} catch (error: unknown) {
				Log.warning((error as Error).message);
			}
		}

		if (addedToHomePage) {
			statusTexts.push(this._i18nBundle.getText("alreadyAddedApp") as string);
		}

		return statusTexts;
	}

	/**
	 * Generates status text controls for the provided status texts.
	 *
	 * @private
	 * @param {string} id - The id of the list item.
	 * @param {string[]} stausTexts - The list of status texts.
	 * @returns {Text[]} An array of Text controls with applied styles.
	 */
	private _generateStatusTexts(id: string, stausTexts: string[]): Text[] {
		return stausTexts.map((status, index) => {
			return new Text(recycleId(`${id}-statusText-${index}`), {
				text: status
			}).addStyleClass(this.applyStatusClass(status));
		});
	}

	/**
	 * Applies a CSS class to the status text based on its type.
	 *
	 * @private
	 * @param {string} status - The status text to classify.
	 * @returns {string} The CSS class for the status text.
	 */
	public applyStatusClass(status: string): string {
		if (status === this._i18nBundle.getText("alreadyAddedApp")) {
			return "addedAppStatusText";
		} else if (status === this._i18nBundle.getText("deprecatedApp")) {
			return "deprecatedAppStatusText";
		} else {
			return "";
		}
	}

	/**
	 * Handles the "Add Apps" button press event to add selected apps to favorites.
	 *
	 * @private
	 * @async
	 */
	private async onPressAddApps(): Promise<void> {
		const userSelectedApps = this.model.getProperty("/userSelectedApps") as CustomListItem[];
		let staticAppsPresent = false;
		let dynamicAppsPresent = false;

		for (const app of userSelectedApps) {
			const isStaticApp = app.getBindingContext()?.getProperty("isStaticApp") as boolean;
			if (isStaticApp) staticAppsPresent = true;
			else dynamicAppsPresent = true;

			const vizId = app.getBindingContext()?.getProperty("chipID") as string;
			await this.appManagerInstance.addVisualization(vizId, isStaticApp ? undefined : MYINSIGHT_SECTION_ID);
		}

		if (staticAppsPresent) {
			await this.refreshFavoriteApps();
		}

		if (dynamicAppsPresent) {
			await this.refreshInsightsApps();
		}

		(this.getParent() as ContentAdditionDialog)?.close();
		if (userSelectedApps.length > 1) {
			MessageToast.show(this._i18nBundle.getText("contentAddedToMyhome") as string);
		} else {
			const selectedItem = userSelectedApps?.[0];
			const selectedAppTitle = (selectedItem?.getBindingContext?.()?.getProperty?.("title") as string) ?? "";
			const messageKey = staticAppsPresent ? "appAddedToFavorites" : "tileAddedToInsights";
			MessageToast.show(this._i18nBundle.getText(messageKey, [selectedAppTitle]) as string);
		}
		this.resetPanel();
	}

	/**
	 * Retrieves the parent BaseLayout instance for this panel.
	 *
	 * @private
	 * @returns {BaseLayout} The parent BaseLayout instance.
	 */
	private getLayout(): BaseLayout {
		return this.getParent()?.getParent() as BaseLayout;
	}

	/**
	 * Retrieves the AppsContainer instance from the parent layout.
	 *
	 * @private
	 * @returns {AppsContainer | undefined} The AppsContainer instance or undefined if not found.
	 */
	private getAppsContainer(): AppsContainer | undefined {
		return this.getLayout()
			?.getItems()
			.find((container) => container instanceof AppsContainer);
	}

	/**
	 * Retrieves the favorite apps panel from the AppsContainer.
	 *
	 * @private
	 * @returns {FavAppPanel | undefined} The favorite apps panel or undefined if not found.
	 */
	private getFavAppPanel(): FavAppPanel | undefined {
		return this.getAppsContainer()
			?.getContent()
			.find((panel) => panel instanceof FavAppPanel);
	}

	/**
	 * Refreshes the favorite apps panel in the AppsContainer.
	 *
	 * @private
	 * @async
	 */
	private async refreshFavoriteApps(): Promise<void> {
		await this.getAppsContainer()?.refreshPanel(this.getFavAppPanel() as FavAppPanel);
	}

	/**
	 * Retrieves the InsightsContainer instance from the parent layout.
	 *
	 * @private
	 * @returns {InsightsContainer | undefined} The AppsContainer instance or undefined if not found.
	 */
	private getInsightsContainer(): InsightsContainer | undefined {
		return this.getLayout()
			?.getItems()
			.find((container) => container instanceof InsightsContainer);
	}

	/**
	 * Refreshes the Insights tiles panel in the InsightsContainer.
	 *
	 * @private
	 * @async
	 */
	private async refreshInsightsApps(): Promise<void> {
		await this.getInsightsContainer()?.refreshData("tiles");
	}

	/**
	 * Handles the selection change event for the suggested apps list.
	 *
	 * @public
	 * @param {ListBase$SelectionChangeEvent} event - The selection change event.
	 */
	public onListSelectionChange(event: ListBase$SelectionChangeEvent): void {
		const listItem = event.getParameter("listItem") as CustomListItem;
		const selected = event.getParameter("selected") as boolean;

		if (!selected) this.userSelectedApps.delete(listItem);
		else {
			const context = listItem.getBindingContext();
			const addedToHomePage = context?.getProperty("addedToHomePage") as boolean;
			if (!addedToHomePage) this.userSelectedApps.add(listItem);
		}

		this.model.setProperty("/userSelectedApps", Array.from(this.userSelectedApps));
	}

	/**
	 * Handles errors by updating the model with error details.
	 *
	 * @private
	 * @param {string} [message=""] - The error message to process.
	 */
	private _handleError(message: string = "", suggestedResponseCount?: number): void {
		const [, errorCode] = message.match(/\((\d{2})\d*\)\s*(.*)/) || [];
		if (suggestedResponseCount === 0 || message.length === 0) {
			message = this._i18nBundle.getText("NoResultErrorDescription") || "";
		}
		this.model.setProperty("/hasError", true);
		this.model.setProperty("/errorType", this._getErrorType(errorCode));
		this.model.setProperty("/errorDescription", message);
	}

	/**
	 * Determines the error type based on the provided error code.
	 *
	 * @private
	 * @param {string} [errorCode=""] - The error code to evaluate.
	 * @returns {ErrorType} The corresponding error type.
	 */
	private _getErrorType(errorCode: string = ""): ErrorType {
		if (errorCode === "10") {
			return ErrorType.ServiceError;
		} else {
			return ErrorType.NoResultsFound;
		}
	}

	/**
	 * Handles live change event for the search text area, updating value state and messages.
	 *
	 * @private
	 * @param {TextArea$LiveChangeEvent} event - The live change event from the text area.
	 */
	public onSearchTextAreaLiveChange(event: TextArea$LiveChangeEvent) {
		const textArea = event.getSource();
		const query = textArea.getValue().trim();

		if (query.length !== 0 && query.length < Constants.MinQueryLength) {
			textArea.setValueState(ValueState.Information);
			textArea.setValueStateText(this._i18nBundle.getText("minLengthRequired"));
		} else if (query.length > Constants.MaxDescriptionLength) {
			textArea.setValueState(ValueState.Warning);
			textArea.setValueStateText(this._i18nBundle.getText("maxLengthExceeded"));
		} else {
			textArea.setValueState(ValueState.None);
			textArea.setValueStateText("");
		}

		this.model.setProperty("/invalidQuery", query.length === 0 || textArea.getValueState() !== ValueState.None);
	}

	/**
	 * Generates the AI policy text with a link for display in the footer.
	 *
	 * @private
	 * @returns {string} The formatted AI policy text.
	 */
	public _generateAIPolicyText(): string {
		const linkText = this._i18nBundle.getText("createdWithAI");
		return this._i18nBundle.getText("aiPolicyText", [linkText])!;
	}

	/**
	 * Resets the feedback state.
	 *
	 * @private
	 */
	private resetFeedback(): void {
		this.model.setProperty("/feedback", {
			thumbsUp: false,
			thumbsDown: false
		});
	}

	/**
	 * Marks feedback as provided and shows a confirmation message toast.
	 *
	 * @private
	 */
	public sendFeedback(feedbackType: string): void {
		this.resetFeedback();
		this.model.setProperty(`/feedback/${feedbackType}`, true);
		MessageToast.show(this._i18nBundle.getText("feedBackSent") as string, {
			width: "20em"
		});
	}
}
