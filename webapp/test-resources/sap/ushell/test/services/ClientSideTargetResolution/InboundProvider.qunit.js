// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for ClientSideTargetResolution's InboundProvider
 */
sap.ui.define([
    "sap/ushell/services/ClientSideTargetResolution/InboundProvider",
    "sap/ushell/services/ClientSideTargetResolution/InboundIndex",
    "sap/ushell/services/ClientSideTargetResolution/VirtualInbounds",
    "sap/ushell/test/utils",
    "sap/ushell/utils",
    "sap/ui/thirdparty/jquery"
], (InboundProvider, oInboundIndex, oVirtualInbounds, testUtils, utils, jQuery) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("InboundProvider", {
        beforeEach: function () {
            // stub all dependencies
            sinon.stub(oInboundIndex, "createIndex");
            sinon.stub(oVirtualInbounds, "getInbounds");
        },
        afterEach: function () {
            testUtils.restoreSpies(
                InboundProvider.prototype._init,
                oInboundIndex.createIndex,
                oVirtualInbounds.getInbounds
            );
        }
    });

    QUnit.test("InboundProvider: calls _init during construction", function (assert) {
        sinon.stub(InboundProvider.prototype, "_init");

        new InboundProvider();

        assert.strictEqual(InboundProvider.prototype._init.callCount,
            1, "InboundProvider#_init was called once");
    });

    QUnit.test("getInbounds: calls the inbound retrieval function when called", function (assert) {
        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve([])
        );

        const oProvider = new InboundProvider(fnRetrieveInbound);

        return oProvider.getInbounds()
            .then(() => {
                assert.ok(true, "promise was resolved");

                assert.strictEqual(fnRetrieveInbound.callCount, 1,
                    "Inbound retrieval function was called once");
            });
    });

    QUnit.test("getInbounds: calls the the inbound retrieval function with the segment when the call is made with the segment argument", function (assert) {
        const fnAssertAsync = assert.async();

        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve([])
        );

        const oProvider = new InboundProvider(fnRetrieveInbound);

        oProvider.getInbounds("TheSegment")
            .then(() => {
                assert.ok(true, "promise was resolved");

                assert.strictEqual(fnRetrieveInbound.callCount, 1,
                    "Inbound retrieval function was called once");

                assert.deepEqual(fnRetrieveInbound.getCall(0).args, ["TheSegment"], "Call was made with the expected arguments");
            })
            .catch((oError) => {
                assert.ok(false, "promise was resolved");
            })
            .then(fnAssertAsync);
    });

    QUnit.test("getInbounds: does not call the inbound retrieval function again when called twice", function (assert) {
        const fnAssertAsync = assert.async();

        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve([])
        );

        const oProvider = new InboundProvider(fnRetrieveInbound);

        Promise.all([oProvider.getInbounds(), oProvider.getInbounds()])
            .then(() => {
                assert.ok(true, "both promises were resolved");

                assert.strictEqual(fnRetrieveInbound.callCount, 1,
                    "Inbound retrieval function was called once");
            })
            .catch((oError) => {
                assert.ok(false, `both promises were resolved. ERROR: ${oError.message}`);
            })
            .then(fnAssertAsync);
    });

    QUnit.test("getInbounds: calls the inbound retrieval function twice when call is made with segment argument", function (assert) {
        const fnAssertAsync = assert.async();

        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve([])
        );

        const oProvider = new InboundProvider(fnRetrieveInbound);

        Promise.all([oProvider.getInbounds("segment1"), oProvider.getInbounds("segment2")])
            .then(() => {
                assert.ok(true, "both promises were resolved");

                assert.strictEqual(fnRetrieveInbound.callCount, 2,
                    "Inbound retrieval function was called twice");
            })
            .catch((oError) => {
                assert.ok(false, `both promises were resolved. ERROR: ${oError.message}`);
            })
            .then(fnAssertAsync);
    });

    QUnit.test("getInbounds: returns an index of the inbounds when called without segment argument", function (assert) {
        const fnAssertAsync = assert.async();

        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve(["inbound1", "inbound2"])
        );

        const oFakeIndex = {
            inbound1: true,
            inbound2: true
        };

        oInboundIndex.createIndex.returns(oFakeIndex);

        const oProvider = new InboundProvider(fnRetrieveInbound);

        oProvider.getInbounds()
            .then((oInboundIndex) => {
                assert.ok(true, "promise was resolved");

                assert.deepEqual(oInboundIndex, oFakeIndex,
                    "Indexed inbounds were returned");
            })
            .catch((oError) => {
                assert.ok(false, "promise was resolved");
            })
            .then(fnAssertAsync);
    });

    QUnit.test("getInbounds: returns an index of the inbounds when called with segment argument", function (assert) {
        const fnAssertAsync = assert.async();

        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve(["inbound1", "inbound2"])
        );

        const oFakeIndex = {
            inbound1: true,
            inbound2: true
        };

        oInboundIndex.createIndex.returns(oFakeIndex);

        const oProvider = new InboundProvider(fnRetrieveInbound);

        oProvider.getInbounds("TheSegment")
            .then((oInboundIndex) => {
                assert.ok(true, "promise was resolved");

                assert.deepEqual(oInboundIndex, oFakeIndex,
                    "Indexed inbounds were returned");
            })
            .catch((oError) => {
                assert.ok(false, "promise was resolved");
            })
            .then(fnAssertAsync);
    });

    QUnit.test("getInbounds: concatenates virtual inbounds to the response", function (assert) {
        const fnAssertAsync = assert.async();
        // Assuming the index is created after the inbound set to return is determined,
        // this can be tested by checking that the we are going to test this by checking that the index is created on the
        const aFakeVirtualInbounds = ["fake1", "fake2", "fake3"];
        const aFakeInbounds = ["inbound1", "inbound2"];

        const fnRetrieveInbound = sinon.stub().returns(
            new jQuery.Deferred().resolve(aFakeInbounds)
        );

        oVirtualInbounds.getInbounds.returns(aFakeVirtualInbounds);

        const oProvider = new InboundProvider(fnRetrieveInbound);

        oProvider.getInbounds()
            .then(() => {
                assert.ok(true, "promise was resolved");

                assert.deepEqual(oInboundIndex.createIndex.getCall(0).args, [
                    aFakeInbounds.concat(aFakeVirtualInbounds)
                ], "create index was called on the base + virtual inbound set");
            })
            .catch((oError) => {
                assert.ok(false, "promise was resolved");
            })
            .then(fnAssertAsync);
    });
});
