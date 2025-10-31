declare module "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import * as sinaLog from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { ChartResultSetFormatter, Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { FederationType } from "sap/esh/search/ui/sinaNexTS/providers/multi/FederationType";
    import { FacetMode } from "sap/esh/search/ui/sinaNexTS/providers/multi/FacetMode";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { NavigationTracker } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { DataSourceConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceConfiguration";
    import type UI5NumberFormat from "sap/ui/core/format/NumberFormat";
    import type UI5DateFormat from "sap/ui/core/format/DateFormat";
    import { RequestFormatter, ResponseFormatter } from "sap/esh/search/ui/sinaNexTS/core/ajax";
    interface SinaConfiguration {
        getTextFromResourceBundle?: (url: string, text: string) => Promise<string>;
        getText?: (key: string, args?: Array<string>) => string;
        contentProviderId?: string;
        federationType?: FederationType;
        facetMode?: FacetMode;
        FF_hierarchyBreadcrumbs?: boolean;
        url: string;
        provider: AvailableProviders;
        getLanguage?: () => string;
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
        metaDataSuffix?: string;
        querySuffix?: ComplexCondition;
        dataSourceConfigurations?: Array<DataSourceConfiguration>;
        odataVersion?: string;
        folderMode?: boolean;
        folderModeForInitialSearch?: boolean;
        enableQueryLanguage?: boolean;
        useValueHierarchy?: boolean;
        updateUrl?: boolean;
        pageSize?: number;
        searchInAreaOverwriteMode?: boolean;
        navigationTrackers?: NavigationTracker[];
        limitAjaxRequests?: boolean;
    }
    function _normalizeConfiguration(configuration: SinaConfiguration | string): Promise<SinaConfiguration>;
    enum AvailableProviders {
        ABAP_ODATA = "abap_odata",
        HANA_ODATA = "hana_odata",
        INAV2 = "inav2",
        MULTI = "multi",
        SAMPLE = "sample",
        SAMPLE2 = "sample2",
        MOCK_SUGGESTIONTYPES = "mock_suggestiontypes",
        MOCK_NLQRESULTS = "mock_nlqresults",
        MOCK_DELETEANDREORDER = "mock_deleteandreorder",
        DUMMY = "dummy"
    }
}
//# sourceMappingURL=SinaConfiguration.d.ts.map