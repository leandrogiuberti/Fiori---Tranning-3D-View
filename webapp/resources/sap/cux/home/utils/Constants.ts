/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Parameters from "sap/ui/core/theming/Parameters";

export const fnFetchLegendColor = (sLegendName: string) => {
	return {
		key: sLegendName,
		value: Parameters.get({
			name: sLegendName
		}),
		assigned: false
	};
};

const BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";
const INSIGHTS_READ_SRVC_URL = BASE_URL + "insights_read_srv/0001/";

export const MYHOME_PAGE_ID: string = "SAP_BASIS_PG_UI_MYHOME";
export const MYAPPS_SECTION_ID: string = "3WO90XZ1DX1AS32M7ZM9NBXEF";
export const FALLBACK_ICON: string = "sap-icon://document";
export const DEFAULT_APP_ICON: string = "sap-icon://product";
export const MYINSIGHT_SECTION_ID: string = "AZHJGRIT78TG7Y65RF6EPFJ9U";
export const MYHOME_SPACE_ID: string = "SAP_BASIS_SP_UI_MYHOME";
export const DEFAULT_BG_COLOR = () => fnFetchLegendColor("sapLegendColor9");

export const PAGE_SELECTION_LIMIT = 8;
export const LEGEND_COLORS = () =>
	[
		"sapLegendColor6",
		"sapLegendColor3",
		"sapLegendColor1",
		"sapLegendColor10",
		"sapLegendColor12",
		"sapLegendColor7",
		"sapLegendColor5",
		"sapLegendColor8",
		"sapLegendColor18",
		"sapLegendColor9"
	].map(fnFetchLegendColor);
export const END_USER_COLORS = () =>
	[
		"sapLegendColor19",
		"sapLegendColor13",
		"sapLegendColor11",
		"sapLegendColor20",
		"sapLegendColor2",
		"sapLegendColor17",
		"sapLegendColor15",
		"sapLegendColor14",
		"sapLegendColor16",
		"sapLegendColor4"
	].map(fnFetchLegendColor);
export const AppTypes = {
	FAVORITE: "FAVORITE",
	RECENT: "RECENT",
	FREQUENT: "FREQUENT"
};
export const PLACEHOLDER_ITEMS_COUNT = 5;
export const RECOMMENDED_CARD_LIMIT = 4;
export const RECOMMENDATION_SRVC_URL = INSIGHTS_READ_SRVC_URL + "RecommendedApps";
export enum FEATURE_TOGGLES {
	AI_GENERATED_CARD = "AIU_SMART_PERSONALIZATION",
	AI_SMART_APPFINDER = "AIU_SMART_APPFINDER"
}
export const FEATURE_TOGGLE_SRVC_URL = INSIGHTS_READ_SRVC_URL + "FeatureToggle";
export const REPO_BASE_URL = BASE_URL + "insights_cards_repo_srv/0001/";
export const DEFAULT_NEWS_BASE_URL = "/sap/opu/odata4/sap/sui_flp_aps_ui_usernews/srvd_a2x/sap/sui_flp_aps_ui_usernews/0001/NewsGroup";
export const DEFAULT_NEWS_URL = DEFAULT_NEWS_BASE_URL + "?$expand=_group_to_image,_group_to_article&$format=json";
export enum SETTINGS_PANELS_KEYS {
	LAYOUT = "LAYOUT",
	NEWS = "NEWS",
	PAGES = "PAGES",
	INSIGHTS_TILES = "INSIGHTS_TILES",
	INSIGHTS_CARDS = "INSIGHTS_CARDS",
	ADVANCED = "ADVANCED"
}
export enum KEYUSER_SETTINGS_PANELS_KEYS {
	LAYOUT = "KEYUSER_LAYOUT",
	NEWS_PAGES = "KEYUSER_NEWS_PAGES",
	NEWS = "KEYUSER_NEWS",
	PAGES = "KEYUSER_PAGES"
}
export enum CONTENT_ADDITION_PANEL_TYPES {
	AI_APP_FINDER = "AI_APP_FINDER",
	AI_INSIGHTS_CARDS = "AI_INSIGHTS_CARDS"
}

export enum FESR_IDS {
	ADD_AI_CARD = "INS:AddAICard",
	CANCEL_CONTENT_DIALOG = "myh:content:cancel",
	ADD_AI_APP = "myh:apps:add"
}

export const TABLE_TYPES = {
	GRID: "GridTable",
	TREE: "TreeTable",
	ANALYTICAL: "AnalyticalTable",
	RESPONSIVE: "ResponsiveTable",
	STANDARD_LIST: "StandardList",
	OBJECT_LIST: "ObjectList"
};
export const COLUMN_LENGTH = 3;

export const AI_APP_FINDER_BASE_URL = "/sap/opu/odata4/sap/aiu_ui_prompt/srvd/sap/aiu_ui_prompt/0001/";
export const AI_APP_FINDER_API = AI_APP_FINDER_BASE_URL + "SmartAppFinder/SAP__self.ExecuteAppFinderFromUserInput";

export const CUSTOM_SPACEID = "Z_TRIAL_TRIAL_CENTER";
export const PREFERED_CARDS = [
	"user.F2933.cards.docStatusCard",
	"user.i2d.qm.qltytechnician.ovps1.cards.i2d.qm.qltytechnician.ovps1_card01",
	"user.F3242.cards.card06_MyBiggestDebtors.tab_1",
	"user.F2917.cards.card15_PayableAmount",
	"user.F2601.cards.card04_ProfitMargin",
	"user.F2601.cards.card00_IncomingSales.tab_1",
	"user.F2933.cards.card01"
];

export const DEFAULT_NEWS_PLACEHOLDER = {
	"@odata.context": "",
	"@odata.metadataEtag": "",
	value: [
		{
			group_id: "placeholderNews",
			mandatory: "X",
			mandatory_text: "TRUE",
			_group_to_article: [
				{
					group_id: "placeholderNews"
				}
			]
		}
	]
};
