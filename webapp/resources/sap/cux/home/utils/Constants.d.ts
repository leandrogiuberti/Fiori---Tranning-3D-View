declare module "sap/cux/home/utils/Constants" {
    const fnFetchLegendColor: (sLegendName: string) => {
        key: string;
        value: import("sap/ui/core/theming/Parameters").Value;
        assigned: boolean;
    };
    const BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";
    const INSIGHTS_READ_SRVC_URL: string;
    const MYHOME_PAGE_ID: string;
    const MYAPPS_SECTION_ID: string;
    const FALLBACK_ICON: string;
    const DEFAULT_APP_ICON: string;
    const MYINSIGHT_SECTION_ID: string;
    const MYHOME_SPACE_ID: string;
    const DEFAULT_BG_COLOR: () => {
        key: string;
        value: import("sap/ui/core/theming/Parameters").Value;
        assigned: boolean;
    };
    const PAGE_SELECTION_LIMIT = 8;
    const LEGEND_COLORS: () => {
        key: string;
        value: import("sap/ui/core/theming/Parameters").Value;
        assigned: boolean;
    }[];
    const END_USER_COLORS: () => {
        key: string;
        value: import("sap/ui/core/theming/Parameters").Value;
        assigned: boolean;
    }[];
    const AppTypes: {
        FAVORITE: string;
        RECENT: string;
        FREQUENT: string;
    };
    const PLACEHOLDER_ITEMS_COUNT = 5;
    const RECOMMENDED_CARD_LIMIT = 4;
    const RECOMMENDATION_SRVC_URL: string;
    enum FEATURE_TOGGLES {
        AI_GENERATED_CARD = "AIU_SMART_PERSONALIZATION",
        AI_SMART_APPFINDER = "AIU_SMART_APPFINDER"
    }
    const FEATURE_TOGGLE_SRVC_URL: string;
    const REPO_BASE_URL: string;
    const DEFAULT_NEWS_BASE_URL = "/sap/opu/odata4/sap/sui_flp_aps_ui_usernews/srvd_a2x/sap/sui_flp_aps_ui_usernews/0001/NewsGroup";
    const DEFAULT_NEWS_URL: string;
    enum SETTINGS_PANELS_KEYS {
        LAYOUT = "LAYOUT",
        NEWS = "NEWS",
        PAGES = "PAGES",
        INSIGHTS_TILES = "INSIGHTS_TILES",
        INSIGHTS_CARDS = "INSIGHTS_CARDS",
        ADVANCED = "ADVANCED"
    }
    enum KEYUSER_SETTINGS_PANELS_KEYS {
        LAYOUT = "KEYUSER_LAYOUT",
        NEWS_PAGES = "KEYUSER_NEWS_PAGES",
        NEWS = "KEYUSER_NEWS",
        PAGES = "KEYUSER_PAGES"
    }
    enum CONTENT_ADDITION_PANEL_TYPES {
        AI_APP_FINDER = "AI_APP_FINDER",
        AI_INSIGHTS_CARDS = "AI_INSIGHTS_CARDS"
    }
    enum FESR_IDS {
        ADD_AI_CARD = "INS:AddAICard",
        CANCEL_CONTENT_DIALOG = "myh:content:cancel",
        ADD_AI_APP = "myh:apps:add"
    }
    const TABLE_TYPES: {
        GRID: string;
        TREE: string;
        ANALYTICAL: string;
        RESPONSIVE: string;
        STANDARD_LIST: string;
        OBJECT_LIST: string;
    };
    const COLUMN_LENGTH = 3;
    const AI_APP_FINDER_BASE_URL = "/sap/opu/odata4/sap/aiu_ui_prompt/srvd/sap/aiu_ui_prompt/0001/";
    const AI_APP_FINDER_API: string;
    const CUSTOM_SPACEID = "Z_TRIAL_TRIAL_CENTER";
    const PREFERED_CARDS: string[];
    const DEFAULT_NEWS_PLACEHOLDER: {
        "@odata.context": string;
        "@odata.metadataEtag": string;
        value: {
            group_id: string;
            mandatory: string;
            mandatory_text: string;
            _group_to_article: {
                group_id: string;
            }[];
        }[];
    };
}
//# sourceMappingURL=Constants.d.ts.map