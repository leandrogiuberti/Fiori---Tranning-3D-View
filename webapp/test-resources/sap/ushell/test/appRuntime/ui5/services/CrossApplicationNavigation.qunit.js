// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.services.CrossApplicationNavigation
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ushell/appRuntime/ui5/services/CrossApplicationNavigation",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/Container",
    "sap/ui/core/Component"
], (
    CrossApplicationNavigation,
    AppCommunicationMgr,
    AppRuntimeContext,
    Container,
    Component
) => {
    "use strict";

    /* global sinon, QUnit */
    const sandbox = sinon.createSandbox({});
    let oCrossAppNavService;

    QUnit.module("sap.ushell.test.appRuntime.ui5.services.CrossApplicationNavigation", {
        beforeEach: function (assert) {
            oCrossAppNavService = new CrossApplicationNavigation();
            return Container.init("local");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("call isNavigationSupported", function (assert) {
        AppRuntimeContext.setIsScube(false);
        sandbox.spy(AppRuntimeContext, "getIsScube");
        sandbox.stub(AppCommunicationMgr, "sendMessageToOuterShell");
        sandbox.stub(Container, "getServiceAsync");

        oCrossAppNavService.isNavigationSupported([], undefined);

        assert.strictEqual(AppRuntimeContext.getIsScube.callCount, 1);
        assert.strictEqual(AppCommunicationMgr.sendMessageToOuterShell.callCount, 1);
        assert.strictEqual(Container.getServiceAsync.callCount, 0);
    });

    QUnit.test("call isNavigationSupported for checking only in outer shell", function (assert) {
        AppRuntimeContext.setIsScube(false);
        sandbox.spy(AppRuntimeContext, "getIsScube");
        sandbox.stub(AppCommunicationMgr, "sendMessageToOuterShell");
        sandbox.stub(Container, "getServiceAsync");

        oCrossAppNavService.isNavigationSupported([], undefined, true);

        assert.strictEqual(AppRuntimeContext.getIsScube.callCount, 0);
        assert.strictEqual(AppCommunicationMgr.sendMessageToOuterShell.callCount, 1);
        assert.strictEqual(Container.getServiceAsync.callCount, 0);
    });

    QUnit.test("scube - call isNavigationSupported for checking both in iframe and outer shell", function (assert) {
        const stub1 = sandbox.stub().returns({
            done: function (fnResolve) {
                fnResolve();
            }
        });
        AppRuntimeContext.setIsScube(true);
        sandbox.spy(AppRuntimeContext, "getIsScube");
        sandbox.stub(AppCommunicationMgr, "sendMessageToOuterShell");
        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
            isNavigationSupported: stub1
        }));

        return oCrossAppNavService.isNavigationSupported([], undefined)
            .then(() => {
                assert.strictEqual(AppRuntimeContext.getIsScube.callCount, 1);
                assert.strictEqual(Container.getServiceAsync.callCount, 1);
                assert.strictEqual(stub1.callCount, 1);
                assert.strictEqual(AppCommunicationMgr.sendMessageToOuterShell.callCount, 0);
            });
    });

    QUnit.module("sap.ushell.appRuntime.ui5.services.CrossApplicationNavigation", {
        beforeEach: function () {
            this.oCrossApplicationNavigationService = new CrossApplicationNavigation();
            const oAppLifeCycle = {};
            const oNavTargetResolutionInternal = {
                getLinks: function () {
                    return Promise.resolve([[]]);
                }
            };
            const oGetServiceAsync = sandbox.stub(Container, "getServiceAsync")
                .withArgs("AppLifeCycle").resolves(oAppLifeCycle);
            oGetServiceAsync
                .withArgs("NavTargetResolutionInternal").resolves(oNavTargetResolutionInternal);

            this.aLinkFilter = [
                [
                    {
                        semanticObject: "App1",
                        ui5Component: new Component()
                    }
                ],
                [
                    {
                        semanticObject: "App2"
                    }
                ]
            ];
            this.oLinkFilterWithComponent =
                {
                    semanticObject: "App3",
                    ui5Component: new Component()
                };
            const oGetLinksLocal = sandbox.stub(this.oCrossApplicationNavigationService, "getLinksLocal")
                .withArgs(sinon.match(this.aLinkFilter))
                .resolves([
                    [
                        [
                            {
                                intent: "#App1-edit",
                                text: "Local App 1"
                            }
                        ]
                    ],
                    [
                        [
                            {
                                intent: "#App2-display",
                                text: "Local App 2"
                            }
                        ]
                    ]
                ]);
            oGetLinksLocal
                .withArgs(sinon.match([]))
                .resolves([
                    [
                        [
                            {
                                intent: "#App1-display",
                                text: "Local App 1"
                            }
                        ]
                    ]
                ]);
            oGetLinksLocal
                .withArgs(sinon.match(this.oLinkFilterWithComponent))
                .resolves([
                    [
                        [
                            {
                                intent: "#App3-display",
                                text: "Local App 3"
                            }
                        ]
                    ]
                ]);
            oGetLinksLocal
                .withArgs(sinon.match())
                .resolves([
                    {
                        intent: "#App1-display",
                        text: "Local App 1"
                    }
                ]);
            this.oGetIsScubeStub = sandbox.stub(AppRuntimeContext, "getIsScube").returns(false);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("getLinks - works as expected - mass function", async function (assert) {
        // Arrange
        const aLinkFilter = [
            [
                {
                    semanticObject: "SO",
                    action: "action"
                }
            ]
        ];
        const oRemoteLink = {
            intent: "#App1-edit",
            text: "Remote App 1"
        };
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .withArgs("sap.ushell.services.CrossApplicationNavigation.getLinks")
            .resolves([[
                oRemoteLink
            ]]);
        // Act
        const aActualLinks = await this.oCrossApplicationNavigationService.getLinks(aLinkFilter);
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
            .withArgs("sap.ushell.services.CrossApplicationNavigation.getLinks")
            .resolves([oRemoteLink]);
        // Act
        const aActualLinks = await this.oCrossApplicationNavigationService.getLinks();
        // Assert
        assert.deepEqual(aActualLinks, [
            oRemoteLink,
            {
                intent: "#App1-display",
                text: "Local App 1"
            }
        ], "getLinks returns the expected array of array of a link");
    });

    QUnit.test("getLinks, isScube is true, multiple filter, multiple local links and and multiple remote links", async function (assert) {
        // Arrange
        this.oGetIsScubeStub.returns(true);
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP").resolves([
            [
                [
                    {
                        intent: "#App1-display",
                        text: "Remote App 1"
                    }
                ]
            ],
            [
                [
                    {
                        intent: "#App2-display",
                        text: "Remote App 2"
                    }
                ]
            ]
        ]);
        const aExpectedLinks = [
            [
                [
                    {
                        intent: "#App1-display",
                        text: "Remote App 1"
                    },
                    {
                        intent: "#App1-edit",
                        text: "Local App 1"
                    }
                ]
            ],
            [
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
            ]
        ];
        // Act
        const aActualLinks = await this.oCrossApplicationNavigationService.getLinks(this.aLinkFilter);
        // Assert
        assert.strictEqual(aActualLinks.length, 2, "getLinks returns one link");
        assert.deepEqual(aActualLinks, aExpectedLinks, "getLinks returns the correct links");
    });

    QUnit.test("getLinks, isScube is true,  - ui5Component removed", async function (assert) {
        // Arrange
        this.oGetIsScubeStub.returns(true);
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .withArgs("sap.ushell.services.CrossApplicationNavigation.getLinks")
            .resolves([]);

        // Act
        const aActualLinks = await this.oCrossApplicationNavigationService.getLinks(this.oLinkFilterWithComponent);
        // Assert
        assert.ok(aActualLinks instanceof Array, "getLinks returns links as a promise");
        assert.deepEqual(aActualLinks, [
            [
                [
                    {
                        intent: "#App3-display",
                        text: "Local App 3"
                    }
                ]
            ]
        ],
        "getLinks returns the expected array of array of a link");
        assert.strictEqual(this.oLinkFilterWithComponent.ui5Component, undefined, "ui5Component is removed from the link filter");
    });

    QUnit.test("getLinks, isScube is true, multiple filter, multiple local links and multiple remote links, component removed", async function (assert) {
        // Arrange
        this.oGetIsScubeStub.returns(true);
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP")
            .resolves([[[]], [[]]]); // Simulating no remote links nicely.
        const aExpectedLinks = [
            [
                [
                    {
                        intent: "#App1-edit",
                        text: "Local App 1"
                    }
                ]
            ],
            [
                [
                    {
                        intent: "#App2-display",
                        text: "Local App 2"
                    }
                ]
            ]
        ];
        // Act
        const aActualLinks = await this.oCrossApplicationNavigationService.getLinks(this.aLinkFilter);
        // Assert
        assert.strictEqual(aActualLinks.length, 2, "getLinks returns one link");
        assert.deepEqual(aActualLinks, aExpectedLinks, "getLinks returns the correct links");
        this.aLinkFilter.forEach((oLink) => {
            assert.strictEqual(oLink.ui5Component, undefined, "ui5Component is removed from the link filter");
        });
    });
});
