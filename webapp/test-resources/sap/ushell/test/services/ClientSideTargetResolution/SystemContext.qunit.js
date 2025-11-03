// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for ClientSideTargetResolution SystemContext
 */

sap.ui.define([
    "sap/ushell/services/ClientSideTargetResolution/SystemContext"
], (
    SystemContext
) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.dump.maxDepth = 10;

    const sandbox = sinon.createSandbox({});

    QUnit.module("createSystemContextFromSystemAlias", {
        beforeEach: function () {
            this.oGetProtocolStub = sandbox.stub(SystemContext, "_getProtocol").returns("http");
            this.oSystemAlias = {
                id: "systemAliasId",
                label: "systemAliasLabel",
                https: {
                    xhr: {
                        pathPrefix: "httpsPathPrefix"
                    }
                },
                http: {
                    xhr: {
                        pathPrefix: "httpPathPrefix"
                    }
                }
            };
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Has the same id as the passed systemAlias", function (assert) {
        // Arrange

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(this.oSystemAlias);

        // Assert
        assert.strictEqual(oSystemContext.id, this.oSystemAlias.id, "The id is correct");
    });

    QUnit.test("Has the same label as the passed systemAlias", function (assert) {
        // Arrange

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(this.oSystemAlias);

        // Assert
        assert.strictEqual(oSystemContext.label, this.oSystemAlias.label, "The label is correct");
    });

    QUnit.test("Has a fallback for the label to the systemAlias id", function (assert) {
        // Arrange
        delete this.oSystemAlias.label;
        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(this.oSystemAlias);

        // Assert
        assert.strictEqual(oSystemContext.label, this.oSystemAlias.id, "The label is correct");
    });

    QUnit.test("Returns a http system context and getFullyQualifiedXhrUrl returns the right path if there is a prefix", function (assert) {
        // Arrange
        const sPath = "/SomePath";
        const sExpectedPath = "httpPathPrefix/SomePath";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(this.oSystemAlias);
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sExpectedPath, "The right path was returned");
    });

    QUnit.test("Returns a https system context and getFullyQualifiedXhrUrl returns the right path if there is a prefix", function (assert) {
        // Arrange
        this.oGetProtocolStub.returns("https");
        const sPath = "SomePath";
        const sExpectedPath = "httpsPathPrefix/SomePath";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(this.oSystemAlias);
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sExpectedPath, "The right path was returned");
    });

    QUnit.test("Returns a https system context and getFullyQualifiedXhrUrl returns the right path if there is a prefix and a query part", function (assert) {
        // Arrange
        this.oGetProtocolStub.returns("https");
        const sPath = "SomePath?sap-client=200&$filter=someFilter";
        const sExpectedPath = "httpsPathPrefix/SomePath?sap-client=200&$filter=someFilter";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(this.oSystemAlias);
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sExpectedPath, "The right path was returned");
    });

    QUnit.test("Returns a http system context and getFullyQualifiedXhrUrl returns the right path if there is no prefix", function (assert) {
        // Arrange
        const sPath = "SomePath";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias({});
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sPath, "The right path was returned");
    });

    QUnit.test("Returns a system context and getFullyQualifiedXhrUrl returns give path if it starts with 'http://'", function (assert) {
        // Arrange
        const sPath = "http://SomePath";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias("someSystemContext");
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sPath, "The right path was returned");
    });

    QUnit.test("Returns a system context and getFullyQualifiedXhrUrl returns give path if it starts with 'https://'", function (assert) {
        // Arrange
        const sPath = "https://SomePath";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias("someSystemContext");
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sPath, "The right path was returned");
    });

    QUnit.test("Returns a system context and getFullyQualifiedXhrUrl returns given path if it includes 'dynamic_dest' already", function (assert) {
        // Arrange
        const sPath = "/dynamic_dest/SomePath";

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias("someSystemContext");
        const sReturnedPath = oSystemContext.getFullyQualifiedXhrUrl(sPath);

        // Assert
        assert.strictEqual(sReturnedPath, sPath, "The right path was returned");
    });

    QUnit.module("getProtocol");

    QUnit.test("Returns 'http' or 'https'", function (assert) {
        // Arrange

        // Act
        const sReturnedProtocol = SystemContext._getProtocol();
        const bReturnedHttpOrHttps = sReturnedProtocol === "https" || sReturnedProtocol === "http";

        // Assert
        assert.ok(bReturnedHttpOrHttps, "The right protocol was returned");
    });

    QUnit.module("getProperty", {
        beforeEach: function () {
            this.oGetProtocolStub = sandbox.stub(SystemContext, "_getProtocol").returns("http");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns 'ina'", function (assert) {
        // Arrange
        const oSystemAlias = {
            http: { /* ... */ },
            https: { /* ... */ },
            properties: {
                "esearch.provider": "ina"
            }
        };

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(oSystemAlias);
        const sReturnedProperty = oSystemContext.getProperty("esearch.provider");

        // Assert
        assert.strictEqual(sReturnedProperty, "ina", "The right property was returned");
    });

    QUnit.test("Returns undefined if properties are unknown", function (assert) {
        // Arrange
        const oSystemAlias = {
            http: { /* ... */ },
            https: { /* ... */ },
            properties: {
                "esearch.provider": "ina"
            }
        };

        // Act
        const oSystemContext = SystemContext.createSystemContextFromSystemAlias(oSystemAlias);
        const sReturnedProperty = oSystemContext.getProperty("unknown.property");

        // Assert
        assert.strictEqual(sReturnedProperty, undefined, "The right property was returned");
    });
});
