declare module "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SinaObject } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { Configuration } from "sap/esh/search/ui/sinaNexTS/sina/Configuration";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { Capabilities } from "sap/esh/search/ui/sinaNexTS/sina/Capabilities";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { ServerInfo as ABAPServerInfo } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider";
    import { ServerInfo as HANAServerInfo } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    import { ServerInfo as INAV2ServerInfo } from "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider";
    interface AbstractProviderConfiguration extends SinaConfiguration {
        sina: Sina;
    }
    abstract class AbstractProvider extends SinaObject {
        abstract id: string;
        label: string;
        serverInfo?: HANAServerInfo | ABAPServerInfo | INAV2ServerInfo;
        searchEngine?: any;
        abstract initAsync(properties: AbstractProviderConfiguration): Promise<{
            capabilities: Capabilities;
        } | void>;
        abstract executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        abstract executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        abstract executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        abstract executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        logUserEvent(userEvent: unknown): void;
        getDebugInfo(): string;
        isQueryPropertySupported(path: string): boolean;
        resetPersonalizedSearchDataAsync(config: Configuration): Promise<unknown>;
    }
}
//# sourceMappingURL=AbstractProvider.d.ts.map