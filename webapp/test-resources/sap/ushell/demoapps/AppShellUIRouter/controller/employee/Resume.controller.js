// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/AppShellUIRouter/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
    "use strict";

    const _aValidTabKeys = ["Info", "Projects", "Hobbies", "Notes"];

    return BaseController.extend("sap.ushell.demo.AppShellUIRouter.controller.employee.Resume", {
        onInit: function () {
            const oRouter = this.getRouter();

            this.getView().setModel(new JSONModel(), "view");
            oRouter.getRoute("employeeResume").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const oView = this.getView();

            oView.bindElement({
                path: `/Employees(${oArgs.employeeId})`,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function (oEvent) {
                        oView.setBusy(true);
                    },
                    dataReceived: function (oEvent) {
                        oView.setBusy(false);
                    }
                }
            });

            const oQuery = oArgs["?query"];
            if (oQuery && _aValidTabKeys.indexOf(oQuery.tab) > -1) {
                oView.getModel("view").setProperty("/selectedTabKey", oQuery.tab);
                // support lazy loading for the hobbies and notes tab
                if (oQuery.tab === "Hobbies" || oQuery.tab === "Notes") {
                    // the target is either "resumeTabHobbies" or "resumeTabNotes"
                    this.getRouter().getTargets().display(`resumeTab${oQuery.tab}`);
                }
            } else {
                // the default query param should be visible at all time
                this.getRouter().navTo("employeeResume", {
                    employeeId: oArgs.employeeId,
                    query: {
                        tab: _aValidTabKeys[0]
                    }
                }, true /* no history */);
            }
        },

        _onBindingChange: function (oEvent) {
            // No data for the binding
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }
        },

        /**
         * We use this event handler to update the hash in case a new tab is selected.
         * @param {sap.ui.base.Event} oEvent The event object.
         */
        onTabSelect: function (oEvent) {
            const oCtx = this.getView().getBindingContext();

            this.getRouter().navTo("employeeResume", {
                employeeId: oCtx.getProperty("EmployeeID"),
                query: {
                    tab: oEvent.getParameter("selectedKey")
                }
            }, true /* without history */);
        }
    });
});
