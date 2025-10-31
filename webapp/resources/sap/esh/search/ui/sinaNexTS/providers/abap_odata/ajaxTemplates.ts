/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export function isSearchRequest(obj: unknown): obj is typeof searchRequest {
    if (typeof obj === "object") {
        const obj2: Record<string, unknown> = obj as Record<string, unknown>;
        if (typeof obj2.d === "object") {
            const obj3: {
                d: Record<string, unknown>;
            } = obj2 as {
                d: Record<string, unknown>;
            };
            if (typeof obj3.d.QueryOptions === "object") {
                const QueryOptions: Record<string, unknown> = obj3.d.QueryOptions as {
                    QueryOptions: Record<string, unknown>;
                };
                if (typeof QueryOptions.SearchType === "string" && QueryOptions.SearchType === "") {
                    return true;
                }
            }
        }
    }
    return false;
}

export const searchRequest = {
    d: {
        Filter: {},
        Id: "1",
        QueryOptions: {
            SearchTerms: "",
            Top: 10,
            Skip: 0,
            SearchType: "",
            ClientSessionID: "",
            ClientCallTimestamp: "", // "\/Date(1496917054000)\/"
            ClientServiceName: "",
            ClientLastExecutionID: "",
        },
        DataSources: [],
        OrderBy: [],
        ResultList: {
            SearchResults: [
                {
                    HitAttributes: [],
                    Attributes: [],
                },
            ],
        },
        ExecutionDetails: [],
        MaxFacetValues: 5,
        Facets: [
            {
                Values: [],
            },
        ],
    },
};

export function isChartRequest(obj: unknown): obj is typeof chartRequest {
    if (typeof obj === "object") {
        const obj2: Record<string, unknown> = obj as Record<string, unknown>;
        if (typeof obj2.d === "object") {
            const obj3: {
                d: Record<string, unknown>;
            } = obj2 as {
                d: Record<string, unknown>;
            };
            if (typeof obj3.d.QueryOptions === "object") {
                const obj4: {
                    d: {
                        QueryOptions: Record<string, unknown>;
                    };
                } = obj3 as {
                    d: {
                        QueryOptions: Record<string, unknown>;
                    };
                };
                return (
                    typeof obj4.d.QueryOptions.SearchType === "string" &&
                    obj4.d.QueryOptions.SearchType === "F"
                );
            }
        }
    }
    return false;
}

export const chartRequest = {
    d: {
        Id: "1",
        DataSources: [],
        Filter: {},
        QueryOptions: {
            SearchTerms: "",
            Skip: 0,
            SearchType: "F",
            ClientSessionID: "",
            ClientCallTimestamp: "", // "\/Date(1496917054000)\/"
            ClientServiceName: "",
            ClientLastExecutionID: "",
        },
        FacetRequests: [], //conditionGroupsByAttributes
        MaxFacetValues: 5,
        Facets: [
            {
                Values: [],
            },
        ],
        ExecutionDetails: [],
    },
};

export function isValueHelperRequest(obj: unknown): obj is typeof valueHelperRequest {
    if (typeof obj === "object") {
        const obj2: Record<string, unknown> = obj as Record<string, unknown>;
        if (typeof obj2.d === "object") {
            const obj3: {
                d: Record<string, unknown>;
            } = obj2 as {
                d: Record<string, unknown>;
            };
            if (typeof obj3.d.ValueHelpAttribute === "string") return true;
        }
    }
    return false;
}

export const valueHelperRequest = {
    d: {
        Id: "1",
        ValueHelpAttribute: "",
        ValueFilter: "",
        DataSources: [],
        Filter: {},
        QueryOptions: {
            SearchTerms: "",
            Top: 1000,
            Skip: 0,
            SearchType: "V",
            ClientSessionID: "",
            ClientCallTimestamp: "", // "\/Date(1496917054000)\/"
            ClientServiceName: "",
            ClientLastExecutionID: "",
        },
        ValueHelp: [],
    },
};

export function isSuggestionRequest(obj: unknown): obj is typeof suggestionRequest {
    if (typeof obj === "object") {
        const obj2: Record<string, unknown> = obj as Record<string, unknown>;
        if (typeof obj2.d === "object") {
            const obj3: {
                d: Record<string, unknown>;
            } = obj2 as {
                d: Record<string, unknown>;
            };
            if (typeof obj3.d.SuggestionInput === "string") return true;
        }
    }
    return false;
}

export const suggestionRequest = {
    d: {
        Id: "1",
        SuggestionInput: "",
        IncludeAttributeSuggestions: false,
        IncludeHistorySuggestions: false,
        IncludeDataSourceSuggestions: false,
        DetailLevel: 1,
        QueryOptions: {
            Top: 0,
            Skip: 0,
            SearchType: "S",
            SearchTerms: "",
            ClientSessionID: "",
            ClientCallTimestamp: "", // "\/Date(1496917054000)\/"
            ClientServiceName: "",
            ClientLastExecutionID: "",
        },
        Filter: {},
        DataSources: [],
        Suggestions: [],
        ExecutionDetails: [],
    },
};

export function isObjectSuggestionRequest(obj: unknown): obj is typeof objectSuggestionRequest {
    if (typeof obj === "object") {
        const obj2: Record<string, unknown> = obj as Record<string, unknown>;
        if (typeof obj2.d === "object") {
            const obj3: {
                d: Record<string, unknown>;
            } = obj2 as {
                d: Record<string, unknown>;
            };
            if (
                obj3.d.IncludeAttributeSuggestions !== "undefined" &&
                obj3.d.IncludeAttributeSuggestions === true
            )
                return true;
        }
    }
    return false;
}

export const objectSuggestionRequest = {
    d: {
        Id: "1",
        IncludeAttributeSuggestions: true,
        QueryOptions: {
            SearchTerms: "a",
            Top: 10,
            Skip: 0,
            ClientSessionID: "",
            ClientCallTimestamp: "", // "\/Date(1496917054000)\/"
            ClientServiceName: "",
            ClientLastExecutionID: "",
        },
        DataSources: [
            {
                Id: "UIA000~EPM_BPA_DEMO~",
                Type: "View",
            },
        ],
        ObjectSuggestions: {
            SearchResults: [
                {
                    HitAttributes: [],
                    Attributes: [],
                },
            ],
        },
        Filter: {},
        ExecutionDetails: [],
    },
};

export function isNavigationEvent(obj: unknown): obj is InavigationEvent {
    if (typeof obj === "object") {
        const obj2: Record<string, unknown> = obj as Record<string, unknown>;
        return (
            typeof obj2.SemanticObjectType === "string" &&
            typeof obj2.Intent === "string" &&
            typeof obj2.System === "string" &&
            typeof obj2.Client === "string" &&
            Array.isArray(obj2.Parameters)
        );
    }
    return false;
}

export interface InavigationEvent {
    SemanticObjectType: string; // Max length: 100
    Intent: string; // Max length: 100
    System?: string; // Max length: 3
    Client?: string; // Max length: 3
    Parameters: Array<{
        Name: string; // Max length: 100
        Value: unknown;
    }>;
}
