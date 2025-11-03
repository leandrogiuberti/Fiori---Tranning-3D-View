// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.cards.Card.controller.js
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/cards/ManifestPropertyHelper",
    "sap/ushell/Container"
], (
    Controller,
    JSONModel,
    manifestPropertyHelper,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.sandbox.create();

    QUnit.module("Card CHIP controller", {
        beforeEach: function () {
            this.oChipInstance = {};
            this.oView = {
                getViewData: sinon.stub().returns({ chip: this.oChipInstance })
            };
            return Controller.create({ name: "sap.ushell.components.cards.Card" }).then((oController) => {
                this.oController = oController;
                sinon.stub(this.oController, "getView").returns(this.oView);
            });
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    QUnit.test("onInit: initialize the controller", function (assert) {
        // Arrange
        const oBag = { "I am": "a bag!" };
        this.oChipInstance.bag = {
            getBag: sinon.stub().returns(oBag)
        };

        this.oView.getViewData = sinon.stub().returns({ chip: this.oChipInstance });
        this.oView.setModel = sinon.stub();

        const oCardData = { display_title_text: "Title" };
        const oManifestPropertyHelperStub = sinon.stub(manifestPropertyHelper, "getTranslatablePropertiesFromBag");
        oManifestPropertyHelperStub.returns(oCardData);

        const oConfigContractStub = sinon.stub(this.oController, "_implementConfigurationUiContract");
        const oPreviewContractStub = sinon.stub(this.oController, "_implementPreviewContract");

        // Act
        this.oController.onInit();

        // Assert
        assert.deepEqual(oManifestPropertyHelperStub.getCall(0).args[0], oBag, "Translated properties were retrieved from bag");
        assert.deepEqual(this.oView.setModel.getCall(0).args[0].getProperty("/data"), oCardData, "Card data was set in the model");
        assert.deepEqual(oConfigContractStub.getCall(0).args, [this.oChipInstance, this.oView], "Config contract implementation called with the correct parameters");
        assert.deepEqual(oPreviewContractStub.getCall(0).args, [this.oChipInstance, oCardData], "Preview contract implementation called called with the correct parameters");

        oManifestPropertyHelperStub.restore();
    });

    QUnit.test("onPress: display the config UI", function (assert) {
        // Arrange
        const oDisplayStub = sinon.stub();
        this.oChipInstance.configurationUi = {
            isEnabled: sinon.stub().returns(true),
            display: oDisplayStub
        };
        const sTileConfiguration = JSON.stringify({ tile: "configuration" });
        this.oChipInstance.configuration = {
            getParameterValueAsString: sinon.stub().withArgs("tileConfiguration").returns(sTileConfiguration)
        };

        // Act
        this.oController.onPress();

        // Assert
        assert.ok(oDisplayStub.called, "The configuration UI gets displayed");
    });

    QUnit.test("onPress: the config UI gets displayed even if no tile configuration is available", function (assert) {
        // Arrange
        const oDisplayStub = sinon.stub();
        this.oChipInstance.configurationUi = {
            isEnabled: sinon.stub().returns(true),
            display: oDisplayStub
        };
        this.oChipInstance.configuration = {
            getParameterValueAsString: sinon.stub().withArgs("tileConfiguration").returns("")
        };

        // Act
        this.oController.onPress();

        // Assert
        assert.ok(oDisplayStub.called, "The configuration UI gets displayed");
    });

    QUnit.test("onPress: navigate to the card tile's navigation target", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oDisplayStub = sinon.stub();
        this.oChipInstance.configurationUi = {
            isEnabled: sinon.stub().returns(false),
            display: oDisplayStub
        };
        const oCardTileConfiguration = {
            navigation_semantic_action: "Action",
            navigation_semantic_object: "SemanticObject",
            navigation_semantic_parameters_as_object: {
                a: 1000,
                b: "foo"
            }
        };
        const sCardTileConfiguration = JSON.stringify(oCardTileConfiguration);
        this.oChipInstance.configuration = {
            getParameterValueAsString: sinon.stub().withArgs("tileConfiguration").returns(sCardTileConfiguration)
        };
        const oNavigationServiceStub = {
            navigate: sinon.stub()
        };
        sandbox.stub(Container, "getServiceAsync").withArgs("Navigation").returns(Promise.resolve(oNavigationServiceStub));

        // Act
        this.oController.onPress();
        setTimeout(() => {
            // Assert
            assert.ok(oDisplayStub.notCalled, "The configuration UI does not get displayed");
            const oNavigationArguments = oNavigationServiceStub.navigate.getCall(0).args[0];
            assert.strictEqual(oNavigationArguments.target.semanticObject, oCardTileConfiguration.navigation_semantic_object, "The semantic object was passed to the navigation service");
            assert.strictEqual(oNavigationArguments.target.action, oCardTileConfiguration.navigation_semantic_action, "The action was passed to the navigation service");
            assert.deepEqual(oNavigationArguments.params, oCardTileConfiguration.navigation_semantic_parameters_as_object, "The navigation parameters were passed to the navigation service");
            sandbox.restore();
            fnDone();
        }, 0);
    });

    QUnit.test("_implementPreviewContract: set preview title and subtitle of the CHIP instance", function (assert) {
        // Arrange
        this.oChipInstance.preview = {
            setPreviewTitle: sinon.stub(),
            setPreviewSubtitle: sinon.stub()
        };
        const oCardData = {
            display_title_text: "Title",
            display_subtitle_text: "Subtitle"
        };

        // Act
        this.oController._implementPreviewContract(this.oChipInstance, oCardData);

        // Assert
        const sActualPreviewTitle = this.oChipInstance.preview.setPreviewTitle.getCall(0).args[0];
        const sActualPreviewSubtitle = this.oChipInstance.preview.setPreviewSubtitle.getCall(0).args[0];

        assert.strictEqual(sActualPreviewTitle, oCardData.display_title_text, "Preview title was set");
        assert.strictEqual(sActualPreviewSubtitle, oCardData.display_subtitle_text, "Preview subtitle was set");
    });

    QUnit.test("_implementConfigurationUiContract: set configuration UI of the CHIP instance", function (assert) {
        // Arrange
        this.oChipInstance.configurationUi = {
            isEnabled: sinon.stub().returns(true),
            setUiProvider: sinon.stub()
        };

        const oModelStub = { "I am": "a model" };
        this.oView.getModel = sinon.stub().returns(oModelStub);
        const oSetTooltipStub = sinon.stub();
        this.oView.getContent = sinon.stub().returns([{ setTooltip: oSetTooltipStub }]);

        const oConfigurationUiStub = {
            setModel: sinon.stub()
        };
        sinon.stub(this.oController, "_getConfigurationUi").returns(oConfigurationUiStub);

        // Act
        this.oController._implementConfigurationUiContract(this.oChipInstance, this.oView);

        // Assert
        const fnSetUiProviderCallback = this.oChipInstance.configurationUi.setUiProvider.getCall(0).args[0];
        const oActualConfigurationUi = fnSetUiProviderCallback();
        const aSetModelArgs = oConfigurationUiStub.setModel.getCall(0).args;

        assert.strictEqual(oActualConfigurationUi, oConfigurationUiStub, "The configuration UI is provided");
        assert.deepEqual(aSetModelArgs, [oModelStub, "tileModel"], "The tile model gets set on the configuration UI to reflect config changes on the tile");
        assert.strictEqual(typeof oSetTooltipStub.getCall(0).args[0], "string", "The tooltip gets set on the tile");
    });

    QUnit.test("_implementConfigurationUiContract: don't set the configuration UI of the CHIP instance when the configuration UI is disabled", function (assert) {
        // Arrange
        const oSetUiProviderStub = sinon.stub();
        this.oChipInstance.configurationUi = {
            isEnabled: sinon.stub().returns(false),
            setUiProvider: oSetUiProviderStub
        };

        // Act
        this.oController._implementConfigurationUiContract(this.oChipInstance, this.oView);

        // Assert
        assert.ok(oSetUiProviderStub.notCalled, "The configuration UI is not created");
    });

    QUnit.module("Card CHIP configuration controller", {
        beforeEach: function () {
            this.oChipInstance = {};
            this.oView = {
                getViewData: sinon.stub().returns({ chipInstance: this.oChipInstance })
            };
            return Controller.create({ name: "sap.ushell.components.cards.Configuration" }).then((oController) => {
                this.oController = oController;
                sinon.stub(this.oController, "getView").returns(this.oView);
            });
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    QUnit.test("onInit: initialize the controller when a manifest was saved before", function (assert) {
        // Arrange
        const oManifest = { "I am": "a manifest!" };

        this.oChipInstance.configuration = {
            getParameterValueAsString: sinon.stub().returns(JSON.stringify(oManifest))
        };
        this.oChipInstance.configurationUi = {
            attachSave: sinon.stub()
        };

        sinon.stub(this.oController, "_prepareManifest").returns(oManifest);
        sinon.stub(this.oController, "_checkOriginalLanguage");

        this.oView.setModel = sinon.stub();
        this.oView.setViewName = sinon.stub();

        // Act
        this.oController.onInit();

        // Assert
        const sActualEditorValue = this.oView.setModel.getCall(0).args[0].getProperty("/data/editorValue");
        assert.strictEqual(sActualEditorValue, JSON.stringify(oManifest, null, 4), "The manifest is available in the model for the code editor");

        const fnSaveFunction = this.oChipInstance.configurationUi.attachSave.getCall(0).args[0];
        assert.strictEqual(typeof fnSaveFunction, "function", "The save handler is attached");

        assert.ok(this.oController._checkOriginalLanguage.called, "The original language check was performed");
    });

    QUnit.test("onInit: initialize the controller when no manifest was saved before", function (assert) {
        // Arrange
        this.oChipInstance.configuration = {
            getParameterValueAsString: sinon.stub().returns("")
        };
        this.oChipInstance.configurationUi = {
            attachSave: sinon.stub()
        };

        sinon.stub(this.oController, "_checkOriginalLanguage");

        this.oView.setModel = sinon.stub();
        this.oView.setViewName = sinon.stub();

        // Act
        this.oController.onInit();

        // Assert
        const sActualEditorValue = this.oView.setModel.getCall(0).args[0].getProperty("/data/editorValue");
        assert.strictEqual(sActualEditorValue, "", "The manifest is empty in the model for the code editor");

        const fnSaveFunction = this.oChipInstance.configurationUi.attachSave.getCall(0).args[0];
        assert.strictEqual(typeof fnSaveFunction, "function", "The save handler is attached");

        assert.ok(this.oController._checkOriginalLanguage.called, "The original language check was performed");
    });

    QUnit.test("onSaveConfiguration: save the card configuration from the manifest", function (assert) {
        // Arrange
        const oController = this.oController;
        const oManifest = { "I am": "a manifest!" };
        const oModel = new JSONModel({
            data: {
                editorValue: JSON.stringify(oManifest, null, 4)
            }
        });
        this.oView.getModel = sinon.stub().returns(oModel);

        const oCardData = {
            bagProperties: { display_title_text: "Title" },
            tileConfiguration: "TileConfiguration",
            manifest: oManifest
        };
        sinon.stub(manifestPropertyHelper, "extractCardData").returns(oCardData);

        sinon.stub(oController, "_saveManifestAndTileConfig").returns(Promise.resolve());
        sinon.stub(oController, "_saveTilePropertiesBag").returns(Promise.resolve());
        sinon.stub(oController, "_saveTitle").returns(Promise.resolve());
        sinon.stub(oController, "_updateTileModel").returns(Promise.resolve());

        // Act
        const oSaveDeferred = oController.onSaveConfiguration();

        // Assert
        assert.deepEqual(manifestPropertyHelper.extractCardData.getCall(0).args[0], oManifest, "The card manifest was provided for data extraction");

        const done = assert.async();
        oSaveDeferred.then(() => {
            assert.ok(true, "The returned deferred was resolved");
        })
            .fail(() => {
                assert.ok(false, "The returned deferred was resolved");
            })
            .always(() => {
                assert.deepEqual(oController._saveManifestAndTileConfig.getCall(0).args[0], oManifest, "The manifest was provided for saving");
                assert.strictEqual(oController._saveManifestAndTileConfig.getCall(0).args[1], oCardData.tileConfiguration, "The tile configuration was provided for saving");
                assert.deepEqual(oController._saveTilePropertiesBag.getCall(0).args[0], oCardData, "The card data was provided for saving in the bags");
                assert.strictEqual(oController._saveTitle.getCall(0).args[0], oCardData.bagProperties.display_title_text, "The title was provided for saving");
                assert.deepEqual(oController._updateTileModel.getCall(0).args[0], oCardData, "The card data was provided for updating the tile model");

                manifestPropertyHelper.extractCardData.restore();
                done();
            });
    });

    QUnit.test("onSaveConfiguration: reject saving the card configuration if the manifest is invalid", function (assert) {
        // Arrange
        const oController = this.oController;
        const oModel = new JSONModel({
            data: {
                editorValue: "I am an invalid manifest"
            }
        });
        this.oView.getModel = sinon.stub().returns(oModel);

        // Act
        const oSaveDeferred = oController.onSaveConfiguration();

        // Assert
        const done = assert.async();
        oSaveDeferred.fail((oError) => {
            assert.ok(true, "The returned deferred was rejected");
            assert.ok(oError, "An error message was provided");
            done();
        });
    });

    QUnit.test("_saveManifestAndTileConfig: save parameters and resolve on success", function (assert) {
        // Arrange
        const oManifest = { "I am": "a manifest!" };
        const sTileConfiguration = "I am the tile configuration!";

        this.oChipInstance.writeConfiguration = {
            setParameterValues: sinon.stub()
        };

        // Act
        const oSavePromise = this.oController._saveManifestAndTileConfig(oManifest, sTileConfiguration);

        const aSaveArguments = this.oChipInstance.writeConfiguration.setParameterValues.getCall(0).args;
        aSaveArguments[1](); // this is the promise's resolve method

        // Assert
        assert.strictEqual(aSaveArguments[0].cardManifest, JSON.stringify(oManifest), "The manifest was saved");
        assert.strictEqual(aSaveArguments[0].tileConfiguration, sTileConfiguration, "The tile configuration was saved");

        const done = assert.async();
        oSavePromise.then(() => {
            assert.ok(true, "The promise was resolved");
            done();
        });
    });

    QUnit.test("_saveManifestAndTileConfig: reject on failure", function (assert) {
        // Arrange
        this.oChipInstance.writeConfiguration = {
            setParameterValues: sinon.stub()
        };

        // Act
        const oSavePromise = this.oController._saveManifestAndTileConfig();

        // this is the promises reject method
        const fnReject = this.oChipInstance.writeConfiguration.setParameterValues.getCall(0).args[2];
        const sErrorMessage = "Error";
        const oErrorInfo = {
            error: "error"
        };
        const oExpectedErrorDetails = {
            error: sErrorMessage,
            errorInfo: oErrorInfo
        };
        fnReject(sErrorMessage, oErrorInfo);

        // Assert
        const done = assert.async();
        oSavePromise.catch((oError) => {
            assert.ok(true, "The promise was rejected");
            assert.strictEqual(oError.message, sErrorMessage, "The error message was returned");
            assert.deepEqual(oError.details, oExpectedErrorDetails, "The error info object was returned");
            done();
        });
    });

    QUnit.test("_saveTilePropertiesBag: save card properties in a bag and resolve on success", function (assert) {
        // Arrange
        const oCardData = {
            bagProperties: {
                display_title_text: "Title",
                display_subtitle_text: undefined
            }
        };
        const oTilePropertiesBag = {
            save: sinon.stub(),
            setText: sinon.stub(),
            resetProperty: sinon.stub()
        };
        this.oChipInstance.bag = {
            getBag: sinon.stub().withArgs("tileProperties").returns(oTilePropertiesBag)
        };

        // Act
        const oSavePromise = this.oController._saveTilePropertiesBag(oCardData);
        // this is the promise's resolve method
        const fnResolve = oTilePropertiesBag.save.getCall(0).args[0];
        fnResolve();

        // Assert
        const aSetTextArgs = oTilePropertiesBag.setText.getCall(0).args;
        assert.strictEqual(aSetTextArgs[0], "display_title_text", "The property was filled into the bag");
        assert.strictEqual(aSetTextArgs[1], oCardData.bagProperties.display_title_text, "The property value was filled into the bag");

        const aResetPropertyArgs = oTilePropertiesBag.resetProperty.getCall(0).args;
        assert.strictEqual(aResetPropertyArgs[0], "display_subtitle_text", "The empty property was reset");

        const done = assert.async();
        oSavePromise.then(() => {
            assert.ok(true, "The promise was resolved");
            done();
        });
    });

    QUnit.test("_saveTilePropertiesBag: reject on failure", function (assert) {
        // Arrange
        const oCardData = {
            bagProperties: {}
        };
        const oTilePropertiesBag = {
            save: sinon.stub(),
            setText: sinon.stub(),
            resetProperty: sinon.stub()
        };
        this.oChipInstance.bag = {
            getBag: sinon.stub().withArgs("tileProperties").returns(oTilePropertiesBag)
        };

        // Act
        const oSavePromise = this.oController._saveTilePropertiesBag(oCardData);
        // this is the promise's reject method
        const fnReject = oTilePropertiesBag.save.getCall(0).args[1];
        const mErrorMessages = {
            error1: "Error1",
            error2: "Error2"
        };
        const mErrorInfo = {
            error1: { error: "error1" },
            error2: { error: "error2" }
        };

        const oExpectedErrorDetails = {
            info: mErrorInfo.error1,
            otherMessages: mErrorMessages,
            otherInfo: mErrorInfo
        };
        fnReject(mErrorMessages, mErrorInfo);

        // Assert
        const done = assert.async();
        oSavePromise.catch((oError) => {
            assert.ok(true, "The promise was rejected");
            assert.strictEqual(oError.message, "Bag save failed: Error1", "The error message was returned");
            assert.deepEqual(oError.details, oExpectedErrorDetails, "The error info object was returned");
            done();
        });
    });

    QUnit.test("_saveTitle: save the title and resolve on success", function (assert) {
        // Arrange
        const sTitle = "Title";
        this.oChipInstance.title = {
            setTitle: sinon.stub()
        };

        // Act
        const oSavePromise = this.oController._saveTitle(sTitle);
        const aSetTitleArguments = this.oChipInstance.title.setTitle.getCall(0).args;
        // this is the promise's resolve method
        aSetTitleArguments[1]();

        // Assert
        assert.strictEqual(aSetTitleArguments[0], sTitle, "The title was saved");

        const done = assert.async();
        oSavePromise.then(() => {
            assert.ok(true, "The promise was resolved");
            done();
        });
    });

    QUnit.test("_saveTitle: reject on failure", function (assert) {
        // Arrange
        this.oChipInstance.title = {
            setTitle: sinon.stub()
        };

        // Act
        const oSavePromise = this.oController._saveTitle();
        // this is the promise's reject method
        const fnReject = this.oChipInstance.title.setTitle.getCall(0).args[2];
        const sErrorMessage = "Error";
        const oErrorInfo = { error: "error" };
        const oExpectedErrorDetails = {
            error: sErrorMessage,
            errorInfo: oErrorInfo
        };
        fnReject(sErrorMessage, oErrorInfo);

        // Assert
        const done = assert.async();
        oSavePromise.catch((oError) => {
            assert.ok(true, "The promise was rejected");
            assert.strictEqual(oError.message, sErrorMessage, "The error message was returned");
            assert.deepEqual(oError.details, oExpectedErrorDetails, "The error info object was returned");
            done();
        });
    });

    QUnit.test("_updateTileModel: update the card tile's data", function (assert) {
        // Arrange
        const oCardData = {
            bagProperties: {
                display_title_text: "Title",
                display_subtitle_text: "Subtitle"
            }
        };
        const oModel = new JSONModel({
            data: {}
        });
        this.oView.getModel = sinon.stub().withArgs("tileModel").returns(oModel);

        // Act
        this.oController._updateTileModel(oCardData);

        // Assert
        assert.strictEqual(oModel.getProperty("/data/display_title_text"), oCardData.bagProperties.display_title_text, "The title was updated");
        assert.strictEqual(oModel.getProperty("/data/display_subtitle_text"), oCardData.bagProperties.display_subtitle_text, "The subtitle was updated");
    });

    QUnit.test("_checkOriginalLanguage: the user is logged on in the original language of the card", function (assert) {
        sinon.stub(this.oController, "_isOriginalLanguage").returns(true);

        const oModel = new JSONModel({ config: {} });
        this.oView.getModel = sinon.stub().returns(oModel);

        this.oController._checkOriginalLanguage();

        assert.deepEqual(oModel.getProperty("/config"), {}, "No warning is displayed, the manifest is still editable");
    });

    QUnit.test("_checkOriginalLanguage: the user is logged on in a different language than the original language of the card", function (assert) {
        sinon.stub(this.oController, "_isOriginalLanguage").returns(false);

        const oModel = new JSONModel({ config: {} });
        this.oView.getModel = sinon.stub().returns(oModel);

        const oLanguages = {
            originalLanguage: "EN",
            logonLanguage: "DE",
            ui5CoreLanguage: "DE"
        };
        sinon.stub(this.oController, "_getLanguages").returns(oLanguages);

        this.oController._checkOriginalLanguage();

        const oConfig = oModel.getProperty("/config");

        assert.strictEqual(oConfig.originalLanguage, "EN", "The original language is set correctly for the message");
        assert.strictEqual(oConfig.sapLogonLanguage, "DE", "The logon language is set correctly for the message");
        assert.strictEqual(oConfig.displayOriginalLanguageWarning, true, "The warning message is displayed");
        assert.strictEqual(oConfig.manifestEditorEditable, false, "The manifest editor is not editable");
    });

    QUnit.test("_isOriginalLanguage: The user is logged in in original language", function (assert) {
        const oLanguages = {
            originalLanguage: "EN",
            logonLanguage: "EN",
            ui5CoreLanguage: "EN"
        };
        sinon.stub(this.oController, "_getLanguages").returns(oLanguages);

        assert.strictEqual(this.oController._isOriginalLanguage(), true, "The language is recognized as original language");
    });

    QUnit.test("_isOriginalLanguage: The user is not logged in in original language", function (assert) {
        const oLanguages = {
            originalLanguage: "EN",
            logonLanguage: "DE",
            ui5CoreLanguage: "DE"
        };
        sinon.stub(this.oController, "_getLanguages").returns(oLanguages);

        assert.strictEqual(this.oController._isOriginalLanguage(), false, "The language is recognized as not original language");
    });
});
