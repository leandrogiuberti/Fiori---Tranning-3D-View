declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyNodePathParser" {
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { HANAOdataParentHierarchies } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    class HierarchyNodePathParser {
        sina: Sina;
        constructor(sina: Sina);
        parse(response: Array<HANAOdataParentHierarchies>, query: SearchQuery | SuggestionQuery): Array<HierarchyNodePath>;
    }
}
//# sourceMappingURL=HierarchyNodePathParser.d.ts.map