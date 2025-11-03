sap.ui.define([], function () {
    "use strict";

    var mConfig = {
        /*
         * Name of the test suite.
         *
         * This name will be used in the title of the index page / testsuite page.
         */
        name: "Qunit Test suite for OVP",

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
                    "sap.ovp.test": "../../../../sap/ovp/",
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
            QunitForPlaceholder: {
                module: "test-resources/sap/ovp/qunit/ui/placeholderHelper.qunit",
                title: "QUnit test page for sap/ovp/placeholder/placeholderHelper",
                group: "qunit @/lib",
            },
            MainControllerJs: {
                module: "test-resources/sap/ovp/qunit/app/Main.qunit",
                title: "QUnit test page for sap/ovp/app/Main.controller",
                group: "qunit @/lib",
            },
            ManageCardsUtilsJs: {
                module: "test-resources/sap/ovp/qunit/app/ManageCardsUtils.qunit",
                title: "QUnit test page for sap/ovp/app/ManageCardsUtils.controller",
                group: "qunit @/lib",
            },
            ShareUtilsJs: {
                module: "test-resources/sap/ovp/qunit/app/ShareUtils.qunit",
                title: "QUnit test page for sap/ovp/app/ShareUtils",
                group: "qunit @/lib",
            },
            PageHeaderFeatures: {
                module: "test-resources/sap/ovp/qunit/app/PageHeader.qunit",
                title: "QUnit test page for page header",
                group: "qunit @/lib",
            },
            FilterUtilsJs: {
                module: "test-resources/sap/ovp/qunit/filter/FilterUtils.qunit",
                title: "QUnit test page for sap/ovp/filter/FilterUtils",
                group: "qunit @/lib",
            },
            CommonUtilsJs: {
                module: "test-resources/sap/ovp/qunit/cards/CommonUtils.qunit",
                title: "QUnit test page for sap/ovp/cards/CommonUtils",
                group: "qunit @/lib"
            },
            SettingsUtilsJs: {
                module: "test-resources/sap/ovp/qunit/cards/SettingsUtils.qunit",
                title: "QUnit test page for sap/ovp/cards/SettingsUtils",
                group: "qunit @/lib"
            },
            ChartConfigJS: {
                module: "test-resources/sap/ovp/qunit/cards/config.qunit",
                title: "QUnit test page for config load from sap/ovp/cards/generic/base/analytical/config",
                group: "qunit @/lib"
            },
            PersonalizationUtilsJs: {
                module: "test-resources/sap/ovp/qunit/cards/PersonalizationUtils.qunit",
                title: "QUnit test page for sap/ovp/cards/PersonalizationUtils",
                group: "qunit @/lib",
            },
            PayLoadUtilsJs: {
                module: "test-resources/sap/ovp/qunit/cards/PayLoadUtils.qunit",
                title: "QUnit test page for sap/ovp/cards/PayLoadUtils",
                group: "qunit @/lib",
            },
            OVPCardAsAPIUtilsJs: {
                module: "test-resources/sap/ovp/qunit/cards/OVPCardAsAPIUtils.qunit",
                title: "QUnit test page for sap/ovp/cards/OVPCardAsAPIUtils",
                group: "qunit @/lib",
            },
            AnnotationHelperJs: {
                module: "test-resources/sap/ovp/qunit/cards/AnnotationHelper.qunit",
                title: "QUnit test page for sap/ovp/cards/AnnotationHelper",
                group: "qunit @/lib",
            },
            FilterHelperJs: {
                module: "test-resources/sap/ovp/qunit/cards/Filterhelper.qunit",
                title: "QUnit test page for sap/ovp/cards/Filterhelper",
                group: "qunit @/lib",
            },
            ActionUtilsJs: {
                module: "test-resources/sap/ovp/qunit/cards/ActionUtils.qunit",
                title: "QUnit test page for sap/ovp/cards/ActionUtils",
                group: "qunit @/lib",
            },
            UIActionsJs: {
                module: "test-resources/sap/ovp/qunit/ui/UIActions.qunit",
                title: "QUnit test page for sap/ovp/ui/UIActions",
                group: "qunit @/lib"
            },
            ObjectStreamJs: {
                module: "test-resources/sap/ovp/qunit/ui/ObjectStream.qunit",
                title: "QUnit test page for sap/ovp/ui/ObjectStream",
                group: "qunit @/lib",
            },
            EasyScanLayoutJs: {
                module: "test-resources/sap/ovp/qunit/ui/EasyScanLayout.qunit",
                title: "QUnit test page for sap/ovp/ui/EasyScanLayout",
                group: "qunit @/lib",
            },
            DashBoardLayoutJs: {
                module: "test-resources/sap/ovp/qunit/ui/DashboardLayout.qunit",
                title: "QUnit test page for sap/ovp/ui/DashboardLayout",
                group: "qunit @/lib",
            },
            DashBoardLayoutDesigntime: {
                module: "test-resources/sap/ovp/qunit/ui/DashboardLayout.designtime.qunit",
                title: "QUnit test page for sap/ovp/ui/DashboardLayout.designtime",
                group: "qunit @/lib"
            },
            cardPositionHelper: {
                module: "test-resources/sap/ovp/qunit/ui/cardPositionHelper.qunit",
                title: "QUnit test page for sap/ovp/ui/cardPositionHelper",
                group: "qunit @/lib",
            },
            DashboardLayoutUtilJs: {
                module: "test-resources/sap/ovp/qunit/ui/DashboardLayoutUtil.qunit",
                title: "QUnit test page for sap/ovp/ui/DashboardLayoutUtil",
                group: "qunit @/lib",
            },
            DashboardLayoutModelJs: {
                module: "test-resources/sap/ovp/qunit/ui/DashboardLayoutModel.qunit",
                title: "QUnit test case for sap/ovp/ui/DashboardLayoutModel",
                group: "qunit @/lib",
            },
            AnalyticalCardWaterfallJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.waterfall.qunit",
                title: "QUnit test page for sap/ovp/cards/charts/VizAnnotationManager- Waterfall Chart",
                group: "qunit @/lib",
            },
            AnalyticalCardVerticleJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.vertical.qunit",
                title: "QUnit test page for Analytical Vertical Bullet Chart",
                group: "qunit @/lib"
            },
            AnalyticalCardStackedColumnJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.stackedColumn.qunit",
                title: "QUnit test page for Analytical Stacked Column Chart",
                group: "qunit @/lib",
            },
            AnalyticalCardScatterJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.scatter.qunit",
                title: "QUnit test page for Analytical Scatter Chart",
                group: "qunit @/lib",
            },
            AnalyticalCardLineJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.line.qunit",
                title: "QUnit test page for Analytical Line Chart",
                group: "qunit @/lib",
            },
            AnalyticalCardDualCombinationJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.dualCombination.qunit",
                title: "QUnit test page for Analytical Dual Combination Chart",
                group: "qunit @/lib",
            },
            AnalyticalCardDonutJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.donut.qunit",
                title: "QUnit test page for Analytical Donut chart",
                group: "qunit @/lib",
            },
            AnalyticalCardCombinationJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.combination.qunit",
                title: "QUnit test page for Analytical Combination chart",
                group: "qunit @/lib",
            },
            AnalyticalCardColumnJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.column.qunit",
                title: "QUnit test page for Analytical Column chart",
                group: "qunit @/lib",
            },
            AnalyticalCardBarJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.bar.qunit",
                title: "QUnit test page for Analytical Bar Chart",
                group: "qunit @/lib",
            },
            AnalyticalCardBubbleJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/analytical/analyticalCard.bubble.qunit",
                title: "QUnit test page for Analytical Bubble Chart",
                group: "qunit @/lib",
            },
            GenericChartFunctionsJs: {
                module: "test-resources/sap/ovp/qunit/cards/charts/genericChartFunctions.qunit",
                title: "QUnit test page for sap/ovp/cards/charts/VizAnnotationManager",
                group: "qunit @/lib",
            },
            StackJs: {
                module: "test-resources/sap/ovp/qunit/cards/stack/Stack.qunit",
                title: "QUnit test page for stack cards",
                group: "qunit @/lib"
            },
            QuickViewJs: {
                module: "test-resources/sap/ovp/qunit/cards/quickview/Quickview.qunit",
                title: "QUnit test page for QuickView Cards",
                group: "qunit @/lib"
            },
            GenericJs: {
                module: "test-resources/sap/ovp/qunit/cards/generic/Generic.qunit",
                title: "QUnit test page for sap/ovp/cards/generic/Card",
                group: "qunit @/lib",
            },
            ComponentJs: {
                module: "test-resources/sap/ovp/qunit/app/Component.qunit",
                title: "QUnit test page for sap/ovp/app/Component",
                group: "qunit @/lib",
            },
            NavigationHelper: {
                module: "test-resources/sap/ovp/qunit/app/NavigationHelper.qunit",
                title: "QUnit test page for sap/ovp/app/NavigationHelper",
                group: "qunit @/lib",
            },
            ComponentJsPlaceholderEnabled: {
                module: "test-resources/sap/ovp/qunit/app/componentPlaceholderEnabled.qunit",
                title: "QUnit test page for sap/ovp/app/Component - Placeholder",
                group: "qunit @/lib",
            },
            ListJs: {
                module: "test-resources/sap/ovp/qunit/cards/list/List.qunit",
                title: "QUnit test page for list cards - V2",
                group: "qunit @/lib",
            },
            V4ListJs: {
                module: "test-resources/sap/ovp/qunit/cards/v4/list/v4List.qunit",
                title: "QUnit test page for list cards - V4",
                group: "qunit @/lib",
            },
            TableJs: {
                module: "test-resources/sap/ovp/qunit/cards/table/Table.qunit",
                title: "QUnit test page for table card - V2",
                group: "qunit @/lib",
            },
            V4TableJs: {
                module: "test-resources/sap/ovp/qunit/cards/v4/table/v4Table.qunit",
                title: "QUnit test page for table card - V4",
                group: "qunit @/lib",
            },
            LinklistAnnotationHelper: {
                module: "test-resources/sap/ovp/qunit/cards/linklist/AnnotationHelper.qunit",
                title: "QUnit test page for sap/ovp/cards/linklist/AnnotationHelper",
                group: "qunit @/lib",
            },
            SettingsDialogJs: {
                module: "test-resources/sap/ovp/qunit/cards/rta/SettingsDialog.qunit",
                title: "QUnit test page for settings dialog - RTA",
                group: "qunit @/lib",
            },
            MetadataAnalyserJs: {
                module: "test-resources/sap/ovp/qunit/cards/MetadataAnalyser.qunit",
                title: "QUnit test page for sap/ovp/cards/MetadataAnalyser",
                group: "qunit @/lib",
            },
            V4AnnotationHelperJs: {
                module: "test-resources/sap/ovp/qunit/cards/v4/V4AnnotationHelper.qunit",
                title: "QUnit test page for sap/ovp/cards/v4/V4AnnotationHelper",
                group: "qunit @/lib",
                type: "V4CardQunit",
            },
            V4ListControllerJs: {
                module: "test-resources/sap/ovp/qunit/cards/v4/list/list.controller.qunit",
                title: "QUnit test case for sap.ovp.cards.v4.list.List - V4",
                group: "qunit @/lib",
                type: "V4CardQunit",
            },
            V4ChartUtilsJS: {
                module: "test-resources/sap/ovp/qunit/cards/v4/chart/utils.qunit",
                title: "QUnit test page for sap/ovp/cards/generic/base/analytical/Utils",
                group: "qunit @/lib",
                type: "V4CardQunit",
            },
            V4AnalyticalControllerJS: {
                module: "test-resources/sap/ovp/qunit/cards/v4/chart/analytical/analytical.controller.qunit",
                title: "QUnit test page for sap.ovp.cards.v4.charts.analytical",
                group: "qunit @/lib",
                type: "V4CardQunit",
            },
            V4GenericComponentJS: {
                module: "test-resources/sap/ovp/qunit/cards/v4/generic/component.qunit",
                title: "QUnit test page for generic component - V4",
                group: "qunit @/lib",
                type: "V4CardQunit",
            },
            VizAnnotationManager: {
                module: "test-resources/sap/ovp/qunit/cards/v4/chart/VizAnnotationManager.qunit",
                title: "QUnit test page for sap/ovp/cards/v4/charts/VizAnnotationManager",
                group: "qunit @/lib",
                type: "V4CardQunit",
            },
            CardChangeHandler: {
                module: "test-resources/sap/ovp/qunit/flexibility/CardChangeHandler.qunit",
                title: "Qunit test page for sap/ovp/flexibility/changeHandler/CardChangeHandler",
                group: "qunit @/lib"
            },
            DashboardLayoutFlexibility: {
                module: "test-resources/sap/ovp/qunit/flexibility/DashboardLayout.flexibility.qunit",
                title: "Qunit test page for sap/ovp/flexibility/DashboardLayout.flexibility",
                group: "qunit @/lib"
            },
            V4MetadataAnalyzer: {
                module: "test-resources/sap/ovp/qunit/helpers/V4/MetadataAnalyzer.qunit",
                title: "QUnit test page for sap/ovp/helpers/V4/MetadataAnalyzer",
                group: "qunit @/lib"
            },
            ODataAnnotationHelper: {
                module: "test-resources/sap/ovp/qunit/helpers/ODataAnnotationHelper.qunit",
                title: "QUnit test page for sap/ovp/helpers/ODataAnnotationHelper",
                group: "qunit @/lib"
            },
            ODataDelegator: {
                module: "test-resources/sap/ovp/qunit/helpers/ODataDelegator.qunit",
                title: "QUnit test page for sap/ovp/helpers/ODataDelegator",
                group: "qunit @/lib"
            },
            CardsNavigationHelper: {
                module: "test-resources/sap/ovp/qunit/cards/NavigationHelper.qunit",
                title: "QUnit test page for sap/ovp/cards/NavigationHelper",
                group: "qunit @/lib"
            },
            
            IAppStateHandler: {
                module: "test-resources/sap/ovp/qunit/handlers/IAppStateHandler.qunit",
                title: "QUnit test page for sap/ovp/handlers/IAppStateHandler",
                group: "qunit @/lib"
            },

            SmartFilterbarHandler: {
                module: "test-resources/sap/ovp/qunit/handlers/SmartFilterbarHandler.qunit",
                title: "QUnit test page for sap/ovp/handlers/SmartFilterbarHandler",
                group: "qunit @/lib"
            },

            MacroFilterbarHandler: {
                module: "test-resources/sap/ovp/qunit/handlers/MacroFilterbarHandler.qunit",
                title: "QUnit test page for sap/ovp/handlers/MacroFilterbarHandler",
                group: "qunit @/lib"
            },
            
            /** Test cases related to integration card generation */
            CardProviderJS: {
                module: "test-resources/sap/ovp/qunit/insights/CardProvider.qunit",
                title: "Qunit test page for sap/ovp/qunit/insights/CardProvider",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardJS: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/IntegrationCard.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/Filters",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit",
            },
            IntegrationCardFilterHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/Filters.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/Filters",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit",
            },
            IntegrationCardBatchHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/Batch.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/Batch",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardi18nHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/i18n.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/i18n",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardTableContentHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/TableContentHelper.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/TableContentHelper",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardListContentHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/ListContentHelper.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/ListContentHelper",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardContentHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/ContentHelper.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/ContentHelper",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardHeader: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/CardHeader.qunit",
                title: "Qunit test page for sap/ovp/insights/helpers/CardHeader",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationCardActionHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/CardAction.qunit",
                title: "Qunit test page for /ovp/qunit/insights/helpers/CardAction",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            },
            IntegrationAnalyticalCardHelper: {
                module: "test-resources/sap/ovp/qunit/insights/helpers/AnalyticalCard.qunit",
                title: "Qunit test page for /ovp/qunit/insights/helpers/AnalyticalCard",
                group: "qunit @ovp-lib - Integration Card",
                type: "IntegrationCardQunit"
            }
        }
    };

    return mConfig;
});
