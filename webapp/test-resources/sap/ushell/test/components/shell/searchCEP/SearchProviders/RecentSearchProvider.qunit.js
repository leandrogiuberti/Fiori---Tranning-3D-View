// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview QUnit tests for sap.ushell.components.shell.searchCEP.SearchProviders.RecentSearchProvider
 */

sap.ui.define([
    "sap/ushell/components/shell/SearchCEP/SearchProviders/RecentSearchProvider",
    "sap/ushell/Container"
], (RecentSearchProvider, Container) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.sandbox.create();

    QUnit.module("execSearch", {
        beforeEach: function (assert) {
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("getName returns string", function (assert) {
        assert.ok(typeof RecentSearchProvider.getName() === "string", "getName returned a string");
    });

    QUnit.module("execSearch", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            Container.init("local").then(() => {
                fnDone();
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("execSearch result ok", function (assert) {
        return RecentSearchProvider.execSearch("dummy").then((aResult) => {
            assert.ok(true, "The promise was resolved");
            assert.strictEqual(Array.isArray(aResult), true, "The promise was resolved with array");
        });
    });
});
