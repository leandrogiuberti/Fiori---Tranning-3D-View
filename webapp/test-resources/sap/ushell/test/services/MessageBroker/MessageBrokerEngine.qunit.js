// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.MessageBrokerEngine
 */
sap.ui.define([
    "sap/ushell/services/MessageBroker/MessageBrokerEngine"
], (
    MessageBrokerEngine
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("Accepted Origin Handling", {
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
        }
    });

    QUnit.test("Contains current location origin by default", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];

        // Act
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();

        // Assert
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Adds a origin without port when https + 443", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin,
            "https://www.example.com:443",
            "https://www.example.com"
        ];

        // Act
        MessageBrokerEngine.addAcceptedOrigin("https://www.example.com:443");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Adds a origin without port when http + 80", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin,
            "http://www.example.com:80",
            "http://www.example.com"
        ];

        // Act
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:80");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Does add a origin with port when only https", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin,
            "https://www.example.com",
            "https://www.example.com:443"
        ];

        // Act
        MessageBrokerEngine.addAcceptedOrigin("https://www.example.com");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Does add a origin with port when only http", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin,
            "http://www.example.com",
            "http://www.example.com:80"
        ];

        // Act
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Adds a origin with port", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin,
            "http://www.example.com:3000"
        ];

        // Act
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:3000");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Can add an origin twice without error", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin,
            "http://www.example.com:3000"
        ];

        // Act
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:3000");
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:3000");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Can remove an origin", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:3000");

        // Act
        MessageBrokerEngine.removeAcceptedOrigin("http://www.example.com:3000");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Removes all related origins when https + 443", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];
        MessageBrokerEngine.addAcceptedOrigin("https://www.example.com:443");

        // Act
        MessageBrokerEngine.removeAcceptedOrigin("https://www.example.com:443");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Removes all related origins when http + 80", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:80");

        // Act
        MessageBrokerEngine.removeAcceptedOrigin("http://www.example.com:80");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Removes all related origins when only https", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];
        MessageBrokerEngine.addAcceptedOrigin("https://www.example.com");

        // Act
        MessageBrokerEngine.removeAcceptedOrigin("https://www.example.com");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Removes all related origins when only http", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com");

        // Act
        MessageBrokerEngine.removeAcceptedOrigin("http://www.example.com");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });

    QUnit.test("Can remove an origin twice without error", async function (assert) {
        // Arrange
        const aExpectedOrigins = [
            location.origin
        ];
        MessageBrokerEngine.addAcceptedOrigin("http://www.example.com:80");

        // Act
        MessageBrokerEngine.removeAcceptedOrigin("http://www.example.com:80");
        MessageBrokerEngine.removeAcceptedOrigin("http://www.example.com:80");

        // Assert
        const aAcceptedOrigins = MessageBrokerEngine.getAcceptedOrigins();
        assert.deepEqual(aAcceptedOrigins, aExpectedOrigins, "Accepted origins should match");
    });
});
