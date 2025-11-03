declare module "sap/esh/search/ui/SearchConfiguration" {
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import SearchConfigurationSettings from "./SearchConfigurationSettings";
    export default class SearchConfiguration extends SearchConfigurationSettings {
        private log;
        private dataSourceConfigurations;
        private dataSourceConfigurations_Regexes;
        private defaultDataSourceConfig;
        private documentDataSourceConfiguration;
        _dataSourceLoadingProms: Record<string, any>;
        _loadCustomModulesProm: Promise<any>;
        /**
         * @this SearchConfiguration
         * @constructor
         */
        constructor(configuration?: Partial<SearchConfigurationSettings> | SearchConfiguration);
        private checkForDeprecatedParameters;
        private readUshellConfiguration;
        private static extendSearchConfiguration;
        readOutdatedUshellConfiguration(): void;
        initDataSourceConfig(): void;
        getParameterType(parameterName: any): string;
        parseBoolean(value: string): boolean;
        parseEsDevConfig(value: string): void;
        updateConfigFromUrlParameters(): void;
        parseUrlParameters(): {
            [name: string]: string;
        };
        loadCustomModulesAsync(): Promise<any>;
        loadCustomModulesForDataSourcesAsync(dataSources: any, dataSourcesHints: any): Promise<any>;
        loadCustomModulesForDataSourceAsync(dataSource: DataSource, dataSourceHints?: {}): Promise<any>;
        loadCustomModulesForDataSourceIdAsync(dataSourceId?: string, dataSourceHints?: Record<string, any>): Promise<any>;
        _doLoadCustomModulesAsync(dataSourceId: string, dataSourceConfiguration: any, moduleAttrName: string, controlAttrName: string, defaultModuleName?: string, defaultControl?: any): Promise<void>;
        getDataSourceConfig(dataSource: DataSource): any;
        _prepareDataSourceConfigurationForDataSource(dataSourceId: string, dataSourcesHints: any): any;
        isWebCompSearchFieldGroupEnabled(): boolean;
    }
}
//# sourceMappingURL=SearchConfiguration.d.ts.map