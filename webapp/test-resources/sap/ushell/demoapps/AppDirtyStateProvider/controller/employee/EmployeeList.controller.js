// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/AppDirtyStateProvider/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.AppDirtyStateProvider.controller.employee.EmployeeList", {
        onInit: function () {
            const oRouter = this.getRouter();
            oRouter.getRoute("employeeList").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            const oModel = new JSONModel();
            oModel.loadData("../../demoapps/AppDirtyStateProvider/localService/mockdata/Employees.json").then(() => {
                this.getView().setModel(oModel);
            });
        }
    });
});
