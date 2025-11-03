// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.Pages
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepClone",
    "sap/base/util/extend",
    "sap/ui/model/Model",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/services/Pages",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], (
    Log,
    deepClone,
    extend,
    Model,
    jQuery,
    readUtils,
    readVisualizations,
    utilsCdm,
    Config,
    Container,
    ushellLibrary,
    resources,
    Pages,
    ushellUtils,
    urlParsing
) => {
    "use strict";

    const DisplayFormat = ushellLibrary.DisplayFormat;

    /* global QUnit, sinon */

    QUnit.dump.maxDepth = 10;

    const sandbox = sinon.createSandbox({});

    QUnit.module("Constructor", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oGetServiceAsyncStub.callsFake((sParam) => {
                return sParam;
            });
            Config.emit("/core/darkMode/enabled", false); // skip DarkModeSupport that calls getServiceAsync and breaks
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("initial Properties are set correctly", function (assert) {
        // Act
        const oPagesService = new Pages();

        // Assert
        assert.strictEqual(oPagesService.COMPONENT_NAME, "sap.ushell.services.Pages", "initial value was successfully set");
        assert.strictEqual(oPagesService._oCdmServicePromise, "CommonDataModel", "Cdm Service was successfully called");
        assert.ok(oPagesService.getModel() instanceof Model, "Model was successfully added");
        assert.strictEqual(oPagesService._bImplicitSaveEnabled, true, "Implicit save is enabled by default");
        assert.deepEqual(oPagesService._aPagesToBeSaved, [], "_aPagesToBeSaved was successfully initialized");
    });

    QUnit.module("The _generateId function", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            const oPageMock = {
                id: "page1",
                sections: [{
                    id: "sec1",
                    visualizations: [
                        { id: "viz1" },
                        { id: "viz2" }
                    ]
                }, {
                    id: "sec2",
                    visualizations: [
                        { id: "viz3" },
                        { id: "viz4" }
                    ]
                }]
            };

            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/pages/0", oPageMock);
            this.oGenerateUniqueIdStub = sandbox.stub(ushellUtils, "generateUniqueId");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Calls '_generateUniqueId'", function (assert) {
        // Arrange
        this.oGenerateUniqueIdStub.returns("uniqueId");
        const aExpectedIds = ["sec1", "viz1", "viz2", "sec2", "viz3", "viz4"];

        // Act
        const sId = this.oPagesService._generateId("page1");

        // Assert
        assert.strictEqual(sId, "uniqueId", "Returned the correct id");
        assert.strictEqual(this.oGenerateUniqueIdStub.callCount, 1, "_generateUniqueId was called once");
        assert.deepEqual(this.oGenerateUniqueIdStub.getCall(0).args, [aExpectedIds], "_generateUniqueId was called with correct parameters");
    });

    QUnit.module("enableImplicitSave", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oPagesService = new Pages();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Saves the value", function (assert) {
        // Arrange
        // Act
        this.oPagesService.enableImplicitSave(true);
        // Assert
        assert.strictEqual(this.oPagesService._bImplicitSaveEnabled, true, "the correct value was saved");
    });

    QUnit.module("getPagePath", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("page with pageId is in model", function (assert) {
        // Arrange
        const oPagesService = new Pages();
        oPagesService.getModel()._setProperty("/pages/0", { id: "ImHere" });

        // Act
        const sPath = oPagesService.getPagePath("ImHere");

        // Assert
        assert.strictEqual(sPath, "/pages/0", "path to page was returned");
    });

    QUnit.test("page with pageId is not in model", function (assert) {
        // Arrange
        const oPagesService = new Pages();

        // Act
        const sPath = oPagesService.getPagePath("ImNotHere");

        // Assert
        assert.strictEqual(sPath, "", "An empty string was returned");
    });

    QUnit.module("loadPage", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(),
                getCachedVisualizations: sandbox.stub().resolves(),
                getApplications: sandbox.stub().resolves(),
                getCachedVizTypes: sandbox.stub().resolves()
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            this.oPagesService = new Pages();
            this.oGetModelForPageStub = sandbox.stub(this.oPagesService, "_getModelForPage").resolves({});
            this.oGetPagePath = sandbox.stub(this.oPagesService, "getPagePath").returns("");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("CDM Service cannot be resolved", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(new Error("Custom Error"));

        // Act
        const oPromise = this.oPagesService.loadPage("ZTEST");

        // Assert
        return oPromise.catch((oError) => {
            assert.strictEqual(oError.message, "Custom Error", "Error was was handled correctly");
        });
    });

    QUnit.test("Site cannot be gathered from CDM Service", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(new Error("Custom Error"));

        // Act
        const oPromise = this.oPagesService.loadPage("ZTEST");

        // Assert
        return oPromise.catch((oError) => {
            assert.equal(oError.message, "Custom Error", "Error was was handled correctly");
        });
    });

    QUnit.test("Loads a page and inserts it into the JSON model", function (assert) {
        // Arrange
        this.oGetModelForPageStub.resolves({ id: "ZTEST" });
        this.oCommonDataModelService.getPage.resolves({
            identification: { id: "Z_TEST_PAGE", title: "Page to test" },
            payload: {}
        });
        this.oCommonDataModelService.getCachedVisualizations.resolves({
            "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:/UI2/LIMBACHS:3WO90XZ1DGMPFEHBNL7CFSMFS": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.app": {
                        title: "Code review",
                        subTitle: "4442965",
                        info: ""
                    },
                    "sap.ui": { icons: {} },
                    "sap.flp": {
                        tileSize: "1x1",
                        target: { type: "URL", url: "https://sap.com" }
                    }
                }
            }
        });
        this.oCommonDataModelService.getApplications.resolves({
            "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:/UI2/FLP_AUTOTEST_CDM_BC_TEST:00O2TIH53H32NPIKF5YWFOUHP": {
                "sap.app": {
                    id: "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:/UI2/FLP_AUTOTEST_CDM_BC_TEST:00O2TIH53H32NPIKF5YWFOUHP",
                    title: "App Navigation Sample 1"
                },
                "sap.ui5": {},
                "sap.ui": {},
                "sap.platform.runtime": {}
            }
        });
        this.oCommonDataModelService.getCachedVizTypes.resolves({
            "sap.ushell.StaticAppLauncher": {
                _version: "1.0.0",
                "sap.flp": {},
                "sap.app": {},
                "sap.ui5": {},
                "sap.ui": {}
            }
        });

        const oExpectedPagesModel = {
            pages: [{ id: "ZTEST" }]
        };
        const oExpectedPage = {
            identification: { id: "Z_TEST_PAGE", title: "Page to test" },
            payload: {}
        };
        const oExpectedVisualizations = {
            "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:/UI2/LIMBACHS:3WO90XZ1DGMPFEHBNL7CFSMFS": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.app": {
                        title: "Code review",
                        subTitle: "4442965",
                        info: ""
                    },
                    "sap.ui": { icons: {} },
                    "sap.flp": {
                        tileSize: "1x1",
                        target: { type: "URL", url: "https://sap.com" }
                    }
                }
            }
        };
        const oExpectedApplications = {
            "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:/UI2/FLP_AUTOTEST_CDM_BC_TEST:00O2TIH53H32NPIKF5YWFOUHP": {
                "sap.app": {
                    id: "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:/UI2/FLP_AUTOTEST_CDM_BC_TEST:00O2TIH53H32NPIKF5YWFOUHP",
                    title: "App Navigation Sample 1"
                },
                "sap.ui5": {},
                "sap.ui": {},
                "sap.platform.runtime": {}
            }
        };

        const oExpectedVizTypes = {
            "sap.ushell.StaticAppLauncher": {
                _version: "1.0.0",
                "sap.flp": {},
                "sap.app": {},
                "sap.ui5": {},
                "sap.ui": {}
            }
        };

        // Act
        const oPromise = this.oPagesService.loadPage("ZTEST");

        // Assert
        return oPromise.then((sPath) => {
            assert.deepEqual(this.oGetModelForPageStub.firstCall.args,
                [oExpectedPage, oExpectedVisualizations, oExpectedApplications, oExpectedVizTypes],
                "_getModelForPage was called with the required parameters"
            );
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedPagesModel, "page was successfully added to the model");
            assert.strictEqual(sPath, "/pages/0", "the correct JSON Model path to the newly inserted page is returned");
        });
    });

    QUnit.test("Returns the JSON Model path without loading the page if it already exists in the model", function (assert) {
        // Arrange
        this.oGetPagePath.returns("/pages/0");

        // Act
        const oPromise = this.oPagesService.loadPage("AlreadyExistingPage");

        // Assert
        return oPromise.then((sPath) => {
            assert.strictEqual(sPath, "/pages/0", "the correct JSON Model path to the already existing page is returned");
        });
    });

    QUnit.module("loadPages", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();
            this.oCommonDataModelService = {
                getPages: sandbox.stub()
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);
            this.oLoadPageStub = sandbox.stub(this.oPagesService, "loadPage");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Loads the requested pages and returns their paths in the model", function (assert) {
        // Arrange
        const aPageIds = ["page1", "page2"];
        this.oCommonDataModelService.getPages.withArgs(aPageIds).resolves();
        this.oLoadPageStub.withArgs(aPageIds[0]).resolves("/pages/0");
        this.oLoadPageStub.withArgs(aPageIds[1]).resolves("/pages/1");
        const oExpectedPagePaths = {
            page1: "/pages/0",
            page2: "/pages/1"
        };

        // Act
        return this.oPagesService.loadPages(["page1", "page2"])
            .then((oPagePaths) => {
                // Assert
                assert.deepEqual(oPagePaths, oExpectedPagePaths, "the correct JSON Model paths to the pages in the page model are returned");
            });
    });

    QUnit.module("findVisualization", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(),
                getCachedVisualizations: sandbox.stub().resolves(),
                getApplications: sandbox.stub().resolves()
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            const oPageMock = {
                id: "page1",
                sections: [{
                    id: "sectionId_0",
                    visualizations: [
                        { id: "id_1", vizId: "vizId_1" },
                        { id: "id_2", vizId: "vizId_2" }
                    ]
                }, {
                    id: "sectionId_1",
                    visualizations: [
                        { id: "id_3", vizId: "vizId_2" },
                        { id: "id_4", vizId: "vizId_3" }
                    ]
                }, {
                    id: "sectionId_2",
                    visualizations: [
                        { id: "id_5", vizId: "vizId_1" },
                        { id: "id_6", vizId: "vizId_2" },
                        { id: "id_7", vizId: "vizId_3" },
                        { id: "id_8", vizId: "vizId_1" },
                        { id: "id_9", vizId: "vizId_2" },
                        { id: "id_10", vizId: "vizId_3" }
                    ]
                }]
            };

            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/pages/0", oPageMock);
            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("returns the proper Visualization location when called with a correct PageId and VizId", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const sVizId = "vizId_2";
        const sPageId = "page1";
        const aExpectedVisualizationLocations = [
            { pageId: sPageId, sectionIndex: 0, vizIndexes: [1] },
            { pageId: sPageId, sectionIndex: 1, vizIndexes: [0] },
            { pageId: sPageId, sectionIndex: 2, vizIndexes: [1, 4] }
        ];

        // Act
        this.oPagesService.findVisualization(sPageId, null, sVizId).then((aVisualizationLocations) => {
            // Assert
            assert.deepEqual(aVisualizationLocations, aExpectedVisualizationLocations, "Call returned the expected value");

            fnDone();
        });
    });

    QUnit.test("findVisualization in section by vizId", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const sVizId = "vizId_2";
        const sPageId = "page1";
        const sSectionId = "sectionId_1";
        const aExpectedVisualizationLocations = [
            { pageId: sPageId, sectionIndex: 1, vizIndexes: [0] }
        ];

        // Act
        this.oPagesService.findVisualization(sPageId, sSectionId, sVizId).then((aVisualizationLocations) => {
            // Assert
            assert.deepEqual(aVisualizationLocations, aExpectedVisualizationLocations, "Call returned the expected value");

            fnDone();
        });
    });

    QUnit.test("findVisualization in section when several same visualization", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const sVizId = "vizId_3";
        const sPageId = "page1";
        const sSectionId = "sectionId_2";
        const aExpectedVisualizationLocations = [
            { pageId: sPageId, sectionIndex: 2, vizIndexes: [2, 5] }
        ];

        // Act
        this.oPagesService.findVisualization(sPageId, sSectionId, sVizId).then((aVisualizationLocations) => {
            // Assert
            assert.deepEqual(aVisualizationLocations, aExpectedVisualizationLocations, "Call returned the expected value");

            fnDone();
        });
    });

    QUnit.test("returns the proper Visualization location when called with a correct PageId and VizRefId", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const sVizRefId = "id_7";
        const sPageId = "page1";
        const aExpectedVisualizationLocations = [
            { pageId: sPageId, sectionIndex: 2, vizIndexes: [2] }
        ];

        // Act
        this.oPagesService.findVisualization(sPageId, null, null, sVizRefId).then((aVisualizationLocations) => {
            // Assert
            assert.deepEqual(aVisualizationLocations, aExpectedVisualizationLocations, "Call returned the expected value");

            fnDone();
        });
    });

    QUnit.test("findVisualization in section by vizRefId", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const sVizRefId = "id_4";
        const sPageId = "page1";
        const sSectionId = "sectionId_1";
        const aExpectedVisualizationLocations = [
            { pageId: sPageId, sectionIndex: 1, vizIndexes: [1] }
        ];

        // Act
        this.oPagesService.findVisualization(sPageId, sSectionId, null, sVizRefId).then((aVisualizationLocations) => {
            // Assert
            assert.deepEqual(aVisualizationLocations, aExpectedVisualizationLocations, "Call returned the expected value");

            fnDone();
        });
    });

    QUnit.test("doesn't find anything if both vizId and vizRefId are not defined", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const sPageId = "page1";
        const aExpectedVisualizationLocations = [];

        // Act
        this.oPagesService.findVisualization(sPageId, null, null, null).then((aVisualizationLocations) => {
            // Assert
            assert.deepEqual(aVisualizationLocations, aExpectedVisualizationLocations, "Call returned the expected value");

            fnDone();
        });
    });

    QUnit.test("Rejects the Promise and logs the correct error message when the CDM service is not retrievable", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - findVisualization: Personalization cannot be saved: CDM Service cannot be retrieved.";
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.findVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "findVisualization rejected with the expected error");
            });
    });

    QUnit.test("Rejects the Promise and logs the correct error message when loadPage fails", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - findVisualization: Couldn't load page, get visualizations or applications.";
        sandbox.stub(this.oPagesService, "loadPage").rejects(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.findVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "findVisualization rejected with the expected error");
            });
    });

    QUnit.test("Rejects the Promise and logs the correct error message when getCachedVisualizations fails", function (assert) {
        // Arrange
        sandbox.stub(this.oPagesService, "loadPage");
        this.aExpectedLogErrorArgs[0] = "Pages - findVisualization: Couldn't load page, get visualizations or applications.";
        this.oCommonDataModelService.getCachedVisualizations.rejects(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.findVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "findVisualization rejected with the expected error");
            });
    });

    QUnit.test("Rejects the Promise and logs the correct error message when getApplications fails", function (assert) {
        // Arrange
        sandbox.stub(this.oPagesService, "loadPage");
        this.aExpectedLogErrorArgs[0] = "Pages - findVisualization: Couldn't load page, get visualizations or applications.";
        this.oCommonDataModelService.getApplications.rejects(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.findVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "findVisualization rejected with the expected error");
            });
    });

    QUnit.module("moveVisualization", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oCDM31Page = {
                identification: { id: "page-0", title: "Page 0" },
                payload: {
                    layout: { sectionOrder: ["section-0", "section-1"] },
                    sections: {
                        "section-0": {
                            id: "section-0",
                            title: "Section 0",
                            layout: { vizOrder: ["viz-0", "viz-1", "viz-2", "viz-3"] },
                            viz: {
                                "viz-0": { id: "viz-0", vizId: "vizId-0" },
                                "viz-1": { id: "viz-1", vizId: "vizId-1" },
                                "viz-2": { id: "viz-2", vizId: "vizId-2" },
                                "viz-3": { id: "viz-3", vizId: "vizId-3" }
                            }
                        },
                        "section-1": {
                            id: "section-1",
                            title: "Section 1",
                            layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                            viz: {
                                "viz-A": { id: "viz-A", vizId: "vizId-A" },
                                "viz-B": { id: "viz-B", vizId: "vizId-B" },
                                "viz-C": { id: "viz-C", vizId: "vizId-C" },
                                "viz-D": { id: "viz-D", vizId: "vizId-D" }
                            }
                        }
                    }
                }
            };
            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oCDM31Page)
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);

            this.oMockModel = {
                pages: [{
                    id: "page-1",
                    sections: [{
                        id: "section-0",
                        title: "Section 0",
                        visualizations: [
                            { id: "viz-0" },
                            { id: "viz-1" },
                            { id: "viz-2" },
                            { id: "viz-3" }
                        ]
                    }, {
                        id: "section-1",
                        title: "Section 1",
                        visualizations: [
                            { id: "viz-A" },
                            { id: "viz-B" },
                            { id: "viz-C" },
                            { id: "viz-D" }
                        ]
                    }]
                }]
            };

            this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Does nothing if visualization is moved on itself", function (assert) {
        const oExpectedValue = {
            visualizationIndex: 0
        };
        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 0, 0).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 0, "Model was not refreshed");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), this.oMockModel, "the model was not manipulated");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 0, "setPersonalizationActive was not called");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 0, "savePersonalization was not called");
        });
    });

    QUnit.test("Moves visualization on the section it is already in", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-1" },
                        { id: "viz-2" },
                        { id: "viz-3" },
                        { id: "viz-0" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-C" },
                        { id: "viz-D" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-1", "viz-2", "viz-3", "viz-0"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 3
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 0, -1).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Moves visualization to the end of a section with filtered visualizations", function (assert) {
        // Arrange
        const oCDM31PageWithHiddenViz = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-0", "viz-0-1", "viz-0-2", "viz-0-3", "viz-1", "viz-2", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-0-1": { id: "viz-0-1", vizId: "vizId-0-1" },
                            "viz-0-2": { id: "viz-0-2", vizId: "vizId-0-2" },
                            "viz-0-3": { id: "viz-0-3", vizId: "vizId-0-3" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };

        this.oCommonDataModelService.getPage.resolves(oCDM31PageWithHiddenViz);

        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-1" },
                        { id: "viz-2" },
                        { id: "viz-3" },
                        { id: "viz-0" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-C" },
                        { id: "viz-D" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-0-1", "viz-0-2", "viz-0-3", "viz-1", "viz-2", "viz-3", "viz-0"] },
                        viz: {
                            "viz-0-1": { id: "viz-0-1", vizId: "vizId-0-1" },
                            "viz-0-2": { id: "viz-0-2", vizId: "vizId-0-2" },
                            "viz-0-3": { id: "viz-0-3", vizId: "vizId-0-3" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" },
                            "viz-0": { id: "viz-0", vizId: "vizId-0" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 4
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 0, 4).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(oCDM31PageWithHiddenViz, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Moves visualization to the middle of a section with filtered visualizations", function (assert) {
        // Arrange
        const oCDM31PageWithHiddenViz = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-0", "viz-1", "viz-1-1", "viz-1-2", "viz-1-3", "viz-2", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-1-1": { id: "viz-1-1", vizId: "vizId-1-1" },
                            "viz-1-2": { id: "viz-1-2", vizId: "vizId-1-2" },
                            "viz-1-3": { id: "viz-1-3", vizId: "vizId-1-3" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };

        this.oCommonDataModelService.getPage.resolves(oCDM31PageWithHiddenViz);

        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-0" },
                        { id: "viz-2" },
                        { id: "viz-1" },
                        { id: "viz-3" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-C" },
                        { id: "viz-D" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-0", "viz-1-1", "viz-1-2", "viz-1-3", "viz-2", "viz-1", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-1-1": { id: "viz-1-1", vizId: "vizId-1-1" },
                            "viz-1-2": { id: "viz-1-2", vizId: "vizId-1-2" },
                            "viz-1-3": { id: "viz-1-3", vizId: "vizId-1-3" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 2
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 1, 0, 2).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(oCDM31PageWithHiddenViz, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Moves visualization on a section it is not in", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-1" },
                        { id: "viz-2" },
                        { id: "viz-3" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-C" },
                        { id: "viz-D" },
                        { id: "viz-0" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-1", "viz-2", "viz-3"] },
                        viz: {
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D", "viz-0"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" },
                            "viz-0": { id: "viz-0", vizId: "vizId-0" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 4
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 1, -1).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Moves visualization to the right inside same section", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-1" },
                        { id: "viz-2" },
                        { id: "viz-3" },
                        { id: "viz-0" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-C" },
                        { id: "viz-D" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-1", "viz-2", "viz-3", "viz-0"] },
                        viz: {
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" },
                            "viz-0": { id: "viz-0", vizId: "vizId-0" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 4
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 0, 4).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Moves visualization to the left inside same section", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-0" },
                        { id: "viz-2" },
                        { id: "viz-1" },
                        { id: "viz-3" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-C" },
                        { id: "viz-D" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-0", "viz-2", "viz-1", "viz-3"] },
                        viz: {
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" },
                            "viz-0": { id: "viz-0", vizId: "vizId-0" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 1
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 2, 0, 1).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Moves visualization in another section", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-0",
                    title: "Section 0",
                    visualizations: [
                        { id: "viz-1" },
                        { id: "viz-2" },
                        { id: "viz-3" }
                    ]
                }, {
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [
                        { id: "viz-A" },
                        { id: "viz-B" },
                        { id: "viz-0" },
                        { id: "viz-C" },
                        { id: "viz-D" }
                    ]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-0", "section-1"] },
                sections: {
                    "section-0": {
                        id: "section-0",
                        title: "Section 0",
                        layout: { vizOrder: ["viz-1", "viz-2", "viz-3"] },
                        viz: {
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "vizId-2" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    },
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-A", "viz-B", "viz-0", "viz-C", "viz-D"] },
                        viz: {
                            "viz-A": { id: "viz-A", vizId: "vizId-A" },
                            "viz-B": { id: "viz-B", vizId: "vizId-B" },
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-C": { id: "viz-C", vizId: "vizId-C" },
                            "viz-D": { id: "viz-D", vizId: "vizId-D" }
                        }
                    }
                }
            }
        };
        const oExpectedValue = {
            visualizationIndex: 2
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 1, 2).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedValue, "Resolved the correct object");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Updates the reference of the affected sections", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections/2", {
            id: "section-2",
            title: "Section 2",
            visualizations: []
        });
        const oOldSection0VizRef = this.oPagesService.getModel().getProperty("/pages/0/sections/0/visualizations");
        const oOldSection1VizRef = this.oPagesService.getModel().getProperty("/pages/0/sections/1/visualizations");
        const oOldSection2VizRef = this.oPagesService.getModel().getProperty("/pages/0/sections/2/visualizations");

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 1, 2).then(() => {
            // Assert
            const oNewSection0VizRef = this.oPagesService.getModel().getProperty("/pages/0/sections/0/visualizations");
            const oNewSection1VizRef = this.oPagesService.getModel().getProperty("/pages/0/sections/1/visualizations");
            const oNewSection2VizRef = this.oPagesService.getModel().getProperty("/pages/0/sections/2/visualizations");

            assert.notStrictEqual(oOldSection0VizRef, oNewSection0VizRef, "Updated the section reference");
            assert.notStrictEqual(oOldSection1VizRef, oNewSection1VizRef, "Updated the section reference");
            assert.strictEqual(oOldSection2VizRef, oNewSection2VizRef, "Did not update the section reference");
        });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when the CDM Service is unavailable", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - moveVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.moveVisualization(0, 0, 0, 1, 2)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "moveVisualization rejected with the expected error");
                assert.ok(this.oSetPersonalizationActiveStub.calledTwice, "setPersonalizationActive was called twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalization was called with the expected argument the first time");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalization was called with the expected argument the second time");
            });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when the page cannot be loaded", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - moveVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.moveVisualization(0, 0, 0, 1, 2)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "moveVisualization rejected with the expected error");
                assert.ok(this.oSetPersonalizationActiveStub.calledTwice, "setPersonalizationActive was called twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalization was called with the expected argument the first time");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalization was called with the expected argument the second time");
            });
    });

    QUnit.module("Default Section", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oCDM31Page = {
                identification: { id: "page-0", title: "Page 0" },
                payload: {
                    layout: { sectionOrder: ["section-0", "section-1"] },
                    sections: {
                        "section-0": {
                            id: "section-0",
                            title: "Section 0",
                            default: "true",
                            layout: { vizOrder: ["viz-0"] },
                            viz: {
                                "viz-0": { id: "viz-0", vizId: "vizId-0" }
                            }
                        },
                        "section-1": {
                            id: "section-1",
                            title: "Section 1",
                            layout: { vizOrder: [] },
                            viz: {}
                        }
                    }
                }
            };
            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oCDM31Page)
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);

            this.oMockModel = {
                pages: [{
                    id: "page-1",
                    sections: [{
                        id: "section-0",
                        title: "Section 0",
                        default: "true",
                        visualizations: [{ id: "viz-0" }]
                    }, {
                        id: "section-1",
                        title: "Section 1",
                        visualizations: []
                    }]
                }]
            };

            this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Move last visualization from the default section deletes the section", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-1",
                    title: "Section 1",
                    visualizations: [{ id: "viz-0" }]
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-0"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" }
                        }
                    }
                }
            }
        };

        // Act
        return this.oPagesService.moveVisualization(0, 0, 0, 1, 0).then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.test("Delete last visualization deletes the default section", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-1",
                    title: "Section 1",
                    visualizations: []
                }]
            }]
        };

        const oExpectedPage = {
            identification: { id: "page-0", title: "Page 0" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: [] },
                        viz: {}
                    }
                }
            }
        };

        // Act
        return this.oPagesService.deleteVisualization(0, 0, 0).then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedPage, "The visualization is moved correctly in the page object");
            assert.ok(this.oCommonDataModelService.getPage.calledOnce, "The function 'getPage' of the CDM service is called once");
            assert.deepEqual(this.oCommonDataModelService.getPage.firstCall.args, ["page-1"], "The function 'getPage' of the CDM service is called with the correct page id");
        });
    });

    QUnit.module("setPersonalizationActive", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();
            this.oMockModel = { "Some property": "Some value" };
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("sets the dirty state to \"true\" and clones the model if called with true and the state was not already true", function (assert) {
        // Arrange
        // Act
        this.oPagesService.setPersonalizationActive(true);
        // Assert
        assert.deepEqual(this.oPagesService._oCopiedModelData, this.oMockModel, "The model was copied as expected");
        assert.strictEqual(this.oPagesService._bDirtyState, true, "The dirty state was set to true");
    });

    QUnit.test("sets the dirty state to \"false\" and overwrites the personalized model data with the original model data if called with false and the dirty state was true", function (assert) {
        // Arrange
        const oModelMock = {
            SomeOriginalProperty: "AndItsValue"
        };
        this.oPagesService._oCopiedModelData = oModelMock;
        this.oPagesService._bDirtyState = true;
        // Act
        this.oPagesService.setPersonalizationActive(false);
        // Assert
        assert.deepEqual(this.oPagesService.getModel().getData(), oModelMock, "The model was copied as expected");
        assert.strictEqual(this.oPagesService._bDirtyState, false, "The dirty state was set to true");
    });

    QUnit.test("does nothing if called with true when the dirty state was already true", function (assert) {
        // Arrange
        const oModelGetPropertySpy = sinon.spy(this.oPagesService.getModel(), "getProperty");
        const oModelSetDataSpy = sinon.spy(this.oPagesService.getModel(), "_setData");
        this.oPagesService._bDirtyState = true;
        // Act
        this.oPagesService.setPersonalizationActive(true);
        // Assert
        assert.ok(oModelGetPropertySpy.notCalled, "getProperty of the model was not called");
        assert.ok(oModelSetDataSpy.notCalled, "_setData of the model was not called");
    });

    QUnit.test("does nothing if called with false when the dirty state was already false", function (assert) {
        // Arrange
        const oModelGetPropertySpy = sinon.spy(this.oPagesService.getModel(), "getProperty");
        const oModelSetDataSpy = sinon.spy(this.oPagesService.getModel(), "_setData");
        this.oPagesService._bDirtyState = false;
        // Act
        this.oPagesService.setPersonalizationActive(false);
        // Assert
        assert.ok(oModelGetPropertySpy.notCalled, "getProperty of the model was not called");
        assert.ok(oModelSetDataSpy.notCalled, "_setData of the model was not called");
    });

    QUnit.module("savePersonalization", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();
            this.oCommonDataModelService = {
                save: sandbox.stub().returns(new jQuery.Deferred().resolve())
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);
            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Called with dirty state equals true", function (assert) {
        // Arrange
        this.oPagesService._bDirtyState = true;

        // Act
        return this.oPagesService.savePersonalization("page1").then(() => {
            // Assert
            assert.strictEqual(this.oPagesService._bDirtyState, false, "bDirtyState was set to false");
            assert.ok(this.oCommonDataModelService.save.calledOnce, "the method save of cdm service was called once");
            assert.deepEqual(this.oCommonDataModelService.save.firstCall.args, ["page1"], "the method save of cdm service was called with right parameters");
        });
    });

    QUnit.test("Rejects the promise and logs the correct error when the CDM Service cannot be retrieved", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - savePersonalization: Personalization cannot be saved: CDM Service cannot be retrieved or the save process encountered an error.";
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.savePersonalization("page1")
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "savePersonalization rejected with the expected error");
            });
    });

    QUnit.test("Rejects the promise, resets the pages to be saved and logs the correct error when save rejects", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - savePersonalization: Personalization cannot be saved: CDM Service cannot be retrieved or the save process encountered an error.";
        this.oCommonDataModelService.save.withArgs("page1").returns(new jQuery.Deferred().reject(this.oTestError));
        // Act
        // Assert
        return this.oPagesService.savePersonalization("page1")
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "savePersonalization rejected with the expected error");
                assert.deepEqual(this.oPagesService._aPagesToBeSaved, ["page1"], "_aPagesToBeSaved was cleared");
            });
    });

    QUnit.test("Saves all unsaved pages if no parameter was provided", function (assert) {
        // Arrange
        this.oPagesService._aPagesToBeSaved = ["page1", "page2"];
        // Act
        return this.oPagesService.savePersonalization().then(() => {
            // Assert
            assert.deepEqual(this.oCommonDataModelService.save.getCall(0).args, ["page1"], "save was called the first time with correct args");
            assert.deepEqual(this.oCommonDataModelService.save.getCall(1).args, ["page2"], "save was called the second time with correct args");
            assert.deepEqual(this.oPagesService._aPagesToBeSaved, [], "_aPagesToBeSaved was cleared");
        });
    });

    QUnit.test("Manages the unsaved pages correctly if no parameter was provided and a save error occurs", function (assert) {
        // Arrange
        this.oPagesService._aPagesToBeSaved = ["page1", "page2"];
        this.oCommonDataModelService.save.withArgs("page1").returns(new jQuery.Deferred().reject(new Error("Failed intentionally")));
        // Act
        // Assert
        return this.oPagesService.savePersonalization()
            .catch(() => {
                assert.deepEqual(this.oPagesService._aPagesToBeSaved, ["page1"], "page1 is still unsaved");
            });
    });

    QUnit.test("Handles personalization during save correctly", function (assert) {
        // Arrange
        this.oCommonDataModelService.save.withArgs(sinon.match.any).callsFake((sPageId) => {
            if (sPageId === "page1") {
                // Do personalization on page1 during save of page1
                this.oPagesService._aPagesToBeSaved.push("page1");
            }
            return new jQuery.Deferred().resolve();
        });

        // Personalization happened on two different pages
        this.oPagesService._aPagesToBeSaved = ["page1", "page2"];

        // Act
        // Personalization should be saved
        return this.oPagesService.savePersonalization()
            .then(() => {
                assert.deepEqual(this.oPagesService._aPagesToBeSaved, ["page1"]);
            });
    });

    QUnit.module("_conditionalSavePersonalization", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();

            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oSavePersonalizationStub.resolves();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("calls savePersonalization if implicit save is enabled", function (assert) {
        // Arrange
        const sPageId = "page1";
        // Act
        return this.oPagesService._conditionalSavePersonalization(sPageId)
            .then(() => {
                // Assert
                assert.deepEqual(this.oSavePersonalizationStub.getCall(0).args, [sPageId], "savePersonalization was called with correct args");
                assert.deepEqual(this.oPagesService._aPagesToBeSaved, [], "no page was added into the array");
            });
    });

    QUnit.test("Adds page to array if implicit save is disabled", function (assert) {
        // Arrange
        const sPageId = "page1";
        this.oPagesService._bImplicitSaveEnabled = false;

        // Act
        return this.oPagesService._conditionalSavePersonalization(sPageId)
            .then(() => {
                // Assert
                assert.deepEqual(this.oSavePersonalizationStub.callCount, 0, "savePersonalization was not called");
                assert.deepEqual(this.oPagesService._aPagesToBeSaved, [sPageId], "the page was added into the array");
            });
    });

    QUnit.module("_getModelForPage", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oGetSystemContextStub = sandbox.stub().resolves();
            this.oClientSideTargetResolutionService = {
                id: "ClientSideTargetResolution",
                getSystemContext: this.oGetSystemContextStub
            };
            this.oGetServiceAsyncStub.withArgs("ClientSideTargetResolution").resolves(this.oClientSideTargetResolutionService);

            this.oUrlParsingStub = sandbox.stub(urlParsing, "constructShellHash").returns("");

            this.oWarningStub = sandbox.stub(Log, "warning");

            this.oPagesService = new Pages();
            this.oIsIntentSupportedStub = sandbox.stub(this.oPagesService, "_isIntentSupported");
            this.oIsIntentSupportedStub.withArgs(sinon.match.any, this.oClientSideTargetResolutionService).resolves(true);
            this.oConfigLastStub = sandbox.stub(Config, "last").withArgs("/core/catalog/enableHideGroups").returns(true);
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Returns the correct JSON Model structure for a given CDM 3.1 page", function (assert) {
        // Arrange
        const oPage = {
            identification: { id: "page1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["sec2", "sec1"] },
                sections: {
                    sec1: {
                        id: "sec1",
                        title: "Section 1",
                        visible: true,
                        locked: false,
                        preset: true,
                        default: false,
                        layout: { vizOrder: ["1", "3", "4", "2"] },
                        viz: {
                            1: {
                                id: "1",
                                vizId: "Bank-manage"
                            },
                            2: {
                                id: "2",
                                vizId: "Bank-manage-1"
                            },
                            3: {
                                id: "3",
                                vizId: "Bank-manage-1",
                                title: "Title of viz reference 3",
                                info: "Info of viz reference 3"
                            },
                            4: {
                                id: "4",
                                vizId: "Bank-manage",
                                title: "Title of viz reference 4",
                                subTitle: "Sub title of viz reference 4",
                                icon: "sap-icon://add",
                                displayFormatHint: DisplayFormat.Flat
                            }
                        }
                    },
                    sec2: {
                        id: "sec2",
                        title: "Section 2",
                        visible: false,
                        locked: true,
                        preset: false,
                        default: true,
                        layout: { vizOrder: ["5"] },
                        viz: {
                            5: { id: "5", vizId: "Bank-manage" }
                        }
                    }
                }
            }
        };
        const oVisualizations = {
            "Bank-manage": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.flp": {
                        target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                    }
                }
            },
            "Bank-manage-1": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.app": { subTitle: "Simple Mode" },
                    "sap.ui": { icons: { icon: "sap-icon://building" } },
                    "sap.flp": {
                        target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                    }
                }
            }
        };
        const oApplications = {
            "fin.cash.bankmaster.manage": {
                "sap.app": {
                    id: "fin.cash.bankmaster.manage",
                    applicationVersion: { version: "1.0.0" },
                    title: "Manage Banks",
                    subTitle: "S/4",
                    info: "desktop only",
                    ach: "FIN-FSCM-CLM-BAM",
                    crossNavigation: {
                        inbounds: {
                            "BankAccount-manageBank": {
                                title: "Bank Account",
                                subTitle: "Manage Bank",
                                semanticObject: "BankAccount",
                                action: "manageBank",
                                signature: {
                                    parameters: {},
                                    additionalParameters: "allowed"
                                }
                            }
                        }
                    },
                    contentProviderId: "contentProviderId"
                }
            }
        };
        const oVizTypes = {
            "sap.ushell.StaticAppLauncher": {
                _version: "1.0.0",
                "sap.flp": {
                    vizOptions: {
                        displayFormats: {
                            supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                            default: DisplayFormat.Compact
                        }
                    }
                }
            }
        };

        const oExpectedModel = {
            id: "page1",
            title: "Page 1",
            description: "",
            sections: [{
                id: "sec2",
                title: resources.i18n.getText("DefaultSection.Title"),
                visible: false,
                locked: true,
                preset: false,
                default: true,
                visualizations: [{
                    id: "5",
                    vizId: "Bank-manage",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        }
                    },
                    title: "Bank Account",
                    subtitle: "Manage Bank",
                    icon: "",
                    numberUnit: undefined,
                    keywords: [],
                    info: "desktop only",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    contentProviderId: "contentProviderId",
                    indicatorDataSource: undefined,
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }]
            }, {
                id: "sec1",
                title: "Section 1",
                visible: true,
                locked: false,
                preset: true,
                default: false,
                visualizations: [{
                    id: "1",
                    vizId: "Bank-manage",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        }
                    },
                    title: "Bank Account",
                    subtitle: "Manage Bank",
                    icon: "",
                    numberUnit: undefined,
                    keywords: [],
                    info: "desktop only",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }, {
                    id: "3",
                    vizId: "Bank-manage-1",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.app": {
                            subTitle: "Simple Mode"
                        },
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        },
                        "sap.ui": { icons: { icon: "sap-icon://building" } }
                    },
                    title: "Title of viz reference 3",
                    subtitle: "Simple Mode",
                    icon: "sap-icon://building",
                    numberUnit: undefined,
                    keywords: [],
                    info: "Info of viz reference 3",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }, {
                    id: "4",
                    vizId: "Bank-manage",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        }
                    },
                    title: "Title of viz reference 4",
                    subtitle: "Sub title of viz reference 4",
                    icon: "sap-icon://add",
                    numberUnit: undefined,
                    keywords: [],
                    info: "desktop only",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Flat,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }, {
                    id: "2",
                    vizId: "Bank-manage-1",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.app": {
                            subTitle: "Simple Mode"
                        },
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        },
                        "sap.ui": { icons: { icon: "sap-icon://building" } }
                    },
                    title: "Bank Account",
                    subtitle: "Simple Mode",
                    icon: "sap-icon://building",
                    numberUnit: undefined,
                    keywords: [],
                    info: "desktop only",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }]
            }]
        };

        // Act
        return this.oPagesService._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes).then((oModel) => {
            // Assert
            assert.deepEqual(oModel, oExpectedModel, "The returned object has all the required data and is in the right order.");
            // test explicitly for the translation of the default section; language is set in Pages.qunit.html
            assert.strictEqual(
                oModel.sections[0].title,
                "Recently Added Apps",
                "The title of the default section was translated."
            );
        });
    });

    QUnit.test("Returns the correct JSON Model structure with 'visible === true' for all sections when 'enableHideGroups === false'", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/catalog/enableHideGroups").returns(false);
        const oPage = {
            identification: { id: "page1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["sec2", "sec1"] },
                sections: {
                    sec1: {
                        id: "sec1",
                        title: "Section 1",
                        visible: true,
                        locked: false,
                        preset: true,
                        default: false,
                        layout: { vizOrder: ["1", "3", "4", "2"] },
                        viz: {
                            1: {
                                id: "1",
                                vizId: "Bank-manage"
                            },
                            2: {
                                id: "2",
                                vizId: "Bank-manage-1"
                            },
                            3: {
                                id: "3",
                                vizId: "Bank-manage-1",
                                title: "Title of viz reference 3",
                                info: "Info of viz reference 3"
                            },
                            4: {
                                id: "4",
                                vizId: "Bank-manage",
                                title: "Title of viz reference 4",
                                subTitle: "Sub title of viz reference 4",
                                icon: "sap-icon://add",
                                displayFormatHint: DisplayFormat.FlatWide,
                                numberUnit: "EUR"
                            }
                        }
                    },
                    sec2: {
                        id: "sec2",
                        title: "Section 2",
                        visible: false,
                        locked: true,
                        preset: false,
                        default: true,
                        layout: { vizOrder: ["5"] },
                        viz: {
                            5: { id: "5", vizId: "Bank-manage" }
                        }
                    }
                }
            }
        };
        const oVisualizations = {
            "Bank-manage": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.flp": {
                        target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                    }
                }
            },
            "Bank-manage-1": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.app": { subTitle: "Simple Mode" },
                    "sap.ui": { icons: { icon: "sap-icon://building" } },
                    "sap.flp": {
                        target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                    }
                }
            }
        };
        const oApplications = {
            "fin.cash.bankmaster.manage": {
                "sap.app": {
                    id: "fin.cash.bankmaster.manage",
                    applicationVersion: { version: "1.0.0" },
                    title: "Manage Banks",
                    subTitle: "S/4",
                    info: "desktop only",
                    ach: "FIN-FSCM-CLM-BAM",
                    crossNavigation: {
                        inbounds: {
                            "BankAccount-manageBank": {
                                title: "Bank Account",
                                subTitle: "Manage Bank",
                                semanticObject: "BankAccount",
                                action: "manageBank",
                                signature: {
                                    parameters: {},
                                    additionalParameters: "allowed"
                                }
                            }
                        }
                    },
                    contentProviderId: "contentProviderId"
                }
            }
        };
        const oVizTypes = {
            "sap.ushell.StaticAppLauncher": {
                _version: "1.0.0",
                "sap.flp": {
                    vizOptions: {
                        displayFormats: {
                            supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                            default: DisplayFormat.Compact
                        }
                    }
                }
            }
        };

        const oExpectedModel = {
            id: "page1",
            title: "Page 1",
            description: "",
            sections: [{
                id: "sec2",
                title: resources.i18n.getText("DefaultSection.Title"),
                visible: true,
                locked: true,
                preset: false,
                default: true,
                visualizations: [{
                    id: "5",
                    vizId: "Bank-manage",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        }
                    },
                    title: "Bank Account",
                    subtitle: "Manage Bank",
                    icon: "",
                    keywords: [],
                    info: "desktop only",
                    numberUnit: undefined,
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }]
            }, {
                id: "sec1",
                title: "Section 1",
                visible: true,
                locked: false,
                preset: true,
                default: false,
                visualizations: [{
                    id: "1",
                    vizId: "Bank-manage",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        }
                    },
                    title: "Bank Account",
                    subtitle: "Manage Bank",
                    icon: "",
                    keywords: [],
                    info: "desktop only",
                    numberUnit: undefined,
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }, {
                    id: "3",
                    vizId: "Bank-manage-1",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.app": {
                            subTitle: "Simple Mode"
                        },
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        },
                        "sap.ui": { icons: { icon: "sap-icon://building" } }
                    },
                    title: "Title of viz reference 3",
                    subtitle: "Simple Mode",
                    icon: "sap-icon://building",
                    keywords: [],
                    info: "Info of viz reference 3",
                    numberUnit: undefined,
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }, {
                    id: "4",
                    vizId: "Bank-manage",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        }
                    },
                    title: "Title of viz reference 4",
                    subtitle: "Sub title of viz reference 4",
                    icon: "sap-icon://add",
                    keywords: [],
                    info: "desktop only",
                    numberUnit: "EUR",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.FlatWide,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }, {
                    id: "2",
                    vizId: "Bank-manage-1",
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.app": {
                            subTitle: "Simple Mode"
                        },
                        "sap.flp": {
                            target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                        },
                        "sap.ui": { icons: { icon: "sap-icon://building" } }
                    },
                    title: "Bank Account",
                    subtitle: "Simple Mode",
                    icon: "sap-icon://building",
                    numberUnit: undefined,
                    keywords: [],
                    info: "desktop only",
                    target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" },
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "contentProviderId",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: {
                            _version: "1.0.0",
                            "sap.flp": {
                                vizOptions: {
                                    displayFormats: {
                                        supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                                        default: DisplayFormat.Compact
                                    }
                                }
                            }
                        }
                    },
                    targetURL: "#",
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                    contentProviderLabel: undefined
                }]
            }]
        };

        // Act
        return this.oPagesService._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes).then((oModel) => {
            // Assert
            assert.deepEqual(oModel, oExpectedModel, "The returned object has all the required data and is in the right order.");
        });
    });

    QUnit.test("Returns a JSON Model structure with fallback data for properties which don't have any value", function (assert) {
        // Arrange
        const oPage = {
            identification: { id: "page1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["sec1"] },
                sections: {
                    sec1: {
                        id: "sec1",
                        title: "Section 1",
                        layout: { vizOrder: ["1"] },
                        viz: {
                            1: {
                                id: "1",
                                vizId: "Bank-manage",
                                displayFormatHint: DisplayFormat.Compact
                            }
                        }
                    }
                }
            }
        };
        const oVisualizations = { "Bank-manage": {} };
        const oApplications = {
            "fin.cash.bankmaster.manage": {
                "sap.app": {
                    id: "fin.cash.bankmaster.manage",
                    applicationVersion: { version: "1.0.0" },
                    ach: "FIN-FSCM-CLM-BAM",
                    crossNavigation: {}
                }
            }
        };
        const oVizTypes = {};

        const oExpectedModel = {
            id: "page1",
            title: "Page 1",
            description: "",
            sections: [{
                id: "sec1",
                locked: false,
                title: "Section 1",
                visible: true,
                default: false,
                preset: true,
                visualizations: [{
                    id: "1",
                    vizId: "Bank-manage",
                    vizType: "",
                    vizConfig: {},
                    title: "",
                    subtitle: "",
                    icon: "",
                    numberUnit: undefined,
                    keywords: [],
                    info: "",
                    target: {},
                    isBookmark: false,
                    indicatorDataSource: undefined,
                    contentProviderId: "",
                    _instantiationData: {
                        platform: "CDM",
                        vizType: undefined
                    },
                    targetURL: undefined,
                    displayFormatHint: DisplayFormat.Compact,
                    supportedDisplayFormats: [DisplayFormat.Standard, DisplayFormat.Compact],
                    contentProviderLabel: undefined
                }]
            }]
        };

        // Act
        return this.oPagesService._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes).then((oModel) => {
            // Assert
            assert.deepEqual(oModel, oExpectedModel, "The returned object is filled.");
        });
    });

    QUnit.test("Filters unsupported tiles out", function (assert) {
        // Arrange
        this.oIsIntentSupportedStub.withArgs(sinon.match.any, this.oClientSideTargetResolutionService).resolves(false);
        const oPage = {
            identification: { id: "page1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["sec1"] },
                sections: {
                    sec1: {
                        id: "sec1",
                        title: "Section 1",
                        layout: { vizOrder: ["1"] },
                        viz: {
                            1: { id: "1", vizId: "Bank-manage" }
                        }
                    }
                }
            }
        };
        const oVisualizations = {
            "Bank-manage": {
                title: "Manage Bank Account",
                targetURL: "#Bank-manage"
            }
        };
        const oApplications = {
            "fin.cash.bankmaster.manage": {
                "sap.app": {
                    id: "fin.cash.bankmaster.manage",
                    applicationVersion: { version: "1.0.0" },
                    ach: "FIN-FSCM-CLM-BAM",
                    crossNavigation: {}
                }
            }
        };
        const oVizTypes = {};

        const oExpectedModel = {
            id: "page1",
            title: "Page 1",
            description: "",
            sections: [{
                id: "sec1",
                locked: false,
                title: "Section 1",
                visible: true,
                default: false,
                preset: true,
                visualizations: []
            }]
        };

        // Act
        return this.oPagesService._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes).then((oModel) => {
            // Assert
            assert.deepEqual(oModel, oExpectedModel, "The returned object is filled.");
            assert.strictEqual(this.oWarningStub.args[0][0], "The visualization with title '' and ID 'Bank-manage' is filtered out, because intent 'undefined' is not supported.",
                "Warning was called with correct parameters");
        });
    });

    QUnit.test("Keeps the correct tile order if asynchronous operations don't return in the exact order they were started", function (assert) {
        // Arrange
        this.oGetSystemContextStub.withArgs(undefined).resolves();
        this.oGetSystemContextStub.withArgs("S4BackendContentProvider").callsFake(async () => {
            // Simulate that resolving an external content provider takes just a little bit longer than the local content provider
            await Promise.resolve();
            await Promise.resolve();
        });

        const oPage = {
            identification: { id: "page1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["sec2", "sec1"] },
                sections: {
                    sec1: {
                        id: "sec1",
                        title: "Section 1",
                        visible: true,
                        locked: false,
                        preset: true,
                        default: false,
                        layout: { vizOrder: ["1", "3", "4", "2"] },
                        viz: {
                            1: {
                                id: "1",
                                vizId: "Bank-manage"
                            },
                            2: {
                                id: "2",
                                vizId: "Bank-manage"
                            },
                            3: {
                                id: "3",
                                vizId: "Bank-manage-2"
                            },
                            4: {
                                id: "4",
                                vizId: "Bank-manage"
                            }
                        }
                    },
                    sec2: {
                        id: "sec2",
                        title: "Section 2",
                        visible: false,
                        locked: true,
                        preset: false,
                        default: true,
                        layout: { vizOrder: ["5"] },
                        viz: {
                            5: { id: "5", vizId: "Bank-manage" }
                        }
                    }
                }
            }
        };
        const oVisualizations = {
            "Bank-manage": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.flp": {
                        target: { appId: "fin.cash.bankmaster.manage", inboundId: "BankAccount-manageBank" }
                    }
                }
            },
            "Bank-manage-2": {
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: {
                    "sap.flp": {
                        target: { appId: "fin.cash.bankmaster.manage2", inboundId: "BankAccount-manageBank2" }
                    }
                }
            }
        };
        const oApplications = {
            "fin.cash.bankmaster.manage": {
                "sap.app": {
                    id: "fin.cash.bankmaster.manage",
                    applicationVersion: { version: "1.0.0" },
                    title: "Manage Banks",
                    crossNavigation: {
                        inbounds: {
                            "BankAccount-manageBank": {
                                semanticObject: "BankAccount",
                                action: "manageBank",
                                signature: {
                                    parameters: {},
                                    additionalParameters: "allowed"
                                }
                            }
                        }
                    },
                    // no content provider ID -> local content provider
                    contentProviderId: undefined
                }
            },
            "fin.cash.bankmaster.manage2": {
                "sap.app": {
                    id: "fin.cash.bankmaster.manage2",
                    applicationVersion: { version: "1.0.0" },
                    title: "Manage Banks",
                    subTitle: "S/4",
                    info: "desktop only",
                    ach: "FIN-FSCM-CLM-BAM",
                    crossNavigation: {
                        inbounds: {
                            "BankAccount-manageBank2": {
                                semanticObject: "BankAccount",
                                action: "manageBank2",
                                signature: {
                                    parameters: {},
                                    additionalParameters: "allowed"
                                }
                            }
                        }
                    },
                    // actual content provider
                    contentProviderId: "S4BackendContentProvider"
                }
            }
        };
        const oVizTypes = {
            "sap.ushell.StaticAppLauncher": {
                _version: "1.0.0",
                "sap.flp": {
                    vizOptions: {
                        displayFormats: {
                            supported: [DisplayFormat.Standard, DisplayFormat.Compact, DisplayFormat.Flat, DisplayFormat.FlatWide],
                            default: DisplayFormat.Compact
                        }
                    }
                }
            }
        };

        // Act
        return this.oPagesService._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes).then((oModel) => {
            // Assert
            assert.strictEqual(oModel.sections[0].visualizations[0].id, "5", "The the visualization is in the right order.");
            assert.strictEqual(oModel.sections[1].visualizations[0].id, "1", "The the visualization is in the right order.");
            assert.strictEqual(oModel.sections[1].visualizations[1].id, "3", "The the visualization is in the right order.");
            assert.strictEqual(oModel.sections[1].visualizations[2].id, "4", "The the visualization is in the right order.");
            assert.strictEqual(oModel.sections[1].visualizations[3].id, "2", "The the visualization is in the right order.");
        });
    });

    QUnit.test("Rejects if CSTR is not available", function (assert) {
        const oExpectedError = new Error("service is not available");
        this.oPagesService._oCSTRServicePromise = Promise.reject(oExpectedError);
        return this.oPagesService._getModelForPage({}, {}, {}, {})
            .then(() => {
                // Assert
                assert.ok(false, "Promise should have been rejected");
            })
            .catch((oError) => {
                assert.ok(true, "Promise rejected");
                assert.strictEqual(oError, oExpectedError, "Returned the correct message");
            });
    });

    QUnit.module("removeUnsupportedVisualizations", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oClientSideTargetResolutionService = {
                isIntentSupported: sandbox.stub()
            };
            this.oGetServiceAsyncStub.withArgs("ClientSideTargetResolution").resolves(this.oClientSideTargetResolutionService);

            this.oPagesService = new Pages();

            const aSections = [
                { // Empty section
                    visualizations: []
                },
                { // Section with visualization that has no target
                    visualizations: [{}]
                },
                { // Section with visualization that has everything required
                    visualizations: [
                        { target: {}, targetURL: "someTargetUrl" }
                    ]
                },
                { // Section with visualization with target of type URL (empty)
                    visualizations: [
                        { target: { type: "URL", url: "" } }
                    ]
                },
                { // Section with visualization with target of type URL
                    visualizations: [
                        { target: { type: "URL", url: "someUrl" } }
                    ]
                },
                { // Section with multiple visualization
                    visualizations: [
                        { target: {}, targetURL: "someUnsupportedTarget" },
                        { target: {}, targetURL: "someOtherUnsupportedTarget" }
                    ]
                }
            ];

            this.oPagesService.getModel().getProperty("/pages").push({
                sections: aSections
            });

            this.oRefreshStub = sandbox.stub(this.oPagesService.getModel(), "refresh");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Section has no visualizations.", function (assert) {
        // Arrange

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 0).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [], "IsIntentSupported was not called, as no tiles need to be checked.");
            assert.deepEqual(this.oRefreshStub.args, [], "The model was not refreshed, as no visualization where removed.");
        });
    });

    QUnit.test("Visualization has no target.", function (assert) {
        // Arrange

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 1).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [], "IsIntentSupported was not called, as the tile in the section has no target.");
            assert.deepEqual(this.oRefreshStub.args, [[]], "The model was refreshed, as a visualization was removed.");
        });
    });

    QUnit.test("Visualization is supported.", function (assert) {
        // Arrange
        this.oClientSideTargetResolutionService.isIntentSupported.resolves({
            someTargetUrl: {
                supported: true
            }
        });

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 2).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [[["someTargetUrl"]]], "IsIntentSupported was called correctly.");
            assert.deepEqual(this.oRefreshStub.args, [], "The model was not refreshed, as no visualization was removed.");
        });
    });

    QUnit.test("Visualization is not supported.", function (assert) {
        // Arrange
        this.oClientSideTargetResolutionService.isIntentSupported.rejects(new Error("some error"));

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 2).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [[["someTargetUrl"]]], "IsIntentSupported was called correctly.");
            assert.deepEqual(this.oRefreshStub.args, [[]], "The model was refreshed, as a visualization was removed.");
        });
    });

    QUnit.test("Standard visualization has an empty URL as target type.", function (assert) {
        // Arrange
        sandbox.stub(readVisualizations, "isStandardVizType").returns(true);

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 3).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [], "IsIntentSupported was not called, as the target of the visualization is of type url.");
            assert.deepEqual(this.oRefreshStub.args, [[]], "The model was refreshed, as a visualization was removed.");
        });
    });

    QUnit.test("Standard visualization has a valid URL as target type.", function (assert) {
        // Arrange
        sandbox.stub(readVisualizations, "isStandardVizType").returns(true);

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 4).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [], "IsIntentSupported was not called, as the target of the visualization is of type url.");
            assert.deepEqual(this.oRefreshStub.args, [], "The model was not refreshed, as no visualization was removed.");
        });
    });

    QUnit.test("Custom visualization has an URL as target type.", function (assert) {
        // Arrange
        sandbox.stub(readVisualizations, "isStandardVizType").returns(false);

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 3).then(() => {
            // Assert
            assert.deepEqual(this.oClientSideTargetResolutionService.isIntentSupported.args, [], "IsIntentSupported was not called, as the target of the visualization is of type url.");
            assert.deepEqual(this.oRefreshStub.args, [], "The model was not refreshed, as no visualization was removed.");
        });
    });

    QUnit.test("Multiple visualizations have no intent.", function (assert) {
        // Arrange
        this.oClientSideTargetResolutionService.isIntentSupported.rejects(new Error("some error"));

        // Act
        return this.oPagesService.removeUnsupportedVisualizations(0, 5).then(() => {
            // Assert
            assert.deepEqual(
                this.oClientSideTargetResolutionService.isIntentSupported.args,
                [[["someOtherUnsupportedTarget"]], [["someUnsupportedTarget"]]],
                "IsIntentSupported was called correctly."
            );
            assert.deepEqual(this.oRefreshStub.args, [[]], "The model was refreshed correctly.");
        });
    });

    QUnit.module("_isIntentSupported", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oVizDataMock = {
                id: "vizData",
                target: {}
            };
            this.oIsIntentSupportedStub = sandbox.stub();
            this.oIsIntentSupportedStub.withArgs(["supportedIntent"]).resolves({
                supportedIntent: {
                    supported: true
                }
            });
            this.oIsIntentSupportedStub.withArgs(["notSupportedIntent"]).resolves({
                notSupportedIntent: {
                    supported: false
                }
            });
            this.oIsIntentSupportedStub.withArgs([undefined]).rejects(new Error("some error"));
            this.oClientSideTargetResolutionService = {
                isIntentSupported: this.oIsIntentSupportedStub
            };

            this.oIsStandardVizTypeStub = sandbox.stub(readVisualizations, "isStandardVizType").returns(true);

            this.oPagesService = new Pages();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Returns the correct result if the targetURL is supported", function (assert) {
        // Arrange
        const sHashResult = "supportedIntent";
        this.oVizDataMock.targetURL = sHashResult;
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, true, "Returned the correct result");
            });
    });

    QUnit.test("Returns the correct result if the targetURL is not supported", function (assert) {
        // Arrange
        const sHashResult = "notSupportedIntent";
        this.oVizDataMock.targetURL = sHashResult;
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, false, "Returned the correct result");
            });
    });

    QUnit.test("Returns the correct result if the targetURL is undefined", function (assert) {
        // Arrange
        let sHashResult;
        this.oVizDataMock.targetURL = sHashResult;
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, false, "Returned the correct result");
            });
    });

    QUnit.test("Resolves true if target is url", function (assert) {
        // Arrange
        this.oVizDataMock.target = {
            type: "URL",
            url: "some/Url"
        };
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, true, "Returned the correct result");
            });
    });

    QUnit.test("Resolves true if the vizType is not a standard viz type (custom tile)", function (assert) {
        // Arrange
        this.oIsStandardVizTypeStub.returns(false);
        this.oVizDataMock.target = {
            type: "URL"
        };
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, true, "Returned the correct result");
            });
    });

    QUnit.test("Resolves false if target is empty url", function (assert) {
        // Arrange
        this.oVizDataMock.target = {
            type: "URL",
            url: ""
        };
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, false, "Returned the correct result");
            });
    });

    QUnit.test("Resolves false if target is undefined", function (assert) {
        // Arrange
        delete this.oVizDataMock.target;
        // Act
        return this.oPagesService._isIntentSupported(this.oVizDataMock, this.oClientSideTargetResolutionService)
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, false, "Returned the correct result");
            });
    });

    QUnit.module("deleteVisualization", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oCommonDataModelService = {
                getPage: sandbox.stub()
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");

            this.oMockModel = {
                pages: [{
                    id: "page-1",
                    sections: [{
                        id: "section-1",
                        title: "First Section",
                        visualizations: [
                            { id: "viz-0", vizId: "vizId-0" },
                            { id: "viz-1", vizId: "vizId-1" },
                            { id: "viz-2", vizId: "" },
                            { id: "viz-3", vizId: "vizId-3" }
                        ]
                    }]
                }]
            };

            this.oCDMPage = {
                identification: { id: "page-1", title: "Page 1" },
                payload: {
                    layout: { sectionOrder: ["section-1"] },
                    sections: {
                        "section-1": {
                            id: "section-1",
                            title: "Section 1",
                            layout: { vizOrder: ["viz-0", "viz-1", "viz-2", "viz-3"] },
                            viz: {
                                "viz-0": { id: "viz-0", vizId: "vizId-0" },
                                "viz-1": { id: "viz-1", vizId: "vizId-1" },
                                "viz-2": { id: "viz-2", vizId: "" },
                                "viz-3": { id: "viz-3", vizId: "vizId-3" }
                            }
                        }
                    }
                }
            };
            this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("deletes a visualization", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-1",
                    title: "First Section",
                    visualizations: [
                        { id: "viz-0", vizId: "vizId-0" },
                        { id: "viz-2", vizId: "" },
                        { id: "viz-3", vizId: "vizId-3" }
                    ]
                }]
            }]
        };
        this.oCommonDataModelService.getPage.withArgs("page-1").returns(this.oCDMPage);

        // Act
        return this.oPagesService.deleteVisualization(0, 0, 1)
            .then(() => {
                // Assert
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
                assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
                assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            });
    });

    QUnit.test("deletes the correct visualization if the page contains filtered visualizations", function (assert) {
        // Arrange
        const oCDMPageWithHiddenViz = {
            identification: { id: "page-1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-0", "viz-0-1", "viz-1", "viz-2", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-0-1": { id: "viz-0-1", vizId: "vizId-0-1" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-2": { id: "viz-2", vizId: "" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    }
                }
            }
        };
        const oExpectedCDMPage = {
            identification: { id: "page-1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-0", "viz-0-1", "viz-2", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-0-1": { id: "viz-0-1", vizId: "vizId-0-1" },
                            "viz-2": { id: "viz-2", vizId: "" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    }
                }
            }
        };
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-1",
                    title: "First Section",
                    visualizations: [
                        { id: "viz-0", vizId: "vizId-0" },
                        { id: "viz-2", vizId: "" },
                        { id: "viz-3", vizId: "vizId-3" }
                    ]
                }]
            }]
        };
        this.oCommonDataModelService.getPage.withArgs("page-1").returns(oCDMPageWithHiddenViz);

        // Act
        return this.oPagesService.deleteVisualization(0, 0, 1)
            .then(() => {
                // Assert
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
                assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
                assert.deepEqual(oCDMPageWithHiddenViz, oExpectedCDMPage, "The CDM page was changed as expected");
                assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            });
    });

    QUnit.test("deletes the respective visualization from the CDM 3.1 page", function (assert) {
        // Arrange
        const oExpectedCDMPage = {
            identification: { id: "page-1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-0", "viz-2", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-2": { id: "viz-2", vizId: "" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    }
                }
            }
        };
        this.oCommonDataModelService.getPage.withArgs("page-1").returns(this.oCDMPage);

        // Act
        return this.oPagesService.deleteVisualization(0, 0, 1).then(() => {
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.deepEqual(this.oCDMPage, oExpectedCDMPage, "The CDM 3.1 site was adapted accordingly.");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page-1"], "savePersonalization was called with the page id of the updated page");
        });
    });

    QUnit.test("deletes the respective visualization from the CDM 3.1 page if the vizReference has no ID as it is a bookmark", function (assert) {
        // Arrange
        const oExpectedCDMPage = {
            identification: { id: "page-1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1",
                        layout: { vizOrder: ["viz-0", "viz-1", "viz-3"] },
                        viz: {
                            "viz-0": { id: "viz-0", vizId: "vizId-0" },
                            "viz-1": { id: "viz-1", vizId: "vizId-1" },
                            "viz-3": { id: "viz-3", vizId: "vizId-3" }
                        }
                    }
                }
            }
        };
        this.oCommonDataModelService.getPage.withArgs("page-1").returns(this.oCDMPage);

        // Act
        return this.oPagesService.deleteVisualization(0, 0, 2).then(() => {
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.deepEqual(this.oCDMPage, oExpectedCDMPage, "The CDM 3.1 site was adapted accordingly.");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page-1"], "savePersonalization was called with the page id of the updated page");
        });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the CDM service is not retrievable", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - deleteVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";

        // Act
        // Assert
        return this.oPagesService.deleteVisualization(0, 0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "deleteVisualization rejected with the expected error");
            });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the Page is not retrievable", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - deleteVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";

        // Act
        // Assert
        return this.oPagesService.deleteVisualization(0, 0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "deleteVisualization rejected with the expected error");
            });
    });

    QUnit.test("Rejects the promise and cancels the personalization when savePersonalization fails", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.withArgs("page-1").returns(this.oCDMPage);
        this.oSavePersonalizationStub.rejects(this.oTestError);

        // Act
        // Assert
        return this.oPagesService.deleteVisualization(0, 0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.deepEqual(oError, this.oTestError, "deleteVisualization rejected with the expected error");
            });
    });

    QUnit.module("The _getSectionIndex function", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            const oPageMock = {
                id: "page1",
                sections: [{
                    id: "section0"
                }, {
                    id: "section1"
                }]
            };

            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/pages/0", oPageMock);
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("returns index if section exists", function (assert) {
        // Act
        const iResult = this.oPagesService._getSectionIndex("/pages/0", "section1");

        // Assert
        assert.strictEqual(iResult, 1, "returned the correct result");
    });

    QUnit.test("returns undefined if section doesn't exists", function (assert) {
        // Act
        const iResult = this.oPagesService._getSectionIndex("/pages/0", "nonExistentSection");

        // Assert
        assert.strictEqual(iResult, undefined, "returned the correct result");
    });

    QUnit.test("returns undefined if page doesn't exists", function (assert) {
        // Act
        const iResult = this.oPagesService._getSectionIndex("/pages/1", "section1");

        // Assert
        assert.strictEqual(iResult, undefined, "returned the correct result");
    });

    QUnit.module("The _getVisualizationData function", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.sVizIdMock = "sVizId";
            this.oVisualizationsMock = {
                id: "visualizations"
            };
            this.oApplicationsMock = {
                id: "application"
            };
            this.oVizTypesMock = {
                id: "vizTypes"
            };
            this.oAdditionalVizDataMock = {
                id: "additionalVizData"
            };
            this.oVizDataMock = {
                id: "additionalVizDataId",
                vizId: "sVizId",
                vizType: "sTypeId",
                title: "sTitle",
                subtitle: "sSubTitle",
                icon: "sIcon",
                keywords: ["sKeyword"],
                info: "sInfo",
                target: { id: "oTarget" }
            };
            this.oVizDataMockWithoutId = {
                id: undefined,
                vizId: "sVizId",
                vizType: "sTypeId",
                title: "sTitle",
                subtitle: "sSubTitle",
                icon: "sIcon",
                keywords: ["sKeyword"],
                info: "sInfo",
                target: { id: "oTarget" }
            };
            this.oSiteMock = {
                applications: this.oApplicationsMock,
                visualizations: this.oVisualizationsMock,
                vizTypes: this.oVizTypesMock
            };
            this.oVizRefMock = {
                vizId: this.sVizIdMock
            };

            this.oGetVizDataStub = sandbox.stub(readUtils, "getVizData");
            this.oGetVizDataStub.withArgs(this.oSiteMock, this.oAdditionalVizDataMock).returns(this.oVizDataMock);
            this.oGetVizDataStub.withArgs(this.oSiteMock, this.oVizRefMock).returns(this.oVizDataMockWithoutId);

            this.oPagesService = new Pages();

            this.oGenerateIdStub = sandbox.stub(this.oPagesService, "_generateId");
            this.oGenerateIdStub.returns("newId");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("returns correct values with oAdditionalVizData", async function (assert) {
        // Arrange
        const oExpectedResult = {
            id: "additionalVizDataId",
            vizId: "sVizId",
            vizType: "sTypeId",
            title: "sTitle",
            subtitle: "sSubTitle",
            icon: "sIcon",
            keywords: ["sKeyword"],
            info: "sInfo",
            target: { id: "oTarget" }
        };

        // Act
        const oResult = await this.oPagesService._getVisualizationData(
            null,
            this.sVizIdMock,
            this.oVisualizationsMock,
            this.oAdditionalVizDataMock,
            this.oApplicationsMock,
            this.oVizTypesMock,
            this.oSystemContextMock
        );

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "_getVisualizationData returns the correct result");
        assert.strictEqual(this.oGetVizDataStub.callCount, 1, "getVizData was called once");
        assert.strictEqual(this.oGenerateIdStub.callCount, 0, "_generateId was not called");
    });

    QUnit.test("returns correct values with oAdditionalVizData missing", async function (assert) {
        // Arrange
        const oExpectedResult = {
            id: "newId",
            vizId: "sVizId",
            vizType: "sTypeId",
            title: "sTitle",
            subtitle: "sSubTitle",
            icon: "sIcon",
            keywords: ["sKeyword"],
            info: "sInfo",
            target: { id: "oTarget" }
        };

        // Act
        const oResult = await this.oPagesService._getVisualizationData(
            null,
            this.sVizIdMock,
            this.oVisualizationsMock,
            null, this.oApplicationsMock,
            this.oVizTypesMock,
            this.oSystemContextMock
        );

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "_getVisualizationData returns the correct result");
        assert.strictEqual(this.oGetVizDataStub.callCount, 1, "getVizData was called once");
        assert.strictEqual(this.oGenerateIdStub.callCount, 1, "_generateId was called once");
    });

    QUnit.module("addVisualization", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oPagesService = new Pages();
            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves({
                    payload: {
                        layout: {
                            sectionOrder: [
                                "someSectionId",
                                "someOtherSectionId"
                            ]
                        },
                        sections: {
                            someSectionId: {
                                layout: { vizOrder: [] },
                                viz: {}
                            },
                            someOtherSectionId: {
                                layout: { vizOrder: [] },
                                viz: {}
                            }
                        }
                    }
                }),
                getVisualizations: sandbox.stub().resolves({ someVizId: {} }),
                getApplications: sandbox.stub().resolves({}),
                getVizTypes: sandbox.stub().resolves({})
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);
            this.oGetSectionIndexStub = sandbox.stub(this.oPagesService, "_getSectionIndex");
            this.oLoadPageStub = sandbox.stub(this.oPagesService, "loadPage").resolves("/pages/0");
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oGenerateIdStub = sandbox.stub(this.oPagesService, "_generateId");

            this.oGetSectionIndexStub.withArgs("/pages/0", "someSectionId").returns(0);
            this.oGetSectionIndexStub.withArgs("/pages/0", "someOtherSectionId").returns(1);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("add a visualization to a page without a default section, not giving a sectionId", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someSectionId",
                    title: "someSectionTitle",
                    visualizations: []
                }, {
                    id: "someOtherSectionId",
                    title: "someOtherSectionTitle",
                    visualizations: []
                }]
            }]
        });
        this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");

        // Act
        return this.oPagesService.addVisualization("somePageId", null, "someVizId").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");
            const oFirstGroup = aSections[0];
            const sFirstGroupTitle = oFirstGroup.title;
            const sFirstGroupFirstVisualizationVizId = oFirstGroup.visualizations[0].vizId;

            assert.strictEqual(this.oGetSectionIndexStub.callCount, 1, "_getSectionIndex was called once");
            assert.strictEqual(this.oGenerateIdStub.callCount, 2, "_generateId was called twice");
            assert.deepEqual(this.oGenerateIdStub.getCall(0).args, ["somePageId"], "_generateId was called the first time with correct parameters");
            assert.deepEqual(this.oGenerateIdStub.getCall(1).args, ["somePageId"], "_generateId was called the second time with correct parameters");
            assert.strictEqual(aSections.length, 3, "A new section was added.");
            assert.strictEqual(sFirstGroupTitle, resources.i18n.getText("DefaultSection.Title"), "The title of the newly created section is correct.");
            assert.strictEqual(sFirstGroupFirstVisualizationVizId, "someVizId", "The content of the newly created section is correct.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once.");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        });
    });

    QUnit.test("add a visualization with a displayFormatHint parameter", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someSectionId",
                    title: "someSectionTitle",
                    visualizations: []
                }]
            }]
        });

        // Act
        return this.oPagesService.addVisualization("somePageId", null, "someVizId", "flat").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");
            const oFirstGroup = aSections[0];
            const oViz = oFirstGroup.visualizations[0];

            assert.strictEqual(oViz.vizId, "someVizId", "Visualization with correct id is created");
            assert.strictEqual(oViz.displayFormatHint, "flat", "displayFormatHint is taken into account");
        });
    });

    QUnit.test("add a visualization without a displayFormatHint parameter", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someSectionId",
                    title: "someSectionTitle",
                    visualizations: []
                }]
            }]
        });

        // Act
        return this.oPagesService.addVisualization("somePageId", null, "someVizId").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");
            const oFirstGroup = aSections[0];
            const oViz = oFirstGroup.visualizations[0];

            assert.strictEqual(oViz.vizId, "someVizId", "Visualization with correct id is created");
            assert.strictEqual(oViz.displayFormatHint, "standard", "displayFormatHint has the default value: standard");
        });
    });

    QUnit.test("add a visualization to a page with a default section, not giving a sectionId", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someSectionId",
                    title: resources.i18n.getText("DefaultSection.Title"),
                    default: true,
                    visualizations: []
                }, {
                    id: "someOtherSectionId",
                    title: "someOtherSectionTitle",
                    visualizations: []
                }]
            }]
        });
        this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");

        // Act
        return this.oPagesService.addVisualization("somePageId", null, "someVizId").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");

            assert.strictEqual(this.oGetSectionIndexStub.callCount, 1, "_getSectionIndex was called once");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "_generateId was called once");
            assert.deepEqual(this.oGenerateIdStub.getCall(0).args, ["somePageId"], "_generateId was called the first time with correct parameters");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once.");
            assert.strictEqual(aSections.length, 2, "No section was added.");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        });
    });

    QUnit.test("add a visualization to a page with a default section at a different position, not giving a sectionId", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someOtherSectionId",
                    title: "someOtherSectionTitle",
                    visualizations: []
                }, {
                    id: "someSectionId",
                    title: resources.i18n.getText("DefaultSection.Title"),
                    default: true,
                    visualizations: []
                }]
            }]
        });
        this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");

        // Act
        return this.oPagesService.addVisualization("somePageId", null, "someVizId").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");

            assert.strictEqual(this.oGetSectionIndexStub.callCount, 1, "_getSectionIndex was called once");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "_generateId was called once");
            assert.deepEqual(this.oGenerateIdStub.getCall(0).args, ["somePageId"], "_generateId was called the first time with correct parameters");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once.");
            assert.strictEqual(aSections.length, 2, "No section was added.");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        });
    });

    QUnit.test("add a visualization to a page and giving a sectionId at position 0", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someSectionId",
                    title: "someSectionTitle",
                    visualizations: []
                }, {
                    id: "someOtherSectionId",
                    title: "someOtherSectionTitle",
                    visualizations: []
                }]
            }]
        });
        this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");

        // Act
        return this.oPagesService.addVisualization("somePageId", "someSectionId", "someVizId").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");

            assert.strictEqual(this.oGetSectionIndexStub.callCount, 1, "_getSectionIndex was called once");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "_generateId was called once");
            assert.deepEqual(this.oGenerateIdStub.getCall(0).args, ["somePageId"], "_generateId was called the first time with correct parameters");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once.");
            assert.strictEqual(aSections.length, 2, "No section was added.");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        });
    });

    QUnit.test("add a visualization to a page and giving a sectionId at position 1", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/", {
            pages: [{
                id: "somePageId",
                sections: [{
                    id: "someSectionId",
                    title: "someSectionTitle",
                    visualizations: []
                }, {
                    id: "someOtherSectionId",
                    title: "someOtherSectionTitle",
                    visualizations: []
                }]
            }]
        });
        this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");

        // Act
        return this.oPagesService.addVisualization("somePageId", "someOtherSectionId", "someVizId").then(() => {
            // Assert
            const aSections = this.oPagesService.getModel().getProperty("/pages/0/sections");

            assert.strictEqual(this.oGetSectionIndexStub.callCount, 1, "_getSectionIndex was called once");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "_generateId was called once");
            assert.deepEqual(this.oGenerateIdStub.getCall(0).args, ["somePageId"], "_generateId was called the first time with correct parameters");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once.");
            assert.strictEqual(aSections.length, 2, "No section was added.");
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when the CDM service cannot be retrieved", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - addVisualization: Personalization cannot be saved: CDM Service cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.addVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addVisualization rejected with the expected error");
            });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when loadPage failed", function (assert) {
        // Arrange
        this.oLoadPageStub.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - addVisualization: Personalization cannot be saved: Failed to load page, get visualizations or get applications.";
        // Act
        // Assert
        return this.oPagesService.addVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addVisualization rejected with the expected error");
            });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when getVisualizations failed", function (assert) {
        // Arrange
        this.oCommonDataModelService.getVisualizations.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - addVisualization: Personalization cannot be saved: Failed to load page, get visualizations or get applications.";
        // Act
        // Assert
        return this.oPagesService.addVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addVisualization rejected with the expected error");
            });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when getApplications failed", function (assert) {
        // Arrange
        this.oCommonDataModelService.getApplications.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - addVisualization: Personalization cannot be saved: Failed to load page, get visualizations or get applications.";
        // Act
        // Assert
        return this.oPagesService.addVisualization()
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addVisualization rejected with the expected error");
            });
    });

    QUnit.test("rejects the promise, resets the personalization and logs the correct error when getPage failed", function (assert) {
        // Arrange
        sandbox.stub(this.oPagesService, "_getVisualizationData");
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        sandbox.stub(this.oPagesService, "getModel").returns({
            getProperty: sandbox.stub()
                .withArgs("/pages/0/sections/0/visualizations")
                .returns({
                    push: sandbox.stub()
                }),
            refresh: sandbox.stub()
        });
        this.aExpectedLogErrorArgs[0] = "Pages - addVisualization: Personalization cannot be saved: Failed to get page.";

        // Act
        // Assert
        return this.oPagesService.addVisualization(null, "someSectionId")
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addVisualization rejected with the expected error");
            });
    });

    QUnit.module("copyVisualization", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();
            this.oAddVisualizationStub = sandbox.stub(this.oPagesService, "addVisualization").resolves();
            this.oAddBookmarkToPageStub = sandbox.stub(this.oPagesService, "addBookmarkToPage").resolves();
            this.oVizData = {
                id: "id-1629186680427-619",
                vizId: "vizId:id-1629186680427-619",
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: { test: "test:vizConfig" },
                title: "My bookmark",
                subtitle: "asd",
                icon: "test:icon",
                keywords: [],
                info: "asd",
                indicatorDataSource: { path: "test:path", refresh: "test:refresh" },
                target: { semanticObject: "Action", action: "toappnavsample" },
                isBookmark: false,
                contentProviderId: "",
                displayFormatHint: "standard",
                numberUnit: "test:numberUnit",
                targetURL: "#Action-toappnavsample",
                supportedDisplayFormats: [
                    "standard",
                    "compact",
                    "flat",
                    "flatWide"
                ]
            };
            this.oExpectedBookmarkData = {
                title: "My bookmark",
                subtitle: "asd",
                url: "#Action-toappnavsample",
                icon: "test:icon",
                info: "asd",
                serviceUrl: "test:path",
                serviceRefreshInterval: "test:refresh",
                numberUnit: "test:numberUnit",
                vizType: "sap.ushell.StaticAppLauncher",
                vizConfig: { test: "test:vizConfig" }
            };
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("calls 'addVisualization' if the vizInstance is not a bookmark", function (assert) {
        return this.oPagesService.copyVisualization("TEST_PAGE_ID", "TEST_SECTION_ID", this.oVizData).then(() => {
            assert.strictEqual(this.oAddVisualizationStub.firstCall.args[0], "TEST_PAGE_ID", "addVisualization was called with the expected argument");
            assert.strictEqual(this.oAddVisualizationStub.firstCall.args[1], "TEST_SECTION_ID", "addVisualization was called with the expected argument");
            assert.strictEqual(this.oAddVisualizationStub.firstCall.args[2], "vizId:id-1629186680427-619", "addVisualization was called with the expected argument");
        });
    });
    QUnit.test("calls 'addBookmarkToPage' if the vizInstance is a bookmark", function (assert) {
        this.oVizData.isBookmark = true;
        return this.oPagesService.copyVisualization("TEST_PAGE_ID", "TEST_SECTION_ID", this.oVizData).then(() => {
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[0], "TEST_PAGE_ID", "addBookmarkToPage was called with the expected argument");
            assert.deepEqual(this.oAddBookmarkToPageStub.firstCall.args[1], this.oExpectedBookmarkData, "addBookmarkToPage was called with the expected argument");
        });
    });

    QUnit.module("moveSection", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oCDM31Page = { payload: { layout: { sectionOrder: ["0", "1", "2", "3"] } } };
            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oCDM31Page)
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);

            this.oMockModel = {
                pages: [{
                    id: "testId",
                    sections: [{
                        id: "0",
                        title: "First Section",
                        visualizations: []
                    }, {
                        id: "1",
                        title: "Second Section",
                        visualizations: []
                    }, {
                        id: "2",
                        title: "Third Section",
                        visualizations: []
                    }, {
                        id: "3",
                        title: "Fourth Section",
                        visualizations: []
                    }]
                }]
            };

            this.oModelRefreshSpy = sandbox.stub(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oTestError = new Error("foo");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Does nothing if section is moved on itself", function (assert) {
        // Act
        this.oPagesService.moveSection(0, 0, 0);

        // Assert
        assert.strictEqual(this.oModelRefreshSpy.callCount, 0, "Model was not refreshed");
        assert.deepEqual(this.oPagesService.getModel().getProperty("/"), this.oMockModel, "the model was not manipulated");
        assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 0, "setPersonalizationActive was not called");
        assert.strictEqual(this.oSavePersonalizationStub.callCount, 0, "savePersonalization was not called");
    });

    QUnit.test("Moves section to the right", function (assert) {
        // Arrange
        const oExpectedCdm31Page = {
            payload: { layout: { sectionOrder: ["1", "0", "2", "3"] } }
        };
        const oExpectedModel = {
            pages: [{
                id: "testId",
                sections: [{
                    id: "1",
                    title: "Second Section",
                    visualizations: []
                }, {
                    id: "0",
                    title: "First Section",
                    visualizations: []
                }, {
                    id: "2",
                    title: "Third Section",
                    visualizations: []
                }, {
                    id: "3",
                    title: "Fourth Section",
                    visualizations: []
                }]
            }]
        };

        // Act
        return this.oPagesService.moveSection(0, 0, 2).then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedCdm31Page, "the CDM page was correctly manipulated.");
        });
    });

    QUnit.test("Moves section to the left", function (assert) {
        // Arrange
        const oExpectedCdm31Page = { payload: { layout: { sectionOrder: ["2", "0", "1", "3"] } } };

        const oExpectedModel = {
            pages: [{
                id: "testId",
                sections: [{
                    id: "2",
                    title: "Third Section",
                    visualizations: []
                }, {
                    id: "0",
                    title: "First Section",
                    visualizations: []
                }, {
                    id: "1",
                    title: "Second Section",
                    visualizations: []
                }, {
                    id: "3",
                    title: "Fourth Section",
                    visualizations: []
                }]
            }]
        };

        // Act
        return this.oPagesService.moveSection(0, 2, 0).then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
            assert.deepEqual(this.oCDM31Page, oExpectedCdm31Page, "the CDM page was correctly manipulated.");
        });
    });

    QUnit.test("checks the error cases when no page is received", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(this.oTestError);

        // Act
        return this.oPagesService.moveSection(0, 2, 0).catch((oError) => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
            assert.strictEqual(this.oLogErrorStub.getCall(0).args[0],
                "Pages - moveSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.",
                "The error function from Log was called with the correct parameter.");
            assert.deepEqual(this.oLogErrorStub.getCall(0).args[1],
                this.oTestError, "The error function from Log was called with the correct parameter.");
            assert.strictEqual(this.oLogErrorStub.getCall(0).args[2], "sap.ushell.services.Pages", "The error function from Log was called with the correct parameter.");
            assert.deepEqual(oError, this.oTestError, "moveSection rejected with the expected error");
        });
    });

    QUnit.test("checks the error case when the CDM service is not available", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);

        // Act
        return this.oPagesService.moveSection(0, 2, 0).catch((oError) => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
            assert.deepEqual(this.oLogErrorStub.getCall(0).args[0],
                "Pages - moveSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.",
                "The error function from Log was called with the correct parameter.");
            assert.deepEqual(this.oLogErrorStub.getCall(0).args[1], this.oTestError, "The error function from Log was called with the correct parameter.");
            assert.strictEqual(this.oLogErrorStub.getCall(0).args[2], "sap.ushell.services.Pages", "The error function from Log was called with the correct parameter.");
            assert.deepEqual(oError, this.oTestError, "moveSection rejected with the expected error");
        });
    });

    QUnit.module("addSection", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oCDMPage = {
                identification: {},
                payload: {
                    layout: { sectionOrder: [] },
                    sections: {}
                }
            };
            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oCDMPage),
                save: sandbox.stub()
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);
            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oGetVizRefStub = sandbox.stub(readUtils, "getVizRef").returns({ id: "vizRef" });

            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            sandbox.stub(this.oPagesService, "_generateId").withArgs("page1").returns("newSectionId");

            this.oFirstSection = {
                id: "0",
                title: "First Section",
                visualizations: []
            };

            this.oData = {
                pages: [{
                    id: "page1",
                    sections: [this.oFirstSection]
                }]
            };

            this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oData);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Adds a section to the Pages data model", function (assert) {
        // Act
        return this.oPagesService.addSection(0, 1).then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");

            const oActualData = this.oPagesService.getModel().getProperty("/");
            assert.strictEqual(oActualData.pages.length, 1, "The correct value has been found.");
            assert.strictEqual(oActualData.pages[0].sections.length, 2, "The correct value has been found.");
            assert.strictEqual(oActualData.pages[0].sections[0], this.oFirstSection, "The correct value has been found.");

            const oSecondSection = oActualData.pages[0].sections[1];
            assert.strictEqual(oSecondSection.id, "newSectionId", "The correct value has been found.");
            assert.strictEqual(oSecondSection.title, "", "The correct value has been found.");
            assert.strictEqual(oSecondSection.visible, true, "The correct value has been found.");
            assert.strictEqual(oSecondSection.locked, false, "The correct value has been found.");
            assert.deepEqual(oSecondSection.visualizations, [], "The correct value has been found.");
        });
    });

    QUnit.test("Retrieves the correct page by its ID", function (assert) {
        // Act
        return this.oPagesService.addSection(0, 1).then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oCommonDataModelService.getPage.callCount, 1, "The function getPage has been called once.");
            assert.strictEqual(this.oCommonDataModelService.getPage.firstCall.args[0], "page1", "The function getPage has been called with the correct parameter.");
        });
    });

    QUnit.test("Inserts a valid CDM section into the CDM page", function (assert) {
        // Act
        return this.oPagesService.addSection(0, 1).then(() => {
            // Assert
            const aSectionIds = Object.keys(this.oCDMPage.payload.sections);
            const oModelSection = this.oPagesService.getModel().getProperty("/pages/0/sections/1");
            const oCdmSection = this.oCDMPage.payload.sections[aSectionIds[0]];

            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(aSectionIds.length, 1, "The section has been added to the object.");

            assert.ok(oCdmSection, "The section has been found.");
            assert.strictEqual(oCdmSection.title, "", "The correct value has been found.");
            assert.strictEqual(oCdmSection.id, "newSectionId", "The correct value has been found.");
            assert.strictEqual(oCdmSection.id, oModelSection.id, "The correct value has been found.");
            assert.deepEqual(oCdmSection, {
                id: "newSectionId",
                title: "",
                default: false,
                locked: false,
                preset: false,
                visible: true,
                layout: { vizOrder: [] },
                viz: {}
            }, "The section has the correct structure.");
        });
    });

    QUnit.test("Inserts a valid CDM section into the CDM page containing a visualization", function (assert) {
        // Act
        return this.oPagesService.addSection(0, 1, {
            locked: true,
            visualizations: [{ id: "someId", vizId: "someVizId" }]
        }).then(() => {
            // Assert
            const aSectionIds = Object.keys(this.oCDMPage.payload.sections);
            const oModelSection = this.oPagesService.getModel().getProperty("/pages/0/sections/1");
            const oCdmSection = this.oCDMPage.payload.sections[aSectionIds[0]];

            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(aSectionIds.length, 1, "The section has been added to the object.");

            assert.ok(oCdmSection, "The section has been found.");
            assert.strictEqual(oCdmSection.title, "", "The correct value has been found.");
            assert.strictEqual(oCdmSection.id, "newSectionId", "The correct value has been found.");
            assert.strictEqual(oCdmSection.id, oModelSection.id, "The correct value has been found.");
            assert.deepEqual(oCdmSection, {
                id: "newSectionId",
                title: "",
                default: false,
                locked: true,
                preset: false,
                visible: true,
                layout: { vizOrder: ["someId"] },
                viz: {
                    someId: { id: "someId", vizId: "someVizId" }
                }
            }, "The section has the correct structure.");
        });
    });

    QUnit.test("Inserts the correct ID into the CDM section layout data", function (assert) {
        // Arrange
        this.oCDMPage.payload.layout.sectionOrder = ["section0", "section1"];

        // Act
        return this.oPagesService.addSection(0, 1).then(() => {
            // Assert
            const aSectionIds = Object.keys(this.oCDMPage.payload.sections);
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(aSectionIds.length, 1, "The section has been added to the object.");
            assert.strictEqual(this.oCDMPage.payload.layout.sectionOrder[1], aSectionIds[0]);
        });
    });

    QUnit.test("Calls the setPersonalizationActive function", function (assert) {
        // Act
        const oPromise = this.oPagesService.addSection(0, 1);

        // Assert
        return oPromise.then(() => {
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "The function setPersonalizationActive has been called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
        });
    });

    QUnit.test("Calls the savePersonalization function", function (assert) {
        // Act
        const oPromise = this.oPagesService.addSection(0, 1);

        // Assert
        return oPromise.then(() => {
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "The function savePersonalization has been called exactly once.");
        });
    });

    QUnit.test("Adds a section with predefined properties", function (assert) {
        // Act
        const oPromise = this.oPagesService.addSection(0, 1, { title: "someText", locked: true, visible: false });

        return oPromise.then(() => {
            // Assert
            const oActualData = this.oPagesService.getModel().getProperty("/");
            assert.strictEqual(oActualData.pages.length, 1, "The correct value has been found.");
            assert.strictEqual(oActualData.pages[0].sections.length, 2, "The correct value has been found.");
            assert.strictEqual(oActualData.pages[0].sections[0], this.oFirstSection, "The correct value has been found.");

            const oSecondSection = oActualData.pages[0].sections[1];
            assert.strictEqual(oSecondSection.id, "newSectionId", "The correct value has been found.");
            assert.strictEqual(oSecondSection.title, "someText", "The correct value has been found.");
            assert.strictEqual(oSecondSection.visible, false, "The correct value has been found.");
            assert.strictEqual(oSecondSection.locked, true, "The correct value has been found.");
            assert.deepEqual(oSecondSection.visualizations, [], "The correct value has been found.");

            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        });
    });

    QUnit.test("rejects the promise, cancels the personalization and logs the correct error if CDM Service is not retrievable", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - addSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.addSection(0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addSection rejected with the expected error");
            });
    });

    QUnit.test("rejects the promise, cancels the personalization and logs the correct error if getPage fails", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - addSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.addSection(0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addSection rejected with the expected error");
            });
    });

    QUnit.test("Inserts only the vizRef of a Bookmark", function (assert) {
        // Arrange
        const oSectionRef = {
            visualizations: [
                { id: "bookmarkTile", isBookmark: true }
            ]
        };
        const oExpectedResult = {
            bookmarkTile: { id: "vizRef" }
        };
        // Act
        return this.oPagesService.addSection(0, 1, oSectionRef).then(() => {
            // Assert
            assert.strictEqual(this.oGetVizRefStub.callCount, 1, "getVizRef was called once");
            assert.deepEqual(this.oCDMPage.payload.sections.newSectionId.viz, oExpectedResult, "Added the bookmark tile correctly to the section");
        });
    });

    QUnit.module("deleteSection", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oMockPage = {
                payload: {
                    sections: {
                        0: { id: "0", title: "First Section", visualizations: [] },
                        1: { id: "1", title: "Second Section", visualizations: [] }
                    },
                    layout: { sectionOrder: ["0", "1"] }
                }
            };

            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oMockPage)
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");

            this.oMockModel = {
                pages: [{
                    id: "page1",
                    sections: [{
                        id: "0",
                        title: "First Section",
                        visualizations: []
                    }, {
                        id: "1",
                        title: "Second Section",
                        visualizations: []
                    }]
                }]
            };

            this.oModelRefreshSpy = sandbox.stub(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("deletes a section", function (assert) {
        const done = assert.async();

        // Arrange
        const oExpectedModelUI = {
            pages: [{
                id: "page1",
                sections: [{
                    id: "0",
                    title: "First Section",
                    visualizations: []
                }]
            }]
        };

        const oExpectedPageObject = {
            payload: {
                sections: {
                    0: { id: "0", title: "First Section", visualizations: [] }
                },
                layout: { sectionOrder: ["0"] }
            }
        };

        // Act
        const oPromise = this.oPagesService.deleteSection(0, 1);
        oPromise.then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.ok(this.oSavePersonalizationStub.calledWithExactly("page1"), "savePersonalization was called with correct parameter");
            assert.deepEqual(this.oMockPage, oExpectedPageObject, "the page was manipulated on the expected way");
            assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModelUI, "the model was manipulated on the expected way");

            done();
        });
    });

    QUnit.test("rejects if returned page is invalid", function (assert) {
        const done = assert.async();
        this.oCommonDataModelService.getPage.resolves(null);
        // Act
        const oPromise = this.oPagesService.deleteSection(0, 1);
        assert.ok(oPromise instanceof Promise, "Return value is a promise");
        oPromise
            .then(() => {
                assert.ok(false, "Promise should reject cause no Page returned");
                done();
            })
            .catch(() => {
                assert.ok(true, "Promise rejected cause no Page returned");
                done();
            });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the CDM service is not retrievable", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - deleteSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.deleteSection(0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "deleteSection rejected with the expected error");
            });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the Page is not retrievable", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - deleteSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.deleteSection(0, 1)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "deleteSection rejected with the expected error");
            });
    });

    QUnit.module("setSectionVisibility", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oMockPage = {
                payload: {
                    sections: {
                        0: {
                            id: "0",
                            title: "First Section",
                            visualizations: [],
                            visible: true
                        }
                    },
                    layout: { sectionOrder: ["0"] }
                }
            };

            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oMockPage)
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");

            this.oMockModel = {
                pages: [{
                    id: "page1",
                    sections: [{
                        id: "0",
                        title: "First Section",
                        visualizations: [],
                        visible: true
                    }]
                }]
            };

            this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("sets a sections visibility", function (assert) {
        const done = assert.async();
        // Arrange
        const oExpectedModelCDM = {
            payload: {
                sections: {
                    0: {
                        id: "0",
                        title: "First Section",
                        visualizations: [],
                        visible: false
                    }
                },
                layout: { sectionOrder: ["0"] }
            }
        };

        // Act
        const oPromise = this.oPagesService.setSectionVisibility(0, 0, false);

        oPromise.then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalizationActive was called with true");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oSavePersonalizationStub.getCall(0).args, ["page1"], "savePersonalization was called with correct parameter");
            assert.deepEqual(this.oMockPage, oExpectedModelCDM, "The CDM data was correctly altered");

            done();
        });
    });

    QUnit.test("rejects if returned page is invalid", function (assert) {
        const done = assert.async();
        this.oCommonDataModelService.getPage.resolves(null);

        // Act
        const oPromise = this.oPagesService.setSectionVisibility(0, 0, false);
        assert.ok(oPromise instanceof Promise, "Return value is a promise");
        oPromise
            .then(() => {
                assert.ok(false, "Promise should reject cause no Page returned");
                done();
            })
            .catch(() => {
                assert.ok(true, "Promise rejected cause no Page returned");
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalization was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalizationActive was called with parameter \"true\" with the first time");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with parameter \"false\" with the second time");
                done();
            });
    });

    QUnit.test("returns an empty promise when the section visibility equals the new visibility", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.resolves(null);

        // Act
        return this.oPagesService.setSectionVisibility(0, 0, true).then((oResult) => {
            // Assert
            assert.strictEqual(oResult, undefined, "undefined was returned");
        });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the Page is not retrievable", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - setSectionVisibility: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.setSectionVisibility(0, 0)
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "setSectionVisibility rejected with the expected error");
            });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the CDM Service is not retrievable", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - setSectionVisibility: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.setSectionVisibility(0, 0)
            .catch((oError) => {
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "setSectionVisibility rejected with the expected error");
            });
    });

    QUnit.module("renameSection", {
        beforeEach: function () {
            QUnit.dump.maxDepth = 10;
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oCommonDataModelService = {
                getPage: sandbox.stub()
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oPagesService = new Pages();
            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");

            this.oMockModel = {
                pages: [{
                    id: "page-1",
                    sections: [{
                        id: "section-1",
                        title: "Section 1",
                        visualizations: []
                    }]
                }]
            };

            this.oModelRefreshSpy = sandbox.spy(this.oPagesService.getModel(), "refresh");
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oTestError = new Error("foo");
            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("renames a section", function (assert) {
        // Arrange
        const oExpectedModel = {
            pages: [{
                id: "page-1",
                sections: [{
                    id: "section-1",
                    title: "Some New Name",
                    visualizations: []
                }]
            }]
        };

        // Act
        this.oPagesService.renameSection(0, 0, "Some New Name");

        // Assert
        assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
        assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
        assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
        assert.deepEqual(this.oPagesService.getModel().getProperty("/"), oExpectedModel, "the model was manipulated on the expected way");
    });

    QUnit.test("changes the respective page title in the CDM 3.1 site", function (assert) {
        // Arrange
        const oCDMPage = {
            identification: { id: "page-1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1",
                        title: "Section 1"
                    }
                }
            }
        };

        this.oCommonDataModelService.getPage.withArgs("page-1").resolves(oCDMPage);

        const oExpectedCDMPage = {
            identification: { id: "page-1", title: "Page 1" },
            payload: {
                layout: { sectionOrder: ["section-1"] },
                sections: {
                    "section-1": {
                        id: "section-1", title: "New Title"
                    }
                }
            }
        };

        // Act
        return this.oPagesService.renameSection(0, 0, "New Title").then(() => {
            // Assert
            assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
            assert.deepEqual(oCDMPage, oExpectedCDMPage, "The CDM 3.1 site was adapted accordingly.");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page-1"], "savePersonalization was called with the page id of the updated page");
        });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the CDM Service is not retrievable", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - renameSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.renameSection(0, 0, "New Title")
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "renameSection rejected with the expected error");
            });
    });

    QUnit.test("Rejects the promise, logs the correct error and cancels the personalization when the Page is not retrievable", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        this.aExpectedLogErrorArgs[0] = "Pages - renameSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        // Act
        // Assert
        return this.oPagesService.renameSection(0, 0, "New Title")
            .catch((oError) => {
                assert.strictEqual(this.oModelRefreshSpy.callCount, 1, "Model was refreshed");
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "setPersonalizationActive was called exactly twice");
                assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with the expected argument");
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs, "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "renameSection rejected with the expected error");
            });
    });

    QUnit.module("resetSection", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            const oOriginalCdmPage = {
                payload: {
                    sections: {
                        section0: {
                            layout: { vizOrder: ["viz0"] },
                            viz: {
                                viz0: { id: "viz0" }
                            }
                        }
                    }
                }
            };
            const oOriginalPageModel = {
                sections: [{
                    id: "section0",
                    visualizations: [{ id: "viz0" }]
                }]
            };

            this.oCdmPageReference = {
                identification: { id: "page1" },
                payload: {
                    sections: {
                        section0: {
                            layout: { vizOrder: [] },
                            viz: {}
                        },
                        section1: {
                            layout: { vizOrder: ["viz0"] },
                            viz: {
                                viz0: { id: "viz0" }
                            }
                        }
                    }
                }
            };
            const oPageMock = {
                id: "page1",
                sections: [{
                    id: "section0",
                    visualizations: []
                }, {
                    id: "section1",
                    visualizations: [{ id: "viz0" }]
                }]
            };

            const oVisualizationsMock = { id: "visualizations" };
            const oApplicationsMock = { id: "applications" };
            const oVizTypesMock = { id: "vizTypes" };

            this.oCommonDataModelService = {
                getCachedVisualizations: sandbox.stub().resolves(oVisualizationsMock),
                getApplications: sandbox.stub().resolves(oApplicationsMock),
                getCachedVizTypes: sandbox.stub().resolves(oVizTypesMock),
                getPage: sandbox.stub().withArgs("page1").resolves(this.oCdmPageReference),
                getOriginalPage: sandbox.stub().withArgs("page1").returns(oOriginalCdmPage)
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);
            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/pages/0", oPageMock);

            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oGenerateIdStub = sandbox.stub(this.oPagesService, "_generateId").withArgs("page1").returns("generatedId");

            this.oGetModelForPageStub = sandbox.stub(this.oPagesService, "_getModelForPage");
            this.oGetModelForPageStub.withArgs(oOriginalCdmPage, oVisualizationsMock, oApplicationsMock, oVizTypesMock).resolves(oOriginalPageModel);
        },

        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Updates the CDM 3.1 Site and the model of the page if a section is reset.", function (assert) {
        // Arrange
        const oExpectedCdmPage = {
            identification: { id: "page1" },
            payload: {
                sections: {
                    section0: {
                        layout: { vizOrder: ["viz0"] },
                        viz: {
                            viz0: { id: "viz0" }
                        }
                    },
                    section1: {
                        layout: { vizOrder: ["generatedId"] },
                        viz: {
                            generatedId: { id: "generatedId" }
                        }
                    }
                }
            }
        };
        const oExpectedModelPage = {
            id: "page1",
            sections: [{
                id: "section0",
                visualizations: [{
                    id: "viz0"
                }]
            }, {
                id: "section1",
                visualizations: [{
                    id: "generatedId"
                }]
            }]
        };

        // Act
        return this.oPagesService.resetSection(0, 0).then(() => {
            // Assert
            const oModelPage = this.oPagesService.getModel().getProperty("/pages/0");
            assert.deepEqual(oModelPage, oExpectedModelPage, "Updated the model accordingly");
            assert.deepEqual(this.oCdmPageReference, oExpectedCdmPage, "The section was reset correctly.");

            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page1"], "savePersonalization was called with the right parameters");
        });
    });

    QUnit.test("checks the error case when no page is received", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(new Error("Failed intentionally"));

        // Act
        return this.oPagesService.resetSection(0, 0).catch(() => {
            // Assert
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "The error function from Log was called once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "'setPersonalizationActive' was called twice.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalizationActive was called with parameter \"true\" with the first time");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with parameter \"false\" with the second time");
            assert.strictEqual(this.oLogErrorStub.getCall(0).args[0], "Pages - resetSection: Personalization cannot be saved: Failed to gather data from CDM Service.");
        });
    });

    QUnit.test("checks the error case when the CDM service is not available", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(new Error("Failed intentionally"));

        // Act
        return this.oPagesService.resetSection(0, 0).catch(() => {
            // Assert
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "'setPersonalizationActive' was called twice.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalizationActive was called with parameter \"true\" with the first time");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with parameter \"false\" with the second time");
        });
    });

    QUnit.module("resetPage", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oCdmPageReference = {
                identification: { id: "page1" },
                payload: { sections: {} }
            };
            const oOriginalCdmPage = {
                payload: {
                    sections: {
                        section0: {
                            id: "section0"
                        }
                    }
                }
            };
            const oOriginalPageModel = {
                sections: [{
                    id: "section0",
                    visualizations: []
                }]
            };

            const oPageMock = {
                id: "page1",
                sections: []
            };

            const oVisualizationsMock = { id: "visualizations" };
            const oApplicationsMock = { id: "applications" };
            const oVizTypesMock = { id: "vizTypes" };

            this.oCommonDataModelService = {
                getPage: sandbox.stub().withArgs("page1").resolves(this.oCdmPageReference),
                getCachedVisualizations: sandbox.stub().resolves(oVisualizationsMock),
                getApplications: sandbox.stub().resolves(oApplicationsMock),
                getCachedVizTypes: sandbox.stub().resolves(oVizTypesMock),
                getOriginalPage: sandbox.stub().withArgs("page1").returns(oOriginalCdmPage)
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCommonDataModelService);

            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/pages/0", oPageMock);

            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");

            this.oGetModelForPageStub = sandbox.stub(this.oPagesService, "_getModelForPage");
            this.oGetModelForPageStub.withArgs(oOriginalCdmPage, oVisualizationsMock, oApplicationsMock, oVizTypesMock).resolves(oOriginalPageModel);
        },

        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("gets called correctly", function (assert) {
        // Arrange
        const oExpectedModelPage = {
            sections: [{
                id: "section0",
                visualizations: []
            }]
        };
        const oExpectedCdmPagePayload = {
            sections: {
                section0: {
                    id: "section0"
                }
            }
        };

        // Act
        return this.oPagesService.resetPage(0).then(() => {
            // Assert
            const oModelPage = this.oPagesService.getModel().getProperty("/pages/0");
            assert.deepEqual(oModelPage, oExpectedModelPage, "Updated the model accordingly");
            assert.deepEqual(this.oCdmPageReference.payload, oExpectedCdmPagePayload, "The CDM page payload was adapted correctly.");

            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "savePersonalization was called exactly once");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page1"], "savePersonalization was called with the right parameters");
        });
    });

    QUnit.test("checks the error case when no page is received", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(new Error("Failed intentionally"));

        // Act
        return this.oPagesService.resetPage(0).catch(() => {
            // Assert
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "The error function from Log was called once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "'setPersonalizationActive' was called twice.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalizationActive was called with parameter \"true\" with the first time");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with parameter \"false\" with the second time");
            assert.strictEqual(this.oLogErrorStub.getCall(0).args[0], "Pages - resetPage: Personalization cannot be saved: Failed to gather data from CDM Service.");
        });
    });

    QUnit.test("checks the error case when the CDM service is not available", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(new Error("Failed intentionally"));

        // Act
        return this.oPagesService.resetPage(0).catch(() => {
            // Assert
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 2, "'setPersonalizationActive' was called twice.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(0).args[0], true, "setPersonalizationActive was called with parameter \"true\" with the first time");
            assert.strictEqual(this.oSetPersonalizationActiveStub.getCall(1).args[0], false, "setPersonalizationActive was called with parameter \"false\" with the second time");
            assert.strictEqual(this.oLogErrorStub.getCall(0).args[0], "Pages - resetPage: Personalization cannot be saved: Failed to gather data from CDM Service.");
        });
    });

    QUnit.module("addBookmarkToPage", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.aVizOrderDefaultSection = [];
            this.oVizDefaultSection = {};
            this.aVizOrderAddSection = [];
            this.oVizAddSection = {};
            this.oCDM31Site = {
                payload: {
                    sections: {
                        "section-default": {
                            layout: { vizOrder: this.aVizOrderDefaultSection },
                            viz: this.oVizDefaultSection
                        },
                        "section-add": {
                            layout: { vizOrder: this.aVizOrderAddSection },
                            viz: this.oVizAddSection
                        }
                    }
                }
            };

            this.oVizRefMock = {
                id: "unique-id",
                title: "bookmark-title",
                subTitle: "bookmark-subtitle",
                icon: "bookmark-icon",
                info: "bookmark-info",
                numberUnit: "EUR",
                target: { target: "FromBookmark" },
                indicatorDataSource: { path: "bookmark-serviceUrl", refresh: "bookmark-serviceRefreshInterval" },
                dataSource: {
                    type: "OData",
                    settings: {
                        odataVersion: "4.0"
                    }
                },
                isBookmark: true,
                vizType: "some.custom.vizType",
                vizConfig: { id: "vizConfig" },
                contentProviderId: "myContentProvider"
            };
            this.oVizDataMock = {
                id: "unique-id"
            };

            this.oSystemContextMock = {
                ContentProviderA: {}
            };

            this.oExpectedVizTypes = {
                1: { "sap.app": { id: 1 } },
                2: { "sap.app": { id: 2 } }
            };

            const aVizTypeIds = ["1", "2"];

            this.oTestError = new Error("foo");

            this.oLogErrorStub = sandbox.stub(Log, "error");

            this.oToTargetFromHashStub = sandbox.stub(utilsCdm, "toTargetFromHash");
            this.oToTargetFromHashStub.withArgs("bookmark-url").returns({
                target: "FromBookmark"
            });

            this.oGetVizRefStub = sandbox.stub(readUtils, "getVizRef");
            this.oGetVizRefStub.withArgs(this.oVizDataMock).returns(this.oVizRefMock);

            const oPageMock = {
                id: "page1",
                sections: []
            };

            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/pages/0", oPageMock);

            this.oSetPersonalizationActiveStub = sandbox.stub(this.oPagesService, "setPersonalizationActive");
            this.oSavePersonalizationStub = sandbox.stub(this.oPagesService, "savePersonalization");
            this.oGenerateIdStub = sandbox.stub(this.oPagesService, "_generateId").returns("unique-id");
            this.oRefreshStub = sandbox.stub(this.oPagesService.getModel(), "refresh");
            this.oAddSectionStub = sandbox.stub(this.oPagesService, "addSection");
            this.oGetVisualizationDataStub = sandbox.stub(this.oPagesService, "_getVisualizationData");
            this.oGetVisualizationDataStub.withArgs("page1", undefined, {}, this.oVizRefMock, {}, this.oExpectedVizTypes).returns(this.oVizDataMock);

            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oCDM31Site),
                getVizType: sandbox.stub()
                    .onFirstCall().returns({
                        "sap.app": { id: 1 }
                    })
                    .onSecondCall().returns({
                        "sap.app": { id: 2 }
                    })
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);

            this.oClientSideTargetResolutionService = {
                getSystemContext: sandbox.stub().returns(Promise.resolve(this.oSystemContextMock))
            };
            this.oPagesService._oCSTRServicePromise = Promise.resolve(this.oClientSideTargetResolutionService);

            this.oGetBookmarkVizTypeIdsStub = sandbox.stub(readUtils, "getBookmarkVizTypeIds").returns(aVizTypeIds);

            this.aExpectedLogErrorArgs = [
                null,
                this.oTestError,
                this.oPagesService.COMPONENT_NAME
            ];
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Retrieves the vizTypes and forwards them to get the visualization data.", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections", [{
            id: "section-default",
            default: true,
            visualizations: []
        }]);
        const oBookmarkData = {
            title: "bookmark-title"
        };
        const oVizDataMock = {
            id: "unique-id"
        };
        this.oGetVisualizationDataStub.returns(oVizDataMock);

        // Act
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData)
            .then(() => {
                // Assert
                assert.strictEqual(this.oGetBookmarkVizTypeIdsStub.callCount, 1, "The viz type ids were retrieved..");
                assert.ok(this.oGetBookmarkVizTypeIdsStub.calledWith(oBookmarkData), "The function was called with the correct parameter.");
                assert.deepEqual(this.oGetVisualizationDataStub.getCall(0).args[5], this.oExpectedVizTypes, "The function _getVisualizationData was called with the correct vizTypes.");
            });
    });

    QUnit.test("Returns an error if no page id is specified", function (assert) {
        // Arrange
        const sExpectedMessage = "Pages - addBookmarkToPage: Adding bookmark tile failed: No page id is provided.";
        const oBookmarkData = {
            title: "bookmark-title",
            url: "bookmark-url"
        };

        // Act
        return this.oPagesService.addBookmarkToPage(null, oBookmarkData).catch((oError) => {
            assert.strictEqual(oError.message, sExpectedMessage, "A rejected promise with the specified error message was returned.");
        });
    });

    QUnit.test("Returns a rejected promise if 'loadPage' fails", function (assert) {
        // Arrange
        sandbox.stub(this.oPagesService, "loadPage").rejects(new Error("loadPage failed"));
        const oBookmarkData = {
            title: "bookmark-title",
            url: "bookmark-url",
            vizType: "standardWide"
        };
        const sPageId = "page-id";

        // Act
        return this.oPagesService.addBookmarkToPage(sPageId, oBookmarkData).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "loadPage failed", "A rejected promise with the specified error message was returned.");
            assert.deepEqual(this.oLogErrorStub.firstCall.args[0],
                "Pages - addBookmarkToPage: Personalization cannot be saved: Could not load page.",
                "A 'error' method of Log was called with the specified error message.");
        });
    });

    QUnit.test("Returns a rejected promise, cancels the personalization and logs the correct error when loadPage fails", function (assert) {
        // Arrange
        this.aExpectedLogErrorArgs[0] = "Pages - addBookmarkToPage: Personalization cannot be saved: Could not load page.";
        sandbox.stub(this.oPagesService, "loadPage").rejects(this.oTestError);
        // Act
        // Assert
        return this.oPagesService.addBookmarkToPage("foo")
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs,
                    "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addBookmarkToPage rejected with the expected error");
            });
    });

    QUnit.test("Returns a rejected promise, cancels the personalization and logs the correct error when the page cannot be retrieved", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections", [{
            id: "section-1",
            default: true,
            visualizations: []
        }]);
        this.aExpectedLogErrorArgs[0] = "Pages - addBookmarkToPage: Personalization cannot be saved: CDM Service or Page cannot be retrieved.";
        this.oCommonDataModelService.getPage.rejects(this.oTestError);
        const oBookmarkData = {
            title: "bookmark-title",
            url: "bookmark-url"
        };

        // Act
        // Assert
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData)
            .catch((oError) => {
                assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, this.aExpectedLogErrorArgs,
                    "Log error was called with the expected arguments");
                assert.deepEqual(oError, this.oTestError, "addBookmarkToPage rejected with the expected error");
            });
    });

    QUnit.test("Creates a new section together with a new visualization if there is no existing default section", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections", [{
            id: "section-1",
            default: false
        }]);
        delete this.oVizRefMock.contentProviderId;
        const oBookmarkData = {
            title: "bookmark-title",
            subtitle: "bookmark-subtitle",
            icon: "bookmark-icon",
            numberUnit: "EUR",
            info: "bookmark-info",
            url: "bookmark-url",
            serviceUrl: "bookmark-serviceUrl",
            serviceRefreshInterval: "bookmark-serviceRefreshInterval",
            dataSource: {
                type: "OData",
                settings: {
                    odataVersion: "4.0"
                }
            },
            vizType: "some.custom.vizType",
            vizConfig: { id: "vizConfig" }
        };

        // Act
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData).then(() => {
            // Assert
            assert.strictEqual(this.oGetVisualizationDataStub.callCount, 1, "_getVisualizationData was called once");
            const oExpectedGetVisualizationDataArgs = [
                "page1",
                undefined, // vizId
                {}, // visualizations
                this.oVizRefMock,
                {}, // applications
                this.oExpectedVizTypes,
                this.oSystemContextMock
            ];
            assert.deepEqual(this.oGetVisualizationDataStub.getCall(0).args, oExpectedGetVisualizationDataArgs, "_getVisualizationData was called with the correct parameters");
            assert.strictEqual(this.oAddSectionStub.callCount, 1, "The method 'addSection' was called once.");
            const oExpectedAddSectionArgs = [
                0, // pageIndex
                0, // sectionIndex
                {
                    title: resources.i18n.getText("DefaultSection.Title"),
                    default: true,
                    visualizations: [this.oVizDataMock]
                }
            ];
            assert.deepEqual(this.oAddSectionStub.firstCall.args, oExpectedAddSectionArgs, "The method 'addSection' was called with right parameters.");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "The method '_generateId' was called with right parameters.");
            assert.deepEqual(this.oGenerateIdStub.firstCall.args, ["page1"], "The method '_generateId' was called with right parameters.");
        });
    });

    QUnit.test("Adds the visualization to the existing default section if there is one", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections", [{
            id: "section-default",
            default: true,
            visualizations: []
        }]);
        delete this.oVizRefMock.contentProviderId;
        const oBookmarkData = {
            title: "bookmark-title",
            subtitle: "bookmark-subtitle",
            icon: "bookmark-icon",
            info: "bookmark-info",
            numberUnit: "EUR",
            url: "bookmark-url",
            serviceUrl: "bookmark-serviceUrl",
            serviceRefreshInterval: "bookmark-serviceRefreshInterval",
            dataSource: {
                type: "OData",
                settings: {
                    odataVersion: "4.0"
                }
            },
            vizType: "some.custom.vizType",
            vizConfig: { id: "vizConfig" }
        };
        const oExpectedSectionInModel = {
            id: "section-default",
            default: true,
            visualizations: [{
                id: "unique-id"
            }]
        };
        const oExpectedVizInCDM31Site = this.oVizRefMock;

        // Act
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData).then(() => {
            // Assert
            const oFirstSection = this.oPagesService.getModel().getProperty("/pages/0/sections/0");

            assert.deepEqual(oFirstSection, oExpectedSectionInModel, "The bookmark was inserted into the default section in the model.");
            assert.strictEqual(this.oRefreshStub.callCount, 1, "The model of the page was refreshed.");
            assert.deepEqual(this.aVizOrderDefaultSection, ["unique-id"], "The 'vizOrder' property in the page in the CDM3.1 site was updated.");
            assert.deepEqual(this.oVizDefaultSection["unique-id"], oExpectedVizInCDM31Site, "The 'viz' property in the page in the CDM3.1 site was updated.");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "The personalization was saved.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page1"], "The right page id was passed to 'savePersonalization'.");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "The method '_generateId' was called with right parameters.");
            assert.deepEqual(this.oGenerateIdStub.firstCall.args, ["page1"], "The method '_generateId' was called with right parameters.");
            assert.strictEqual(this.oGetVizRefStub.callCount, 1, "getVizRef was called once");
        });
    });

    QUnit.test("Adds the contentProviderId param to vizRef when provided", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections", [{
            id: "section-default",
            default: true,
            visualizations: []
        }, {
            id: "section-add",
            default: false,
            visualizations: []
        }]);
        const oBookmarkData = {
            title: "bookmark-title",
            subtitle: "bookmark-subtitle",
            icon: "bookmark-icon",
            info: "bookmark-info",
            numberUnit: "EUR",
            url: "bookmark-url",
            serviceUrl: "bookmark-serviceUrl",
            serviceRefreshInterval: "bookmark-serviceRefreshInterval",
            dataSource: {
                type: "OData",
                settings: {
                    odataVersion: "4.0"
                }
            },
            vizType: "some.custom.vizType",
            vizConfig: { id: "vizConfig" }
        };

        const oExpectedVizInCDM31Site = this.oVizRefMock;

        // Act
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData, "section-add", "myContentProvider").then(() => {
            // Assert
            assert.deepEqual(this.oVizAddSection["unique-id"], oExpectedVizInCDM31Site, "The 'viz' property in the page in the CDM3.1 site was updated and contains the contentProviderId.");
        });
    });

    QUnit.test("Adds the visualization to the specific section", function (assert) {
        // Arrange
        this.oPagesService.getModel()._setProperty("/pages/0/sections", [{
            id: "section-default",
            default: true,
            visualizations: []
        }, {
            id: "section-add",
            default: false,
            visualizations: []
        }]);
        delete this.oVizRefMock.contentProviderId;
        const oBookmarkData = {
            title: "bookmark-title",
            subtitle: "bookmark-subtitle",
            icon: "bookmark-icon",
            info: "bookmark-info",
            numberUnit: "EUR",
            url: "bookmark-url",
            serviceUrl: "bookmark-serviceUrl",
            serviceRefreshInterval: "bookmark-serviceRefreshInterval",
            dataSource: {
                type: "OData",
                settings: {
                    odataVersion: "4.0"
                }
            },
            vizType: "some.custom.vizType",
            vizConfig: { id: "vizConfig" }
        };
        const oExpectedSectionInModel = {
            id: "section-add",
            default: false,
            visualizations: [{
                id: "unique-id"
            }]
        };
        const oExpectedVizInCDM31Site = this.oVizRefMock;

        // Act
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData, "section-add").then(() => {
            // Assert
            const oFirstSection = this.oPagesService.getModel().getProperty("/pages/0/sections/0");
            const oSecondSection = this.oPagesService.getModel().getProperty("/pages/0/sections/1");

            assert.equal(oFirstSection.visualizations.length, 0, "The visualizations of the default section was not changed.");
            assert.deepEqual(oSecondSection, oExpectedSectionInModel, "The bookmark was inserted into the specific section in the model.");
            assert.strictEqual(this.oRefreshStub.callCount, 1, "The model of the page was refreshed.");
            assert.deepEqual(this.aVizOrderAddSection, ["unique-id"], "The 'vizOrder' property in the page in the CDM3.1 site was updated.");
            assert.deepEqual(this.oVizAddSection["unique-id"], oExpectedVizInCDM31Site, "The 'viz' property in the page in the CDM3.1 site was updated.");
            assert.strictEqual(this.oSavePersonalizationStub.callCount, 1, "The personalization was saved.");
            assert.strictEqual(this.oSetPersonalizationActiveStub.firstCall.args[0], true, "setPersonalizationActive was called with parameter \"true\"");
            assert.deepEqual(this.oSavePersonalizationStub.firstCall.args, ["page1"], "The right page id was passed to 'savePersonalization'.");
            assert.strictEqual(this.oGenerateIdStub.callCount, 1, "The method '_generateId' was called with right parameters.");
            assert.deepEqual(this.oGenerateIdStub.firstCall.args, ["page1"], "The method '_generateId' was called with right parameters.");
            assert.strictEqual(this.oGetVizRefStub.callCount, 1, "getVizRef was called once");
        });
    });

    QUnit.test("Returns a rejected promise if the specific section was not found", function (assert) {
        // Arrange
        const oBookmarkData = {
            title: "bookmark-title",
            subtitle: "bookmark-subtitle",
            icon: "bookmark-icon"
        };

        const sExpectedMessage = "Pages - addBookmarkToPage: Adding bookmark tile failed: specified section was not found in the page.";

        // Act
        return this.oPagesService.addBookmarkToPage("page1", oBookmarkData, "not-found").catch((oError) => {
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "the error function from Log was called once.");
            assert.deepEqual(this.oLogErrorStub.getCall(0).args, [sExpectedMessage], "Log error was called with the expected arguments");
            assert.deepEqual(oError.message, sExpectedMessage, "addBookmarkToPage rejected with the expected error");
        });
    });

    QUnit.module("The function _findBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPagesData = [{
                identification: { id: "page1" },
                payload: {
                    sections: {
                        section1: {
                            id: "section1",
                            viz: {}
                        }
                    }
                }
            }];
            this.oTestSection = this.oPagesData[0].payload.sections.section1;

            this.oCdmServiceStub = {
                getAllPages: sandbox.stub().resolves(this.oPagesData)
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(this.oCdmServiceStub);

            this.oTarget = {
                semanticObject: "Action",
                action: "toappnavsample"
            };
            sandbox.stub(utilsCdm, "toTargetFromHash").withArgs("#Action-toappnavsample").returns(this.oTarget);

            this.oHarmonizeTargetStub = sandbox.stub(readUtils, "harmonizeTarget").callsFake((oTarget) => {
                return oTarget;
            });

            this.oPagesService = new Pages();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Finds all bookmarks in multiple pages and sections", function (assert) {
        // Arrange
        const oPagesData = [{
            identification: { id: "page1" },
            payload: {
                sections: {
                    section1: {
                        id: "section1",
                        viz: {
                            vizRef1: {
                                id: "vizRef1",
                                isBookmark: true,
                                target: { semanticObject: "Action", action: "toappnavsample" }
                            },
                            vizRef2: {
                                id: "vizRef2",
                                target: { semanticObject: "Action", action: "toappnavsample" }
                            },
                            vizRef3: {
                                id: "vizRef3",
                                target: { semanticObject: "Action", action: "tobookmarksample" }
                            },
                            vizRef6: {
                                id: "vizRef6",
                                target: { semanticObject: "Action", action: "tobookmarksample" },
                                vizType: "newstile",
                                isBookmark: true
                            }
                        }
                    },
                    section2: {
                        id: "section2",
                        viz: {
                            vizRef4: {
                                id: "vizRef4",
                                isBookmark: true,
                                target: { semanticObject: "Action", action: "toappnavsample" }
                            }
                        }
                    }
                }
            }
        }, {
            identification: { id: "page2" },
            payload: {
                sections: {
                    section3: {
                        id: "section3",
                        viz: {
                            vizRef1: {
                                id: "vizRef5",
                                isBookmark: true,
                                target: { semanticObject: "Action", action: "toappnavsample" }
                            }
                        }
                    }
                }
            }
        }, {
            identification: { id: "page3" },
            payload: {
                sections: {
                    section4: {
                        section4: {
                            id: "section4",
                            viz: {}
                        }
                    }
                }
            }
        }, {
            identification: { id: "page4" },
            payload: {
                sections: {}
            }
        }];

        this.oCdmServiceStub.getAllPages.resolves(oPagesData);

        const aExpectedBookmarks = [
            { pageId: "page1", sectionId: "section1", vizRefId: "vizRef1" },
            { pageId: "page1", sectionId: "section2", vizRefId: "vizRef4" },
            { pageId: "page2", sectionId: "section3", vizRefId: "vizRef5" }
        ];

        // Act
        const oFindBookmarksPromise = this.oPagesService._findBookmarks({
            url: "#Action-toappnavsample"
        });

        // Assert
        return oFindBookmarksPromise
            .then((aFoundBookmarks) => {
                assert.deepEqual(aFoundBookmarks, aExpectedBookmarks, "All bookmarks are found.");
                assert.deepEqual(this.oHarmonizeTargetStub.args[0][0], this.oTarget, "The target parameters are harmonized.");
            });
    });

    QUnit.test("Only finds bookmarks but not adapted vizReferences", function (assert) {
        // Arrange
        this.oTestSection.viz = {
            vizRef1: {
                id: "vizRef1",
                target: { semanticObject: "Action", action: "toappnavsample" }
            },
            vizRef2: {
                id: "vizRef2",
                isBookmark: true,
                target: { semanticObject: "Action", action: "toappnavsample" }
            }
        };

        const aExpectedBookmarks = [
            { pageId: "page1", sectionId: "section1", vizRefId: "vizRef2" }
        ];

        // Act
        const oFindBookmarksPromise = this.oPagesService._findBookmarks({
            url: "#Action-toappnavsample"
        });

        // Assert
        return oFindBookmarksPromise
            .then((aFoundBookmarks) => {
                assert.deepEqual(aFoundBookmarks, aExpectedBookmarks, "The correct bookmark is found.");
            });
    });

    QUnit.test("Does not find custom bookmarks if the vizType is not supplied", function (assert) {
        // Arrange
        this.oTestSection.viz = {
            vizRef1: {
                id: "vizRef1",
                isBookmark: true,
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "newstile"
            },
            vizRef2: {
                id: "vizRef2",
                isBookmark: true,
                target: { semanticObject: "Action", action: "toappnavsample" }
            }
        };

        const aExpectedBookmarks = [
            { pageId: "page1", sectionId: "section1", vizRefId: "vizRef2" }
        ];

        // Act
        const oFindBookmarksPromise = this.oPagesService._findBookmarks({
            url: "#Action-toappnavsample"
        });

        // Assert
        return oFindBookmarksPromise
            .then((aFoundBookmarks) => {
                assert.deepEqual(aFoundBookmarks, aExpectedBookmarks, "The correct bookmark is found.");
            });
    });

    QUnit.test("Finds bookmarks that match the passed URL and vizType", function (assert) {
        // Arrange
        this.oTestSection.viz = {
            vizRef1: {
                id: "vizRef1",
                isBookmark: true,
                target: { semanticObject: "Action", action: "toappnavsample" }
            },
            vizRef2: {
                id: "vizRef2",
                isBookmark: true,
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "newstile"
            },
            vizRef3: {
                id: "vizRef3",
                isBookmark: true,
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "smartbusinesstile"
            }
        };

        const aExpectedBookmarks = [
            { pageId: "page1", sectionId: "section1", vizRefId: "vizRef2" }
        ];

        // Act
        const oFindBookmarksPromise = this.oPagesService._findBookmarks({
            url: "#Action-toappnavsample",
            vizType: "newstile"
        });

        // Assert
        return oFindBookmarksPromise
            .then((aFoundBookmarks) => {
                assert.deepEqual(aFoundBookmarks, aExpectedBookmarks, "The correct bookmark is found.");
            });
    });

    QUnit.test("Finds bookmarks that match the passed URL and contentProviderId", function (assert) {
        // Arrange
        this.oTestSection.viz = {
            vizRef1: {
                id: "vizRef1",
                isBookmark: true,
                contentProviderId: undefined,
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "newstile"
            },
            vizRef2: {
                id: "vizRef2",
                isBookmark: true,
                contentProviderId: "S4SYSTEM",
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "newstile"
            },
            vizRef3: {
                id: "vizRef3",
                isBookmark: true,
                contentProviderId: "IBPSYSTEM",
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "smartbusinesstile"
            }
        };

        const aExpectedBookmarks = [
            { pageId: "page1", sectionId: "section1", vizRefId: "vizRef2" }
        ];

        // Act
        const oFindBookmarksPromise = this.oPagesService._findBookmarks({
            url: "#Action-toappnavsample",
            vizType: "newstile",
            contentProviderId: "S4SYSTEM"
        });

        // Assert
        return oFindBookmarksPromise
            .then((aFoundBookmarks) => {
                assert.deepEqual(aFoundBookmarks, aExpectedBookmarks, "The correct bookmark is found.");
            });
    });

    QUnit.test("Finds bookmarks that match an undefined contentProviderId with the default contentProviderId (empty string)", function (assert) {
        // Arrange
        this.oTestSection.viz = {
            vizRef1: {
                id: "vizRef1",
                isBookmark: true,
                contentProviderId: undefined,
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "newstile"
            },
            vizRef2: {
                id: "vizRef2",
                isBookmark: true,
                contentProviderId: "S4SYSTEM",
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "newstile"
            },
            vizRef3: {
                id: "vizRef3",
                isBookmark: true,
                contentProviderId: "IBPSYSTEM",
                target: { semanticObject: "Action", action: "toappnavsample" },
                vizType: "smartbusinesstile"
            }
        };

        const aExpectedBookmarks = [
            { pageId: "page1", sectionId: "section1", vizRefId: "vizRef1" }
        ];

        // Act
        const oFindBookmarksPromise = this.oPagesService._findBookmarks({
            url: "#Action-toappnavsample",
            vizType: "newstile",
            contentProviderId: "" // default content provider id
        });

        // Assert
        return oFindBookmarksPromise
            .then((aFoundBookmarks) => {
                assert.deepEqual(aFoundBookmarks, aExpectedBookmarks, "The correct bookmark is found.");
            });
    });

    QUnit.module("The function countBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves({});

            this.oPagesService = new Pages();
            this.oFindBookmarksStub = sandbox.stub(this.oPagesService, "_findBookmarks");
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Returns the number of found bookmarks", function (assert) {
        // Arrange
        const oFindArguments = {
            url: "#Action-toappnavsample",
            vizType: "newstile"
        };
        this.oFindBookmarksStub.withArgs(oFindArguments).resolves([{}, {}, {}]);

        // Act
        const oCountPromise = this.oPagesService.countBookmarks({
            url: "#Action-toappnavsample",
            vizType: "newstile"
        });

        // Assert
        return oCountPromise
            .then((iCount) => {
                assert.strictEqual(iCount, 3, "The correct bookmark count is returned.");
            });
    });

    QUnit.module("The function deleteBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves({});

            this.oPagesService = new Pages();

            const oFoundBookmarks = [
                { pageId: "id1", sectionId: "id1", vizRefId: "id1" },
                { pageId: "id2", sectionId: "id2", vizRefId: "id2" },
                { pageId: "id3", sectionId: "id3", vizRefId: "id3" }
            ];
            this.oFindBookmarksStub = sandbox.stub(this.oPagesService, "_findBookmarks");
            this.oFindBookmarksStub.withArgs({ url: "#Action-toappnavsample" }).resolves(oFoundBookmarks);

            this.oFindVisualizationStub = sandbox.stub(this.oPagesService, "findVisualization");
            this.oFindVisualizationStub.withArgs("id1", "id1", null, "id1").resolves([{
                pageId: "id1",
                sectionIndex: 1,
                vizIndexes: [1]
            }]);
            this.oFindVisualizationStub.withArgs("id2", "id2", null, "id2").resolves([{
                pageId: "id2",
                sectionIndex: 2,
                vizIndexes: [2]
            }]);
            this.oFindVisualizationStub.withArgs("id3", "id3", null, "id3").resolves([{
                pageId: "id3",
                sectionIndex: 3,
                vizIndexes: [3]
            }]);

            this.oGetPageIndexStub = sandbox.stub(this.oPagesService, "getPageIndex");
            this.oGetPageIndexStub.withArgs("id1").returns(1);
            this.oGetPageIndexStub.withArgs("id2").returns(2);
            this.oGetPageIndexStub.withArgs("id3").returns(3);

            this.oDeleteVisualizationStub = sandbox.stub(this.oPagesService, "deleteVisualization").resolves();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Deletes the found bookmarks", function (assert) {
        // Arrange
        const oExpectedDeleteParameters = [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3]
        ];

        // Act
        const oDeletePromise = this.oPagesService.deleteBookmarks({ url: "#Action-toappnavsample" });

        // Assert
        return oDeletePromise
            .then((iActualCount) => {
                assert.deepEqual(this.oDeleteVisualizationStub.args, oExpectedDeleteParameters,
                    "Delete visualization is called with the correct parameters in the correct order.");
                assert.strictEqual(iActualCount, 3, "The number of deleted bookmarks is returned correctly.");
            });
    });

    QUnit.test("Deletes as many bookmarks as possible if one of the delete calls fails", function (assert) {
        // Arrange
        this.oDeleteVisualizationStub.onSecondCall().rejects(new Error("Failed intentionally"));
        const oExpectedDeleteParameters = [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3]
        ];

        // Act
        const oDeletePromise = this.oPagesService.deleteBookmarks({ url: "#Action-toappnavsample" });

        // Assert
        return oDeletePromise
            .then((iActualCount) => {
                assert.deepEqual(this.oDeleteVisualizationStub.args, oExpectedDeleteParameters,
                    "Delete visualization is called with the correct parameters in the correct order.");
                assert.strictEqual(iActualCount, 2, "The number of deleted bookmarks is returned correctly.");
            });
    });

    QUnit.test("Deletes the found bookmarks only from specific page", function (assert) {
        // Arrange
        const oExpectedDeleteParameters = [
            [1, 1, 1]
        ];

        // Act
        const oDeletePromise = this.oPagesService.deleteBookmarks({ url: "#Action-toappnavsample" }, "id1");

        // Assert
        return oDeletePromise
            .then((iActualCount) => {
                assert.deepEqual(this.oDeleteVisualizationStub.args, oExpectedDeleteParameters,
                    "Delete visualization is called with the correct parameters in the correct order.");
                assert.strictEqual(iActualCount, 1, "The number of deleted bookmarks is returned correctly.");
            });
    });

    QUnit.test("Deletes the found bookmarks only from specific page and section", function (assert) {
        // Arrange
        const oExpectedDeleteParameters = [
            [1, 1, 1]
        ];

        // Act
        const oDeletePromise = this.oPagesService.deleteBookmarks({ url: "#Action-toappnavsample" }, "id1", "id1");

        // Assert
        return oDeletePromise
            .then((iActualCount) => {
                assert.deepEqual(this.oDeleteVisualizationStub.args, oExpectedDeleteParameters,
                    "Delete visualization is called with the correct parameters in the correct order.");
                assert.strictEqual(iActualCount, 1, "The number of deleted bookmarks is returned correctly.");
            });
    });

    QUnit.test("Don't deletes the bookmarks if page was not found", function (assert) {
        // Act
        const oDeletePromise = this.oPagesService.deleteBookmarks({ url: "#Action-toappnavsample" }, "not-found");

        // Assert
        return oDeletePromise
            .then((iActualCount) => {
                assert.deepEqual(this.oDeleteVisualizationStub.args, [],
                    "Delete visualization is called with the correct parameters in the correct order.");
                assert.strictEqual(iActualCount, 0, "The number of deleted bookmarks is returned correctly.");
            });
    });

    QUnit.test("Don't deletes the bookmarks if section was not found", function (assert) {
        // Act
        const oDeletePromise = this.oPagesService.deleteBookmarks({ url: "#Action-toappnavsample" }, "id1", "not-found");

        // Assert
        return oDeletePromise
            .then((iActualCount) => {
                assert.deepEqual(this.oDeleteVisualizationStub.args, [],
                    "Delete visualization is called with the correct parameters in the correct order.");
                assert.strictEqual(iActualCount, 0, "The number of deleted bookmarks is returned correctly.");
            });
    });

    QUnit.module("The function updateBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.aFoundBookmarks = [
                { vizRefId: "vizRef1", sectionId: "section1", pageId: "page1" },
                { vizRefId: "vizRef2", sectionId: "section2", pageId: "page1" }
            ];
            this.oGetPageIndexStub = sandbox.stub(Pages.prototype, "getPageIndex");
            this.oGetPageIndexStub.withArgs("page1").returns(0);

            this.oFindVisualizationStub = sandbox.stub(Pages.prototype, "findVisualization");
            this.oFindVisualizationStub.withArgs("page1", "section1", null, "vizRef1").resolves([{
                pageId: "page1",
                sectionIndex: 0,
                vizIndexes: [0]
            }]);

            this.oFindVisualizationStub.withArgs("page1", "section2", null, "vizRef2").resolves([{
                pageId: "page1",
                sectionIndex: 1,
                vizIndexes: [0]
            }]);

            this.oFindBookmarksStub = sandbox.stub(Pages.prototype, "_findBookmarks");
            this.oFindBookmarksStub.withArgs({ url: "#Action-toappnavsample" }).resolves(this.aFoundBookmarks);
            this.oUpdateVisualizationStub = sandbox.stub(Pages.prototype, "updateVisualization").resolves();

            this.oPagesService = new Pages();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Rejects the promise if first parameter isn't a URL", function (assert) {
        return this.oPagesService.updateBookmarks(undefined, {}).catch(() => {
            assert.ok(true, "A promise was rejected");
        });
    });

    QUnit.test("Rejects the promise if the second parameter isn't an object", function (assert) {
        return this.oPagesService.updateBookmarks({ url: "#Action-toappnavsample" }, undefined).catch(() => {
            assert.ok(true, "A promise was rejected");
        });
    });

    QUnit.test("Rejects if bookmark visualizations cannot be retrieved", function (assert) {
        // Arrange
        this.oFindBookmarksStub.withArgs({ url: "#Action-toappnavsample" }).rejects(new Error("Failed intentionally"));
        // Act
        return this.oPagesService.updateBookmarks({ url: "#Action-toappnavsample" }, {})
            .then(() => {
                // Assert
                assert.ok(false, "promise should have been rejected");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
                assert.ok(this.oGetPageIndexStub.notCalled, "getPageIndex was not called");
            });
    });

    QUnit.test("Returns a promise that resolves to the number of updated bookmarks", function (assert) {
        return this.oPagesService.updateBookmarks({ url: "#Action-toappnavsample" }, {}).then((iCount) => {
            assert.strictEqual(iCount, 2, "The correct number was returned");
            assert.strictEqual(this.oFindBookmarksStub.callCount, 1, "retrieveBookmarkVisualizations was called exactly once");
            assert.strictEqual(this.oGetPageIndexStub.callCount, 2, "getPageIndex was called exactly twice");
            assert.strictEqual(this.oUpdateVisualizationStub.callCount, 2, "updateVisualization was called exactly twice");
        });
    });

    QUnit.test("Passes the correctly mapped parameters to updateVisualization", function (assert) {
        // Arrange
        const oUpdateParameters = {
            title: "Title",
            subtitle: "Subtitle",
            icon: "sap-icon://icon",
            info: "Info",
            numberUnit: "EUR",
            serviceUrl: "/service/url",
            serviceRefreshInterval: "300",
            url: "#Action-tobookmarksample",
            vizConfig: { parameter1: "value1" }
        };

        const oTarget = {
            semanticObject: "Action",
            action: "tobookmarksample"
        };
        sandbox.stub(utilsCdm, "toTargetFromHash").withArgs("#Action-tobookmarksample").returns(oTarget);
        sandbox.stub(readUtils, "harmonizeTarget").withArgs(oTarget).returns(oTarget);

        const oExpectedParameters = {
            title: "Title",
            subtitle: "Subtitle",
            icon: "sap-icon://icon",
            info: "Info",
            numberUnit: "EUR",
            indicatorDataSource: { path: "/service/url", refresh: "300" },
            target: { semanticObject: "Action", action: "tobookmarksample" },
            vizConfig: { parameter1: "value1" }
        };

        // Act
        const oUpdatePromise = this.oPagesService.updateBookmarks({ url: "#Action-toappnavsample" }, oUpdateParameters);

        // Assert
        return oUpdatePromise.then(() => {
            assert.deepEqual(this.oUpdateVisualizationStub.args[0][3], oExpectedParameters, "The correct parameters were passed.");
        });
    });

    QUnit.test("Passes parameters, that are set to an empty string to clear them, to updateVisualization", function (assert) {
        // Arrange
        const oUpdateParameters = {
            subtitle: "",
            icon: "",
            info: "",
            numberUnit: "",
            serviceUrl: "",
            serviceRefreshInterval: ""
        };

        const oExpectedParameters = {
            subtitle: "",
            icon: "",
            info: "",
            numberUnit: "",
            indicatorDataSource: { path: "", refresh: "" },
            vizConfig: undefined
        };

        // Act
        const oUpdatePromise = this.oPagesService.updateBookmarks({ url: "#Action-toappnavsample" }, oUpdateParameters);

        // Assert
        return oUpdatePromise.then(() => {
            assert.deepEqual(this.oUpdateVisualizationStub.args[0][3], oExpectedParameters, "The correct parameters were passed.");
        });
    });

    QUnit.test("Doesn't allow to clear title and target by setting them to an empty string", function (assert) {
        // Arrange
        const oUpdateParameters = {
            title: "",
            url: "",
            subtitle: "Subtitle"
        };

        const oExpectedParameters = {
            subtitle: "Subtitle",
            icon: undefined,
            info: undefined,
            numberUnit: undefined,
            indicatorDataSource: { path: undefined, refresh: undefined },
            vizConfig: undefined
        };

        // Act
        const oUpdatePromise = this.oPagesService.updateBookmarks({ url: "#Action-toappnavsample" }, oUpdateParameters);

        // Assert
        return oUpdatePromise.then(() => {
            assert.deepEqual(this.oUpdateVisualizationStub.args[0][3], oExpectedParameters, "The correct parameters were passed.");
        });
    });

    QUnit.module("The function updateVisualization", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oMockVisualization = {
                id: "viz-0",
                title: "title",
                subtitle: "subtitle",
                target: { semanticObject: "Action", action: "toappnavsample" },
                icon: "icon",
                info: "thisIsActuallyAFooter",
                indicatorDataSource: { path: "testUrl", refresh: "20" },
                isBookmark: true,
                displayFormatHint: DisplayFormat.Standard
            };
            this.oExpectedVisualization = deepClone(this.oMockVisualization);

            this.oMockModel = {
                pages: [{
                    id: "page-1",
                    sections: [{
                        id: "section-0",
                        title: "Section 0",
                        default: "true",
                        visualizations: [this.oMockVisualization]
                    }, {
                        id: "section-1",
                        title: "Section 1",
                        visualizations: [{ id: "viz-0" }]
                    }]
                }]
            };

            this.oPagesService = new Pages();
            this.oPagesService.getModel()._setProperty("/", this.oMockModel);

            this.oVisualizations = {
                viz1: {}
            };
            this.oApplications = {
                app1: {}
            };
            this.oVizTypes = {
                vizType1: {}
            };
            this.oCommonDataModelService = {
                getCachedVisualizations: sandbox.stub().returns(this.oVisualizations),
                getApplications: sandbox.stub().returns(this.oApplications),
                getCachedVizTypes: sandbox.stub().returns(this.oVizTypes)
            };
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);

            sandbox.stub(this.oPagesService, "_getVisualizationData").withArgs("page-1", undefined,
                this.oVisualizations, sinon.match.any, this.oApplications, this.oVizTypes)
                .callsFake((sPageId, sVizId, oVisualizations, oVizRef) => {
                    const oVisualization = extend({}, oVizRef);
                    oVisualization.subtitle = oVisualization.subTitle;
                    delete oVisualization.subTitle;
                    return oVisualization;
                });

            this.oUpdateVisualizationCDMDataStub = sandbox.stub(Pages.prototype, "_updateVisualizationCDMData").resolves();
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("Returns the ids for page, section and vizRef", function (assert) {
        // Arrange
        const oExpectedResult = {
            pageId: "page-1",
            sectionId: "section-1",
            vizRefId: "viz-0"
        };
        // Act
        return this.oPagesService.updateVisualization(0, 1, 0, {}).then((oResult) => {
            // Assert
            assert.deepEqual(oResult, oExpectedResult, "the correct result was resolved");
        });
    });

    QUnit.test("updates all parameters on the visualization and passes them to the CDM update", function (assert) {
        // Arrange
        const oVisualizationData = {
            title: "anotherTitle",
            target: { semanticObject: "anotherSemanticObject", action: "anotherAction" },
            subtitle: "anotherSubtitle",
            icon: "anotherIcon",
            numberUnit: "EUR",
            info: "thisIsActuallyAnotherFooter",
            indicatorDataSource: { path: "testUrlOther", refresh: "10" },
            vizConfig: { parameter1: "value1" },
            displayFormatHint: DisplayFormat.Compact
        };

        const oExpectedVisualization = {
            id: "viz-0",
            title: "anotherTitle",
            target: { semanticObject: "anotherSemanticObject", action: "anotherAction" },
            subtitle: "anotherSubtitle",
            icon: "anotherIcon",
            numberUnit: "EUR",
            info: "thisIsActuallyAnotherFooter",
            indicatorDataSource: { path: "testUrlOther", refresh: "10" },
            vizConfig: { parameter1: "value1" },
            isBookmark: true,
            displayFormatHint: DisplayFormat.Compact
        };

        const oExpectedCdmUpdateProperties = [
            "page-1",
            "section-0",
            "viz-0",
            {
                title: "anotherTitle",
                target: { semanticObject: "anotherSemanticObject", action: "anotherAction" },
                subtitle: "anotherSubtitle",
                icon: "anotherIcon",
                info: "thisIsActuallyAnotherFooter",
                numberUnit: "EUR",
                indicatorDataSource: { path: "testUrlOther", refresh: "10" },
                vizConfig: { parameter1: "value1" },
                displayFormatHint: DisplayFormat.Compact
            }
        ];

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0], oExpectedVisualization, "the visualization was updated correctly");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0], oExpectedCdmUpdateProperties, "the changed properties were passed to the CDM update");
        });
    });

    QUnit.test("updates only the parameters with different values than the ones set", function (assert) {
        // Arrange
        const oVisualizationData = {
            title: "title",
            subtitle: "subtitle",
            target: { semanticObject: "Action", action: "toappnavsample" },
            icon: "icon",
            info: "thisIsActuallyAFooter",
            indicatorDataSource: { path: "testUrl", refresh: "20" },
            displayFormatHint: DisplayFormat.Standard
        };

        const oExpectedCdmUpdateProperties = [
            "page-1",
            "section-0",
            "viz-0",
            {}
        ];

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0], this.oExpectedVisualization, "no properties were updated on the visualization");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0], oExpectedCdmUpdateProperties, "no properties were passed to the CDM update");
        });
    });

    QUnit.test("doesn't change properties that are not supplied", function (assert) {
        // Arrange
        const oVisualizationData = {};
        const oExpectedCdmUpdateProperties = [
            "page-1",
            "section-0",
            "viz-0",
            {}
        ];

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0], this.oExpectedVisualization, "no properties were updated on the visualization");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0], oExpectedCdmUpdateProperties, "no properties were passed to the CDM update");
        });
    });

    QUnit.test("updates the properties of the indicator data source independently", function (assert) {
        // Arrange
        const oVisualizationData = {
            indicatorDataSource: { refresh: "10" }
        };

        this.oExpectedVisualization.indicatorDataSource.refresh = "10";

        const oExpectedCdmUpdateProperties = [
            "page-1",
            "section-0",
            "viz-0",
            {
                indicatorDataSource: { path: "testUrl", refresh: "10" }
            }
        ];

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0], this.oExpectedVisualization, "the refresh interval was updated");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0], oExpectedCdmUpdateProperties, "the complete indicator data source was passed to the CDM update");
        });
    });

    QUnit.test("doesn't update the indicator data source if its properties are undefined", function (assert) {
        // Arrange
        const oVisualizationData = {
            indicatorDataSource: { path: undefined, refresh: undefined }
        };

        const oExpectedCdmUpdateProperties = [
            "page-1",
            "section-0",
            "viz-0",
            {}
        ];

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0], this.oExpectedVisualization, "the visualization was not updated");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0], oExpectedCdmUpdateProperties, "the CDM data was not updated");
        });
    });

    QUnit.test("doesn't update the indicator data source if the source properties are undefined", function (assert) {
        // Arrange
        const oVisualizationData = {
            indicatorDataSource: { path: "/ODATA/SRV_SALES_ORDER", refresh: 5 }
        };

        const oExpectedCdmUpdateProperties = [
            "page-1",
            "section-0",
            "viz-0",
            {}
        ];

        const oExpectedVisualization = {
            id: "viz-0",
            title: "title",
            subtitle: "subtitle",
            target: { semanticObject: "Action", action: "toappnavsample" },
            icon: "icon",
            info: "thisIsActuallyAFooter",
            isBookmark: true,
            displayFormatHint: DisplayFormat.Standard
        };

        delete this.oMockVisualization.indicatorDataSource;

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0], oExpectedVisualization, "the visualization was not updated");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0], oExpectedCdmUpdateProperties, "the CDM data was not updated");
        });
    });

    QUnit.test("merges the supplied vizConfig into the existing vizConfig", function (assert) {
        // Arrange
        this.oMockVisualization.vizConfig = {
            config1: {
                a: "1",
                b: "2",
                c: "3"
            }
        };

        const oVisualizationData = {
            vizConfig: {
                config1: { b: "4" },
                config2: { d: "5" }
            }
        };

        const oExpectedVizConfig = {
            config1: {
                a: "1",
                b: "4",
                c: "3"
            },
            config2: {
                d: "5"
            }
        };

        // Act
        return this.oPagesService.updateVisualization(0, 0, 0, oVisualizationData).then(() => {
            // Assert
            assert.deepEqual(this.oMockModel.pages[0].sections[0].visualizations[0].vizConfig, oExpectedVizConfig, "the vizConfig was updated correctly");
            assert.deepEqual(this.oUpdateVisualizationCDMDataStub.args[0][3].vizConfig, oExpectedVizConfig, "the CDM data was updated correctly");
        });
    });

    QUnit.module("The function updateVisualizationCDMData", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oPageMock = {
                identification: { id: "page1" },
                payload: {
                    sections: {
                        section1: {
                            id: "section1",
                            viz: {
                                vizRef1: {
                                    id: "vizRef1",
                                    title: "Title",
                                    target: { semanticObject: "Action", action: "toappnavsample" },
                                    isBookmark: true
                                }
                            }
                        }
                    }
                }
            };

            this.oVisualizationData = {
                title: "changed title",
                target: { semanticObject: "Action", action: "tobookmarksample" },
                subtitle: "subtitle",
                icon: "icon",
                info: "thisIsActuallyAFooter",
                indicatorDataSource: { path: "/service/url", refresh: "300" },
                vizConfig: { parameter1: "value1" }
            };

            this.oSavePersonalizationStub = sandbox.stub(Pages.prototype, "savePersonalization").resolves();
            this.oSetPersonalizationActiveStub = sandbox.stub(Pages.prototype, "setPersonalizationActive");

            this.oCommonDataModelService = {
                getPage: sandbox.stub().resolves(this.oPageMock)
            };

            this.oPagesService = new Pages();
            this.oPagesService._oCdmServicePromise = Promise.resolve(this.oCommonDataModelService);
        },
        afterEach: function () {
            sandbox.restore();
            Container.reset();
        }
    });

    QUnit.test("resolves the promise after updating the vizRef", function (assert) {
        // Arrange
        const oExpectedVizRef = {
            id: "vizRef1",
            title: "changed title",
            target: { semanticObject: "Action", action: "tobookmarksample" },
            subTitle: "subtitle",
            icon: "icon",
            info: "thisIsActuallyAFooter",
            indicatorDataSource: { path: "/service/url", refresh: "300" },
            vizConfig: { parameter1: "value1" },
            isBookmark: true
        };

        // Act
        return this.oPagesService._updateVisualizationCDMData("page1", "section1", "vizRef1", this.oVisualizationData)
            .then(() => {
                const oVizRef = this.oPageMock.payload.sections.section1.viz.vizRef1;
                // Assert
                assert.deepEqual(oVizRef, oExpectedVizRef, "The cdm data was updated");
                assert.strictEqual(this.oSavePersonalizationStub.args[0][0], this.oPageMock.identification.id,
                    "SavePersonalization was called with the correct page");
            })
            .catch(() => {
                // Assert
                assert.ok(false, "The promise was rejected");
            });
    });

    QUnit.test("does not add invalid properties to the vizRef", function (assert) {
        // Arrange
        this.oVisualizationData = {
            title: "changed title",
            invalidProperty: "totally invalid"
        };

        const oExpectedVizRef = {
            id: "vizRef1",
            title: "changed title",
            target: { semanticObject: "Action", action: "toappnavsample" },
            isBookmark: true
        };

        // Act
        return this.oPagesService._updateVisualizationCDMData("page1", "section1", "vizRef1", this.oVisualizationData)
            .then(() => {
                const oVizRef = this.oPageMock.payload.sections.section1.viz.vizRef1;
                // Assert
                assert.deepEqual(oVizRef, oExpectedVizRef, "The property was not added");
            });
    });

    QUnit.test("rejects and resets personalization if CDMService cannot be loaded", function (assert) {
        // Arrange
        this.oPagesService._oCdmServicePromise = Promise.reject(new Error("could not resolve service"));
        // Act
        return this.oPagesService._updateVisualizationCDMData("section1", "vizRef1", this.oPageMock, this.oVisualizationData)
            .then(() => {
                assert.ok(false, "should have rejected");
            })
            .catch(() => {
                // Assert
                assert.strictEqual(this.oSetPersonalizationActiveStub.callCount, 1, "setPersonalizationActive was called exactly once");
                assert.strictEqual(this.oSetPersonalizationActiveStub.args[0][0], false,
                    "setPersonalizationActive was called with 'false'");
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.test("rejects and resets personalization if the page cannot be loaded", function (assert) {
        // Arrange
        this.oCommonDataModelService.getPage.rejects(new Error("could not resolve page"));
        // Act
        return this.oPagesService._updateVisualizationCDMData("section1", "vizRef1", this.oPageMock, this.oVisualizationData)
            .then(() => {
                // Assert
                assert.ok(false, "promise should have been rejected");
            })
            .catch(() => {
                assert.strictEqual(this.oCommonDataModelService.getPage.callCount, 1, "getPage was called exactly once");
                assert.ok(true, "promise was rejected");
            });
    });
});
