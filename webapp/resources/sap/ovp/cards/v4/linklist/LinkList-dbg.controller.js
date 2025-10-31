/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/base/linklist/BaseLinklist.controller",
    "sap/ovp/cards/OVPCardAsAPIUtils",
    "sap/ovp/cards/Filterhelper",
    "sap/ovp/cards/generic/base/analytical/Utils"
], function (
    BaseLinklistController,
    OVPCardAsAPIUtils,
    Filterhelper,
    Utils
) {
    "use strict";

    return BaseLinklistController.extend("sap.ovp.cards.v4.linklist.LinkList", {
        onInit: function () {
            //The base controller lifecycle methods are not called by default, so they have to be called
            //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
            BaseLinklistController.prototype.onInit.apply(this, arguments);
        },

        onAfterRendering: function () {
            BaseLinklistController.prototype.onAfterRendering.apply(this, arguments);
            if (!OVPCardAsAPIUtils.checkIfAPIIsUsed(this)) {
                var oCardPropertiesModel = this.getCardPropertiesModel();
                var cardmanifestModel = this.getOwnerComponent().getModel("ui").getData().cards;

                this.selectionVaraintFilter = Filterhelper.getSelectionVariantFilters(
                    cardmanifestModel,
                    oCardPropertiesModel,
                    this.getEntityType()
                );
            }
        },
        onDataReceived: function (oEvent) {
            if (Utils.isDataSetEmpty(oEvent)) {
                var sCardId = this.getOwnerComponent().getComponentData().cardId;
                if (sCardId && this.oMainComponent.aErrorCards.indexOf(sCardId) === -1) {
                    this.oMainComponent.createNoDataCard(sCardId);
                }
            }
        }
    });
});
