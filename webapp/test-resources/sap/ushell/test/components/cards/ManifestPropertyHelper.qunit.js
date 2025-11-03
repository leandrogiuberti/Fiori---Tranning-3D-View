// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.cards.ManifestPropertyHelper.js
 */
sap.ui.define([
    "sap/ushell/components/cards/ManifestPropertyHelper",
    "sap/ushell/utils/UrlParsing"
], (
    ManifestPropertyHelper,
    UrlParsing
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.sandbox.create();

    QUnit.module("extractCardData", {
        beforeEach: function () {
            this.URLParsing = {
                paramsToString: function () { }
            };

            // the insertion of the placeholders is tested in a different module
            sinon.stub(ManifestPropertyHelper, "_replaceDataWithPlaceholders");
        },
        afterEach: function () {
            sandbox.restore();
            ManifestPropertyHelper._replaceDataWithPlaceholders.restore();
        }
    });

    QUnit.test("extractCardData: Extract card data from manifest", function (assert) {
        const oManifest = {
            "sap.app": {
                tags: {
                    keywords: [
                        "foo",
                        "bar"
                    ]
                }
            },
            "sap.card": {
                header: {
                    title: "Sales Orders",
                    subTitle: "Static Data",
                    icon: {
                        src: "sap-icon://sales-order"
                    },
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "SalesOrder",
                            intentAction: "display",
                            intentParameters: {
                                a: 1000,
                                b: "foo"
                            }
                        }
                    }]
                }
            }
        };

        const oURLParameterStub = sinon.stub(UrlParsing, "urlParametersToString").returns("a=1000&b=foo");

        const oExpectedCardData = {
            bagProperties: {
                display_title_text: "Sales Orders",
                display_subtitle_text: "Static Data",
                display_search_keywords: "foo,bar"
            },
            tileConfiguration: JSON.stringify({
                display_icon_url: "sap-icon://sales-order",
                navigation_semantic_object: "SalesOrder",
                navigation_semantic_action: "display",
                navigation_semantic_parameters: "a=1000&b=foo",
                navigation_use_semantic_object: true,
                navigation_target_url: "#SalesOrder-display?a=1000&b=foo"
            })
        };

        const oCardData = ManifestPropertyHelper.extractCardData(oManifest);

        assert.deepEqual(oCardData.bagProperties, oExpectedCardData.bagProperties, "The bag properties were extracted from the manifest");
        assert.deepEqual(oCardData.tileConfiguration, oExpectedCardData.tileConfiguration, "The tile configuration was extracted from the manifest");
        assert.deepEqual(UrlParsing.urlParametersToString.getCall(0).args[0], { a: 1000, b: "foo" }, "The parameter conversion was called with the correct arguments");

        oURLParameterStub.restore();
    });

    QUnit.test("extractCardData: Extract card data from manifest when manifest is empty", function (assert) {
        const oManifest = {};

        const oExpectedCardData = {
            bagProperties: {
                display_title_text: undefined,
                display_subtitle_text: undefined,
                display_search_keywords: undefined
            },
            tileConfiguration: undefined
        };

        const oCardData = ManifestPropertyHelper.extractCardData(oManifest);

        assert.deepEqual(oCardData.bagProperties, oExpectedCardData.bagProperties, "The bag properties were extracted from the manifest");
        assert.deepEqual(oCardData.tileConfiguration, oExpectedCardData.tileConfiguration, "The tile configuration was extracted from the manifest");
    });

    QUnit.test("extractCardData: Extract card data from manifest when there are multiple actions", function (assert) {
        const oManifest = {
            "sap.card": {
                header: {
                    actions: [{
                        type: "foo"
                    }, {
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "SalesOrder",
                            intentAction: "display",
                            intentParameters: {
                                a: 1000,
                                b: "foo"
                            }
                        }
                    }]
                }
            }
        };

        const oURLParameterStub = sinon.stub(UrlParsing, "urlParametersToString").returns("a=1000&b=foo");

        const oExpectedCardData = {
            bagProperties: {
                display_title_text: undefined,
                display_subtitle_text: undefined,
                display_search_keywords: undefined
            },
            tileConfiguration: JSON.stringify({
                navigation_semantic_object: "SalesOrder",
                navigation_semantic_action: "display",
                navigation_semantic_parameters: "a=1000&b=foo",
                navigation_use_semantic_object: true,
                navigation_target_url: "#SalesOrder-display?a=1000&b=foo"
            })
        };

        const oCardData = ManifestPropertyHelper.extractCardData(oManifest);

        assert.deepEqual(oCardData.bagProperties, oExpectedCardData.bagProperties, "The bag properties were extracted from the manifest");
        assert.deepEqual(oCardData.tileConfiguration, oExpectedCardData.tileConfiguration, "The tile configuration was extracted from the manifest");
        assert.deepEqual(UrlParsing.urlParametersToString.getCall(0).args[0], { a: 1000, b: "foo" }, "The parameter conversion was called with the correct arguments");

        oURLParameterStub.restore();
    });

    QUnit.test("extractCardData: Extract card data from manifest when target url is provided", function (assert) {
        const oManifest = {
            "sap.card": {
                header: {
                    actions: [{
                        type: "foo"
                    }, {
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            url: "foo"
                        }
                    }]
                }
            }
        };

        const oExpectedCardData = {
            bagProperties: {
                display_title_text: undefined,
                display_subtitle_text: undefined,
                display_search_keywords: undefined
            },
            tileConfiguration: JSON.stringify({
                navigation_use_semantic_object: false,
                navigation_target_url: "foo"
            })
        };

        const oCardData = ManifestPropertyHelper.extractCardData(oManifest);

        assert.deepEqual(oCardData.bagProperties, oExpectedCardData.bagProperties, "The bag properties were extracted from the manifest");
        assert.deepEqual(oCardData.tileConfiguration, oExpectedCardData.tileConfiguration, "The tile configuration was extracted from the manifest");
    });

    QUnit.test("extractCardData: Extract card data from manifest when target url AND semantic object+action are provided", function (assert) {
        const oManifest = {
            "sap.card": {
                header: {
                    actions: [{
                        type: "foo"
                    }, {
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "SalesOrder",
                            intentAction: "display",
                            intentParameters: {
                                a: 1000,
                                b: "foo"
                            },
                            url: "foo"
                        }
                    }]
                }
            }
        };

        const oURLParameterStub = sinon.stub(UrlParsing, "urlParametersToString").returns("a=1000&b=foo");

        const oExpectedCardData = {
            bagProperties: {
                display_title_text: undefined,
                display_subtitle_text: undefined,
                display_search_keywords: undefined
            },
            tileConfiguration: JSON.stringify({
                navigation_semantic_object: "SalesOrder",
                navigation_semantic_action: "display",
                navigation_semantic_parameters: "a=1000&b=foo",
                navigation_use_semantic_object: false,
                navigation_target_url: "foo"
            })
        };

        const oCardData = ManifestPropertyHelper.extractCardData(oManifest);

        assert.deepEqual(oCardData.bagProperties, oExpectedCardData.bagProperties, "The bag properties were extracted from the manifest");
        assert.deepEqual(oCardData.tileConfiguration, oExpectedCardData.tileConfiguration, "The tile configuration was extracted from the manifest");
        assert.deepEqual(UrlParsing.urlParametersToString.getCall(0).args[0], { a: 1000, b: "foo" }, "The parameter conversion was called with the correct arguments");

        oURLParameterStub.restore();
    });

    QUnit.test("extractCardData: Extract card data from manifest when no intent based navigation is to be used and no target url is provided", function (assert) {
        const oManifest = {
            "sap.card": {
                header: {
                    actions: [{
                        type: "foo"
                    }, {
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentParameters: {
                                a: 1000,
                                b: "foo"
                            }
                        }
                    }]
                }
            }
        };

        const oURLParameterStub = sinon.stub(UrlParsing, "urlParametersToString").returns("a=1000&b=foo");

        const oExpectedCardData = {
            bagProperties: {
                display_title_text: undefined,
                display_subtitle_text: undefined,
                display_search_keywords: undefined
            },
            tileConfiguration: JSON.stringify({
                navigation_semantic_object: undefined,
                navigation_semantic_action: undefined,
                navigation_semantic_parameters: "a=1000&b=foo",
                navigation_use_semantic_object: undefined,
                navigation_target_url: undefined
            })
        };

        const oCardData = ManifestPropertyHelper.extractCardData(oManifest);

        assert.deepEqual(oCardData.bagProperties, oExpectedCardData.bagProperties, "The bag properties were extracted from the manifest");
        assert.deepEqual(oCardData.tileConfiguration, oExpectedCardData.tileConfiguration, "The tile configuration was extracted from the manifest");
        assert.deepEqual(UrlParsing.urlParametersToString.getCall(0).args[0], { a: 1000, b: "foo" }, "The parameter conversion was called with the correct arguments");

        oURLParameterStub.restore();
    });

    QUnit.module("ManifestPropertyHelper");

    QUnit.test("replaceDataWithPlaceholders: replace manifest data with placeholders", function (assert) {
        const oManifest = {
            "sap.app": {
                tags: {
                    keywords: [
                        "foo",
                        "bar"
                    ]
                }
            },
            "sap.card": {
                header: {
                    title: "Sales Orders",
                    subTitle: "Static Data",
                    icon: {
                        src: "sap-icon://sales-order"
                    },
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "SalesOrder",
                            intentAction: "display",
                            intentParameters: {
                                a: 1000,
                                b: "foo"
                            }
                        }
                    }]
                }
            }
        };

        const oExpectedManifest = {
            "sap.app": {
                tags: {
                    keywords: "<keywords>"
                }
            },
            "sap.card": {
                header: {
                    title: "<title>",
                    subTitle: "<subtitle>",
                    icon: {
                        src: "<icon>"
                    },
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "<semantic object>",
                            intentAction: "<action>",
                            intentParameters: "<parameters>"
                        }
                    }]
                }
            }
        };

        const oActualManifest = ManifestPropertyHelper._replaceDataWithPlaceholders(oManifest);

        assert.deepEqual(oActualManifest, oExpectedManifest, "The manifest properties were replaced by placeholders");
        assert.notStrictEqual(oActualManifest, oExpectedManifest, "The manifest was copied");
    });

    QUnit.test("replaceDataWithPlaceholders: don't add a property with placeholder if the property is not present", function (assert) {
        const oManifest = {};
        const oExpectedManifest = {};

        const oActualManifest = ManifestPropertyHelper._replaceDataWithPlaceholders(oManifest);

        assert.deepEqual(oActualManifest, oExpectedManifest, "No manifest properties with placeholders were added");
    });

    QUnit.test("mergeCardData: Merge card data with manifest", function (assert) {
        const oCardData = {
            display_title_text: "Sales Orders",
            display_subtitle_text: "Static Data",
            display_search_keywords: "foo,bar",
            display_icon_url: "sap-icon://sales-order",
            navigation_semantic_object: "SalesOrder",
            navigation_target_url: "#SalesOrder-display?a=1000&b=foo",
            navigation_semantic_action: "display",
            navigation_semantic_parameters_as_object: { a: 1000, b: "foo" }
        };

        const oManifest = {
            "sap.app": {
                tags: {
                    keywords: "<keywords>"
                }
            },
            "sap.card": {
                header: {
                    title: "<title>",
                    subTitle: "<subtitle>",
                    icon: {
                        src: "<icon>"
                    },
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "<semantic object>",
                            intentAction: "<action>",
                            intentParameters: "<parameters>"
                        }
                    }]
                }
            }
        };

        const oExpectedManifest = {
            "sap.app": {
                tags: {
                    keywords: [
                        "foo",
                        "bar"
                    ]
                }
            },
            "sap.card": {
                header: {
                    title: "Sales Orders",
                    subTitle: "Static Data",
                    icon: {
                        src: "sap-icon://sales-order"
                    },
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            intentSemanticObject: "SalesOrder",
                            intentAction: "display",
                            intentParameters: {
                                a: 1000,
                                b: "foo"
                            }
                        }
                    }]
                }
            }
        };

        const oMergedManifest = ManifestPropertyHelper.mergeCardData(oManifest, oCardData);

        assert.deepEqual(oMergedManifest, oExpectedManifest, "Card data was merged into manifest");
    });

    QUnit.test("mergeCardData: Merge card data with manifest when a URL is specified instead of intent based navigation", function (assert) {
        const oCardData = {
            navigation_target_url: "http://www.sap.com"
        };

        const oManifest = {
            "sap.card": {
                header: {
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            url: "<url>"
                        }
                    }]
                }
            }
        };

        const oExpectedManifest = {
            "sap.card": {
                header: {
                    actions: [{
                        type: "Navigation",
                        enabled: true,
                        service: "IntentBasedNavigation",
                        parameters: {
                            url: "http://www.sap.com"
                        }
                    }]
                }
            }
        };

        const oMergedManifest = ManifestPropertyHelper.mergeCardData(oManifest, oCardData);

        assert.deepEqual(oMergedManifest, oExpectedManifest, "Card data was merged into manifest");
    });

    QUnit.test("mergeCardData: Merge card data with manifest when properties don't exist in manifest", function (assert) {
        const oCardData = {
            display_title_text: "Sales Orders",
            display_subtitle_text: "Static Data",
            display_search_keywords: "foo,bar"
        };

        const oManifest = {};

        const oExpectedManifest = {
            "sap.app": {
                tags: {
                    keywords: [
                        "foo",
                        "bar"
                    ]
                }
            },
            "sap.card": {
                header: {
                    title: "Sales Orders",
                    subTitle: "Static Data"
                }
            }
        };

        const oMergedManifest = ManifestPropertyHelper.mergeCardData(oManifest, oCardData);

        assert.deepEqual(oMergedManifest, oExpectedManifest, "Card data was merged into manifest");
    });

    QUnit.test("mergeCardData: Merge card data with manifest when properties don't exist in the card data", function (assert) {
        const oCardData = {};

        const oManifest = {
            "sap.card": {
                header: {
                    title: "Sales Orders untranslated",
                    subTitle: "Static Data untranslated"
                }
            }
        };

        const oExpectedManifest = {
            "sap.card": {
                header: {
                    title: "Sales Orders untranslated",
                    subTitle: "Static Data untranslated"
                }
            }
        };

        const oMergedManifest = ManifestPropertyHelper.mergeCardData(oManifest, oCardData);

        assert.deepEqual(oMergedManifest, oExpectedManifest, "The properties in the manifest are not set to undefined");
    });

    QUnit.test("getTranslatablePropertiesFromBag returns the expected texts when title and subtitle are available", function (assert) {
        // Arrange
        const oBag = {
            getTextNames: sinon.stub(),
            getText: sinon.stub()
        };
        const oExpectedResult = {
            display_title_text: "Some Title",
            display_subtitle_text: "Some Subtitle"
        };

        oBag.getTextNames.returns(["display_title_text", "display_subtitle_text"]);
        oBag.getText.withArgs("display_title_text").returns("Some Title");
        oBag.getText.withArgs("display_subtitle_text").returns("Some Subtitle");
        oBag.getText.withArgs("display_search_keywords").returns("display_search_keywords");

        // Act
        const oResult = ManifestPropertyHelper.getTranslatablePropertiesFromBag(oBag);

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "The expected texts were returned");
    });

    QUnit.test("getTranslatablePropertiesFromBag returns the expected texts when title, subtitle and search keywords are available", function (assert) {
        // Arrange
        const oBag = {
            getTextNames: sinon.stub(),
            getText: sinon.stub()
        };
        const oExpectedResult = {
            display_title_text: "Some Title",
            display_subtitle_text: "Some Subtitle",
            display_search_keywords: "Some,Seach,Keywords,Separated,By,Comma"
        };

        oBag.getTextNames.returns(["display_title_text", "display_subtitle_text", "display_search_keywords"]);
        oBag.getText.withArgs("display_title_text").returns("Some Title");
        oBag.getText.withArgs("display_subtitle_text").returns("Some Subtitle");
        oBag.getText.withArgs("display_search_keywords").returns("Some,Seach,Keywords,Separated,By,Comma");

        // Act
        const oResult = ManifestPropertyHelper.getTranslatablePropertiesFromBag(oBag);

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "The expected texts were returned");
    });

    QUnit.test("getTranslatablePropertiesFromBag returns empty when no texts are available", function (assert) {
        // Arrange
        const oBag = {
            getTextNames: sinon.stub(),
            getText: sinon.stub()
        };
        const oExpectedResult = {};

        oBag.getTextNames.returns([]);
        oBag.getText.withArgs("display_title_text").returns("display_title_text");
        oBag.getText.withArgs("display_subtitle_text").returns("display_subtitle_text");
        oBag.getText.withArgs("display_search_keywords").returns("display_search_keywords");

        // Act
        const oResult = ManifestPropertyHelper.getTranslatablePropertiesFromBag(oBag);

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "The expected texts were returned");
    });

    QUnit.test("getTranslatablePropertiesFromBag returns empty when no bag was provided", function (assert) {
        // Arrange
        const oExpectedResult = {};

        // Act
        const oResult = ManifestPropertyHelper.getTranslatablePropertiesFromBag();

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "The expected texts were returned");
    });

    QUnit.test("getCardData: get the card data from the chip instance's bag and config in the FLPD", function (assert) {
        const oTileConfiguration = {
            navigation_semantic_object: "SemanticObject",
            navigation_semantic_parameters: "a=1000&b=foo"
        };
        const sTileConfiguration = JSON.stringify(oTileConfiguration);
        const oBag = {
            getTextNames: sinon.stub().returns(["display_title_text"]),
            getText: sinon.stub().withArgs("display_title_text").returns("title")
        };
        const oChipInstance = {
            bag: {
                getBag: sinon.stub().withArgs("tileProperties").returns(oBag)
            },
            configuration: {
                getParameterValueAsString: sinon.stub().withArgs("tileConfiguration").returns(sTileConfiguration)
            }
        };
        sinon.stub(ManifestPropertyHelper, "_parseParameters").withArgs("a=1000&b=foo").returns({ a: 1000, b: "foo" });

        const oExpectedCardData = {
            display_title_text: "title",
            navigation_semantic_object: "SemanticObject",
            navigation_semantic_parameters: "a=1000&b=foo",
            navigation_semantic_parameters_as_object: {
                a: 1000,
                b: "foo"
            }
        };

        const oCardData = ManifestPropertyHelper.getCardData(oChipInstance);

        assert.deepEqual(oCardData, oExpectedCardData);
    });

    QUnit.test("getCardData: get the card data from the chip instance's bag and config in the FLP", function (assert) {
        const sTileConfiguration = JSON.stringify({ intent_semantic_object: "SemanticObject" });
        const oBag = {
            getTextNames: sinon.stub().returns(["display_title_text"]),
            getText: sinon.stub().withArgs("display_title_text").returns("title")
        };
        const oChipInstance = {
            getBag: sinon.stub().withArgs("tileProperties").returns(oBag),
            getConfigurationParameter: sinon.stub().withArgs("tileConfiguration").returns(sTileConfiguration)
        };

        const oExpectedCardData = {
            display_title_text: "title",
            intent_semantic_object: "SemanticObject"
        };

        const oCardData = ManifestPropertyHelper.getCardData(oChipInstance);

        assert.deepEqual(oCardData, oExpectedCardData);
    });
});
