sap.ui.define([
    "sap/ovp/flexibility/DashboardLayout.flexibility"
], function (
    DashboardLayoutFlexibility
) {
    "use strict";

    QUnit.module("DashboardLayout.flexibility");

    QUnit.test("moveControls configuration", function (assert) {
        var moveControls = DashboardLayoutFlexibility.moveControls;
        assert.ok(moveControls, "moveControls configuration exists");
        assert.strictEqual(moveControls.changeHandler, "default", "changeHandler is default");
        assert.deepEqual(moveControls.layers, {
            CUSTOMER_BASE: true,
            CUSTOMER: true,
            USER: true
        }, "layers configuration is correct");
    });

    QUnit.test("unhideControl configuration", function (assert) {
        var unhideControl = DashboardLayoutFlexibility.unhideControl;
        assert.ok(unhideControl, "unhideControl configuration exists");
        assert.ok(unhideControl.changeHandler === "default", "changeHandler is default");
        assert.deepEqual(unhideControl.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "unhideControl layer configuration verified");
    });

    QUnit.test("unhideCardContainer configuration", function (assert) {
        var unhideCardContainer = DashboardLayoutFlexibility.unhideCardContainer;
        assert.ok(unhideCardContainer, "unhideCardContainer configuration exists");
        assert.ok(typeof unhideCardContainer.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof unhideCardContainer.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof unhideCardContainer.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(unhideCardContainer.layers, {
            "VENDOR": true,
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "unhideCardContainer layer configuration verified");
    });

    QUnit.test("hideCardContainer configuration", function (assert) {
        var hideCardContainer = DashboardLayoutFlexibility.hideCardContainer;
        assert.ok(hideCardContainer, "hideCardContainer configuration exists");
        assert.ok(typeof hideCardContainer.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof hideCardContainer.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof hideCardContainer.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(hideCardContainer.layers, {
            "VENDOR": true,
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "hideCardContainer layer configuration verified");
    });

    QUnit.test("removeCardContainer configuration", function (assert) {
        var removeCardContainer = DashboardLayoutFlexibility.removeCardContainer;
        assert.ok(removeCardContainer, "removeCardContainer configuration exists");
        assert.ok(typeof removeCardContainer.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof removeCardContainer.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof removeCardContainer.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(removeCardContainer.layers, {
            "VENDOR": true,
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "removeCardContainer layer configuration verified");
    });

    QUnit.test("editCardSettings configuration", function (assert) {
        var editCardSettings = DashboardLayoutFlexibility.editCardSettings;
        assert.ok(editCardSettings, "editCardSettings configuration exists");
        assert.ok(typeof editCardSettings.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof editCardSettings.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof editCardSettings.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(editCardSettings.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "editCardSettings layer configuration verified");
    });

    QUnit.test("newCardSettings configuration", function (assert) {
        var newCardSettings = DashboardLayoutFlexibility.newCardSettings;
        assert.ok(newCardSettings, "newCardSettings configuration exists");
        assert.ok(typeof newCardSettings.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof newCardSettings.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof newCardSettings.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(newCardSettings.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "newCardSettings layer configuration verified");
    });

    QUnit.test("dragAndDropUI configuration", function (assert) {
        var dragAndDropUI = DashboardLayoutFlexibility.dragAndDropUI;
        assert.ok(dragAndDropUI, "dragAndDropUI configuration exists");
        assert.ok(typeof dragAndDropUI.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof dragAndDropUI.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof dragAndDropUI.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(dragAndDropUI.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "dragAndDropUI layer configuration verified");
    });

    QUnit.test("viewSwitch configuration", function (assert) {
        var viewSwitch = DashboardLayoutFlexibility.viewSwitch;
        assert.ok(viewSwitch, "viewSwitch configuration exists");
        assert.ok(typeof viewSwitch.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof viewSwitch.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof viewSwitch.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(viewSwitch.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "viewSwitch layer configuration verified");
    });

    QUnit.test("visibility configuration", function (assert) {
        var visibility = DashboardLayoutFlexibility.visibility;
        assert.ok(visibility, "visibility configuration exists");
        assert.ok(typeof visibility.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof visibility.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof visibility.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(visibility.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "visibility layer configuration verified");
    });

    QUnit.test("dragOrResize configuration", function (assert) {
        var dragOrResize = DashboardLayoutFlexibility.dragOrResize;
        assert.ok(dragOrResize, "dragOrResize configuration exists");
        assert.ok(typeof dragOrResize.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof dragOrResize.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof dragOrResize.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(dragOrResize.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "dragOrResize layer configuration verified");
    });

    QUnit.test("position configuration", function (assert) {
        var position = DashboardLayoutFlexibility.position;
        assert.ok(position, "position configuration exists");
        assert.ok(typeof position.changeHandler.applyChange === "function", "applyChange is a function");
        assert.ok(typeof position.changeHandler.revertChange === "function", "revertChange is a function");   
        assert.ok(typeof position.changeHandler.completeChangeContent === "function", "completeChangeContent is a function");
        assert.deepEqual(position.layers, {
            "CUSTOMER_BASE": true,
            "CUSTOMER": true,
            "USER": true
        }, "position layer configuration verified");
    });
    
});