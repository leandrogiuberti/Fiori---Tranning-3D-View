declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/ajaxTemplates" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    const loadDataSourcesRequest: {
        DataSource: {
            ObjectName: string;
            PackageName: string;
        };
        Options: string[];
        Search: {
            Top: number;
            Skip: number;
            OrderBy: {
                AttributeName: string;
                SortOrder: string;
            }[];
            Expand: string[];
            Filter: {
                Selection: {
                    Operator: {
                        Code: string;
                        SubSelections: {
                            MemberOperand: {
                                AttributeName: string;
                                Comparison: string;
                                Value: string;
                            };
                        }[];
                    };
                };
            };
            NamedValues: {
                AttributeName: string;
                Name: string;
            }[];
        };
        SearchTerms: string;
        ServiceVersion: number;
    };
    const fallbackLoadDataSourcesRequest: {
        DataSource: {
            SchemaName: string;
            PackageName: string;
            ObjectName: string;
            type: string;
        };
        Search: {
            Top: number;
            Skip: number;
            OrderBy: {
                AttributeName: string;
                SortOrder: string;
            }[];
            Expand: string[];
            Filter: {};
            NamedValues: {
                AttributeName: string;
                Name: string;
            }[];
            SearchTerms: string;
            SelectedValues: any[];
        };
        SearchTerms: string;
    };
    const searchRequest: {
        DataSource: {};
        Options: string[];
        Search: {
            Expand: string[];
            Filter: {};
            Top: number;
            Skip: number;
            SearchTerms: string;
            NamedValues: ({
                Function: string;
                Name: string;
                AttributeName?: undefined;
            } | {
                AttributeName: string;
                Function?: undefined;
                Name?: undefined;
            })[];
            OrderBy: any[];
        };
        ServiceVersion: number;
    };
    const chartRequest: {
        DataSource: {};
        Options: string[];
        Search: {
            Expand: string[];
            Filter: {};
            Top: number;
            Skip: number;
            SearchTerms: string;
            NamedValues: ({
                Function: string;
                Name: string;
                AttributeName?: undefined;
            } | {
                AttributeName: string;
                Function?: undefined;
                Name?: undefined;
            })[];
            OrderBy: any[];
        };
        ServiceVersion: number;
        Facets: {
            MaxNumberOfReturnValues: number;
            Attributes: any[];
        };
    };
    const suggestionRequest: {
        DataSource: {};
        Options: string[];
        Suggestions2: {
            Expand: string[];
            Filter: {};
            Precalculated: boolean;
            AttributeNames: any[];
            Top: number;
            Skip: number;
        };
        ServiceVersion: number;
    };
    const getConfigurationRequest: {
        SearchConfiguration: {
            Action: string;
            Data: {
                PersonalizedSearch: {};
            };
        };
    };
    const saveConfigurationRequest: {
        SearchConfiguration: {
            Action: string;
            Data: {
                PersonalizedSearch: {
                    SessionUserActive: boolean;
                };
            };
        };
    };
    const resetPersonalizedSearchDataRequest: {
        SearchConfiguration: {
            Action: string;
            Data: {
                PersonalizedSearch: {
                    ResetUserData: boolean;
                };
            };
        };
    };
    const incrementClickCounterRequest: {
        SearchConfiguration: {
            Action: string;
            ClientEvent: {
                NavigationEventList: ({
                    SourceApplication: {
                        SemanticObjectType: string;
                        Intent: string;
                        ParameterList: {
                            Name: string;
                            Value: string;
                        }[];
                    };
                    TargetApplication?: undefined;
                } | {
                    TargetApplication: {
                        SemanticObjectType: string;
                        Intent: string;
                        ParameterList: {
                            Name: string;
                            Value: string;
                        }[];
                    };
                    SourceApplication?: undefined;
                })[];
            };
        };
    };
    const loadDataSourceMetadataRequest: {
        DataSource: {
            ObjectName: string;
            PackageName: string;
            SchemaName: string;
        };
        Options: string[];
        Metadata: {
            Context: string;
            Expand: string[];
        };
        ServiceVersion: number;
    };
}
//# sourceMappingURL=ajaxTemplates.d.ts.map