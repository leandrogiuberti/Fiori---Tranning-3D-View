// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap/ushell/bootstrap/common/common.boot.ui5.js
 */

sap.ui.define([
    "sap/ushell/bootstrap/common/common.configure.ui5",
    "sap/base/Log",
    "sap/base/i18n/date/CalendarWeekNumbering",
    "sap/ushell/Container"
], (
    fnConfigureUI5,
    Log,
    CalendarWeekNumbering,
    Container
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.bootstrap.common.common.configure.ui5", {
        beforeEach: function () { },
        afterEach: function () {
            window["sap-ui-config"] = {};
            sandbox.restore();
        }
    });

    QUnit.test("should fail when no or inclomeplete settings object provided", function (assert) {
        // Arrange
        const oErrorLogStub = sandbox.stub(Log, "error");

        // Act
        const oResult = fnConfigureUI5();

        // Assert
        assert.equal(oErrorLogStub.callCount, 1, "error log written");
        assert.ok(!oResult.hasOwnProperty("libs"), "empty config returned");
    });

    QUnit.test("should fail when no settings.libs is provided", function (assert) {
        // Arrange
        const oErrorLogStub = sandbox.stub(Log, "error");

        // Act
        const oResult = fnConfigureUI5({ foo: "bar" });

        // Assert
        assert.equal(oErrorLogStub.callCount, 1, "error log written");
        assert.ok(!oResult.hasOwnProperty("libs"), "empty config returned");
    });

    [{
        testDescription: "libs are provided in a correct way",
        oSettings: {
            libs: ["foo", "bar"]
        },
        sConfigKeyToTest: "libs",
        sResult: "foo,bar"
    }, {
        testDescription: "theme is provided via settings",
        oSettings: {
            theme: "fooTheme",
            libs: []
        },
        sConfigKeyToTest: "theme",
        sResult: "fooTheme"
    }, {
        testDescription: "theme is provided via settings",
        oSettings: {
            theme: "fooTheme",
            libs: []
        },
        sConfigKeyToTest: "theme",
        sResult: "fooTheme"
    }].forEach((oFixture) => {
        QUnit.test(`should write the correct config for UI5 when ${oFixture.testDescription}`, function (assert) {
            // Arrange

            // Act
            const oResult = fnConfigureUI5(oFixture.oSettings);

            // Assert
            assert.equal(oResult[oFixture.sConfigKeyToTest], oFixture.sResult, "libs are returned in a correct way");
        });
    });

    QUnit.test("should write the correct defaults for valid config object", function (assert) {
        // Arrange

        // Act
        const oResult = fnConfigureUI5({
            libs: ["foo"]
        });

        // Assert
        assert.equal(oResult.preload, "async", "preload defaults to 'async'");
        assert.equal(oResult.compatversion, "edge", "compatversion defaults to 'edge'");
    });

    QUnit.test("should register the module paths if it is defined in the ushell config", function (assert) {
        // Arrange
        const oConfigStub = sandbox.spy(sap.ui.loader, "config");
        const oExpectedCall = {
            paths: {
                "a/b/c": "/path/a/b/c",
                "x/y/z": "/some/path/x/y/z"
            }
        };
        // Act
        fnConfigureUI5({
            libs: ["foo"],
            ushellConfig: {
                modulePaths: {
                    "a.b.c": "/path/a/b/c",
                    "x.y.z": "/some/path/x/y/z"
                }
            }
        });

        // Assert
        assert.equal(oConfigStub.callCount, 1, "sap.ui.loader.config was called");
        assert.deepEqual(oConfigStub.getCall(0).args, [oExpectedCall]);
    });

    QUnit.test("should execute UI5's onInit before FLP bootstrap is running", function (assert) {
        // Arrange
        const done = assert.async();
        const originalRequire = sap.ui.require;
        const sapUiRequireStub = sinon.stub(sap.ui, "require").callsFake((module, callback) => {
            if (Array.isArray(module) && module[0] === "sap/test") {
                return undefined;
            }
            return originalRequire(module, callback);
        });
        window["sap-ui-config"].oninit = "module:sap/test";
        const sapUshellContainerInitStub = sinon.stub(Container, "init").callsFake((platform) => {
            // Assert
            assert.deepEqual(sapUiRequireStub.getCalls()[0].args[0], ["sap/test"], "oninit module has been required");
            assert.ok("Container.init() triggered");
            sapUiRequireStub.restore();
            sapUshellContainerInitStub.restore();
            done();
            return { then: function () { return { then: function () { } }; } };
        });

        // Act
        const calculatedConfig = fnConfigureUI5({
            platform: "cdm",
            libs: ["foo"]
        });
        calculatedConfig.oninit();
    });

    QUnit.test("should not execute FLP's default init callback when oSettings.onInitCallback is given", function (assert) {
        // Arrange
        const done = assert.async();
        const sapUshellContainerInitStub = sinon.stub(Container, "init").callsFake(() => {
            return Promise.resolve();
        });
        function fnInitCallback () {
            // Assert
            assert.ok("Settings.onInitCallback function has been called instead default FLP callback");
            sapUshellContainerInitStub.restore();
            done();
        }

        // Act
        const calculatedConfig = fnConfigureUI5({
            libs: ["foo"],
            onInitCallback: fnInitCallback
        });
        calculatedConfig.oninit();
    });

    QUnit.test("should fail when no activeTerminologies are set in sap-ui-config", function (assert) {
        // Arrange
        const activeTerminologies = ["sports", "travel", "games"];
        const ushellConfig = {
            libs: ["foo"],
            ushellConfig: {
                ushell: {
                    verticalization: {
                        activeTerminologies: activeTerminologies
                    }
                }
            }
        };

        // Act
        const oResult = fnConfigureUI5(ushellConfig);

        // Assert
        assert.strictEqual(oResult.activeterminologies, activeTerminologies, "activeTerminologies are set and available");
    });

    QUnit.test("should fail when activeTerminologies are set in sap-ui-config when no activeTerminologies were provided", function (assert) {
        // Arrange
        const ushellConfig = {
            libs: ["foo"],
            ushellConfig: {
                ushell: {
                    verticalization: {
                        activeTerminologies: []
                    }
                }
            }
        };

        // Act
        const oResult = fnConfigureUI5(ushellConfig);

        // Assert
        assert.ok(!oResult.hasOwnProperty("activeterminologies"), "activeTerminologies were not set because array was empty");
    });

    QUnit.test("should set the personalized calendar week numbering", function (assert) {
        // Arrange
        const ushellConfig = {ushellConfig: {services: {Container: {adapter: {config: {calendarWeekNumbering: CalendarWeekNumbering.ISO_8601 }}}}}};
        ushellConfig.libs = ["foo"];
        // Act
        const oResult = fnConfigureUI5(ushellConfig);
        // Assert
        assert.ok(oResult.hasOwnProperty("calendarWeekNumbering"), "Numbering set correctly");
        assert.ok(oResult?.calendarWeekNumbering, CalendarWeekNumbering.ISO_8601, "Numbering set correctly");
    });

    QUnit.test("should set the personalized calendar week numbering to Default if not set", function (assert) {
        // Arrange
        const ushellConfig = {libs: ["foo"]};
        // Act
        const oResult = fnConfigureUI5(ushellConfig);
        // Assert
        assert.ok(oResult.hasOwnProperty("calendarWeekNumbering"), "Numbering set correctly");
        assert.equal(oResult?.calendarWeekNumbering, CalendarWeekNumbering.Default, "Numbering set correctly do Default");
    });
});
