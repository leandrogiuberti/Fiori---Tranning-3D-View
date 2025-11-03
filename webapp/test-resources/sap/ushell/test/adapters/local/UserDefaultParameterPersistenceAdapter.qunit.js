// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.adapters.local.UserDefaultParameterPersistenceAdapter
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/adapters/local/UserDefaultParameterPersistenceAdapter",
    "sap/ushell/Container",
    "sap/ushell/services/PersonalizationV2"
], (
    Log,
    UserDefaultParameterPersistenceAdapter,
    Container,
    PersonalizationV2
) => {
    "use strict";

    const { KeyCategory, WriteFrequency } = PersonalizationV2.prototype;

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.adapters.local.UserDefaultParameterPersistenceAdapter", {
        // This method is called after each test. Add every restoration code here.
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("ctor signature", function (assert) {
        const oAdapter = new UserDefaultParameterPersistenceAdapter();
        assert.strictEqual(typeof oAdapter, "object", "The adapter is of type object");
        assert.strictEqual(typeof oAdapter.saveParameterValue, "function", "Function saveParameterValue is present");
        assert.strictEqual(typeof oAdapter.loadParameterValue, "function", "Function loadParameterValue is present");
    });

    QUnit.test("Integration: saveParameterValue calls the right functions", function (assert) {
        // Arrange
        const oAdapter = new UserDefaultParameterPersistenceAdapter();
        const oSetItemValueStub = sandbox.stub();
        const oSaveStub = sandbox.stub().resolves();
        const oMockContainer = {
            save: oSaveStub,
            setItemValue: oSetItemValueStub
        };

        const oGetContainerStub = sandbox.stub().resolves(oMockContainer);

        const oMockService = {
            getContainer: oGetContainerStub,
            KeyCategory,
            WriteFrequency
        };

        oAdapter._getPersonalizationService = sandbox.stub().returns(Promise.resolve(oMockService));

        const oSystemContextMock = { id: "mySystemContext" };
        // Act
        return oAdapter.saveParameterValue("AKEY", { value: "abc" }, oSystemContextMock)
            .done(() => {
                // Assert
                assert.strictEqual(oGetContainerStub.callCount, 1, "getContainer was called exactly once");
                assert.deepEqual(oGetContainerStub.getCall(0).args, ["sap.ushell.UserDefaultParameter.mySystemContext", {
                    keyCategory: "FIXED_KEY",
                    writeFrequency: "LOW",
                    clientStorageAllowed: true
                }], "getContainer called with proper args");

                assert.deepEqual(oSetItemValueStub.getCall(0).args, ["AKEY", {
                    value: "abc"
                }], "container.setItemValue called with proper args");
                assert.strictEqual(oSaveStub.callCount, 1, "save was called exactly once");
            })
            .fail(() => {
                assert.ok(false, "should succeed");
            });
    });

    [
        { testName: "too long", paramName: "AKEYwhichIsWayToLongToBeLegalAndThusErrorLog", ok: false },
        { testName: "spaces", paramName: "Are you trying", ok: false },
        { testName: "special chars", paramName: "to&$AX", ok: false },
        { testName: "empty string", paramName: "", ok: false },
        { testName: "special chars 2", paramName: "break_the_%&%_system", ok: false },
        { testName: "special chars ok", paramName: "stick-to_legal_Params.1234", ok: true }
    ].forEach((oFixture) => {
        QUnit.test(`saveParameterValue illegal key raises log : ${oFixture.testName}`, function (assert) {
            // Arrange
            const sParameterName = oFixture.paramName;
            const oAdapter = new UserDefaultParameterPersistenceAdapter();

            const oSetItemValueStub = sandbox.stub();
            const oSaveStub = sandbox.stub().resolves();

            const oMockContainer = {
                save: oSaveStub,
                setItemValue: oSetItemValueStub
            };

            const oGetContainerStub = sandbox.stub().resolves(oMockContainer);

            const oMockService = {
                getContainer: oGetContainerStub,
                KeyCategory,
                WriteFrequency
            };

            oAdapter._getPersonalizationService = sandbox.stub().returns(Promise.resolve(oMockService));

            sandbox.spy(Log, "error");
            const oSystemContextMock = { id: "mySystemContext" };
            // Act
            return oAdapter.saveParameterValue(sParameterName, { value: "abc" }, oSystemContextMock)
                .done(() => {
                    // Assert
                    assert.deepEqual(
                        Log.error.getCall(0).args,
                        ([`Illegal Parameter Key, less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`]),
                        "called error with the right params"
                    );
                    assert.strictEqual(oGetContainerStub.callCount, 1, "getContainer called exactly once");
                    assert.deepEqual(oGetContainerStub.getCall(0).args, ["sap.ushell.UserDefaultParameter.mySystemContext", {
                        keyCategory: "FIXED_KEY",
                        writeFrequency: "LOW",
                        clientStorageAllowed: true
                    }], "getContainer called with proper args");

                    assert.deepEqual(oSetItemValueStub.getCall(0).args, [sParameterName, {
                        value: "abc"
                    }], "container.setItemValue called with proper args");
                    assert.strictEqual(oSaveStub.callCount, 1, "save was called exactly once");
                    sandbox.restore();
                })
                .fail(() => {
                    assert.ok(false, "should succeed");
                });
        });
    });

    QUnit.test("Integration: loadParameterValue calls the right functions", function (assert) {
        // Arrange
        const oAdapter = new UserDefaultParameterPersistenceAdapter();

        const oSetItemValueStub = sandbox.stub();
        const oSaveStub = sandbox.stub().resolves();
        const oGetItemValueStub = sandbox.stub().returns({ value: 123 });

        const oMockContainer = {
            save: oSaveStub,
            setItemValue: oSetItemValueStub,
            getItemValue: oGetItemValueStub
        };

        const oGetContainerStub = sandbox.stub().resolves(oMockContainer);

        const oMockService = {
            getContainer: oGetContainerStub,
            KeyCategory,
            WriteFrequency
        };

        oAdapter._getPersonalizationService = sandbox.stub().returns(Promise.resolve(oMockService));
        const oSystemContextMock = { id: "mySystemContext" };

        // Act
        return oAdapter.loadParameterValue("AKEY", oSystemContextMock)
            .done(() => {
                // Assert
                assert.strictEqual(oGetContainerStub.callCount, 1, "getContainer called exactly once");
                assert.deepEqual(oGetContainerStub.getCall(0).args, ["sap.ushell.UserDefaultParameter.mySystemContext", {
                    keyCategory: "FIXED_KEY",
                    writeFrequency: "LOW",
                    clientStorageAllowed: true
                }], "getContainer called with proper args");

                assert.deepEqual(oGetItemValueStub.getCall(0).args, ["AKEY"], "container.getItemValue called with proper args");
                assert.strictEqual(oSetItemValueStub.callCount, 0, "setItemValue was not called");
            })
            .fail(() => {
                assert.ok(false, "should succeed");
            });
    });

    QUnit.test("Integration: loadParameterValue fails if getItemValue returns undefined", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oAdapter = new UserDefaultParameterPersistenceAdapter();

        const oSetItemValueStub = sandbox.stub();
        const oSaveStub = sandbox.stub().resolves();
        const oGetItemValueStub = sandbox.stub().returns(undefined);

        const oMockContainer = {
            save: oSaveStub,
            setItemValue: oSetItemValueStub,
            getItemValue: oGetItemValueStub
        };

        const oGetContainerStub = sandbox.stub().resolves(oMockContainer);

        const oMockService = {
            getContainer: oGetContainerStub,
            KeyCategory,
            WriteFrequency
        };

        oAdapter._getPersonalizationService = sandbox.stub().returns(Promise.resolve(oMockService));
        const oSystemContextMock = { id: "mySystemContext" };

        // Act
        oAdapter.loadParameterValue("AKEY", oSystemContextMock)
            .done(() => {
                // Assert
                assert.ok(false, " should not succeed");
                fnDone();
            })
            .fail(() => {
                assert.ok(true, "should fail");
                fnDone();
            });
    });

    QUnit.test("Integration: deleteParameter calls the right functions", function (assert) {
        // Arrange
        const oAdapter = new UserDefaultParameterPersistenceAdapter();

        const oSetItemValueStub = sandbox.stub();
        const oSaveStub = sandbox.stub().resolves();
        const oDeleteItemStub = sandbox.stub().returns(undefined);

        const oMockContainer = {
            save: oSaveStub,
            setItemValue: oSetItemValueStub,
            deleteItem: oDeleteItemStub
        };

        const oGetContainerStub = sandbox.stub().resolves(oMockContainer);

        const oMockService = {
            getContainer: oGetContainerStub,
            KeyCategory,
            WriteFrequency
        };

        oAdapter._getPersonalizationService = sandbox.stub().returns(Promise.resolve(oMockService));
        const oSystemContextMock = { id: "mySystemContext" };
        // Act
        return oAdapter.deleteParameter("AKEY", oSystemContextMock)
            .done(() => {
                // Assert
                assert.strictEqual(oDeleteItemStub.callCount, 1, "deleteItem called exactly once");
                assert.deepEqual(oDeleteItemStub.getCall(0).args, ["AKEY"], "deleteItem was called with the correct args");
                assert.strictEqual(oSaveStub.callCount, 1, "save called exactly once");
            })
            .fail(() => {
                assert.ok(false, "should succeed");
            });
    });

    QUnit.test("Integration: getStoredParameterNames calls the right functions", function (assert) {
        // Arrange
        const oAdapter = new UserDefaultParameterPersistenceAdapter();

        const oSetItemValueStub = sandbox.stub();
        const oSaveStub = sandbox.stub().resolves();
        const oGetItemKeysStub = sandbox.stub().returns(["AAA", "BBB"]);

        const oMockContainer = {
            setItemValue: oSetItemValueStub,
            save: oSaveStub,
            getItemKeys: oGetItemKeysStub
        };

        const oGetContainerStub = sandbox.stub().resolves(oMockContainer);

        const oMockService = {
            getContainer: oGetContainerStub,
            KeyCategory,
            WriteFrequency
        };

        const oSystemContextMock = { id: "mySystemContext" };

        oAdapter._getPersonalizationService = sandbox.stub().returns(Promise.resolve(oMockService));
        // Act
        return oAdapter.getStoredParameterNames(oSystemContextMock)
            .done((a) => {
                // Assert
                assert.deepEqual(a, ["AAA", "BBB"], "The right values were returned");
            })
            .fail(() => {
                assert.ok(false, "should not fail");
            });
    });
});
