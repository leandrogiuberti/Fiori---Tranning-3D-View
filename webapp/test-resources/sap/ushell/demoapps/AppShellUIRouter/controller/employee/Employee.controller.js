// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/AppShellUIRouter/controller/BaseController"
], (BaseController) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.AppShellUIRouter.controller.employee.Employee", {
        onInit: function () {
            const oRouter = this.getRouter();

            oRouter.getRoute("employee").attachMatched(this._onRouteMatched, this);
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
        },

        _onBindingChange: function (oEvent) {
            // No data for the binding
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }
        },

        onShowResume: function (oEvent) {
            const oCtx = this.getView().getBindingContext();

            this.getRouter().navTo("employeeResume", {
                employeeId: oCtx.getProperty("EmployeeID")
            });
        }
    });
});
