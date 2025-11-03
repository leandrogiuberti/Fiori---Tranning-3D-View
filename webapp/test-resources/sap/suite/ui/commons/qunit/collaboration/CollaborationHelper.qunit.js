/*global sap, QUnit, sinon*/
sap.ui.define([
    "sap/suite/ui/commons/collaboration/CollaborationHelper",
    "sap/ui/core/Lib",
    "sap/suite/ui/commons/windowmessages/CollaborationMessageConsumer"
], function (CollaborationHelper, Library, CollaborationMessageConsumer){

    var longURL = "https://host.abc.com/ui#PurchaseOrder-manage&/?sap-iapp-state--history=TASLUM48KWGGA7ZEWUQL9KI1NW3KWFGEIKXWBSZ2O&sap-iapp-state=ASJD635429RBLG9X60V80WOJ4LZX93QQHAM6IHPE";
    var sURLWithoutSO = "https://host.abc.com/ui";
    var sURLWithoutBackendPersistency = "https://host/ui?sap-ushell-config=lean&sap-collaboration-teams=true#PurchaseOrder-manage&info=abc";

    QUnit.module("CollaborationHelper", {
		beforeEach: function() {
            var oMockContainer = {
                getServiceAsync: function (params) {
                    if (params === "URLParsing"){
                        return Promise.resolve({
                            parseParameters: function() {
                                return {
                                    "sap-collaboration-teams":["true"],
                                    "sap-ushell-config": ["lean"]
                                };
                            },
                            parseShellHash: function() {
                                return {
                                    contextRaw:'contextRaw',
                                    semanticObject:'semanticObject',
                                    action:'action'
                                };
                            }
                        });
                    } else {
                        return Promise.resolve({
                            createEmptyAppState: function () {
                                return {
                                    getKey: function () {
                                        return "ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T";
                                    }
                                };
                            },
                            getAppState: function () {
                                return Promise.resolve(longURL);
                            },
                            _oConfig: {
                                "transient": false
                            }
                        });
                    }
                },
                getFLPUrlAsync: function() {
                    return new jQuery.Deferred().resolve(longURL).promise();
                },
                getService: function(params) {
                    if (params === "URLParsing"){
                        return {
                            parseParameters: function() {
                                return {
                                    "sap-collaboration-teams":["true"],
                                    "sap-ushell-config": ["lean"]
                                };
                            },
                            parseShellHash: function() {
                                return {
                                    contextRaw:'contextRaw',
                                    semanticObject:'semanticObject',
                                    action:'action'
                                };
                            }
                        };
                    }
                },
                inAppRuntime: function() {
					return false;
				}
            };
            var byId = function () {
                return {
                    setVisible: function() {}
                };
            };
			this.oSandbox = sinon.sandbox.create();
            this.oLibraryStub = this.oSandbox.stub(Library, "isLoaded").returns(true);
            this.oRequireStub = this.oSandbox.stub(sap.ui, "require");
            this.oRequireStub.withArgs('sap/ushell/Container').returns(oMockContainer);
		},
		afterEach: function() {
			this.oSandbox.restore();
            this.oRequireStub.restore();
            this.oLibraryStub.restore();
		}
	});

    QUnit.test("Compact hash - Negative Scenario: When backend persistency toggle is not enabled.", function(assert) {
        //Arrange
        var oMockContainerAtTest = {
            getServiceAsync: function () {
                return Promise.resolve({
                    createEmptyAppState: function () {
                        return {
                            getKey: function () {
                                return "ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T";
                            }
                        };
                    },
                    _oConfig: {
                        "transient": true
                    }
                });
            }
        };
        this.oRequireStub.withArgs('sap/ushell/Container').returns(oMockContainerAtTest);
        //Act
        return CollaborationHelper.compactHash(longURL).then(function(shortURL){
            //Assert
            assert.ok(typeof shortURL === "object","CompactHash should have returned an object.");
            assert.equal(longURL,shortURL.url,'Url is not minified as the system does not support appstate persistency.');
        });
    });

    QUnit.test("Compact hash - Negative Scenario: When semantic object and action is not defined.", function(assert) {
        var oMockContainerAtTest =  {
            getServiceAsync: function (params) {
                if (params === "URLParsing"){
                    return Promise.resolve({
                        parseShellHash: function() {
                            return undefined;
                        }
                    });
                } else {
                    return Promise.resolve({
                        createEmptyAppState: function () {
                            return {
                                getKey: function () {
                                    return "ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T";
                                }
                            };
                        },
                        getAppState: function () {
                            return Promise.resolve(longURL);
                        },
                        _oConfig: {
                            "transient": false
                        }
                    });
                }
            }
        };
        this.oRequireStub.withArgs('sap/ushell/Container').returns(oMockContainerAtTest);
        //Act
        return CollaborationHelper.compactHash(sURLWithoutSO).then(function(shortURL){
            //Assert
            assert.ok(typeof shortURL === "object","CompactHash should have returned an object.");
            assert.equal(sURLWithoutSO,shortURL.url,'longURL should be equal to the shortened URL');
        });
    });

    QUnit.test("Compact hash - Positive Scenario: When saving the URL is successfull.", function(assert) {
        //Arrange
        var sExpectedURL = "https://host.abc.com/ui#PurchaseOrder-manage&/sap-url-hash=ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T";
        this.oSandbox.stub(CollaborationHelper,"_getNextKey").returns('ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T');
        this.oSandbox.stub(CollaborationHelper,"_isMinificationFeasible").returns(true);
        this.oSandbox.stub(CollaborationHelper,"_extractURLBeforeHash").returns("https://host.abc.com/ui");
        this.oSandbox.stub(CollaborationHelper,"_extractSemanticObjectAndAction").returns("PurchaseOrder-manage");
        this.oSandbox.stub(CollaborationHelper,"_storeUrl").returns(Promise.resolve());
        //Act
        return CollaborationHelper.compactHash(longURL).then(function(shortURL){
            //Assert
            assert.ok(typeof shortURL === "object","CompactHash should have returned an object.");
            assert.equal(sExpectedURL,shortURL.url,'URL Minified');
        });
    });

    QUnit.test("GetCurrentUrl - When getting the current url via shell Container",function(assert) {
        //Act
        return CollaborationHelper._getCurrentUrl().then(function(currentUrl){
            //Assert
            assert.equal(longURL,currentUrl,'Able to get Current URL');
        });
    });

    QUnit.test("IsTeamsModeActive - Positive Scenario: When appstate is lean and app is running in teams", function(assert) {
        //Arange
        var sExpectedURL = "https://host:port/ui?sap-collaboration-teams=true&sap-ushell-config=lean#sematicobject-action&/";
        this.oSandbox.stub(CollaborationHelper,"_getCurrentUrl").returns(Promise.resolve(sExpectedURL));
        //Act
        return CollaborationHelper.isTeamsModeActive().then(function(result){
            //Assert
            assert.ok(result, true,"App should be running in Teams environment");
        });
    });

    QUnit.test("RetrieveURL - Positive case",function(assert){
        //Act
        return CollaborationHelper._retrieveURL().then(function(data){
            //Assert
            assert.equal(data,longURL, "Retrive URL successfully");
        });
    });

    QUnit.test("IsEligibleForBackendPersistency - Positive case",function(assert){
        //Arrange
        var oAppStateInstance = { _oConfig:{"transient": false}};
        //Act
        var result =  CollaborationHelper._isEligibleForBackendPersistency(oAppStateInstance);
        //Assert
        assert.equal(result,true);
    });

    QUnit.test("GetNextKey - Positive case",function(assert){
        //Arrange
        var oAppStateInstance = {getKey:function(){
            return 'ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T';
        }};
        //Act
        var key = CollaborationHelper._getNextKey(oAppStateInstance);
        //Assert
        assert.equal(key,'ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T');
    });
    QUnit.test("ExtractSemanticObjectAndAction", async function(assert){
        var oMockContainerAtTest = {
            getServiceAsync: function(params) {
                if (params === "URLParsing"){
                    return Promise.resolve({
                        parseShellHash: function() {
                            return {
                                contextRaw:'contextRaw',
                                semanticObject:'semanticObject',
                                action:'action'
                            };
                        }
                    });
                }
            }
        };
        this.oRequireStub.withArgs('sap/ushell/Container').returns(oMockContainerAtTest);
        var oParsedShellHash = await CollaborationHelper._extractSemanticObjectAndAction(longURL);
        assert.equal(oParsedShellHash, "semanticObject-action~contextRaw", "extracted semantic object, action and the context.");
    });

    QUnit.test("ExtractURLBeforeHash - Positive case where URL before the hash is returned successfully",function(assert){
        var sUrl = "https://host:port/?ui#sematicobject-action&/?sap-url-hash=ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T";
        var sUrlBeforeHash = CollaborationHelper._extractURLBeforeHash(sUrl);
        assert.ok(sUrlBeforeHash);
        assert.equal(sUrlBeforeHash,"https://host:port/?ui");
    });

    QUnit.test("ExtractURLHash - Positive case where hash of the url is returned successfully", function(assert){
        var sUrl = "https://host:port/?ui#sematicobject-action&/?sap-url-hash=ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T";
        var sUrlHash = CollaborationHelper._extractURLHash(sUrl);
        assert.ok(sUrlHash);
        assert.equal(sUrlHash, '#sematicobject-action&/?sap-url-hash=ASLNEL23BUZSMF8KM0Q0V1HVJ3ZAH5Y1LR4PZG8T');
    });

    QUnit.test("storeURL - Positive case when the url is saved successfully in the backend persistency", function(assert){
        var oAppStateService = {
            setData:function() {
                return;
            },
            save:function(){
                return true;
            }
        };
        var result = CollaborationHelper._storeUrl(longURL,oAppStateService);
        assert.ok(result);
    });

    QUnit.test("processAndExpandHash - with &sap-ui-cardTitle param", function(assert) {
        const sUrlWithSpecialParam = "https://host/ui#semanticObject-action&/&sap-ui-cardTitle=XYZ";
        const sExpectedSanitizedUrl = "https://host/ui#semanticObject-action&/";
        this.oSandbox.stub(CollaborationHelper, "_getCurrentUrl").returns(Promise.resolve(sUrlWithSpecialParam));
        const sanitizeStub = this.oSandbox.stub(CollaborationHelper, "_redirectBasedOnRuntime");

        return CollaborationHelper.processAndExpandHash().then(function() {
            assert.ok(sanitizeStub.calledOnce, "_redirectBasedOnRuntime should be called");
            assert.equal(sanitizeStub.firstCall.args[0], sExpectedSanitizedUrl, "URL should be truncated before sap-ui-cardTitle");
        });
    });

    QUnit.test("processAndExpandHash - with &info param from Teams", function(assert){
        const sUrl = sURLWithoutBackendPersistency;
        const sRemoveInfoParamUrl = "https://host/ui?sap-ushell-config=lean&sap-collaboration-teams=true#PurchaseOrder-manage";
        this.oSandbox.stub(CollaborationHelper, "_getCurrentUrl").returns(Promise.resolve(sUrl));
        const stub = this.oSandbox.stub(CollaborationHelper, "_redirectBasedOnRuntime");

        return CollaborationHelper.processAndExpandHash().then(function(){
            assert.ok(stub.calledOnce, "_redirectBasedOnRuntime should be called");
            assert.equal(stub.firstCall.args[0], sRemoveInfoParamUrl, "info param should be removed and correct URL used");
        });
    });

    QUnit.test("processAndExpandHash - with &info param not from Teams", function(assert){
        const sUrl = "https://host/ui?sap-ushell-config=lean#PurchaseOrder-manage";
        this.oSandbox.stub(CollaborationHelper, "_getCurrentUrl").returns(Promise.resolve(sUrl));
        const stub = this.oSandbox.stub(CollaborationHelper, "_redirectBasedOnRuntime");

        return CollaborationHelper.processAndExpandHash().then(function(){
            assert.notOk(stub.calledOnce, "_redirectBasedOnRuntime should not be called");
        });
    });

    QUnit.test("redirectBasedOnRuntime - in AppRuntime", async function(assert){
        const sUrl = sURLWithoutBackendPersistency;
        const consumerStub = this.oSandbox.stub(CollaborationMessageConsumer, "updateTopLevelURLforAppRuntime").returns(Promise.resolve());
        this.oRequireStub.withArgs('sap/ushell/Container').returns({
            inAppRuntime: () => true
        });
        this.oRequireStub.withArgs("../windowmessages/CollaborationMessageConsumer").returns(consumerStub);

        await CollaborationHelper._redirectBasedOnRuntime(sUrl);
        assert.ok(consumerStub.calledWith(sUrl), "updateTopLevelURLforAppRuntime should be called when running in AppRuntime");
    });

   QUnit.test("removeTeamsParams - remove sap-ushell-config, sap-collaboration-teams and sap-ui-fesr-env", function (assert) {
		const sUrl = "https://host/app?sap-ushell-config=lean&sap-collaboration-teams=true&sap-ui-fesr-env=prod&abc=123#hash";
		const expectedUrl = "https://host/app?abc=123#hash";

		const result = CollaborationHelper._removeTeamsParams(sUrl);
		assert.equal(result, expectedUrl, "Teams params sap-ushell-config, sap-collaboration-teams and sap-ui-fesr-env removed when open the link in S4 system");
	});

	QUnit.test("removeTeamsParams - remove only sap-collaboration-teams", function (assert) {
		const sUrl = "https://host/app?sap-collaboration-teams=true&abc=123#section";
		const expectedUrl = "https://host/app?abc=123#section";

		const result = CollaborationHelper._removeTeamsParams(sUrl);
		assert.equal(result, expectedUrl, "Only sap-collaboration-teams removed");
	});

	QUnit.test("removeTeamsParams - return original URL if no query params", function (assert) {
		const sUrl = "https://host/app#hash";
		const result = CollaborationHelper._removeTeamsParams(sUrl);
		assert.equal(result, sUrl, "URL without query remains unchanged");
	});

	QUnit.test("removeTeamsParams - handle errors gracefully", function (assert) {
		const sUrl = null;
		const result = CollaborationHelper._removeTeamsParams(sUrl);
		assert.equal(result, sUrl, "Returns original input on error");
	});

    QUnit.test("stripTeamsParams - removes params when not in iframe (is top window)", function (assert) {
        this.oSandbox.stub(CollaborationHelper, "_isTopWindow").returns(true);

		const sUrl = "https://host/app?sap-collaboration-teams=true#hash";
		const expectedUrl = "https://host/app#hash";

		const result = CollaborationHelper._stripTeamsParams(sUrl);
		assert.equal(result, expectedUrl, "Params were removed");
	});

	QUnit.test("stripTeamsParams - does not remove params when in iframe", function (assert) {
		this.oSandbox.stub(CollaborationHelper, "_isTopWindow").returns(false);

		const sUrl = "https://host/app?sap-collaboration-teams=true#hash";
		const result = CollaborationHelper._stripTeamsParams(sUrl);

		assert.equal(result, sUrl, "Params were not removed");
	});
});