/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/Card.controller",
    "sap/ovp/app/OVPLogger",
    "sap/ovp/cards/NavigationHelper"
], function (
    CardController,
    OVPLogger,
    CardsNavigationhelper
) {
    "use strict";

    var oLogger = new OVPLogger("OVP.cards.generic.base.error.BaseError");
    return CardController.extend("sap.ovp.cards.generic.base.error", {

        onInit: function () {
            //The base controller lifecycle methods are not called by default, so they have to be called
            //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
            CardController.prototype.onInit.apply(this, arguments);
        },
        adjustCardSize: function () {
            var oCard = this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(this.cardId);
            if (oCard.template !== "sap.ovp.cards.stack") {
                var oLayout = this.oMainComponent && this.oMainComponent.getLayout();
                var oDashboardLayoutUtil = oLayout.getDashboardLayoutUtil();
                var sCardDomId = oDashboardLayoutUtil.getCardDomId(this.sCardId);
                var oDomCard = document.getElementById(sCardDomId);
                var iHeaderHeight = this.getHeaderHeight();
                var iCardHeight = oCard.dashboardLayout.rowSpan * this.oDashboardLayoutUtil.ROW_HEIGHT_PX;
                var iBorderHeight = 2 * this.oDashboardLayoutUtil.CARD_BORDER_PX;
                oDomCard.getElementsByClassName("sapOvpCardContentContainer")[0].style.height = iCardHeight - (iHeaderHeight + iBorderHeight) + "px";
            }
        },
        onAfterRendering: function () {
            //To avoid console error for Error card in case of KeyUser where the maincomponent is null
            if (this.oMainComponent && this.oMainComponent.getLayout().getMetadata().getName() === "sap.ovp.ui.DashboardLayout") {
                CardController.prototype.onAfterRendering.apply(this, arguments);
                this.adjustCardSize();
            }
            if (this.oMainComponent && this.oMainComponent.getLayout().getMetadata().getName() === "sap.ovp.ui.EasyScanLayout") {
                this.setNavigableStyleForNoDataCard();
            }
            if (this.getView() && this.getView().byId("sapOvpCardAdditionalActions")) {
                this.getView().byId("sapOvpCardAdditionalActions").setEnabled(true);
            }
        },
        onRefresh: function (sCardId) {
            var oManifestCard = this.oMainComponent._getCardFromManifest(sCardId);
            var iCardIndex = this.oMainComponent.aErrorCards.indexOf(sCardId);
            if (iCardIndex > -1) {
                this.oMainComponent.aErrorCards.splice(iCardIndex, 1);
            }
            oManifestCard && this.oMainComponent.createCard(oManifestCard);
        },
        /**
         * Method called upon card resize
         */
        resizeCard: function () {
            try {
                this.adjustCardSize();
            } catch (error) {
                oLogger.warning("OVP resize: " + this.cardId + " catch " + error.toString());
            }
        },

        setNavigableStyleForNoDataCard: function () {
            var bIsNavigable = false;
            var oComponentData = this.getOwnerComponent().getComponentData();
            var oModel = this.getModel();
            var oEntityType = this.getEntityType();
            var oCardPropertiesModel = this.getView().getModel("ovpCardProperties");
            if (oComponentData && oComponentData.mainComponent) {
                var oMainComponent = oComponentData.mainComponent;
                //Flag bGlobalFilterLoaded is set only when the oGlobalFilterLodedPromise is resolved
                if (oMainComponent.bGlobalFilterLoaded) {
                    bIsNavigable = !CardsNavigationhelper.checkHeaderNavigationDisabledForAnalyticalCard(oCardPropertiesModel) && 
                    CardsNavigationhelper.checkNavigation(oModel, oEntityType, oCardPropertiesModel);
                }
            }
            if (bIsNavigable) {
                this.getView().addStyleClass("sapOvpCardNavigable");
            }
        }
    });
});
