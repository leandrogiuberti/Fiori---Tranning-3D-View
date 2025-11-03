/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/base/table/BaseTable.controller",
    "sap/ovp/filter/FilterUtils",
    "sap/ui/core/EventBus",
    "sap/base/util/isEmptyObject"
], function (
    BaseTableController,
    FilterUtils,
    CoreEventBus,
    isEmptyObject
) {
    "use strict";

    return BaseTableController.extend("sap.ovp.cards.table.Table", {
        onInit: function () {
            //The base controller lifecycle methods are not called by default, so they have to be called
            //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
            BaseTableController.prototype.onInit.apply(this, arguments);
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
            BaseTableController.prototype.onAfterRendering.apply(this, arguments);
        },
        onDataReceived: function (oEvent) {
            this.bdataLoadedToEnableAddToInsight = true;
            var oTable = this.byId("ovpTable");
            oTable && oTable.setBusy(false);
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
