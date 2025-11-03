// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "../../formatter/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter"
], (
    Log,
    Controller,
    formatter,
    Filter,
    FilterOperator,
    Fragment,
    Sorter
) => {
    "use strict";
    return Controller.extend("sap.ushell.demo.FioriElementsApps.FEBasicApp.ext.controller.Default", {
        formatter: formatter,

        onInit: function () {
            this._mDialogs = {};
            this.aMessageFilters = [];
            this.oSBTable = this.oView.byId("storageBinTable");
        },

        onOpenSortDialog: function () {
            const sFullFragmentName = "sap.ushell.demo.FioriElementsApps.FEBasicApp.ext.view.SortDialog";
            let oDialog = this._mDialogs[sFullFragmentName];
            if (!oDialog) {
                Fragment.load({
                    id: this.oView.getId(),
                    name: sFullFragmentName,
                    controller: this
                }).then((oDialogFragment) => {
                    this._mDialogs[sFullFragmentName] = oDialog = oDialogFragment;
                    this.oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                oDialog.open();
            }
        },

        onSortDialogConfirmed: function (oEvent) {
            const mParams = oEvent.getParameters();
            const sSortPath = mParams.sortItem.getKey();
            const oTableBinding = this.byId("storageBinTable").getBinding("items");
            if (oTableBinding) {
                oTableBinding.sort(new Sorter(sSortPath, mParams.sortDescending));
            }
        },

        getMessageFilter: function () {
            // The message filters are used by the message model to find the messages that refer to the currently shown entities.
            // Therefore the new binding context has to be known in order to build the correct filters.
            // When getMessageFilter is called the new binding context might not yet be known -> A promise is returned which is
            // resolved when the context ist set (that is when the "change" event of the binding of aggregation "items" is triggered)
            // Please note:
            // 1. One filter is added for each entry of the storage bin table. This is necessary because the filter only works with
            //	absolute binding paths for each entity - relative paths like "/Product("ABC")/to_storageBin" are not allowed.
            // 2. Mapping messages to table entries is problematic when e.g. a growing list does not show all items -> not all filters#
            //   can be created or when items of the list can be added or deleted.
            //   In this example such cases can not occur so it is save to provide message filter functionality
            Log.error("getMessageFilter called");
            return new Promise((resolve) => {
                const aMsgFilter = [];
                let aItems = null;
                function fnOnChange () {
                    // is called when the binding context changes
                    // builds the filters for message filtering as soon as the new context is available
                    this.aMessageFilters.length = 0;
                    aItems = this.oSBTable.getAggregation("items");
                    if (aItems) {
                        aItems.forEach(
                            (oListItem) => {
                                aMsgFilter.push(new Filter({
                                    path: "target",
                                    operator: FilterOperator.StartsWith,
                                    value1: oListItem.getBindingContextPath()
                                }));
                            });
                    }
                    resolve(aMsgFilter);
                }
                const oItmBinding = this.oSBTable.getBinding("items");
                oItmBinding.attachEventOnce("change", fnOnChange, this);
            });
        }
    });
});
