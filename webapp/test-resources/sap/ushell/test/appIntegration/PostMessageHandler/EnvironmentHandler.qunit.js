// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.EnvironmentHandler
 */
sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/thirdparty/jquery",
    "sap/base/i18n/Formatting",
    "sap/base/i18n/Localization",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/test/utils",
    "sap/ushell/User"
], (
    coreLibrary,
    jQuery,
    Formatting,
    Localization,
    hasher,
    IframeApplicationContainer,
    PostMessageHandler,
    PostMessageManager,
    Container,
    PostMessageHelper,
    testUtils,
    User
) => {
    "use strict";

    // shortcut for sap.ui.core.routing.HistoryDirection
    const HistoryDirection = coreLibrary.routing.HistoryDirection;

    /* global sinon, QUnit */

    sinon.addBehavior("resolvesDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().resolve(...vValue).promise());
    });

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("Subscription", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication)
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.subscribe", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.subscribe",
            body: [{
                service: "some.defined.service",
                action: "actionName"
            }, {
                service: "some.defined.service2",
                action: "actionName2"
            }]
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.subscribe",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.ok(this.oCurrentApplication.supportsCapabilities(["some.defined.service.actionName"]), "The application supports the first service action");
        assert.ok(this.oCurrentApplication.supportsCapabilities(["some.defined.service2.actionName2"]), "The application supports the second service action");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.subscribe - Fails for missing array", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.subscribe",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.subscribe",
            status: "error",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        const sMessage = oReply.body.message;
        const sStack = oReply.body.stack;
        delete oReply.body.message; // Remove message for comparison
        delete oReply.body.stack; // Remove stack for comparison

        assert.ok(sMessage, "The reply contains an error message.");
        assert.ok(sStack, "The reply contains a stack trace.");
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });

    QUnit.module("HashChange", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

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

    QUnit.test("sap.ushell.appRuntime.hashChange - with direction", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "replaceHash").callsFake((newHash) => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "Blue box hash change trigger should be disabled");
        });
        this.ShellNavigationInternal.hashChanger = {
            getHash: sandbox.stub().returns("Action-toApp"),
            fireEvent: sandbox.stub()
        };
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.hashChange",
            body: {
                newHash: "Action-toApp",
                direction: HistoryDirection.Backwards
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.hashChange",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(hasher.replaceHash.getCall(0).args, [oMessage.body.newHash], "The hash should be replaced with the new hash from the message body.");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "Blue box hash change trigger should be re-enabled after the hash change.");

        const aExpectedEventArgs = [
            "hashReplaced",
            {
                hash: "Action-toApp",
                direction: HistoryDirection.Backwards
            }
        ];
        assert.deepEqual(this.ShellNavigationInternal.hashChanger.fireEvent.getCall(0).args, aExpectedEventArgs, "The hashReplaced event should be fired.");
    });

    QUnit.test("sap.ushell.appRuntime.hashChange - without direction", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "replaceHash").callsFake((newHash) => {
            assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, true, "Blue box hash change trigger should be disabled");
        });
        this.ShellNavigationInternal.hashChanger = {
            getHash: sandbox.stub().returns("Action-toApp"),
            fireEvent: sandbox.stub()
        };
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.hashChange",
            body: {
                newHash: "Action-toApp"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.hashChange",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(hasher.replaceHash.getCall(0).args, [oMessage.body.newHash], "The hash should be replaced with the new hash from the message body.");
        assert.strictEqual(hasher.disableBlueBoxHashChangeTrigger, false, "Blue box hash change trigger should be re-enabled after the hash change.");

        assert.deepEqual(this.ShellNavigationInternal.hashChanger.fireEvent.callCount, 0, "The hashReplaced event should not be fired");
    });

    QUnit.module("FLP Infos", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.UserInfo = {};
            Container.getServiceAsync.withArgs("UserInfo").resolves(this.UserInfo);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.ShellUIService.getFLPUrl", async function (assert) {
        // Arrange
        sandbox.stub(Container, "getFLPUrlAsync").resolves("https://flp.example.com#Application-manage");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.getFLPUrl",
            body: {
                bIncludeHash: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.getFLPUrl",
            status: "success",
            body: {
                result: "https://flp.example.com#Application-manage"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.getFLPUrlAsync.getCall(0).args, [true], "getFLPUrlAsync was called correctly");
    });

    QUnit.test("sap.ushell.services.Container.getFLPUrl", async function (assert) {
        // Arrange
        sandbox.stub(Container, "getFLPUrlAsync").resolves("https://flp.example.com#Application-manage");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.getFLPUrl",
            body: {
                bIncludeHash: true
            }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.getFLPUrl",
            status: "success",
            body: {
                result: "https://flp.example.com#Application-manage"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.getFLPUrlAsync.getCall(0).args, [true], "getFLPUrlAsync was called correctly");
    });

    QUnit.test("sap.ushell.services.Container.getFLPConfig", async function (assert) {
        // Arrange
        sandbox.stub(Container, "getFLPConfig").resolves({
            URL: "https://flp.example.com",
            scopeId: "flpScopeId"
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.getFLPConfig",
            body: {}
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.getFLPConfig",
            status: "success",
            body: {
                result: {
                    URL: "https://flp.example.com",
                    scopeId: "flpScopeId"
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.getFLPConfig.getCall(0).args, [], "getFLPConfig was called correctly");
    });

    QUnit.test("sap.ushell.services.Container.getFLPPlatform", async function (assert) {
        // Arrange
        sandbox.stub(Container, "getFLPPlatform").returns("abap");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.getFLPPlatform",
            body: {}
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.getFLPPlatform",
            status: "success",
            body: {
                result: "abap"
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.getFLPPlatform.getCall(0).args, [], "getFLPPlatform was called correctly");
    });

    QUnit.test("sap.ushell.services.UserInfo.getThemeList", async function (assert) {
        // Arrange
        this.UserInfo.getThemeList = sandbox.stub().resolvesDeferred({
            options: [{ id: "sap_horizon", name: "SAP Morning Horizon" }]
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.getThemeList",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.getThemeList",
            body: {
                result: {
                    options: [{ id: "sap_horizon", name: "SAP Morning Horizon" }]
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.UserInfo.getThemeList.getCall(0).args, [], "getThemeList was called correctly");
    });

    QUnit.test("sap.ushell.services.UserInfo.getShellUserInfo", async function (assert) {
        // Arrange
        this.UserInfo.getShellUserInfo = sandbox.stub().resolves({
            id: "CB0123",
            email: "test@test.test",
            firstName: "Foo",
            lastName: "Bar",
            fullName: "Foo Bar"
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.getShellUserInfo",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.getShellUserInfo",
            body: {
                result: {
                    id: "CB0123",
                    email: "test@test.test",
                    firstName: "Foo",
                    lastName: "Bar",
                    fullName: "Foo Bar"
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.UserInfo.getShellUserInfo.getCall(0).args, [], "getShellUserInfo was called correctly");
    });

    QUnit.test("sap.ushell.services.UserInfo.getLanguageList", async function (assert) {
        // Arrange
        this.UserInfo.getLanguageList = sandbox.stub().resolvesDeferred([{
            text: "English",
            key: "en"
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.getLanguageList",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.getLanguageList",
            body: {
                result: [{
                    text: "English",
                    key: "en"
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.UserInfo.getLanguageList.getCall(0).args, [], "getLanguageList was called correctly");
    });

    QUnit.test("sap.ushell.services.UserInfo.getLocaleData", async function (assert) {
        // Arrange
        sandbox.stub(Formatting, "getCalendarType").returns("Gregorian");
        sandbox.stub(Formatting, "getCustomIslamicCalendarData").returns("Mapping");
        sandbox.stub(Localization, "getTimezone").returns("Europe/Berlin");
        sandbox.stub(Formatting, "getCustomCurrencies").returns("Currency");

        sandbox.stub(Formatting, "getDatePattern");
        Formatting.getDatePattern.withArgs("short").returns("DD/MM/YY");
        Formatting.getDatePattern.withArgs("medium").returns("DD/MM/YYYY");

        sandbox.stub(Formatting, "getNumberSymbol");
        Formatting.getNumberSymbol.withArgs("group").returns("G");
        Formatting.getNumberSymbol.withArgs("decimal").returns("D");

        sandbox.stub(Formatting, "getTimePattern");
        Formatting.getTimePattern.withArgs("short").returns("HH/MM");
        Formatting.getTimePattern.withArgs("medium").returns("HH/MM/SS");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.getLocaleData",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.getLocaleData",
            body: {
                result: {
                    calendarMapping: "Mapping",
                    calendarType: "Gregorian",
                    currencyFormats: "Currency",
                    dateFormatMedium: "DD/MM/YYYY",
                    dateFormatShort: "DD/MM/YY",
                    numberFormatDecimal: "D",
                    numberFormatGroup: "G",
                    timeFormatMedium: "HH/MM/SS",
                    timeFormatShort: "HH/MM",
                    timeZone: "Europe/Berlin"
                }
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.module("Hotkeys", {
        beforeEach: async function () {
            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.ShellUIService.processHotKey", async function (assert) {
        // Arrange
        sandbox.stub(document, "dispatchEvent");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.processHotKey",
            body: {
                altKey: true,
                ctrlKey: true,
                shiftKey: true,
                key: "p",
                keyCode: 80
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.processHotKey",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        const oEvent = document.dispatchEvent.getCall(0).args[0];

        assert.ok(oEvent instanceof KeyboardEvent, "The event is a KeyboardEvent.");
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(oEvent.altKey, true, "The event has the expected altKey value.");
        assert.strictEqual(oEvent.ctrlKey, true, "The event has the expected ctrlKey value.");
        assert.strictEqual(oEvent.shiftKey, true, "The event has the expected shiftKey value.");
        assert.strictEqual(oEvent.key, "p", "The event has the expected key value.");
        assert.strictEqual(oEvent.keyCode, 80, "The event has the expected keyCode value.");
    });

    QUnit.module("ShellUIBlocker", {
        beforeEach: async function () {
            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.ShellUIService.showShellUIBlocker", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.showShellUIBlocker",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.showShellUIBlocker",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });

    QUnit.module("UserInfo", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.UserInfo = {};
            Container.getServiceAsync.withArgs("UserInfo").resolves(this.UserInfo);

            this.oUser = new User();
            sandbox.stub(Container, "getUser").returns(this.oUser);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.UserInfo.updateUserPreferences", async function (assert) {
        // Arrange
        sandbox.stub(this.oUser, "setLanguage");
        sandbox.stub(this.oUser, "resetChangedProperty");
        this.UserInfo.updateUserPreferences = sandbox.stub().resolvesDeferred();

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.updateUserPreferences",
            body: {
                language: "en"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.updateUserPreferences",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.oUser.setLanguage.getCall(0).args, [oMessage.body.language], "setLanguage was called correctly");
        assert.deepEqual(this.UserInfo.updateUserPreferences.getCall(0).args, [], "updateUserPreferences was called correctly");
        assert.deepEqual(this.oUser.resetChangedProperty.getCall(0).args, ["language"], "resetChangedProperty was called correctly");
    });

    QUnit.test("sap.ushell.services.UserInfo.updateUserPreferences - ignores call without language", async function (assert) {
        // Arrange
        sandbox.stub(this.oUser, "setLanguage");
        sandbox.stub(this.oUser, "resetChangedProperty");
        this.UserInfo.updateUserPreferences = sandbox.stub().resolvesDeferred();

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.updateUserPreferences",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.updateUserPreferences",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.oUser.setLanguage.callCount, 0, "setLanguage was not called");
        assert.deepEqual(this.UserInfo.updateUserPreferences.callCount, 0, "updateUserPreferences was not called");
        assert.deepEqual(this.oUser.resetChangedProperty.callCount, 0, "resetChangedProperty was not called");
    });

    QUnit.module("UITracer", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync").resolves();

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.UITracer.trace", async function (assert) {
        // Arrange
        const pEvent = testUtils.waitForEventHubEvent("UITracer.trace");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UITracer.trace",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UITracer.trace",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        await pEvent;

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(true, "Event 'UITracer.trace' was sent");
        assert.strictEqual(Container.getServiceAsync.withArgs("UITracer").callCount, 1, "UITracer was required");
    });

    QUnit.module("Misc", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.SearchableContent = {};
            Container.getServiceAsync.withArgs("SearchableContent").resolves(this.SearchableContent);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.UserInfo.openThemeManager", async function (assert) {
        // Arrange
        const pEvent = testUtils.waitForEventHubEvent("openThemeManager");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.UserInfo.openThemeManager",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.UserInfo.openThemeManager",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);
        await pEvent;

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.ok(true, "Event 'openThemeManager' was emitted");
    });

    QUnit.test("sap.ushell.services.SearchableContent.getApps", async function (assert) {
        // Arrange
        this.SearchableContent.getApps = sandbox.stub().resolves([{
            id: "app1",
            title: "App 1"
        }]);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.SearchableContent.getApps",
            body: {
                oOptions: {
                    includeAppsWithoutVisualizations: true,
                    enableVisualizationPreview: false
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.SearchableContent.getApps",
            body: {
                result: [{
                    id: "app1",
                    title: "App 1"
                }]
            }
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.SearchableContent.getApps.getCall(0).args, [oMessage.body.oOptions], "getApps was called correctly");
    });

    QUnit.module("secondTitle", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.Extension = {};
            Container.getServiceAsync.withArgs("Extension").resolves(this.Extension);

            PostMessageManager.init();
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("sap.ushell.services.Renderer.setHeaderTitle", async function (assert) {
        // Arrange
        this.Extension.setSecondTitle = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.setHeaderTitle",
            body: {
                sTitle: "[Second Title]"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.setHeaderTitle",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Extension.setSecondTitle.getCall(0).args, [oMessage.body.sTitle], "setSecondTitle was called correctly");
    });

    QUnit.test("sap.ushell.services.Extension.setSecondTitle", async function (assert) {
        // Arrange
        this.Extension.setSecondTitle = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.setSecondTitle",
            body: {
                title: "my new second title"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.setSecondTitle",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.Extension.setSecondTitle.getCall(0).args, [oMessage.body.title], "setSecondTitle was called correctly");
    });
});
