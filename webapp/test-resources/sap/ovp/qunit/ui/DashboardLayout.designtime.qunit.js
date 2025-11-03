sap.ui.define([
    "sap/ovp/ui/DashboardLayout.designtime",
    "sap/ovp/ui/ComponentContainerDesigntimeMetadata",
    "sap/ovp/app/resources",
    "sap/ui/core/Element",
    "test-resources/sap/ovp/qunit/cards/utils",
    "test-resources/sap/ovp/mockservers",
    "sap/ui/core/mvc/Controller",
    "sap/ui/dt/OverlayRegistry",
    "sap/ui/dt/plugin/ElementMover",
    "sap/ui/dt/ElementUtil",
    "sap/ui/model/json/JSONModel",
    "sap/ovp/cards/CommonUtils",
    "sap/ovp/flexibility/changeHandler/PersonalizationChangeHandler",
    "sap/ui/fl/apply/_internal/flexObjects/UIChange"
], function (
    DashboardLayoutDesigntime,
    ComponentContainerDesigntimeMetadata,
    OvpResources,
    Element,
    utils,
    mockservers,
    Controller,
    OverlayRegistry,
    ElementMover,
    ElementUtil,
    JSONModel,
    CommonUtils,
    PersonalizationChangeHandler,
    UIChange
) {
    "use strict";

    var testContainer;
    var oController;
    var CardController;

    QUnit.module("DashboardLayout.designtime", {
        beforeEach: function () {
            mockservers.loadMockServer(utils.odataBaseUrl_salesOrder, utils.odataRootUrl_salesOrder);
            mockservers.loadMockServer(utils.odataBaseUrl_salesShare, utils.odataRootUrl_salesShare);
            document.body.insertAdjacentHTML("beforeend", '<div id="testContainer" style="display: none;">');
            testContainer = document.querySelector("#testContainer");
            var workingArea = '<div id="root">' + '<div id="container"> </div>' + "</div>";
            document.body.insertAdjacentHTML("beforeend", workingArea);
            var pCardController = Controller.create({
                name: "sap.ovp.cards.generic.Card"
            }).then(function (controller) {
                CardController = controller;
            });
            var pController = Controller.create({
                name: "sap.ovp.cards.list.List"
            }).then(function (controller) {
                oController = controller;
            });
            return Promise.all([pCardController, pController])
                .then(function (values) {
                    return values;
                });
        },
        afterEach: function () {
            mockservers.close();
            testContainer.parentNode.removeChild(testContainer);
            oController.destroy();
        }
    });

    QUnit.test("Verify actions metadata", function (assert) {
        assert.ok(DashboardLayoutDesigntime.actions, "Actions metadata is defined");
        assert.strictEqual(typeof DashboardLayoutDesigntime.actions, "object", "Actions metadata is an object");
    });

    QUnit.test("Verify aggregations metadata", function (assert) {
        assert.ok(DashboardLayoutDesigntime.aggregations, "Aggregations metadata is defined");
        assert.ok(DashboardLayoutDesigntime.aggregations.content, "Content aggregation is defined");
        assert.strictEqual(
            DashboardLayoutDesigntime.aggregations.content.domRef,
            ".sapUiComponentContainer",
            "Content aggregation domRef is correct"
        );
    });

    QUnit.test("Verify propagateMetadata logic", function (assert) {
        var oMockElement = new Element();
        sinon.stub(oMockElement.getMetadata(), "getName").returns("sap.ui.core.ComponentContainer");

        var result = DashboardLayoutDesigntime.aggregations.content.propagateMetadata(oMockElement);
        assert.strictEqual(
            result,
            ComponentContainerDesigntimeMetadata,
            "propagateMetadata returns correct metadata for ComponentContainer"
        );

        oMockElement.getMetadata().getName.returns("sap.ui.core.OtherElement");
        result = DashboardLayoutDesigntime.aggregations.content.propagateMetadata(oMockElement);
        assert.deepEqual(
            result,
            { actions: "not-adaptable" },
            "propagateMetadata returns 'not-adaptable' for other elements"
        );
    });

    QUnit.test("Verify name metadata", function (assert) {
        sinon.stub(OvpResources, "getText").withArgs("Card").returns("Card").withArgs("Cards").returns("Cards");

        assert.strictEqual(DashboardLayoutDesigntime.name.singular, "Card", "Singular name is correct");
        assert.strictEqual(DashboardLayoutDesigntime.name.plural, "Cards", "Plural name is correct");

        OvpResources.getText.restore();
    });

    QUnit.test("Check the changes getting created when cut and paste is executed", function (assert) {
        var cardTestData1 = {
            card: {
                id: "card_17",
                model: "salesOrder",
                template: "sap.ovp.cards.list",
                settings: {
                    title: "Reorder Soon 1",
                    subTitle: "Less than 10 in stock",
                    listType: "extended",
                    entitySet: "SalesOrderLineItemSet",
                },
            },
            dataSource: {
                baseUrl: utils.odataBaseUrl_salesOrder,
                rootUri: utils.odataRootUrl_salesOrder,
                annoUri: utils.testBaseUrl + "data/annotations.xml",
            },
        };
        var cardTestData = {
            card: {
                id: "card_16",
                model: "salesOrder",
                template: "sap.ovp.cards.list",
                settings: {
                    title: "Reorder Soon",
                    subTitle: "Less than 10 in stock",
                    listType: "extended",
                    entitySet: "SalesOrderLineItemSet",
                },
            },
            dataSource: {
                baseUrl: utils.odataBaseUrl_salesOrder,
                rootUri: utils.odataRootUrl_salesOrder,
                annoUri: utils.testBaseUrl + "data/annotations.xml",
            },
        };

        var oModelViewMap = {
            "salesOrder": {
                "card_1": true,
                "card_2": true
            }
        };

        var oModel = utils.createCardModel(cardTestData);
        var fnDone = assert.async();
        var oMockElement = new Element();

        var uiModel = new JSONModel({
            containerLayout: "resizable",
        });

        utils.createCardView(cardTestData, oModel, oModelViewMap, "salesOrder").then(function (oView) {
            utils.createCardView(cardTestData1, oModel, oModelViewMap, "salesOrder").then(function (oView1) {
                var oController = oView.getController();
                var oMainComponent = oController.getOwnerComponent().getComponentData().mainComponent;
                oMainComponent._getCardFromManifest = function () {
                    return {
                        "model": "salesOrder",
                        "template": "sap.ovp.cards.list",
                        "settings": {
                            "addODataSelect": false,
                            "annotationPath": "com.sap.vocabularies.UI.v1.LineItem#ordOverView",
                            entitySet: "SalesOrderLineItemSet",
                            listType: "extended",
                            subTitle: "Less than 10 in stock",
                            title: "Reorder Soon"
                        },
                        "id": "card_16"
                    };
                };
                oMainComponent.getLayout = sinon.stub().returns({
                    getDashboardLayoutModel: function () {
                        return {
                            getCardById: function (sCardId) {
                                if (sCardId === "card_16") {
                                    return {
                                        dashboardLayout: {
                                            "rowSpan": 30,
                                            "colSpan": 1,
                                            "maxColSpan": 1,
                                            "noOfItems": 5,
                                            "autoSpan": true,
                                            "visible": true,
                                            "itemHeight": 48,
                                            "headerHeight": 85,
                                            "column": 1,
                                            "row": 1,
                                            "top": "0px",
                                            "width": "329.6px",
                                            "height": "480px",
                                            "left": "0px",
                                            "containerLayout": "resizable",
                                            "iRowHeightPx": 16,
                                            "iCardBorderPx": 8
                                        }
                                    };
                                }
                                return {
                                    dashboardLayout: {
                                        "rowSpan": 47,
                                        "colSpan": 1,
                                        "maxColSpan": 1,
                                        "noOfItems": 0,
                                        "autoSpan": true,
                                        "visible": true,
                                        "itemHeight": 0,
                                        "headerHeight": 140,
                                        "column": 5,
                                        "row": 1,
                                        "top": "0px",
                                        "width": "329.6px",
                                        "height": "752px",
                                        "left": "1318.4px",
                                        "containerLayout": "resizable",
                                        "iRowHeightPx": 16,
                                        "iCardBorderPx": 8
                                    }
                                }
                            },
                            getColCount: sinon.stub().returns(5),
                            _arrangeCards: function (oSourceCardObj, object, type, affectedCards) {
                                affectedCards.push({
                                    content: {
                                        cardId: "card_16",
                                        dashboardLayout: {
                                            "rowSpan": 30,
                                            "colSpan": 1,
                                            "maxColSpan": 1,
                                            "noOfItems": 5,
                                            "autoSpan": true,
                                            "visible": true,
                                            "itemHeight": 48,
                                            "headerHeight": 85,
                                            "column": 1,
                                            "row": 1,
                                            "top": "0px",
                                            "width": "329.6px",
                                            "height": "480px",
                                            "left": "0px",
                                            "containerLayout": "resizable",
                                            "iRowHeightPx": 16,
                                            "iCardBorderPx": 8
                                        }
                                    }
                                });
                            },
                            _removeSpaceBeforeCard: function () { }
                        }
                    }
                });
                oMainComponent.getUIModel = sinon.stub().returns(uiModel);
                oMainComponent._getCardId = function (sCardId) {
                    return sCardId === "card_16" ? "card_16" : "card_17";
                };

                oController.getComponentData = function () {
                    return oController.getOwnerComponent().getComponentData();
                };
                oMockElement.getComponentInstance = function () {
                    return oController;
                };
                oMockElement.getMetadata = function () {
                    return {
                        getName: function () {
                            return "sap.ui.core.ComponentContainer";
                        }
                    };
                };
                sinon.stub(OverlayRegistry, "getOverlay").returns({
                    getElement: function () {
                        return oView;
                    },
                    getParentElementOverlay: function () {
                        return {
                            getElement: function () {
                                return oView.getParent();
                            },
                            getParentAggregationOverlay: function () {
                                return {
                                    getAggregationName: function () {
                                        return "content";
                                    }
                                }
                            },
                            getParentAggregationOverlay: function () {
                                return {
                                    getAggregationName: function () {
                                        return "content";
                                    }
                                };
                            }
                        }
                    },
                    getParentAggregationOverlay: function () {
                        return {
                            getAggregationName: function () {
                                return "content";
                            }
                        };
                    },
                    getChildren: function () {
                        return [];
                    },
                    getParent: function () {
                        return null;
                    }
                });
                sinon.stub(ElementUtil, "getAggregation").returns([
                    oView,
                    oView1
                ]);
                sinon.stub(ElementMover.prototype, "getMovedOverlay").returns({
                    getElement: function () {
                        return oView1;
                    },
                    getParentElementOverlay: function () {
                        return {
                            getElement: function () {
                                return oView1.getParent();
                            },
                            getParentAggregationOverlay: function () {
                                return {
                                    getAggregationName: function () {
                                        return "content";
                                    }
                                }
                            }
                        };
                    },
                    getParentAggregationOverlay: function () {
                        return {
                            getAggregationName: function () {
                                return "content";
                            }
                        };
                    },
                    removeStyleClass: function () { },

                });
                sinon.stub(ElementMover.prototype, "deactivateAllTargetZones").returns({});
                sinon.stub(CommonUtils, "getApp").returns({
                    getLayout: function () {
                        return "mainView-OVPLayout";
                    }
                });
                var oComponentContainerDesigntimeMetadata = DashboardLayoutDesigntime.aggregations.content.propagateMetadata(oMockElement);
                var oSettings = oComponentContainerDesigntimeMetadata.actions.settings(oMockElement);
                assert.ok(oSettings.AddStaticLinkListCard.icon === "sap-icon://form", "Action AddStaticLinkListCard is present");
                assert.ok(oSettings.CloneCard.icon === "sap-icon://value-help", "Action CloneCard is present");
                assert.ok(oSettings.Cut.icon === "sap-icon://scissors", "Action Cut is present");
                assert.ok(oSettings.EditCard.icon === "sap-icon://edit", "Action EditCard is present");
                assert.ok(oSettings.Paste.icon === "sap-icon://paste", "Action paste is present");
                oSettings.Paste.handler(oMockElement).then(function (aChanges) {
                    assert.ok(aChanges.length === 3, "Paste action returns changes");
                    var aChangesToApply = aChanges.filter(function (oChange) {
                        return oChange.changeSpecificData.changeType !== "dragAndDropUI";
                    });
                    assert.ok(aChangesToApply.length === 2, "Paste action returns 2 dragOrResize changes");
                    var oChange = new UIChange();
                    sinon.stub(oChange, "getChangeType").returns(aChangesToApply[0].changeSpecificData.changeType);
                    oChange.setSelector({ id: aChangesToApply[0].selectorControl, idIsLocal: true });
                    oChange.setContent(aChangesToApply[0].changeSpecificData.content);
                    var oCondenserInfo = PersonalizationChangeHandler[oChange.getChangeType()]["changeHandler"].getCondenserInfo(oChange);
                    assert.ok(oCondenserInfo.classification === "lastOneWins", "Condenser info classification is lastOneWins");
                    assert.ok(oCondenserInfo.uniqueKey === "mainView-OVPLayout-card_17-dragOrResize", "Condenser info uniqueKey is correct");

                    var oChange1 = new UIChange();
                    sinon.stub(oChange1, "getChangeType").returns(aChangesToApply[1].changeSpecificData.changeType);
                    oChange1.setSelector({ id: aChangesToApply[1].selectorControl, idIsLocal: true });
                    oChange1.setContent(aChangesToApply[1].changeSpecificData.content);
                    var oCondenserInfo1 = PersonalizationChangeHandler[oChange1.getChangeType()]["changeHandler"].getCondenserInfo(oChange1);
                    assert.ok(oCondenserInfo1.classification === "lastOneWins", "Condenser info classification is lastOneWins");
                    assert.ok(oCondenserInfo1.uniqueKey === "mainView-OVPLayout-card_16-dragOrResize", "Condenser info uniqueKey is correct");
                    fnDone();
                });
            });
        });
    });

});