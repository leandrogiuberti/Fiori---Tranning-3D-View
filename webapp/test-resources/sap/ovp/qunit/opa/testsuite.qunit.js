sap.ui.define(["./env", "sap/base/util/merge"], function (env, merge) {
    "use strict";

    var mConfig = {
        /*
         * Name of the test suite.
         *
         * This name will be used in the title of the index page / testsuite page.
         */
        name: "OPA Tests testing the tests",

        /*
         * An Object with default settings for all tests.
         *
         * The defaults and the test configuration will be merged recursively in a way
         * that the merge contains properties from both, defaults and test config;
         * if a property is defined by both config objects, the value from the test config will be used.
         * There's no special handling for other types of values, e.g an array value in the defaults
         * will be replaced by an array value in the test config.
         */
        defaults: {
            qunit: {
                 /*
                * Version of QUnit that should be loaded.
                * If set to a null, QUnit won't be loaded.
                * If set to "edge", the newest available version of QUnit will be used.
                * If set to a number, the corresponding version of QUnit will be used if supported.
                */
                 version: "edge",
            },
            ui5: {
                noConflict: true,
                language: "en",
                libs: ["sap.m", "sap.ui.layout", "sap.ui.comp", "sap.ui.rta"],
                resourceRoots: {
                    "sap.ovp.test": "../../../../../sap/ovp/",
                },
            },
            sinon: {
                /*
                * Version of Sinon that should be loaded.
                * If set to null, Sinon won't be loaded.
                * If set to "edge", the newest available version of Sinon will be used.
                * If set to a number, the corresponding version of Sinon will be used if supported.
                */
                version: "edge",
            },
            loader: {
                paths: {},
            },
            //bootCore: true
        },

        /*
         * A map with the individual test configurations, keyed by a unique test name.
         *
         * The name will be used only in the overview page showing all tests of your suite.
         *
         * But by default, the name is also used to derive the ID of the module that contains the test cases.
         * It is therefore suggested to use module ID like names (no blanks, no special chars other than / or dot)
         * If you have multiple tests that execute the same module but with different configurations
         * (e.g. different QUnit versions or different URL parameters), you have to make up unique names
         * and manually configure the module IDs for them.
         */
        tests: {
            OpaForVariantManagement: {
                module: "test-resources/sap/ovp/integrations/VariantManagementJourney",
                title: "OPA Test page for Variant Management",
                group: "opa",
            },
            OpaForTableCard: {
                module: "test-resources/sap/ovp/integrations/TableCardJourney",
                title: "OPA Test page for table card",
                group: "opa",
            },
            OpaForCardActions: {
                module: "test-resources/sap/ovp/integrations/OvpCardActionsJourney",
                title: "OPA Test page for Additional card actions",
                group: "opa",
            },
            OpaForInsightsCardActionsDTMode: {
                module: "test-resources/sap/ovp/integrations/Insights/Journey/DT/OvpInsightsCardActionsJourney",
                title: "OPA Test page for Additional card actions for Insights",
                group: "opa"
            },
            OpaForInsightsCardFiltersDTMode: {
                module: "test-resources/sap/ovp/integrations/Insights/Journey/DT/OvpInsightsCardFiltersJourney",
                title: "OPA Test page for Additional card actions for Insights",
                group: "opa"
            },
            OpaForLinkListCard: {
                module: "test-resources/sap/ovp/integrations/LinkListCardJourney",
                title: "OPA Test page for linklist card",
                group: "opa",
            },
            OpaForListCard: {
                module: "test-resources/sap/ovp/integrations/ListCardJourney",
                title: "OPA Test page for list card",
                group: "opa",
            },
            OpaForStackCard: {
                module: "test-resources/sap/ovp/integrations/StackCardJourney",
                title: "OPA Test page for stack card",
                group: "opa",
            },
            OpaForAnalyticalCard: {
                module: "test-resources/sap/ovp/integrations/AnalyticCardJourney",
                title: "OPA Test page for analytical card",
                group: "opa",
            },
            OpaForManageCardsDialog: {
                module: "test-resources/sap/ovp/integrations/ManageCardJourney",
                title: "OPA Test page for manage cards dialog",
                group: "opa",
            },
            OpaForLazyRendering: {
                module: "test-resources/sap/ovp/integrations/LazyRenderingJourney",
                title: "OPA Test page for Lazy Rendering",
                group: "opa",
            },
            OpaForManageCardsWithCardLimit: {
                module: "test-resources/sap/ovp/integrations/ManageCardsWithCardLimitJourney",
                title: "OPA Test page for Manage Cards with Card Limit",
                group: "opa",
            },
            OpaForIllustratedMessages: {
                module: "test-resources/sap/ovp/integrations/IllustratedMessagesJourney",
                title: "OPA Test page for IllustratedMessages",
                group: "opa",
            }
        }
    };

    /**
     * For OData V4 OPA testcases, we need to check if OVP's mockserver for OData V4 is running
     * In sapui5 innersource nightly builds, OVP cannot start it's middleware to expose OData V4 services, so we can disable only these tests.
     * It would still run with OVP master build
     */
    if (env.isV4EnvSupported) {
        mConfig = merge({}, mConfig, {
            tests: {
                OpaForTableCardV4: {
                    module: "test-resources/sap/ovp/integrations/TableCardV4Journey",
                    title: "OPA Test page for V4 table card",
                    group: "v4-opa",
                },
                OpaForListCardV4: {
                    module: "test-resources/sap/ovp/integrations/ListCardV4Journey",
                    title: "OPA Test page for V4 list card",
                    group: "v4-opa",
                },
                OpaForMacroFilterBar: {
                    module: "test-resources/sap/ovp/integrations/MacroFilterBarJourney",
                    title: "OPA Test page for MacroFilterBar",
                    group: "v4-opa",
                },
                OpaForAutoLoad: {
                    module: "test-resources/sap/ovp/integrations/AppLoadJourney",
                    title: "OPA Test page for Auto Load",
                    group: "v4-opa"
                },
                OpaForLinkListCardV4: {
                    module: "test-resources/sap/ovp/integrations/LinkListCardV4Journey",
                    title: "OPA Test page for V4 linklist card",
                    group: "v4-opa",
                },
                OpaForV4Scenarios: {
                    module: "test-resources/sap/ovp/integrations/V4ScenariosJourney",
                    title: "OPA Test page for V4 Scenarios",
                    group: "v4-opa",
                },
                OpaForManageCardsV4: {
                    module: "test-resources/sap/ovp/integrations/ManageCardV4Journey",
                    title: "OPA Test page for V4 Manage Cards",
                    group: "v4-opa",
                },
                OpaForAnalyticalCardV4: {
                    module: "test-resources/sap/ovp/integrations/AnalyticalCardV4Journey",
                    title: "OPA Test page for V4 Analytical Card",
                    group: "v4-opa",
                }
            }
        });
    }

    return mConfig;
});