// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.BookmarkHandler
 */
sap.ui.define([
    "sap/m/library",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageHandler/BookmarkHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/state/StateManager",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/ushell/utils"
], (
    mobileLibrary,
    jQuery,
    PostMessageHandler,
    BookmarkHandler,
    PostMessageManager,
    Container,
    ushellLibrary,
    ushellResources,
    StateManager,
    PostMessageHelper,
    AddBookmarkButton,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.m.URLHelper
    const URLHelper = mobileLibrary.URLHelper;

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    /* global sinon, QUnit */

    sinon.addBehavior("resolvesDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().resolve(...vValue).promise());
    });

    sinon.addBehavior("rejectsDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().reject(...vValue).promise());
    });

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("_stripBookmarkServiceUrlForLocalContentProvider", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("noop if parameters empty", function (assert) {
        BookmarkHandler.stripBookmarkServiceUrlForLocalContentProvider();
        assert.ok(true, "no parameters");

        BookmarkHandler.stripBookmarkServiceUrlForLocalContentProvider({}, {});
        assert.ok(true, "empty objects");

        BookmarkHandler.stripBookmarkServiceUrlForLocalContentProvider(undefined, {});
        assert.ok(true, "empty system context");
    });

    QUnit.test("service URL property not added for local content provider", function (assert) {
        const oParameters = {
        };
        const oSystemContext = {
            id: ""
        };

        BookmarkHandler.stripBookmarkServiceUrlForLocalContentProvider(oParameters, oSystemContext);
        assert.strictEqual(oParameters.hasOwnProperty("serviceUrl"), false, "service URL property is not added");
    });

    QUnit.test("service URL removed for local content provider", function (assert) {
        const oParameters = {
            serviceUrl: "../dummy/odata/service"
        };
        const oSystemContext = {
            id: ""
        };

        BookmarkHandler.stripBookmarkServiceUrlForLocalContentProvider(oParameters, oSystemContext);
        assert.strictEqual(oParameters.serviceUrl, undefined, "service URL is undefined");
    });

    QUnit.test("service URL removed for 'saas_approuter' content provider", function (assert) {
        const oParameters = {
            serviceUrl: "../dummy/odata/service"
        };
        const oSystemContext = {
            id: "saas_approuter"
        };

        BookmarkHandler.stripBookmarkServiceUrlForLocalContentProvider(oParameters, oSystemContext);
        assert.strictEqual(oParameters.serviceUrl, undefined, "service URL is undefined");
    });

    QUnit.module("sendEmail", {
        beforeEach: function () {
            sandbox.stub(Container, "getServiceAsync");

            this.AppState = {};
            Container.getServiceAsync.withArgs("AppState").resolves(this.AppState);

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("with no app state with bSetAppStateToPublic=false", async function (assert) {
        // Arrange
        const aExpectedArgs = [
            "to",
            `subject ${document.URL} as test`,
            `body with link ${document.URL}`,
            "cc",
            "bcc"
        ];

        // Act
        await BookmarkHandler.sendEmail(
            "to",
            "subject http://www.a.com as test",
            "body with link http://www.a.com",
            "cc",
            "bcc",
            "http://www.a.com",
            false
        );

        // Assert
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "Email sent with correct parameters");
    });

    QUnit.test("with no app state with bSetAppStateToPublic=true", async function (assert) {
        // Arrange
        const aExpectedArgs = [
            "to",
            `subject ${document.URL} as test`,
            `body with link ${document.URL}`,
            "cc",
            "bcc"
        ];

        this.AppState.setAppStateToPublic = sandbox.stub().resolvesDeferred("http://www.a.com");

        // Act
        await BookmarkHandler.sendEmail(
            "to",
            "subject http://www.a.com as test",
            "body with link http://www.a.com",
            "cc",
            "bcc",
            "http://www.a.com",
            true
        );

        // Assert
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "Email sent with correct parameters");
    });

    QUnit.test("with with app state with bSetAppStateToPublic=true", async function (assert) {
        // Arrange
        sandbox.stub(ushellUtils, "getDocumentUrl").returns(`${document.URL}?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4`);
        this.AppState.setAppStateToPublic = sandbox.stub().resolvesDeferred(
            "http://www.a.com?sap-xapp-state=CCC&sap-iapp-state=DDD&dummy=4", // sNewURL
            "AAA", // sXStateKey
            "BBB", // sIStateKey
            "CCC", // sXStateKeyNew
            "DDD" // sIStateKeyNew
        );

        const aExpectedArgs = [
            "to",
            `subject ${document.URL}?sap-xapp-state=CCC&sap-iapp-state=DDD&dummy=4 as test`,
            `body with link ${document.URL}?sap-xapp-state=CCC&sap-iapp-state=DDD&dummy=4`,
            "cc",
            "bcc"
        ];

        // Act
        await BookmarkHandler.sendEmail(
            "to",
            "subject http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4 as test",
            "body with link http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4",
            "cc",
            "bcc",
            "http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4",
            true
        );

        // Assert
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "Email sent with correct parameters");
    });

    QUnit.test("with with app state with bSetAppStateToPublic=true with sIStateKey and no sXStateKey", async function (assert) {
        // Arrange
        sandbox.stub(ushellUtils, "getDocumentUrl").returns("http://www.xyz.com?sap-iapp-state=BBB&dummy=4");
        this.AppState.setAppStateToPublic = sandbox.stub().resolvesDeferred(
            "http://www.a.com?sap-iapp-state=DDD&dummy=4", // sNewURL
            undefined, // sXStateKey
            "BBB", // sIStateKey
            "", // sXStateKeyNew
            "DDD" // sIStateKeyNew
        );

        const aExpectedArgs = [
            "to",
            "subject http://www.xyz.com?sap-iapp-state=DDD&dummy=4 as test",
            "body with link http://www.xyz.com?sap-iapp-state=DDD&dummy=4",
            "cc",
            "bcc"
        ];

        // Act
        await BookmarkHandler.sendEmail(
            "to",
            "subject http://www.a.com?sap-iapp-state=BBB&dummy=4 as test",
            "body with link http://www.a.com?sap-iapp-state=BBB&dummy=4",
            "cc",
            "bcc",
            "http://www.a.com?sap-iapp-state=BBB&dummy=4",
            true);

        // Assert
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "Email sent with correct parameters");
    });

    QUnit.module("Bookmarking", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.oSystemContext = { id: "systemContextId" };
            this.AppLifeCycle = {
                getCurrentApplication: sandbox.stub().returns({
                    getSystemContext: sandbox.stub().resolves(this.oSystemContext)
                })
            };
            Container.getServiceAsync.withArgs("AppLifeCycle").resolves(this.AppLifeCycle);
            this.BookmarkV2 = {};
            Container.getServiceAsync.withArgs("BookmarkV2").resolves(this.BookmarkV2);
            this.Bookmark = {};
            Container.getServiceAsync.withArgs("Bookmark").resolves(this.Bookmark);
            this.FlpLaunchPage = {};
            Container.getServiceAsync.withArgs("FlpLaunchPage").resolves(this.FlpLaunchPage);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.Bookmark.addBookmarkUI5", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmark = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addBookmarkUI5",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                vContainer: {
                    id: "TestContainer",
                    type: "TestType"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.addBookmarkUI5",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.vContainer,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmark.getCall(0).args, aExpectedArgs, "addBookmark was called correctly");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.Bookmark.addBookmark", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmarkByGroupId = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addBookmark",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                groupId: "TestGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.addBookmark",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.groupId,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmarkByGroupId.getCall(0).args, aExpectedArgs, "addBookmarkByGroupId was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.addBookmark - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.BookmarkV2.addBookmarkByGroupId = sandbox.stub().rejects(new Error("Bookmark.addBookmarkByGroupId is deprecated. Please use BookmarkV2.addBookmark instead."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addBookmark",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                groupId: "TestGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.Bookmark.addBookmark",
            body: { message: "Bookmark.addBookmarkByGroupId is deprecated. Please use BookmarkV2.addBookmark instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.Bookmark.addCatalogTileToGroup", async function (assert) {
        // Arrange
        this.Bookmark.addCatalogTileToGroup = sandbox.stub().resolvesDeferred();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addCatalogTileToGroup",
            body: {
                sCatalogTileId: "",
                sGroupId: "",
                oCatalogData: {
                    id: "TestCatalogId"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.addCatalogTileToGroup",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.sCatalogTileId,
            oMessage.body.sGroupId,
            oMessage.body.oCatalogData
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Bookmark.addCatalogTileToGroup.getCall(0).args, aExpectedArgs, "addCatalogTileToGroup was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.addCatalogTileToGroup - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.Bookmark.addCatalogTileToGroup = sandbox.stub().rejectsDeferred(
            new Error("Bookmark.addCatalogTileToGroup is deprecated. Please use BookmarkV2.addBookmark instead.")
        );
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addCatalogTileToGroup",
            body: {
                sCatalogTileId: "",
                sGroupId: "",
                oCatalogData: {
                    id: "TestCatalogId"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.Bookmark.addCatalogTileToGroup",
            body: { message: "Bookmark.addCatalogTileToGroup is deprecated. Please use BookmarkV2.addBookmark instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    QUnit.test("sap.ushell.services.Bookmark.countBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.countBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.countBookmarks",
            body: {
                sUrl: "https://example.com"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.countBookmarks",
            body: {
                result: 42
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.countBookmarks.getCall(0).args, [oMessage.body.sUrl, this.oSystemContext.id], "countBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.deleteBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.deleteBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.deleteBookmarks",
            body: {
                sUrl: "https://example.com"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.deleteBookmarks",
            body: {
                result: 42
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.deleteBookmarks.getCall(0).args, [oMessage.body.sUrl, this.oSystemContext.id], "deleteBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.updateBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.updateBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.updateBookmarks",
            body: {
                sUrl: "https://example.com",
                oParameters: {
                    url: "https://updated-example.com",
                    title: "Updated Bookmark"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.updateBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [
            oMessage.body.sUrl,
            oMessage.body.oParameters,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.updateBookmarks.getCall(0).args, aExpectedArgs, "updateBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.addCustomBookmark", async function (assert) {
        // Arrange
        this.BookmarkV2.addCustomBookmark = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addCustomBookmark",
            body: {
                sVizType: "ssuite.smartbusiness.abap.tiles.contribution",
                oConfig: {
                    title: "Test Bookmark",
                    url: "https://example.com",
                    vizConfig: {
                        "sap.app": {
                            id: "TestAppId"
                        }
                    }
                },
                vContentNodes: {
                    id: "TestContentNode",
                    label: "Test Content Node"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.addCustomBookmark",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.sVizType,
            oMessage.body.oConfig,
            oMessage.body.vContentNodes,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addCustomBookmark.getCall(0).args, aExpectedArgs, "addCustomBookmark was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.countCustomBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.countCustomBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.countCustomBookmarks",
            body: {
                oIdentifier: {
                    url: "https://example.com",
                    vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                    contentProviderId: "thisShouldBeIgnored"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.countCustomBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [{
            url: "https://example.com",
            vizType: "ssuite.smartbusiness.abap.tiles.contribution",
            contentProviderId: this.oSystemContext.id
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.countCustomBookmarks.getCall(0).args, aExpectedArgs, "countCustomBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.updateCustomBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.updateCustomBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.updateCustomBookmarks",
            body: {
                oIdentifier: {
                    url: "https://example.com",
                    vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                    contentProviderId: "thisShouldBeIgnored"
                },
                oConfig: {
                    title: "Updated Bookmark",
                    url: "https://updated-example.com",
                    vizConfig: {
                        "sap.app": {
                            id: "UpdatedAppId"
                        }
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.updateCustomBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [
            {
                url: "https://example.com",
                vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                contentProviderId: this.oSystemContext.id
            },
            oMessage.body.oConfig
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.updateCustomBookmarks.getCall(0).args, aExpectedArgs, "updateCustomBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.deleteCustomBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.deleteCustomBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.deleteCustomBookmarks",
            body: {
                oIdentifier: {
                    url: "https://example.com",
                    vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                    contentProviderId: "thisShouldBeIgnored"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.deleteCustomBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [{
            url: "https://example.com",
            vizType: "ssuite.smartbusiness.abap.tiles.contribution",
            contentProviderId: this.oSystemContext.id
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.deleteCustomBookmarks.getCall(0).args, aExpectedArgs, "deleteCustomBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.addBookmarkToPage", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmarkToPage = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.addBookmarkToPage",
            body: {
                oParameters: {
                    title: "Test Bookmark",
                    url: "https://example.com"
                },
                sPageId: "TestPageId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.addBookmarkToPage",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.sPageId,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmarkToPage.getCall(0).args, aExpectedArgs, "addBookmarkToPage was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.addBookmarkUI5", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmark = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.addBookmarkUI5",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                vContainer: {
                    id: "TestContainer",
                    type: "TestType"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.addBookmarkUI5",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.vContainer,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmark.getCall(0).args, aExpectedArgs, "addBookmark was called correctly");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.BookmarkV2.addBookmark", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmarkByGroupId = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.addBookmark",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                groupId: "TestGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.addBookmark",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.groupId,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmarkByGroupId.getCall(0).args, aExpectedArgs, "addBookmarkByGroupId was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.addBookmark - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.BookmarkV2.addBookmarkByGroupId = sandbox.stub().rejects(new Error("BookmarkV2.addBookmarkByGroupId is deprecated. Please use BookmarkV2.addBookmark instead."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.addBookmark",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                groupId: "TestGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.BookmarkV2.addBookmark",
            body: { message: "BookmarkV2.addBookmarkByGroupId is deprecated. Please use BookmarkV2.addBookmark instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.countBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.countBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.countBookmarks",
            body: {
                sUrl: "https://example.com"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.countBookmarks",
            body: {
                result: 42
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.countBookmarks.getCall(0).args, [oMessage.body.sUrl, this.oSystemContext.id], "countBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.deleteBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.deleteBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.deleteBookmarks",
            body: {
                sUrl: "https://example.com"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.deleteBookmarks",
            body: {
                result: 42
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.deleteBookmarks.getCall(0).args, [oMessage.body.sUrl, this.oSystemContext.id], "deleteBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.updateBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.updateBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.updateBookmarks",
            body: {
                sUrl: "https://example.com",
                oParameters: {
                    url: "https://updated-example.com",
                    title: "Updated Bookmark"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.updateBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [
            oMessage.body.sUrl,
            oMessage.body.oParameters,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.updateBookmarks.getCall(0).args, aExpectedArgs, "updateBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.addCustomBookmark", async function (assert) {
        // Arrange
        this.BookmarkV2.addCustomBookmark = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.addCustomBookmark",
            body: {
                sVizType: "ssuite.smartbusiness.abap.tiles.contribution",
                oConfig: {
                    title: "Test Bookmark",
                    url: "https://example.com",
                    vizConfig: {
                        "sap.app": {
                            id: "TestAppId"
                        }
                    }
                },
                vContentNodes: {
                    id: "TestContentNode",
                    label: "Test Content Node"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.addCustomBookmark",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.sVizType,
            oMessage.body.oConfig,
            oMessage.body.vContentNodes,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addCustomBookmark.getCall(0).args, aExpectedArgs, "addCustomBookmark was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.countCustomBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.countCustomBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.countCustomBookmarks",
            body: {
                oIdentifier: {
                    url: "https://example.com",
                    vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                    contentProviderId: "thisShouldBeIgnored"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.countCustomBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [{
            url: "https://example.com",
            vizType: "ssuite.smartbusiness.abap.tiles.contribution",
            contentProviderId: this.oSystemContext.id
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.countCustomBookmarks.getCall(0).args, aExpectedArgs, "countCustomBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.updateCustomBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.updateCustomBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.updateCustomBookmarks",
            body: {
                oIdentifier: {
                    url: "https://example.com",
                    vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                    contentProviderId: "thisShouldBeIgnored"
                },
                oConfig: {
                    title: "Updated Bookmark",
                    url: "https://updated-example.com",
                    vizConfig: {
                        "sap.app": {
                            id: "UpdatedAppId"
                        }
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.updateCustomBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [
            {
                url: "https://example.com",
                vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                contentProviderId: this.oSystemContext.id
            },
            oMessage.body.oConfig
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.updateCustomBookmarks.getCall(0).args, aExpectedArgs, "updateCustomBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.deleteCustomBookmarks", async function (assert) {
        // Arrange
        this.BookmarkV2.deleteCustomBookmarks = sandbox.stub().resolves(42);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.deleteCustomBookmarks",
            body: {
                oIdentifier: {
                    url: "https://example.com",
                    vizType: "ssuite.smartbusiness.abap.tiles.contribution",
                    contentProviderId: "thisShouldBeIgnored"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.deleteCustomBookmarks",
            body: {
                result: 42
            }
        };

        const aExpectedArgs = [{
            url: "https://example.com",
            vizType: "ssuite.smartbusiness.abap.tiles.contribution",
            contentProviderId: this.oSystemContext.id
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.deleteCustomBookmarks.getCall(0).args, aExpectedArgs, "deleteCustomBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.addBookmarkToPage", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmarkToPage = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.addBookmarkToPage",
            body: {
                oParameters: {
                    title: "Test Bookmark",
                    url: "https://example.com"
                },
                sPageId: "TestPageId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.addBookmarkToPage",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.sPageId,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmarkToPage.getCall(0).args, aExpectedArgs, "addBookmarkToPage was called correctly");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.ShellUIService.addBookmark", async function (assert) {
        // Arrange
        this.BookmarkV2.addBookmarkByGroupId = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.addBookmark",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                groupId: "TestGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ShellUIService.addBookmark",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.oParameters,
            oMessage.body.groupId,
            this.oSystemContext.id
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.addBookmarkByGroupId.getCall(0).args, aExpectedArgs, "addBookmarkByGroupId was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.addBookmark - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.BookmarkV2.addBookmarkByGroupId = sandbox.stub().rejects(new Error("BookmarkV2.addBookmarkByGroupId is deprecated. Use BookmarkV2.addBookmark instead."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.addBookmark",
            body: {
                oParameters: {
                    title: "Bookmark",
                    url: "https://example.com"
                },
                groupId: "TestGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.ShellUIService.addBookmark",
            body: {
                message: "BookmarkV2.addBookmarkByGroupId is deprecated. Use BookmarkV2.addBookmark instead."
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    QUnit.test("sap.ushell.services.ShellUIService.addBookmarkDialog", async function (assert) {
        // Arrange
        sandbox.stub(AddBookmarkButton.prototype, "firePress");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.addBookmarkDialog",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.addBookmarkDialog",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(AddBookmarkButton.prototype.firePress.callCount, 1, "The add bookmark dialog was opened.");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.ShellUIService.getShellGroupTiles", async function (assert) {
        // Arrange
        this.FlpLaunchPage.getTilesByGroupId = sandbox.stub().resolvesDeferred([{
            id: "tileId",
            title: "Tile Title",
            subtitle: "Tile Subtitle",
            url: "https://example.com",
            icon: "sap-icon://home",
            groupId: "testGroupId"
        }]);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.getShellGroupTiles",
            body: {
                groupId: "testGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.getShellGroupTiles",
            status: "success",
            body: {
                result: [{
                    id: "tileId",
                    title: "Tile Title",
                    subtitle: "Tile Subtitle",
                    url: "https://example.com",
                    icon: "sap-icon://home",
                    groupId: "testGroupId"
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.FlpLaunchPage.getTilesByGroupId.getCall(0).args, ["testGroupId"], "getTilesByGroupId was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.getShellGroupTiles - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.FlpLaunchPage.getTilesByGroupId = sandbox.stub().rejectsDeferred(new Error("Classic homepage is deprecated."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.getShellGroupTiles",
            body: {
                groupId: "testGroupId"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.getShellGroupTiles",
            status: "error",
            body: {
                message: "Classic homepage is deprecated."
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    QUnit.module("ContentNodes", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.BookmarkV2 = {};
            Container.getServiceAsync.withArgs("BookmarkV2").resolves(this.BookmarkV2);
            this.FlpLaunchPage = {};
            Container.getServiceAsync.withArgs("FlpLaunchPage").resolves(this.FlpLaunchPage);
            this.Menu = {};
            Container.getServiceAsync.withArgs("Menu").resolves(this.Menu);
            this.CommonDataModel = {};
            Container.getServiceAsync.withArgs("CommonDataModel").resolves(this.CommonDataModel);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.BookmarkV2.getContentNodes", async function (assert) {
        // Arrange
        this.BookmarkV2.getContentNodes = sandbox.stub().resolves([{
            id: "ContentNode1",
            label: "Content Node 1",
            type: ContentNodeType.Page,
            isContainer: true,
            children: []
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.getContentNodes",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.getContentNodes",
            body: {
                result: [{
                    id: "ContentNode1",
                    label: "Content Node 1",
                    type: ContentNodeType.Page,
                    isContainer: true,
                    children: []
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.getContentNodes.getCall(0).args, [], "getContentNodes was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.getContentNodes", async function (assert) {
        // Arrange
        this.BookmarkV2.getContentNodes = sandbox.stub().resolves([{
            id: "ContentNode1",
            label: "Content Node 1",
            type: ContentNodeType.Page,
            isContainer: true,
            children: []
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.getContentNodes",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.getContentNodes",
            body: {
                result: [{
                    id: "ContentNode1",
                    label: "Content Node 1",
                    type: ContentNodeType.Page,
                    isContainer: true,
                    children: []
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.getContentNodes.getCall(0).args, [], "getContentNodes was called correctly");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.Bookmark.getShellGroupIDs", async function (assert) {
        // Arrange
        this.BookmarkV2.getShellGroupIDs = sandbox.stub().resolves([{ id: "TestGroupId", title: "Test Group" }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.getShellGroupIDs",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Bookmark.getShellGroupIDs",
            body: {
                result: [{ id: "TestGroupId", title: "Test Group" }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.getShellGroupIDs.getCall(0).args, [], "getShellGroupIDs was called correctly");
    });

    QUnit.test("sap.ushell.services.Bookmark.getShellGroupIDs - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.BookmarkV2.getShellGroupIDs = sandbox.stub().rejects(new Error("Bookmark.getShellGroupIDs is deprecated. Please use BookmarkV2.getContentNodes instead."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Bookmark.getShellGroupIDs",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.Bookmark.getShellGroupIDs",
            body: { message: "Bookmark.getShellGroupIDs is deprecated. Please use BookmarkV2.getContentNodes instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.BookmarkV2.getShellGroupIDs", async function (assert) {
        // Arrange
        this.BookmarkV2.getShellGroupIDs = sandbox.stub().resolves([{ id: "TestGroupId", title: "Test Group" }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.getShellGroupIDs",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.BookmarkV2.getShellGroupIDs",
            body: {
                result: [{ id: "TestGroupId", title: "Test Group" }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.getShellGroupIDs.getCall(0).args, [], "getShellGroupIDs was called correctly");
    });

    QUnit.test("sap.ushell.services.BookmarkV2.getShellGroupIDs - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.BookmarkV2.getShellGroupIDs = sandbox.stub().rejects(new Error("BookmarkV2.getShellGroupIDs is deprecated. Please use BookmarkV2.getContentNodes instead."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.BookmarkV2.getShellGroupIDs",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.BookmarkV2.getShellGroupIDs",
            body: { message: "BookmarkV2.getShellGroupIDs is deprecated. Please use BookmarkV2.getContentNodes instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.LaunchPage.getGroupsForBookmarks", async function (assert) {
        // Arrange
        this.FlpLaunchPage.getGroupsForBookmarks = sandbox.stub().resolvesDeferred([{
            title: "Test Group",
            object: {
                id: "TestGroupId"
            }
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.LaunchPage.getGroupsForBookmarks",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.LaunchPage.getGroupsForBookmarks",
            body: {
                result: [{
                    title: "Test Group",
                    object: {
                        id: "TestGroupId"
                    }
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.FlpLaunchPage.getGroupsForBookmarks.getCall(0).args, [], "getGroupsForBookmarks was called correctly");
    });

    QUnit.test("sap.ushell.services.LaunchPage.getGroupsForBookmarks - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.FlpLaunchPage.getGroupsForBookmarks = sandbox.stub().rejectsDeferred(
            new Error("LaunchPage.getGroupsForBookmarks is deprecated. Please use BookmarkV2.getContentNodes instead.")
        );
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.LaunchPage.getGroupsForBookmarks",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.LaunchPage.getGroupsForBookmarks",
            body: { message: "LaunchPage.getGroupsForBookmarks is deprecated. Please use BookmarkV2.getContentNodes instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    QUnit.test("sap.ushell.services.Menu.getSpacesPagesHierarchy", async function (assert) {
        // Arrange
        this.Menu.getContentNodes = sandbox.stub().resolves([{
            id: "Space1",
            label: "Space 1",
            type: ContentNodeType.Space,
            isContainer: false,
            children: [{
                id: "Page1",
                label: "Page 1",
                type: ContentNodeType.Page,
                isContainer: true,
                children: []
            }]
        }, {
            id: "Space2",
            label: "Empty Space 2",
            type: ContentNodeType.Space,
            isContainer: false,
            children: []
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Menu.getSpacesPagesHierarchy",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Menu.getSpacesPagesHierarchy",
            body: {
                result: [{
                    id: "Space1",
                    title: "Space 1",
                    pages: [{
                        id: "Page1",
                        title: "Page 1"
                    }]
                }, {
                    id: "Space2",
                    title: "Empty Space 2",
                    pages: []
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Menu.getContentNodes.getCall(0).args, [[ContentNodeType.Space, ContentNodeType.Page]], "getContentNodes was called correctly");
    });

    QUnit.test("sap.ushell.services.CommonDataModel.getAllPages", async function (assert) {
        // Arrange
        this.CommonDataModel.getAllPages = sandbox.stub().resolves([{
            identification: { id: "page1", title: "Page 1" },
            payload: {
                layout: {
                    sectionOrder: []
                },
                sections: {}
            }
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CommonDataModel.getAllPages",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CommonDataModel.getAllPages",
            body: {
                result: [{
                    identification: { id: "page1", title: "Page 1" },
                    payload: {
                        layout: {
                            sectionOrder: []
                        },
                        sections: {}
                    }
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.CommonDataModel.getAllPages.getCall(0).args, [], "getAllPages was called correctly");
    });

    /**
     * @deprecated since 1.120. Deprecated together with the classic homepage.
     */
    QUnit.test("sap.ushell.services.ShellUIService.getShellGroupIDs", async function (assert) {
        // Arrange
        this.BookmarkV2.getShellGroupIDs = sandbox.stub().resolves([{ id: "TestGroupId", title: "Test Group" }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.getShellGroupIDs",
            body: {
                bGetAll: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ShellUIService.getShellGroupIDs",
            body: {
                result: [{ id: "TestGroupId", title: "Test Group" }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.BookmarkV2.getShellGroupIDs.getCall(0).args, [true], "getShellGroupIDs was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.getShellGroupIDs - error case", async function (assert) {
        // Arrange
        /**
         * @deprecated since 1.120. Deprecated together with the classic homepage.
         * The stub is not required after the transformation build.
         */
        this.BookmarkV2.getShellGroupIDs = sandbox.stub().rejects(new Error("Bookmark.getShellGroupIDs is deprecated. Use BookmarkV2.getContentNodes instead."));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.getShellGroupIDs",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.ShellUIService.getShellGroupIDs",
            body: { message: "Bookmark.getShellGroupIDs is deprecated. Use BookmarkV2.getContentNodes instead." }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(sStack, "The stack is provided in the error response");
    });

    QUnit.module("sendAsEmail", {
        before: ushellResources.awaitResourceBundle,
        beforeEach: async function () {
            sandbox.stub(ushellResources.i18n, "getText").returnsArg(0);
            sandbox.stub(Container, "getServiceAsync");

            this.AppState = {};
            Container.getServiceAsync.withArgs("AppState").resolves(this.AppState);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.ShellUIService.sendUrlAsEmail", async function (assert) {
        // Arrange
        StateManager.updateCurrentState("application.title", Operation.Set, "Current Title");
        sandbox.stub(URLHelper, "triggerEmail");
        this.AppState.setAppStateToPublic = sandbox.stub().resolvesDeferred(
            "newURL",
            "XStateKey",
            "IStateKey"
        );

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.sendUrlAsEmail",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.sendUrlAsEmail",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "", // to
            "linkTo 'Current Title'", // subject
            document.URL, // body
            "", // cc
            "" // bcc
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "triggerEmail was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.sendUrlAsEmail - no current application", async function (assert) {
        // Arrange
        StateManager.updateCurrentState("application.title", Operation.Set, undefined);
        sandbox.stub(URLHelper, "triggerEmail");
        this.AppState.setAppStateToPublic = sandbox.stub().resolvesDeferred(
            "newURL",
            "XStateKey",
            "IStateKey"
        );

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.sendUrlAsEmail",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.sendUrlAsEmail",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "", // to
            "linkToApplication", // subject
            document.URL, // body
            "", // cc
            "" // bcc
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "triggerEmail was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.sendEmailWithFLPButton", async function (assert) {
        // Arrange
        StateManager.updateCurrentState("application.title", Operation.Set, "Current Title");
        sandbox.stub(URLHelper, "triggerEmail");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.sendEmailWithFLPButton",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.sendEmailWithFLPButton",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "", // to
            "linkTo 'Current Title'", // subject
            document.URL, // body
            "", // cc
            "" // bcc
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "triggerEmail was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.sendEmailWithFLPButton - no current application", async function (assert) {
        // Arrange
        StateManager.updateCurrentState("application.title", Operation.Set, undefined);
        sandbox.stub(URLHelper, "triggerEmail");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.sendEmailWithFLPButton",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.sendEmailWithFLPButton",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "", // to
            "linkToApplication", // subject
            document.URL, // body
            "", // cc
            "" // bcc
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "triggerEmail was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellUIService.sendEmail", async function (assert) {
        // Arrange
        sandbox.stub(URLHelper, "triggerEmail");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.sendEmail",
            body: {
                sTo: "To",
                sSubject: "Subject",
                sBody: "Body",
                sCc: "CC",
                sBcc: "BCC",
                sIFrameURL: "iframeUrl.com",
                bSetAppStateToPublic: false
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.sendEmail",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "To", // to
            "Subject", // subject
            "Body", // body
            "CC", // cc
            "BCC" // bcc
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(URLHelper.triggerEmail.getCall(0).args, aExpectedArgs, "triggerEmail was called correctly");
    });
});
