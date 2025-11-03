// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/ApplicationType/utils",
    "sap/ushell/services/URLParsing",
    "sap/ushell/Container"
], (oUtils, URLParsing, Container) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("sap.ushell.ApplicationType", {
        beforeEach: function () {
            const oGetServiceStub = sinon.stub();
            oGetServiceStub.withArgs("URLParsing").returns(new URLParsing());
            oGetServiceStub.throws(new Error("Service not mocked"));
            Container = {
                getService: oGetServiceStub
            };
        },
        afterEach: function () { }
    });

    QUnit.test("module exports an object", function (assert) {
        assert.strictEqual(
            Object.prototype.toString.apply(oUtils),
            "[object Object]",
            "got an object back"
        );

        assert.ok(oUtils.hasOwnProperty("getURLParsing"), "function 'getURLParsing' exported");
        assert.ok(oUtils.hasOwnProperty("appParameterToUrl"), "function 'appParameterToUrl' exported");
        assert.ok(oUtils.hasOwnProperty("appendParametersToUrl"), "function 'appendParametersToUrl' exported");
        assert.ok(oUtils.hasOwnProperty("appendParametersToIntentURL"), "function 'appendParametersToIntentURL' exported");
        assert.ok(oUtils.hasOwnProperty("absoluteUrlDefinedByUser"), "function 'absoluteUrlDefinedByUser' exported");
        assert.ok(oUtils.hasOwnProperty("setSystemAlias"), "function 'setSystemAlias' exported");
        assert.ok(oUtils.hasOwnProperty("getExtendedInfo"), "function 'getExtendedInfo' exported");
        assert.ok(oUtils.hasOwnProperty("addIframeCacheHintToURL"), "function 'addIframeCacheHintToURL' exported");
        assert.ok(oUtils.hasOwnProperty("checkOpenWithPost"), "function 'checkOpenWithPost' exported");
        assert.ok(oUtils.hasOwnProperty("addKeepAliveToURLTemplateResult"), "function 'addKeepAliveToURLTemplateResult' exported");
    });

    QUnit.test("appendParametersToIntentURL: simple case", function (assert) {
        const sUrl = "http://www.example.com/index.html#Frag-ment";
        const oParameters = {
            p1: "v1"
        };

        const sExpectedUrl = "http://www.example.com/index.html#Frag-ment?p1=v1";

        const sResultUrl = oUtils.appendParametersToIntentURL(oParameters, sUrl);

        assert.strictEqual(sResultUrl, sExpectedUrl);
    });

    QUnit.test("appendParametersToIntentURL: multiple parameters", function (assert) {
        const sUrl = "http://www.example.com/index.html#Frag-ment";
        const oParameters = {
            p1: "v1",
            p2: "v2"
        };

        const sExpectedUrl = "http://www.example.com/index.html#Frag-ment?p1=v1&p2=v2";

        const sResultUrl = oUtils.appendParametersToIntentURL(oParameters, sUrl);

        assert.strictEqual(sResultUrl, sExpectedUrl);
    });

    QUnit.test("appendParametersToIntentURL: URL contains an intent parameter already", function (assert) {
        const sUrl = "http://www.example.com/index.html#Frag-ment?p1=v1";
        const oParameters = {
            p1: "vX",
            p2: "v2"
        };

        const sExpectedUrl = "http://www.example.com/index.html#Frag-ment?p1=vX&p2=v2";

        const sResultUrl = oUtils.appendParametersToIntentURL(oParameters, sUrl);

        assert.strictEqual(sResultUrl, sExpectedUrl);
    });

    QUnit.test("appendParametersToIntentURL: URL contains an intent parameter with special characters already", function (assert) {
        const sUrl = "http://www.example.com/index.html#Frag-ment?p1%3d=%3dv1";
        const oParameters = {
            p2: "v2"
        };

        const sExpectedUrl = "http://www.example.com/index.html#Frag-ment?p1%253D=%253Dv1&p2=v2";

        const sResultUrl = oUtils.appendParametersToIntentURL(oParameters, sUrl);

        assert.strictEqual(sResultUrl, sExpectedUrl);
    });

    QUnit.test("appendParametersToIntentURL: special characters in parameter name and value", function (assert) {
        const sUrl = "http://www.example.com/index.html#Frag-ment";
        const oParameters = {
            "p@1": "100%"
        };

        const sExpectedUrl = "http://www.example.com/index.html#Frag-ment?p%25401=100%2525";

        const sResultUrl = oUtils.appendParametersToIntentURL(oParameters, sUrl);

        assert.strictEqual(sResultUrl, sExpectedUrl);
    });

    QUnit.test("appendParametersToIntentURL: URL contains no fragment", function (assert) {
        const sUrl = "http://www.example.com/index.html";
        const oParameters = {
            "p@1": "100%"
        };

        const sExpectedUrl = "http://www.example.com/index.html?p%401=100%25";

        const sResultUrl = oUtils.appendParametersToIntentURL(oParameters, sUrl);

        assert.strictEqual(sResultUrl, sExpectedUrl);
    });
});
