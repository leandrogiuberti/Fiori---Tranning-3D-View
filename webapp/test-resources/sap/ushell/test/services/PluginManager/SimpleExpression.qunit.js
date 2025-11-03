// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for module "SimpleExpression"
 */
sap.ui.define([
    "sap/ushell/services/PluginManager/SimpleExpression"
], (
    SimpleExpression
) => {
    "use strict";

    /* global QUnit */

    QUnit.module("test method: filterByExpression");

    QUnit.test("filter by expression", function (assert) {
        const aArray = ["1", "2", "3"];
        const aExpression = "1 includes";
        assert.deepEqual(SimpleExpression.filterByExpression(aArray, aExpression), ["1"]);
    });

    QUnit.module("test method: evaluate");

    QUnit.test("evaluate", function (assert) {
        const sId = "1";
        const postfix = ["1", "includes"];
        assert.equal(SimpleExpression.evaluate(sId, postfix), true);
    });

    QUnit.module("test method: parseAndEvaluate");

    QUnit.test("parseAndEvaluate testing includes", function (assert) {
        const sId = "foobar";
        const sExpression = "foo includes";
        assert.equal(SimpleExpression.parseAndEvaluate(sId, sExpression), true);
    });

    QUnit.test("parseAndEvaluate testing or", function (assert) {
        const sId = "foobar";
        const sExpression = "foobar includes bar includes or";
        assert.equal(SimpleExpression.parseAndEvaluate(sId, sExpression), true);
    });

    QUnit.test("parseAndEvaluate testing and", function (assert) {
        const sId = "foobar";
        const sExpression = "foo includes bar includes and";
        assert.equal(SimpleExpression.parseAndEvaluate(sId, sExpression), true);
    });

    QUnit.test("parseAndEvaluate testing not", function (assert) {
        const sId = "foobar";
        const sExpression = "foo includes not";
        assert.equal(SimpleExpression.parseAndEvaluate(sId, sExpression), false);
    });

    QUnit.test("parseAndEvaluate testing 'and' and multiple 'not' ", function (assert) {
        const sId = "foobar";
        const sExpression = "foo includes bar includes and not not";
        assert.equal(SimpleExpression.parseAndEvaluate(sId, sExpression), true);
    });
});
