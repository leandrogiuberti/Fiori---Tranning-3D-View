// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.services.Navigation
 */
sap.ui.define([
    "sap/ushell/appRuntime/ui5/services/Navigation",
    "sap/ushell/Container",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ui/core/Component"
], (
    Navigation,
    Container,
    AppRuntimeContext,
    AppCommunicationMgr,
    Component
) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.appRuntime.ui5.services.Navigation", {
        beforeEach: function () {
            this.oNavigationService = new Navigation();
            const oAppLifeCycle = {};
            const oNavTargetResolutionInternal = {
                getLinks: () => {
                    return Promise.resolve([[]]);
                }
            };
            const oGetServiceAsync = sandbox.stub(Container, "getServiceAsync")
                .withArgs("AppLifeCycle").resolves(oAppLifeCycle);
            oGetServiceAsync
                .withArgs("NavTargetResolutionInternal").resolves(oNavTargetResolutionInternal);

            this.aLinkFilter = [
                {
                    semanticObject: "App1"
                },
                {
                    semanticObject: "App2"
                }
            ];
            this.aLinkFilterWithComponent = [
                {
                    semanticObject: "App3",
                    ui5Component: new Component()
                }
            ];
            const oGetLinksLocal = sandbox.stub(this.oNavigationService, "getLinksLocal")
                .withArgs(sinon.match(this.aLinkFilter))
                .resolves([
                    [
                        {
                            intent: "#App1-edit",
                            text: "Local App 1"
                        }
                    ],
                    [
                        {
                            intent: "#App2-display",
                            text: "Local App 2"
                        }
                    ]
                ]);
            oGetLinksLocal
                .withArgs(sinon.match([]))
                .resolves([
                    [
                        {
                            intent: "#App1-display",
                            text: "Local App 1"
                        }
                    ]
                ]);
            oGetLinksLocal
                .withArgs(sinon.match(this.aLinkFilterWithComponent))
                .resolves([
                    [
                        {
                            intent: "#App3-display",
                            text: "Local App 3"
                        }
                    ]
                ]);
            this.oGetIsScubeStub = sandbox.stub(AppRuntimeContext, "getIsScube").returns(false);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("getHref works as expected", async function (assert) {
        // Arrange
        const sExpectedHref = "#AnObject-action";
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .withArgs("sap.ushell.services.Navigation.getHref")
            .resolves(sExpectedHref);
        const oTarget = { semanticObject: "SO", action: "action" };
        // Act
        const sActualHref = await this.oNavigationService.getHref(oTarget);
        // Assert
        assert.deepEqual(sActualHref, sExpectedHref, "getHref returns the expected hrefs as a promise");
    });

    QUnit.test("getLinks - works as expected", async function (assert) {
        // Arrange
        const aLinkFilter = [
            {
                semanticObject: "SO",
                action: "action"
            }
        ];
        const oRemoteLink = {
            intent: "#App1-edit",
            text: "Remote App 1"
        };
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .withArgs("sap.ushell.services.Navigation.getLinks")
            .resolves([[
                oRemoteLink
            ]]);
        // Act
        const aActualLinks = await this.oNavigationService.getLinks(aLinkFilter);
        // Assert
        assert.ok(aActualLinks instanceof Array, "getLinks returns links as a promise");
        assert.deepEqual(aActualLinks, [[oRemoteLink]], "getLinks returns the expected array of array of a link");
    });

    QUnit.test("getLinks, isScube is true, empty filter - remote links", async function (assert) {
        // Arrange
        this.oGetIsScubeStub.returns(true);
        const oRemoteLink = {
            intent: "#App1-edit",
            text: "Remote App 1"
        };
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .withArgs("sap.ushell.services.Navigation.getLinks")
            .resolves([[oRemoteLink]]);
        const aLinkFilter = [];
        // Act
        const aActualLinks = await this.oNavigationService.getLinks(aLinkFilter);
        // Assert
        assert.deepEqual(aActualLinks, [[
            oRemoteLink,
            {
                intent: "#App1-display",
                text: "Local App 1"
            }
        ]], "getLinks returns the expected array of array of a link");
    });

    QUnit.test("getLinks, isScube is true, multiple filter, multiple local links and and multiple remote links", async function (assert) {
        // Arrange
        this.oGetIsScubeStub.returns(true);
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP").resolves([
            [
                {
                    intent: "#App1-display",
                    text: "Remote App 1"
                }
            ],
            [
                {
                    intent: "#App2-display",
                    text: "Remote App 2"
                }
            ]
        ]);
        const aExpectedLinks = [
            [
                {
                    intent: "#App1-display",
                    text: "Remote App 1"
                },
                {
                    intent: "#App1-edit",
                    text: "Local App 1"
                }
            ],
            [
                {
                    intent: "#App2-display",
                    text: "Remote App 2"
                },
                {
                    intent: "#App2-display",
                    text: "Local App 2"
                }
            ]
        ];
        // Act
        const aActualLinks = await this.oNavigationService.getLinks(this.aLinkFilter);
        // Assert
        assert.strictEqual(aActualLinks.length, 2, "getLinks returns one link");
        assert.deepEqual(aActualLinks, aExpectedLinks, "getLinks returns the correct links");
    });

    QUnit.test("getLinks, isScube is true,  - ui5Component removed", async function (assert) {
        // Arrange
        this.oGetIsScubeStub.returns(true);
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .withArgs("sap.ushell.services.Navigation.getLinks")
            .resolves([[]]);

        // Act
        const aActualLinks = await this.oNavigationService.getLinks(this.aLinkFilterWithComponent);
        // Assert
        assert.ok(aActualLinks instanceof Array, "getLinks returns links as a promise");
        assert.deepEqual(aActualLinks, [
            [
                {
                    intent: "#App3-display",
                    text: "Local App 3"
                }
            ]
        ],
        "getLinks returns the expected array of array of a link");
        assert.strictEqual(this.aLinkFilterWithComponent[0].ui5Component, undefined, "ui5Component is removed from the link filter");
    });
});
