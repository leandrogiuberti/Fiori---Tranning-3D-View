declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/ItemParser" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { FioriIntentsResolver } from "sap/esh/search/ui/sinaNexTS/providers/tools/fiori/FioriIntentsResolver";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    class ItemParser {
        provider: Provider;
        sina: Sina;
        intentsResolver: FioriIntentsResolver;
        constructor(provider: Provider);
        parse(searchQuery: SearchQuery, data: any): Promise<{
            totalCount: any;
            items: any[];
        }>;
        parseTotalCount(data: any): any;
        parseItem(itemData: any): Promise<{
            defaultNavigationTarget?: import("sap/esh/search/ui/sinaNexTS/sina/NavigationTarget").NavigationTarget;
            navigationTargets?: Array<import("sap/esh/search/ui/sinaNexTS/sina/NavigationTarget").NavigationTarget>;
        } | {
            defaultNavigationTarget?: import("sap/esh/search/ui/sinaNexTS/sina/NavigationTarget").NavigationTarget;
            navigationTargets?: Array<import("sap/esh/search/ui/sinaNexTS/sina/NavigationTarget").NavigationTarget>;
        }[]>;
        parseWhyFound(dataSource: any, titleAttributes: any, detailAttributes: any, itemData: any): void;
        getResponseAttributeId(dataSource: any, requestAttributeId: any): any;
    }
}
//# sourceMappingURL=ItemParser.d.ts.map