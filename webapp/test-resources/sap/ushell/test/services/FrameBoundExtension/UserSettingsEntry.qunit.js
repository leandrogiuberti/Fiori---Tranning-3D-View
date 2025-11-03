// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.FrameBoundExtension.UserSettingsEntry
 */
sap.ui.define([
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/services/FrameBoundExtension",
    "sap/ushell/services/FrameBoundExtension/UserSettingsEntry"
], (
    Container,
    EventHub,
    FrameBoundExtension,
    UserSettingsEntry
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("UserSettingsEntry", {
        beforeEach: function () {
            this.sUserSettingsEntryId = "myId1";
            this.oExtensionService = new FrameBoundExtension();
            const oGetRendererInternalStub = sandbox.stub(Container, "getRendererInternal");
            this.oAddUserPreferencesEntryStub = sandbox.stub().returns(this.sUserSettingsEntryId);
            const oShellControllerStub = sandbox.stub().returns({
                addUserPreferencesEntry: this.oAddUserPreferencesEntryStub
            });
            const oRendererMock = {
                getShellController: oShellControllerStub
            };
            oGetRendererInternalStub.returns(oRendererMock);

            this.oEventHubEmitSpy = sandbox.spy(EventHub, "emit");
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Creates a UserSettingsEntry", async function (assert) {
        // Arrange
        const oEntry = {
            title: "Test Title",
            value: "Test SubTitle",
            content: function () {},
            onSave: function () {},
            onCancel: function () {}
        };

        // Act
        const oUserSettingsEntry = await this.oExtensionService.addUserSettingsEntry(oEntry);
        oUserSettingsEntry.open();

        // Assert
        assert.deepEqual(this.oAddUserPreferencesEntryStub.getCall(0).args, [oEntry], "AddUserPreferencesEntry was called with correct arguments");
        assert.ok(oUserSettingsEntry instanceof UserSettingsEntry, "UserSettingsEntry was created");
        assert.strictEqual(this.oEventHubEmitSpy.getCall(0).args[0], "openUserSettings", "EventHub was called with correct arguments");
        assert.strictEqual(this.oEventHubEmitSpy.getCall(0).args[1].targetEntryId, this.sUserSettingsEntryId, "EventHub was called with correct arguments");
    });

    QUnit.test("Creates a GroupedUserSettingsEntry", async function (assert) {
        // Arrange
        const oEntry = {
            title: "Test Title",
            value: "Test SubTitle",
            content: function () {},
            onSave: function () {},
            onCancel: function () {}
        };

        // Act
        const oUserSettingsEntry = await this.oExtensionService.addGroupedUserSettingsEntry(oEntry);
        oUserSettingsEntry.open();

        // Assert
        assert.deepEqual(this.oAddUserPreferencesEntryStub.getCall(0).args, [oEntry, true], "AddUserPreferencesEntry was called with correct arguments");
        assert.ok(oUserSettingsEntry instanceof UserSettingsEntry, "UserSettingsEntry was created");
        assert.strictEqual(this.oEventHubEmitSpy.getCall(0).args[0], "openUserSettings", "EventHub was called with correct arguments");
        assert.strictEqual(this.oEventHubEmitSpy.getCall(0).args[1].targetEntryId, this.sUserSettingsEntryId, "EventHub was called with correct arguments");
    });
});
