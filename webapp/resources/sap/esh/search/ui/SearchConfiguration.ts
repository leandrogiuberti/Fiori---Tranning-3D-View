/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchResultListSelectionHandler from "./controls/resultview/SearchResultListSelectionHandler";
import { DataSource } from "./sinaNexTS/sina/DataSource";
import SearchResultListItemNote from "./controls/resultview/SearchResultListItemNote";
import SearchConfigurationSettings, {
    defaultSearchConfigurationSettings,
    deprecatedParameters,
    urlForbiddenParameters,
} from "./SearchConfigurationSettings";
import Log from "sap/base/Log";
import assert from "sap/base/assert";
import { DataSourceConfiguration } from "./SearchConfigurationTypes";
import { SelectionMode } from "./SelectionMode";

export default class SearchConfiguration extends SearchConfigurationSettings {
    private log = Log.getLogger("sap.esh.search.ui.SearchConfiguration");
    private dataSourceConfigurations: Record<string, DataSourceConfiguration>;
    private dataSourceConfigurations_Regexes: Array<DataSourceConfiguration> = [];
    private defaultDataSourceConfig: DataSourceConfiguration = {
        searchResultListItem: undefined,
        searchResultListItemControl: undefined,

        searchResultListItemContent: undefined,
        searchResultListItemContentControl: undefined,

        searchResultListSelectionHandler: SearchResultListSelectionHandler["getMetadata"]().getName(), // ToDo
        searchResultListSelectionHandlerControl: SearchResultListSelectionHandler,
    };
    private documentDataSourceConfiguration: DataSourceConfiguration;

    _dataSourceLoadingProms: Record<string, any>;
    _loadCustomModulesProm: Promise<any>;

    /**
     * @this SearchConfiguration
     * @constructor
     */
    constructor(configuration?: Partial<SearchConfigurationSettings> | SearchConfiguration) {
        super();
        SearchConfiguration.extendSearchConfiguration(this, configuration);
        this.aiNlqExplainBar ??= false;
        if (this.isUshell) {
            this.aiNlq = true;
            this.enableCharts = true;
            this.reloadOnUrlChange = false;
            this.readUshellConfiguration();
            this.readOutdatedUshellConfiguration();
        }
        this.updateConfigFromUrlParameters();
        this.initDataSourceConfig();
        this.checkForDeprecatedParameters(configuration);
    }

    private checkForDeprecatedParameters(
        configuration?: Partial<SearchConfigurationSettings> | SearchConfiguration
    ): void {
        for (const parameter in deprecatedParameters) {
            if (configuration && Object.prototype.hasOwnProperty.call(configuration, parameter)) {
                // if the provided value is the same as the default, skip the assertion
                if (configuration[parameter] === defaultSearchConfigurationSettings[parameter]) {
                    continue;
                }
                // stakeholder explicitly set this property
                let msg = `You are using a deprecated configuration property for SearchCompositeControl which will be removed in a future release: '${parameter}'.`;
                const replacement = deprecatedParameters[parameter];
                if (replacement.replacedBy) {
                    // do auto-assignment old => new
                    if (replacement.replacedBy === "enableMultiSelectionResultItems") {
                        if (this[parameter] === true) {
                            this.resultviewSelectionMode = SelectionMode.MultipleItems;
                        } else {
                            this.resultviewSelectionMode = SelectionMode.None;
                        }
                    } else {
                        this[replacement.replacedBy] = this[parameter];
                    }
                    msg += `\nPlease use '${replacement.replacedBy}' instead.`;
                }
                if (replacement.replacementInfo) {
                    msg += `\n${replacement.replacementInfo}`;
                }
                assert(false, msg);
            }
        }
    }

    private readUshellConfiguration(): void {
        // read global config
        try {
            const config = window["sap-ushell-config"].renderers.fiori2.componentData.config.esearch;
            SearchConfiguration.extendSearchConfiguration(this, config);
        } catch (e) {
            this.log.debug("Could not read ushell configuration", e);
        }
    }

    private static extendSearchConfiguration<T extends object>(target: T, ...sources: any[]): T {
        // we calso take over properties having value null/undefined.
        //   - it is currently possible to wipe out properties like 'performanceLogger' (ELISA default)
        //   - we might want to use more sophisticated merging logic in the future
        return Object.assign(target, ...sources);
    }

    readOutdatedUshellConfiguration(): void {
        try {
            // get config
            const config = window["sap-ushell-config"].renderers.fiori2.componentData.config;

            // due to historical reasons the config parameter searchBusinessObjects is not in esearch but in parent object
            // copy this parameter to config object
            if (typeof config.searchBusinessObjects !== "undefined") {
                if (config.searchBusinessObjects === "hidden" || config.searchBusinessObjects === false) {
                    this.searchBusinessObjects = false;
                } else {
                    this.searchBusinessObjects = true;
                }
            }
        } catch (e) {
            this.log.debug("Could not read ushell configuration", e);
        }
    }

    initDataSourceConfig(): void {
        // Prepare caching map for custom datasource configurations
        this.dataSourceConfigurations = {};
        this.dataSourceConfigurations_Regexes = [];

        if (this.dataSources) {
            for (let i = 0; i < this.dataSources.length; i++) {
                const dataSourceConfig = this.dataSources[i];
                if (dataSourceConfig.id) {
                    this.dataSourceConfigurations[dataSourceConfig.id] = dataSourceConfig;
                } else if (dataSourceConfig.regex) {
                    const flags = dataSourceConfig.regexFlags || undefined;
                    const regexObject = new RegExp(dataSourceConfig.regex, flags);
                    if (regexObject) {
                        dataSourceConfig.regexObject = regexObject;
                        this.dataSourceConfigurations_Regexes.push(dataSourceConfig);
                    }
                } else {
                    const message =
                        "Following datasource configuration does neither include a valid id nor a regular expression, therefore it is ignored:\n" +
                        JSON.stringify(dataSourceConfig);
                    this.log.warning(message);
                }
            }
        }
        this.dataSources = undefined;

        // Special logic for Document Result List Item
        this.documentDataSourceConfiguration = {
            searchResultListItem: "sap.esh.search.ui.controls.SearchResultListItemDocument",
        };

        // Special logic for Note Result List Item
        const dataSourceConfiguration: DataSourceConfiguration =
            this.dataSourceConfigurations.noteprocessorurl || {};
        this.dataSourceConfigurations.noteprocessorurl = dataSourceConfiguration;

        this.dataSourceConfigurations.noteprocessorurl.searchResultListItemControl =
            this.dataSourceConfigurations.noteprocessorurl.searchResultListItemControl ||
            new SearchResultListItemNote();
        this.dataSourceConfigurations.noteprocessorurl.searchResultListSelectionHandler =
            this.dataSourceConfigurations.noteprocessorurl.searchResultListSelectionHandler ||
            "sap.esh.search.ui.controls.resultview.SearchResultListSelectionHandlerNote";
    }

    getParameterType(parameterName): string {
        if (parameterName in deprecatedParameters) {
            if (deprecatedParameters[parameterName]) {
                // if there a replacement use type from replacement
                parameterName = deprecatedParameters[parameterName].replacedBy;
            } else {
                return "string"; // just return something so that following logic for printing outdated message works.
            }
        }

        // eslint-disable-next-line no-prototype-builtins
        if (!defaultSearchConfigurationSettings.hasOwnProperty(parameterName)) {
            return "";
        }
        return typeof defaultSearchConfigurationSettings[parameterName];
    }

    parseBoolean(value: string): boolean {
        if (value.toLowerCase() === "true") {
            return true;
        }
        return false;
    }

    parseEsDevConfig(value: string) {
        const config = JSON.parse(value);
        for (const parameterName of urlForbiddenParameters) {
            delete config[parameterName];
        }
        SearchConfiguration.extendSearchConfiguration(this, config);
    }

    updateConfigFromUrlParameters(): void {
        const urlParameters = this.parseUrlParameters();
        for (const parameterName in urlParameters) {
            const parameterValue = urlParameters[parameterName];

            // ignore forbidden parameters
            if (urlForbiddenParameters.includes(parameterName)) {
                continue;
            }

            // ignore sina url parameters (these parameters are handled by sina itself, see sinaFactory)
            if (parameterName.startsWith("sina")) {
                continue;
            }

            // special handling for parameter demoMode
            if (parameterName === "demoMode") {
                this.searchBusinessObjects = true;
                continue;
            }

            // special handling for parameter resultViewTypes
            if (parameterName === "resultViewTypes") {
                let resultViewTypes = parameterValue.split(","); // convert to array
                resultViewTypes = resultViewTypes.filter((resultViewType) => resultViewType.length > 0); // remove empty element
                this.resultViewTypes = resultViewTypes;
                continue;
            }

            // special handling for parameter esDevConfig
            if (parameterName === "esDevConfig") {
                this.parseEsDevConfig(parameterValue);
                continue;
            }

            // default parameter handling
            const parameterType = this.getParameterType(parameterName);
            switch (parameterType) {
                case "string":
                    this[parameterName] = parameterValue;
                    break;
                case "number":
                    this[parameterName] = parseInt(parameterValue);
                    break;
                case "boolean":
                    this[parameterName] = this.parseBoolean(parameterValue);
                    break;
                default:
                // ignore parameters not defined in SearchConfigurationSettings
            }
        }
    }

    parseUrlParameters(): { [name: string]: string } {
        if (!URLSearchParams) {
            return {};
        }
        const urlSearchParams = new URLSearchParams(window.location.search);
        return Object.fromEntries(urlSearchParams.entries());
    }

    // use this as an early initialization routine
    loadCustomModulesAsync(): Promise<any> {
        if (this._loadCustomModulesProm) {
            return this._loadCustomModulesProm;
        }

        let dataSourceConfigurationProm;
        const dataSourceConfigurationsProms = [];

        for (const dataSourceId in this.dataSourceConfigurations) {
            dataSourceConfigurationProm = this.loadCustomModulesForDataSourceIdAsync(dataSourceId);
            dataSourceConfigurationsProms.push(dataSourceConfigurationProm);
        }

        this._loadCustomModulesProm = Promise.all(dataSourceConfigurationsProms);
        return this._loadCustomModulesProm;
    }

    async loadCustomModulesForDataSourcesAsync(dataSources, dataSourcesHints): Promise<any> {
        const dataSourcesLoadingProms = [];
        for (let i = 0; i < dataSources.length; i++) {
            const dataSourceHints =
                (Array.isArray(dataSourcesHints) && dataSourcesHints.length > i && dataSourcesHints[i]) || {};
            const dataSourceLoadingProm = this.loadCustomModulesForDataSourceAsync(
                dataSources[i],
                dataSourceHints
            );
            dataSourcesLoadingProms.push(dataSourceLoadingProm);
        }
        return Promise.all(dataSourcesLoadingProms);
    }

    loadCustomModulesForDataSourceAsync(dataSource: DataSource, dataSourceHints = {}): Promise<any> {
        dataSourceHints = dataSourceHints || {};
        return this.loadCustomModulesForDataSourceIdAsync(dataSource.id, dataSourceHints);
    }

    loadCustomModulesForDataSourceIdAsync(
        dataSourceId?: string,
        dataSourceHints?: Record<string, any>
    ): Promise<any> {
        if (!dataSourceId) {
            return Promise.resolve();
        }

        this._dataSourceLoadingProms = this._dataSourceLoadingProms || {};

        let dataSourceLoadingProm = this._dataSourceLoadingProms[dataSourceId];
        if (!dataSourceLoadingProm) {
            const customControlAttrNames = [
                {
                    moduleAttrName: "searchResultListItem",
                    controlAttrName: "searchResultListItemControl",
                },
                {
                    moduleAttrName: "searchResultListItemContent",
                    controlAttrName: "searchResultListItemContentControl",
                },
                {
                    moduleAttrName: "searchResultListSelectionHandler",
                    controlAttrName: "searchResultListSelectionHandlerControl",
                },
            ];

            const dataSourceConfiguration = this._prepareDataSourceConfigurationForDataSource(
                dataSourceId,
                dataSourceHints
            );

            let customControlProm;
            const customControlProms = [];

            for (let i = 0; i < customControlAttrNames.length; i++) {
                customControlProm = this._doLoadCustomModulesAsync(
                    dataSourceId,
                    dataSourceConfiguration,
                    customControlAttrNames[i].moduleAttrName,
                    customControlAttrNames[i].controlAttrName
                );
                customControlProms.push(customControlProm);
            }

            dataSourceLoadingProm = Promise.all(customControlProms);
            dataSourceLoadingProm._resolvedOrFailed = false;
            dataSourceLoadingProm.then(function () {
                dataSourceLoadingProm._resolvedOrFailed = true;
            });
            this._dataSourceLoadingProms[dataSourceId] = dataSourceLoadingProm;
        }
        return dataSourceLoadingProm;
    }

    // Helper function to keep 'dataSourceConfiguration' instance unchanged within
    // its scope while the main function loops over all instances
    _doLoadCustomModulesAsync(
        dataSourceId: string,
        dataSourceConfiguration,
        moduleAttrName: string,
        controlAttrName: string,
        defaultModuleName?: string,
        defaultControl?
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        return new Promise(function (resolve) {
            if (
                dataSourceConfiguration[moduleAttrName] &&
                (!dataSourceConfiguration[controlAttrName] ||
                    dataSourceConfiguration[controlAttrName] == that.defaultDataSourceConfig[controlAttrName])
            ) {
                try {
                    sap.ui.require(
                        [dataSourceConfiguration[moduleAttrName].replace(/[.]/g, "/")],
                        function (customControl) {
                            dataSourceConfiguration[controlAttrName] = customControl;
                            resolve();
                        }
                    );
                } catch (e) {
                    let message =
                        "Could not load custom module '" +
                        dataSourceConfiguration[moduleAttrName] +
                        "' for data source with id '" +
                        dataSourceId +
                        "'. ";
                    message += "Falling back to default data source configuration.";
                    that.log.warning(message, e);
                    dataSourceConfiguration[moduleAttrName] =
                        defaultModuleName || that.defaultDataSourceConfig[moduleAttrName];
                    dataSourceConfiguration[controlAttrName] =
                        defaultControl || that.defaultDataSourceConfig[controlAttrName];
                    resolve();
                }
            } else {
                if (!dataSourceConfiguration[controlAttrName]) {
                    dataSourceConfiguration[moduleAttrName] =
                        defaultModuleName || that.defaultDataSourceConfig[moduleAttrName];
                    dataSourceConfiguration[controlAttrName] =
                        defaultControl || that.defaultDataSourceConfig[controlAttrName];
                }
                resolve();
            }
        });
    }

    getDataSourceConfig(dataSource: DataSource): any {
        if (
            this._dataSourceLoadingProms &&
            this._dataSourceLoadingProms[dataSource.id] &&
            !this._dataSourceLoadingProms[dataSource.id]._resolvedOrFailed
        ) {
            // Return the default data source if the custom modules
            // for this particular data source aren't loaded yet.
            return this.defaultDataSourceConfig;
        }

        let config = this.dataSourceConfigurations[dataSource.id];
        if (!config) {
            config = this.defaultDataSourceConfig;
            this.dataSourceConfigurations[dataSource.id] = config;
        }

        return config;
    }

    _prepareDataSourceConfigurationForDataSource(dataSourceId: string, dataSourcesHints): any {
        let dataSourceConfiguration: any = {};
        if (this.dataSourceConfigurations[dataSourceId]) {
            dataSourceConfiguration = this.dataSourceConfigurations[dataSourceId];
        } else {
            for (let i = 0; i < this.dataSourceConfigurations_Regexes.length; i++) {
                if (this.dataSourceConfigurations_Regexes[i].regexObject.test(dataSourceId)) {
                    dataSourceConfiguration = this.dataSourceConfigurations_Regexes[i];
                    break;
                }
            }
        }

        // Use SearchResultListItemDocument control for document-like objects.
        // Can be overriden by another control in ushell configuration.
        if (dataSourcesHints && dataSourcesHints.isDocumentConnector) {
            if (!dataSourceConfiguration.searchResultListItem) {
                dataSourceConfiguration.searchResultListItem =
                    this.documentDataSourceConfiguration.searchResultListItem;
            } else {
                const message =
                    "Will attempt to load '" +
                    dataSourceConfiguration.searchResultListItem +
                    "' instead of '" +
                    this.documentDataSourceConfiguration.searchResultListItem +
                    "' for data source '" +
                    dataSourceId +
                    "'";
                this.log.warning(message);
            }
        }

        this.dataSourceConfigurations[dataSourceId] = dataSourceConfiguration;
        return dataSourceConfiguration;
    }

    isWebCompSearchFieldGroupEnabled(): boolean {
        // check feature flag
        if (!this.FF_useWebComponentsSearchInput) {
            return false;
        }
        // in case of ushell, check if the web component is enabled in ushell header
        if (this.isUshell) {
            if (!document.querySelector("#shell-header .sapUshellShellBar")) {
                return false;
            }
        }
        return true;
    }
}
