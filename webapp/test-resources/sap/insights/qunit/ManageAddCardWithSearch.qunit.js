/*global QUnit, sinon */
sap.ui.define([
    "sap/insights/ManageAddCardWithSearch",
    "sap/m/TextArea",
    "sap/m/Dialog",
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/m/Button',
    'sap/m/IllustratedMessage',
    "sap/ui/core/library"
], function (ManageAddCardWithSearch, TextArea, Dialog, MessageToast, MessageBox, Button, IllustratedMessage, coreLibrary) {
    "use strict";

    /**
     * Utility function to stub multiple methods on an object.
     *
     * @param {Object} obj - The object containing the methods to be stubbed.
     * @param {Array<string>} methodNames - An array of method names to be stubbed.
     * @returns {Object} An object containing the stubs for each method.
     */
    function stubMethods(obj, methodNames) {
        var stubs = {};
        methodNames.forEach(function (methodName) {
            stubs[methodName] = sinon.stub(obj, methodName);
        });
        return stubs;
    }

    function restoreStubs (stubs) {
         // Restore the stubs after the test
        Object.keys(stubs).forEach(function (methodName) {
            stubs[methodName].restore();
        });
    }
    QUnit.module("ManageAddCardWithSearch Tests", {
        beforeEach: function () {
            // Create a sandbox for stubbing and spying
            this.oSandbox = sinon.sandbox.create();
            this.setAggregationSpy = this.oSandbox.spy(ManageAddCardWithSearch.prototype, 'setAggregation');
            this.createStaticControlsSpy = this.oSandbox.spy(ManageAddCardWithSearch.prototype, '_createStaticControls');
            // Create an instance of the ManageAddCardWithSearch class
            this.oManageAddCardWithSearch = new ManageAddCardWithSearch();

            // Spy on the methods that need to be called during the dialog flow
            this.oManageAddCardWithSearch.closeDialog = this.oSandbox.spy();
            this.oManageAddCardWithSearch.afterOpenDialog = this.oSandbox.spy();

            // Stub the _getOuterVbox and _getAddButton methods
            this.oManageAddCardWithSearch._getOuterVbox = sinon.stub().returns([]);
            this.oManageAddCardWithSearch._getAddButton = sinon.stub().returns(new Button());
        },
        afterEach: function () {
            // Clean up sandbox and destroy the instance
            this.oSandbox.restore();
            this.oManageAddCardWithSearch.destroy();
        }
    });

    QUnit.test("init should create and return the dialog during instantiation", function (assert) {
        // Act: `new ManageAddCardWithSearch()` triggers the dialog creation automatically
        var oDialog = this.oManageAddCardWithSearch.getAggregation("_queryDialog");

        // Assert: Verify that a Dialog was created and set via aggregation
        assert.ok(oDialog instanceof Dialog, "Dialog was created successfully during instantiation");
        assert.strictEqual(this.setAggregationSpy.callCount, 1, "setAggregation was called once");
        assert.strictEqual(this.setAggregationSpy.args[0][1], oDialog, "Dialog was set in the aggregation");
        assert.strictEqual(oDialog.getTitle(), this.oManageAddCardWithSearch.i18Bundle.getText("addToInsights"), "Dialog title is correct");

        //check if createstaticcontrols  are invoked
        assert.strictEqual(this.createStaticControlsSpy.callCount, 1, "_createStaticControls was called once");

    });

    QUnit.test("Test addCard with mocked service success scenario", async function (assert) {
        var done = assert.async();

        this.getAggregationStub = sinon.stub(ManageAddCardWithSearch.prototype, 'getAggregation').returns({
            setBusy: sinon.stub().returns()
        });
        // Mock the _createCards method to return a resolved promise
        const oCardHelperServiceInstance = {
            _createCard: sinon.stub().returns(Promise.resolve({
                'sap.insights': {
                    visible: false
                }
            }))
        };

        // Create InsightsCardHelper mock with getServiceAsync method returning our mocked instance
        const InsightsCardHelper = {
            getServiceAsync: sinon.stub().returns(Promise.resolve(oCardHelperServiceInstance))
        };

        this.oStubRequire = sinon.stub(sap.ui, 'require',function (dependencies, fnCallback) {
            // Simulate calling back with the mocked InsightsCardHelper
            fnCallback(InsightsCardHelper);
        });

        this.oManageAddCardWithSearch.i18Bundle = {
            getText: function () { }
        };

        // Spy on other methods that you need to verify in your assertions
        var messageToastSpy = sinon.stub(MessageToast, "show").returns();
        var messageBoxSpy = sinon.stub(MessageBox, "information").returns();
        var hasListenersStub = sinon.stub(  this.oManageAddCardWithSearch, "hasListeners").returns();

        // Call the addCard method (it should invoke the mocked _createCards method inside)
        this.oManageAddCardWithSearch.addCard();

        // Wait for the asynchronous flow to finish
        await oCardHelperServiceInstance._createCard.returnValues[0];  // Wait for the Promise to resolve

        setTimeout(function () {

            assert.ok(ManageAddCardWithSearch.prototype.getAggregation("_queryDialog").setBusy.calledWith(true), "Query dialog set to busy");
            assert.ok(oCardHelperServiceInstance._createCard.calledOnce, "_createCards called once");
            assert.ok(ManageAddCardWithSearch.prototype.getAggregation("_queryDialog").setBusy.calledWith(false), "Query dialog set to not busy");
            assert.ok(hasListenersStub.calledOnce, "onAddButtonPress event listener was called");
            assert.ok(this.oManageAddCardWithSearch.closeDialog.calledOnce, "closeDialog was called");
            assert.ok(messageToastSpy.calledWith(this.oManageAddCardWithSearch.i18Bundle.getText("Card_Created")), "MessageToast shown with 'Card_Created'");
            assert.ok(messageBoxSpy.calledWith(this.oManageAddCardWithSearch.i18Bundle.getText("INT_CARD_LIMIT_MESSAGEBOX")), "MessageBox shown with 'INT_CARD_LIMIT_MESSAGEBOX'");
            messageToastSpy.restore();
            messageBoxSpy.restore();
            hasListenersStub.restore();
            this.getAggregationStub.restore();
            this.oStubRequire.restore();
            done();
        }.bind(this), 0);
    });

    QUnit.test("Test addCard with mocked service error scenario", function (assert) {
        var done = assert.async();

        this.getAggregationStub = sinon.stub(ManageAddCardWithSearch.prototype, 'getAggregation').returns({
            setBusy: sinon.stub().returns()
        });
        var oMessage = { "message": "error" };
        // Create InsightsCardHelper mock with getServiceAsync method returning our mocked instance
        const InsightsCardHelper = {
            getServiceAsync: sinon.stub().returns(Promise.reject(oMessage))
        };

        this.oStubRequire = sinon.stub(sap.ui, 'require',function (dependencies, fnCallback) {
            // Simulate calling back with the mocked InsightsCardHelper
            fnCallback(InsightsCardHelper);
        });

        this.oManageAddCardWithSearch.i18Bundle = {
            getText: function () { }
        };

        // Spy on other methods that you need to verify in your assertions
        var messageToastSpy = sinon.stub(MessageToast, "show").returns();
        var hasListenersStub = sinon.stub(this.oManageAddCardWithSearch, "hasListeners").returns();

        // Call the addCard method (it should invoke the mocked _createCards method inside)
        this.oManageAddCardWithSearch.addCard();

        setTimeout(function () {
            assert.ok(ManageAddCardWithSearch.prototype.getAggregation("_queryDialog").setBusy.calledWith(true), "Query dialog set to busy");
            assert.ok(ManageAddCardWithSearch.prototype.getAggregation("_queryDialog").setBusy.calledWith(false), "Query dialog set to not busy");
            assert.ok(!hasListenersStub.called, "onAddButtonPress event listener was not called");
            assert.ok(!this.oManageAddCardWithSearch.closeDialog.called, "closeDialog was not called");
            assert.ok(messageToastSpy.calledWith(oMessage.message), "MessageToast called with error message");
            hasListenersStub.restore();
            this.getAggregationStub.restore();
            this.oStubRequire.restore();
            done();
        }.bind(this), 0);
    });

    QUnit.test("_onSearch should handle search correctly", function (assert) {
        var done = assert.async();

        // Mock dependencies and methods
        var oTextBox = {
            getValue: sinon.stub().returns("test query"),
            focus: sinon.stub()
        };

        var oSearchedCard = {
            setManifest: sinon.stub(),
            setVisible: sinon.stub()
        };
        // List of methods to be stubbed
        var methodsToStub = [
            "resetDialog",
            "_toggleButtonAndText",
            "_setMessageStripOverflowVisibility",
            "_toggleCardBox",
            "_enableFocusAddButton"
        ];

        // Stub the methods
        var stubs = stubMethods(this.oManageAddCardWithSearch, methodsToStub);

        this.oManageAddCardWithSearch._getTextBox = sinon.stub().returns(oTextBox);
        this.oManageAddCardWithSearch._getCancelButton = sinon.stub().returns(new Button());
        this.oManageAddCardWithSearch._getSearchedCard = sinon.stub().returns(oSearchedCard);
        this.oManageAddCardWithSearch._getPlaceholder = sinon.stub().returns(oSearchedCard);
        this.oManageAddCardWithSearch._handleSearchSuccess = sinon.stub().returns();
        this.oManageAddCardWithSearch.i18Bundle = {
            getText: sinon.stub().returns("Error")
        };

        // Stub fetch
        var fetchStub = sinon.stub(window, "fetch");
        fetchStub.onFirstCall().returns(Promise.resolve({
            headers: {
                get: sinon.stub().returns("token")
            }
        }));
        fetchStub.onSecondCall().returns(Promise.resolve({
            ok: true,
            json: sinon.stub().returns(Promise.resolve({
                CardManifest: JSON.stringify({ key: "value" })
            }))
        }));

        // Call the method
        this.oManageAddCardWithSearch._onSearch();

        setTimeout(function () {
            assert.ok(stubs._toggleButtonAndText.calledWith(false), "_toggleButtonAndText called with false");
            assert.ok(stubs.resetDialog.calledOnce, "resetDialog called once");
            assert.ok(fetchStub.calledTwice, "fetch called twice");
            assert.ok(this.oManageAddCardWithSearch._getSearchedCard.calledOnce, "_getSearchedCard called once");
            assert.ok(this.oManageAddCardWithSearch._handleSearchSuccess.calledOnce, "_handleSearchSuccess called once");
            oSearchedCard.setManifest.reset();
            restoreStubs(stubs);
            fetchStub.restore();
            done();
        }.bind(this), 0);
    });

    QUnit.test("_onSearch should handle error scenario correctly", function (assert) {
        var done = assert.async();

        // Mock dependencies and methods
        var oTextBox = {
            getValue: sinon.stub().returns("test query"),
            focus: sinon.stub()
        };
        var oMessage = { "message": "(4001) You may not have access to this app: Travel" };
        var oNoCardMessage = {
            setTitle: sinon.stub(),
            setDescription: sinon.stub(),
            setIllustrationType: sinon.stub()
        };

        var oSearchedCard = {
            setManifest: sinon.stub(),
            setVisible: sinon.stub()
        };
        // List of methods to be stubbed
        var methodsToStub = [
            "resetDialog",
            "_toggleButtonAndText",
            "_setMessageStripOverflowVisibility",
            "_toggleCardBox",
            "_enableFocusAddButton"
        ];
        // Stub the methods
        var stubs = stubMethods(this.oManageAddCardWithSearch, methodsToStub);
        this.oManageAddCardWithSearch._handleSearchError = sinon.stub();
        this.oManageAddCardWithSearch._getSearchedCard = sinon.stub().returns(oSearchedCard);
        this.oManageAddCardWithSearch._getPlaceholder = sinon.stub().returns(oSearchedCard);
        this.oManageAddCardWithSearch._getTextBox = sinon.stub().returns(oTextBox);
        this.oManageAddCardWithSearch._getCancelButton = sinon.stub().returns(new Button());
        this.oManageAddCardWithSearch._getNoCardMessage = sinon.stub().returns(oNoCardMessage);
        this.oManageAddCardWithSearch.i18Bundle = {
            getText: sinon.stub().returns("Error")
        };

        // Stub fetch
        var fetchStub = sinon.stub(window, "fetch");
        fetchStub.onFirstCall().returns(Promise.reject(oMessage));

        // Call the method
        this.oManageAddCardWithSearch._onSearch();

        setTimeout(function () {
            assert.ok(this.oManageAddCardWithSearch._toggleButtonAndText.calledWith(false), "_toggleButtonAndText called with false");
            assert.ok(stubs.resetDialog.calledOnce, "resetDialog called once");
            assert.ok(fetchStub.calledOnce, "fetch called once");
            assert.ok(this.oManageAddCardWithSearch._getSearchedCard.called, "_getSearchedCard called");
            assert.ok(this.oManageAddCardWithSearch._handleSearchError.calledOnce, "_handleSearchError called once");
            var passedError = this.oManageAddCardWithSearch._handleSearchError.firstCall.args[1];
            assert.strictEqual(passedError.message, "(4001) You may not have access to this app: Travel", "Correct error message passed to _handleSearchError");
            restoreStubs(stubs);
            fetchStub.restore();
            done();
        }.bind(this), 0);
    });

    QUnit.test("_handleSearchSuccess should process data correctly with dataSources missing in manifest", function (assert) {
        var done = assert.async();

        var oCard = {
            setVisible: sinon.stub(),
            setManifest: sinon.stub()
        };
        var data = {
            CardManifest: JSON.stringify({ key: "value" }),
            FilterTokens: {
                filters: [{
                    propertylabel: "Test Property",
                    values: [{ value: "'Test Value'" }],
                    operator: "eq"
                }
                ],
                top: 10,
                app: { name: "TestApp" }
            }
        };

        // Mock the methods that need to be stubbed
        var methodsToStub = [
            "_toggleButtonAndText",
            "_getPlaceholder",
            "_getFilterHBox",
            "_enableFocusAddButton",
            "_setMessageStripOverflowVisibility",
            "noHeaderNavigationBox",
            "_toggleCardBox",
            "_addTokenArias",
            "fireOnCardGenerated"
        ];

        var stubs = stubMethods(this.oManageAddCardWithSearch, methodsToStub);
        this.oManageAddCardWithSearch._startGenerate = true;

        this.oManageAddCardWithSearch._getFilterHBox = sinon.stub().returns({
            getItems: sinon.stub().returns([{},{ addToken: sinon.stub() }])
        });
        this.oManageAddCardWithSearch._getPlaceholder = sinon.stub().returns({
            setVisible: sinon.stub()
        });

        this.oManageAddCardWithSearch._handleSearchSuccess(oCard, data);

        setTimeout(function () {
            // Assertions
            assert.ok(oCard.setVisible.calledWith(true), "Card visibility is set");
            assert.ok(oCard.setManifest.calledWith({ key: "value" }), "Card manifest is set correctly");
            assert.ok(this.oManageAddCardWithSearch._getPlaceholder().setVisible.calledWith(false), "Placeholder visibility is set to false");
            assert.ok(stubs._toggleButtonAndText.calledWith(true), "_toggleButtonAndText is called with true");
            assert.ok(stubs._addTokenArias.calledOnce, "_addTokenArias is called once");
            assert.ok(stubs._toggleCardBox.calledWith(true), "_toggleCardBox is called with true");
            assert.ok(stubs.noHeaderNavigationBox.calledWith(true), "noHeaderNavigationBox called with true");

            // Check filter tokens
            assert.ok(this.oManageAddCardWithSearch._getFilterHBox().getItems()[1].addToken.called, "Token added to filter box");

            restoreStubs(stubs);
            done();
        }.bind(this), 0);
    });

    QUnit.test("_handleSearchSuccess should process data correctly with dataSources not missing in manifest", function (assert) {
        var done = assert.async();

        var oCard = {
            setVisible: sinon.stub(),
            setManifest: sinon.stub()
        };

        var manifest = {
            "sap.app": {
                id: "test.card",
                dataSources: {
                    someDataSource: {
                        uri: "/some/service/url",
                        type: "OData"
                    }
                }
            },
            "sap.insights": {}
        };

        var data = {
            CardManifest: JSON.stringify(manifest),
            FilterTokens: {
                filters: [{
                    propertylabel: "Test Property",
                    values: [{ value: "'Test Value'" }],
                    operator: "eq"
                }
                ],
                top: 10,
                app: { name: "TestApp" }
            }
        };

        // Mock the methods that need to be stubbed
        var methodsToStub = [
            "_toggleButtonAndText",
            "_getPlaceholder",
            "_getFilterHBox",
            "_enableFocusAddButton",
            "_setMessageStripOverflowVisibility",
            "noHeaderNavigationBox",
            "_toggleCardBox",
            "_addTokenArias",
            "fireOnCardGenerated"
        ];

        var stubs = stubMethods(this.oManageAddCardWithSearch, methodsToStub);
        this.oManageAddCardWithSearch._startGenerate = true;

        this.oManageAddCardWithSearch._getFilterHBox = sinon.stub().returns({
            getItems: sinon.stub().returns([{},{ addToken: sinon.stub() }])
        });
        this.oManageAddCardWithSearch._getPlaceholder = sinon.stub().returns({
            setVisible: sinon.stub()
        });

        this.oManageAddCardWithSearch._handleSearchSuccess(oCard, data);

        setTimeout(function () {
            // Assertions
            assert.ok(oCard.setVisible.calledWith(true), "Card visibility is set");
            assert.ok(oCard.setManifest.calledOnce, "setManifest was called once");
            assert.deepEqual(
                oCard.setManifest.getCall(0).args[0],
                manifest,
                "Card manifest is set correctly with full valid manifest"
            );
            assert.ok(stubs.noHeaderNavigationBox.notCalled, "noHeaderNavigationBox NOT called for valid manifest");
            assert.ok(this.oManageAddCardWithSearch._getPlaceholder().setVisible.calledWith(false), "Placeholder visibility is set to false");
            assert.ok(stubs._toggleButtonAndText.calledWith(true), "_toggleButtonAndText is called with true");
            assert.ok(stubs._addTokenArias.calledOnce, "_addTokenArias is called once");
            assert.ok(stubs._toggleCardBox.calledWith(true), "_toggleCardBox is called with true");

            // Check filter tokens
            assert.ok(this.oManageAddCardWithSearch._getFilterHBox().getItems()[1].addToken.called, "Token added to filter box");

            restoreStubs(stubs);
            done();
        }.bind(this), 0);
    });

    QUnit.test("_generateAIPolicyText, Generates the AI policy text with a link", function (assert) {
        var done = assert.async();
        var sTestLink = "TestLink";
        this.oManageAddCardWithSearch.i18Bundle = {
            getText: sinon.stub().returns(sTestLink)
        };

        var sAiTextthis = this.oManageAddCardWithSearch._generateAIPolicyText();
        setTimeout(() => {
            // Assertions
            assert.strictEqual(sAiTextthis, sTestLink, "Ai policy link returned");
            done();
        }, 0);
    });

    QUnit.test("_sendFeedback should activate correct button and show toast", function (assert) {
        // Arrange
        const thumbsUpStub = { setPressed: sinon.spy() };
        const thumbsDownStub = { setPressed: sinon.spy() };
        const i18nText = "Dummy Text";
        sinon.stub(this.oManageAddCardWithSearch, "_getThumbsUpButton").returns(thumbsUpStub);
        sinon.stub(this.oManageAddCardWithSearch, "_getThumbsDownButton").returns(thumbsDownStub);
        this.oManageAddCardWithSearch.i18Bundle = {
            getText: sinon.stub().withArgs("feedBackSent").returns(i18nText)
        };

        // Act
        this.oManageAddCardWithSearch._sendFeedback("thumbsUp");

        // Assert
        assert.ok(thumbsUpStub.setPressed.calledWith(true), "Thumbs up button was set to pressed");
        assert.ok(thumbsDownStub.setPressed.calledWith(false), "Thumbs down button was reset");
    });

    QUnit.test("_formatFilterToken should format simple comparison operators correctly", function (assert) {
        var oManageAddCardWithSearch = new ManageAddCardWithSearch();
        assert.strictEqual(
            this.oManageAddCardWithSearch._formatFilterToken("eq", "Test Property", [{ value: "'Test Value'" }]),
            "Test Property:  Test Value",
            "eq operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("ne", "Test Property", [{ value: "'Test Value'" }]),
            "Test Property: != Test Value",
            "ne operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("gt", "Price", [{ value: "'100'" }]),
            "Price: > 100",
            "gt operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("le", "Price", [{ value: "'200'" }]),
            "Price: <= 200",
            "le operator formatted correctly"
        );
    });

    QUnit.test("_formatFilterToken should format complex operators correctly", function (assert) {
        var oManageAddCardWithSearch = new ManageAddCardWithSearch();
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("startswith", "Name", [{ value: "'John'" }]),
            "Name: John*",
            "startswith operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("notstartswith", "Name", [{ value: "'John'" }]),
            "Name: !(John*)",
            "notstartswith operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("endswith", "Name", [{ value: "'Doe'" }]),
            "Name: *Doe",
            "endswith operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("contains", "Description", [{ value: "'important'" }]),
            "Description: *important*",
            "contains operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("notcontains", "Description", [{ value: "'secret'" }]),
            "Description: !(*secret*)",
            "notcontains operator formatted correctly"
        );
    });

    QUnit.test("_formatFilterToken should format between operators correctly", function (assert) {
        var oManageAddCardWithSearch = new ManageAddCardWithSearch();
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("bt", "Price", [{ value: "'100'" }, { value: "'500'" }]),
            "Price: (100...500)",
            "bt operator formatted correctly"
        );
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("nb", "Price", [{ value: "'100'" }, { value: "'500'" }]),
            "Price: !(100...500)",
            "nb operator formatted correctly"
        );
    });

    QUnit.test("_formatFilterToken should return default format when operator is unknown", function (assert) {
        var oManageAddCardWithSearch = new ManageAddCardWithSearch();
        assert.strictEqual(
            oManageAddCardWithSearch._formatFilterToken("unknown", "Test Property", [{ value: "'Test Value'" }]),
            "Test Property: Test Value",
            "Unknown operator defaults to 'property: value'"
        );
    });

    QUnit.test("resetDialog - when bClose is true", function (assert) {

        this.oManageAddCardWithSearch.i18Bundle = {
            getText: function (key) {
                return key;
            }
        };

        // Stub the necessary methods
        var oTextBox = new TextArea();
        var oNoCardMessage = new IllustratedMessage();
        var oSearchedCard = {
            setManifestChanges: sinon.stub(),
            setManifest: sinon.stub(),
            setPreviewMode: sinon.stub(),
            setVisible: sinon.stub()
        };

         // List of methods to be stubbed
        var methodsToStub = [
            "_toggleButtonAndText",
            "_setMessageStripOverflowVisibility",
            "noHeaderNavigationBox",
            "_toggleCardBox",
            "_enableFocusAddButton",
            "_enableClearButton"
        ];

        // Stub the methods
        var stubs = stubMethods(this.oManageAddCardWithSearch, methodsToStub);

        sinon.stub(this.oManageAddCardWithSearch, "_getTextBox").returns(oTextBox);
        sinon.stub(oTextBox, "setValue");
        sinon.stub(oNoCardMessage, "setDescription");
        sinon.stub(this.oManageAddCardWithSearch, "_getNoCardMessage").returns(oNoCardMessage);
        sinon.stub(this.oManageAddCardWithSearch, "_getSearchedCard").returns(oSearchedCard);
        sinon.stub(this.oManageAddCardWithSearch, "_getPlaceholder").returns(oSearchedCard);

        // Invoke the method
        this.oManageAddCardWithSearch.resetDialog(true);

        // Assertions
        assert.ok(this.oManageAddCardWithSearch._getTextBox.called, "_getTextBox called ");
        assert.ok(oTextBox.setValue.calledWith(""), "_getTextBox().setValue called with empty string");
        assert.ok(oNoCardMessage.setDescription.calledWith(" "), "_getNoCardMessage().setDescription called with space");
        assert.ok(stubs._toggleButtonAndText.calledWith(true), "_toggleButtonAndText called with true");
        assert.strictEqual(this.oManageAddCardWithSearch._startGenerate, false, "_startGenerate set to false");
        assert.ok(stubs._setMessageStripOverflowVisibility.calledWith(false), "_setMessageStripOverflowVisibility called with false");
        assert.ok(stubs.noHeaderNavigationBox.calledWith(false), "noHeaderNavigationBox called with false");

        const manifestChanges = {"/sap.card/header/dataTimestamp": ""};
        assert.ok(this.oManageAddCardWithSearch._getSearchedCard().setManifestChanges.calledWith([manifestChanges]), "_getSearchedCard().setManifestChanges called with manifestChanges");
        assert.ok(this.oManageAddCardWithSearch._getSearchedCard().setManifest.called, "_getSearchedCard().setManifest called ");
        assert.ok(this.oManageAddCardWithSearch._getSearchedCard().setPreviewMode.calledWith("Abstract"), "_getSearchedCard().setPreviewMode called with 'Abstract'");
        assert.ok(stubs._toggleCardBox.calledWith(true), "_toggleCardBox called with true");
        assert.ok(stubs._enableFocusAddButton.calledWith(false), "_enableFocusAddButton called with false");
        assert.ok(stubs._enableClearButton.calledWith(false), "_enableClearButton called with false");

        // Restore stubs
        this.oManageAddCardWithSearch._getTextBox.restore();
        this.oManageAddCardWithSearch._getNoCardMessage.restore();
        this.oManageAddCardWithSearch._getSearchedCard.restore();
        restoreStubs(stubs);
        this.oManageAddCardWithSearch.destroy();
    });

    QUnit.test("resetDialog - when bClose is false", function (assert) {

        this.oManageAddCardWithSearch.i18Bundle = {
            getText: function (key) {
                return key;
            }
        };

        // Stub the necessary methods
        var oTextBox = new TextArea();
        var oNoCardMessage = new IllustratedMessage();
        var oSearchedCard = {
            setManifestChanges: sinon.stub(),
            setManifest: sinon.stub(),
            setPreviewMode: sinon.stub(),
            setVisible: sinon.stub()
        };

         // List of methods to be stubbed
         var methodsToStub = [
            "_toggleButtonAndText",
            "_setMessageStripOverflowVisibility",
            "noHeaderNavigationBox",
            "_toggleCardBox",
            "_enableFocusAddButton",
            "_enableClearButton"
        ];

        // Stub the methods
        var stubs = stubMethods(this.oManageAddCardWithSearch, methodsToStub);
        sinon.stub(this.oManageAddCardWithSearch, "_getTextBox").returns(oTextBox);
        sinon.stub(oTextBox, "setValue");
        sinon.stub(oNoCardMessage, "setDescription");
        sinon.stub(this.oManageAddCardWithSearch, "_getNoCardMessage").returns(oNoCardMessage);
        sinon.stub(this.oManageAddCardWithSearch, "_getSearchedCard").returns(oSearchedCard);
        sinon.stub(this.oManageAddCardWithSearch, "_getPlaceholder").returns(oSearchedCard);

        // Invoke the method
        this.oManageAddCardWithSearch.resetDialog(false);

        // Assertions
        assert.ok(stubs._setMessageStripOverflowVisibility.calledWith(false), "_setMessageStripOverflowVisibility called with false");
        assert.ok(stubs.noHeaderNavigationBox.calledWith(false), "noHeaderNavigationBox called with false");

        const manifestChanges = {"/sap.card/header/dataTimestamp": ""};
        assert.ok(this.oManageAddCardWithSearch._getSearchedCard().setManifestChanges.calledWith([manifestChanges]), "_getSearchedCard().setManifestChanges called with manifestChanges");
        assert.ok(this.oManageAddCardWithSearch._getSearchedCard().setManifest.called, "_getSearchedCard().setManifest called");
        assert.ok(this.oManageAddCardWithSearch._getSearchedCard().setPreviewMode.calledWith("Abstract"), "_getSearchedCard().setPreviewMode called with 'Abstract'");
        assert.ok(stubs._toggleCardBox.calledWith(true), "_toggleCardBox called with true");
        assert.ok(stubs._enableFocusAddButton.calledWith(false), "_enableFocusAddButton called with false");
        assert.ok(stubs._enableClearButton.calledWith(false), "_enableClearButton called with false");

        // Ensure methods that should not be called when bClose is false are not called
        assert.ok(!oTextBox.setValue.called, "_getTextBox().setValue should not be called");
        assert.ok(!oNoCardMessage.setDescription.called, "_getNoCardMessage().setDescription should not be called");
        assert.ok(!stubs._toggleButtonAndText.called, "_toggleButtonAndText should not be called");

        // Restore stubs
        this.oManageAddCardWithSearch._getTextBox.restore();
        this.oManageAddCardWithSearch._getNoCardMessage.restore();
        this.oManageAddCardWithSearch._getSearchedCard.restore();
        restoreStubs(stubs);
        this.oManageAddCardWithSearch.destroy();
    });

    QUnit.test("setErrorMessage - test different error codes", function (assert) {
        var oManageAddCardWithSearch = new ManageAddCardWithSearch();
        oManageAddCardWithSearch.i18Bundle = {
            getText: sinon.stub()
        };

        // Define the expected messages
        this.oManageAddCardWithSearch.i18Bundle = {
            getText: function (key) {
                return key;
            }
        };


        var oIllusType = {
            type1: "sapIllus-UnableToLoad",
            type2: "sapIllus-NoSearchResults",
            type3: "sapIllus-NoData",
            type4: "sapIllus-UnableToUpload"
        };

        var oErr;
        var oMsg = {
            prefixCode: "10",
            message: "Some error message"
        };

        // Test case for prefixCode "10"
        oErr = oManageAddCardWithSearch.setErrorMessage(oMsg.prefixCode, oMsg.message);
        assert.strictEqual(oErr.type, oIllusType.type1, "Correct illustration type for prefixCode '10'");
        assert.ok(oManageAddCardWithSearch.i18Bundle.getText.calledWith("ERRORCODE_TITLE1"), "getText called with correct error title 'ERRORCODE_TITLE1'");

        // Test case for prefixCode "20"
        oErr = oManageAddCardWithSearch.setErrorMessage("20", "Some error message");
        assert.strictEqual(oErr.type, oIllusType.type2, "Correct illustration type for prefixCode '20'");
        assert.ok(oManageAddCardWithSearch.i18Bundle.getText.calledWith("ERRORCODE_TITLE2"), "getText called with correct error title 'ERRORCODE_TITLE2'");


        // Test case for prefixCode "30"
        oErr = oManageAddCardWithSearch.setErrorMessage("30", "Some error message");
        assert.strictEqual(oErr.type, oIllusType.type3, "Correct illustration type for prefixCode '30'");
        assert.ok(oManageAddCardWithSearch.i18Bundle.getText.calledWith("ERRORCODE_TITLE3"), "getText called with 'ERRORCODE_TITLE3'");

        // Test case for default case
        oErr = oManageAddCardWithSearch.setErrorMessage("40", "Some error message");
        assert.strictEqual(oErr.type, oIllusType.type4, "Correct illustration type for default case");
        assert.ok(oManageAddCardWithSearch.i18Bundle.getText.calledWith("ERRORCODE_TITLE4"), "getText called with  correct error title 'ERRORCODE_TITLE4'");
    });

    QUnit.module("ManageAddCardWithSearch - onChange", {
        beforeEach: function () {
            this.oSandbox = sinon.sandbox.create();
            this.oManageAddCardWithSearch = new ManageAddCardWithSearch();

            this.stubTextBox = {
                getValue: this.oSandbox.stub()
            };
            this.stubSetTextBoxValueState = this.oSandbox.stub(this.oManageAddCardWithSearch, "_setTextBoxValueState");
            this.stubEnableClearButton = this.oSandbox.stub(this.oManageAddCardWithSearch, "_enableClearButton");
            this.stubEnableRegenerateButton = this.oSandbox.stub(this.oManageAddCardWithSearch, "_enableRegenerateButton");
            this.stubResetDialog = this.oSandbox.stub(this.oManageAddCardWithSearch, "resetDialog");

            this.oSandbox.stub(this.oManageAddCardWithSearch, "_getTextBox").returns(this.stubTextBox);
        },

        afterEach: function () {
            this.oSandbox.restore();
        }
    });

    QUnit.test("onChange - Should reset dialog and clear value state when input is empty", function (assert) {
        this.stubTextBox.getValue.returns("    "); // whitespace only

        this.oManageAddCardWithSearch.onChange();

        assert.ok(this.stubEnableClearButton.calledWith(true), "Clear button enabled");
        assert.ok(this.stubEnableRegenerateButton.calledWith(false), "Regenerate button disabled");
        assert.ok(this.stubResetDialog.calledOnce, "resetDialog called");
    });

    QUnit.test("onChange - Should show 'Information' value state when input is below minimum length", function (assert) {
        this.stubTextBox.getValue.returns("a");
        var ValueState = coreLibrary.ValueState;
        this.oManageAddCardWithSearch.onChange();

        assert.ok(this.stubEnableClearButton.calledWith(true), "Clear button enabled");
        assert.ok(this.stubEnableRegenerateButton.calledWith(false), "Regenerate button disabled");
        assert.ok(this.stubSetTextBoxValueState.calledWith(ValueState.Information, "minLengthRequired"), "Information state set for short input");
    });

    QUnit.test("onChange - Should show 'Warning' value state when input exceeds max length", function (assert) {
        const longText = "a".repeat(501);
        this.stubTextBox.getValue.returns(longText);
        var ValueState = coreLibrary.ValueState;
        this.oManageAddCardWithSearch.onChange();

        assert.ok(this.stubEnableClearButton.calledWith(true), "Clear button enabled");
        assert.ok(this.stubEnableRegenerateButton.calledWith(false), "Regenerate button disabled");
        assert.ok(this.stubSetTextBoxValueState.calledWith(ValueState.Warning, "maxLengthExceeded"), "Warning state set for long input");
    });

    QUnit.test("onChange - Should clear value state when input is valid", function (assert) {
        this.stubTextBox.getValue.returns("Valid input");
        var ValueState = coreLibrary.ValueState;
        this.oManageAddCardWithSearch.onChange();

        assert.ok(this.stubEnableClearButton.calledWith(true), "Clear button enabled");
        assert.ok(this.stubEnableRegenerateButton.calledWith(true), "Regenerate button enabled");
        assert.ok(this.stubSetTextBoxValueState.calledWith(ValueState.None), "No value state for valid input");
    });

});