/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/theming/Parameters"], function (Parameters) {
  "use strict";

  const fnFetchLegendColor = sLegendName => {
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
  const MYHOME_PAGE_ID = "SAP_BASIS_PG_UI_MYHOME";
  const MYAPPS_SECTION_ID = "3WO90XZ1DX1AS32M7ZM9NBXEF";
  const FALLBACK_ICON = "sap-icon://document";
  const DEFAULT_APP_ICON = "sap-icon://product";
  const MYINSIGHT_SECTION_ID = "AZHJGRIT78TG7Y65RF6EPFJ9U";
  const MYHOME_SPACE_ID = "SAP_BASIS_SP_UI_MYHOME";
  const DEFAULT_BG_COLOR = () => fnFetchLegendColor("sapLegendColor9");
  const PAGE_SELECTION_LIMIT = 8;
  const LEGEND_COLORS = () => ["sapLegendColor6", "sapLegendColor3", "sapLegendColor1", "sapLegendColor10", "sapLegendColor12", "sapLegendColor7", "sapLegendColor5", "sapLegendColor8", "sapLegendColor18", "sapLegendColor9"].map(fnFetchLegendColor);
  const END_USER_COLORS = () => ["sapLegendColor19", "sapLegendColor13", "sapLegendColor11", "sapLegendColor20", "sapLegendColor2", "sapLegendColor17", "sapLegendColor15", "sapLegendColor14", "sapLegendColor16", "sapLegendColor4"].map(fnFetchLegendColor);
  const AppTypes = {
    FAVORITE: "FAVORITE",
    RECENT: "RECENT",
    FREQUENT: "FREQUENT"
  };
  const PLACEHOLDER_ITEMS_COUNT = 5;
  const RECOMMENDED_CARD_LIMIT = 4;
  const RECOMMENDATION_SRVC_URL = INSIGHTS_READ_SRVC_URL + "RecommendedApps";
  var FEATURE_TOGGLES = /*#__PURE__*/function (FEATURE_TOGGLES) {
    FEATURE_TOGGLES["AI_GENERATED_CARD"] = "AIU_SMART_PERSONALIZATION";
    FEATURE_TOGGLES["AI_SMART_APPFINDER"] = "AIU_SMART_APPFINDER";
    return FEATURE_TOGGLES;
  }(FEATURE_TOGGLES || {});
  const FEATURE_TOGGLE_SRVC_URL = INSIGHTS_READ_SRVC_URL + "FeatureToggle";
  const REPO_BASE_URL = BASE_URL + "insights_cards_repo_srv/0001/";
  const DEFAULT_NEWS_BASE_URL = "/sap/opu/odata4/sap/sui_flp_aps_ui_usernews/srvd_a2x/sap/sui_flp_aps_ui_usernews/0001/NewsGroup";
  const DEFAULT_NEWS_URL = DEFAULT_NEWS_BASE_URL + "?$expand=_group_to_image,_group_to_article&$format=json";
  var SETTINGS_PANELS_KEYS = /*#__PURE__*/function (SETTINGS_PANELS_KEYS) {
    SETTINGS_PANELS_KEYS["LAYOUT"] = "LAYOUT";
    SETTINGS_PANELS_KEYS["NEWS"] = "NEWS";
    SETTINGS_PANELS_KEYS["PAGES"] = "PAGES";
    SETTINGS_PANELS_KEYS["INSIGHTS_TILES"] = "INSIGHTS_TILES";
    SETTINGS_PANELS_KEYS["INSIGHTS_CARDS"] = "INSIGHTS_CARDS";
    SETTINGS_PANELS_KEYS["ADVANCED"] = "ADVANCED";
    return SETTINGS_PANELS_KEYS;
  }(SETTINGS_PANELS_KEYS || {});
  var KEYUSER_SETTINGS_PANELS_KEYS = /*#__PURE__*/function (KEYUSER_SETTINGS_PANELS_KEYS) {
    KEYUSER_SETTINGS_PANELS_KEYS["LAYOUT"] = "KEYUSER_LAYOUT";
    KEYUSER_SETTINGS_PANELS_KEYS["NEWS_PAGES"] = "KEYUSER_NEWS_PAGES";
    KEYUSER_SETTINGS_PANELS_KEYS["NEWS"] = "KEYUSER_NEWS";
    KEYUSER_SETTINGS_PANELS_KEYS["PAGES"] = "KEYUSER_PAGES";
    return KEYUSER_SETTINGS_PANELS_KEYS;
  }(KEYUSER_SETTINGS_PANELS_KEYS || {});
  var CONTENT_ADDITION_PANEL_TYPES = /*#__PURE__*/function (CONTENT_ADDITION_PANEL_TYPES) {
    CONTENT_ADDITION_PANEL_TYPES["AI_APP_FINDER"] = "AI_APP_FINDER";
    CONTENT_ADDITION_PANEL_TYPES["AI_INSIGHTS_CARDS"] = "AI_INSIGHTS_CARDS";
    return CONTENT_ADDITION_PANEL_TYPES;
  }(CONTENT_ADDITION_PANEL_TYPES || {});
  var FESR_IDS = /*#__PURE__*/function (FESR_IDS) {
    FESR_IDS["ADD_AI_CARD"] = "INS:AddAICard";
    FESR_IDS["CANCEL_CONTENT_DIALOG"] = "myh:content:cancel";
    FESR_IDS["ADD_AI_APP"] = "myh:apps:add";
    return FESR_IDS;
  }(FESR_IDS || {});
  const TABLE_TYPES = {
    GRID: "GridTable",
    TREE: "TreeTable",
    ANALYTICAL: "AnalyticalTable",
    RESPONSIVE: "ResponsiveTable",
    STANDARD_LIST: "StandardList",
    OBJECT_LIST: "ObjectList"
  };
  const COLUMN_LENGTH = 3;
  const AI_APP_FINDER_BASE_URL = "/sap/opu/odata4/sap/aiu_ui_prompt/srvd/sap/aiu_ui_prompt/0001/";
  const AI_APP_FINDER_API = AI_APP_FINDER_BASE_URL + "SmartAppFinder/SAP__self.ExecuteAppFinderFromUserInput";
  const CUSTOM_SPACEID = "Z_TRIAL_TRIAL_CENTER";
  const PREFERED_CARDS = ["user.F2933.cards.docStatusCard", "user.i2d.qm.qltytechnician.ovps1.cards.i2d.qm.qltytechnician.ovps1_card01", "user.F3242.cards.card06_MyBiggestDebtors.tab_1", "user.F2917.cards.card15_PayableAmount", "user.F2601.cards.card04_ProfitMargin", "user.F2601.cards.card00_IncomingSales.tab_1", "user.F2933.cards.card01"];
  const DEFAULT_NEWS_PLACEHOLDER = {
    "@odata.context": "",
    "@odata.metadataEtag": "",
    value: [{
      group_id: "placeholderNews",
      mandatory: "X",
      mandatory_text: "TRUE",
      _group_to_article: [{
        group_id: "placeholderNews"
      }]
    }]
  };
  var __exports = {
    __esModule: true
  };
  __exports.fnFetchLegendColor = fnFetchLegendColor;
  __exports.MYHOME_PAGE_ID = MYHOME_PAGE_ID;
  __exports.MYAPPS_SECTION_ID = MYAPPS_SECTION_ID;
  __exports.FALLBACK_ICON = FALLBACK_ICON;
  __exports.DEFAULT_APP_ICON = DEFAULT_APP_ICON;
  __exports.MYINSIGHT_SECTION_ID = MYINSIGHT_SECTION_ID;
  __exports.MYHOME_SPACE_ID = MYHOME_SPACE_ID;
  __exports.DEFAULT_BG_COLOR = DEFAULT_BG_COLOR;
  __exports.PAGE_SELECTION_LIMIT = PAGE_SELECTION_LIMIT;
  __exports.LEGEND_COLORS = LEGEND_COLORS;
  __exports.END_USER_COLORS = END_USER_COLORS;
  __exports.AppTypes = AppTypes;
  __exports.PLACEHOLDER_ITEMS_COUNT = PLACEHOLDER_ITEMS_COUNT;
  __exports.RECOMMENDED_CARD_LIMIT = RECOMMENDED_CARD_LIMIT;
  __exports.RECOMMENDATION_SRVC_URL = RECOMMENDATION_SRVC_URL;
  __exports.FEATURE_TOGGLES = FEATURE_TOGGLES;
  __exports.FEATURE_TOGGLE_SRVC_URL = FEATURE_TOGGLE_SRVC_URL;
  __exports.REPO_BASE_URL = REPO_BASE_URL;
  __exports.DEFAULT_NEWS_BASE_URL = DEFAULT_NEWS_BASE_URL;
  __exports.DEFAULT_NEWS_URL = DEFAULT_NEWS_URL;
  __exports.SETTINGS_PANELS_KEYS = SETTINGS_PANELS_KEYS;
  __exports.KEYUSER_SETTINGS_PANELS_KEYS = KEYUSER_SETTINGS_PANELS_KEYS;
  __exports.CONTENT_ADDITION_PANEL_TYPES = CONTENT_ADDITION_PANEL_TYPES;
  __exports.FESR_IDS = FESR_IDS;
  __exports.TABLE_TYPES = TABLE_TYPES;
  __exports.COLUMN_LENGTH = COLUMN_LENGTH;
  __exports.AI_APP_FINDER_BASE_URL = AI_APP_FINDER_BASE_URL;
  __exports.AI_APP_FINDER_API = AI_APP_FINDER_API;
  __exports.CUSTOM_SPACEID = CUSTOM_SPACEID;
  __exports.PREFERED_CARDS = PREFERED_CARDS;
  __exports.DEFAULT_NEWS_PLACEHOLDER = DEFAULT_NEWS_PLACEHOLDER;
  return __exports;
});
//# sourceMappingURL=Constants-dbg.js.map
