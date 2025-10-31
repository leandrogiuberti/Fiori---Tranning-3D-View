/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/base/list/BaseList.controller",
    "sap/ovp/filter/FilterUtils",
    "sap/ui/core/EventBus",
    "sap/base/util/isEmptyObject"
], function (
    BaseListController,
    FilterUtils,
    CoreEventBus,
    isEmptyObject
) {
    "use strict";

    return BaseListController.extend("sap.ovp.cards.list.List", {
        onInit: function () {
            //The base controller lifecycle methods are not called by default, so they have to be called
            //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
            BaseListController.prototype.onInit.apply(this, arguments);
            var that = this;
            this.eventhandler = function (sChannelId, sEventName, aFilters) {
                FilterUtils.applyFiltersToV2Card(aFilters, that);
            };
            this.GloabalEventBus = CoreEventBus.getInstance();
            if (this.oMainComponent && this.oMainComponent.isMacroFilterBar) {
                this.GloabalEventBus.subscribe("OVPGlobalfilter", "OVPGlobalFilterSeacrhfired", that.eventhandler);
            }
        },
        onAfterRendering: function () {
            BaseListController.prototype.onAfterRendering.apply(this, arguments);
        },
        onDataReceived: function (oEvent) {
            this.bdataLoadedToEnableAddToInsight = true;
            var oList = this.byId("ovpList");
            oList && oList.setBusy(false);
            var cardContainer = this.getCardContentContainer();
            if (!cardContainer) {
                return;
            }
            var data = oEvent.getParameter("data");
            if (!data || isEmptyObject(data) ||
                !data.results || !data.results.length) {
                var sCardId = this.getOwnerComponent().getComponentData().cardId;
                if (sCardId && this.oMainComponent.aErrorCards.indexOf(sCardId) === -1) {
                    this.oMainComponent.createNoDataCard(sCardId);
                }
            }
        }
    });
});
