// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.adapters.local.UserInfoAdapter
 */
sap.ui.define([
    "sap/ushell/adapters/local/UserInfoAdapter",
    "sap/base/Log",
    "sap/ushell/Container",
    "sap/ushell/services/PersonalizationV2"
], (
    UserInfoAdapter,
    Log,
    Container,
    PersonalizationV2
) => {
    "use strict";

    const { KeyCategory, WriteFrequency } = PersonalizationV2.prototype;

    /* global QUnit sinon */

    const sandbox = sinon.sandbox.create();

    const aExpectedDefaultThemeConfiguration = [
        { id: "sap_horizon", name: "SAP Morning Horizon" },
        { id: "sap_horizon_dark", name: "SAP Evening Horizon" },
        { id: "sap_horizon_hcb", name: "SAP High Contrast Black (SAP Horizon)" },
        { id: "sap_horizon_hcw", name: "SAP High Contrast White (SAP Horizon)" },
        { id: "sap_fiori_3", name: "SAP Quartz Light" },
        { id: "sap_fiori_3_dark", name: "SAP Quartz Dark" },
        { id: "sap_fiori_3_hcb", name: "SAP Quartz High Contrast Black" },
        { id: "sap_fiori_3_hcw", name: "SAP Quartz High Contrast White" },
        { id: "theme1_id", name: "Custom Theme" }
    ];
    function fnClone (oJson) {
        return JSON.parse(JSON.stringify(oJson));
    }

    QUnit.module("sap.ushell.adapters.local.UserInfoAdapter - getThemeList", {
        beforeEach: function (assert) {
            const done = assert.async();
            Container.init("local").then(done);
        }
    });

    [
        { testInput: {}, testDescription: "valid structure, emptyConfig" },
        { testInput: {}, testDescription: "no 'config' key provided" },
        { testInput: undefined, testDescription: "undefined config" }
    ].forEach((oTestCase) => {
        const sTestDescription = oTestCase.testDescription;

        QUnit.test(`getThemeList - returns default on ${sTestDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = new UserInfoAdapter(
                undefined, // unused parameter
                undefined, // unused parameter
                oTestCase.testInput
            );

            assert.expect(2);

            oAdapter.getThemeList()
                .done((oResultOptions) => {
                    assert.equal(Object.prototype.toString.apply(oResultOptions), "[object Object]",
                        `got an object back on ${sTestDescription}`);

                    assert.deepEqual(oResultOptions.options, aExpectedDefaultThemeConfiguration,
                        `got expected configuration on ${sTestDescription}`);
                    done();
                });
        });
    });

    [
        {
            testDescription: "valid configuration specified",
            testInput: {
                config: {
                    themes: [
                        { id: "theme_id_1", name: "theme name 1" },
                        { id: "theme_id_2", name: "theme name 2" },
                        { id: "theme_id_3", name: "theme name 3", root: "rootName" }
                    ]
                }
            }
        }
    ].forEach((oTestCase) => {
        const sTestDescription = oTestCase.testDescription;

        QUnit.test(`getThemeList - expected theme list on ${sTestDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = new UserInfoAdapter(
                undefined, // unused parameter
                undefined, // unused parameter
                oTestCase.testInput
            );

            assert.expect(2);

            oAdapter.getThemeList()
                .done((oResultOptions) => {
                    assert.equal(Object.prototype.toString.apply(oResultOptions), "[object Object]",
                        `got an object back on ${sTestDescription}`);

                    assert.deepEqual(oResultOptions.options, fnClone(oTestCase.testInput.config.themes),
                        `got specified list of themes on ${sTestDescription}`);
                    done();
                });
        });
    });

    QUnit.test("getThemeList - rejects on empty list of themes", function (assert) {
        const done = assert.async();
        const oAdapter = new UserInfoAdapter(
            undefined, // unused parameter
            undefined, // unused parameter
            {
                config: { // the input configuration
                    themes: []
                }
            }
        );

        assert.expect(2);

        oAdapter.getThemeList()
            .fail((oError) => {
                assert.ok(true, "getThemeList rejected");
                assert.ok(oError.message.match("no themes were configured"), "expected error message returned");
            })
            .always(done);
    });

    QUnit.module("sap.ushell.adapters.local.UserInfoAdapter - updateUserPreferences", {
        beforeEach: function (assert) {
            Container.init("local").then(assert.async());
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    [{
        testDescription: "theme and trackUsageAnalytics changes are udated",
        input: {
            changedProperties: [{
                name: "THEME",
                newValue: "newTheme",
                oldValue: "oldTheme",
                propertyName: "theme"
            }, {
                name: "TRACKING_USAGE_ANALYTICS",
                newValue: true,
                oldValue: false,
                propertyName: "trackUsageAnalytics"
            }]
        },
        expectedSetItemValueCalls: [
            ["theme", "newTheme"],
            ["trackUsageAnalytics", true]
        ],
        expectedSaveCalls: 1
    }].forEach((oFixture) => {
        QUnit.test(`updateUserPreferences is correct when: ${oFixture.testDescription}`, function (assert) {
            const oGetServiceOriginal = Container.getServiceAsync;
            const oAdapter = new UserInfoAdapter();
            const oSetItemValueStub = sandbox.stub().resolves();
            const done = assert.async();
            const oUser = {
                getChangedProperties: function () {
                    return oFixture.input.changedProperties;
                }
            };
            const oSaveStub = sandbox.stub().resolves();

            const oGetContainerStub = sandbox.stub().callsFake(() => {
                if (oFixture.input.getContainerError) {
                    return Promise.reject(new Error(oFixture.input.getContainerError));
                }
                return Promise.resolve({
                    setItemValue: oSetItemValueStub,
                    save: oSaveStub
                });
            });
            sandbox.stub(Container, "getServiceAsync").callsFake((sService) => {
                if (sService === "PersonalizationV2") {
                    return Promise.resolve({
                        getContainer: oGetContainerStub,
                        KeyCategory,
                        WriteFrequency
                    });
                }
                return oGetServiceOriginal;
            });

            oAdapter.updateUserPreferences(oUser)
                .done(() => {
                    assert.strictEqual(oGetContainerStub.callCount, 1,
                        "PersonalizationService.getContainer called once");
                    assert.deepEqual(oGetContainerStub.args[0][0], "sap.ushell.UserProfile",
                        "PersonalizationService.getContainer called with correct arguments");
                    assert.strictEqual(oSetItemValueStub.callCount, oFixture.expectedSetItemValueCalls.length,
                        "setItemValue called expected number of times");
                    assert.deepEqual(oSetItemValueStub.args, oFixture.expectedSetItemValueCalls,
                        "setItemValue called with correct arguments");
                    assert.strictEqual(oSaveStub.callCount, oFixture.expectedSaveCalls,
                        "save called expected number of times");
                    done();
                })
                .fail(() => {
                    assert.ok(false, "expected that promise was resolved");
                    done();
                });
        });
    });

    [{
        testDescription: "getContainer fails with Error",
        input: {
            getContainerError: "error message"
        },
        expectedErrorLogCall: ["Failed to update user preferences:", new Error("error message"), "com.sap.ushell.adapters.local.UserInfo"]
    }, {
        testDescription: "getContainer fails with message",
        input: { getContainerError: "error message" },
        expectedErrorLogCall: ["Failed to update user preferences:", new Error("error message"), "com.sap.ushell.adapters.local.UserInfo"]
    }, {
        testDescription: "save fails with Error",
        input: {
            saveError: "error message"
        },
        expectedErrorLogCall: ["Failed to update user preferences:", new Error("error message"), "com.sap.ushell.adapters.local.UserInfo"]
    }, {
        testDescription: "save fails with message",
        input: { saveError: "error message" },
        expectedErrorLogCall: ["Failed to update user preferences:", new Error("error message"), "com.sap.ushell.adapters.local.UserInfo"]
    }].forEach((oFixture) => {
        QUnit.test(`updateUserPreferences does correct error handling when: ${oFixture.testDescription}`, function (assert) {
            const oGetServiceOriginal = Container.getServiceAsync;
            const oAdapter = new UserInfoAdapter();
            const oSetItemValueStub = sandbox.stub().resolves();
            const done = assert.async();
            const oUser = {
                getChangedProperties: function () {
                    return oFixture.input.changedProperties;
                }
            };
            const oLogMock = sandbox.spy(Log, "error");
            const aExpectedArgs = oFixture.expectedErrorLogCall;

            const oSaveStub = sandbox.stub().callsFake(() => {
                if (oFixture.input.saveError) {
                    return Promise.reject(new Error(oFixture.input.saveError));
                }
                return Promise.resolve();
            });

            const oGetContainerStub = sandbox.stub().callsFake(() => {
                if (oFixture.input.getContainerError) {
                    return Promise.reject(new Error(oFixture.input.getContainerError));
                }
                return Promise.resolve({
                    setItemValue: oSetItemValueStub,
                    save: oSaveStub
                });
            });

            sandbox.stub(Container, "getServiceAsync").callsFake((sService) => {
                if (sService === "PersonalizationV2") {
                    return Promise.resolve({
                        getContainer: oGetContainerStub,
                        KeyCategory,
                        WriteFrequency
                    });
                }
                return oGetServiceOriginal;
            });

            oAdapter.updateUserPreferences(oUser)
                .done(() => {
                    assert.ok(false, "expected that promise was rejected");
                    done();
                })
                .fail(() => {
                    assert.ok(true, "expected that promise was rejected");
                    assert.equal(oLogMock.callCount, 1, "error logged once");
                    assert.deepEqual(oLogMock.getCalls()[0].args, aExpectedArgs, "error message as expected");
                    done();
                });
        });
    });
});
