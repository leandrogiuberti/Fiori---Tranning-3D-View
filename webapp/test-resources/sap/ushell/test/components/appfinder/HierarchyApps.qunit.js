// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.appfinder.HierarchyApps
 */
sap.ui.define([
    "sap/m/Button",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper",
    "sap/ushell/Container",
    "sap/ushell/resources",
    "sap/ui/thirdparty/sinon-4"
], (
    Button,
    Controller,
    JSONModel,
    hasher,
    jQuery,
    VisualizationOrganizerHelper,
    Container,
    ushellResources,
    sinon
) => {
    "use strict";

    /* global QUnit */

    const sandbox = sinon.createSandbox({});

    let oController;
    let bResolveCreateGroup = true;

    QUnit.module("sap.ushell.components.appfinder.HierarchyApps", {
        beforeEach: function (assert) {
            const done = assert.async();
            Container.init("local").then(() => {
                Controller.create({ name: "sap.ushell.components.appfinder.HierarchyApps" }).then((oResolvedController) => {
                    oResolvedController.connectToView({
                        attachAfterInit: function () { },
                        getViewData: function () {
                            return {
                                CatalogsManager: {
                                    getInstance: function () {
                                        return {
                                            createGroup: function () {
                                                const oDeferred = new jQuery.Deferred();

                                                // if should resolve the create group promise
                                                if (bResolveCreateGroup) {
                                                    oDeferred.resolve({
                                                        getObject: function () {
                                                            return { object: "oGroup" };
                                                        }
                                                    });
                                                } else {
                                                    oDeferred.reject(new Error("Failed intentionally"));
                                                }

                                                return oDeferred.promise();
                                            },
                                            notifyOnActionFailure: function () { }
                                        };
                                    }
                                }
                            };
                        }
                    });
                    oResolvedController.onInit();
                    oController = oResolvedController;
                    done();
                });
            });
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        afterEach: function () {
            oController.destroy();
            sandbox.restore();
        }
    });

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
        }],
        apps: [{
            id: "id3",
            text: "text3",
            level: 1,
            url: "#someIntent?sap-system=LOCAL"
        }]
    };

    // TODO add init test;

    QUnit.test("getCrumbsData - with path = \"\" should return []", function (assert) {
        const returnValue = oController.getCrumbsData("", {});
        assert.deepEqual(returnValue, []);
    });

    QUnit.test("getCrumbsData - first level", function (assert) {
        const oModel = new JSONModel();
        oModel.setData(testData);

        const returnValue = oController.getCrumbsData("/folders/1", oModel);
        assert.deepEqual(returnValue, [{ path: "", text: "someSystem" }]);
    });

    QUnit.test("getCrumbsData - second level", function (assert) {
        const oModel = new JSONModel();
        oModel.setData(testData);

        const returnValue = oController.getCrumbsData("/folders/0/folders/1", oModel);
        assert.deepEqual(returnValue, [{ path: "", text: "someSystem" }, { path: "/folders/0", text: "text1" }]);
    });

    QUnit.test("getCrumbsData - third level", function (assert) {
        const oModel = new JSONModel();
        oModel.setData(testData);

        const returnValue = oController.getCrumbsData("/folders/0/folders/1/folders/1", oModel);
        assert.deepEqual(returnValue, [
            { path: "", text: "someSystem" },
            { path: "/folders/0", text: "text1" },
            { path: "/folders/0/folders/1", text: "text12" }
        ]);
    });

    QUnit.test("updatePageBindings - first level", function (assert) {
        const VisualizationOrganizerHelperInstance = VisualizationOrganizerHelper.getInstance();

        const oView = {
            layout: {
                bindAggregation: function () { }
            },
            breadcrumbs: {
                bindProperty: function () { }
            },
            crumbsModel: new JSONModel({ crumbs: [] }),
            oItemTemplate: { id: "test" },
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            updateResultSetMessage: function () { },
            oVisualizationOrganizerHelper: {
                updateBookmarkCount: VisualizationOrganizerHelperInstance.updateBookmarkCount.bind(oController)
            }
        };

        sandbox.stub(oController, "getView").returns(oView);

        const spyBindAggregation = sandbox.spy(oController.getView().layout, "bindAggregation");
        const spyBindProperty = sandbox.spy(oController.getView().breadcrumbs, "bindProperty");
        const spyUpdateResultSetMessage = sandbox.spy(oController.getView(), "updateResultSetMessage");

        oController.updatePageBindings("/folders/1");

        assert.ok(spyBindAggregation.calledOnce);
        assert.ok(spyBindAggregation.calledWith("items", "easyAccess>/folders/1/apps", { id: "test" }));
        assert.ok(spyBindProperty.calledOnce);
        assert.ok(spyBindProperty.calledWith("currentLocationText", "easyAccess>/folders/1/text"));

        assert.ok(spyUpdateResultSetMessage.calledOnce);
        assert.ok(spyUpdateResultSetMessage.calledWith(1, false));

        oView.layout.bindAggregation.restore();
        oView.breadcrumbs.bindProperty.restore();
    });

    QUnit.test("onAppBoxPressed", function (assert) {
        // prepare mock data
        const sMockUrl = "#Shell-startTransaction?sap-system=U1YCLNT120&sap-ui2-tcode=PFCG";
        const oMockEvent = {
            getSource: function () {
                return {
                    getProperty: function (sKey) {
                        if (sKey === "url") {
                            return sMockUrl;
                        }
                    }
                };
            },
            mParameters: {
                srcControl: new Button()
            }
        };

        // match the default prependHash defined in the ShellNavigationInternal service
        hasher.prependHash = "";
        const oHasherStub = sandbox.stub(hasher, "setHash");

        // call function under test
        oController.onAppBoxPressed(oMockEvent);

        // assert
        assert.equal(oHasherStub.args[0][0], sMockUrl, "hash changed");

        oHasherStub.restore();
    });

    QUnit.test("_handleSuccessMessage with one group", function (assert) {
        // prepare mock data
        const oMockApp = { text: "appText" };
        const oMockAddToGroups = {
            addToGroups: [{ title: "groupTitle" }]
        };

        // call function under test
        const message = oController._handleSuccessMessage(oMockApp, oMockAddToGroups);

        // assert
        assert.equal(message, "App \"appText\" was added to group \"groupTitle\"");
    });

    QUnit.test("_handleSuccessMessage with 2 groups", function (assert) {
        // prepare mock data
        const oMockApp = { text: "appText" };
        const oMockAddToGroups = {
            addToGroups: [
                { title: "firstGroupTitle" },
                { title: "secondGroupTitle" }
            ]
        };

        // call function under test
        const message = oController._handleSuccessMessage(oMockApp, oMockAddToGroups);

        // assert
        assert.equal(message, "App \"appText\" was added to 2 groups");
    });

    QUnit.test("_prepareErrorMessage", function (assert) {
        const appTitle = "appTitle";

        // (1) - one group, add to a new group failed
        let errorActions = [
            { action: "addBookmark_ToNewGroup", group: "newGroupTitle" }
        ];
        let oMessage = oController._prepareErrorMessage(errorActions, appTitle);
        assert.equal(ushellResources.i18n.getText(oMessage.messageId, oMessage.parameters), 'App "appTitle" could not be added to group "newGroupTitle"');

        // (2) - one group - create new group failed
        errorActions = [
            { action: "addBookmark_NewGroupCreation", group: "newGroupTitle" }
        ];
        oMessage = oController._prepareErrorMessage(errorActions, appTitle);
        assert.equal(ushellResources.i18n.getText(oMessage.messageId, oMessage.parameters), "New group could not be created");

        // (3) - one group - create new group failed
        errorActions = [
            { action: "addBookmark_ToExistingGroup", group: { title: "existingGroupTitle" } }
        ];
        oMessage = oController._prepareErrorMessage(errorActions, appTitle);
        assert.equal(ushellResources.i18n.getText(oMessage.messageId, oMessage.parameters), 'App "appTitle" could not be added to group "existingGroupTitle"');

        // (4) - two groups - add to existing groups
        errorActions = [
            { action: "addBookmark_ToExistingGroup", group: { title: "existingGroupTitle" } },
            { action: "addBookmark_ToExistingGroup", group: { title: "existingGroupTitle2" } }
        ];
        oMessage = oController._prepareErrorMessage(errorActions, appTitle);
        assert.equal(ushellResources.i18n.getText(oMessage.messageId, oMessage.parameters), 'App "appTitle" could not be added to multiple groups');

        // (5) - two groups - add to one existing group and one new group
        errorActions = [
            { action: "addBookmark_ToExistingGroup", group: { title: "existingGroupTitle" } },
            { action: "addBookmark_ToNewGroup", group: "newGroupTitle" }
        ];
        oMessage = oController._prepareErrorMessage(errorActions, appTitle);
        assert.equal(ushellResources.i18n.getText(oMessage.messageId, oMessage.parameters), 'App "appTitle" could not be added to multiple groups');

        // (6) - three groups - add to 2 existing groups, and one new group creation failed
        errorActions = [
            { action: "addBookmark_ToExistingGroup", group: { title: "existingGroupTitle1" } },
            { action: "addBookmark_ToExistingGroup", group: { title: "existingGroupTitle2" } },
            { action: "addBookmark_NewGroupCreation", group: "newGroupTitle" }
        ];
        oMessage = oController._prepareErrorMessage(errorActions, appTitle);
        assert.equal(ushellResources.i18n.getText(oMessage.messageId, oMessage.parameters), "Could not complete all your actions");
    });

    /**
     * @param {object} assert Assert
     * @param {object} oMockApp App
     * @param {object} oMockPopoverResponse Popover response
     * @param {boolean} bResolveCreateGroupCatMan createNewGroup will resolve/reject the promise
     * @param {boolean} bResolveAddBookmark addBookmark will resolve or reject the promsie
     * @param {boolean} bExpectedSuccess expected test result
     *
     * @private
     * @deprecated since 1.118
     */
    function _testHandleBookmarkAppPopoverResponse (assert, oMockApp, oMockPopoverResponse, bResolveCreateGroupCatMan, bResolveAddBookmark, bExpectedSuccess) {
        const fnDone = assert.async();

        oController._updateAppBoxedWithPinStatuses = function () { };

        // (1) - both promises are rejected
        const _handleSuccessMessageSpy = sandbox.spy(oController, "_handleSuccessMessage");
        const _prepareErrorMessageSpy = sandbox.spy(oController, "_prepareErrorMessage");

        bResolveCreateGroup = bResolveCreateGroupCatMan;

        const oGetServiceStub = sandbox.stub(Container, "getServiceAsync");

        // add bookmark service stub
        const oBookmarkServiceStub = {
            addBookmark: function (oMockApp) {
                // if should resolve the add bookmark
                if (bResolveAddBookmark) {
                    return Promise.resolve({ url: oMockApp.url, title: oMockApp.text });
                }
                return Promise.reject(new Error("Failed intentionally"));
            }
        };
        oGetServiceStub.withArgs("BookmarkV2").returns(Promise.resolve(oBookmarkServiceStub));

        // add message service stub
        const oMessageServiceStub = {
            show: sandbox.stub()
        };

        oGetServiceStub.withArgs("MessageInternal").returns(Promise.resolve(oMessageServiceStub));

        // call to the method under test
        oController._handleBookmarkAppPopoverResponse(oMockApp, oMockPopoverResponse)
            .then(() => {
                // if expected test result is success
                if (bExpectedSuccess) {
                    assert.ok(_handleSuccessMessageSpy.calledOnce, "Success Handler called once.");
                    assert.ok(_prepareErrorMessageSpy.callCount === 0, "Error Handler not called at all.");
                } else {
                    assert.ok(_prepareErrorMessageSpy.calledOnce, "Error Handler called once.");
                    assert.ok(_handleSuccessMessageSpy.callCount === 0, "Success Handler not called at all.");
                }

                fnDone();
            });
    }

    /**
     * @deprecated since 1.118
     */
    QUnit.test("_handleBookmarkAppPopoverResponse - success flow", function (assert) {
        // prepare mock data
        const oMockApp = { text: "appText", url: "appUrl" };
        const oMockPopoverResponse = {
            newGroups: ["group1", "group2"],
            addToGroups: []
        };

        /*
        bResolveCreateGroup - true - meaning stub of createNewGroup will RESOLVE the promise
        bResolveAddBookmark - true - meaning stub of addBookmark will RESOLVE the promise
        bExpectedSuccess    - true - meaning we expect the test to be a success-test, we expect success handling to be triggered
        */
        _testHandleBookmarkAppPopoverResponse(assert, oMockApp, oMockPopoverResponse, true, true, true);
    });

    /**
     * @deprecated since 1.118
     */
    QUnit.test("_handleBookmarkAppPopoverResponse - Error flow ONE", function (assert) {
        // prepare mock data
        const oMockApp = { text: "appText", url: "appUrl" };
        const oMockPopoverResponse = {
            newGroups: ["group1", "group2"],
            addToGroups: []
        };
        /*
        bResolveCreateGroup - false - meaning stub of createNewGroup will REJECT the promise
        bResolveAddBookmark - false - meaning stub of addBookmark will REJECT the promise
        bExpectedSuccess    - false - meaning we expect the test to be an error-test, we expect error handling to be triggered
        */
        _testHandleBookmarkAppPopoverResponse(assert, oMockApp, oMockPopoverResponse, false, false, false);
    });

    /**
     * @deprecated since 1.118
     */
    QUnit.test("_handleBookmarkAppPopoverResponse - Error flow TWO", function (assert) {
        // prepare mock data
        const oMockApp = { text: "appText", url: "appUrl" };
        const oMockPopoverResponse = {
            newGroups: ["group1", "group2"],
            addToGroups: []
        };
        /*
        bResolveCreateGroup - false - meaning stub of createNewGroup will REJECT the promise
        bResolveAddBookmark - true - meaning stub of addBookmark will RESOLVE the promise
        bExpectedSuccess    - false - meaning we expect the test to be an error-test, we expect error handling to be triggered
        */
        _testHandleBookmarkAppPopoverResponse(assert, oMockApp, oMockPopoverResponse, false, true, false);
    });

    /**
     * @deprecated since 1.118
     */
    QUnit.test("_handleBookmarkAppPopoverResponse - Error flow THREE", function (assert) {
        // prepare mock data
        const oMockApp = { text: "appText", url: "appUrl" };
        const oMockPopoverResponse = {
            newGroups: ["group1", "group2"],
            addToGroups: []
        };
        /*
        bResolveCreateGroup - true - meaning stub of createNewGroup will RESOLVE the promise
        bResolveAddBookmark - false - meaning stub of addBookmark will REJECT the promise
        bExpectedSuccess    - false - meaning we expect the test to be an error-test, we expect error handling to be triggered
        */
        _testHandleBookmarkAppPopoverResponse(assert, oMockApp, oMockPopoverResponse, true, false, false);
    });

    /**
     * @deprecated since 1.118
     */
    QUnit.test("showSaveAppPopover with context of some dashboard group", function (assert) {
        // prepare mock data
        const testData = {
            groupContext: { path: "/groupContextPath" },
            groupContextPath: { text: "oGroupContext" }
        };
        const VisualizationOrganizerHelperInstance = VisualizationOrganizerHelper.getInstance();
        const oView = {
            getModel: function () {
                const oModel = new JSONModel();
                oModel.setData(testData);
                return oModel;
            },
            oVisualizationOrganizerHelper: {
                onHierarchyAppsPinButtonClick: VisualizationOrganizerHelperInstance.onHierarchyAppsPinButtonClick.bind(oController)
            }
        };
        sandbox.stub(oController, "getView").returns(oView);

        const event = {
            oSource: {
                getParent: function () {
                    return {
                        getBinding: function () {
                            return {
                                getContext: function () {
                                    return {
                                        getObject: function () {
                                            return { text: "appObject" };
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            }
        };

        const oApp = { text: "appObject" };
        const customResponse = {
            newGroups: [],
            addToGroups: [{ text: "oGroupContext" }]
        };

        const _handleBookmarkAppPopoverResponseStub = sandbox.stub(oController, "_handleBookmarkAppPopoverResponse");

        // call function under test
        oController.showSaveAppPopover(event);

        // assert
        assert.ok(_handleBookmarkAppPopoverResponseStub.calledOnce, "_handleBookmarkAppPopoverResponse called once");
        assert.ok(_handleBookmarkAppPopoverResponseStub.calledWith(oApp, customResponse), "_handleBookmarkAppPopoverResponse called with the correct arguments");

        _handleBookmarkAppPopoverResponseStub.restore();
    });

    QUnit.test("showSaveAppPopover: update the pin button status if onHierarchyAppsPinButtonClick resolve true", function (assert) {
        // prepare mock data
        const fnDone = assert.async();
        const oResolvedPromise = Promise.resolve(true);
        const oView = {
            oVisualizationOrganizerHelper: {
                onHierarchyAppsPinButtonClick: sandbox.stub().returns(oResolvedPromise)
            }
        };
        sandbox.stub(oController, "getView").returns(oView);
        const _updateAppBoxedWithPinStatusesStub = sandbox.stub(oController, "_updateAppBoxedWithPinStatuses");

        // call function under test
        oController.showSaveAppPopover({});

        // assert
        oResolvedPromise.then(() => {
            assert.ok(_updateAppBoxedWithPinStatusesStub.calledOnce, "_updateAppBoxedWithPinStatuses called once");
            _updateAppBoxedWithPinStatusesStub.restore();
            fnDone();
        });
    });

    QUnit.test("showMoreResultsTextFormatter with apps and total", function (assert) {
        oController.translationBundle = ushellResources.i18n;
        const result = oController.showMoreResultsTextFormatter([1, 2, 3], 10);
        assert.equal(result, "Show more (3 of 10)");
    });

    QUnit.test("showMoreResultsVisibilityFormatter", function (assert) {
        assert.equal(oController.showMoreResultsVisibilityFormatter([1, 2, 3], 3), false);
        assert.equal(oController.showMoreResultsVisibilityFormatter([1, 2, 3], 10), true);
        assert.equal(oController.showMoreResultsVisibilityFormatter(), false);
        assert.equal(oController.showMoreResultsVisibilityFormatter([], 10), true);
    });
});
