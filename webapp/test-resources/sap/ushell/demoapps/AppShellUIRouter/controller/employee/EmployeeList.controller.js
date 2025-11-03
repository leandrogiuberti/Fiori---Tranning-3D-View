// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/AppShellUIRouter/controller/BaseController"
], (BaseController) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.AppShellUIRouter.controller.employee.EmployeeList", {
        onListItemPressed: function (oEvent) {
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext();

            this.getRouter().navTo("employee", {
                employeeId: oCtx.getProperty("EmployeeID")
            });
        }
    });
});
