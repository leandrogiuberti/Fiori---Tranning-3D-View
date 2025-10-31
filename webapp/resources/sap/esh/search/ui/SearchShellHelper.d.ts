declare module "sap/esh/search/ui/SearchShellHelper" {
    import SearchFieldGroup from "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldGroup";
    import Event from "sap/ui/base/Event";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchFieldStateManager from "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldStateManager";
    import { PeriodicRetry } from "sap/esh/search/ui/SearchUtil";
    import WebCompSearchFieldStateManager from "sap/esh/search/ui/controls/webcompsearchfieldgroup/WebCompSearchFieldStateManager";
    import type ShellBarSearch from "@ui5/webcomponents-fiori/dist/ShellBarSearch";
    export default abstract class SearchShellHelper {
        static isInitialized: boolean;
        static sSearchOverlayCSS: "sapUshellShellShowSearchOverlay";
        static oModel: SearchModel;
        static oShellHeader: any;
        static oSearchFieldGroup: SearchFieldGroup;
        static focusInputFieldTimeout: number | undefined;
        static isFocusHandlerActive: boolean;
        static searchFieldStateManager: SearchFieldStateManager | WebCompSearchFieldStateManager;
        static periodicRetryFocus: PeriodicRetry;
        constructor();
        static init(searchField?: ShellBarSearch): Promise<void>;
        static onSearchComponentLoaded(): void;
        static resetModel(): void;
        static onAfterNavigate(oEvent: any): void;
        static expandSearch(focusSearchField?: boolean): void;
        static collapseSearch(): void;
        private static createWebCompSearchFieldGroup;
        private static createSearchFieldGroup;
        static fnEscCallBack(oEvent: any): void;
        static sizeSearchFieldChanged(event: Event): void;
        static onShellSearchButtonPressed(): void;
        static handleClickSearchButton(): void;
    }
}
//# sourceMappingURL=SearchShellHelper.d.ts.map