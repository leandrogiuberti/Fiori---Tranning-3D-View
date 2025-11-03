// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview QUnit tests for sap.ushell.components.shell.searchCEP.SearchProviders.SearchServiceProvider
 */

sap.ui.define([
    "sap/ushell/components/shell/SearchCEP/SearchProviders/SearchServiceProvider",
    "sap/ushell/Container"
], (SearchServiceProvider, Container) => {
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
        assert.ok(typeof SearchServiceProvider.getName() === "string", "getName returned a string");
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
        const oPromises = {};
        const oGroups = {
            applications: 12,
            homePageApplications: 10,
            externalSearchApplications: 3
        };

        Object.keys(oGroups).forEach((sGroupKey) => {
            oPromises[sGroupKey] = SearchServiceProvider.execSearch("App", sGroupKey);
        });

        return Promise.all(
            Object.values(oPromises)
        ).then((aResult) => {
            assert.equal(aResult[0].length, oGroups.applications, `search returned ${aResult[0].length} applications`);
            assert.equal(aResult[1].length, oGroups.homePageApplications, `search returned ${aResult[1].length} homePageApplications`);
            assert.equal(aResult[2].length, oGroups.externalSearchApplications, `search returned ${aResult[2].length} externalSearchApplications`);
        });
    });
});
