// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.appfinder.Component
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config",
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/resources"
], (
    Element,
    Container,
    oEventHub,
    SharedComponentUtils,
    Config,
    Component,
    Controller,
    ushellResources
) => {
    "use strict";

    /* global QUnit, sinon, hasher */
    const sandbox = sinon.sandbox.create();

    const sComponentName = "sap.ushell.components.appfinder";
    const oComponentData = {
        config: {
            enableSetTheme: true,
            enableHelp: true,
            preloadLibrariesForRootIntent: false,
            applications: {
                "Shell-home": {
                    enableActionModeMenuButton: true,
                    enableActionModeFloatingButton: true,
                    enableTileActionsIcon: false,
                    enableHideGroups: true,
                    enableHelp: true
                }
            },
            rootIntent: "Shell-home"
        }
    };

    QUnit.module("sap.ushell.components.appfinder.Component", {
        beforeEach: function (assert) {
            const done = assert.async();

            Container.init("local").then(() => {
                sandbox.stub(Container, "getRendererInternal").returns({
                    createExtendedShellState: function () { },
                    applyExtendedShellState: function () { },
                    getModelConfiguration: function () {
                        return {
                            enableNotificationsUI: true
                        };
                    },
                    getCurrentViewportState: function () {
                        return "Center";
                    },
                    addUserPreferencesEntry: function () { }
                });

                this.oGetEffectiveHomepageSettingStub = sinon.stub(SharedComponentUtils, "getEffectiveHomepageSetting");

                Component.create({
                    id: "applicationsap-ushell-components-appfinder-component",
                    name: sComponentName,
                    componentData: oComponentData
                }).then((oComponent) => {
                    this.oComponent = oComponent;
                    this.oComponent.getRootControl().loaded().then(() => {
                        done();
                    });
                });
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();

            this.oGetEffectiveHomepageSettingStub.restore();

            hasher.setHash("");
            const oHideGroupsBtn = Element.getElementById("hideGroupsBtn");
            if (oHideGroupsBtn) {
                oHideGroupsBtn.destroy();
            }

            oEventHub._reset();
        }
    });

    QUnit.test("checks if a router exists for the component", function (assert) {
        // Assert
        const oRouter = this.oComponent.getRouter();
        assert.ok(oRouter, "The router was found.");
    });

    QUnit.test("The component instance was created", function (assert) {
        assert.ok(this.oComponent, "Instance was created");
    });

    QUnit.test("Check that the AppFinder view was created", function (assert) {
        const oAppFinderView = this.oComponent.getRootControl();

        assert.equal(oAppFinderView.getViewName(), "module:sap/ushell/components/appfinder/AppFinderView", "The appfinder view was created");
    });

    QUnit.test("Check that the homepage personalization retrieval was triggered", function (assert) {
        assert.ok(this.oGetEffectiveHomepageSettingStub.calledOnce, "Homepage personalization retrieval was triggered");
    });

    QUnit.test("Check that correct detail message is created on catalog content creation", function (assert) {
        return Controller.create({ name: "sap.ushell.components.appfinder.Catalog" }).then((oController) => {
            const tileTitle = "tile_title";
            const firstAddedGroupTitle = "first_added_group";
            const firstRemovedGroupTitle = "first_removed_group";
            const numberOfAddedGroups = [1, 0, 1, 2, 2, 0, 1, 2];
            const numberOfRemovedGroups = [0, 1, 1, 0, 1, 2, 2, 2];
            const getTextFromBundle = ushellResources.i18n;
            const successMessages = [
                getTextFromBundle.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]),
                getTextFromBundle.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]),
                getTextFromBundle.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]),
                getTextFromBundle.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups[3]]),
                getTextFromBundle.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups[4], firstRemovedGroupTitle]),
                getTextFromBundle.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups[5]]),
                getTextFromBundle.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups[6]]),
                getTextFromBundle.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups[7], numberOfRemovedGroups[7]])
            ];

            for (let index = 0; index < numberOfAddedGroups.length; index++) {
                const message = oController.prepareDetailedMessage(tileTitle, numberOfAddedGroups[index], numberOfRemovedGroups[index], firstAddedGroupTitle, firstRemovedGroupTitle);
                assert.strictEqual(successMessages[index], message, `Expected message: ${successMessages[index]} Message returned: ${message}`);
            }
            oController.destroy();
        });
    });

    function getLocalizedText (sMsgId, aParams) {
        return aParams ? ushellResources.i18n.getText(sMsgId, aParams) : ushellResources.i18n.getText(sMsgId);
    }

    QUnit.test("Check that correct error message is created on catalog content creation error", function (assert) {
        return Controller.create({ name: "sap.ushell.components.appfinder.Catalog" }).then((oController) => {
            const tileTitle = "tile_title";
            const numberOfAddToGroupsFails = [0, 0, 1, 0, 2, 0, 1];
            const numberOfRemoveFromGroupsFails = [0, 1, 0, 1, 0, 2, 1];
            const createNewGroupFail = [1, 1, 0, 0, 0, 0, 0];
            const oGroup = { title: "test group" };
            let oErroneousActions = [];
            const getTextFromBundle = ushellResources.i18n;
            const failMessages = [
                getTextFromBundle.getText("fail_tile_operation_create_new_group"),
                getTextFromBundle.getText("fail_tile_operation_some_actions"),
                getTextFromBundle.getText("fail_tile_operation_add_to_group", [tileTitle, oGroup.title]),
                getTextFromBundle.getText("fail_tile_operation_remove_from_group", [tileTitle, oGroup.title]),
                getTextFromBundle.getText("fail_tile_operation_add_to_several_groups", [tileTitle]),
                getTextFromBundle.getText("fail_tile_operation_remove_from_several_groups", [tileTitle]),
                getTextFromBundle.getText("fail_tile_operation_some_actions")
            ];
            let actionIndex;

            for (let index = 0; index < numberOfAddToGroupsFails.length; index++) {
                oErroneousActions = [];
                if (numberOfAddToGroupsFails[index] > 0) {
                    for (actionIndex = 0; actionIndex < numberOfAddToGroupsFails[index]; actionIndex++) {
                        oErroneousActions.push({ group: oGroup, status: 0, action: actionIndex === 0 ? "addTileToNewGroup" : "add" });
                    }
                }
                if (numberOfRemoveFromGroupsFails[index] > 0) {
                    for (actionIndex = 0; actionIndex < numberOfRemoveFromGroupsFails[index]; actionIndex++) {
                        oErroneousActions.push({ group: oGroup, status: 0, action: "remove" });
                    }
                }
                if (createNewGroupFail[index] > 0) {
                    oErroneousActions.push({ group: oGroup, status: 0, action: "createNewGroup" });
                }

                const message = oController.prepareErrorMessage(oErroneousActions, tileTitle);
                assert.strictEqual(failMessages[index], getLocalizedText(message.messageId, message.parameters), `Expected message: ${failMessages[index]} Message returned: ${message}`);
            }
            oController.destroy();
        });
    });

    QUnit.module("The function createContent", {
        beforeEach: function (assert) {
            const done = assert.async();

            Container.init("local").then(() => {
                sandbox.stub(Container, "getRendererInternal").returns({
                    createExtendedShellState: function () { },
                    applyExtendedShellState: function () { },
                    getModelConfiguration: function () {
                        return {
                            enableNotificationsUI: true
                        };
                    },
                    getCurrentViewportState: function () {
                        return "Center";
                    },
                    addUserPreferencesEntry: function () { }
                });

                this.oGetEffectiveHomepageSettingStub = sinon.stub(SharedComponentUtils, "getEffectiveHomepageSetting");

                Component.create({
                    id: "applicationsap-ushell-components-appfinder-component",
                    name: sComponentName,
                    componentData: oComponentData
                }).then((oComponent) => {
                    this.oComponent = oComponent;
                }).finally(done);
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();

            this.oGetEffectiveHomepageSettingStub.restore();

            hasher.setHash("");
            const oHideGroupsBtn = Element.getElementById("hideGroupsBtn");
            if (oHideGroupsBtn) {
                oHideGroupsBtn.destroy();
            }

            oEventHub._reset();

            this.oConfigStub.restore();
        }
    });

    QUnit.test("Adds routes to the component when pages are enabled and personalization is disabled", function (assert) {
        this.oConfigStub = sinon.stub(Config, "last");
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        return this.oComponent.getRootControl().loaded().then(() => {
            const oRoutes = this.oComponent.getRouter()._oRoutes;

            assert.ok(oRoutes.catalog, "The route to the catalog was found");
            assert.ok(oRoutes.sapMenu, "The route to the sapMenu was found");
            assert.ok(oRoutes.userMenu, "The route to the userMenu was found");

            assert.strictEqual(oRoutes.catalog.getPattern(), "catalog/:filters:", "the correct value of the catalog pattern was found");
            assert.strictEqual(oRoutes.sapMenu.getPattern(), "sapMenu/:filters:", "the correct value of the sapMenu pattern was found");
            assert.strictEqual(oRoutes.userMenu.getPattern(), "userMenu/:filters:", "the correct value of the userMenu pattern was found");
        });
    });

    QUnit.test("Adds routes to the component when pages are enabled and personalization is enabled", function (assert) {
        this.oConfigStub = sinon.stub(Config, "last");
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        return this.oComponent.getRootControl().loaded().then(() => {
            const oRoutes = this.oComponent.getRouter()._oRoutes;

            assert.ok(oRoutes.catalog, "The route to the catalog was found");
            assert.ok(oRoutes.sapMenu, "The route to the sapMenu was found");
            assert.ok(oRoutes.userMenu, "The route to the userMenu was found");

            assert.strictEqual(oRoutes.catalog.getPattern(), "catalog/:filters:", "the correct value of the catalog pattern was found");
            assert.strictEqual(oRoutes.sapMenu.getPattern(), "sapMenu/:filters:", "the correct value of the sapMenu pattern was found");
            assert.strictEqual(oRoutes.userMenu.getPattern(), "userMenu/:filters:", "the correct value of the userMenu pattern was found");
        });
    });

    QUnit.test("Adds routes to the component when pages are disabled and personalization is enabled", function (assert) {
        this.oConfigStub = sinon.stub(Config, "last");
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);

        return this.oComponent.getRootControl().loaded().then(() => {
            const oRoutes = this.oComponent.getRouter()._oRoutes;

            assert.ok(oRoutes.catalog, "The route to the catalog was found");
            assert.ok(oRoutes.sapMenu, "The route to the sapMenu was found");
            assert.ok(oRoutes.userMenu, "The route to the userMenu was found");

            assert.strictEqual(oRoutes.catalog.getPattern(), "catalog/:filters:", "the correct value of the catalog pattern was found");
            assert.strictEqual(oRoutes.sapMenu.getPattern(), "sapMenu/:filters:", "the correct value of the sapMenu pattern was found");
            assert.strictEqual(oRoutes.userMenu.getPattern(), "userMenu/:filters:", "the correct value of the userMenu pattern was found");
        });
    });
});
