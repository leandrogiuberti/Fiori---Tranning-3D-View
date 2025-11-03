// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.Ui5NativeServiceFactory
 */
sap.ui.define([
    "sap/ushell/Ui5NativeServiceFactory",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service"
], (
    Ui5NativeServiceFactory,
    ServiceFactory,
    Service
) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("createServiceFactory");

    QUnit.test("creates a registerable service factory", function (assert) {
        // Act
        const oServiceFactory = Ui5NativeServiceFactory.createServiceFactory("MY_SERVICE");
        // Assert
        assert.ok(oServiceFactory instanceof ServiceFactory, "The returned service factory is an instance of sap.ui.core.service.ServiceFactory");
    });

    QUnit.module("createInstance", {
    });
    QUnit.test("creates and returns a new service if the service is not created yet", function (assert) {
        const done = assert.async();

        // Arrange
        function fnRequire (aModules, fnFactory) {
            if (aModules[0] === "sap/ushell/ui5service/MockService") {
                fnFactory(Service);
            }
        }
        const oRequireStub = sinon.stub(sap.ui, "require").callsFake(fnRequire);
        const oServiceFactory = Ui5NativeServiceFactory.createServiceFactory("MockService");

        // Act
        oServiceFactory.createInstance().then((service) => {
            // Assert
            assert.ok(service instanceof Service, "The correct service is created");
            oRequireStub.restore();
            done();
        });
    });

    QUnit.test("returns the existing service if there is one", function (assert) {
        const done = assert.async();

        // Arrange
        const oService = { "I am": "a service" };
        Ui5NativeServiceFactory._servicePromises = {
            xx: Promise.resolve(oService)
        };
        const oServiceFactory = Ui5NativeServiceFactory.createServiceFactory("xx");

        // Act
        oServiceFactory.createInstance().then((service) => {
            // Assert
            assert.strictEqual(service, oService, "The correct service is returned");
            done();
        });
    });

    QUnit.test("reject for services that don't exist", function (assert) {
        const done = assert.async();
        // Arrange
        function fnRequire () {
            throw new Error("not found");
        }
        const oRequireStub = sinon.stub(sap.ui, "require").callsFake(fnRequire);
        const oServiceFactory = Ui5NativeServiceFactory.createServiceFactory();

        // Act
        oServiceFactory.createInstance().catch(() => {
            // Assert
            assert.ok(true, "The service creation was rejected");
            oRequireStub.restore();
            done();
        });
    });
});
