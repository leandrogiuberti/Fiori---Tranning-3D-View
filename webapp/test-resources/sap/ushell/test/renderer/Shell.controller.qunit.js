// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/* global QUnit, sinon */

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.Shell
 */
sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ushell/Container",
    "sap/ushell/renderer/Shell.controller",
    "sap/ushell/resources",
    "sap/ushell/state/ShellModel"
], (
    Deferred,
    Container,
    Controller,
    ushellResources,
    ShellModel
) => {
    "use strict";

    const sandbox = sinon.createSandbox();

    QUnit.module("The method _calculateWindowTitle", {
        beforeEach: async function () {
            this.oGetPropertyStub = sandbox.stub();
            sandbox.stub(ShellModel, "getModel").returns({
                getProperty: this.oGetPropertyStub
            });
            this.sText = "myText";
            this.oGetTextStub = sandbox.stub(ushellResources.i18n, "getText").returns(this.sText);

            this.oController = new Controller();
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns correct title if only title is set", function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/application/title").returns("myTitle");
        this.oGetPropertyStub.withArgs("/application/titleAdditionalInformation").returns({});

        // Act
        const sWindowTitle = this.oController._calculateWindowTitle();

        // Assert
        assert.strictEqual(sWindowTitle, "myTitle", "The title is correct");
    });

    QUnit.test("Returns correct title if the title, headerText and additionalContext are set", function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/application/title").returns("myTitle");
        const oAdditionalInformation = {
            headerText: "myHeaderText",
            additionalContext: "myAdditionalContext"
        };
        this.oGetPropertyStub.withArgs("/application/titleAdditionalInformation").returns(oAdditionalInformation);

        // Act
        const sWindowTitle = this.oController._calculateWindowTitle();

        // Assert
        assert.strictEqual(sWindowTitle, this.sText, "The title is correct");
        assert.deepEqual(this.oGetTextStub.getCall(0).args, ["titleWindow", [oAdditionalInformation.headerText, oAdditionalInformation.additionalContext]], "The correct text is requested");
    });

    QUnit.test("Returns correct title if the title and headerText are set", function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/application/title").returns("myTitle");
        const oAdditionalInformation = {
            headerText: "myHeaderText"
        };
        this.oGetPropertyStub.withArgs("/application/titleAdditionalInformation").returns(oAdditionalInformation);

        // Act
        const sWindowTitle = this.oController._calculateWindowTitle();

        // Assert
        assert.strictEqual(sWindowTitle, oAdditionalInformation.headerText, "The title is correct");
    });

    QUnit.test("Returns correct title if the title and additionalContext are set", function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/application/title").returns("myTitle");
        const oAdditionalInformation = {
            additionalContext: "myAdditionalContext"
        };
        this.oGetPropertyStub.withArgs("/application/titleAdditionalInformation").returns(oAdditionalInformation);

        // Act
        const sWindowTitle = this.oController._calculateWindowTitle();

        // Assert
        assert.strictEqual(sWindowTitle, oAdditionalInformation.additionalContext, "The title is correct");
    });

    QUnit.test("Returns correct title if the title, headerText, additionalContext and searchTerm are set", function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/application/title").returns("myTitle");
        const oAdditionalInformation = {
            headerText: "myHeaderText",
            additionalContext: "myAdditionalContext",
            searchTerm: "mySearchTerm"
        };
        this.oGetPropertyStub.withArgs("/application/titleAdditionalInformation").returns(oAdditionalInformation);

        // Act
        const sWindowTitle = this.oController._calculateWindowTitle();

        // Assert
        assert.strictEqual(sWindowTitle, this.sText, "The title is correct");
        assert.deepEqual(this.oGetTextStub.getCall(0).args, ["titleWindowSearchTerm", [oAdditionalInformation.searchTerm]], "The correct text is requested");
    });

    QUnit.test("Returns correct title if the title, headerText, additionalContext, searchTerm and searchScope are set", function (assert) {
        // Arrange
        this.oGetPropertyStub.withArgs("/application/title").returns("myTitle");
        const oAdditionalInformation = {
            headerText: "myHeaderText",
            additionalContext: "myAdditionalContext",
            searchTerm: "mySearchTerm",
            searchScope: "mySearchScope"
        };
        this.oGetPropertyStub.withArgs("/application/titleAdditionalInformation").returns(oAdditionalInformation);

        // Act
        const sWindowTitle = this.oController._calculateWindowTitle();

        // Assert
        assert.strictEqual(sWindowTitle, this.sText, "The title is correct");
        assert.deepEqual(
            this.oGetTextStub.getCall(0).args,
            ["titleWindowSearchTermWithScope", [oAdditionalInformation.searchTerm, oAdditionalInformation.searchScope]],
            "The correct text is requested"
        );
    });

    QUnit.module("MessagePopover handling", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.oNavigationMock = {
                isUrlSupported: sandbox.stub()
            };

            Container.getServiceAsync.withArgs("Navigation").resolves(this.oNavigationMock);

            this.oController = new Controller();
        },
        afterEach: async function () {
            sandbox.restore();
            Container.reset();
        }
    });

    [{
        sExpectedUrl: "http://www.google.de",
        iExpectedConfigId: 1,
        bExpectedValidation: true,
        sTitle: "allowed external url"
    }, {
        sExpectedUrl: "#Buch-lesen",
        iExpectedConfigId: 2,
        bExpectedValidation: false,
        sTitle: "not allowed url"
    }, {
        sExpectedUrl: "#Action-toappnavsample",
        iExpectedConfigId: 3,
        bExpectedValidation: true,
        sTitle: "allowed semantic object and action"
    }, {
        sExpectedUrl: "blaBlabla",
        iExpectedConfigId: 4,
        bExpectedValidation: false,
        sTitle: "not allowed url format"
    }, {
        sExpectedUrl: "http://www.spiegel",
        iExpectedConfigId: 5,
        bExpectedValidation: false,
        sTitle: "not allowed url format. Ending is missing"
    }, {
        sExpectedUrl: "http:/www.spiegel.de",
        iExpectedConfigId: 6,
        bExpectedValidation: false,
        sTitle: "not allowed url format. One slash after http:/ is missing"
    }, {
        sExpectedUrl: "",
        iExpectedConfigId: 7,
        bExpectedValidation: false,
        sTitle: "empty string as url"
    }, {
        sExpectedUrl: undefined,
        iExpectedConfigId: 8,
        bExpectedValidation: false,
        sTitle: "url is undefined"
    }].forEach((oFixture) => {
        QUnit.test(`adaptIsUrlSupportedResultForMessagePopover: ${oFixture.sTitle}`, async function (assert) {
            const oDeferred = new Deferred();
            const oInput = {
                promise: oDeferred.promise,
                url: oFixture.sExpectedUrl,
                id: oFixture.iExpectedConfigId
            };
            oInput.promise.resolve = oDeferred.resolve.bind(oDeferred);
            oInput.promise.reject = oDeferred.reject.bind(oDeferred);

            this.oNavigationMock.isUrlSupported.withArgs(oFixture.sExpectedUrl).callsFake(async () => {
                if (oFixture.bExpectedValidation) {
                    return;
                }
                throw new Error("URL is not supported");
            });

            this.oController._adaptIsUrlSupportedResultForMessagePopover(oInput);

            const oResult = await oInput.promise;

            assert.strictEqual(oResult.allowed, oFixture.bExpectedValidation, "SAP UI5 promise was resolved correctly");
            assert.strictEqual(oResult.id, oFixture.iExpectedConfigId, "Config ID was passed correctly and got resolved as expected");
        });
    });
});
