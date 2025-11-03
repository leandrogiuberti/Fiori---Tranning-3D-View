declare module "sap/esh/search/ui/controls/searchfieldgroup/SearchSelect" {
    import Select, { $SelectSettings } from "sap/m/Select";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchSelect extends Select {
        constructor(sId?: string, settings?: $SelectSettings);
        setDisplayMode(mode: "icon" | "default"): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchSelect.d.ts.map