// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.NavigationHelper
 */
sap.ui.define([
    "sap/ushell/components/shell/SideNavigation/modules/NavigationHelper",
    "sap/ushell/Container",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/api/performance/Extension"
], (NavigationHelper, Container, WindowUtils, Extension) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The '_performNavigation' function", {
        beforeEach: function () {
            this.oNavigateStub = sandbox.stub();
            this.oGetServiceAsyncStub = sandbox.stub();
            this.oNavigationService = {
                navigate: this.oNavigateStub
            };
            this.oGetServiceAsyncStub.withArgs("Navigation").resolves(this.oNavigationService);
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            this.oNavigationHelper = new NavigationHelper();
            sandbox.spy(Extension.prototype, "addNavigationSource");
        },

        afterEach: function () {
            sandbox.restore();
            this.oNavigationHelper = null;
        }
    });

    QUnit.test("Calls 'navigate' of Navigation service with the right intent", function (assert) {
        // Arrange
        const oDestinationTarget = {
            semanticObject: "Launchpad",
            action: "openFLPPage",
            parameters: [
                { name: "spaceId", value: "Z_TEST_SPACE" },
                { name: "pageId", value: "Z_TEST_PAGE" }
            ]
        };

        const oExpectedIntent = {
            params: {
                pageId: [
                    "Z_TEST_PAGE"
                ],
                spaceId: [
                    "Z_TEST_SPACE"
                ]
            },
            target: {
                action: "openFLPPage",
                semanticObject: "Launchpad",
                shellHash: undefined
            }
        };

        // Act
        return this.oNavigationHelper._performNavigation(oDestinationTarget).then(() => {
            // Assert
            assert.ok(this.oNavigateStub.calledOnce, "The function calls 'navigate' of the Navigation service once.");
            assert.deepEqual(this.oNavigateStub.firstCall.args, [oExpectedIntent], "The function calls 'navigate' of the Navigation service with the right intent.");
            assert.ok(Extension.prototype.addNavigationSource.called, "The function adds a navigation source to the extension.");
            assert.ok(Extension.prototype.addNavigationSource.calledWith("siBa"), "The function adds the correct navigation source to the extension.");
        });
    });

    QUnit.test("Calls 'navigate' of Navigation service with shell hash", function (assert) {
        // Arrange
        const oDestinationTarget = {
            shellHash: "#Launchpad-open"
        };

        const oExpectedIntent = {
            params: {},
            target: {
                action: undefined,
                semanticObject: undefined,
                shellHash: "#Launchpad-open"
            }
        };

        // Act
        return this.oNavigationHelper._performNavigation(oDestinationTarget).then(() => {
            // Assert
            assert.ok(this.oNavigateStub.calledOnce, "The function calls 'navigate' of the Navigation service once.");
            assert.deepEqual(this.oNavigateStub.firstCall.args, [oExpectedIntent], "The function calls 'navigate' of the Navigation service with the right intent.");
        });
    });

    QUnit.module("The '_openURL' function", {
        beforeEach: function () {
            this.oOpenStub = sandbox.stub(WindowUtils, "openURL");
            this.oNavigationHelper = new NavigationHelper();
        },
        afterEach: function () {
            sandbox.restore();
            this.oNavigationHelper = null;
        }
    });

    QUnit.test("Opens the target URL in a new browser tab", function (assert) {
        // Act
        this.oNavigationHelper._openURL({
            url: "https://sap.com"
        });

        // Assert
        assert.ok(this.oOpenStub.calledOnce, "The function called 'openURL' of the WindowUtils service once.");
        assert.deepEqual(this.oOpenStub.firstCall.args, ["https://sap.com", "_blank"], "The function opened the URL https://sap.com in a new browser tab.");
    });

    QUnit.module("The 'navigate' function", {
        beforeEach: function () {
            // Stubs for private functions
            this._performNavigationStub = sandbox.stub(NavigationHelper.prototype, "_performNavigation");
            this._openURLStub = sandbox.stub(NavigationHelper.prototype, "_openURL");

            this.oNavigationHelper = new NavigationHelper();

            // Stubs getting external services
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync").resolves();
        },

        afterEach: function () {
            sandbox.restore();
            this.oNavigationHelper = null;
        }
    });

    QUnit.test("Calls _performNavigation when type is 'IBN'", async function (assert) {
        // Arrange
        // const done = assert.async();
        const oDestinationIntent = {
            type: "IBN",
            target: "someTarget"
        };

        // Act
        this.oNavigationHelper.navigate(oDestinationIntent);

        // Assert
        assert.ok(this._performNavigationStub.calledOnce, "_performNavigation called once");
        assert.ok(this._performNavigationStub.calledWith("someTarget"), "_performNavigation called with correct target");
        assert.ok(this._openURLStub.notCalled, "_openURL not called");
    });

    QUnit.test("Calls _openURL when type is 'URL'", function (assert) {
        // Arrange
        const oDestinationIntent = {
            type: "URL",
            target: "https://example.com"
        };
        // Act
        this.oNavigationHelper.navigate(oDestinationIntent);

        // Assert
        assert.ok(this._openURLStub.calledOnce, "_openURL called once");
        assert.ok(this._openURLStub.calledWith("https://example.com"), "_openURL called with correct URL");
        assert.ok(this._performNavigationStub.notCalled, "_performNavigation not called");
    });

    QUnit.test("Does not call _performNavigation or _openURL when type is unknown", function (assert) {
        // Arrange
        const oDestinationIntent = {
            type: "UNKNOWN",
            target: "unknownTarget"
        };

        // Act
        this.oNavigationHelper.navigate(oDestinationIntent);

        // Assert
        assert.ok(this._performNavigationStub.notCalled, "_performNavigation not called");
        assert.ok(this._openURLStub.notCalled, "_openURL not called");
    });
});
