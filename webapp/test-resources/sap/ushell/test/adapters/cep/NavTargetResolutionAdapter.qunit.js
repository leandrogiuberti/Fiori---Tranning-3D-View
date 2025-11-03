// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview QUnit tests for sap.ushell.adapters.cep.NavTargetResolutionAdapter
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ushell/adapters/cep/NavTargetResolutionAdapter",
    "sap/base/util/ObjectPath",
    "sap/ushell/utils/HttpClient",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    NavTargetResolutionAdapter,
    ObjectPath,
    HttpClient,
    Config,
    Container
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.sandbox.create();

    QUnit.module("_getIntentForService", {
        beforeEach: function () {
            const oConfig = {
                config: {}
            };
            this.oAdapter = new NavTargetResolutionAdapter({}, {}, oConfig);
            return Container.init("local");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    const oSampleRequest = {
        semanticObject: "OutputRequestItem",
        semanticObjectAction: "show",
        intentParameters: {
            SalesOrganization: ["001"],
            SalesOffice: ["FRA"]
        },
        queryParameters: {
            siteId: "5b65b497-f218-443c-b3fd-92300a194efa"
        }
    };

    QUnit.test("calls service correctly", function (assert) {
        sandbox.stub(Config, "last").withArgs("/core/site/siteId").returns("5b65b497-f218-443c-b3fd-92300a194efa");

        return this.oAdapter._getIntentForService("#OutputRequestItem-show?SalesOrganization=001&SalesOffice=FRA")
            .then((oRequestActual) => {
                assert.deepEqual(oRequestActual, oSampleRequest);
            })
            .catch(() => {
                assert.ok(false, "failed to resolve");
            });
    });

    QUnit.module("_addVirtualInboundsToApplications");

    QUnit.test("calls function correctly", function (assert) {
        this.oAdapter = new NavTargetResolutionAdapter({}, {}, {});
        const oApp = ObjectPath.get("oAdapterConfiguration.config.applications", this.oAdapter);
        assert.equal(Boolean(oApp["Action-search"]), true);
    });

    QUnit.module("resolveHashFragment", {
        beforeEach: function () {
            const oConfig = {
                config: {}
            };
            this.oFakeServer = sandbox.useFakeXMLHttpRequest();
            this.oAdapter = new NavTargetResolutionAdapter({}, {}, oConfig);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Promise Resolved", function (assert) {
        sandbox.stub(HttpClient.prototype, "post").returns(Promise.resolve({
            success: true,
            status: 200,
            responseText: JSON.stringify({ result: " test" })
        }));

        sandbox.stub(this.oAdapter, "_getIntentForService").returns(Promise.resolve({}));
        return this.oAdapter.resolveHashFragment()
            .then(() => {
                assert.ok(true, "resolved");
            })
            .catch(() => {
                assert.ok(false, "failed to resolve");
            });
    });

    QUnit.test("calls resolveHashFragment correctly if it resolves to an array", function (assert) {
        sandbox.stub(HttpClient.prototype, "post").returns(Promise.resolve({
            status: 200,
            responseText: JSON.stringify([
                {
                    bulkIndex: 0,
                    url: "https://my-test-url",
                    stateIdentifier: "test",
                    stateValidity: 1,
                    launchType: "auto"
                }
            ])
        }));

        sandbox.stub(this.oAdapter, "_getIntentForService").returns(Promise.resolve({}));
        return this.oAdapter.resolveHashFragment()
            .then((resolutionResult) => {
                assert.deepEqual({
                    additionalInformation: "",
                    url: "https://my-test-url",
                    applicationType: "URL",
                    navigationMode: "newWindow"
                }, resolutionResult, "The resolution result was as expected.");
            })
            .catch(() => {
                assert.ok(false, "failed to resolve");
            });
    });

    QUnit.test("calls resolveHashFragment correctly if it resolves to an object", function (assert) {
        sandbox.stub(HttpClient.prototype, "post").returns(Promise.resolve({
            status: 200,
            responseText: JSON.stringify(
                {
                    bulkIndex: 0,
                    url: "https://my-test-url",
                    stateIdentifier: "test",
                    stateValidity: 1,
                    launchType: "auto"
                })
        }));

        sandbox.stub(this.oAdapter, "_getIntentForService").returns(Promise.resolve({}));
        return this.oAdapter.resolveHashFragment()
            .then((resolutionResult) => {
                assert.deepEqual({
                    additionalInformation: "",
                    url: "https://my-test-url",
                    applicationType: "URL",
                    navigationMode: "newWindow"
                }, resolutionResult, "The resolution result was as expected.");
            })
            .catch(() => {
                assert.ok(false, "failed to resolve");
            });
    });

    QUnit.test("rejects if the response returns with ok: false", function (assert) {
        const done = assert.async();
        sandbox.stub(HttpClient.prototype, "post").returns(Promise.resolve({
            status: 404,
            responseText: JSON.stringify({ result: " test" })
        }));
        sandbox.stub(this.oAdapter, "_getIntentForService").returns(Promise.resolve({}));
        this.oAdapter.resolveHashFragment()
            .then(() => {
                assert.ok(false, "The promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "The promise was rejected");
            }).always(done);
    });

    QUnit.module("The function isIntentSupported", {
        beforeEach: function () {
            const oConfig = {
                config: {}
            };
            this.oAdapter = new NavTargetResolutionAdapter({}, {}, oConfig);
            return Container.init("local");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("returns empty object for empty input", function (assert) {
        return this.oAdapter.isIntentSupported([])
            .then((oResult) => {
                assert.deepEqual(oResult, {});
            });
    });

    QUnit.test("handles multiple intents", function (assert) {
        const aIntents = ["#Action-toappnavsample", "#Action-search"];
        return this.oAdapter.isIntentSupported(aIntents)
            .then((oResult) => {
                assert.deepEqual(oResult["#Action-toappnavsample"], { supported: false });
                assert.deepEqual(oResult["#Action-search"], { supported: false });
            });
    });

    QUnit.test("handles unsupported intents", function (assert) {
        // Simulate unsupported intent by removing from config
        const aIntents = ["#Unknown-intent"];
        return this.oAdapter.isIntentSupported(aIntents)
            .then((oResult) => {
                assert.deepEqual(oResult, { "#Unknown-intent": { supported: false } });
            });
    });

    QUnit.test("handles supported intents", function (assert) {
        const aIntents = ["#Action-toappnavsample"];

        // mock successful resolution
        sandbox.stub(this.oAdapter, "_resolveHashFragment").resolves({
            exists: true
        });

        return this.oAdapter.isIntentSupported(aIntents)
            .then((oResult) => {
                assert.deepEqual(oResult, { "#Action-toappnavsample": { supported: true } });
            });
    });

    QUnit.test("handles multiple intents successfully", function (assert) {
        const aIntents = ["#Action-toappnavsample", "#Action-search"];

        // mock successful resolution
        sandbox.stub(this.oAdapter, "_resolveHashFragment").resolves({
            exists: true
        });

        return this.oAdapter.isIntentSupported(aIntents)
            .then((oResult) => {
                assert.deepEqual(oResult["#Action-toappnavsample"], { supported: true });
                assert.deepEqual(oResult["#Action-search"], { supported: true });
            });
    });
});
