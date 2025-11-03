sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ovp/app/ManageCardsUtils",
    "sap/ui/core/ComponentContainer",
    "sap/ovp/app/Component",
    "sap/ovp/cards/CommonUtils",
    "sap/ui/core/Fragment",
    "sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
], function (
    Controller,
    JSONModel,
    ManageCardsUtils,
    ComponentContainer,
    OVPAppComponent,
    CommonUtils,
    Fragment,
    ControlPersonalizationWriteAPI
) {
    "use strict";

    var oController, oManageCardsUtils, OVPAppComponent, oCard, fnLayoutRerenderSpy;
    var sandbox = sinon.createSandbox();

    QUnit.module("ManageCardsUtils", {
        beforeEach: function () {
            return Controller.create({
                name: "sap.ovp.app.Main"
            }).then(function (controller) {
                oController = controller;
                oManageCardsUtils = new ManageCardsUtils(controller);

                OVPAppComponent = new OVPAppComponent();
                oCard = new ComponentContainer(OVPAppComponent.createId("mainView--card000_cardDualComboTime"));
                fnLayoutRerenderSpy = sandbox.spy();

                var oMainComponent = {
                    getView: sandbox.stub().returns({
                        getId: sinon.stub().returns(oCard),
                        addDependent: function () {},
                        byId: function () { return null; }
                    }),
                    getLayout: sinon.stub().returns({ 
                        invalidate: fnLayoutRerenderSpy,
                        getMetadata: function () {
                            return {
                                getName: function () {
                                    return "sap.ovp.ui.DashboardLayout";
                                }
                            };
                        }
                    }),
                    aErrorCards: [],
                    aManifestOrderedCards: [
                        { id: "card000_cardDualComboTime", visibility: true },
                        { id: "card001_cardDualCombo", visibility: true },
                        { id: "card002_cardchartsdonut", visibility: true },
                        { id: "card003_cardchartsline", visibility: true }
                    ],
                    _getCardsModel: sinon.stub().returns([
                        {
                            model: "salesShare",
                            template: "sap.ovp.cards.charts.analytical",
                            settings: {
                                dataStep: "11",
                                title: "(Analytical) Dual Combination Chart - Time Series",
                                subTitle: "Total sales by Date",
                                valueSelectionInfo: "value selection info",
                                cardLayout: {
                                    colSpan: 1
                                },
                                entitySet: "SalesShareBubbleTime",
                                selectionAnnotationPath: "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_CtryCurr",
                                chartAnnotationPath: "com.sap.vocabularies.UI.v1.Chart#Dual-Combo-Time",
                                presentationAnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant#Eval_by_CtryCurr_Dual_Combo_Time",
                                dataPointAnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_CtryCurr-Generic",
                                identificationAnnotationPath: "com.sap.vocabularies.UI.v1.Identification#Eval_by_CtryCurr",
                                baseUrl: "./apps/sales/webapp"
                            },
                            id: "card000_cardDualComboTime"
                        },
                        {
                            model: "salesShare",
                            template: "sap.ovp.cards.charts.analytical",
                            settings: {
                                dataStep: "11",
                                title: "(Analytical) Dual Combination Chart",
                                subTitle: "Total Value",
                                valueSelectionInfo: "value selection info",
                                cardLayout: {
                                    colSpan: 1
                                },
                                defaultSpan: {
                                    minimumTitleRow: 2,
                                    minimumSubTitleRow: 2
                                },
                                entitySet: "SalesShareBubble",
                                selectionAnnotationPath: "com.sap.vocabularies.UI.v1.SelectionVariant#Eval_by_CtryCurr",
                                chartAnnotationPath: "com.sap.vocabularies.UI.v1.Chart#Eval_by_CtryCurr_Dual_Combo",
                                presentationAnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant#Eval_by_CtryCurr_Dual_Combo",
                                dataPointAnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint#Eval_by_CtryCurr-Generic",
                                identificationAnnotationPath: "com.sap.vocabularies.UI.v1.Identification#Eval_by_CtryCurr",
                                navigation: "chartNav",
                                baseUrl: "./apps/sales/webapp"
                            },
                            id: "card001_cardDualCombo"
                        }
                    ]),
                    _getCardArrayAsVariantFormatDashboard: sinon.stub().returns([
                        [
                            {
                                id: "card000_cardDualComboTime",
                                visibility: true
                            },
                            {
                                id: "card001_cardDualCombo",
                                visibility: false
                            }
                        ]
                    ]),
                    getAllowedNumberOfCards: function () {
                        return {
                            numberOfCards: 3,
                            errorMessage: 'You have reached the maximum limit of 3 cards. To add a new card, you first have to deselect one from the list or hide a card if you are in key user mode.'
                        }; 
                    },
                    getUIModel: sinon.stub().returns(new JSONModel({
                        aOrderedCards: [
                            { id: "card000_cardDualComboTime", visibility: true},
                            { id: "card001_cardDualCombo", visibility: false }
                        ]
                    })),
                    byId: function (sId) {
                        if (sId === "manageCardsDialog") {
                            return {
                                open: sinon.stub(),
                                sId: "application-sales-overview-component---mainView--manageCardsDialog"
                            };
                        } else if (sId === "manageCardsSelectionPanel") {
                            return {
                                setP13nData: sinon.stub(),
                                getSelectedFields: sinon.stub().returns(["card000_cardDualComboTime", "card001_cardDualCombo"])
                            };
                        } else if (sId === "manageCardsPanelWarningMessage") {
                            return {
                                setText: sinon.stub(),
                                setVisible: sinon.stub()
                            };
                        } else if (sId === "application-sales-overview-component---mainView--manageCardsDialog-confirmBtn") {
                            return {
                                setEnabled: sinon.stub()
                            };
                        }
                        return null;
                    },
                    createOrDestroyCards: sinon.stub(),
                    resetDashboardLayout: sinon.stub(),
                    updateDashboardLayoutCards: sinon.stub(),
                    updateLayoutWithOrderedCards: sinon.stub(),
                    getOwnerComponent: function () {
                        return {
                            oOvpConfig: {}
                        };
                    },
                    updateCardVisibiltyForCM: sinon.stub()
                };

                sandbox.stub(CommonUtils, "getApp").returns(oMainComponent);
                sandbox.stub(CommonUtils, "getUpdatedTitle").returns('(Analytical) Dual Combination Chart - Time Series');
                sandbox.stub(Fragment, "load").returns(Promise.resolve({
                    open: sinon.stub(),
                    setModel: sinon.stub(),
                    getModel: function () {
                        return new JSONModel({
                            aOrderedCards: [
                                {
                                    id: "card000_cardDualComboTime",
                                    visibility: true
                                },
                                {
                                    id: "card001_cardDualCombo",
                                    visibility: false
                                }
                            ],
                            aManifestOrderedCards: [
                                {
                                    "id": "card000_cardDualComboTime",
                                    "visibility": true
                                },
                                {
                                    "id": "card001_cardDualCombo",
                                    "visibility": false
                                }
                            ]
                        });
                    }
                }));
                sandbox.stub(ControlPersonalizationWriteAPI, "reset").returns(Promise.resolve());
                oManageCardsUtils.onManageCardsMenuButtonPress();
                
            });
            
        },
        afterEach: function () {
            sandbox.restore();
        }
    });


    QUnit.test("Manifest ordered cards is reset correctly when the allowed limit of cards is 3", function (assert) {
        oManageCardsUtils._oManageCardsFragmentController.onManageCardResetButtonPressed();

        var aManifestOrderedCards = CommonUtils.getApp().aManifestOrderedCards;
        var aExpectedManifestOrderedCards = [
            { id: "card000_cardDualComboTime", visibility: true },
            { id: "card001_cardDualCombo", visibility: true },
            { id: "card002_cardchartsdonut", visibility: true },
            { id: "card003_cardchartsline", visibility: false }
        ]
        assert.deepEqual(aManifestOrderedCards, aExpectedManifestOrderedCards, "Cards within p13n selection panel is reset to initial state after reset");
        

        //Simulating change in visibility to verify the scenario, when cards are hidden in any order from the Adapt UI
        aManifestOrderedCards[1].visibility = false; 
        aManifestOrderedCards[2].visibility = false; 
        aManifestOrderedCards[3].visibility = true; 

        oManageCardsUtils._oManageCardsFragmentController.onManageCardResetButtonPressed();

        var aExpectedManifestOrderedCards = [
            { id: "card000_cardDualComboTime", visibility: true },
            { id: "card001_cardDualCombo", visibility: false },
            { id: "card002_cardchartsdonut", visibility: false },
            { id: "card003_cardchartsline", visibility: true }
        ]
        assert.deepEqual(aManifestOrderedCards, aExpectedManifestOrderedCards, "Cards within p13n selection panel remains unchanged after reset");   
    });
});