// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.api.DWS
 */
sap.ui.define([
    "sap/ushell/api/DWS",
    "sap/ushell/appIntegration/ApplicationContainerCache",
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/UI5ApplicationContainer"
], (
    DwsUtils,
    ApplicationContainerCache,
    AppLifeCycle,
    IframeApplicationContainer,
    UI5ApplicationContainer
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("getCurrentApplicationIframe", {
        beforeEach: function () {
            sandbox.stub(AppLifeCycle, "getCurrentApplication");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns null when no application is set", async function (assert) {
        // Act
        const oResult = DwsUtils.getCurrentApplicationIframe();

        // Assert
        assert.strictEqual(oResult, null, "Returned null");
    });

    QUnit.test("Returns the iframe and origin of the current application container if it has one", async function (assert) {
        // Arrange
        const oIframeMock = {
            id: "iframeId"
        };
        const sOriginMock = "https://example.com";
        const oContainer = new IframeApplicationContainer();
        sandbox.stub(oContainer, "getPostMessageTarget").returns(oIframeMock);
        sandbox.stub(oContainer, "getPostMessageTargetOrigin").returns(sOriginMock);
        AppLifeCycle.getCurrentApplication.returns({
            container: oContainer
        });
        const oExpectedResult = {
            iframe: oIframeMock,
            origin: sOriginMock
        };

        // Act
        const oResult = DwsUtils.getCurrentApplicationIframe();

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "Returned the correct iframe and origin");
        assert.strictEqual(oResult.iframe, oIframeMock, "Returned the correct iframe");
    });

    QUnit.test("Returns null if an application is set but it has no iframe", async function (assert) {
        // Arrange
        const oContainer = new IframeApplicationContainer();
        AppLifeCycle.getCurrentApplication.returns({
            container: oContainer
        });

        // Act
        const oResult = DwsUtils.getCurrentApplicationIframe();

        // Assert
        assert.strictEqual(oResult, null, "Returned null");
    });

    QUnit.module("getAllApplicationIframes", {
        beforeEach: async function () {
            this.aContainers = [];
            sandbox.stub(ApplicationContainerCache, "getAll").returns(this.aContainers);
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns all applications with an iframe", async function (assert) {
        // Arrange
        const oContainer1WithoutIframe = new IframeApplicationContainer();
        this.aContainers.push(oContainer1WithoutIframe);
        const oContainer2WithIframe = new IframeApplicationContainer();
        const oIframeMock = {
            id: "iframeId"
        };
        const sOriginMock = "https://example.com";
        sandbox.stub(oContainer2WithIframe, "getPostMessageTarget").returns(oIframeMock);
        sandbox.stub(oContainer2WithIframe, "getPostMessageTargetOrigin").returns(sOriginMock);
        this.aContainers.push(oContainer2WithIframe);
        const oUi5Container = new UI5ApplicationContainer();
        this.aContainers.push(oUi5Container);

        // Act
        const aResult = DwsUtils.getAllApplicationIframes();

        // Assert
        assert.strictEqual(aResult.length, 1, "Returned the correct number of iframes");
        assert.strictEqual(aResult[0].iframe, oIframeMock, "Returned the correct iframe");
        assert.strictEqual(aResult[0].origin, sOriginMock, "Returned the correct origin");
    });
});
