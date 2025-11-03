// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.appfinder.EasyAccess
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/datajs",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container",
    "sap/ushell/resources"
], (
    Log,
    MessageBox,
    Controller,
    JSONModel,
    datajs,
    jQuery,
    Container,
    ushellResources
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The function onInit", {
        beforeEach: function () {
            return Controller.create({ name: "sap.ushell.components.appfinder.EasyAccess" }).then((oController) => {
                this.oController = oController;
                this.oLoadPersonalizedGroupsStub = sandbox.stub();
                this.oHomepageManager = {
                    loadPersonalizedGroups: this.oLoadPersonalizedGroupsStub
                };
                this.oView = {
                    getModel: function () {
                        const oModel = new JSONModel();
                        oModel.setData({});
                        return oModel;
                    },
                    getViewData: function () {
                        return { menuName: "testName" };
                    },
                    hierarchyFolders: {
                        setModel: function () {
                        }
                    },
                    hierarchyApps: {
                        setModel: function () {
                        }
                    }
                };

                this.oGetViewStub = sandbox.stub(this.oController, "getView")
                    .callsFake(() => {
                        return this.oView;
                    });
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("checks if homepage manager is initialized and personalized groups are loaded.", function (assert) {
        const done = assert.async();
        // Arrange
        // var oGetHomepageManagerSpy = sandbox.stub(HomepageManager.prototype, "getInstance").returns(this.oHomepageManager);
        const fnGetInstance = sandbox.stub().returns(this.oHomepageManager);
        // var oGetHomepageManagerSpy = sinon.fake.returns(this.oHomepageManager);
        sandbox.stub(sap.ui, "require").callsFake((aModules, fnCallback) => {
            if (aModules[0].indexOf("HomepageManager") > -1) {
                assert.ok(true, "HomepageManager required");
                const oHPM = {};
                oHPM.prototype = {};
                oHPM.prototype.getInstance = fnGetInstance;
                fnCallback(oHPM);
            }
        });

        // Act
        this.oController.onInit();

        // Assert
        setTimeout(() => {
            assert.strictEqual(fnGetInstance.callCount, 1, "Homepage manager was fetched once.");
            assert.strictEqual(this.oLoadPersonalizedGroupsStub.callCount, 1, "Groups were loaded once.");
            done();
        }, 100);
    });

    QUnit.test("Does not load the groups again if they are already loaded.", function (assert) {
        // Arrange
        this.oGetViewStub.restore();
        const aGroups = [{ id: "group1" }];
        this.oView = {
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData({
                    catalogs: {
                        groups: aGroups
                    }
                });
                return oModel;
            },
            getViewData: function () {
                return { menuName: "testName" };
            },
            hierarchyFolders: {
                setModel: function () {
                }
            },
            hierarchyApps: {
                setModel: function () {
                }
            }
        };

        sandbox.stub(this.oController, "getView")
            .callsFake(() => {
                return this.oView;
            });

        // Act
        this.oController.onInit();

        // Assert
        assert.strictEqual(this.oLoadPersonalizedGroupsStub.callCount, 0, "The groups were not loaded.");
    });

    QUnit.module("sap.ushell.components.appfinder.EasyAccess", {
        beforeEach: function () {
            sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
                registerTileActionsProvider: sandbox.stub()
            }));
            sandbox.stub(Container, "getUser").returns({ getLanguage: sandbox.stub() });
            sandbox.stub(Container, "getLogonSystem");

            return Controller.create({ name: "sap.ushell.components.appfinder.EasyAccess" }).then((oController) => {
                this.oController = oController;
                const oModel = new JSONModel();
                this.oView = {
                    getModel: function () {
                        return oModel;
                    },
                    getViewData: function () {
                        return { menuName: "testName" };
                    },
                    getId: function () {
                        return "viewId";
                    },
                    splitApp: {
                        addDetailPage: function (/* oPage */) {
                        },
                        toDetail: function (/* oPage */) {
                        },
                        getCurrentDetailPage: function () {
                            return {};
                        }
                    }
                };
                this.oController.getView = function () {
                    return this.oView;
                }.bind(this);
                this.oController.oView = this.oView;
                this.oResult = {};
                this.bODataFailed = false;
                this.ODataReadStub = sandbox.stub(datajs, "read")
                    .callsFake((request, success, fail) => {
                        if (this.bODataFailed) {
                            fail({ message: "Did not manage to read odata" });
                        } else {
                            success(this.oResult, { statusCode: 200 });
                        }
                    });
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("invoke Controller Search Handler - non first time. ", function (assert) {
        const fnDone = assert.async();
        const spyAddDetailPage = sandbox.spy(this.oView.splitApp, "addDetailPage");
        const spyToDetailPage = sandbox.spy(this.oView.splitApp, "toDetail");
        const stubGetCurrentDetailPage = sandbox.stub(this.oView.splitApp, "getCurrentDetailPage")
            .callsFake(() => {
                return {
                    setBusy: function () {
                        return;
                    }
                };
            });

        const fnOrigGetSearchResults = this.oController._getSearchResults;
        this.oController._getSearchResults = function () {
            const oDeferred = new jQuery.Deferred();
            oDeferred.resolve({ results: [], count: 0 });
            return oDeferred.promise();
        };

        // just an object to simulate the search-results-view (hierarchy apps view)
        // so controller assumes it had been created before
        this.oController.easyAccessSearchResultsModel = new JSONModel();
        this.oController.pHierarchyAppsSearchResults = Promise.resolve({
            resultText: {
                updateProperty: function () {
                }
            },
            updateResultSetMessage: function () {
            }
        });

        // invoke the search
        this.oController.handleSearch("term");
        setTimeout(() => {
            // no call to add page as the controller assumes the view created
            assert.equal(spyAddDetailPage.callCount, 0);
            // call to navigation (page.go)
            assert.equal(spyToDetailPage.callCount, 1);
            // call for navigating to the search-results-hierarchy-apps-page
            assert.equal(spyToDetailPage.getCall(0).args[0], "viewIdhierarchyAppsSearchResults");

            spyAddDetailPage.restore();
            spyToDetailPage.restore();
            stubGetCurrentDetailPage.restore();
            this.oController._getSearchResults = fnOrigGetSearchResults;
            delete this.oController.easyAccessSearchResultsModel;
            delete this.oController.hierarchyAppsSearchResults;

            fnDone();
        }, 10);
    });

    QUnit.test("getMenuItems with configuration sapMenuServiceUrl=/sap/opu/someUrl, should call callODataService with /sap/opu/someUrl parameter", function (assert) {
        const spyCallODataService = sandbox.spy(this.oController, "_callODataService");
        this.oController.getView().getModel().setProperty("/sapMenuServiceUrl", "/sap/opu/someUrl");
        this.oController.getMenuItems("SAP_MENU", "UV2", "", 0);
        const url = "/sap/opu/someUrl;o=UV2/MenuItems?$filter=level lt '04'&$orderby=level,text";
        assert.equal(spyCallODataService.getCall(0).args[0].requestUri, url);
        spyCallODataService.restore();
    });

    QUnit.test("getMenuItems with configuration userMenuServiceUrl=/sap/opu/someUrl, should call callODataService with /sap/opu/someUrl parameter", function (assert) {
        this.oController.getView().getModel().setProperty("/userMenuServiceUrl", "/sap/opu/someUrl");
        const spyCallODataService = sandbox.spy(this.oController, "_callODataService");
        this.oController.getMenuItems("USER_MENU", "UV2", "", 0);
        const url = "/sap/opu/someUrl;o=UV2/MenuItems?$filter=level lt '04'&$orderby=level,text";
        assert.equal(spyCallODataService.getCall(0).args[0].requestUri, url);
        spyCallODataService.restore();
    });

    QUnit.test("getMenuItems with no configuration userMenuServiceUrl, should call callODataService with /sap/opu/odata/UI2/ parameter", function (assert) {
        const spyCallODataService = sandbox.spy(this.oController, "_callODataService");
        this.oController.getMenuItems("USER_MENU", "UV2", "", 0);
        const url = "/sap/opu/odata/UI2/USER_MENU;o=UV2/MenuItems?$filter=level lt '04'&$orderby=level,text";
        assert.equal(spyCallODataService.getCall(0).args[0].requestUri, url);
        spyCallODataService.restore();
    });

    QUnit.test("getMenuItems with no configuration sapMenuServiceUrl, should call callODataService with /sap/opu/odata/UI2/ parameter", function (assert) {
        const spyCallODataService = sandbox.spy(this.oController, "_callODataService");
        this.oController.getMenuItems("SAP_MENU", "UV2", "", 0);
        const url = "/sap/opu/odata/UI2/EASY_ACCESS_MENU;o=UV2/MenuItems?$filter=level lt '04'&$orderby=level,text";
        assert.equal(spyCallODataService.getCall(0).args[0].requestUri, url);
        spyCallODataService.restore();
    });

    QUnit.test("getMenuItems with invalid menu_type parameter should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("INVALID_MENU_TYPE", "UV2", "", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid menuType parameter");
        });
    });

    QUnit.test("getMenuItems with menu_type parameter = null should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems(null, "UV2", "", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid menuType parameter");
        });
    });

    QUnit.test("getMenuItems with menu_type parameter = undefined should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems(undefined, "UV2", "", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid menuType parameter");
        });
    });

    QUnit.test("getMenuItems with systemId parameter = \"\" should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "", "", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid systemId parameter");
        });
    });

    QUnit.test("getMenuItems with systemId parameter = null should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", null, "", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid systemId parameter");
        });
    });

    QUnit.test("getMenuItems with systemId parameter = undefined should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", undefined, "", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid systemId parameter");
        });
    });

    QUnit.test("getMenuItems with entityId parameter = undefined should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", undefined, 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid entityId parameter");
        });
    });

    QUnit.test("getMenuItems with entityId parameter = null should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", null, 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid entityId parameter");
        });
    });

    QUnit.test("getMenuItems with entityId parameter not string should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", 1, 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid entityId parameter");
        });
    });

    QUnit.test("getMenuItems with entityLevel parameter not an int should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", "", "1", 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid entityLevel parameter");
        });
    });

    QUnit.test("getMenuItems with entityLevel parameter = null should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", "", null, 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid entityLevel parameter");
        });
    });

    QUnit.test("getMenuItems with entityLevel parameter = undefined should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", "", undefined, 0);
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid entityLevel parameter");
        });
    });

    QUnit.test("getMenuItems with numberOfNextLevels parameter not an int should fail ", function (assert) {
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "UV2", "", 1, "1");
        oGetMenuItemsPromise.fail((oError) => {
            assert.equal(oError.message, "Invalid numberOfNextLevels parameter");
        });
    });

    QUnit.test("getMenuItems(\"SAP_MENU\",\"LOCAL\",\"\",0,2) should resolve an object with 2 levels from the root node", function (assert) {
        const done = assert.async();
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [{
                id: "id1",
                text: "text1",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                folders: [{
                    id: "id11",
                    text: "text11",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    folders: undefined,
                    apps: undefined
                }],
                apps: []
            }, {
                id: "id2",
                text: "text2",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                folders: [],
                apps: [{
                    id: "id21",
                    text: "text21",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }],
            apps: [{
                id: "id3",
                text: "text3",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                url: "#someIntent?sap-system=LOCAL"
            }]
        };

        this.oResult = {
            results: [{
                Id: "id1",
                level: "01",
                text: "text1",
                parentId: "",
                type: "FL",
                url: ""
            }, {
                Id: "id2",
                level: "01",
                text: "text2",
                parentId: "",
                type: "FL",
                url: ""
            }, {
                Id: "id3",
                level: "01",
                text: "text3",
                parentId: "",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id11",
                level: "02",
                text: "text11",
                parentId: "id1",
                type: "FL",
                url: ""
            }, {
                Id: "id21",
                level: "02",
                text: "text21",
                parentId: "id2",
                type: "INT",
                url: "#someIntent"
            }]
        };

        const oGetMenuItemsPromise = this.oController.getMenuItems("SAP_MENU", "LOCAL", "", 0, 2);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("getMenuItems(\"SAP_MENU\",\"LOCAL\",\"\",0) should resolve an object with 3 levels(default) from the root node", function (assert) {
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [{
                id: "id1",
                text: "text1",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                folders: [{
                    id: "id11",
                    text: "text11",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    folders: [{
                        id: "id111",
                        text: "text111",
                        icon: undefined,
                        subtitle: undefined,
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }, {
                    id: "id12",
                    text: "text12",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    folders: [{
                        id: "id121",
                        text: "text121",
                        icon: undefined,
                        subtitle: undefined,
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }, {
                        id: "id122",
                        text: "text122",
                        icon: undefined,
                        subtitle: undefined,
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }],
                apps: []
            }, {
                id: "id2",
                text: "text2",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                folders: [{
                    id: "id21",
                    text: "text21",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    folders: [],
                    apps: []
                }, {
                    id: "id22",
                    text: "text22",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    folders: [{
                        id: "id221",
                        text: "text221",
                        icon: undefined,
                        subtitle: undefined,
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }, {
                        id: "id222",
                        text: "text222",
                        icon: undefined,
                        subtitle: undefined,
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: [{
                        id: "id223",
                        text: "text223",
                        icon: undefined,
                        subtitle: undefined,
                        level: 3,
                        url: "#someIntent?sap-system=LOCAL"
                    }]
                }],
                apps: [{
                    id: "id23",
                    text: "text23",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }],
            apps: [{
                id: "id3",
                text: "text3",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                url: "#someIntent?sap-system=LOCAL"
            }]
        };

        this.oResult = {
            results: [{
                Id: "id1",
                level: "01",
                text: "text1",
                parentId: "",
                type: "FL",
                url: ""
            }, {
                Id: "id2",
                level: "01",
                text: "text2",
                parentId: "",
                type: "FL",
                url: ""
            }, {
                Id: "id3",
                level: "01",
                text: "text3",
                parentId: "",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id11",
                level: "02",
                text: "text11",
                parentId: "id1",
                type: "FL",
                url: ""
            }, {
                Id: "id23",
                level: "02",
                text: "text23",
                parentId: "id2",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id12",
                text: "text12",
                level: "02",
                type: "FL",
                parentId: "id1"
            }, {
                Id: "id21",
                text: "text21",
                level: "02",
                type: "FL",
                parentId: "id2"
            }, {
                Id: "id22",
                text: "text22",
                level: "02",
                type: "FL",
                parentId: "id2"
            }, {
                Id: "id111",
                text: "text111",
                level: "03",
                type: "FL",
                parentId: "id11"
            }, {
                Id: "id121",
                text: "text121",
                level: "03",
                type: "FL",
                parentId: "id12"
            }, {
                Id: "id122",
                text: "text122",
                level: "03",
                type: "FL",
                parentId: "id12"
            }, {
                Id: "id223",
                level: "03",
                text: "text223",
                parentId: "id22",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id221",
                text: "text221",
                level: "03",
                type: "FL",
                parentId: "id22"
            }, {
                Id: "id222",
                text: "text222",
                level: "03",
                type: "FL",
                parentId: "id22"
            }]
        };
        const done = assert.async();

        this.oController.getMenuItems("SAP_MENU", "LOCAL", "", 0)
            .then((data) => {
                assert.deepEqual(data, expectedData);
                done();
            })
            .always(() => {
                datajs.read.restore();
            });
    });

    QUnit.test("getMenuItems(\"SAP_MENU\",\"LOCAL\",\"id1\",1,2) should resolve an object with 2 levels from the root node", function (assert) {
        const expectedData = {
            id: "id1",
            folders: [{
                id: "id11",
                text: "text11",
                icon: undefined,
                subtitle: undefined,
                level: 2,
                folders: [{
                    id: "id111",
                    text: "text111",
                    icon: undefined,
                    subtitle: undefined,
                    level: 3,
                    folders: undefined,
                    apps: undefined
                }, {
                    id: "id112",
                    text: "text112",
                    icon: undefined,
                    subtitle: undefined,
                    level: 3,
                    folders: undefined,
                    apps: undefined
                }],
                apps: [{
                    id: "id113",
                    text: "text113",
                    icon: undefined,
                    subtitle: undefined,
                    level: 3,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }],
            apps: [{
                id: "id12",
                text: "text12",
                icon: undefined,
                subtitle: undefined,
                level: 2,
                url: "#someIntent?sap-system=LOCAL"
            }, {
                id: "id13",
                text: "text13",
                icon: undefined,
                subtitle: undefined,
                level: 2,
                url: "#someIntent?sap-system=LOCAL"
            }]
        };

        this.oResult = {
            results: [{
                Id: "id11",
                level: "02",
                text: "text11",
                parentId: "id1",
                type: "FL",
                url: ""
            }, {
                Id: "id12",
                level: "02",
                text: "text12",
                parentId: "id1",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id13",
                level: "02",
                text: "text13",
                parentId: "id1",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id111",
                level: "03",
                text: "text111",
                parentId: "id11",
                type: "FL",
                url: ""
            }, {
                Id: "id112",
                level: "03",
                text: "text112",
                parentId: "id11",
                type: "FL",
                url: ""
            }, {
                Id: "id113",
                level: "03",
                text: "text113",
                parentId: "id11",
                type: "INT",
                url: "#someIntent"
            }]
        };
        const done = assert.async();

        const oGetMenuItemsPromise = this.oController.getMenuItems("SAP_MENU", "LOCAL", "id1", 1, 2);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("getMenuItems(\"SAP_MENU\",\"LOCAL\",\"id1\",1) should resolve an object with 3 levels(default) from the root node", function (assert) {
        const done = assert.async();
        const expectedData = {
            id: "id1",
            folders: [{
                id: "id11",
                text: "text11",
                icon: undefined,
                subtitle: undefined,
                level: 2,
                folders: [{
                    id: "id111",
                    text: "text111",
                    icon: undefined,
                    subtitle: undefined,
                    level: 3,
                    folders: [{
                        id: "id1111",
                        text: "text1111",
                        icon: undefined,
                        subtitle: undefined,
                        level: 4,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }, {
                    id: "id112",
                    text: "text112",
                    icon: undefined,
                    subtitle: undefined,
                    level: 3,
                    folders: [],
                    apps: [{
                        id: "id1121",
                        text: "text1121",
                        icon: undefined,
                        subtitle: undefined,
                        level: 4,
                        url: "#someIntent?sap-system=LOCAL"
                    }]
                }],
                apps: [{
                    id: "id113",
                    text: "text113",
                    icon: undefined,
                    subtitle: undefined,
                    level: 3,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }],
            apps: [{
                id: "id12",
                text: "text12",
                icon: undefined,
                subtitle: undefined,
                level: 2,
                url: "#someIntent?sap-system=LOCAL"
            }, {
                id: "id13",
                text: "text13",
                icon: undefined,
                subtitle: undefined,
                level: 2,
                url: "#someIntent?sap-system=LOCAL"
            }]
        };

        this.oResult = {
            results: [{
                Id: "id11",
                level: "02",
                text: "text11",
                parentId: "id1",
                type: "FL",
                url: ""
            }, {
                Id: "id12",
                level: "02",
                text: "text12",
                parentId: "id1",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id13",
                level: "02",
                text: "text13",
                parentId: "id1",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id111",
                level: "03",
                text: "text111",
                parentId: "id11",
                type: "FL",
                url: ""
            }, {
                Id: "id112",
                level: "03",
                text: "text112",
                parentId: "id11",
                type: "FL",
                url: ""
            }, {
                Id: "id113",
                level: "03",
                text: "text113",
                parentId: "id11",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id1121",
                level: "04",
                text: "text1121",
                parentId: "id112",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id1111",
                level: "04",
                text: "text1111",
                parentId: "id111",
                type: "FL",
                url: ""
            }]
        };

        const oGetMenuItemsPromise = this.oController.getMenuItems("SAP_MENU", "LOCAL", "id1", 1);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("getMenuItems(\"USER_MENU\",\"LOCAL\",\"\",3,2) should resolve an object with 2 levels from the root node(the entityLevel is irrelevant)", function (assert) {
        const done = assert.async();
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [{
                id: "id1",
                text: "text1",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                folders: [{
                    id: "id11",
                    text: "text11",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    folders: undefined,
                    apps: undefined
                }],
                apps: []
            }, {
                id: "id2",
                text: "text2",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                folders: [],
                apps: [{
                    id: "id21",
                    text: "text21",
                    icon: undefined,
                    subtitle: undefined,
                    level: 2,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }],
            apps: [{
                id: "id3",
                text: "text3",
                icon: undefined,
                subtitle: undefined,
                level: 1,
                url: "#someIntent?sap-system=LOCAL"
            }]
        };

        this.oResult = {
            results: [{
                Id: "id1",
                level: "01",
                text: "text1",
                parentId: "",
                type: "FL",
                url: ""
            }, {
                Id: "id2",
                level: "01",
                text: "text2",
                parentId: "",
                type: "FL",
                url: ""
            }, {
                Id: "id3",
                level: "01",
                text: "text3",
                parentId: "",
                type: "INT",
                url: "#someIntent"
            }, {
                Id: "id11",
                level: "02",
                text: "text11",
                parentId: "id1",
                type: "FL",
                url: ""
            }, {
                Id: "id21",
                level: "02",
                text: "text21",
                parentId: "id2",
                type: "INT",
                url: "#someIntent"
            }]
        };

        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "", 3, 2);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("test level 02 with hidden parent", function (assert) {
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [],
            apps: []
        };

        this.oResult = {
            results: [{
                Id: "id1",
                level: "02",
                text: "text1",
                parentId: "",
                type: "FL",
                url: ""
            }]
        };
        const done = assert.async();

        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "", 0);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("test level 0 with hidden parent", function (assert) {
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [],
            apps: []
        };

        this.oResult = {
            results: [{
                apps: [],
                id: "root",
                level: 0,
                text: "root"
            }]
        };
        const done = assert.async();

        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "", 0);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("test level 0 with an undefined parent id", function (assert) {
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [],
            apps: []
        };

        this.oResult = {
            results: [{
                apps: [],
                id: "test2",
                level: 0,
                text: "test",
                parentId: undefined
            }]
        };
        const done = assert.async();

        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "", 0);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("getMenuItems(\"USER_MENU\",\"LOCAL\",\"\",0) without results should return the root element", function (assert) {
        const expectedData = {
            id: "root",
            text: "root",
            level: 0,
            folders: [],
            apps: []
        };

        this.oResult = { results: [] };
        const done = assert.async();

        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "", 0);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("getMenuItems(\"USER_MENU\",\"LOCAL\",\"someId\",3) without results should return the root element", function (assert) {
        const expectedData = {
            id: "someId",
            folders: [],
            apps: []
        };

        this.oResult = { results: [] };
        const done = assert.async();

        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "someId", 3);
        oGetMenuItemsPromise.done((data) => {
            assert.deepEqual(data, expectedData);
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("getMenuItems() with a failure in the odata call, should fail the promise", function (assert) {
        this.bODataFailed = true;
        const oGetMenuItemsPromise = this.oController.getMenuItems("USER_MENU", "LOCAL", "someId", 3);
        const done = assert.async();
        oGetMenuItemsPromise.fail((oError) => {
            assert.deepEqual(oError.message, "Failed to fetch data: Did not manage to read odata");
            done();
        });
        oGetMenuItemsPromise.always(() => {
            datajs.read.restore();
        });
    });

    QUnit.test("checkIfSystemSelectedAndLoadData with no systemSelected should not call loadMenuItemsFirstTime function", function (assert) {
        const testData = {};
        const oView = {
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            getViewData: function () {
                return { menuName: "testName" };
            },
            hierarchyFolders: {
                setModel: function () {
                }
            },
            hierarchyApps: {
                setModel: function () {
                }
            }
        };

        sandbox.stub(this.oController, "getView")
            .callsFake(() => {
                return oView;
            });
        const spyLoadMenuItemsFirstTime = sandbox.spy(this.oController, "loadMenuItemsFirstTime");
        this.oController.onInit();
        this.oController.checkIfSystemSelectedAndLoadData();
        assert.equal(spyLoadMenuItemsFirstTime.callCount, 0);
        this.oController.loadMenuItemsFirstTime.restore();
    });

    QUnit.test("checkIfSystemSelectedAndLoadData with systemSelected should call loadMenuItemsFirstTime function and navigateHierarchy", function (assert) {
        const testData = { systemSelected: { systemName: "system1", systemId: "systemId1" } };
        const oView = {
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            getViewData: function () {
                return { menuName: "testName" };
            },
            hierarchyFolders: {
                setModel: function () {
                }
            },
            hierarchyApps: {
                setModel: function () {
                }
            }
        };

        sandbox.stub(this.oController, "getView")
            .callsFake(() => {
                return oView;
            });
        sandbox.stub(this.oController, "loadMenuItemsFirstTime")
            .callsFake((arg1, arg2) => {
                assert.equal(arg1, "testName");
                assert.equal(arg2.systemName, "system1");
                assert.equal(arg2.systemId, "systemId1");
                const oDeferred = new jQuery.Deferred();
                oDeferred.resolve();
                return oDeferred.promise();
            });
        sandbox.stub(this.oController, "navigateHierarchy")
            .callsFake((arg1, arg2) => {
                assert.equal(arg1, "");
                assert.equal(arg2, false);
            });

        this.oController.onInit();
        this.oController.checkIfSystemSelectedAndLoadData();
        this.oController.getView.restore();
        this.oController.loadMenuItemsFirstTime.restore();
        this.oController.navigateHierarchy.restore();
    });

    QUnit.test("navigateHierarchy with no path and data in model should call updatePageBindings with / path", function (assert) {
        const done = assert.async();
        const testData = {
            id: "someSystem",
            text: "someSystem",
            level: 0,
            folders: [{
                id: "id1",
                text: "text1",
                level: 1,
                folders: [],
                apps: []
            }],
            apps: [{
                id: "id3",
                text: "text3",
                level: 1,
                url: "#someIntent?sap-system=LOCAL"
            }]
        };

        const testEasyAccessModel = new JSONModel();
        testEasyAccessModel.setData(testData);

        const oView = {
            easyAccessModel: testEasyAccessModel,
            pHierarchyFolders: Promise.resolve({
                updatePageBindings: function () {
                },
                setBusy: function () {
                },
                setModel: function () {
                }
            }),
            hierarchyApps: {
                getController: function () {
                    return {
                        updatePageBindings: function (arg1) {
                            assert.equal(arg1, "");
                        }
                    };
                },
                setModel: function () {
                },
                setBusy: function () {
                }
            },
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            getViewData: function () {
                return { menuName: "testName" };
            }
        };

        sandbox.stub(this.oController, "getView")
            .callsFake(() => {
                return oView;
            });

        oView.pHierarchyFolders.then((HierarchyFolders) => {
            sandbox.stub(HierarchyFolders, "updatePageBindings")
                .callsFake((arg1, arg2) => {
                    assert.equal(arg1, "");
                    assert.equal(arg2, true);
                });

            const spyMasterMenuSetBusy = sandbox.spy(HierarchyFolders, "setBusy");
            const stubMBError = sandbox.stub(MessageBox, "error");
            this.oController.onInit();
            this.oController.navigateHierarchy("", true);
            setTimeout(() => {
                assert.ok(spyMasterMenuSetBusy.calledWith(false));
                stubMBError.restore();
                this.oController.getView.restore();
                done();
            });
        });
    });

    QUnit.test("navigateHierarchy with path and data in model should call updatePageBindings with the path", function (assert) {
        const done = assert.async();
        const testData = {
            id: "someSystem",
            text: "someSystem",
            level: 0,
            folders: [{
                id: "id1",
                text: "text1",
                level: 1,
                folders: [{
                    id: "id11",
                    text: "text11",
                    level: 2,
                    folders: [{
                        id: "id111",
                        text: "text111",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }, {
                    id: "id12",
                    text: "text12",
                    level: 2,
                    folders: [{
                        id: "id121",
                        text: "text121",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }, {
                        id: "id122",
                        text: "text122",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }],
                apps: []
            }, {
                id: "id2",
                text: "text2",
                level: 1,
                folders: [{
                    id: "id21",
                    text: "text21",
                    level: 2,
                    folders: [],
                    apps: []
                }, {
                    id: "id22",
                    text: "text22",
                    level: 2,
                    folders: [{
                        id: "id221",
                        text: "text221",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }, {
                        id: "id222",
                        text: "text222",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: [{
                        id: "id223",
                        text: "text223",
                        level: 3,
                        url: "#someIntent?sap-system=LOCAL"
                    }]
                }],
                apps: [{
                    id: "id23",
                    text: "text23",
                    level: 2,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }]
        };

        const testEasyAccessModel = new JSONModel();
        testEasyAccessModel.setData(testData);

        const oView = {
            easyAccessModel: testEasyAccessModel,
            pHierarchyFolders: Promise.resolve({
                updatePageBindings: function () {
                },
                setBusy: function () {
                },
                setModel: function () {
                }
            }),
            hierarchyApps: {
                getController: function () {
                    return {
                        updatePageBindings: function (arg1) {
                            assert.equal(arg1, "/folders/1/folders/1");
                        }
                    };
                },
                setModel: function () {
                }
            },
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            getViewData: function () {
                return { menuName: "testName" };
            }
        };

        sandbox.stub(this.oController, "getView")
            .callsFake(() => {
                return oView;
            });
        oView.pHierarchyFolders.then((HierarchyFolders) => {
            sandbox.stub(HierarchyFolders, "updatePageBindings")
                .callsFake((arg1, arg2) => {
                    assert.equal(arg1, "/folders/1/folders/1");
                    assert.equal(arg2, true);
                });

            const spyMasterMenuSetBusy = sandbox.spy(HierarchyFolders, "setBusy");

            this.oController.onInit();
            this.oController.easyAccessModel = testEasyAccessModel;
            this.oController.navigateHierarchy("/folders/1/folders/1", true);
            setTimeout(() => {
                assert.ok(spyMasterMenuSetBusy.calledWith(false));
                this.oController.getView.restore();
                done();
            });
        });
    });

    QUnit.test("navigateHierarchy with path and no data in model should call getMenuItems", function (assert) {
        const done = assert.async();
        const testData = {
            id: "someSystem",
            text: "someSystem",
            level: 0,
            folders: [{
                id: "id1",
                text: "text1",
                level: 1,
                folders: [{
                    id: "id11",
                    text: "text11",
                    level: 2,
                    folders: [{
                        id: "id111",
                        text: "text111",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }, {
                    id: "id12",
                    text: "text12",
                    level: 2,
                    folders: [{
                        id: "id121",
                        text: "text121",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }, {
                        id: "id122",
                        text: "text122",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: []
                }],
                apps: []
            }, {
                id: "id2",
                text: "text2",
                level: 1,
                folders: [{
                    id: "id21",
                    text: "text21",
                    level: 2,
                    folders: [],
                    apps: []
                }, {
                    id: "id22",
                    text: "text22",
                    level: 2,
                    folders: [{
                        id: "id221",
                        text: "text221",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }, {
                        id: "id222",
                        text: "text222",
                        level: 3,
                        folders: undefined,
                        apps: undefined
                    }],
                    apps: [{
                        id: "id223",
                        text: "text223",
                        level: 3,
                        url: "#someIntent?sap-system=LOCAL"
                    }]
                }],
                apps: [{
                    id: "id23",
                    text: "text23",
                    level: 2,
                    url: "#someIntent?sap-system=LOCAL"
                }]
            }]
        };

        const testEasyAccessModel = new JSONModel();
        testEasyAccessModel.setData(testData);

        const oView = {
            easyAccessModel: testEasyAccessModel,
            pHierarchyFolders: Promise.resolve({
                updatePageBindings: function () {
                },
                setBusy: function () {
                },
                setModel: function () {
                }
            }),
            hierarchyApps: {
                getController: function () {
                    return {
                        updatePageBindings: function (arg1) {
                            assert.equal(arg1, "/folders/0/folders/0/folders/0");
                        }
                    };
                },
                setModel: function () {
                }
            },
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            getViewData: function () {
                return { menuName: "testName" };
            }
        };

        sandbox.stub(this.oController, "getView")
            .callsFake(() => {
                return oView;
            });
        oView.pHierarchyFolders.then((HierarchyFolders) => {
            sandbox.stub(HierarchyFolders, "updatePageBindings")
                .callsFake((arg1, arg2) => {
                    assert.equal(arg1, "/folders/0/folders/0/folders/0");
                    assert.equal(arg2, true);
                });

            sandbox.stub(this.oController, "getMenuItems")
                .callsFake(() => {
                    const oDeferred = new jQuery.Deferred();
                    oDeferred.resolve({
                        folders: [{ property1: "val1" }, { property2: "val2" }],
                        apps: [{ property3: "val3" }, { property4: "val4" }]
                    });
                    return oDeferred.promise();
                });

            const spyMasterMenuSetBusy = sandbox.spy(HierarchyFolders, "setBusy");

            this.oController.onInit();
            this.oController.easyAccessModel = testEasyAccessModel;
            this.oController.navigateHierarchy("/folders/0/folders/0/folders/0", true);
            setTimeout(() => {
                assert.ok(spyMasterMenuSetBusy.calledWith(true));
                assert.ok(spyMasterMenuSetBusy.calledWith(false));
                assert.deepEqual(testEasyAccessModel.getProperty("/folders/0/folders/0/folders/0/folders"), [{ property1: "val1" }, { property2: "val2" }]);
                assert.deepEqual(testEasyAccessModel.getProperty("/folders/0/folders/0/folders/0/apps"), [{ property3: "val3" }, { property4: "val4" }]);

                this.oController.getView.restore();
                this.oController.getMenuItems.restore();
                done();
            });
        });
    });

    QUnit.test("getErrorMessage for User Menu and error string", function (assert) {
        this.oController.menuName = "USER_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const result = this.oController.getErrorMessage("some error message");
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsg",
            [ushellResources.i18n.getText("easyAccessUserMenuNameParameter"), "some error message"]
        ));
    });

    QUnit.test("getErrorMessage for User Menu and error with message", function (assert) {
        this.oController.menuName = "USER_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const result = this.oController.getErrorMessage({ message: "some error message" });
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsg",
            [ushellResources.i18n.getText("easyAccessUserMenuNameParameter"), "some error message"]
        ));
    });

    QUnit.test("getErrorMessage for User Menu and error with message and details", function (assert) {
        this.oController.menuName = "USER_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const oError = {
            message: "some error message",
            response: {
                body: JSON.stringify({
                    error: { message: { value: "Error Detail" } }
                })
            }
        };
        const result = this.oController.getErrorMessage(oError);
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsgWithDetails",
            [ushellResources.i18n.getText("easyAccessUserMenuNameParameter"), "some error message", "Error Detail"]
        ));
    });

    QUnit.test("getErrorMessage for User Menu and error with message and faulty body", function (assert) {
        this.oController.menuName = "USER_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const oError = {
            message: "some error message",
            response: {
                body: "faulty body"
            }
        };
        const result = this.oController.getErrorMessage(oError);
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsg",
            [ushellResources.i18n.getText("easyAccessUserMenuNameParameter"), "some error message"]
        ));
    });

    QUnit.test("getErrorMessage for User Menu and no error message", function (assert) {
        this.oController.menuName = "USER_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const result = this.oController.getErrorMessage();
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsgNoReason",
            [ushellResources.i18n.getText("easyAccessUserMenuNameParameter")]
        ));
    });

    QUnit.test("getErrorMessage for SAP Menu and error string", function (assert) {
        this.oController.menuName = "SAP_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const result = this.oController.getErrorMessage("some error message");
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsg",
            [ushellResources.i18n.getText("easyAccessSapMenuNameParameter"), "some error message"]
        ));
    });

    QUnit.test("getErrorMessage for User Menu and error with message", function (assert) {
        this.oController.menuName = "SAP_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const result = this.oController.getErrorMessage({ message: "some error message" });
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsg",
            [ushellResources.i18n.getText("easyAccessSapMenuNameParameter"), "some error message"]
        ));
    });

    QUnit.test("getErrorMessage for User Menu and and no error message", function (assert) {
        this.oController.menuName = "SAP_MENU";
        this.oController.translationBundle = ushellResources.i18n;
        const result = this.oController.getErrorMessage();
        assert.equal(result, ushellResources.i18n.getText(
            "easyAccessErrorGetDataErrorMsgNoReason",
            [ushellResources.i18n.getText("easyAccessSapMenuNameParameter")]
        ));
    });

    QUnit.test("handleGetMenuItemsError for User Menu with error message", function (assert) {
        const oView = {
            easyAccessModel: new JSONModel(),
            hierarchyFolders: {
                setBusy: function () {
                }
            },
            hierarchyApps: {
                setBusy: function () {
                }
            }
        };
        const done = assert.async();

        this.oController.oView = oView;

        sandbox.stub(this.oController, "getErrorMessage")
            .callsFake((error) => {
                return error;
            });

        this.oController.easyAccessModel = new JSONModel();

        const errorSpy = sandbox.stub(MessageBox, "error").callsFake(() => { });
        this.oController.handleGetMenuItemsError("some error message");
        setTimeout(() => {
            assert.ok(errorSpy.calledWith("some error message"), "expected error message: some error message");
            MessageBox.error.restore();
            done();
        }, 200);
    });

    QUnit.test("handleGetMenuItemsError for User Menu", function (assert) {
        const oView = {
            easyAccessModel: new JSONModel(),
            hierarchyFolders: {
                setBusy: function () {
                }
            },
            hierarchyApps: {
                setBusy: function () {
                }
            }
        };
        this.oController.oView = oView;

        sandbox.stub(this.oController, "getErrorMessage")
            .callsFake((error) => {
                return error;
            });

        this.oController.easyAccessModel = new JSONModel();
        const setDataSpy = sandbox.spy(this.oController.easyAccessModel, "setData");
        const setBusySpy = sandbox.spy(oView.hierarchyFolders, "setBusy");
        this.oController.handleGetMenuItemsError("some error message");
        assert.ok(setDataSpy.calledWith(""), "setData was called with ''");
        assert.ok(setBusySpy.calledWith(false), "setBusy called with false");
        this.oController.easyAccessModel.setData.restore();
        oView.hierarchyFolders.setBusy.restore();
    });

    QUnit.test("Test _appendSystemToUrl", function (assert) {
        // initialize mock data
        const sSystemId = "U1YCLNT120";
        const aData = [{
            url: "#Shell-startTransaction?sap-ui2-tcode=PFCG",
            expected: `#Shell-startTransaction?sap-ui2-tcode=PFCG&sap-system=${sSystemId}`,
            info: "url has one parameter already"
        }, {
            url: "#Shell-startTransaction",
            expected: `#Shell-startTransaction?sap-system=${sSystemId}`,
            info: "url has no parameters"
        }, {
            url: "#Shell-startTransaction?sap-ui2-tcode=PFCG&anotherParam=someValue",
            expected: `#Shell-startTransaction?sap-ui2-tcode=PFCG&anotherParam=someValue&sap-system=${sSystemId}`,
            info: "url has 2 parameters already"
        }, {
            url: "#Shell-startTransaction?",
            expected: `#Shell-startTransaction?&sap-system=${sSystemId}`,
            info: "url ends with '?'"
        }, {
            url: undefined,
            expected: undefined,
            info: "url is undefined"
        }];

        for (let i = 0; i < aData.length; i++) {
            // call the function under test
            const result = this.oController._appendSystemToUrl(aData[i], sSystemId);

            // assert
            assert.equal(result, aData[i].expected, aData[i].info);
        }
    });

    QUnit.test("Test _getServiceUrl for SAP_MENU", function (assert) {
        const oModel = new JSONModel();
        this.oView = {
            getModel: function () {
                return oModel;
            }
        };
        this.oController.getView = function () {
            return this.oView;
        };

        const result = this.oController._getServiceUrl("SAP_MENU");
        assert.equal(result, "/sap/opu/odata/UI2/EASY_ACCESS_MENU");
    });

    QUnit.test("Test _getServiceUrl for USER_MENU", function (assert) {
        const oModel = new JSONModel();
        this.oView = {
            getModel: function () {
                return oModel;
            }
        };
        this.oController.getView = function () {
            return this.oView;
        };

        const result = this.oController._getServiceUrl("USER_MENU");
        assert.equal(result, "/sap/opu/odata/UI2/USER_MENU");
    });

    QUnit.test("Test _getODataRequestForSearchUrl(\"USER_MENU\",\"someId\",\"someTerm\")", function (assert) {
        const getServiceUrlStub = sandbox.stub(this.oController, "_getServiceUrl")
            .callsFake(() => {
                return "someUrl";
            });

        const result = this.oController._getODataRequestForSearchUrl("USER_MENU", "someId", "someTerm");
        assert.equal(result, "someUrl;o=someId/MenuItems?$filter=type ne 'FL' and (substringof('someTerm', text)"
            + " or substringof('someTerm', subtitle) or substringof('someTerm', url))&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=0&$top=100");
        getServiceUrlStub.restore();
    });

    QUnit.test("Test _getODataRequestForSearchUrl(\"SAP_MENU\",\"someId\",\"someTerm\",200)", function (assert) {
        const getServiceUrlStub = sandbox.stub(this.oController, "_getServiceUrl")
            .callsFake(() => {
                return "someUrl";
            });

        const result = this.oController._getODataRequestForSearchUrl("USER_MENU", "someId", "someTerm", 200);
        assert.equal(result, "someUrl;o=someId/MenuItems?$filter=type ne 'FL' and (substringof('someTerm', text) or substringof('someTerm', subtitle)"
            + " or substringof('someTerm', url))&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=200&$top=100");
        getServiceUrlStub.restore();
    });

    QUnit.test("Test _getODataRequestForSearchUrl(\"SAP_MENU\",\"someId\",\"some*Term\",200)", function (assert) {
        const getServiceUrlStub = sandbox.stub(this.oController, "_getServiceUrl")
            .callsFake(() => {
                return "someUrl";
            });

        const result = this.oController._getODataRequestForSearchUrl("USER_MENU", "someId", "someTerm", 200);
        assert.equal(result, "someUrl;o=someId/MenuItems?$filter=type ne 'FL' and (substringof('someTerm', text) or substringof('someTerm', subtitle)"
            + " or substringof('someTerm', url))&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=200&$top=100");
        getServiceUrlStub.restore();
    });

    QUnit.test("Test _getODataRequestForSearchUrl(\"SAP_MENU\",\"someId\",\"*\",200)", function (assert) {
        const getServiceUrlStub = sandbox.stub(this.oController, "_getServiceUrl")
            .callsFake(() => {
                return "someUrl";
            });

        const result = this.oController._getODataRequestForSearchUrl("USER_MENU", "someId", "*", 200);
        assert.equal(result, "someUrl;o=someId/MenuItems?$filter=type ne 'FL' and (substringof('', text) or substringof('', subtitle)"
            + " or substringof('', url))&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=200&$top=100");
        getServiceUrlStub.restore();
    });

    QUnit.test("Test _getODataRequestForSearchUrl(\"SAP_MENU\",\"someId\",\"Term contains 'single quote's\",200)", function (assert) {
        const getServiceUrlStub = sandbox.stub(this.oController, "_getServiceUrl")
            .callsFake(() => {
                return "someUrl";
            });

        const result = this.oController._getODataRequestForSearchUrl("SAP_MENU", "someId", "Term contains 'single quote's", 200);
        assert.equal(
            result,
            "someUrl;o=someId/MenuItems?$filter=type ne 'FL' and (substringof('Term%20contains%20''single%20quote''s', text)" +
            " or substringof('Term%20contains%20''single%20quote''s', subtitle)" +
            " or substringof('Term%20contains%20''single%20quote''s', url))&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=200&$top=100");
        getServiceUrlStub.restore();
    });

    QUnit.test("Test _getODataRequestForSearchUrl(\"SAP_MENU\",\"someId\",\"Term contains +\",200)", function (assert) {
        const getServiceUrlStub = sandbox.stub(this.oController, "_getServiceUrl")
            .callsFake(() => {
                return "someUrl";
            });

        const result = this.oController._getODataRequestForSearchUrl("SAP_MENU", "someId", "Term contains +", 200);
        assert.equal(result, "someUrl;o=someId/MenuItems?$filter=type ne 'FL' and (substringof('Term%20contains%20%2B', text) or substringof('Term%20contains%20%2B', subtitle)"
            + " or substringof('Term%20contains%20%2B', url))&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=200&$top=100");
        getServiceUrlStub.restore();
    });

    QUnit.test("Test handleSuccessOnReadFilterResults", function (assert) {
        this.oController.systemId = "xxx";
        const result = this.oController.handleSuccessOnReadFilterResults({ results: [{ url: "aaa" }, { url: "bbb" }], __count: "100" });
        assert.deepEqual(result.results, [{ url: "aaa?sap-system=xxx" }, { url: "bbb?sap-system=xxx" }]);
        assert.equal(result.count, "100");
    });

    QUnit.test("Test handleSuccessOnReadMenuItems", function (assert) {
        const oDataResultFormatterStub = sandbox.stub(this.oController, "_oDataResultFormatter")
            .callsFake((/* a, b, c, d */) => {
                return {};
            });
        this.oController.handleSuccessOnReadMenuItems({ results: "results" }, { systemId: "systemId", iLevelFilter: "1" });
        assert.ok(oDataResultFormatterStub.calledOnce);

        oDataResultFormatterStub.restore();
    });

    QUnit.test("test _removeWildCards with *", function (assert) {
        const result = this.oController._removeWildCards("C*r*oss*");
        assert.equal(result, "Cross");
    });

    QUnit.test("test _removeWildCards with *", function (assert) {
        const result = this.oController._removeWildCards("Cross");
        assert.equal(result, "Cross");
    });

    QUnit.test("test getMoreSearchResults with response", function (assert) {
        const getSearchResultsStub = sandbox.stub(this.oController, "_getSearchResults")
            .callsFake(() => {
                const oDeferred = new jQuery.Deferred();
                oDeferred.resolve({
                    results: [3, 4, 5],
                    count: 100
                });
                return oDeferred.promise();
            });

        const oModel = this.oController.getView().getModel();
        oModel.setProperty("/search", { searchTerm: "someTerm" });
        this.oController.searchResultFrom = 1;
        this.oController.easyAccessSearchResultsModel = new JSONModel();
        this.oController.easyAccessSearchResultsModel.setProperty("/apps", [1, 2]);
        this.oController.getMoreSearchResults();
        assert.deepEqual(this.oController.easyAccessSearchResultsModel.getProperty("/apps"), [1, 2, 3, 4, 5]);
        assert.equal(this.oController.searchResultFrom, 5);
        getSearchResultsStub.restore();
    });

    QUnit.test("test getMoreSearchResults with an error", function (assert) {
        const handleGetMenuItemsErrorSpy = sandbox.stub(this.oController, "handleGetMenuItemsError")
            .callsFake((x) => {
                return x;
            });

        const getSearchResultsStub = sandbox.stub(this.oController, "_getSearchResults")
            .callsFake(() => {
                const oDeferred = new jQuery.Deferred();
                oDeferred.reject(new Error("some error message"));
                return oDeferred.promise();
            });

        this.oController.getMoreSearchResults();
        assert.strictEqual(handleGetMenuItemsErrorSpy.getCall(0).args[0].message, "some error message");
        handleGetMenuItemsErrorSpy.restore();
        getSearchResultsStub.restore();
    });
});
