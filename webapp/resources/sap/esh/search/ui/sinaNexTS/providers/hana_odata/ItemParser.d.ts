declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/ItemParser" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    import { SuvNavTargetResolver } from "sap/esh/search/ui/sinaNexTS/providers/tools/fiori/SuvNavTargetResolver";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { Log } from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { HierarchyNodePathParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyNodePathParser";
    import { HANAOdataSearchResponseResult } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    class ItemParser {
        provider: Provider;
        sina: Sina;
        suvNavTargetResolver: SuvNavTargetResolver;
        log: Log;
        hierarchyNodePathParser: HierarchyNodePathParser;
        constructor(provider: Provider);
        parse(searchQuery: SearchQuery, data: HANAOdataSearchResponseResult): Promise<Array<SearchResultSetItem>>;
        private parseItem;
        private preParseItem;
    }
}
//# sourceMappingURL=ItemParser.d.ts.map