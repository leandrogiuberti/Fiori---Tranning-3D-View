// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.footerbar.JamDiscussButton
 */
sap.ui.define([
    "sap/collaboration/components/fiori/feed/dialog/Component",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/JamDiscussButton",
    "sap/m/Text",
    "sap/ui/core/Component",
    "sap/ushell/Container"
], (
    FeedDialogComponent,
    resources,
    JamDiscussButton,
    Text,
    CoreComponent,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.sandbox.create();

    QUnit.module("sap.ushell.ui.footerbar.JamDiscussButton", {
        beforeEach: function () {
            sandbox.stub(Container, "getUser").returns({
                isJamActive: () => true
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Constructor Test", function (assert) {
        const JamDiscussDialog = new JamDiscussButton();
        assert.strictEqual(JamDiscussDialog.getIcon(), "sap-icon://discussion-2", "Check dialog icon");
        assert.strictEqual(JamDiscussDialog.getText(), resources.i18n.getText("discussBtn"), "Check dialog title");
    });

    QUnit.test("showDiscussDialog Test", function (assert) {
        const done = assert.async();
        sandbox.spy(CoreComponent, "create");
        sandbox.stub(FeedDialogComponent.prototype, "createContent");

        const JamDiscussDialog = new JamDiscussButton({
            jamData: {
                object: {
                    id: window.location.href,
                    display: new Text({ text: "Test One" })
                },
                oDataServiceUrl: "Some url",
                feedType: "type",
                groupIds: "noGroups"
            }
        });

        // Show the dialog
        JamDiscussDialog.showDiscussDialog();

        sandbox.stub(FeedDialogComponent.prototype, "open").callsFake(() => {
            const oUsedArguments = CoreComponent.create.firstCall.args[0];
            assert.strictEqual(oUsedArguments.settings.object.id, window.location.href, "the expected id was set.");
            assert.strictEqual(oUsedArguments.settings.object.display.getText(), "Test One", "the expected text was set.");
            assert.strictEqual(oUsedArguments.settings.oDataServiceUrl, "Some url", "the expected oDataServiceUrl was set.");
            assert.strictEqual(oUsedArguments.settings.feedType, "type", "the expected feedType was set.");
            assert.strictEqual(oUsedArguments.settings.groupIds, "noGroups", "the expected groupIds was set.");

            sandbox.restore();
            done();
        });
    });
});
