// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.NavigationHandler
 */
sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/services/Navigation/compatibility",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/utils"
], (
    hasher,
    jQuery,
    IframeApplicationContainer,
    PostMessageHandler,
    PostMessageManager,
    Container,
    navigationCompatibility,
    PostMessageHelper,
    ushellUtils
) => {
    "use strict";

    /* global sinon, QUnit */

    sinon.addBehavior("resolvesDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().resolve(...vValue).promise());
    });

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("Navigation", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.Navigation = {};
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);
            this.NavTargetResolutionInternal = {};
            Container.getServiceAsync.withArgs("NavTargetResolutionInternal").resolves(this.NavTargetResolutionInternal);
            this.ShellNavigationInternal = {};
            Container.getServiceAsync.withArgs("ShellNavigationInternal").resolves(this.ShellNavigationInternal);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.Navigation.getHref", async function (assert) {
        // Arrange
        this.Navigation.getHref = sandbox.stub().resolves("#GenericWrapperTest-open?A=B");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.getHref",
            body: {
                oTarget: {
                    target: {
                        semanticObject: "GenericWrapperTest",
                        action: "open"
                    },
                    params: {
                        A: "B"
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.getHref",
            body: {
                result: "#GenericWrapperTest-open?A=B"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.getHref.getCall(0).args, [oMessage.body.oTarget], "getHref was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.backToPreviousApp", async function (assert) {
        // Arrange
        this.Navigation.backToPreviousApp = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.backToPreviousApp",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.backToPreviousApp",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.backToPreviousApp.getCall(0).args, [], "backToPreviousApp was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.historyBack", async function (assert) {
        // Arrange
        this.Navigation.historyBack = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.historyBack",
            body: {
                iSteps: 3
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.historyBack",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.historyBack.getCall(0).args, [3], "historyBack was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.isInitialNavigation", async function (assert) {
        // Arrange
        this.Navigation.isInitialNavigation = sandbox.stub().resolves(true);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.isInitialNavigation",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.isInitialNavigation",
            body: {
                result: true
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.isInitialNavigation.getCall(0).args, [], "isInitialNavigation was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.navigate", async function (assert) {
        // Arrange
        this.Navigation.navigate = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.navigate",
            body: {
                oTarget: { semanticObject: "SemanticObject", action: "action" }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.navigate",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, [oMessage.body.oTarget], "navigate was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.getPrimaryIntent", async function (assert) {
        // Arrange
        this.Navigation.getPrimaryIntent = sandbox.stub().resolves();
        const oPrimaryIntent = {
            intent: "#SemanticObject-Action?A=B&C=e&C=j",
            text: "Perform action"
        };
        this.Navigation.getPrimaryIntent.resolves(oPrimaryIntent);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.getPrimaryIntent",
            body: {
                sSemanticObject: "SemanticObject",
                oLinkFilter: {
                    action: "Action"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.getPrimaryIntent",
            body: {
                result: oPrimaryIntent
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.getPrimaryIntent.getCall(0).args, [oMessage.body.sSemanticObject, oMessage.body.oLinkFilter], "getPrimaryIntent was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.getLinks", async function (assert) {
        // Arrange
        this.Navigation.getLinks = sandbox.stub().resolves();
        const aLinks = [
            [{
                intent: "#SemanticObject-Action?A=B&C=e&C=j",
                text: "Perform action"
            }]
        ];
        this.Navigation.getLinks.resolves(aLinks);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.getLinks",
            body: [
                {
                    semanticObject: "SemanticObject",
                    action: "Action"
                }
            ]
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.getLinks",
            body: {
                result: aLinks
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.getLinks.getCall(0).args, [oMessage.body], "getLinks was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.getSemanticObjects", async function (assert) {
        // Arrange
        this.Navigation.getSemanticObjects = sandbox.stub().resolves(["SemanticObject1", "SemanticObject2"]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.getSemanticObjects",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.getSemanticObjects",
            body: {
                result: ["SemanticObject1", "SemanticObject2"]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.getSemanticObjects.getCall(0).args, [], "getSemanticObjects was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.isNavigationSupported", async function (assert) {
        // Arrange
        this.Navigation.isNavigationSupported = sandbox.stub().resolves([{ supported: true }, { supported: false }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.isNavigationSupported",
            body: {
                aTargets: [{
                    target: {
                        semanticObject: "SemanticObject1",
                        action: "Action1"
                    }
                }, {
                    target: {
                        semanticObject: "SemanticObject2",
                        action: "Action2"
                    }
                }]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.isNavigationSupported",
            body: {
                result: [{ supported: true }, { supported: false }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.isNavigationSupported.getCall(0).args, [oMessage.body.aTargets], "isNavigationSupported was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.resolveIntent", async function (assert) {
        // Arrange
        this.Navigation.resolveIntent = sandbox.stub().resolves({ url: "url/to/resource" });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.resolveIntent",
            body: {
                sHashFragment: "#SemanticObject-action"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.resolveIntent",
            body: {
                result: { url: "url/to/resource" }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.resolveIntent.getCall(0).args, [oMessage.body.sHashFragment], "resolveIntent was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.isUrlSupported - supported case", async function (assert) {
        // Arrange
        this.Navigation.isUrlSupported = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.isUrlSupported",
            body: {
                sUrl: "https://www.sap.com"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Navigation.isUrlSupported",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.isUrlSupported.getCall(0).args, [oMessage.body.sUrl], "isUrlSupported was called correctly.");
    });

    QUnit.test("sap.ushell.services.Navigation.isUrlSupported - not supported case", async function (assert) {
        // Arrange
        const oError = new Error("Failed intentionally");
        this.Navigation.isUrlSupported = sandbox.stub().returns(Promise.reject(oError));
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Navigation.isUrlSupported",
            body: {
                sUrl: "https://www.sap.com"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.Navigation.isUrlSupported",
            body: { message: oError.message, stack: oError.stack }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.isUrlSupported.getCall(0).args, [oMessage.body.sUrl], "isUrlSupported was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.hrefForExternal - success", async function (assert) {
        // Arrange
        this.Navigation.getHref = sandbox.stub().resolves("#SemanticObject-someAction?A=B");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.hrefForExternal",
            body: {
                oArgs: {
                    target: {
                        semanticObject: "SemanticObject",
                        action: "someAction"
                    },
                    params: { A: "B" }
                }
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.hrefForExternal",
            body: { result: "#SemanticObject-someAction?A=B" }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.getHref.getCall(0).args, [oMessage.body.oArgs], "getHref was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.hrefForExternal - error", async function (assert) {
        // Arrange
        const oError = new Error("Failed");
        this.Navigation.getHref = sandbox.stub().rejects(oError);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.hrefForExternal",
            body: {
                oArgs: {
                    target: {
                        semanticObject: "SemanticObject",
                        action: "someAction"
                    },
                    params: { A: "B" }
                }
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.CrossApplicationNavigation.hrefForExternal",
            body: { message: oError.message, stack: oError.stack }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.getHref.getCall(0).args, [oMessage.body.oArgs], "getHref was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks - success", async function (assert) {
        // Arrange
        sandbox.stub(navigationCompatibility, "getSemanticObjectLinks").resolves([{
            intent: "#SemanticObject-action?A=B",
            text: "Perform action"
        }]);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks",
            body: {
                sSemanticObject: "SemanticObject",
                mParameters: { A: "B" },
                bIgnoreFormFactors: false,
                sAppStateKey: "AS1234",
                bCompactIntents: true
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks",
            body: {
                result: [{
                    intent: "#SemanticObject-action?A=B",
                    text: "Perform action"
                }]
            }
        };
        const aExpectedArgs = [
            oMessage.body.sSemanticObject,
            oMessage.body.mParameters,
            oMessage.body.bIgnoreFormFactors,
            undefined, // oComponent
            oMessage.body.sAppStateKey,
            oMessage.body.bCompactIntents
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(navigationCompatibility.getSemanticObjectLinks.getCall(0).args, aExpectedArgs, "getSemanticObjectLinks was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks - error", async function (assert) {
        // Arrange
        const oError = new Error("rejected!");
        sandbox.stub(navigationCompatibility, "getSemanticObjectLinks").rejects(oError);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks",
            body: {
                sSemanticObject: "SemanticObject",
                mParameters: { A: "B" },
                bIgnoreFormFactors: false,
                sAppStateKey: "AS1234",
                bCompactIntents: true
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks",
            body: { message: oError.message, stack: oError.stack }
        };
        const aExpectedArgs = [
            oMessage.body.sSemanticObject,
            oMessage.body.mParameters,
            oMessage.body.bIgnoreFormFactors,
            undefined, // oComponent
            oMessage.body.sAppStateKey,
            oMessage.body.bCompactIntents
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(navigationCompatibility.getSemanticObjectLinks.getCall(0).args, aExpectedArgs, "getSemanticObjectLinks was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.isIntentSupported - success", async function (assert) {
        // Arrange
        sandbox.stub(navigationCompatibility, "isIntentSupported").resolves({
            "#GenericWrapperTest-open": { supported: true },
            "#Action-showBookmark": { supported: true },
            "#Action-invalidAction": { supported: false }
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.isIntentSupported",
            body: {
                aIntents: [
                    "#GenericWrapperTest-open",
                    "#Action-showBookmark",
                    "#Action-invalidAction"
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.isIntentSupported",
            body: {
                result: {
                    "#GenericWrapperTest-open": { supported: true },
                    "#Action-showBookmark": { supported: true },
                    "#Action-invalidAction": { supported: false }
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(navigationCompatibility.isIntentSupported.getCall(0).args, [oMessage.body.aIntents], "isIntentSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.isIntentSupported - error", async function (assert) {
        // Arrange
        const oError = new Error("rejected!");
        sandbox.stub(navigationCompatibility, "isIntentSupported").rejects(oError);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.isIntentSupported",
            body: {
                aIntents: [
                    "#GenericWrapperTest-open",
                    "#Action-showBookmark",
                    "#Action-invalidAction"
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.CrossApplicationNavigation.isIntentSupported",
            body: { message: oError.message, stack: oError.stack }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(navigationCompatibility.isIntentSupported.getCall(0).args, [oMessage.body.aIntents], "isIntentSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.isNavigationSupported - success", async function (assert) {
        // Arrange
        this.Navigation.isNavigationSupported = sandbox.stub().resolves([{ supported: true }, { supported: false }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.isNavigationSupported",
            body: {
                aIntents: [
                    { target: { semanticObject: "Action", action: "showBookmark" } },
                    { target: { semanticObject: "Action", action: "invalidAction" } }
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.isNavigationSupported",
            body: {
                result: [{ supported: true }, { supported: false }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.isNavigationSupported.getCall(0).args, [oMessage.body.aIntents], "isNavigationSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.isNavigationSupported - error", async function (assert) {
        // Arrange
        const oError = new Error("rejected!");
        this.Navigation.isNavigationSupported = sandbox.stub().rejects(oError);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.isNavigationSupported",
            body: {
                aIntents: [
                    { target: { semanticObject: "Action", action: "showBookmark" } },
                    { target: { semanticObject: "Action", action: "invalidAction" } }
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "error",
            service: "sap.ushell.services.CrossApplicationNavigation.isNavigationSupported",
            body: { message: oError.message, stack: oError.stack }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.isNavigationSupported.getCall(0).args, [oMessage.body.aIntents], "isNavigationSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.backToPreviousApp", async function (assert) {
        // Arrange
        this.Navigation.backToPreviousApp = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.backToPreviousApp",
            body: {}
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.backToPreviousApp",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.backToPreviousApp.getCall(0).args, [], "backToPreviousApp was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.historyBack", async function (assert) {
        // Arrange
        this.Navigation.historyBack = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.historyBack",
            body: {
                iSteps: 2
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.historyBack",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.historyBack.getCall(0).args, [2], "historyBack was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.historyBack - w/o steps", async function (assert) {
        // Arrange
        this.Navigation.historyBack = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.historyBack",
            body: {}
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.historyBack",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.historyBack.getCall(0).args, [undefined], "historyBack was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.toExternal", async function (assert) {
        // Arrange
        const oLocalStorageContent = {};
        sandbox.stub(ushellUtils, "getLocalStorage").returns({
            setItem (sKey, sValue) {
                oLocalStorageContent[sKey] = sValue;
            }
        });
        this.Navigation.navigate = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            body: {
                oArgs: {
                    target: { semanticObject: "SemanticObject", action: "someAction" },
                    params: { A: "B" }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            status: "success",
            body: {}
        };
        const oExpectedLocalStorageContent = {};

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, [oMessage.body.oArgs], "navigate was called correctly.");
        assert.deepEqual(oLocalStorageContent, oExpectedLocalStorageContent, "local storage content was stored as expected");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.toExternal - with expanded sap-system parameter", async function (assert) {
        // Arrange
        const oLocalStorageContent = {};
        sandbox.stub(ushellUtils, "getLocalStorage").returns({
            setItem (sKey, sValue) {
                oLocalStorageContent[sKey] = sValue;
            }
        });
        this.Navigation.navigate = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            body: {
                oArgs: {
                    target: { semanticObject: "SemanticObject", action: "someAction" },
                    params: {
                        "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                        "sap-system": {
                            id: "UI3",
                            client: "000",
                            language: "EN",
                            http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                            https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                            rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
                        }
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            status: "success",
            body: {}
        };
        const oExpectedLocalStorageContent = {
            "sap-system-data$UI3": JSON.stringify({
                id: "UI3",
                client: "000",
                language: "EN",
                http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
            })
        };
        const aExpectedNavigateArgs = [{
            target: { semanticObject: "SemanticObject", action: "someAction" },
            params: {
                "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                "sap-system": "UI3" // the ID from the expanded data
            }
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, aExpectedNavigateArgs, "navigate was called correctly.");
        assert.deepEqual(oLocalStorageContent, oExpectedLocalStorageContent, "local storage content was stored as expected");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.toExternal - with expanded sap-system parameter and sap-system-src (not in sid notation)", async function (assert) {
        // Arrange
        const oLocalStorageContent = {};
        sandbox.stub(ushellUtils, "getLocalStorage").returns({
            setItem (sKey, sValue) {
                oLocalStorageContent[sKey] = sValue;
            }
        });
        this.Navigation.navigate = sandbox.stub().resolves();

        sandbox.stub(Container, "getLogonSystem").returns({
            getSystemName: sandbox.stub().returns("UR5"),
            getClient: sandbox.stub().returns("120")
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            body: {
                oArgs: {
                    target: { semanticObject: "SemanticObject", action: "someAction" },
                    params: {
                        "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                        "sap-system": {
                            id: "UI3",
                            client: "000",
                            language: "EN",
                            http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                            https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                            rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
                        },
                        "sap-system-src": "UR5CLNT120"
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            status: "success",
            body: {}
        };
        const oExpectedLocalStorageContent = {
            "sap-system-data#UR5CLNT120:UI3": JSON.stringify({
                id: "UI3",
                client: "000",
                language: "EN",
                http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
            })
        };
        const aExpectedNavigateArgs = [{
            target: { semanticObject: "SemanticObject", action: "someAction" },
            params: {
                "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                "sap-system": "UI3",
                "sap-system-src": "UR5CLNT120"
            }
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, aExpectedNavigateArgs, "navigate was called correctly.");
        assert.deepEqual(oLocalStorageContent, oExpectedLocalStorageContent, "local storage content was stored as expected");
    });

    // eslint-disable-next-line max-len
    QUnit.test("sap.ushell.services.CrossApplicationNavigation.toExternal - with expanded sap-system parameter and sap-system-src (in sid notation, not matching the current system)", async function (assert) {
        // Arrange
        const oLocalStorageContent = {};
        sandbox.stub(ushellUtils, "getLocalStorage").returns({
            setItem (sKey, sValue) {
                oLocalStorageContent[sKey] = sValue;
            }
        });
        this.Navigation.navigate = sandbox.stub().resolves();

        sandbox.stub(Container, "getLogonSystem").returns({
            getSystemName: sandbox.stub().returns("UR5"),
            getClient: sandbox.stub().returns("120")
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            body: {
                oArgs: {
                    target: { semanticObject: "SemanticObject", action: "someAction" },
                    params: {
                        "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                        "sap-system": {
                            id: "UI3",
                            client: "000",
                            language: "EN",
                            http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                            https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                            rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
                        },
                        "sap-system-src": "sid(UV3.120)" // this is supposed to be the unique id of the system that sent the expanded sap-system
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            status: "success",
            body: {}
        };
        const oExpectedLocalStorageContent = {
            "sap-system-data#sid(UV3.120):UI3": JSON.stringify({
                id: "UI3",
                client: "000",
                language: "EN",
                http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
            })
        };
        const aExpectedNavigateArgs = [{
            target: { semanticObject: "SemanticObject", action: "someAction" },
            params: {
                "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                "sap-system": "UI3",
                "sap-system-src": "sid(UV3.120)"
            }
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, aExpectedNavigateArgs, "navigate was called correctly.");
        assert.deepEqual(oLocalStorageContent, oExpectedLocalStorageContent, "local storage content was stored as expected");
    });

    // eslint-disable-next-line max-len
    QUnit.test("sap.ushell.services.CrossApplicationNavigation.toExternal - with expanded sap-system parameter and sap-system-src (in sid notation, matching the current system)", async function (assert) {
        // Arrange
        const oLocalStorageContent = {};
        sandbox.stub(ushellUtils, "getLocalStorage").returns({
            setItem (sKey, sValue) {
                oLocalStorageContent[sKey] = sValue;
            }
        });
        this.Navigation.navigate = sandbox.stub().resolves();

        sandbox.stub(Container, "getLogonSystem").returns({
            getSystemName: sandbox.stub().returns("UR5"),
            getClient: sandbox.stub().returns("120")
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            body: {
                oArgs: {
                    target: { semanticObject: "SemanticObject", action: "someAction" },
                    params: {
                        "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                        "sap-system": {
                            id: "UI3",
                            client: "000",
                            language: "EN",
                            http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                            https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                            rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
                        },
                        "sap-system-src": "sid(UR5.120)" // this is provided, and it matches the local system...
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            status: "success",
            body: {}
        };
        const oExpectedLocalStorageContent = {
            "sap-system-data#sid(UR5.120):UI3": JSON.stringify({ // note: empty string used for sap-system
                id: "UI3",
                client: "000",
                language: "EN",
                http: { id: "UI3_HTTP", host: "ldai1ui3.example.com", port: 50032 },
                https: { id: "UI3_HTTPS", host: "ldai1ui3.example.com", port: 44332 },
                rfc: { id: "UI3", systemId: "UI3", host: "ldciui3.example.com", service: 32, loginGroup: "PUBLIC" }
            })
        };
        const aExpectedNavigateArgs = [{
            target: { semanticObject: "SemanticObject", action: "someAction" },
            params: {
                "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                "sap-system": "UI3",
                "sap-system-src": "sid(UR5.120)"
            }
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, aExpectedNavigateArgs, "navigate was called correctly.");
        assert.deepEqual(oLocalStorageContent, oExpectedLocalStorageContent, "local storage content was stored as expected");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.toExternal - with sap-system in sid notation matching the local system", async function (assert) {
        // Arrange
        const oLocalStorageContent = {};
        sandbox.stub(ushellUtils, "getLocalStorage").returns({
            setItem (sKey, sValue) {
                oLocalStorageContent[sKey] = sValue;
            }
        });
        this.Navigation.navigate = sandbox.stub().resolves();

        sandbox.stub(Container, "getLogonSystem").returns({
            getSystemName: sandbox.stub().returns("UI3"),
            getClient: sandbox.stub().returns("000")
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            body: {
                oArgs: {
                    target: { semanticObject: "SemanticObject", action: "someAction" },
                    params: {
                        "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET",
                        "sap-system": "sid(UI3.000)"
                        // no sap-system-src provided
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.toExternal",
            status: "success",
            body: {}
        };
        const oExpectedLocalStorageContent = {};
        const aExpectedNavigateArgs = [{
            target: { semanticObject: "SemanticObject", action: "someAction" },
            params: { "sap-ui2-wd-app-id": "WDR_TEST_PORTAL_NAV_TARGET" } // sap-system is removed completely
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, aExpectedNavigateArgs, "navigate was called correctly.");
        assert.deepEqual(oLocalStorageContent, oExpectedLocalStorageContent, "local storage content was stored as expected");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.expandCompactHash", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.expandCompactHash = sandbox.stub().resolvesDeferred("#SemanticObject-Action?foo=bar");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.expandCompactHash",
            body: {
                sHashFragment: "#SemanticObject-Action?sap-intent-param=AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.expandCompactHash",
            body: {
                result: "#SemanticObject-Action?foo=bar"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.expandCompactHash.getCall(0).args, [oMessage.body.sHashFragment], "expandCompactHash was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getDistinctSemanticObjects", async function (assert) {
        // Arrange
        this.Navigation.getSemanticObjects = sandbox.stub().resolves(["SemanticObject1", "SemanticObject2"]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getDistinctSemanticObjects",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.getDistinctSemanticObjects",
            body: {
                result: ["SemanticObject1", "SemanticObject2"]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.getSemanticObjects.getCall(0).args, [], "getSemanticObjects was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getLinks", async function (assert) {
        // Arrange
        sandbox.stub(navigationCompatibility, "getLinks").resolves([{
            intent: "#SemanticObject-Action?A=B&C=e&C=j",
            text: "Perform action"
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getLinks",
            body: {
                semanticObject: "SemanticObject1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.getLinks",
            body: {
                result: [{
                    intent: "#SemanticObject-Action?A=B&C=e&C=j",
                    text: "Perform action"
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(navigationCompatibility.getLinks.getCall(0).args, [oMessage.body], "getLinks was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.getPrimaryIntent", async function (assert) {
        // Arrange
        const oPrimaryIntent = {
            intent: "#SemanticObject-Action?A=B&C=e&C=j",
            text: "Perform action"
        };
        this.Navigation.getPrimaryIntent = sandbox.stub().resolves(oPrimaryIntent);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.getPrimaryIntent",
            body: {
                sSemanticObject: "Test-Object",
                mParameters: "Test-Param"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.getPrimaryIntent",
            body: {
                result: oPrimaryIntent
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.getPrimaryIntent.getCall(0).args, [oMessage.body.sSemanticObject, oMessage.body.mParameters], "getPrimaryIntent was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.hrefForAppSpecificHash", async function (assert) {
        // Arrange
        this.Navigation.getHref = sandbox.stub().resolves("#SemanticObject-Action?A=B&/View1/details/0/");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.hrefForAppSpecificHash",
            body: {
                sAppHash: "View1/details/0/"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.hrefForAppSpecificHash",
            body: {
                result: "#SemanticObject-Action?A=B&/View1/details/0/"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.getHref.getCall(0).args, [{ appSpecificRoute: oMessage.body.sAppHash }], "getHref was called correctly");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.isInitialNavigation", async function (assert) {
        // Arrange
        this.Navigation.isInitialNavigation = sandbox.stub().resolves(true);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.isInitialNavigation",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.isInitialNavigation",
            body: {
                result: true
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.isInitialNavigation.getCall(0).args, [], "isInitialNavigation was called correctly.");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute - same inner app route", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B&C=e&C=j&/View1/details/0/");
        sandbox.stub(hasher, "setHash");
        sandbox.stub(hasher, "replaceHash");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {
                appSpecificRoute: "&/View1/details/0/",
                writeHistory: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(hasher.setHash.callCount, 0, "setHash was not called");
        assert.strictEqual(hasher.replaceHash.callCount, 0, "replaceHash was not called");
        assert.notStrictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing was not disabled");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute - writeHistory=true", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B&C=e&C=j");
        sandbox.stub(hasher, "setHash").callsFake(() => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing is disabled");
        });
        sandbox.stub(hasher, "replaceHash");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {
                appSpecificRoute: "&/View1/details/0/",
                writeHistory: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(hasher.setHash.getCall(0).args, ["#SemanticObject-Action?A=B&C=e&C=j&/View1/details/0/"], "setHash was called correctly");
        assert.strictEqual(hasher.replaceHash.callCount, 0, "replaceHash was not called");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "hash change processing is enabled again");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute - writeHistory='true'", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B&C=e&C=j");
        sandbox.stub(hasher, "setHash").callsFake(() => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing is disabled");
        });
        sandbox.stub(hasher, "replaceHash");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {
                appSpecificRoute: "&/View1/details/0/",
                writeHistory: "true"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(hasher.setHash.getCall(0).args, ["#SemanticObject-Action?A=B&C=e&C=j&/View1/details/0/"], "setHash was called correctly");
        assert.strictEqual(hasher.replaceHash.callCount, 0, "replaceHash was not called");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "hash change processing is enabled again");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute - writeHistory=false", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("SemanticObject-Action?A=B&C=e&C=j");
        sandbox.stub(hasher, "setHash");
        sandbox.stub(hasher, "replaceHash").callsFake(() => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "hash change processing is disabled");
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {
                appSpecificRoute: "&/View1/details/0/",
                writeHistory: false
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(hasher.setHash.callCount, 0, "setHash was not called");
        assert.deepEqual(hasher.replaceHash.getCall(0).args, ["#SemanticObject-Action?A=B&C=e&C=j&/View1/details/0/"], "replaceHash was called correctly");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "hash change processing is enabled again");
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.resolveIntent", async function (assert) {
        // Arrange
        this.Navigation.resolveIntent = sandbox.stub().resolves({ url: "url/to/resource" });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.resolveIntent",
            body: {
                sHashFragment: "#SemanticObject-action"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.resolveIntent",
            body: {
                result: { url: "url/to/resource" }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Navigation.resolveIntent.getCall(0).args, [oMessage.body.sHashFragment], "resolveIntent was called correctly.");
    });

    QUnit.test("sap.ushell.services.ShellNavigation.toExternal", async function (assert) {
        // Arrange
        this.ShellNavigationInternal.toExternal = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellNavigation.toExternal",
            body: {
                oArgs: { value: "Test" },
                bWriteHistory: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ShellNavigation.toExternal",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.ShellNavigationInternal.toExternal.getCall(0).args, [oMessage.body.oArgs, undefined, oMessage.body.bWriteHistory], "toExternal was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellNavigation.toAppHash", async function (assert) {
        // Arrange
        this.ShellNavigationInternal.toAppHash = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellNavigation.toAppHash",
            body: {
                sAppHash: "Test-Hash",
                bWriteHistory: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ShellNavigation.toAppHash",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.ShellNavigationInternal.toAppHash.getCall(0).args, [oMessage.body.sAppHash, oMessage.body.bWriteHistory], "toAppHash was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellNavigationInternal.toExternal", async function (assert) {
        // Arrange
        this.ShellNavigationInternal.toExternal = sandbox.stub().resolves();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellNavigationInternal.toExternal",
            body: {
                oArgs: { value: "Test" },
                bWriteHistory: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ShellNavigationInternal.toExternal",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.ShellNavigationInternal.toExternal.getCall(0).args, [oMessage.body.oArgs, undefined, oMessage.body.bWriteHistory], "toExternal was called correctly");
    });

    QUnit.test("sap.ushell.services.ShellNavigationInternal.toAppHash", async function (assert) {
        // Arrange
        this.ShellNavigationInternal.toAppHash = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellNavigationInternal.toAppHash",
            body: {
                sAppHash: "Test-Hash",
                bWriteHistory: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ShellNavigationInternal.toAppHash",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.ShellNavigationInternal.toAppHash.getCall(0).args, [oMessage.body.sAppHash, oMessage.body.bWriteHistory], "toAppHash was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolution.getDistinctSemanticObjects", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.getDistinctSemanticObjects = sandbox.stub().resolvesDeferred(["SemanticObject1", "SemanticObject2"]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolution.getDistinctSemanticObjects",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolution.getDistinctSemanticObjects",
            body: {
                result: ["SemanticObject1", "SemanticObject2"]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.getDistinctSemanticObjects.getCall(0).args, [], "getDistinctSemanticObjects was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolution.expandCompactHash", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.expandCompactHash = sandbox.stub().resolvesDeferred("#SemanticObject-Action?foo=bar");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolution.expandCompactHash",
            body: {
                sHashFragment: "#SemanticObject-Action?sap-intent-param=AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolution.expandCompactHash",
            body: {
                result: "#SemanticObject-Action?foo=bar"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.expandCompactHash.getCall(0).args, [oMessage.body.sHashFragment], "expandCompactHash was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolution.resolveHashFragment", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.resolveHashFragment = sandbox.stub().resolvesDeferred({ url: "path/to/resource" });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolution.resolveHashFragment",
            body: {
                sHashFragment: "#SemanticObject-Action?sap-intent-param=AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolution.resolveHashFragment",
            body: {
                result: { url: "path/to/resource" }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.resolveHashFragment.getCall(0).args, [oMessage.body.sHashFragment], "expandCompactHash was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolution.isIntentSupported", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.isNavigationSupported = sandbox.stub().resolvesDeferred([
            { supported: true },
            { supported: true },
            { supported: false }
        ]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolution.isIntentSupported",
            body: {
                aIntents: [
                    "#GenericWrapperTest-open",
                    "#Action-showBookmark",
                    "#Action-invalidAction"
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolution.isIntentSupported",
            body: {
                result: {
                    "#GenericWrapperTest-open": { supported: true },
                    "#Action-showBookmark": { supported: true },
                    "#Action-invalidAction": { supported: false }
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.NavTargetResolutionInternal.isNavigationSupported.getCall(0).args, [oMessage.body.aIntents], "isIntentSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolution.isNavigationSupported", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.isNavigationSupported = sandbox.stub().resolvesDeferred([
            { supported: true },
            { supported: true },
            { supported: false }
        ]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolution.isNavigationSupported",
            body: {
                aIntents: [
                    "#GenericWrapperTest-open",
                    "#Action-showBookmark",
                    "#Action-invalidAction"
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolution.isNavigationSupported",
            body: {
                result: [
                    { supported: true },
                    { supported: true },
                    { supported: false }
                ]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.NavTargetResolutionInternal.isNavigationSupported.getCall(0).args, [oMessage.body.aIntents], "isIntentSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolutionInternal.getDistinctSemanticObjects", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.getDistinctSemanticObjects = sandbox.stub().resolvesDeferred(["SemanticObject1", "SemanticObject2"]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolutionInternal.getDistinctSemanticObjects",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolutionInternal.getDistinctSemanticObjects",
            body: {
                result: ["SemanticObject1", "SemanticObject2"]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.getDistinctSemanticObjects.getCall(0).args, [], "getDistinctSemanticObjects was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolutionInternal.expandCompactHash", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.expandCompactHash = sandbox.stub().resolvesDeferred("#SemanticObject-Action?foo=bar");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolutionInternal.expandCompactHash",
            body: {
                sHashFragment: "#SemanticObject-Action?sap-intent-param=AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolutionInternal.expandCompactHash",
            body: {
                result: "#SemanticObject-Action?foo=bar"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.expandCompactHash.getCall(0).args, [oMessage.body.sHashFragment], "expandCompactHash was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolutionInternal.resolveHashFragment", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.resolveHashFragment = sandbox.stub().resolvesDeferred({ url: "path/to/resource" });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolutionInternal.resolveHashFragment",
            body: {
                sHashFragment: "#SemanticObject-Action?sap-intent-param=AS1234"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolutionInternal.resolveHashFragment",
            body: {
                result: { url: "path/to/resource" }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.NavTargetResolutionInternal.resolveHashFragment.getCall(0).args, [oMessage.body.sHashFragment], "expandCompactHash was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolutionInternal.isIntentSupported", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.isNavigationSupported = sandbox.stub().resolvesDeferred([
            { supported: true },
            { supported: true },
            { supported: false }
        ]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolutionInternal.isIntentSupported",
            body: {
                aIntents: [
                    "#GenericWrapperTest-open",
                    "#Action-showBookmark",
                    "#Action-invalidAction"
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolutionInternal.isIntentSupported",
            body: {
                result: {
                    "#GenericWrapperTest-open": { supported: true },
                    "#Action-showBookmark": { supported: true },
                    "#Action-invalidAction": { supported: false }
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.NavTargetResolutionInternal.isNavigationSupported.getCall(0).args, [oMessage.body.aIntents], "isIntentSupported was called correctly");
    });

    QUnit.test("sap.ushell.services.NavTargetResolutionInternal.isNavigationSupported", async function (assert) {
        // Arrange
        this.NavTargetResolutionInternal.isNavigationSupported = sandbox.stub().resolvesDeferred([
            { supported: true },
            { supported: true },
            { supported: false }
        ]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.NavTargetResolutionInternal.isNavigationSupported",
            body: {
                aIntents: [
                    "#GenericWrapperTest-open",
                    "#Action-showBookmark",
                    "#Action-invalidAction"
                ]
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.NavTargetResolutionInternal.isNavigationSupported",
            body: {
                result: [
                    { supported: true },
                    { supported: true },
                    { supported: false }
                ]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.NavTargetResolutionInternal.isNavigationSupported.getCall(0).args, [oMessage.body.aIntents], "isIntentSupported was called correctly");
    });

    QUnit.module("Misc", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            sandbox.stub(Container, "getServiceAsync");

            this.oSystemContext = { id: "systemContextId" };
            this.AppLifeCycle = {
                getCurrentApplication: sandbox.stub().returns({
                    getSystemContext: sandbox.stub().resolves(this.oSystemContext)
                })
            };
            Container.getServiceAsync.withArgs("AppLifeCycle").resolves(this.AppLifeCycle);
            this.ReferenceResolver = {};
            Container.getServiceAsync.withArgs("ReferenceResolver").resolves(this.ReferenceResolver);
            this.UserDefaultParameters = {};
            Container.getServiceAsync.withArgs("UserDefaultParameters").resolves(this.UserDefaultParameters);

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.services.ReferenceResolver.resolveReferences", async function (assert) {
        // Arrange
        this.ReferenceResolver.resolveReferences = sandbox.stub().resolves({
            "UserDefault.currency": "EUR",
            "User.env.sap-theme-name": "sap_horizon"
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ReferenceResolver.resolveReferences",
            body: {
                aReferences: ["UserDefault.currency", "User.env.sap-theme-name"]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.ReferenceResolver.resolveReferences",
            body: {
                result: {
                    "UserDefault.currency": "EUR",
                    "User.env.sap-theme-name": "sap_horizon"
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.ReferenceResolver.resolveReferences.getCall(0).args, [oMessage.body.aReferences], "resolveReferences was called correctly");
    });

    QUnit.test("sap.ushell.services.UserDefaultParameters.getValue", async function (assert) {
        // Arrange
        this.UserDefaultParameters.getValue = sandbox.stub().resolves({ value: "1010" });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserDefaultParameters.getValue",
            body: {
                sParameterName: "CompanyCode"
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserDefaultParameters.getValue",
            body: {
                result: { value: "1010" }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.UserDefaultParameters.getValue.getCall(0).args, [oMessage.body.sParameterName, this.oSystemContext], "getValue was called with the expected arguments.");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl", async function (assert) {
        // Arrange
        this.oSystemContext.getFullyQualifiedXhrUrl = sandbox.stub().callsFake((sUrl) => `/dynamic_dest${sUrl}`);
        sandbox.stub(Container, "getFLPUrl").withArgs(true).returns("https://flp.example.com:8080/path/to/flp#Action-toApp");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl",
            body: {
                path: "/path/to/resource"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl",
            status: "success",
            body: {
                result: "https://flp.example.com:8080/dynamic_dest/path/to/resource"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl - empty path", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl",
            body: {
                path: ""
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.getSystemAlias", async function (assert) {
        // Arrange
        this.oCurrentApplication.setCurrentAppTargetResolution({
            systemAlias: "ABC",
            contentProviderId: "TEST_ABC"
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.getSystemAlias",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.getSystemAlias",
            status: "success",
            body: {
                result: "ABC"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });
});
