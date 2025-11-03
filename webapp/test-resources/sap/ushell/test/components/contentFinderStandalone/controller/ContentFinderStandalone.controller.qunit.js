// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.loader.config({
    map: {
        "sap/ushell/components/contentFinderStandalone/controller/ContentFinderStandalone.controller": {
            "sap/ushell/services/MessageInternal": "sap.test.MessageInternal.Stub",
            "sap/m/library": "sap/m/library/mock"
        }
    }
});

sap.ui.define("sap.test.MessageInternal.Stub", [], () => {
    "use strict";

    /** @type {sinon.SinonStub} */
    const stub = { error: sinon.stub() };
    /**
     *
     * @returns {sinon.SinonStub} the mock object
     */
    function MessageInternalStub () {
        console.log("==== instantiating MessageInternalStub", this);
        return stub;
    }

    MessageInternalStub.getStub = function () {
        return stub;
    };

    return MessageInternalStub;
});

sap.ui.define("sap/m/library/mock", [], () => {
    "use strict";

    return {
        IllustratedMessageType:
            { UnableToLoad: "unableToLoad" }
    };
});

/**
 * @fileOverview QUnit tests for sap.ushell.components.contentFinderStandalone.controller.ContentFinderStandalone.controller
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/components/contentFinderStandalone/controller/ContentFinderStandalone.controller",
    "sap/ushell/Container",
    "sap/ushell/resources",
    "sap.test.MessageInternal.Stub"
], (
    Log,
    ContentFinderStandaloneController,
    Container,
    ushellResources,
    MessageInternalStub
) => {
    "use strict";
    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("The onInit method", {
        beforeEach: function () {
            this.oByIdStub = sandbox.stub().returns(this.oComponentContainer);
            this.oController = new ContentFinderStandaloneController();

            sandbox.stub(this.oController, "getView").returns({
                byId: this.oByIdStub
            });

            this.oShellUIService = {
                setTitle: sandbox.stub()
            };
            sandbox.stub(this.oController, "getOwnerComponent").returns({
                getResourceBundle: sandbox.stub(),
                getService: sandbox.stub().withArgs("ShellUIService").resolves(this.oShellUIService)
            });

            sandbox.stub(Container, "getRendererInternal").returns({
                getRouter: sandbox.stub().returns({
                    getRoute: sandbox.stub().returns({
                        attachMatched: sandbox.stub()
                    })
                })
            });

            sandbox.stub(Container, "getServiceAsync");

            this.oAppLifeCycle = {
                attachAppLoaded: sandbox.stub().callsArg(0),
                detachAppLoaded: sandbox.stub()
            };
            Container.getServiceAsync.withArgs("AppLifeCycle").resolves(this.oAppLifeCycle);
        },

        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("initializes the controller", function (assert) {
        // Act
        this.oController.onInit();

        // Assert
        assert.ok(this.oController.oWorkPageService, "WorkPageService was initialized");
        assert.ok(this.oController.oCatalogService, "CatalogService was initialized");
    });

    QUnit.test("navigation handling", async function (assert) {
        // Arrange
        const sTitle = ushellResources.i18n.getText("appFinderTitle");
        this.oAppLifeCycle.attachAppLoaded.callsFake(() => {
            assert.strictEqual(this.oShellUIService.setTitle.callCount, 0, "setTitle not called before app is loaded");
        });

        // Act
        this.oController.onInit();
        await this.oController._handleContentFinderNavigation();

        // Assert
        assert.deepEqual(this.oShellUIService.setTitle.firstCall.args, [sTitle], "setTitle called with correct args");
    });

    QUnit.module("The appSearchComponentCreated method", {
        beforeEach: function () {
            this.oController = new ContentFinderStandaloneController();
            this.oVisualizationData = { a: "b" };
            this.oGetPropertyStub = sandbox.stub();
            this.oInitialFilters = {
                key: "tiles",
                title: "Tiles",
                types: [
                    "sap.ushell.StaticAppLauncher",
                    "sap.ushell.DynamicAppLauncher",
                    "ssuite.smartbusiness.tiles.dual",
                    "ssuite.smartbusiness.tiles.numeric"
                ]
            };
            this.oInitialTransformedFilterParams = {
                skip: undefined,
                top: undefined,
                filter: [{
                    type: [
                        {
                            in: [
                                "sap.ushell.StaticAppLauncher",
                                "sap.ushell.DynamicAppLauncher",
                                "ssuite.smartbusiness.tiles.dual",
                                "ssuite.smartbusiness.tiles.numeric"
                            ]
                        }
                    ]
                }]
            };
            this.oResourceBundle = {
                getText: sandbox.stub()
            };
            this.oStubs = {
                component: {
                    attachVisualizationFilterApplied: sandbox.stub(),
                    setVisualizationData: sandbox.stub(),
                    getUiModel: sandbox.stub().returns({
                        getProperty: this.oGetPropertyStub
                    }),
                    getSelectedVisualizationFilter: sandbox.stub().returns(this.oInitialFilters),
                    getResourceBundle: sandbox.stub().returns(this.oResourceBundle)
                },
                controller: {
                    setCategoryTree: sandbox.stub(this.oController, "setCategoryTree")
                },
                workPageService: {
                    loadVisualizations: sandbox.stub().resolves(this.oVisualizationData)
                },
                event: {
                    getParameter: sandbox.stub()
                },
                uiModel: {
                    setProperty: sandbox.stub()
                }
            };

            this.oComponent = {
                attachVisualizationFilterApplied: this.oStubs.component.attachVisualizationFilterApplied,
                setVisualizationData: this.oStubs.component.setVisualizationData,
                getUiModel: this.oStubs.component.getUiModel,
                getSelectedVisualizationFilter: this.oStubs.component.getSelectedVisualizationFilter,
                getResourceBundle: this.oStubs.component.getResourceBundle
            };
            sandbox.stub(this.oController, "getOwnerComponent").returns(this.oComponent);
            this.oStubs.event.getParameter.withArgs("component").returns(this.oComponent);
            this.oEvent = {
                getParameter: this.oStubs.event.getParameter
            };
            this.oController.oWorkPageService = {
                loadVisualizations: this.oStubs.workPageService.loadVisualizations
            };
            this.oStubs.component.getUiModel.returns({
                setProperty: this.oStubs.uiModel.setProperty
            });
        },

        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("initializes the appSearch component", async function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/visualizations/filters/selected").returns("tiles");
        this.oGetPropertyStub.withArgs("/visualizations/filters/available").returns([this.oInitialFilters]);

        // Act
        await this.oController.appSearchComponentCreated(this.oEvent);

        // Assert
        assert.ok(this.oStubs.component.attachVisualizationFilterApplied.calledOnce, "attachVisualizationFilterApplied was called once.");
        assert.deepEqual(this.oStubs.component.setVisualizationData.callCount, 1, "setVisualizationData was called once.");
        assert.deepEqual(this.oStubs.component.setVisualizationData.firstCall.args[0], this.oVisualizationData, "setVisualizationData was called with the correct data.");
        assert.deepEqual(this.oStubs.workPageService.loadVisualizations.callCount, 1, "loadVisualizations was called once.");
        assert.deepEqual(this.oStubs.workPageService.loadVisualizations.firstCall.args[0], this.oInitialTransformedFilterParams, "setVisualizationData was called with the correct data.");
        assert.deepEqual(this.oStubs.controller.setCategoryTree.callCount, 1, "setCategoryTree was called once.");
        assert.deepEqual(this.oStubs.uiModel.setProperty.callCount, 1, "setProperty was called once.");
        assert.deepEqual(this.oStubs.uiModel.setProperty.firstCall.args[0], "/linkToAppFinder", "setProperty was called with the correct path.");
    });

    QUnit.test(
        "when error happens on oWorkPageService.loadVisualizations it sends the errorOnVisualizationDataRequest flag to the ContentFinderComponent setVisualizationData method",
        async function (assert) {
            // Arrange
            const oLogErrorStub = sandbox.stub(Log, "error");
            this.oStubs.workPageService.loadVisualizations.rejects(new Error("some error"));
            this.oResourceBundle.getText.returns("someText");

            // Act
            await this.oController.appSearchComponentCreated(this.oEvent);

            // Assert
            assert.deepEqual(oLogErrorStub.firstCall.args, ["ContentFinderStandalone: Visualization data loading failed:", new Error("some error")], "Log.error when load vis request fails.");
            assert.deepEqual(
                this.oComponent.setVisualizationData.firstCall.args,
                [undefined, undefined, { type: "unableToLoad", title: "someText", description: "someText" }],
                "setVisualizationData was called with the override message data.",
                "expected to see the error flag in the setVisualizationData method"
            );

            assert.deepEqual(
                this.oResourceBundle.getText.firstCall.args,
                ["ContentFinderStandalone.AppSearch.Error.LoadingApps.Title"],
                "The error title was extracted from the i18n model getText.");
            assert.deepEqual(
                this.oResourceBundle.getText.secondCall.args,
                ["ContentFinderStandalone.AppSearch.Error.LoadingApps.Details"],
                "The error description was extracted from the i18n model getText."
            );
        }
    );

    QUnit.module("The setCategoryTree method", {
        beforeEach: function () {
            this.oController = new ContentFinderStandaloneController();
            this.oCatalogs = { catalogs: [1, 2, 3], totalCount: 3 };
            this.oController.oCatalogService = {
                getCatalogs: sandbox.stub()
            };
            this.oController.oComponent = {
                setCategoryTree: sandbox.stub(),
                getResourceBundle: sandbox.stub().returns({
                    getText: sandbox.stub().returns("someText")
                })
            };
            sandbox.stub(this.oController, "getOwnerComponent").returns(this.oController.oComponent);
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Call setCategoryTree with response", async function (assert) {
        // Arrange
        const aExpectedData = [
            {
                id: undefined,
                title: "someText",
                filterIsTitle: true,
                inactive: false,
                allowedFilters: ["tiles"]
            },
            {
                id: "$$catalogs",
                title: "someText",
                inactive: true,
                filterIsTitle: false,
                nodes: [1, 2, 3],
                $count: 3,
                allowedFilters: ["tiles"]
            }
        ];
        this.oController.oCatalogService.getCatalogs.resolves(this.oCatalogs);

        // Act
        await this.oController.setCategoryTree();

        // Assert
        assert.ok(this.oController.oComponent.setCategoryTree.calledOnce, "setCategoryTree was called once.");
        assert.deepEqual(this.oController.oComponent.setCategoryTree.firstCall.args[0], aExpectedData, "setCategoryTree was called with the correct data.");
    });

    QUnit.test("Call setCategoryTree with empty response", async function (assert) {
        // Arrange
        this.oController.oCatalogService.getCatalogs.resolves([]);

        // Act
        await this.oController.setCategoryTree();

        // Assert
        assert.ok(this.oController.oComponent.setCategoryTree.calledOnce, "setCategoryTree was called once.");
        assert.deepEqual(this.oController.oComponent.setCategoryTree.firstCall.args[0], [], "setCategoryTree was called with the correct data.");
    });

    QUnit.test("Call setCategoryTree with error response", async function (assert) {
        // Arrange
        this.oController.oCatalogService.getCatalogs.throws(new Error("some error"));
        const oLogErrorStub = sandbox.stub(Log, "error");

        // Act
        await this.oController.setCategoryTree();

        // Assert
        assert.strictEqual(this.oController.oComponent.setCategoryTree.callCount, 0, "setCategoryTree was not called.");
        assert.ok(oLogErrorStub.calledOnce, "Log.error was called once.");
        assert.strictEqual(oLogErrorStub.firstCall.args[0], "Catalog fetching failed with:", "Log.error was called with the correct arguments.");
        assert.strictEqual(oLogErrorStub.firstCall.args[1].message, "some error", "Log.error was called with the correct arguments.");
    });

    QUnit.module("The _onVisualizationFilterApplied method", {
        beforeEach: function () {
            this.oSetVisualizationDataStub = sandbox.stub();

            this.oResourceBundle = {
                getText: sandbox.stub()
            };
            this.oComponent = {
                setVisualizationData: this.oSetVisualizationDataStub,
                getResourceBundle: sandbox.stub().returns(this.oResourceBundle)
            };

            this.oParameters = {
                pagination: {
                    top: 0,
                    skip: 30
                },
                search: "test",
                types: [
                    "sap.ushell.StaticAppLauncher",
                    "sap.ushell.DynamicAppLauncher"
                ]
            };

            this.oVisualizationData = {
                visualizations: {
                    nodes: [
                        { id: "viz-0" },
                        { id: "viz-1" },
                        { id: "viz-2" },
                        { id: "viz-3" },
                        { id: "viz-4" },
                        { id: "viz-5" },
                        { id: "viz-6" },
                        { id: "viz-7" },
                        { id: "viz-8" },
                        { id: "viz-9" }
                    ],
                    totalCount: 10
                }
            };

            this.oTransformedFilterParams = {
                top: 0,
                skip: 30,
                filter: [{
                    type: [
                        { eq: "sap.ushell.StaticAppLauncher" },
                        { eq: "sap.ushell.DynamicAppLauncher" }
                    ],
                    descriptor: [
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/title",
                                    stringFilter: [{ containsIgnoreCase: "test" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/subTitle",
                                    stringFilter: [{ containsIgnoreCase: "test" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/info",
                                    stringFilter: [{ containsIgnoreCase: "test" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.fiori/registrationIds",
                                    anyFilter: [
                                        {
                                            conditions: [
                                                {
                                                    stringFilter: [{ containsIgnoreCase: "test" }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }]
            };

            this.oGetParametersStub = sandbox.stub().returns(this.oParameters);

            this.oEvent = {
                getParameters: this.oGetParametersStub,
                getParameter: sandbox.stub()
            };
            this.oLoadVisualizationsStub = sandbox.stub().resolves(this.oVisualizationData);
            this.oLoadVisualizationsFromCatalogServiceStub = sandbox.stub().resolves(this.oVisualizationData);

            this.oController = new ContentFinderStandaloneController();

            this.oController.oWorkPageService = {
                loadVisualizations: this.oLoadVisualizationsStub
            };
            this.oController.oCatalogService = {
                loadVisualizations: this.oLoadVisualizationsFromCatalogServiceStub
            };

            this.oController.oComponent = this.oComponent;
            sandbox.stub(this.oController, "getOwnerComponent").returns(this.oComponent);

            this.oTransformFilterParamsStub = sandbox.stub(this.oController, "_transformFilterParams").returns(this.oTransformedFilterParams);
        },

        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("sets visualizations to the ContentFinder component", function (assert) {
        // Act
        return this.oController._onVisualizationFilterApplied(this.oEvent).then(() => {
            // Assert
            assert.ok(this.oTransformFilterParamsStub.calledOnce, "_transformFilterParams was called once.");
            assert.deepEqual(this.oTransformFilterParamsStub.firstCall.args[0], this.oParameters, "_transformFilterParams was called with the expected arguments.");
            assert.ok(this.oLoadVisualizationsStub.calledOnce, "loadVisualizations was called once.");
            assert.deepEqual(this.oLoadVisualizationsStub.firstCall.args[0], this.oTransformedFilterParams, "loadVisualizations was called with the expected arguments.");
            assert.ok(this.oSetVisualizationDataStub.calledOnce, "setVisualizationData was called once.");
            assert.deepEqual(this.oSetVisualizationDataStub.firstCall.args[0], this.oVisualizationData, "setVisualizationData was called with the expected arguments.");
        });
    });

    QUnit.test(
        "when the load visualization fails on first call/first page sets visualizations empty and passes in the error flag for the setVisualizations method of the ContentFinder component",
        async function (assert) {
            // Arrange
            this.oTransformFilterParamsStub.restore();
            this.oLoadVisualizationsStub.rejects(new Error("some error"));
            const eventMock = { getParameter: sinon.mock(), getParameters: sandbox.stub().returns({}) };
            this.oResourceBundle.getText.returns("someText");
            // Act
            await this.oController._onVisualizationFilterApplied(eventMock);
            // Assert
            assert.deepEqual(this.oSetVisualizationDataStub.firstCall.args, [undefined, undefined, { type: "unableToLoad", title: "someText", description: "someText" }],
                "setVisualizationData was called with the override message data.",
                "expected to see the error flag in the setVisualizationData method"
            );

            assert.deepEqual(
                this.oResourceBundle.getText.firstCall.args,
                ["ContentFinderStandalone.AppSearch.Error.LoadingApps.Title"],
                "The error title was extracted from the i18n model getText.");
            assert.deepEqual(
                this.oResourceBundle.getText.secondCall.args,
                ["ContentFinderStandalone.AppSearch.Error.LoadingApps.Details"],
                "The error description was extracted from the i18n model getText."
            );
        }
    );

    QUnit.test(
        "when the load visualization fails on subsequent page call(2nd, 3rd...) sets visualizations empty and calls the message.error to let the user know",
        async function (assert) {
            // Arrange
            this.oTransformFilterParamsStub.restore();
            this.oLoadVisualizationsStub.rejects(new Error("some error"));
            const eventMock = { getParameter: sinon.mock(), getParameters: sandbox.stub().returns({ pagination: { skip: 1 } }) };

            this.oResourceBundle.getText.returns("error on loading page 2");
            // Act
            await this.oController._onVisualizationFilterApplied(eventMock);
            // Assert
            const messageStub = MessageInternalStub.getStub();
            assert.deepEqual(messageStub.error.firstCall.args, ["error on loading page 2"], "Message.error was called with the correct data.");
            assert.deepEqual(this.oResourceBundle.getText.firstCall.args,
                ["ContentFinderStandalone.AppSearch.NextPage.Error.Title"], "The error for next page was extracted from the i18n model getText.");
        }
    );

    QUnit.test(
        "when the load catalog visualization fails on first call/first page sets visualizations empty and passes in the error flag for the setVisualizations method of the ContentFinder component",
        async function (assert) {
            // Arrange
            this.oTransformFilterParamsStub.restore();
            this.oLoadVisualizationsFromCatalogServiceStub.rejects(new Error("some error"));
            const eventWithCatalogIdMock = { getParameter: sinon.mock().returns("catalogId1"), getParameters: sandbox.stub().returns({}) };
            this.oResourceBundle.getText.returns("someText");

            // Act
            await this.oController._onVisualizationFilterApplied(eventWithCatalogIdMock);
            // Assert
            assert.deepEqual(this.oSetVisualizationDataStub.firstCall.args, [undefined, undefined, { type: "unableToLoad", title: "someText", description: "someText" }],
                "setVisualizationData was called with the override message data.",
                "expected to see the error flag in the setVisualizationData method"
            );

            assert.deepEqual(
                this.oResourceBundle.getText.firstCall.args,
                ["ContentFinderStandalone.AppSearch.Error.LoadingApps.Title"],
                "The error title was extracted from the i18n model getText.");
            assert.deepEqual(
                this.oResourceBundle.getText.secondCall.args,
                ["ContentFinderStandalone.AppSearch.Error.LoadingApps.Details"],
                "The error description was extracted from the i18n model getText."
            );
        }
    );

    QUnit.test(
        "when the load catalog visualization fails on subsequent page call(2nd, 3rd...) sets visualizations empty and calls the message.error to let the user know",
        async function (assert) {
            // Arrange
            this.oTransformFilterParamsStub.restore();
            this.oLoadVisualizationsFromCatalogServiceStub.rejects(new Error("some error"));
            const eventMock = { getParameter: sinon.mock().returns("catalogId1"), getParameters: sandbox.stub().returns({ pagination: { skip: 1 } }) };
            this.oResourceBundle.getText.returns("error on loading page 2");
            // Act
            await this.oController._onVisualizationFilterApplied(eventMock);
            // Assert
            const messageStub = MessageInternalStub.getStub();
            assert.deepEqual(messageStub.error.firstCall.args, ["error on loading page 2"], "Message.error was called with the correct data.");
            assert.deepEqual(this.oResourceBundle.getText.firstCall.args,
                ["ContentFinderStandalone.AppSearch.NextPage.Error.Title"], "The error for next page was extracted from the i18n model getText.");
        }
    );

    QUnit.module("The _transformFilterParams method", {
        beforeEach: function () {
            this.oController = new ContentFinderStandaloneController();
        },

        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("transforms the given filters to graphql format - no search", function (assert) {
        // Arrange
        this.oParameters = {
            pagination: {
                top: 0,
                skip: 30
            },
            search: null,
            types: [
                "sap.ushell.StaticAppLauncher",
                "sap.ushell.DynamicAppLauncher"
            ]
        };

        // Act
        const oResult = this.oController._transformFilterParams(this.oParameters);

        // Assert
        assert.deepEqual(oResult, {
            top: 0,
            skip: 30,
            filter: [{ type: [{ in: ["sap.ushell.StaticAppLauncher", "sap.ushell.DynamicAppLauncher"] }] }]
        }, "The filter were transformed as expected.");
    });

    QUnit.test("transforms the given filters to graphql format - no types", function (assert) {
        // Arrange
        this.oParameters = {
            pagination: {
                top: 120,
                skip: 150
            },
            search: "test my search"
        };

        // Act
        const oResult = this.oController._transformFilterParams(this.oParameters);

        // Assert
        assert.deepEqual(oResult, {
            top: 120,
            skip: 150,
            filter: [
                {
                    type: [],
                    descriptor: [
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/title",
                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/subTitle",
                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/info",
                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.fiori/registrationIds",
                                    anyFilter: [
                                        {
                                            conditions: [
                                                {
                                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

            ]
        }, "The filter were transformed as expected.");
    });

    QUnit.test("transforms the given filters to graphql format - all filters", function (assert) {
        // Arrange
        this.oParameters = {
            pagination: {
                top: 90,
                skip: 120
            },
            search: "test my search",
            types: [
                "sap.ushell.StaticAppLauncher",
                "sap.ushell.DynamicAppLauncher",
                "sap.card"
            ]
        };

        // Act
        const oResult = this.oController._transformFilterParams(this.oParameters);

        // Assert
        assert.deepEqual(oResult, {
            top: 90,
            skip: 120,
            filter: [
                {
                    type: [
                        { in: ["sap.ushell.StaticAppLauncher", "sap.ushell.DynamicAppLauncher", "sap.card"] }
                    ],
                    descriptor: [
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/title",
                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/subTitle",
                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.app/info",
                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                }
                            ]
                        },
                        {
                            conditions: [
                                {
                                    propertyPath: "/sap.fiori/registrationIds",
                                    anyFilter: [
                                        {
                                            conditions: [
                                                {
                                                    stringFilter: [{ containsIgnoreCase: "test my search" }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

            ]
        }, "The filter were transformed as expected.");
    });
});
