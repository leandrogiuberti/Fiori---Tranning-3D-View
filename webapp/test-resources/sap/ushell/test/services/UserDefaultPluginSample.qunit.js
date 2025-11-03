// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * This unit test is only to test the correctness of the interface contracts and not to verify
 * the functional correctness of the implementation of the sample plugin.
 */
sap.ui.define([
    "sap/ui/core/Component",
    "sap/ushell/Container",
    "sap/ushell/Config",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/base/util/deepClone",
    "sap/ui/thirdparty/jquery"
], (
    Component,
    Container,
    Config,
    ODataModel,
    deepClone,
    jQuery
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.demo.UserDefaultPluginSample - general", {
        beforeEach: function (assert) {
            const done = assert.async();

            this.oSystemContext = {
                id: ""
            };

            this.oContainerStubs = {
                registerPlugin: sandbox.stub(),
                attachValueStored: sandbox.stub()
            };

            Config.emit("/core/darkMode/enabled", false); // Disable dark mode support
            Container.init("local")
                .then(() => {
                    sandbox.stub(Container, "getServiceAsync")
                        .withArgs("UserDefaultParameters")
                        .resolves({
                            registerPlugin: this.oContainerStubs.registerPlugin,
                            attachValueStored: this.oContainerStubs.attachValueStored
                        });

                    Component.create({
                        name: "sap.ushell.demo.UserDefaultPluginSample",
                        componentData: {
                            config: {}
                        }
                    }).then((oComponent) => {
                        this.oContainerStubs.registerPlugin.reset();
                        this.oContainerStubs.attachValueStored.reset();
                        this.oPlugin = oComponent;
                        this.oSetupKnownParametersConstantStub = sandbox.stub(this.oPlugin, "_setupKnownParametersConstant");
                        done();
                    });
                });
        },
        afterEach: function () {
            this.oPlugin.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("starts in backend mode by default", function (assert) {
        // Act
        this.oPlugin.init();

        // Assert
        return this.oPlugin.oInitPromise.then(() => {
            assert.strictEqual(this.oPlugin.bLocalMode, false, "LocalMode was disabled");
            assert.strictEqual(this.oSetupKnownParametersConstantStub.callCount, 1, "The known parameters were declared and stored in a constant");
            assert.strictEqual(this.oContainerStubs.registerPlugin.callCount, 1, "Plugin was registered");
            assert.strictEqual(this.oContainerStubs.attachValueStored.callCount, 1, "A handler was attached to the ValueStored event of the UserDefaultParametersService");
        });
    });

    QUnit.test("starts in backend mode when the corresponding configuration was set", function (assert) {
        // Arrange
        this.oPlugin.oComponentData.config.localMode = "false";

        // Act
        this.oPlugin.init();

        // Assert
        return this.oPlugin.oInitPromise.then(() => {
            assert.strictEqual(this.oPlugin.bLocalMode, false, "LocalMode was disabled");
            assert.strictEqual(this.oContainerStubs.registerPlugin.callCount, 1, "Plugin was registered");
            assert.strictEqual(this.oSetupKnownParametersConstantStub.callCount, 1, "The known parameters were declared and stored in a constant");
            assert.strictEqual(this.oContainerStubs.attachValueStored.callCount, 1, "A handler was attached to the ValueStored event of the UserDefaultParametersService");
        });
    });

    QUnit.test("starts in local mode when the corresponding configuration was set", function (assert) {
        // Arrange
        const done = assert.async();
        const oSetupTestDataStub = sandbox.stub(this.oPlugin, "_setupTestData");
        this.oPlugin.oComponentData.config.localMode = "true";

        // Act
        this.oPlugin.init();

        // Assert
        return this.oPlugin.oInitPromise.then(() => {
            assert.strictEqual(this.oPlugin.bLocalMode, true, "LocalMode was disabled");
            assert.strictEqual(this.oContainerStubs.registerPlugin.callCount, 1, "Plugin was registered");
            assert.strictEqual(oSetupTestDataStub.callCount, 1, "Test data was initialized");
            done();
        });
    });

    QUnit.module("sap.ushell.demo.UserDefaultPluginSample - localMode", {
        beforeEach: function (assert) {
            const done = assert.async();

            this.oSystemContext = {
                id: "" // empty string is the id of the local and acts as an default here
            };

            Container.init("local")
                .then(() => {
                    Component.create({
                        name: "sap.ushell.demo.UserDefaultPluginSample",
                        componentData: {
                            config: {
                                localMode: "true"
                            }
                        }
                    }).then((oComponent) => {
                        this.oPlugin = oComponent;
                        done();
                    });
                });
        },
        afterEach: function () {
            this.oPlugin.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("getUserDefault: read value UshellTest1 with undefined oCurrentParameter set", function (assert) {
        const done = assert.async();

        this.oPlugin.getUserDefault("UshellTest1", { value: undefined }, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, { value: "InitialFromPlugin" }, "correct value returned");
            })
            .fail(() => {
                assert.ok(false, "Promise was supposed to succeed!");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: read value UshellTest1 with defined oCurrentParameter set", function (assert) {
        const done = assert.async();

        this.oPlugin.getUserDefault("UshellTest1", { value: "set" }, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, {
                    value: "set"
                }, "correct value returned");
            })
            .fail(() => {
                assert.ok(false, "Promise was supposed to succeed!");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: read value UshellSamplePlant without oCurrentParameter set", function (assert) {
        const done = assert.async();

        this.oPlugin.getUserDefault("UshellSamplePlant", { value: undefined }, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, {
                    value: "Plant1000",
                    noStore: true,
                    noEdit: true
                }, "correct value returned");
            })
            .fail(() => {
                assert.ok(false, "Promise was supposed to succeed!");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: read value Plant with oCurrentParameter set", function (assert) {
        const done = assert.async();

        this.oPlugin.getUserDefault("UshellSamplePlant", { value: "AAA" }, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, {
                    value: "AAA"
                }, "Object has been altered correctly!");
            })
            .fail(() => {
                assert.ok(false, "Promise was supposed to succeed!");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: read value not_a_value", function (assert) {
        const done = assert.async();

        this.oPlugin.getUserDefault("not_a_value", undefined, this.oSystemContext)
            .done((sUserDefaultValue) => {
                assert.equal(sUserDefaultValue, undefined, "correct arg");
                assert.ok(true, "Promise was supposed to be ok");
            })
            .fail(() => {
                assert.ok(false, "Promise failed!");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: value multiple times without waiting - plugin mustn't retrieve data more than once", function (assert) {
        // Arrange
        const done = assert.async();
        const oRetrieveUserDefaultsSpy = sandbox.spy(this.oPlugin, "_retrieveUserDefaults");

        // Act
        const oFirstPromise = this.oPlugin.getUserDefault("UshellTest1", undefined, this.oSystemContext);
        const oSecondPromise = this.oPlugin.getUserDefault("UshellSampleCompanyCode", undefined, this.oSystemContext);

        // Assert
        jQuery.when(oFirstPromise, oSecondPromise)
            .done((oFirstParameter, oSecondParameter) => {
                assert.deepEqual(oFirstParameter, { value: "InitialFromPlugin" }, "correct value returned");
                assert.deepEqual(oSecondParameter, { value: "0815" }, "correct value returned");
                assert.strictEqual(oRetrieveUserDefaultsSpy.getCalls().length, 1, "The function retrieveUserDefault was called exactly once.");
            })
            .always(done);
    });

    QUnit.test("getEditorMetadata: read value UshellTest1 with undefined oCurrentParameter set", function (assert) {
        const done = assert.async();
        const oMetadata = {
            UshellTest1: {},
            UshellSamplePlant: {
                editorMetadata: {
                    lost: "inTranslation"
                }
            },
            NotKnownByPlugin: {},
            NotKnownFilled: {
                editorMetaData: { displayText: "AAA" }
            }
        };

        this.oPlugin.getEditorMetadata(oMetadata, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, {
                    NotKnownFilled: {
                        editorMetaData: {
                            displayText: "AAA"
                        }
                    },
                    NotKnownByPlugin: {},
                    UshellSamplePlant: {
                        editorMetadata: {
                            description: "This is the plant code",
                            displayText: "Plant",
                            editorInfo: {
                                entityName: "Defaultparameter",
                                bindingPath: "/Defaultparameters('MM')",
                                odataURL: "/sap/opu/odata/sap/ZMM_USER_DEFAULTPARAMETER_SRV",
                                propertyName: "Plant"
                            },
                            groupId: "SamplePlugin-GRP2",
                            groupTitle: "UserDefaultSamplePlugin group2",
                            parameterIndex: 1
                        }
                    },
                    UshellTest1: {
                        editorMetadata: {
                            description: "Description of the test default 1",
                            displayText: "Test Default 1",
                            groupId: "EXAMPLE-FIN-GRP1",
                            groupTitle: "FIN User Defaults (UShell examples)",
                            parameterIndex: 1
                        }
                    }
                }, "correct value returned");
            })
            .fail(() => {
                assert.ok(false, "Promise was supposed to succeed!");
            })
            .always(done);
    });

    QUnit.test("_retrieveUserDefaults: defaults to local definition", function (assert) {
        // Arrange
        const oSystemContext = {
            id: "notDefinedInPlugin"
        };
        const oExpectedResult = JSON.parse(JSON.stringify(this.oPlugin.oTestData[""]));
        // Act
        return this.oPlugin._retrieveUserDefaults(oSystemContext.id).then((oDefaults) => {
            // Assert
            assert.deepEqual(oDefaults, oExpectedResult, "returned the correct defaults");
        });
    });

    QUnit.module("sap.ushell.demo.UserDefaultPluginSample - backendMode", {
        beforeEach: function (assert) {
            const done = assert.async();

            this.oODataModelReadStub = sandbox.stub(ODataModel.prototype, "read");
            this.oContainerStubs = {
                registerPlugin: sandbox.stub(),
                attachValueStored: sandbox.stub()
            };
            this.oSystemContext = {
                id: "testSystem",
                http: {
                    xhr: {
                        pathPrefix: "some-path-prefix"
                    }
                },
                getFullyQualifiedXhrUrl: sandbox.stub().callsFake(() => {
                    return this.oMockUrl || "";
                })
            };

            Container.init("local")
                .then(() => {
                    sandbox.stub(Container, "getService")
                        .withArgs("UserDefaultParameters")
                        .resolves({
                            registerPlugin: this.oContainerStubs.registerPlugin,
                            attachValueStored: this.oContainerStubs.attachValueStored
                        });

                    Component.create({
                        name: "sap.ushell.demo.UserDefaultPluginSample",
                        componentData: {
                            config: {
                                localMode: "false"
                            }
                        }
                    }).then((oComponent) => {
                        this.oPlugin = oComponent;
                        done();
                    });
                });
        },
        afterEach: function () {
            this.oPlugin.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("getUserDefault: read value CompanyCode with undefined oCurrentParameter set", function (assert) {
        // Arrange
        const done = assert.async();
        const sTestCompanyCode = "1337";

        this.oODataModelReadStub
            .withArgs("/Defaultparameters(Template='FIN')")
            .callsFake((path, handlers) => {
                handlers.success({
                    CompanyCode: {
                        value: sTestCompanyCode
                    }
                });
            });

        // Act & Assert
        this.oPlugin.getUserDefault("CompanyCode", { value: undefined }, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, { value: sTestCompanyCode }, "correct value returned");
                assert.strictEqual(this.oODataModelReadStub.callCount, 1, "Data was read from the backend system");
            })
            .fail(() => {
                assert.ok(false, "Promise was resolved");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: read value CompanyCode with defined oCurrentParameter set", function (assert) {
        // Arrange
        const done = assert.async();

        // Act & Assert
        this.oPlugin.getUserDefault("CompanyCode", { value: "set" }, this.oSystemContext)
            .done((oReturnedParameter) => {
                assert.deepEqual(oReturnedParameter, {
                    value: "set"
                }, "correct value returned");
            })
            .fail(() => {
                assert.ok(false, "Promise was resolved");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: try to read an unsupported parameter", function (assert) {
        const done = assert.async();

        this.oODataModelReadStub
            .withArgs("/Defaultparameters(Template='FIN')")
            .callsFake((path, handlers) => {
                handlers.success({});
            });

        this.oPlugin.getUserDefault("not_a_value", undefined, this.oSystemContext)
            .done((sUserDefaultValue) => {
                assert.equal(sUserDefaultValue, undefined, "correct arg");
                assert.ok(true, "Expected value was returned");
            })
            .fail(() => {
                assert.ok(false, "Promise was resolved");
            })
            .always(done);
    });

    QUnit.test("getUserDefault: check if data is cached and not more than one roundtrip to the server occurs per system context", function (assert) {
        // Arrange
        const done = assert.async();
        const sTestCompanyCode = "1337";

        this.oODataModelReadStub
            .withArgs("/Defaultparameters(Template='FIN')")
            .callsFake((path, handlers) => {
                handlers.success({
                    CompanyCode: {
                        value: sTestCompanyCode
                    }
                });
            });

        // Act & Assert
        this.oPlugin.getUserDefault("CompanyCode", { value: undefined }, this.oSystemContext)
            .done(() => {
                this.oPlugin.getUserDefault("CompanyCode", { value: undefined }, this.oSystemContext)
                    .done((oReturnedParameter) => {
                        assert.deepEqual(oReturnedParameter, { value: sTestCompanyCode }, "correct value returned");
                        assert.strictEqual(this.oODataModelReadStub.callCount, 1, "Data was read from the backend system");
                    })
                    .fail(() => {
                        assert.ok(false, "Promise was resolved");
                    })
                    .always(done);
            });
    });

    QUnit.test("getUserDefault: Returns the current parameter value if no fitting UserDefault was found", function (assert) {
        // Arrange
        const oGetUserDefaultsPromiseStub = sandbox.stub(this.oPlugin, "_getUserDefaultsPromise");
        const sSomeValue = "123";
        oGetUserDefaultsPromiseStub.resolves({});

        // Act & Assert
        return this.oPlugin.getUserDefault("CompanyCode", sSomeValue)
            .done((result) => {
                assert.strictEqual(result, sSomeValue, "Current parameter value was returned as expected");
            });
    });

    QUnit.test("getEditorMetadata: Does not alter the object when no supported parameters are provided", function (assert) {
        // Arrange
        const oMockEditorMetadata = {
            someInvalidParameter: null
        };

        // Act & Assert
        this.oPlugin.getEditorMetadata(deepClone(oMockEditorMetadata), this.oSystemContext)
            .done((editorMetadata) => {
                assert.deepEqual(editorMetadata, oMockEditorMetadata, "The object was not altered");
            });
    });

    QUnit.test("getEditorMetadata: Extends the provided object with the expected data", function (assert) {
        // Arrange
        const oMockEditorMetadata = {
            someInvalidParameter: null,
            someValidParameter: {}
        };
        const oExpectedOutput = {
            someInvalidParameter: null,
            someValidParameter: {
                editorMetadata: {
                    editorInfo: {
                        odataURL: "someTestUrl",
                        entityName: "Defaultparameter",
                        propertyName: "someValidParameter",
                        bindingPath: "/Defaultparameters('FIN')"
                    },
                    groupId: "TEST",
                    groupTitle: "TEST",
                    parameterIndex: this.oPlugin.oManagedParameters.length + 1
                }
            }
        };
        this.oPlugin.oManagedParameters.someValidParameter = {
            groupId: "TEST",
            parameterIndex: this.oPlugin.oManagedParameters.length + 1
        };
        this.oMockUrl = "someTestUrl";

        // Act & Assert
        return this.oPlugin.getEditorMetadata(deepClone(oMockEditorMetadata), this.oSystemContext)
            .done((oOutput) => {
                assert.deepEqual(oOutput, oExpectedOutput, "The provided object was extended as expected");
                assert.strictEqual(this.oSystemContext.getFullyQualifiedXhrUrl.callCount, 1, "getFullyQualifiedXhrUrl was called once");
            });
    });

    QUnit.test("storeUserDefaults: does not do anything if invalid parameter is provided", function (assert) {
        // Arrange
        const oMockEvent = {
            getParameters: sandbox.stub().returns({
                parameterName: "someInvalidParameter",
                parameterValue: "SomeValue",
                systemContext: this.oSystemContext
            })
        };
        this.oPlugin.oChangedUserDefaults.someInvalidParameter = "123";

        // Act
        this.oPlugin.storeUserDefaults(oMockEvent);

        // Assert
        assert.strictEqual(this.oPlugin.oChangedUserDefaults.someInvalidParameter, "123", "oChangesUserDefaults entry was not deleted");
        assert.strictEqual(this.oPlugin.oManagedParameters.someInvalidParameter, undefined, "someInvalidParameter was not added to managed parameters");
    });

    QUnit.test("storeUserDefaults: stores the updated value on the server specified by the system context and updates internal structures accordingly", function (assert) {
        // Arrange
        const oMockEvent = {
            getParameters: sandbox.stub().returns({
                parameterName: "someValidParameter",
                parameterValue: {
                    value: "SomeValue"
                },
                systemContext: this.oSystemContext
            })
        };
        const oODataModelStub = new ODataModel("");
        const oODataModelUpdateStub = sandbox.stub(oODataModelStub, "update");
        const oFakeTimer = sandbox.useFakeTimers();

        this.oPlugin.oModels[this.oSystemContext.id] = oODataModelStub;
        this.oPlugin.oManagedParameters.someValidParameter = {
            groupId: "TEST",
            parameterIndex: this.oPlugin.oManagedParameters.length + 1,
            value: "123"
        };
        this.oMockUrl = "someTestUrl";
        this.oPlugin.oChangedUserDefaults = {};

        // Act
        const oStoreUserDefaultsPromise = this.oPlugin.storeUserDefaults(oMockEvent);
        oFakeTimer.tick(2000);

        // Assert
        return oStoreUserDefaultsPromise
            .then(() => {
                assert.strictEqual(this.oPlugin.oChangedUserDefaults.someValidParameter, undefined, "oChangedUserDefaults was cleaned up");
                assert.strictEqual(this.oPlugin.oManagedParameters.someValidParameter.value, "SomeValue", "oManagedParameters was updated");
                assert.strictEqual(oODataModelUpdateStub.callCount, 1, "Request with updated data was sent to the backend");
            });
    });

    QUnit.test("_getUserDefaultsModel: Caches the instantiated model of a system context for later use", function (assert) {
        // Act
        const oModelOfFirstCall = this.oPlugin._getUserDefaultsModel(this.oSystemContext);
        const oModelOfSecondCall = this.oPlugin._getUserDefaultsModel(this.oSystemContext);

        // Assert
        assert.strictEqual(oModelOfFirstCall, oModelOfSecondCall, "The same model was returned on the second call");
    });
});
