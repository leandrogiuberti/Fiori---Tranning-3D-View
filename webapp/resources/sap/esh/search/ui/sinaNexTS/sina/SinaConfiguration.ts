/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Sina } from "./Sina";
import * as sinaLog from "../core/Log";
import { ChartResultSetFormatter, Formatter } from "./formatters/Formatter";
import { AjaxClient as Client } from "../core/AjaxClient";
import { FederationType } from "../providers/multi/FederationType";
import { FacetMode } from "../providers/multi/FacetMode";
import { ComplexCondition } from "./ComplexCondition";
import { NavigationTracker } from "./NavigationTarget";
import { DataSourceConfiguration } from "./DataSourceConfiguration";
import type UI5NumberFormat from "sap/ui/core/format/NumberFormat";
import type UI5DateFormat from "sap/ui/core/format/DateFormat";
import { RequestFormatter, ResponseFormatter } from "../core/ajax";

export interface SinaConfiguration {
    getTextFromResourceBundle?: (url: string, text: string) => Promise<string>; // needed for hana odata annotation "ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY"
    getText?: (key: string, args?: Array<string>) => string;
    contentProviderId?: string; // only ABAPOData
    federationType?: FederationType;
    facetMode?: FacetMode;
    FF_hierarchyBreadcrumbs?: boolean;
    url: string;
    // type: string;
    provider: AvailableProviders;
    getLanguage?: () => string;
    // single language code, used for http requests, header: 'Accept-Language'
    //    - example: 'en-US'.
    //      Passing passing multiple language codes or weights (property 'q') will result in undetermined behavior
    //       -> see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
    label?: string;
    subProviders?: Array<SinaConfiguration>;
    sina?: Sina;
    initAsync?: (sina: Sina) => Promise<void>;
    searchResultSetFormatters?: Formatter[];
    suggestionResultSetFormatters?: Formatter[];
    chartResultSetFormatters?: ChartResultSetFormatter[];
    metadataFormatters?: Formatter[];
    logTarget?: {
        error(messageOrError: string | Error): void;
        warn(message: string): void;
        info(message: string): void;
        debug(message: string): void;
    };
    logLevel?: sinaLog.Severity;
    NumberFormat?: typeof UI5NumberFormat;
    DateFormat?: typeof UI5DateFormat;
    ajaxClient?: Client;
    ajaxRequestFormatters?: Array<RequestFormatter>;
    ajaxResponseFormatters?: Array<ResponseFormatter>;
    metaDataSuffix?: string; // ToDo? -> HANA oData only
    querySuffix?: ComplexCondition; // ToDo: Remove as soon as all stakeholders have switched to 'dataSourceConfigurations'
    dataSourceConfigurations?: Array<DataSourceConfiguration>;
    odataVersion?: string; // ToDo? -> HANA oData only
    folderMode?: boolean;
    folderModeForInitialSearch?: boolean;
    enableQueryLanguage?: boolean;
    // A search query parameter only for hana_oData provider to provide breadcrumbs path for each result item. It's not a hana feature but a service feature and only works with datasources with a static hierarchy.
    // This parameter has performance impact. Hence its default value is set as false/undefined.
    useValueHierarchy?: boolean;
    // The same semantic and value (by mixinSearchConfigurationIntoSinaConfiguration in SearchModel) like the parameter of the same name in search configuration.
    // E.g. the preparation of targetNavigation in Sina layer needs it
    updateUrl?: boolean;
    pageSize?: number;
    searchInAreaOverwriteMode?: boolean;
    navigationTrackers?: NavigationTracker[];
    limitAjaxRequests?: boolean; // prevents too many ajax requests in a short time
}

export async function _normalizeConfiguration(
    configuration: SinaConfiguration | string
): Promise<SinaConfiguration> {
    // check whether configuration is a string with a javascript module name
    if (typeof configuration === "string") {
        configuration = configuration.trim();

        // configuration is a string with a url -> load configuration dynamically via require
        if (
            configuration.indexOf("/") >= 0 &&
            configuration.indexOf("Provider") < 0 &&
            configuration[0] !== "{"
        ) {
            configuration = await import(configuration);
            return await _normalizeConfiguration(configuration);
        }

        // configuration is a string with the provider name -> assemble json
        if (configuration[0] !== "{") {
            configuration = '{ "provider" : "' + configuration + '"}';
        }

        // parse json
        configuration = JSON.parse(configuration) as SinaConfiguration;
    }

    return configuration;
}

export enum AvailableProviders {
    ABAP_ODATA = "abap_odata",
    HANA_ODATA = "hana_odata",
    INAV2 = "inav2",
    MULTI = "multi",
    SAMPLE = "sample",
    SAMPLE2 = "sample2",
    MOCK_SUGGESTIONTYPES = "mock_suggestiontypes",
    MOCK_NLQRESULTS = "mock_nlqresults",
    MOCK_DELETEANDREORDER = "mock_deleteandreorder",
    DUMMY = "dummy",
}
