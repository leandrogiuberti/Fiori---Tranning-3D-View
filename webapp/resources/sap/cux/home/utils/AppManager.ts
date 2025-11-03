/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import VersionInfo from "sap/ui/VersionInfo";
import BaseObject from "sap/ui/base/Object";
import ODataMetaModel, { Property } from "sap/ui/model/odata/ODataMetaModel";
import ODataModelV2 from "sap/ui/model/odata/v2/ODataModel";
import Config from "sap/ushell/Config";
import Container from "sap/ushell/Container";
import Bookmark from "sap/ushell/services/BookmarkV2";
import ClientSideTargetResolution from "sap/ushell/services/ClientSideTargetResolution";
import SearchableContent, { AppData } from "sap/ushell/services/SearchableContent";
import SpaceContent from "sap/ushell/services/SpaceContent";
import VisualizationInstantiation from "sap/ushell/services/VisualizationInstantiation";
import {
	ICustomVisualization,
	ICustomVizInstance,
	IParseSBParameters,
	ISection,
	ISectionAndVisualization,
	IVisualization
} from "../interface/AppsInterface";
import {
	IAppInfo,
	IAppInfoData,
	IAppManifest,
	ICard,
	ICardDetails,
	ICardManifest,
	IEntitySet,
	IEntityType,
	IHeaderInfo,
	IPageType,
	IVersionInfo,
	PageRecord
} from "../interface/CardsInterface";
import { IPage } from "../interface/PageSpaceInterface";
import { AnalyticalCardSkeleton } from "./AnalyticalCardSkeleton";
import {
	COLUMN_LENGTH,
	DEFAULT_BG_COLOR,
	FALLBACK_ICON,
	MYHOME_PAGE_ID,
	MYHOME_SPACE_ID,
	MYINSIGHT_SECTION_ID,
	RECOMMENDATION_SRVC_URL,
	RECOMMENDED_CARD_LIMIT
} from "./Constants";
import { createBookMarkData, getLeanURL } from "./DataFormatUtils";
import HttpHelper from "./HttpHelper";
import RecommendedCardUtil from "./RecommendedCardUtil";

const CONSTANTS = {
	MUST_INCLUDE_RECOMMEDED_APPS: ["F0862", "F1823"] //My Inbox and Manage Timesheet apps
};

interface ICombinedManifestDetails {
	manifest: IValidManifest;
	metaModel: ODataMetaModel;
}

interface IValidManifest {
	url: string;
	manifest: IAppManifest;
}

export interface IMoveConfig {
	sourceSectionIndex: number;
	sourceVisualizationIndex: number;
	targetSectionIndex: number;
	targetVisualizationIndex: number;
}

const _parseSBParameters = (oParam: object | string | undefined): IParseSBParameters | undefined => {
	let oParsedParams: IParseSBParameters | undefined = {};
	if (oParam) {
		if (typeof oParam === "object") {
			oParsedParams = oParam;
		} else {
			try {
				oParsedParams = JSON.parse(oParam) as object;
			} catch (oError) {
				Log.error(oError instanceof Error ? oError.message : String(oError));
				oParsedParams = undefined;
			}
		}
	}
	return oParsedParams;
};

const _getTileProperties = (vizConfigFLP?: IVisualization): IParseSBParameters | undefined => {
	let oTileProperties: IParseSBParameters | undefined = {};
	if (vizConfigFLP?._instantiationData?.chip?.configuration) {
		const oConfig: IParseSBParameters | undefined = _parseSBParameters(vizConfigFLP._instantiationData.chip.configuration);
		if (oConfig?.tileConfiguration) {
			const oTileConfig: IParseSBParameters | undefined = _parseSBParameters(oConfig.tileConfiguration);
			if (oTileConfig) {
				oTileProperties = _parseSBParameters(oTileConfig.TILE_PROPERTIES);
			}
		}
	}
	return oTileProperties;
};

const _getAppId = (vizConfigFLP: IVisualization | undefined): string => {
	let sAppId = "";
	let oTileProperties: IParseSBParameters | undefined = {};
	if (vizConfigFLP?.target?.semanticObject && vizConfigFLP?.target?.action) {
		sAppId = `#${vizConfigFLP.target.semanticObject}-${vizConfigFLP.target.action}`;
	} else if (vizConfigFLP?._instantiationData?.chip?.configuration) {
		oTileProperties = _getTileProperties(vizConfigFLP);
		if (oTileProperties?.semanticObject && oTileProperties?.semanticAction) {
			sAppId = `#${oTileProperties?.semanticObject}-${oTileProperties?.semanticAction}`;
		}
	}
	return sAppId;
};

const _getTargetUrl = (vizConfigFLP: IVisualization | undefined) => {
	let sTargetURL = _getAppId(vizConfigFLP) || "";
	const oTileProperties = _getTileProperties(vizConfigFLP);
	if (oTileProperties?.evaluationId) {
		sTargetURL += "?EvaluationId=" + oTileProperties.evaluationId;
	}
	return sTargetURL;
};

const _isSmartBusinessTile = (oVisualization: IVisualization): boolean => {
	return oVisualization.vizType?.startsWith("X-SAP-UI2-CHIP:SSB");
};

// get App Title in case of value not present at root level
const _getAppTitleSubTitle = (oApp: IVisualization, vizConfigFLP: IVisualization): { title: string; subtitle: string } => {
	const oAppTileInfo = vizConfigFLP?._instantiationData?.chip?.bags?.sb_tileProperties?.texts;
	return {
		title: oApp.title ? oApp.title : oAppTileInfo?.title || "",
		subtitle: oApp.subtitle ? oApp.subtitle : oAppTileInfo?.description || ""
	};
};

/**
 * Link Duplicate Visualizations to a single visualization
 *
 * @param {object[]} aVizs - array of visualizations
 * @returns {object[]} arry of visualizations after linking duplicate visualizations
 * @private
 */
const _linkDuplicateVizs = (aVizs: ICustomVisualization[]) => {
	aVizs.forEach((oDuplicateViz) => {
		aVizs
			.filter(
				(oViz) =>
					oViz.appId === oDuplicateViz.appId &&
					oViz?.visualization?.id !== oDuplicateViz?.visualization?.id &&
					oViz.persConfig?.sectionIndex === oDuplicateViz.persConfig?.sectionIndex
			)
			.forEach((oViz) => {
				oViz?.persConfig?.duplicateApps?.push(oDuplicateViz);
			});
	});

	return aVizs;
};

const _isGUIVisualization = (visualization: AppData) => {
	return visualization?.target?.parameters?.["sap-ui-tech-hint"]?.value?.value === "GUI";
};

const _isMustIncludeRecommendation = (recViz: ICustomVisualization) => {
	return recViz.fioriId && CONSTANTS.MUST_INCLUDE_RECOMMEDED_APPS.includes(recViz.fioriId);
};

const _isVisualizationAlreadyAdded = (visualization: ICustomVisualization, favoriteVisualizations: ICustomVisualization[]) => {
	return !favoriteVisualizations.some(
		(favViz) =>
			favViz.visualization?.target?.semanticObject === visualization.visualization?.target?.semanticObject &&
			favViz.visualization?.target?.action === visualization.visualization?.target?.action
	);
};

/**
 *
 * @class Provides the AppManager Class used for fetch and process user apps.
 *
 * @extends sap.ui.BaseObject
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 * @private
 *
 * @alias sap.cux.home.util.AppManager
 */

export default class AppManager extends BaseObject {
	private aRequestQueue: { pageId: string; pageLoadPromise: Promise<IPage> }[] = [];
	private _oMoveAppsPromise!: Promise<void>;
	private bInsightsSectionPresent: boolean = false;
	public insightsSectionIndex!: number;
	static Instance: AppManager;
	private recommendedFioriIds!: string[];
	private versionInfo!: IVersionInfo;
	private _RBManifestMap!: Record<string, ResourceBundle>;
	private _recommendedVisualizations!: ICustomVisualization[];
	private vizDataModified: boolean = false;
	private _oVizCacheData: { [key: string]: ICustomVizInstance } = {};
	private _favPageVisualizations: ICustomVisualization[] = [];
	private componentData: IAppInfo = {};
	private fioriAppData: IAppInfo = {};
	private recommendedUtilInstance: RecommendedCardUtil;
	private catalogAppData!: Promise<AppData[]> | undefined;

	private constructor() {
		super();
		this.recommendedUtilInstance = RecommendedCardUtil.getInstance();
	}

	static getInstance() {
		if (!AppManager.Instance) {
			AppManager.Instance = new AppManager();
		}
		return AppManager.Instance;
	}
	/**
	 * Returns page load promise from the request queue if it exists, adds it to the queue if it doesn't
	 *
	 * @param {string} sPageId - page id
	 * @param {boolean} bForceRefresh - force reload of data if true
	 * @returns {Promise} - returns a promise which resolves with the requested page data
	 * @private
	 */
	private async _fetchRequestFromQueue(bForceRefresh: boolean, pageId: string = MYHOME_PAGE_ID): Promise<IPage> {
		const oSpaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		let oPageLoadPromise: Promise<IPage>;
		this.aRequestQueue = this.aRequestQueue || [];

		//Check if request already exists in the queue, if not add it
		const oRequestedPage = this.aRequestQueue.find((oRequest) => oRequest.pageId === pageId);
		if (!oRequestedPage || bForceRefresh === true || this.vizDataModified === true) {
			this.vizDataModified = false;
			oPageLoadPromise = oSpaceContentService.getPage(pageId);
			if (oRequestedPage) {
				oRequestedPage.pageLoadPromise = oPageLoadPromise;
			} else {
				this.aRequestQueue.push({
					pageId: pageId,
					pageLoadPromise: oPageLoadPromise
				});
			}
		} else {
			oPageLoadPromise = oRequestedPage.pageLoadPromise;
		}

		return oPageLoadPromise;
	}
	/**
	 * Returns all dynamic visualizations present in MyHome page
	 *
	 * @param {boolean} bForceRefresh - force reload of visualizations data
	 * @returns {Promise} - resolves to array of all dynamic visualizations in MyHome page
	 * @private
	 */
	private _fetchDynamicVizs(bForceRefresh: boolean) {
		return this.fetchFavVizs(bForceRefresh, true).then((aFavApps: ICustomVisualization[]) =>
			aFavApps.filter((oDynApp) => oDynApp.isCount || oDynApp.isSmartBusinessTile)
		);
	}
	/**
	 * Returns all the sections that are available in the MyHome page
	 *
	 * @param {boolean} bForceRefresh - force reload of visualizations data
	 * @returns {Promise} - resolves to array of all sections available in MyHome page
	 * @private
	 */
	public async _getSections(bForceRefresh: boolean = false, pageId: string = MYHOME_PAGE_ID): Promise<ISection[]> {
		const oPage: IPage = await this._fetchRequestFromQueue(bForceRefresh, pageId);
		const aSections = (oPage && oPage.sections) || [],
			iRecentAppSectionIndex: number = aSections.findIndex((oSection) => oSection.default);
		if (iRecentAppSectionIndex > 0) {
			if (this._oMoveAppsPromise === undefined) {
				this._oMoveAppsPromise = this.moveSection(iRecentAppSectionIndex, 0);
				await this._oMoveAppsPromise;
			}
			return this._getSections(true);
		} else {
			return aSections;
		}
	}
	/**
	 * Models and returns all visualizations available in MyHome page
	 *
	 * @param {bool} bForceRefresh - force reload of visualizations data
	 * @returns {Promise} - resolves to array of all apps available in MyHome page
	 * @private
	 */
	private async _fetchPageVizs(bForceRefresh: boolean, pageId: string = MYHOME_PAGE_ID): Promise<ICustomVisualization[]> {
		const aVizs: ICustomVisualization[] = [];
		this._oVizCacheData = this._oVizCacheData || {};
		const aSections = await this._getSections(bForceRefresh, pageId);
		const oVizInstantiationService = await Container.getServiceAsync<VisualizationInstantiation>("VisualizationInstantiation");
		aSections.forEach((oSection: ISection, iSectionIndex: number) => {
			oSection?.visualizations?.forEach((oVisualization: IVisualization, iVisualizationIndex: number) => {
				const vizConfig = oVisualization.vizConfig,
					oVizInfo = vizConfig?.["sap.app"] || ({ title: "?" } as IVisualization),
					oViz = {} as ICustomVisualization;

				oViz.oldAppId = _getAppId(vizConfig?.["sap.flp"]);
				oViz.appId = oVisualization?.targetURL; // Using targetURL as unique identifier as in certian scenario vizConfig can be empty.
				oViz.url = oVisualization?.targetURL;
				if (!oViz.url && _isSmartBusinessTile(oVisualization)) {
					oViz.url = _getTargetUrl(vizConfig?.["sap.flp"]);
				}
				oViz.leanURL = getLeanURL(oViz.url);
				oViz.title = oVisualization?.title || _getAppTitleSubTitle(oVizInfo, oVisualization)?.title;
				oViz.subtitle = oVisualization.subtitle || _getAppTitleSubTitle(oVizInfo, oVisualization).subtitle;
				oViz.BGColor = DEFAULT_BG_COLOR().key;
				oViz.isFav = true;
				oViz.isSection = false;
				oViz.pageId = pageId;
				oViz.icon = vizConfig?.["sap.ui"]?.icons?.icon || FALLBACK_ICON;
				if (oVisualization?.indicatorDataSource) {
					oViz.isCount = true;
					oViz.indicatorDataSource = oVisualization.indicatorDataSource.path;
					oViz.contentProviderId = oVisualization.contentProviderId;
				}
				oViz.isSmartBusinessTile = _isSmartBusinessTile(oVisualization);
				if (oViz.isSmartBusinessTile) {
					if (!this._oVizCacheData[oViz.appId]) {
						this._oVizCacheData[oViz.appId] = oVizInstantiationService.instantiateVisualization(
							oVisualization
						) as ICustomVizInstance;
						this._oVizCacheData[oViz.appId].setActive(true);
					}
					oViz.vizInstance = this._oVizCacheData[oViz.appId];
				}
				// Add FLP Personalization Config
				oViz.persConfig = {
					pageId: MYHOME_PAGE_ID,
					sectionTitle: oSection.title,
					sectionId: oSection.id,
					sectionIndex: iSectionIndex,
					visualizationIndex: iVisualizationIndex,
					isDefaultSection: oSection.default,
					isPresetSection: oSection.preset,
					duplicateApps: []
				};
				oViz.visualization = oVisualization;
				// Title and Subtitle in visualization are required in Insights Dialog.
				oViz.visualization.title = oViz.title;
				oViz.visualization.subtitle = oViz.subtitle;
				aVizs.push(oViz);
			});
		});
		return aVizs;
	}
	/**
	 * Copies all Dynamic visualizations to Insights section
	 *
	 * @returns {Promise} - resolves to void and copy all the visualizations
	 * @private
	 */
	private async _copyDynamicVizs() {
		const aDynamicVizs: ICustomVisualization[] = await this._fetchDynamicVizs(true);
		return Promise.all(
			aDynamicVizs.map((oDynViz: ICustomVisualization) => {
				return this.addVisualization(oDynViz.visualization!.vizId, MYINSIGHT_SECTION_ID);
			})
		);
	}
	/**
	 * Returns a list of all favorite vizualizations in MyHome page
	 *
	 * @param {boolean} bForceRefresh - force reload of vizualizations data
	 * @param {boolean} bPreventGrouping - prevent vizualizations grouping
	 * @returns {Promise} - resolves to array of favourite vizualizations in MyHome page
	 * @private
	 */
	public async fetchFavVizs(
		bForceRefresh: boolean,
		bPreventGrouping?: boolean,
		pageId: string = MYHOME_PAGE_ID
	): Promise<ISectionAndVisualization[]> {
		const aMyHomeVizs = await this._fetchPageVizs(bForceRefresh, pageId);
		const aVisibleFavVizs = aMyHomeVizs.filter(
			(oViz) => oViz.persConfig && oViz.persConfig.sectionId !== MYINSIGHT_SECTION_ID && oViz.url && oViz.title
		);

		if (bPreventGrouping) {
			return this._filterDuplicateVizs(_linkDuplicateVizs(aVisibleFavVizs), false);
		} else {
			return this._addGroupInformation(aVisibleFavVizs);
		}
	}
	/**
	 * Returns all vizualizations present in the Insights Section
	 *
	 * @param {boolean} bForceRefresh - force reload insights vizualizations data
	 * @param {string} sSectionTitle - optional, title of insights section to be used while creating insights section
	 * @returns {Promise} - resolves to an array with all vizualizations in Insights section
	 */
	public async fetchInsightApps(bForceRefresh: boolean, sSectionTitle: string) {
		const fnFetchInsightsApps = async () => {
			const aVizs = await this._fetchPageVizs(bForceRefresh);
			return aVizs.filter((oViz) => oViz.persConfig?.sectionId === MYINSIGHT_SECTION_ID && oViz.url && oViz.title);
		};

		if (!this.bInsightsSectionPresent) {
			const aSections: ISection[] = await this._getSections(bForceRefresh);
			this.insightsSectionIndex = aSections.findIndex(function (oSection) {
				return oSection.id === MYINSIGHT_SECTION_ID;
			});

			if (
				this.insightsSectionIndex === -1 &&
				(Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled")) &&
				this.bInsightsSectionPresent === false
			) {
				this.bInsightsSectionPresent = true;
				await this.addSection({
					sectionIndex: aSections?.length,
					sectionProperties: {
						id: MYINSIGHT_SECTION_ID,
						title: sSectionTitle
					}
				});
				await this._copyDynamicVizs();
			} else {
				this.bInsightsSectionPresent = true;
			}
		}

		return await fnFetchInsightsApps();
	}

	/**
	 * Add visualization to a particular section
	 *
	 * @param {string} visualizationId - The id of the visualization to add.
	 * @param {string} sectionId - The id of the section the visualization should be added to (optional parameter)
	 * @returns {Promise} resolves to void after adding app to a section
	 * @private
	 */
	public async addVisualization(visualizationId: string, sectionId: string | undefined = undefined): Promise<void> {
		const spaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		await spaceContentService.addVisualization(MYHOME_PAGE_ID, sectionId, visualizationId);
	}

	/**
	 * @param {object} mProperties - map of properties
	 * @param {string} mProperties.sectionId - section id from which visualizations should be removed
	 * @param {object[]} mProperties.appIds - array of url of visualizations that has to be deleted
	 * @param {boolean} mProperties.ignoreDuplicateApps - if true doesn't remove the duplicate apps, else removes the duplicate apps as well
	 * @private
	 * @returns {Promise} resolves after all visualizations are deleted
	 */
	public async removeVisualizations({ sectionId, vizIds }: { sectionId: string; vizIds: string[] }) {
		const spaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		for (const vizId of vizIds) {
			const sections = await this._getSections(true);
			const sectionIndex = sections.findIndex((oSection) => oSection.id === sectionId);
			const targetSection = sectionIndex > -1 ? sections[sectionIndex] : null;
			const visualizationIndex = targetSection?.visualizations?.findIndex((oVisualization) => oVisualization.id === vizId) ?? -1;
			if (visualizationIndex > -1) {
				await spaceContentService.deleteVisualization(MYHOME_PAGE_ID, sectionIndex, visualizationIndex);
			}
		}
	}

	/**
	 * @param {object} mProperties - map of properties
	 * @param {string} mProperties.pageId - page id from which visualizations should be updated
	 * @param {object[]} mProperties.sourceSectionIndex - section index in which visualization that has to be updated
	 * @param {boolean} mProperties.sourceVisualizationIndex - visualization index in the which should be updated
	 * @param {boolean} mProperties.oVisualizationData - visualization data which will be updated for the vizualisation
	 * @private
	 * @returns {Promise} resolves to void
	 */
	public async updateVisualizations({
		pageId,
		sourceSectionIndex,
		sourceVisualizationIndex,
		oVisualizationData
	}: {
		pageId: string;
		sourceSectionIndex: number;
		sourceVisualizationIndex: number;
		oVisualizationData: { displayFormatHint: string };
	}) {
		const spaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		return spaceContentService.updateVisualization(pageId, sourceSectionIndex, sourceVisualizationIndex, oVisualizationData);
	}

	/**
	 * Create Insight Section if not already present
	 *
	 * @param {string} sSectionTitle - optional, section title
	 * @returns {Promise} - resolves to insight section created
	 */
	public async createInsightSection(sSectionTitle: string) {
		if (!this.bInsightsSectionPresent) {
			const aSections = await this._getSections();
			const iMyInsightSectionIndex = aSections.findIndex(function (oSection) {
				return oSection.id === MYINSIGHT_SECTION_ID;
			});

			//check if myinsight section exists, if not create one
			if (
				iMyInsightSectionIndex === -1 &&
				(Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled"))
			) {
				return this.addSection({
					sectionIndex: aSections.length,
					sectionProperties: {
						id: MYINSIGHT_SECTION_ID,
						title: sSectionTitle,
						visible: true
					}
				});
			}
		}

		return Promise.resolve();
	}

	/**
	 * Adds a section
	 *
	 * @param {object} mProperties - map of properties
	 * @param {string} mProperties.sectionIndex - section index
	 * @param {object} mProperties.sectionProperties - section properties
	 * @returns {Promise} resolves to void and creates the section
	 * @private
	 */
	public async addSection(mProperties: ISection) {
		const { sectionIndex, sectionProperties } = mProperties;
		const oSpaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		await oSpaceContentService.addSection(MYHOME_PAGE_ID, sectionIndex, {
			...sectionProperties,
			visible: true
		});
	}

	/**
	 * Returns visualizations for a given section
	 * @param {string} sectionId - section id
	 * @param {boolean} [forceRefresh=false] - force reload of data if true
	 * @returns {Promise} resolves to array of visualizations
	 * @private
	 */
	public async getSectionVisualizations(
		sectionId?: string,
		forceRefresh = false,
		pageId: string = MYHOME_PAGE_ID
	): Promise<ICustomVisualization[]> {
		const aApps: ISectionAndVisualization[] = await this.fetchFavVizs(forceRefresh, false, pageId);
		if (sectionId) {
			return aApps.find((oViz) => oViz.isSection && oViz.id === sectionId)?.apps || [];
		} else {
			return aApps.filter((oViz) => !oViz.isSection); //return recently added apps
		}
	}

	/**
	 * Adds a bookmark.
	 * @private
	 * @param {Object} bookmark - The bookmark data object.
	 * @returns {Promise<void>} - A Promise that resolves once the bookmark is added.
	 */
	public async addBookMark(bookmark: IVisualization, moveConfig?: IMoveConfig) {
		const oBookmarkService: Bookmark = await Container.getServiceAsync("BookmarkV2");
		const aContentNodes = await oBookmarkService.getContentNodes();
		const oMyHomeSpace = aContentNodes.find((contentNode) => contentNode.id === MYHOME_SPACE_ID);
		const contentNode = oMyHomeSpace?.children?.find((contentNode) => contentNode.id === MYHOME_PAGE_ID);
		await oBookmarkService.addBookmark(createBookMarkData(bookmark), contentNode);
		if (moveConfig) {
			return this.moveVisualization(moveConfig);
		}
		return Promise.resolve();
	}

	/**
	 * Retrieves the visualization with the specified appId within the specified section.
	 * @param {string} appId - appId of the visualization for.
	 * @param {string} sectionId - The ID of the section containing the visualization.
	 * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the section's cache.
	 * @returns {Promise<object|null>} A promise that resolves with the visualization object if found, or null if not found.
	 * @private
	 */
	public async getVisualization(appId: string, sectionId?: string, forceRefresh = false) {
		const sectionVisualizations = await this.getSectionVisualizations(sectionId, forceRefresh);
		return sectionVisualizations.find((sectionVisualization) => sectionVisualization.appId === appId);
	}

	/**
	 * Moves a visualization from source section to target section.
	 * @param {object} moveConfig - Configuration object containing details for moving the visualization.
	 * @param {number} moveConfig.sourceSectionIndex - Index of the source section.
	 * @param {number} moveConfig.sourceVisualizationIndex - Index of the visualization within the source section.
	 * @param {number} moveConfig.targetSectionIndex - Index of the target section.
	 * @param {number} moveConfig.targetVisualizationIndex - Index at which the visualization will be placed within the target section.
	 * @returns {Promise<void>} A promise that resolves to void after the move operation.
	 * @private
	 */
	public async moveVisualization(moveConfig: {
		sourceSectionIndex: number;
		sourceVisualizationIndex: number;
		targetSectionIndex: number;
		targetVisualizationIndex: number;
	}) {
		const spaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		this.vizDataModified = true;
		return spaceContentService.moveVisualization(
			MYHOME_PAGE_ID,
			moveConfig.sourceSectionIndex,
			moveConfig.sourceVisualizationIndex,
			moveConfig.targetSectionIndex,
			moveConfig.targetVisualizationIndex
		);
	}

	/**
	 * Filters out duplicate visualizations from a list of all visualizations
	 *
	 * @param {object[]} aVisibleFavoriteVizs - array containing list of all visualizations
	 * @param {boolean} bReturnDuplicateVizs - flag when set to true, returns only the duplicate apps
	 * @returns {object[]} filtered array of vizualisations
	 * @private
	 */
	public _filterDuplicateVizs(aVisibleFavoriteVizs: ICustomVisualization[], bReturnDuplicateVizs: boolean) {
		return aVisibleFavoriteVizs.filter((oViz, iVizIndex, aVizs) => {
			const iFirstIndex = aVizs.findIndex((oTempApp) => oTempApp.appId === oViz.appId);
			return bReturnDuplicateVizs ? iFirstIndex !== iVizIndex : iFirstIndex === iVizIndex;
		});
	}

	/**
	 * Add Grouping Information to visualizations list, and return concatenated list.
	 *
	 * @param {object[]} aFavoriteVizs - list of all favorite visualizations
	 * @returns {object[]} - concatenated list contaning grouping information as well
	 * @private
	 */
	private _addGroupInformation(aFavoriteVizs: ICustomVisualization[]) {
		const aRecentVizs: ICustomVisualization[] = [],
			aSections: ISection[] = [];
		let oExistingSection: ISection | undefined;

		_linkDuplicateVizs(aFavoriteVizs).forEach((oViz) => {
			if (oViz.persConfig?.isDefaultSection) {
				aRecentVizs.push(oViz);
			} else {
				oExistingSection = aSections.find((oSection) => oSection.isSection && oSection.id === oViz.persConfig?.sectionId);

				if (!oExistingSection) {
					aSections.push({
						id: oViz.persConfig?.sectionId,
						index: oViz.persConfig?.sectionIndex,
						title: oViz.persConfig?.sectionTitle || "",
						badge: "1",
						BGColor: DEFAULT_BG_COLOR().key,
						icon: "sap-icon://folder-full",
						isSection: true,
						pageId: oViz.pageId,
						isPresetSection: oViz.persConfig?.isPresetSection,
						apps: [oViz]
					});
				} else {
					oExistingSection.apps?.push(oViz);
					oExistingSection.badge = oExistingSection.apps?.length.toString();
				}
			}
		});

		//filter out duplicate apps only from recent apps list
		return [...aSections, ...this._filterDuplicateVizs(aRecentVizs, false)];
	}

	/**
	 * Move a section within a page
	 *
	 * @param {number} sourceSectionIndex - source index (previous index of the section in the page before move)
	 * @param {number} targetSectionIndex - target index (desired index of the section in the page after move)
	 * @returns {Promise} resolves to void  and moves the section to desired index within the page
	 * @private
	 */
	public async moveSection(sourceSectionIndex: number, targetSectionIndex: number): Promise<void> {
		return Container.getServiceAsync("Pages").then(function (oPagesService: {
			getPageIndex: (id: string) => number;
			moveSection: (index: number, sourceIndex: number, targetIndex: number) => void;
		}) {
			const iPageIndex: number = oPagesService.getPageIndex(MYHOME_PAGE_ID);
			return oPagesService.moveSection(iPageIndex, sourceSectionIndex, targetSectionIndex);
		} as () => void);
	}

	/**
	 * Checks if a specific URL parameter is enabled (set to "true").
	 *
	 * @param {string} param - The name of the URL parameter to check.
	 * @returns {boolean} `true` if the URL parameter exists and is set to "true" (case-insensitive), otherwise `false`.
	 */
	public isURLParamEnabled(param: string): boolean {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams?.get(param)?.toLowerCase() === "true" || false;
	}

	/**
	 * Fetch Recommended Fiori IDs
	 *
	 * @returns {Promise} resolves to array of recommended fiori ids
	 * @private
	 */
	private async _getRecommenedFioriIds(bForceRefresh: boolean = false): Promise<string[]> {
		if (!this.recommendedFioriIds || bForceRefresh) {
			try {
				const response = (await HttpHelper.GetJSON(RECOMMENDATION_SRVC_URL)) as {
					error: { message: string };
					value: Array<{ app_id: string }>;
				};
				this.recommendedFioriIds =
					response?.value?.map((oApp) => {
						return oApp.app_id;
					}) || [];
			} catch (error) {
				Log.error("Unable to load recommendations: " + (error as Error).message);
				return Promise.resolve([]);
			}
		}
		return this.recommendedFioriIds;
	}

	/**
	 * Fetch Catalog Apps
	 *
	 * @returns {Promise} resolves to array of Catalog Apps
	 * @private
	 */
	public async _getCatalogApps() {
		if (!this.catalogAppData) {
			try {
				const SearchableContent = await Container.getServiceAsync<SearchableContent>("SearchableContent");
				this.catalogAppData = SearchableContent.getApps({ includeAppsWithoutVisualizations: false });
				return this.catalogAppData;
			} catch (error) {
				this.catalogAppData = undefined;
				Log.error(error instanceof Error ? "Error while fetching catalog apps:" + error.message : String(error));
				return [];
			}
		}
		return Promise.resolve(this.catalogAppData);
	}

	/**
	 * Checks whether page settings contains addCardtoInsightsHidden
	 * @param {object} page - page object
	 * @returns {boolean} returns boolean
	 * @private
	 */
	private isAddCardToInsightsHidden(page?: IPageType) {
		return page?.component?.settings?.tableSettings?.addCardtoInsightsHidden;
	}

	/**
	 * check Valid Manifests
	 *
	 * @returns {boolean} returns boolean
	 * @private
	 */

	private _checkValidManifests(manifest: IAppManifest): boolean {
		const dataSources = manifest["sap.app"]?.dataSources;

		// Ensure dataSources has the correct structure for `mainService`
		const hasRequiredDataSource = manifest["sap.ui.generic.app"] && dataSources?.mainService;

		if (!hasRequiredDataSource) {
			return false;
		}

		const pages = manifest["sap.ui.generic.app"]?.pages;
		// if its not list report component or if listreport page settings has
		// isAddCardToInsightsHidden as true, then do not recommend the card
		if (Array.isArray(pages)) {
			return this.recommendedUtilInstance._isListReport(pages[0]) && !this.isAddCardToInsightsHidden(pages[0]);
		}

		const pageValues = Object.values(pages as PageRecord);
		if (pageValues.length > 0) {
			return pageValues.some((page) => {
				return (
					typeof page === "object" && this.recommendedUtilInstance._isListReport(page) && !this.isAddCardToInsightsHidden(page)
				);
			});
		}
		return false;
	}

	/**
	 * Get OData Model
	 *
	 * @param {object} manifest - manifest object
	 * @returns {ODataModelV2} returns OData Model
	 * @private
	 */
	private _getOdataModel(oManifest: IAppManifest): Promise<ODataModelV2> {
		return new Promise(function (resolve) {
			const datasource = oManifest?.["sap.app"]?.dataSources;
			const mainService = datasource?.mainService;
			let annotationUrls: string[] = (mainService?.settings?.annotations || [])
				.map((name: string) => datasource?.[name]?.uri || "")
				.filter(Boolean);

			const oDataModel = new ODataModelV2(mainService?.uri as string, {
				annotationURI: annotationUrls,
				loadAnnotationsJoined: true
			});
			oDataModel.attachMetadataLoaded(() => {
				resolve(oDataModel);
			});
			oDataModel.attachMetadataFailed(() => {
				resolve(oDataModel);
			});
		});
	}

	/**
	 * Get Entity Set
	 *
	 * @param {object} manifest - manifest object
	 * @returns {string} returns entity set
	 * @private
	 */
	private _getEntitySet(manifest: IAppManifest): string | undefined {
		const pages = manifest["sap.ui.generic.app"]?.pages;
		if (Array.isArray(pages)) {
			return pages[0].entitySet;
		} else if (pages) {
			for (const key in pages) {
				const oApp = pages[key] as IPageType;
				if (this.recommendedUtilInstance._isListReport(oApp)) {
					return oApp.entitySet;
				}
			}
		}
		return undefined;
	}

	/**
	 * Load I18n
	 *
	 * @param {object} manifest - manifest object
	 * @param {string} manifestUrl - manifest url
	 * @returns {object} returns resource bundle
	 * @private
	 */
	private async loadI18n(manifest: IAppManifest, manifestUrl: string) {
		// construct abslute url for properties file relative to manifest url
		const i18nBundleUrl = manifest?.["sap.app"]?.["i18n"]?.["bundleUrl"] as string;
		const absoluteUrl = new URL(i18nBundleUrl, manifestUrl).href;
		this._RBManifestMap = this._RBManifestMap || {};
		if (!this._RBManifestMap[absoluteUrl]) {
			const oResourceBundle = await ResourceBundle.create({
				// specify url of the base .properties file
				bundleUrl: absoluteUrl,
				async: true,
				terminologies: manifest["sap.app"]?.["i18n"]?.["terminologies"]
			});
			this._RBManifestMap[absoluteUrl] = oResourceBundle;
		}
		return this._RBManifestMap[absoluteUrl];
	}

	/**
	 * Get I18n Value Or Default String
	 *
	 * @param {string} sValue - value
	 * @param {object} oResourceBundle - resource bundle object
	 * @returns {string} returns string
	 * @private
	 */
	private getI18nValueOrDefaultString(sValue: string, oRB: ResourceBundle) {
		let sPath = "";
		if (sValue && sValue.startsWith("{{")) {
			sPath = sValue.substring(2, sValue.length - 2);
		} else if (sValue && sValue.startsWith("{")) {
			sPath = sValue.substring(1, sValue.length - 1);
		}
		return sPath ? oRB.getText(sPath) : sValue;
	}

	/**
	 * Retrieves a copy of the analytical card manifest.
	 *
	 *
	 * @private
	 * @returns {ICardManifest} A copy of the analytical card manifest.
	 */
	public _getAnalyticalCardManifest() {
		return JSON.parse(JSON.stringify(AnalyticalCardSkeleton)) as ICardManifest;
	}

	/**
	 * Processes the app manifest and generates a recommended card manifest if the app meets the required conditions.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
	 * @param {IValidManifest} manifestObj - An object containing the app manifest and its URL.
	 * @param {AppInfoData | undefined} parentApp - The parent app information, if available.
	 * @param {IVersionInfo} versionInfo - The version and build timestamp of the app.
	 * @returns {Promise<ICardManifest | undefined>} A promise that resolves to the generated card manifest if the app is eligible,
	 * or `undefined` if the app does not meet the required conditions.
	 * @private
	 */
	private async getProcessedManifest(
		metaModel: ODataMetaModel,
		manifestObj: IValidManifest,
		parentApp: IAppInfoData | undefined,
		versionInfo: IVersionInfo
	): Promise<ICardManifest | undefined> {
		try {
			const manifest = manifestObj.manifest;
			const mainEntitySetName = this._getEntitySet(manifest);
			if (!mainEntitySetName) {
				return undefined;
			}

			const mainEntitySet = metaModel.getODataEntitySet(mainEntitySetName) as IEntitySet;
			const lineItemDetails = this.recommendedUtilInstance.getLineItemDetails(metaModel, manifest, mainEntitySetName);

			if (!lineItemDetails?.lineItem) {
				return undefined;
			}

			const entitySetName = lineItemDetails.entitySet || mainEntitySetName;
			const entitySet = (
				entitySetName === mainEntitySetName ? mainEntitySet : metaModel.getODataEntitySet(entitySetName)
			) as IEntitySet;
			const entityType = metaModel.getODataEntityType(entitySet.entityType) as IEntityType;
			const suppressRowNavigation = lineItemDetails?.lrSettings?.["bSupressCardRowNavigation"];

			// Check for mandatory properties
			if (this.recommendedUtilInstance.hasMandatoryProperties(entitySet, entityType?.property)) {
				return undefined;
			}

			// Check for parameterized entity sets
			const parameterDetails = this.recommendedUtilInstance._getParametersisedEntitySetParams(metaModel, entitySetName, true);
			if (parameterDetails?.entitySetName && parameterDetails?.parameters?.length) {
				const paramEntitySet = metaModel.getODataEntitySet(parameterDetails.entitySetName) as IEntitySet;
				if (this.recommendedUtilInstance.hasMandatoryProperties(paramEntitySet, parameterDetails.parameters as Property[])) {
					return undefined;
				}
			}

			const cardInput = this.recommendedUtilInstance._getManifestCardData(manifest, lineItemDetails, parentApp!, metaModel);

			// Ensure the card has at least 3 columns
			if (cardInput.columns.length < COLUMN_LENGTH) {
				return undefined;
			}

			// Resolve card title
			const headerInfo = lineItemDetails?.headerInfo as IHeaderInfo;
			const cardTitle = headerInfo.TypeNamePlural?.String || "";
			cardInput.cardTitle = cardTitle || cardInput.cardTitle;

			// Resolve i18n title if necessary
			if (!cardTitle && manifest["sap.app"]?.i18n) {
				const i18nBundleUrl = manifest["sap.app"].i18n.bundleUrl;
				const appTitle = manifest["sap.app"].title;
				if (i18nBundleUrl && (appTitle.startsWith("i18n>") || appTitle.startsWith("{"))) {
					const i18nResourceBundle = await this.loadI18n(manifest, manifestObj.url);
					cardInput.cardTitle = this.getI18nValueOrDefaultString(cardInput.cardTitle!, i18nResourceBundle);
				}
			}

			return this.recommendedUtilInstance._createCardManifest(cardInput, versionInfo, manifest, suppressRowNavigation);
		} catch (oError: unknown) {
			Log.error("Error while processing manifest", oError instanceof Error ? oError.message : String(oError));
			return undefined;
		}
	}

	/**
	 * Fetches the OData meta models for a given list of valid manifests.
	 * @param {IValidManifest[]} validManifests - An array of valid manifest objects
	 * @returns {Promise<(ODataMetaModel | undefined)[]>} A promise that resolves to an array of OData meta models.
	 * Each element corresponds to a manifest in the input array, and may be `undefined` if the meta model could not be fetched.
	 * @private
	 */
	private async fetchMetaModels(validManifests: IValidManifest[]): Promise<(ODataMetaModel | undefined)[]> {
		const odataPromises = validManifests.map(async (manifestObj) => {
			try {
				return (await this._getOdataModel(manifestObj.manifest))?.getMetaModel();
			} catch (oError: unknown) {
				Log.error("Error while fetching metamodel", oError instanceof Error ? oError.message : String(oError));
				return undefined;
			}
		});

		return await Promise.all(odataPromises);
	}

	/**
	 * Combines the valid manifests with their corresponding OData meta models.
	 * @param {IValidManifest[]} validManifests - An array of valid manifest objects
	 * @param {ODataMetaModel[]} aMetaModel - An array of OData meta models
	 * @returns {ICombinedManifestDetails[]} An array of objects containing the manifest and the corresponding meta model.
	 * @private
	 */
	private combineManifestsAndMetaModels(
		validManifests: IValidManifest[],
		aMetaModel: (ODataMetaModel | undefined)[]
	): ICombinedManifestDetails[] {
		return validManifests.reduce<ICombinedManifestDetails[]>((combined, manifestObj, index) => {
			const metaModel = aMetaModel[index];
			if (metaModel) {
				combined.push({ manifest: manifestObj, metaModel });
			}
			return combined;
		}, []);
	}

	/**
	 * Process the manifest and meta model to get the card manifest
	 * @param {ICombinedManifestDetails[]} combinedDetails - An array of objects containing the manifest and the corresponding meta model.
	 * @param {IAppInfoData[]} aCSTR - An array of app info data
	 * @returns {Promise<(ICardManifest | undefined)[]>} A promise that resolves to an array of recommended card manifests.
	 * @private
	 */
	private async processManifests(
		combinedDetails: ICombinedManifestDetails[],
		aCSTR: IAppInfoData[]
	): Promise<(ICardManifest | undefined)[]> {
		return Promise.all(
			combinedDetails.map((item) => {
				const parentApp = aCSTR.find((oApp) => oApp.resolutionResult?.ui5ComponentName === item.manifest.manifest?.["sap.app"]?.id);
				return this.getProcessedManifest(item.metaModel, item.manifest, parentApp, this.versionInfo);
			})
		);
	}

	/**
	 * Processes the app list to generate a list of Fiori IDs.
	 *
	 * If `aList` is not provided, it uses `aAppComponentIds` and `aComponent` to generate the list of Fiori IDs.
	 * It matches the `semanticObject` and `action` of each component in `aAppComponentIds` with the entries in `aComponent`.
	 * If a match is found, the corresponding `fioriId` is added to the list.
	 *
	 * @param {string[]} [aList] - An optional array of Fiori IDs to return directly.
	 * @param {ICardDetails[]} [aAppComponentIds] - An array of app component details to process.
	 * @param {IAppInfo} [aComponent] - A mapping of component IDs to their corresponding data entries.
	 * @returns {string[]} - A list of Fiori IDs.
	 */
	private processAppList(aList?: string[], aAppComponentIds?: ICardDetails[], aComponent?: IAppInfo): string[] {
		if (!aList && aAppComponentIds && aAppComponentIds.length) {
			return aAppComponentIds.reduce((list, oComponent) => {
				const oData: IAppInfoData[] = aComponent?.[oComponent.id] || [];
				const matchingData = oData.find(
					(entry) => entry.semanticObject === oComponent.target?.semanticObject && entry.action === oComponent.target?.action
				);

				return matchingData ? [...list, matchingData.fioriId!] : list;
			}, [] as string[]);
		}
		return aList || [];
	}

	/**
	 * Fetch Card Mainfest
	 *
	 * @param {string[]} aAppIds - array of app ids
	 * @returns {Promise} resolves to array of card manifest
	 * @private
	 */
	public async _getCardManifest(aList?: string[], aAppComponentIds?: ICardDetails[]): Promise<ICardManifest[]> {
		try {
			const [aCatalog, aFioriData] = await Promise.all([this._getCatalogApps(), this.getFioriAppData()]);
			this.versionInfo = (await VersionInfo.load()) as IVersionInfo;

			const aCSTR: IAppInfoData[] = Object.values(aFioriData).flat();
			const aComponent = this.componentData;
			// in case of replacing old recommended cards fioriIds are not available hence make use of componnetname
			// and semanticobject and action to find fioriId, and populate aList to recreate recommended card again
			const processedList = this.processAppList(aList, aAppComponentIds, aComponent);

			const manifests = await this.fetchManifests(processedList, aFioriData, aCatalog);
			const validManifests = manifests.filter((manifestObj) => this._checkValidManifests(manifestObj.manifest));

			const aMetaModel = await this.fetchMetaModels(validManifests);
			const combinedDetails = this.combineManifestsAndMetaModels(validManifests, aMetaModel);

			const cards = await this.processManifests(combinedDetails, aCSTR);
			return cards.filter((card) => card !== undefined);
		} catch (oError: unknown) {
			Log.error("Error while fetching card manifest", oError instanceof Error ? oError.message : String(oError));
			return [];
		}
	}

	/**
	 * Fetch the app manifest for the given app ids
	 * @param {string[]} appIdList - array of app ids
	 * @param {AppInfo} fioriData - fiori data
	 * @param {AppData[]} catalogData - catalog data
	 * @returns {Promise} resolves to array of manifests
	 * @private
	 */
	private async fetchManifests(appIdList: string[], fioriData: IAppInfo, catalogData: AppData[]): Promise<IValidManifest[]> {
		try {
			const appPromises = appIdList.map(async (appId) => {
				const aApp: IAppInfoData[] = fioriData[appId] || [];
				for (const oApp of aApp) {
					const oViz = catalogData.find(
						(catalog) => oApp.semanticObject === catalog.target?.semanticObject && oApp.action === catalog.target?.action
					);
					const manifestUrl = oApp?.resolutionResult?.applicationDependencies?.manifest;
					if (oViz && manifestUrl) {
						try {
							const response = await fetch(manifestUrl);
							const manifest = (await response.json()) as IAppManifest;
							return { url: response.url, manifest };
						} catch (error: unknown) {
							Log.error("Error while fetching manifest", error instanceof Error ? error.message : String(error));
							return undefined;
						}
					}
				}
				// No valid manifest found in this appId's entries
				return undefined;
			});
			const results = await Promise.all(appPromises);
			return results.filter((manifest): manifest is IValidManifest => manifest !== undefined);
		} catch (oError) {
			Log.error("Error while processing manifests", oError instanceof Error ? oError.message : String(oError));
			return [];
		}
	}

	/**
	 * Remove Duplicate Cards
	 *
	 * @param {object[]} aCards - array of cards
	 * @returns {object[]} returns array of cards
	 * @private
	 */
	private _removeDuplicateCards(aCards: ICard[]): ICard[] {
		const oCardDict: Record<string, boolean> = {};
		const aResult: ICard[] = [];
		aCards.forEach((oCard) => {
			const sCardTitle = oCard?.descriptorContent?.["sap.card"]?.header?.title || "";
			if (!oCardDict[sCardTitle]) {
				aResult.push(oCard);
				oCardDict[sCardTitle] = true;
			}
		});
		return aResult;
	}

	/**
	 * Fetch Recommended Cards
	 *
	 * @returns {Promise<ICard[] | []> } resolves to array of recommended cards
	 * @private
	 */
	public async getRecommenedCards(): Promise<ICard[] | []> {
		try {
			const aAppIds = await this._getRecommenedFioriIds();
			const aManifests = await this._getCardManifest(aAppIds);
			const aRecManifests = aManifests?.slice(0, RECOMMENDED_CARD_LIMIT);
			const aRecommendedCards = aRecManifests?.map((manifest) => {
				let id;
				if (manifest?.["sap.card"]) {
					manifest["sap.card"].rec = true;
					id = manifest["sap.app"]?.id;
				}
				return {
					id,
					descriptorContent: manifest
				};
			});
			return this._removeDuplicateCards(aRecommendedCards as ICard[]);
		} catch (error) {
			Log.error("Error while fetching recommended cards:", error instanceof Error ? error.message : String(error));
			return [];
		}
	}

	/**
	 * Retrieves a list of recommended visualizations for the user.
	 *
	 * The final list is composed of up to 10 recommendations, with must-include visualizations prioritized.
	 * If no recommended visualizations are available or if an error occurs, it returns an empty array.
	 *
	 * @private
	 * @async
	 * @param {boolean} [forceRefresh=false] - If `true`, forces a refresh of the recommended visualizations
	 *                                         regardless of whether they are cached.
	 * @returns {Promise<ICustomVisualization[]>} A promise that resolves to an array of recommended visualizations.
	 *                                            The array is limited to 10 visualizations, including must-include recommendations.
	 */
	public async getRecommendedVisualizations(forceRefresh: boolean = false) {
		if (!this._recommendedVisualizations || forceRefresh) {
			const recommendedFioriIds = await this._getRecommenedFioriIds(forceRefresh);
			if (recommendedFioriIds.length) {
				let finalRecommendations: ICustomVisualization[] = [];
				let mustIncludeRecommendations: ICustomVisualization[] = [];
				let [recommendedVisualizations, favoriteVisualizations] = await Promise.all([
					this._getVisualizationsByFioriIds(recommendedFioriIds),
					this._fetchPageVizs(forceRefresh)
				]);
				//filter out recommendations that are already added
				recommendedVisualizations = recommendedVisualizations.filter((recViz) =>
					_isVisualizationAlreadyAdded(recViz, favoriteVisualizations)
				);
				recommendedVisualizations.forEach((recViz) => {
					if (_isMustIncludeRecommendation(recViz)) {
						mustIncludeRecommendations.push(recViz);
					} else {
						finalRecommendations.push(recViz);
					}
				});
				//return only 10 recommended apps along with 'MyInbox' and 'Manage My Timesheet' if user has access to these apps.
				this._recommendedVisualizations = finalRecommendations
					.slice(0, 10 - mustIncludeRecommendations.length)
					.concat(mustIncludeRecommendations);
			} else {
				this._recommendedVisualizations = [];
			}
		}
		return this._recommendedVisualizations;
	}

	/**
	 * Asynchronously retrieves the list of inbound applications from the SAP Fiori client-side target resolution service.
	 *
	 * @private
	 * @async
	 * @returns {Promise<Array>} A promise that resolves to an array of inbound applications.
	 *                            If an error occurs or the inbound applications are not available, it resolves to an empty array.
	 */
	private async _getInboundApps() {
		try {
			const service = await Container.getServiceAsync<ClientSideTargetResolution>("ClientSideTargetResolution");
			return service?._oAdapter?._aInbounds || [];
		} catch (error) {
			Log.error("Error while fetching inbound apps: " + (error as Error).message);
			return [];
		}
	}

	/**
	 * Retrieves Fiori app data and stores it in the `fioriAppData` and `componentData` properties.
	 *
	 * This method fetches inbound applications using the `_getInboundApps` method and processes them to extract
	 * Fiori app IDs (`sap-fiori-id`) and their associated semantic data. It also maps UI5 component names to their
	 * corresponding Fiori app IDs for later use.
	 *
	 * @returns {Promise<IAppInfo>} A promise that resolves to an object containing Fiori app data
	 * @private
	 */
	private async getFioriAppData(): Promise<IAppInfo> {
		try {
			if (!Object.keys(this.componentData).length) {
				this.componentData = {};
				this.fioriAppData = {};
				const inbounds = await this._getInboundApps();
				inbounds.forEach((oItem) => {
					const fioriId = oItem?.signature?.parameters?.["sap-fiori-id"]?.defaultValue?.value;
					const componentId = oItem?.resolutionResult?.ui5ComponentName;
					if (fioriId) {
						const semanticData: IAppInfoData = {
							action: oItem.action,
							semanticObject: oItem.semanticObject,
							resolutionResult: oItem.resolutionResult
						};
						this.fioriAppData[fioriId] = this.fioriAppData[fioriId] || [];
						this.fioriAppData[fioriId].push(semanticData);

						// store data along with fioriId in componentData, this can be used later to find the
						// fioriId for those apps when only ui5ComponentName is known
						if (componentId) {
							const combinedData: IAppInfoData = { ...semanticData, fioriId };

							this.componentData[componentId] = this.componentData[componentId] || [];
							this.componentData[componentId].push(combinedData);
						}
					}
				});
			}
			return this.fioriAppData;
		} catch (oError) {
			Log.error(oError instanceof Error ? oError.message : String(oError));
			return {};
		}
	}

	/**
	 * Retrieves visualizations based on a list of Fiori IDs.
	 *
	 * This function processes the given Fiori IDs to find associated visualizations. It does so by fetching
	 * inbound applications and catalog apps, then matching the Fiori IDs to filter out and gather relevant visualizations.
	 * The function distinguishes between GUI and non-GUI visualizations, prioritizing non-GUI visualizations if both types are found.
	 * It also ensures that each visualization is unique based on its URL and title, avoiding duplicates.
	 *
	 * @private
	 * @async
	 * @param {string[]} fioriIds - An array of Fiori IDs to search for visualizations.
	 * @returns {Promise<ICustomVisualization[]>} A promise that resolves to an array of unique visualizations associated with the provided Fiori IDs.
	 */
	private async _getVisualizationsByFioriIds(fioriIds: string[]) {
		const visualizations: ICustomVisualization[] = [];
		const visitedVisualizations: Map<string, boolean> = new Map<string, boolean>();
		const [inbounds, catalogApps] = await Promise.all([this._getInboundApps(), this._getCatalogApps()]);
		fioriIds.forEach((fioriId) => {
			// get all inbounds with the fiori id
			const authorizedApps = inbounds.filter(function (inbound) {
				return inbound?.signature.parameters["sap-fiori-id"]?.defaultValue?.value === fioriId;
			});
			authorizedApps.forEach((app) => {
				//filter apps that matched semantic object action
				let matchingVizualizations = catalogApps.filter((catalogApp) => {
					return catalogApp?.target?.semanticObject === app.semanticObject && catalogApp.target.action === app.action;
				});

				const guiVisualizations = matchingVizualizations.filter((matchingVizualization) =>
					_isGUIVisualization(matchingVizualization)
				);
				const nonGuiVisualizations = matchingVizualizations.filter(
					(matchingVizualization) => !_isGUIVisualization(matchingVizualization)
				);
				//if both gui and non-gui visualizations exists, then consider only non-gui visualizations for recommendation.
				if (guiVisualizations.length > 0 && nonGuiVisualizations.length > 0) {
					matchingVizualizations = [...nonGuiVisualizations];
				}

				matchingVizualizations.forEach((matchingVizualization) => {
					let visualization = matchingVizualization.visualizations[0];
					let recommendedVisualization: ICustomVisualization = {
						title: visualization.title,
						subtitle: visualization.subtitle,
						icon: visualization.icon,
						url: visualization.targetURL,
						vizId: visualization.vizId,
						fioriId: fioriId,
						visualization: visualization
					};
					//if app with same url or title already recommended, then don't consider it.
					if (
						!visitedVisualizations.has(recommendedVisualization.url!) ||
						!visitedVisualizations.has(recommendedVisualization.title!)
					) {
						visitedVisualizations.set(recommendedVisualization.url!, true);
						visitedVisualizations.set(recommendedVisualization.title!, true);
						visualizations.push(recommendedVisualization);
					}
				});
			});
		});
		return visualizations;
	}

	/**
	 * Retrieves visualizations for all favorite pages based on the provided parameters.
	 * @param {Array} pages - An array of favorite pages.
	 * @param {boolean} shouldReload - A flag indicating whether to reload page visualizations.
	 * @returns {Promise<ICustomVisualization[]>} A promise that resolves with an array of favorite page visualizations.
	 * @private
	 */
	public async _getAllFavPageApps(pages: IPage[], shouldReload?: boolean): Promise<ICustomVisualization[]> {
		try {
			if (pages) {
				this._favPageVisualizations = this._favPageVisualizations || [];
				//Check to ensure that missing visualization data is loaded, if any
				const loadedPages = this._favPageVisualizations.reduce((pageIDs: string[], visualization) => {
					if (visualization.pageId && !pageIDs.includes(visualization.pageId)) {
						pageIDs.push(visualization.pageId);
					}
					return pageIDs;
				}, []);
				const pageIds = pages.map((page) => page.pageId);
				const shouldLoadMissingApps = loadedPages.length === 0 || !loadedPages.every((pageId) => pageIds.includes(pageId));
				if (!shouldReload && !shouldLoadMissingApps) {
					return this._favPageVisualizations;
				} else {
					this._favPageVisualizations = await this._loadAllPageVisualizations(pages, shouldReload);
					return this._favPageVisualizations;
				}
			}
			return [];
		} catch (error) {
			Log.error(error as string);
			return [];
		}
	}

	/**
	 * Loads visualizations for all specified pages.
	 * @param {Array} pages - An array of pages.
	 * @param {boolean} [shouldFetchDistinctApps=false] - A flag indicating whether to fetch distinct pages.
	 * @returns {Promise<ICustomVisualization[]>} A promise that resolves with an array of page visualizations.
	 * @private
	 */
	private async _loadAllPageVisualizations(
		pages: IPage[],
		forceRefresh = false,
		shouldFetchDistinctApps = false
	): Promise<ICustomVisualization[]> {
		const getBgColor = (pageId: string | undefined) => {
			return pages.find((page) => page.pageId === pageId)?.BGColor ?? DEFAULT_BG_COLOR().key;
		};

		try {
			const favPageVisualizations: ICustomVisualization[] = [];
			const aPages = await this.loadPages(pages, forceRefresh);

			for (const page of aPages) {
				const sections = page?.sections || [];
				for (const section of sections) {
					const visualizations = section.visualizations || [];
					for (const visualization of visualizations) {
						const app = {
							appId: visualization.targetURL,
							vizId: visualization.vizId,
							icon: visualization.icon,
							BGColor: getBgColor(page.id) as string,
							pageId: page.id
						};
						if (!shouldFetchDistinctApps || !favPageVisualizations.some((oVizApp) => oVizApp.appId === app.appId)) {
							favPageVisualizations.push(app);
						}
					}
				}
			}
			return favPageVisualizations;
		} catch (error) {
			Log.error(error as string);
			return [];
		}
	}
	/**
	 * Fetches page data for the specified pages.
	 * @param {Array} pages - An array of pages.
	 * @param {boolean} forceRefresh - If true, forces a refresh of the page data.
	 * @returns {Promise<IPage>} A promise that resolves to the fetched page data.
	 * @private
	 */
	private async loadPages(pages: IPage[], forceRefresh: boolean = false): Promise<IPage[]> {
		return await Promise.all(pages.map((page) => this._fetchRequestFromQueue(forceRefresh, page.pageId)));
	}
}
