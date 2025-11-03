// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.footerbar.JamShareButton
 */
sap.ui.define([
    "sap/collaboration/components/fiori/sharing/dialog/Component",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/JamShareButton",
    "sap/m/Text",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/Component",
    "sap/ushell/Container"
], (
    SharingComponent,
    AppCommunicationMgr,
    resources,
    JamShareButton,
    Text,
    jQuery,
    CoreComponent,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.sandbox.create();

    QUnit.module("sap.ushell.ui.footerbar.JamShareButton", {
        beforeEach: function () {
            sandbox.stub(Container, "getUser");
        },
        afterEach: function () {
            sandbox.restore();
        }
    }
    );

    QUnit.test("Constructor Test", function (assert) {
        const oJamShareButton = new JamShareButton();
        assert.strictEqual(oJamShareButton.getIcon(), "sap-icon://share-2", "Check button icon");
        assert.strictEqual(oJamShareButton.getText(), resources.i18n.getText("shareBtn"), "Check button title");
    });

    QUnit.test("showShareDialog Test", function (assert) {
        sandbox.spy(CoreComponent, "create");
        const oShareDialogOpenStub = sandbox.stub(SharingComponent.prototype, "open");

        this.oJamShareButton = new JamShareButton({
            jamData: {
                object: {
                    id: window.location.href,
                    display: new Text({ text: "Test title" }),
                    share: "sharing"
                }
            }
        });

        return this.oJamShareButton.showShareDialog()
            .then(() => {
                assert.ok(CoreComponent.create.calledOnce, "the create function of the CoreComponent was called once");
                assert.ok(oShareDialogOpenStub.calledOnce, "the open function of the share dialog component was called once");

                const oUsedArguments = CoreComponent.create.firstCall.args[0];
                assert.strictEqual(oUsedArguments.name, "sap.collaboration.components.fiori.sharing.dialog", "the expected component name was set.");
                assert.strictEqual(oUsedArguments.settings.object.id, window.location.href, "the expected id was set.");
                assert.strictEqual(oUsedArguments.settings.object.display.getText(), "Test title", "the expected text was set.");
                assert.strictEqual(oUsedArguments.settings.object.share, "sharing", "the expected share was set.");
            })
            .catch(() => {
                assert.ok(false, "Promise resolved");
            });
    });

    QUnit.test("showShareDialog in Work Zone, standard edition (fka cFLP) Test", function (assert) {
        const done = assert.async();

        sandbox.spy(CoreComponent, "create");
        sandbox.stub(SharingComponent.prototype, "createContent");

        const oJamShareButton = new JamShareButton({
            jamData: {
                object: {
                    id: window.location.href,
                    display: new Text({ text: "Test title" }),
                    share: "sharing"
                }
            }
        });

        sandbox.stub(AppCommunicationMgr, "sendMessageToOuterShell").returns(
            new jQuery.Deferred().resolve("www.flp.com").promise()
        );

        sandbox.stub(Container, "inAppRuntime").returns(true);
        const oGetFLPUrlSpy = sandbox.stub(Container, "getFLPUrl").callsFake((bIncludeHash) => {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.Container.getFLPUrl", {
                bIncludeHash: bIncludeHash
            });
        });

        sandbox.stub(SharingComponent.prototype, "open").callsFake(() => {
            assert.ok(AppCommunicationMgr.sendMessageToOuterShell.calledOnce, "sendMessageToOuterShell should be called only once");
            assert.ok(oGetFLPUrlSpy.calledOnce, "getFLPUrl should be called only once");

            assert.ok(CoreComponent.create.calledOnce, "the create function of the CoreComponent was called once");

            const oUsedArguments = CoreComponent.create.firstCall.args[0];
            assert.strictEqual(oUsedArguments.settings.object.id, "www.flp.com", "the expected id was set.");
            assert.strictEqual(oUsedArguments.settings.object.display.getText(), "Test title", "the expected text was set.");
            assert.strictEqual(oUsedArguments.settings.object.share, "sharing", "the expected share was set.");

            done();
        });

        oJamShareButton.showShareDialog();
    });

    QUnit.test("adjustFLPUrl", function (assert) {
        const done = assert.async();
        const oJamShareButton = new JamShareButton();

        sandbox.stub(AppCommunicationMgr, "sendMessageToOuterShell").returns(
            new jQuery.Deferred().resolve("www.flp.com").promise()
        );

        const oGetFLPUrlStub = sandbox.stub(Container, "getFLPUrl").callsFake((bIncludeHash) => {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.Container.getFLPUrl", {
                bIncludeHash: bIncludeHash
            });
        });

        const oJamData = {
            object: {
                id: window.location.href,
                share: "static text to share in JAM together with the URL"
            }
        };

        oJamShareButton.adjustFLPUrl(oJamData).then(() => {
            assert.ok(AppCommunicationMgr.sendMessageToOuterShell.calledOnce, "sendMessageToOuterShell should be called only once");
            assert.ok(oGetFLPUrlStub.calledOnce, "getFLPUrl should be called only once");
            assert.strictEqual(oJamData.object.id, "www.flp.com");
            assert.strictEqual(oJamData.object.share, "static text to share in JAM together with the URL");
            done();
        });
    });
});
