/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ChartQuery } from "../sina/ChartQuery";
import { SearchQuery } from "../sina/SearchQuery";
import { SinaObject } from "../sina/SinaObject";
import { SuggestionQuery } from "../sina/SuggestionQuery";
import { SuggestionResultSet } from "../sina/SuggestionResultSet";
import { Configuration } from "../sina/Configuration";
import { SearchResultSet } from "../sina/SearchResultSet";
import { ChartResultSet } from "../sina/ChartResultSet";
import { Capabilities } from "../sina/Capabilities";
import { Sina } from "../sina/Sina";
import { SinaConfiguration } from "../sina/SinaConfiguration";
import { HierarchyQuery } from "../sina/HierarchyQuery";
import { HierarchyResultSet } from "../sina/HierarchyResultSet";
import { ServerInfo as ABAPServerInfo } from "./abap_odata/Provider";
import { ServerInfo as HANAServerInfo } from "./hana_odata/Provider";
import { ServerInfo as INAV2ServerInfo } from "./inav2/Provider";

export interface AbstractProviderConfiguration extends SinaConfiguration {
    sina: Sina;
}

export abstract class AbstractProvider extends SinaObject {
    abstract id: string;
    label: string;
    serverInfo?: HANAServerInfo | ABAPServerInfo | INAV2ServerInfo;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchEngine?: any;

    abstract initAsync(properties: AbstractProviderConfiguration): Promise<{
        capabilities: Capabilities;
    } | void>;
    // abstract supports(service: any, capability: any): boolean;
    // abstract loadServerInfo(): Promise<{}>;
    // abstract loadBusinessObjectDataSources(): Promise<any>;
    // abstract assembleOrderBy(query: Query): Array<any>;
    // abstract translateOrder(order: string): string;
    abstract executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
    abstract executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
    abstract executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
    abstract executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
    // abstract getFilterValueFromConditionTree(dimension: any, conditionTree: any);
    // abstract buildQueryUrl(queryPrefix: string, queryPostfix: string): string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logUserEvent(userEvent: unknown): void {}
    getDebugInfo(): string {
        return "ESH Search API Provider: " + this.id;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isQueryPropertySupported(path: string): boolean {
        // currently only implemented in abap odata provider
        return false;
    }
    async resetPersonalizedSearchDataAsync(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        config: Configuration
    ): Promise<unknown> {
        // currently only implemented in abap odata and inav2 provider
        return Promise.resolve();
    }
    // async saveConfigurationAsync(config: Configuration): Promise<any> {
    //     // currently only implemented in abap odata and inav2 provider
    //     return;
    // }
}
