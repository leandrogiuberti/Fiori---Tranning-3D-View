// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.utils.objectOperations
 */
sap.ui.define([
    "sap/ushell/utils/objectOperations"
], (objectOperations) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("getMember");

    QUnit.test("Returns the correct result when passing an empty object.", function (assert) {
        const oObj = {};
        const sPath = "sap|flp.type";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, undefined, "correct result");
    });

    QUnit.test("Returns the correct result when passing an empty path.", function (assert) {
        const oObj = { abc: "def" };
        const sPath = "";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, undefined, "correct result");
    });

    QUnit.test("Returns the correct result when passing a single path.", function (assert) {
        const oObj = { abc: "def" };
        const sPath = "abc";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, "def", "correct result");
    });

    QUnit.test("Returns the correct result when passing a 2 segment path.", function (assert) {
        const oObj = {
            "sap.flp": { type: "tile" }
        };
        const sPath = "sap|flp.type";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, "tile", "correct result");
    });

    QUnit.test("Returns the correct result when passing a long path.", function (assert) {
        const oObj = {
            "sap.demo.has": {
                "sap.flp": { type: "application" }
            }
        };
        const sPath = "sap|demo|has.sap|flp.type";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, "application", "correct result");
    });

    QUnit.test("Returns the correct result when passing a deep path.", function (assert) {
        const oInnerObj = {
            type: "application"
        };
        const oObj = {
            "sap.demo.has": { "sap.flp": oInnerObj }
        };
        const sPath = "sap|demo|has.sap|flp";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, oInnerObj, "correct result");
    });

    QUnit.test("Returns the correct result when expecting an array", function (assert) {
        const aArr = [1, 2, 3];
        const oObj = {
            "sap.demo.has": { "sap.flp": aArr }
        };
        const sPath = "sap|demo|has.sap|flp";
        const oResult = objectOperations.getMember(oObj, sPath);
        assert.strictEqual(oResult, aArr, "correct result");
    });

    QUnit.module("getNestedObjectProperty", {
        beforeEach: function () {
            this.oGetMemberStub = sinon.stub(objectOperations, "getMember");

            this.aObjects = [undefined, "nonEmpty", undefined];
            this.aPaths = ["test", "test", "test"];

            this.oGetMemberStub.withArgs(undefined, "test").returns();
            this.oGetMemberStub.withArgs("nonEmpty", "test").returns("");
        },
        afterEach: function () {
            this.oGetMemberStub.restore();
        }
    });

    QUnit.test("Returns an empty string if it is the first value", function (assert) {
        // Arrange
        // Act
        const sResult = objectOperations.getNestedObjectProperty(this.aObjects, this.aPaths);
        // Assert
        assert.strictEqual(sResult, "", "correct value was returned");
    });
});
