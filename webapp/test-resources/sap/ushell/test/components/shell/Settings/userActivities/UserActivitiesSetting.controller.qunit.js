// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/MessageToast",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/resources",
    "sap/ushell/components/shell/Settings/userActivities/UserActivitiesSetting.controller",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Container"
], (
    Log,
    MessageToast,
    jQuery,
    Config,
    JSONModel,
    ushellResources,
    UserActivitiesSettingController,
    SharedComponentUtils,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.sandbox.create();

    QUnit.module("The onInit method", {
        beforeEach: function () {
            this.oController = new UserActivitiesSettingController();
            this.oSetModelStub = sandbox.stub();
            this.oGetViewStub = sandbox.stub(this.oController, "getView").returns({
                setModel: this.oSetModelStub
            });
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("sets the checkboxIsChecked property initially to 'true' in case the config parameter is 'true'.", function (assert) {
        // Arrange
        Config.emit("/core/shell/model/enableTrackingActivity", true);
        // Act
        this.oController.onInit();
        // Assert
        assert.deepEqual(
            this.oSetModelStub.firstCall.args[0].getProperty("/checkboxIsChecked"),
            true,
            "The checkboxIsChecked property was set to 'true'."
        );
    });

    QUnit.test("sets the checkboxIsChecked property initially to 'false' in case the config parameter is 'false'.", function (assert) {
        // Arrange
        Config.emit("/core/shell/model/enableTrackingActivity", false);
        // Act
        this.oController.onInit();
        // Assert
        assert.deepEqual(this.oSetModelStub.firstCall.args[0].getProperty("/checkboxIsChecked"),
            false,
            "The checkboxIsChecked property was set to 'false'."
        );
    });

    QUnit.test("sets the checkboxIsChecked property initially to 'true' in case the config parameter is 'undefined'.", function (assert) {
        // Arrange
        Config.emit("/core/shell/model/enableTrackingActivity", undefined);
        // Act
        this.oController.onInit();
        // Assert
        assert.deepEqual(this.oSetModelStub.firstCall.args[0].getProperty("/checkboxIsChecked"),
            true,
            "The checkboxIsChecked property was set to 'true'."
        );
    });

    QUnit.test("sets the i18n model.", function (assert) {
        // Act
        this.oController.onInit();
        // Assert
        assert.deepEqual(this.oSetModelStub.secondCall.args,
            [ushellResources.i18nModel, "i18n"],
            "The i18n model was set."
        );
    });

    QUnit.module("The onCancel method", {
        beforeEach: function () {
            this.oController = new UserActivitiesSettingController();
            this.oController.oModel = new JSONModel({ checkboxIsChecked: undefined });
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("sets the checkboxIsChecked back to 'true' in case the config parameter is 'true'.", function (assert) {
        // Arrange
        Config.emit("/core/shell/model/enableTrackingActivity", true);
        // Act
        this.oController.onCancel();
        // Assert
        assert.deepEqual(
            this.oController.oModel.getProperty("/checkboxIsChecked"),
            true,
            "The checkboxIsChecked property was set to 'true'."
        );
    });

    QUnit.test("sets the checkboxIsChecked back to 'false' in case the config parameter is 'false'.", function (assert) {
        // Arrange
        Config.emit("/core/shell/model/enableTrackingActivity", false);
        // Act
        this.oController.onCancel();
        // Assert
        assert.deepEqual(
            this.oController.oModel.getProperty("/checkboxIsChecked"),
            false,
            "The checkboxIsChecked property was set to 'false'."
        );
    });

    QUnit.test("sets the checkboxIsChecked back to 'true' in case the config parameter is 'undefined'.", function (assert) {
        // Arrange
        Config.emit("/core/shell/model/enableTrackingActivity", undefined);
        // Act
        this.oController.onCancel();
        // Assert
        assert.deepEqual(
            this.oController.oModel.getProperty("/checkboxIsChecked"),
            true,
            "The checkboxIsChecked property was set to 'true'."
        );
    });

    QUnit.module("The onSave method", {
        beforeEach: function () {
            this.oController = new UserActivitiesSettingController();
            this.oController.oModel = new JSONModel({ checkboxIsChecked: undefined });
            this.oSetTrackingToEnabledStub = sandbox.stub(this.oController, "_setTrackingToEnabled");
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("does not call the _setTrackingToEnabled method in case nothing was changed.", function (assert) {
        // Arrange
        const fnDone = assert.async();
        Config.emit("/core/shell/model/enableTrackingActivity", false);
        this.oController.oModel.setProperty("/checkboxIsChecked", false);

        // Act
        this.oController.onSave().then(() => {
            // Assert
            assert.strictEqual(this.oSetTrackingToEnabledStub.callCount, 0, "_setTrackingToEnabled was not called.");
            // Reset
            fnDone();
        });
    });

    QUnit.test("calls the _setTrackingToEnabled method in case the checkbox changed from unchecked to checked.", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.oSetTrackingToEnabledStub.returns(Promise.resolve());
        Config.emit("/core/shell/model/enableTrackingActivity", false);
        this.oController.oModel.setProperty("/checkboxIsChecked", true);

        // Act
        this.oController.onSave().then(() => {
            // Assert
            assert.strictEqual(this.oSetTrackingToEnabledStub.callCount, 1, "_setTrackingToEnabled was not called.");
            // Reset
            fnDone();
        });
    });

    QUnit.test("calls the _setTrackingToEnabled method in case the checkbox changed from checked to unchecked.", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.oSetTrackingToEnabledStub.returns(Promise.resolve());
        Config.emit("/core/shell/model/enableTrackingActivity", true);
        this.oController.oModel.setProperty("/checkboxIsChecked", false);

        // Act
        this.oController.onSave().then(() => {
            // Assert
            assert.strictEqual(this.oSetTrackingToEnabledStub.callCount, 1, "_setTrackingToEnabled was not called.");
            // Reset
            fnDone();
        });
    });

    QUnit.module("The _setTrackingToEnabled method", {
        beforeEach: function () {
            this.oController = new UserActivitiesSettingController();
            this.oLogErrorSpy = sandbox.spy(Log, "error");
            sandbox.stub(Container, "getRendererInternal").returns({ FAKE: "RENDERER" });

            this.oSetPersDataStub = sandbox.stub().returns(jQuery.Deferred().resolve());
            this.oGetPersonalizer = sandbox.stub(SharedComponentUtils, "getPersonalizer").returns(Promise.resolve({
                setPersData: this.oSetPersDataStub
            }));
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("can set the 'enableTrackingActivity' to 'true' if the was promise resolved.", function (assert) {
        const done = assert.async();

        this.oController._setTrackingToEnabled(true)
            .then(() => {
                assert.strictEqual(
                    Config.last("/core/shell/model/enableTrackingActivity"),
                    true,
                    "The 'enableTrackingActivity' property was set to 'true'."
                );
            })
            .catch(() => {
                assert.ok(false, "An error occurred and the promise was rejected.");
            })
            .finally(done);
    });

    QUnit.test("can set the 'enableTrackingActivity' to 'false' if the was promise resolved.", function (assert) {
        const done = assert.async();

        this.oController._setTrackingToEnabled(false)
            .then(() => {
                assert.strictEqual(
                    Config.last("/core/shell/model/enableTrackingActivity"),
                    false,
                    "The 'enableTrackingActivity' property was set to 'false'."
                );
            })
            .catch(() => {
                assert.ok(false, "An error occurred and the promise was rejected.");
            })
            .finally(done);
    });

    QUnit.test("does not change the 'enableTrackingActivity' property if the promise was rejected.", function (assert) {
        const done = assert.async();
        Config.emit("/core/shell/model/enableTrackingActivity", "FAKE");
        this.oSetPersDataStub.returns(new jQuery.Deferred().reject(new Error("Failed intentionally")));

        this.oController._setTrackingToEnabled(false)
            .then(() => {
                assert.ok(false, "The promise should have been rejected.");
            })
            .catch(() => {
                assert.strictEqual(
                    Config.last("/core/shell/model/enableTrackingActivity"),
                    "FAKE",
                    "The 'enableTrackingActivity' property was not changed."
                );
            })
            .finally(done);
    });

    QUnit.test("logs an error if the promise was rejected.", function (assert) {
        const done = assert.async();
        this.oSetPersDataStub.returns(new jQuery.Deferred().reject(new Error("Failed intentionally")));

        this.oController._setTrackingToEnabled(false)
            .then(() => {
                assert.ok(false, "The promise should have been rejected.");
            })
            .catch(() => {
                assert.strictEqual(this.oLogErrorSpy.callCount, 1, "Exactly one error was written into the Log.");
            })
            .finally(done);
    });

    QUnit.module("The onClearHistory method", {
        beforeEach: function () {
            this.oController = new UserActivitiesSettingController();
            sandbox.stub(MessageToast, "show");
            this.oClearRecentActivitiesStub = sandbox.stub().resolves();
            sandbox.stub(Container, "getServiceAsync").withArgs("UserRecents").resolves({
                clearRecentActivities: this.oClearRecentActivitiesStub
            });
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("calls the clearRecentActivities method, if the history was cleared successfully.", async function (assert) {
        // Act
        await this.oController.onClearHistory();

        // Assert
        assert.strictEqual(this.oClearRecentActivitiesStub.callCount, 1, "The clearRecentActivities method of the service was called.");
    });

    QUnit.test("shows a confirmation message toast, if the history was cleared successfully.", async function (assert) {
        // Act
        await this.oController.onClearHistory();

        // Assert
        assert.strictEqual(MessageToast.show.callCount, 1, "The show method was called.");
    });

    QUnit.test("shows no confirmation message toast, if the history clearing failed.", async function (assert) {
        // Arrange
        this.oClearRecentActivitiesStub.rejects(new Error("Failed intentionally"));

        // Act
        try {
            await this.oController.onClearHistory();
        } catch (oError) {
            // Assert
            assert.strictEqual(MessageToast.show.callCount, 0, "The show method was not called.");
        }
    });
});
