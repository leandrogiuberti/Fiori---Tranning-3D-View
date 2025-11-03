declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ajaxTemplates" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    function isSearchRequest(obj: unknown): obj is typeof searchRequest;
    const searchRequest: {
        d: {
            Filter: {};
            Id: string;
            QueryOptions: {
                SearchTerms: string;
                Top: number;
                Skip: number;
                SearchType: string;
                ClientSessionID: string;
                ClientCallTimestamp: string;
                ClientServiceName: string;
                ClientLastExecutionID: string;
            };
            DataSources: any[];
            OrderBy: any[];
            ResultList: {
                SearchResults: {
                    HitAttributes: any[];
                    Attributes: any[];
                }[];
            };
            ExecutionDetails: any[];
            MaxFacetValues: number;
            Facets: {
                Values: any[];
            }[];
        };
    };
    function isChartRequest(obj: unknown): obj is typeof chartRequest;
    const chartRequest: {
        d: {
            Id: string;
            DataSources: any[];
            Filter: {};
            QueryOptions: {
                SearchTerms: string;
                Skip: number;
                SearchType: string;
                ClientSessionID: string;
                ClientCallTimestamp: string;
                ClientServiceName: string;
                ClientLastExecutionID: string;
            };
            FacetRequests: any[];
            MaxFacetValues: number;
            Facets: {
                Values: any[];
            }[];
            ExecutionDetails: any[];
        };
    };
    function isValueHelperRequest(obj: unknown): obj is typeof valueHelperRequest;
    const valueHelperRequest: {
        d: {
            Id: string;
            ValueHelpAttribute: string;
            ValueFilter: string;
            DataSources: any[];
            Filter: {};
            QueryOptions: {
                SearchTerms: string;
                Top: number;
                Skip: number;
                SearchType: string;
                ClientSessionID: string;
                ClientCallTimestamp: string;
                ClientServiceName: string;
                ClientLastExecutionID: string;
            };
            ValueHelp: any[];
        };
    };
    function isSuggestionRequest(obj: unknown): obj is typeof suggestionRequest;
    const suggestionRequest: {
        d: {
            Id: string;
            SuggestionInput: string;
            IncludeAttributeSuggestions: boolean;
            IncludeHistorySuggestions: boolean;
            IncludeDataSourceSuggestions: boolean;
            DetailLevel: number;
            QueryOptions: {
                Top: number;
                Skip: number;
                SearchType: string;
                SearchTerms: string;
                ClientSessionID: string;
                ClientCallTimestamp: string;
                ClientServiceName: string;
                ClientLastExecutionID: string;
            };
            Filter: {};
            DataSources: any[];
            Suggestions: any[];
            ExecutionDetails: any[];
        };
    };
    function isObjectSuggestionRequest(obj: unknown): obj is typeof objectSuggestionRequest;
    const objectSuggestionRequest: {
        d: {
            Id: string;
            IncludeAttributeSuggestions: boolean;
            QueryOptions: {
                SearchTerms: string;
                Top: number;
                Skip: number;
                ClientSessionID: string;
                ClientCallTimestamp: string;
                ClientServiceName: string;
                ClientLastExecutionID: string;
            };
            DataSources: {
                Id: string;
                Type: string;
            }[];
            ObjectSuggestions: {
                SearchResults: {
                    HitAttributes: any[];
                    Attributes: any[];
                }[];
            };
            Filter: {};
            ExecutionDetails: any[];
        };
    };
    function isNavigationEvent(obj: unknown): obj is InavigationEvent;
    interface InavigationEvent {
        SemanticObjectType: string;
        Intent: string;
        System?: string;
        Client?: string;
        Parameters: Array<{
            Name: string;
            Value: unknown;
        }>;
    }
}
//# sourceMappingURL=ajaxTemplates.d.ts.map