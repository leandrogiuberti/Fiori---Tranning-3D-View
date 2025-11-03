// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.ApplicationContainerCache
 */
sap.ui.define([
    "sap/ui/VersionInfo",
    "sap/ui/core/EventBus",
    "sap/ushell/Container",
    "sap/ushell/utils",
    "sap/ushell/appIntegration/ApplicationContainerCache",
    "sap/ushell/appIntegration/ApplicationContainer"
], (
    VersionInfo,
    EventBus,
    Container,
    ushellUtils,
    ApplicationContainerCache,
    ApplicationContainer
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("setContainerActive", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Ignores the call if container is undefined", async function (assert) {
        // Act
        ApplicationContainerCache.setContainerActive(undefined);

        // Assert
        assert.strictEqual(ApplicationContainerCache.getLength(), 0, "No container was added");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 0, "No container was added to the pool");
    });

    QUnit.test("Sets the active container", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Assert
        assert.strictEqual(ApplicationContainerCache.getLength(), 1, "The container was added");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 0, "The container was not added to the pool");
    });

    QUnit.test("Container can be set multiple times active", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        ApplicationContainerCache.setContainerActive(oApplicationContainer);
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Assert
        assert.strictEqual(ApplicationContainerCache.getLength(), 1, "The container was added");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 0, "The container was not added to the pool");
    });

    QUnit.test("Reuseable container moves automatically to active containers", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, "");

        // Act
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Assert
        assert.strictEqual(ApplicationContainerCache.getLength(), 1, "The container was added");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 0, "The container was removed from the pool");
    });

    QUnit.module("setContainerReadyForReuse", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Ignores the call if container is undefined", async function (assert) {
        // Act
        ApplicationContainerCache.setContainerReadyForReuse(undefined, "");

        // Assert
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 0, "No container was added");
        assert.strictEqual(ApplicationContainerCache.getLength(), 0, "No container was not added to active containers");
    });

    QUnit.test("Adds the container to pool", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, "");

        // Assert
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 1, "The container was added");
        assert.strictEqual(ApplicationContainerCache.getLength(), 0, "No container was not added to active containers");
    });

    QUnit.test("Container can be added multiple times to pool", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, "");
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, "");

        // Assert
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 1, "The container was added");
        assert.strictEqual(ApplicationContainerCache.getLength(), 0, "No container was not added to active containers");
    });

    QUnit.test("Reuseable container moves automatically to pool", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, "");

        // Assert
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 1, "The container was moved to the pool");
        assert.strictEqual(ApplicationContainerCache.getLength(), 0, "The container was removed from active containers");
    });

    QUnit.module("findFreeContainerByUrl", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Returns undefined if no container was added", async function (assert) {
        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl("");

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
    });

    QUnit.test("Does not return the active containers", async function (assert) {
        // Arrange
        ApplicationContainerCache.setContainerActive(new ApplicationContainer());

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl("");

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
    });

    QUnit.test("Returns the container if one is available", async function (assert) {
        // Arrange
        const sUrl = "";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
    });

    QUnit.test("Returns the container which was added to pool last", async function (assert) {
        // Arrange
        const sUrl = "";
        const oApplicationContainer1 = new ApplicationContainer();
        const oApplicationContainer2 = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer1, sUrl);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer2, sUrl);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer2, "Correct container was found");
    });

    QUnit.module("canBeReused", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Returns false if container is undefined", async function (assert) {
        // Act
        const bCanReused = ApplicationContainerCache.canBeReused(undefined, "");

        // Assert
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Returns false if the container is active", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, "");

        // Assert
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.module("Reuse of containers", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Allows reuse for same url - even when original was relative", async function (assert) {
        // Arrange
        const sRelativeUrl = "";
        const sAbsoluteUrl = "https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sRelativeUrl);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sAbsoluteUrl);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sAbsoluteUrl);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Allows reuse - even with different path segments", async function (assert) {
        // Arrange
        const sRelativeUrl = "..a/b/c";
        const sAbsoluteUrl = "https://www.myfiorilaunchpad.com:1234/1/2/3";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sRelativeUrl);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sAbsoluteUrl);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sAbsoluteUrl);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Allows reuse - even with different casing", async function (assert) {
        // Arrange
        const sLowerCaseUrl = "https://www.myfiorilaunchpad.com:1234";
        const sUpperCaseUrl = "HTTPS://WWW.MYFIORILAUNCHPAD.COM:1234";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sLowerCaseUrl);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUpperCaseUrl);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUpperCaseUrl);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Does not allow reuse for different port", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234";
        const sUrl2 = "https://www.myfiorilaunchpad.com:6666";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Defaults to port 443 for https", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:443";
        const sUrl2 = "https://www.myfiorilaunchpad.com";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache._getWindowLocationHref.returns(sUrl1);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, undefined);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Defaults to port 80 for http", async function (assert) {
        // Arrange
        const sUrl1 = "http://www.myfiorilaunchpad.com:80";
        const sUrl2 = "http://www.myfiorilaunchpad.com";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache._getWindowLocationHref.returns(sUrl1);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, undefined);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Does not allow reuse for different protocols", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234";
        const sUrl2 = "http://www.myfiorilaunchpad.com:1234";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Does not allow reuse for different iframe hints", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-iframe-hint=ABC";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234?sap-iframe-hint=DEF";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Does not allow reuse for different ui versions", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-ui-version=1.84";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234?sap-ui-version=1.108";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Does not allow reuse for different async hints", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-async-loading=true";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234?sap-async-loading=false";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Allows reuse when async hint = 'true' and omitted", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-async-loading=true";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Does not allow reuse for different fesr hints", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-enable-fesr=true";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234?sap-enable-fesr=false";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.test("Allows reuse when fesr hint = 'false' and omitted", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-enable-fesr=false";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
        assert.strictEqual(bCanReused, true, "Container can be reused");
    });

    QUnit.test("Does not allow reuse for different iframe test ids", async function (assert) {
        // Arrange
        const sUrl1 = "https://www.myfiorilaunchpad.com:1234?sap-testcflp-iframeid=ABC";
        const sUrl2 = "https://www.myfiorilaunchpad.com:1234?sap-testcflp-iframeid=DEF";
        const oApplicationContainer = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, sUrl1);

        // Act
        const oContainer = ApplicationContainerCache.findFreeContainerByUrl(sUrl2);
        const bCanReused = ApplicationContainerCache.canBeReused(oApplicationContainer, sUrl2);

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
        assert.strictEqual(bCanReused, false, "Container cannot be reused");
    });

    QUnit.module("removeByContainer", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Ignores the call if container is undefined", async function (assert) {
        // Arrange
        const oApplicationContainer1 = new ApplicationContainer();
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);
        const oApplicationContainer2 = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer2);

        // Act
        ApplicationContainerCache.removeByContainer(undefined);

        // Assert
        assert.strictEqual(ApplicationContainerCache.getLength(), 1, "Container was not removed");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 1, "Container was not removed from the pool");
    });

    QUnit.test("Removes container from active containers", async function (assert) {
        // Arrange
        const oApplicationContainer1 = new ApplicationContainer();
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);
        const oApplicationContainer2 = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer2);

        // Act
        ApplicationContainerCache.removeByContainer(oApplicationContainer1);
        const oContainer = ApplicationContainerCache.getById(oApplicationContainer1.getId());

        // Assert
        assert.strictEqual(oContainer, undefined, "Container was removed");
        assert.strictEqual(ApplicationContainerCache.getLength(), 0, "Container was removed");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 1, "Container was not removed from the pool");
    });

    QUnit.test("Removes container from reusable containers", async function (assert) {
        // Arrange
        const oApplicationContainer1 = new ApplicationContainer();
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);
        const oApplicationContainer2 = new ApplicationContainer();
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer2);

        // Act
        ApplicationContainerCache.removeByContainer(oApplicationContainer2);
        const oContainer = ApplicationContainerCache.getById(oApplicationContainer2.getId());

        // Assert
        assert.strictEqual(oContainer, undefined, "Container was removed");
        assert.strictEqual(ApplicationContainerCache.getLength(), 1, "Container was not removed");
        assert.strictEqual(ApplicationContainerCache.getPoolLength(), 0, "Container was removed from the pool");
    });

    QUnit.module("getById", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Returns undefined if the container does not exist", async function (assert) {
        // Arrange
        new ApplicationContainer("notRegisteredId");

        // Act
        const oContainer = ApplicationContainerCache.getById("notRegisteredId");

        // Assert
        assert.strictEqual(oContainer, undefined, "No container was found");
    });

    QUnit.test("container when it is active", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer("container1");
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        const oContainer = ApplicationContainerCache.getById("container1");

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
    });

    QUnit.test("container when it is in pool", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer("container1");
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer);

        // Act
        const oContainer = ApplicationContainerCache.getById("container1");

        // Assert
        assert.strictEqual(oContainer, oApplicationContainer, "Correct container was found");
    });

    QUnit.module("getAll", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Returns active and ready containers", async function (assert) {
        // Arrange
        const oActiveContainer = new ApplicationContainer("activeContainer");
        ApplicationContainerCache.setContainerActive(oActiveContainer);

        const oReadyContainer = new ApplicationContainer("readyContainer");
        ApplicationContainerCache.setContainerReadyForReuse(oReadyContainer);

        // Act
        const aContainers = ApplicationContainerCache.getAll();

        // Assert
        assert.strictEqual(aContainers.length, 2, "Two containers were found");
        assert.strictEqual(aContainers.includes(oActiveContainer), true, "Active container was found");
        assert.strictEqual(aContainers.includes(oReadyContainer), true, "Ready container was found");
    });

    QUnit.module("forEach", {
        beforeEach: async function () {
            sandbox.stub(ApplicationContainerCache, "_getWindowLocationHref").returns("https://www.myfiorilaunchpad.com:1234/my/path/to/the/FLP");
        },
        afterEach: async function () {
            sandbox.restore();
            ApplicationContainerCache.destroyAllContainers();
        }
    });

    QUnit.test("Iterates over all containers", async function (assert) {
        // Arrange
        const oApplicationContainer1 = new ApplicationContainer("container1");
        const oApplicationContainer2 = new ApplicationContainer("container2");
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer2);

        // Act
        const aContainers = [];
        ApplicationContainerCache.forEach((oContainer) => {
            aContainers.push(oContainer);
        });

        // Assert
        assert.strictEqual(aContainers.length, 2, "Both containers were found");
        assert.strictEqual(aContainers.includes(oApplicationContainer1), true, "First container was found");
        assert.strictEqual(aContainers.includes(oApplicationContainer2), true, "Second container was found");
    });

    QUnit.test("Awaits all async callbacks", async function (assert) {
        // Arrange
        assert.expect(3);
        const oApplicationContainer1 = new ApplicationContainer("container1");
        const oApplicationContainer2 = new ApplicationContainer("container2");
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer2);

        const oAsyncCallback = sandbox.stub().callsFake(async () => {
            await ushellUtils.awaitTimeout(10);
            assert.ok(true, "Async callback was called");
        });

        // Act
        await ApplicationContainerCache.forEach(oAsyncCallback);

        // Assert
        assert.strictEqual(oAsyncCallback.callCount, 2, "Both containers were processed");
    });
});
