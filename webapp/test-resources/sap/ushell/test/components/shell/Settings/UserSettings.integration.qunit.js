// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/m/Page",
    "sap/ushell/Config",
    "sap/ushell/state/StateManager"
], (
    Component,
    Container,
    EventHub,
    Page,
    Config,
    StateManager
) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.config.reorder = false;

    const sandbox = sinon.sandbox.create();

    QUnit.module("Integration tests", {
        beforeEach: function () {
            QUnit.sap.ushell.createTestDomRef(); // used to place the Renderer

            this.aPages = [
                new Page(),
                new Page(),
                new Page(),
                new Page()
            ];
            this.aEntries = [
                {
                    id: "firstEntry",
                    contentFunc: sandbox.stub().resolves(this.aPages[0]),
                    entryHelpID: "entry-help-id-0",
                    icon: "sap-icon://home",
                    onCancel: sandbox.stub().resolves(),
                    onSave: sandbox.stub().resolves(),
                    title: "entry0",
                    valueArgument: sandbox.stub().resolves("subtitle0")
                },
                {
                    id: "secondEntry",
                    contentFunc: sandbox.stub().resolves(this.aPages[1]),
                    entryHelpID: "entry-help-id-1",
                    icon: "sap-icon://delete",
                    onCancel: sandbox.stub().resolves(),
                    onSave: sandbox.stub().resolves(),
                    title: "entry1",
                    valueArgument: sandbox.stub().resolves("subtitle1"),
                    groupingEnablement: true,
                    groupingId: "group0",
                    groupingTabTitle: "entry1 - tab",
                    groupingTabHelpId: "entry-help-id-1-tab"
                },
                {
                    id: "thirdEntry",
                    contentFunc: sandbox.stub().resolves(this.aPages[2]),
                    entryHelpID: "entry-help-id-2",
                    icon: "sap-icon://refresh",
                    onCancel: sandbox.stub().resolves(),
                    onSave: sandbox.stub().resolves(),
                    title: "entry2",
                    valueArgument: sandbox.stub().resolves("subtitle2")
                },
                {
                    id: "fourthEntry",
                    contentFunc: sandbox.stub().resolves(this.aPages[3]),
                    entryHelpID: "entry-help-id-3",
                    icon: "sap-icon://edit",
                    onCancel: sandbox.stub().resolves(),
                    onSave: sandbox.stub().resolves(),
                    title: "entry3",
                    valueArgument: sandbox.stub().resolves("subtitle3"),
                    groupingEnablement: true,
                    groupingId: "group1",
                    groupingTabTitle: "entry3 - tab",
                    groupingTabHelpId: "entry-help-id-3-tab"
                },
                {
                    id: "fifthEntry",
                    contentFunc: sandbox.stub().rejects(new Error("Failed intentionally")),
                    entryHelpID: "entry-help-id-4",
                    icon: "sap-icon://add",
                    onCancel: sandbox.stub().resolves(),
                    onSave: sandbox.stub().resolves(),
                    title: "entry4",
                    valueArgument: sandbox.stub().resolves("subtitle4")
                }
            ];
            return new Promise((resolve) => {
                Container.init("local")
                    .then(() => {
                        Container.createRendererInternal("fiori2")
                            .then((oRendererControl) => {
                                this.oRendererControl = oRendererControl;
                                oRendererControl.placeAt("qunit-canvas");

                                return Component.create({
                                    name: "sap.ushell.components.shell.Settings"
                                });
                            })
                            .then((oUserSettingsComponent) => {
                                this.oComponent = oUserSettingsComponent;
                                Config._reset(); // removes the default settings for this test
                                return oUserSettingsComponent._openUserSettings({});
                            })
                            .then(() => {
                                this.oView = this.oComponent.oSettingsView;
                                this.oController = this.oView.getController();
                                resolve();
                            });
                    });
            });
        },

        afterEach: function () {
            this.aPages.forEach((oPage) => {
                oPage.destroy();
            });
            this.oComponent.destroy();
            return this.oRendererControl.destroy().then(() => {
                EventHub._reset();
                Config._reset();
                sandbox.restore();
                StateManager.resetAll();
            });
        }
    });

    /**
     * Asserts that the created UserSettings has the correct state and is rendered correctly.
     * To check the rendering of each entry, the content of each entry is opened.
     *
     * @param {object} assert QUnit assert, that is used for testing.
     * @param {object} oExpectations The expected results.
     * @param {sap.ushell.components.shell.Settings.UserSettings.view} oView The view of the UserSettings Component
     * @param {sap.ushell.components.shell.Settings.UserSettings.controller} oController The controller of the UserSettings Component
     * @returns {Promise<undefined>} resolves when all checks are done or rejects if there was an error during promise chaining.
     */
    function doAssertions (assert, oExpectations, oView, oController) {
        return new Promise((resolve, reject) => {
            const oUserSettingEntryList = oView.byId("userSettingEntryList");
            const aItems = oUserSettingEntryList.getItems();
            assert.strictEqual(aItems.length, oExpectations.itemTitles.length, "The amount of items is as expected.");

            const aMainEntries = oUserSettingEntryList.getModel().getProperty("/entries");
            const aMainEntryIds = aMainEntries.map((oMainEntry) => {
                return oMainEntry.id;
            });
            assert.deepEqual(aMainEntryIds, oExpectations.mainEntryIds, "Correct entries are in the model.");

            const aItemTitles = aItems.map((oItem) => {
                return oItem.getTitle();
            });
            assert.deepEqual(aItemTitles, oExpectations.itemTitles, "Entries in the view have the expected titles.");

            const aMainEntryTabIds = aMainEntries.map((oMainEntry) => {
                return oMainEntry.tabs.map((oTabEntry) => {
                    return oTabEntry.id;
                });
            });
            assert.deepEqual(aMainEntryTabIds, oExpectations.mainEntryTabIds, "Correct tabs in the model.");

            // Open every entry to test how the tabs are rendered.
            aItems
                .reduce((oPromiseChain, oItem) => {
                    return oPromiseChain.then(() => {
                        return oController._toDetail(oItem);
                    });
                }, Promise.resolve())
                .then(() => {
                    const aDetailPages = oView.byId("settingsApp").getDetailPages();
                    const iExpectedDetailPages = oExpectations.tabTitles.length;
                    assert.strictEqual(aDetailPages.length, iExpectedDetailPages, "The amount of detail pages is as expected.");

                    aDetailPages.forEach((oDetailPage, index) => {
                        const oIconTabBar = oDetailPage.getContent()[1];
                        assert.ok(oIconTabBar.isA("sap.m.IconTabBar"), "IconTabBar is at the correct position in the wrapper.");
                        assert.strictEqual(oIconTabBar.getVisible(), oExpectations.tabTitles[index - 1].length > 1, `${`Entry ${index}` - 1}: visibility as expected.`);
                        const aTabNames = oIconTabBar.getItems().map((oFilter) => {
                            return oFilter.getText();
                        });
                        assert.deepEqual(aTabNames, oExpectations.tabTitles[index - 1], `${`Entry ${index}` - 1}: tabs are as expected.`);
                    });
                    resolve();
                })
                .catch(reject);
        });
    }

    QUnit.test("Two groups with only one entry each", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oExpectations = {
            mainEntryIds: [
                this.aEntries[0].id,
                this.aEntries[1].id,
                this.aEntries[2].id,
                this.aEntries[3].id,
                this.aEntries[4].id
            ],
            itemTitles: [
                this.aEntries[0].title,
                this.aEntries[1].title,
                this.aEntries[2].title,
                this.aEntries[3].title,
                this.aEntries[4].title
            ],
            mainEntryTabIds: [
                [this.aEntries[0].id],
                [this.aEntries[1].id],
                [this.aEntries[2].id],
                [this.aEntries[3].id],
                [this.aEntries[4].id]
            ],
            tabTitles: [
                [""],
                ["entry1 - tab"],
                [""],
                ["entry3 - tab"],
                [""]
            ]
        };

        // Act
        Config.emit("/core/userPreferences/entries", this.aEntries);

        // Assert
        setTimeout(() => {
            doAssertions(assert, oExpectations, this.oView, this.oController).finally(fnDone);
        }, 300);
    });

    QUnit.test("One Group with two entries", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.aEntries[2].groupingEnablement = true;
        this.aEntries[2].groupingId = "group0";
        this.aEntries[2].groupingTabTitle = "entry2 - tab";
        this.aEntries[2].groupingTabHelpId = "entry-help-id-2-tab";
        const oExpectations = {
            mainEntryIds: [
                this.aEntries[0].id,
                this.aEntries[1].id,
                this.aEntries[3].id,
                this.aEntries[4].id
            ],
            itemTitles: [
                this.aEntries[0].title,
                this.aEntries[1].title,
                this.aEntries[3].title,
                this.aEntries[4].title
            ],
            mainEntryTabIds: [
                [this.aEntries[0].id],
                [this.aEntries[1].id, this.aEntries[2].id],
                [this.aEntries[3].id],
                [this.aEntries[4].id]
            ],
            tabTitles: [
                [""],
                ["entry1 - tab", "entry2 - tab"],
                ["entry3 - tab"],
                [""]
            ]
        };

        // Act
        Config.emit("/core/userPreferences/entries", this.aEntries);

        // Assert
        setTimeout(() => {
            doAssertions(assert, oExpectations, this.oView, this.oController).finally(fnDone);
        }, 300);
    });

    QUnit.test("Two groups with three and two items", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.aEntries[0].groupingEnablement = true;
        this.aEntries[0].groupingId = "group0";
        this.aEntries[0].groupingTabTitle = "entry0 - tab";
        this.aEntries[0].groupingTabHelpId = "entry-help-id-0-tab";
        this.aEntries[2].groupingEnablement = true;
        this.aEntries[2].groupingId = "group0";
        this.aEntries[2].groupingTabTitle = "entry2 - tab";
        this.aEntries[2].groupingTabHelpId = "entry-help-id-2-tab";
        this.aEntries[4].groupingEnablement = true;
        this.aEntries[4].groupingId = "group1";
        this.aEntries[4].groupingTabTitle = "entry4 - tab";
        this.aEntries[4].groupingTabHelpId = "entry-help-id-4-tab";
        const oExpectations = {
            mainEntryIds: [
                this.aEntries[0].id,
                this.aEntries[3].id
            ],
            itemTitles: [
                this.aEntries[0].title,
                this.aEntries[3].title
            ],
            mainEntryTabIds: [
                [this.aEntries[0].id, this.aEntries[1].id, this.aEntries[2].id],
                [this.aEntries[3].id, this.aEntries[4].id]
            ],
            tabTitles: [
                ["entry0 - tab", "entry1 - tab", "entry2 - tab"],
                ["entry3 - tab", "entry4 - tab"]
            ]
        };

        // Act
        Config.emit("/core/userPreferences/entries", this.aEntries);

        // Assert
        setTimeout(() => {
            doAssertions(assert, oExpectations, this.oView, this.oController).finally(fnDone);
        }, 300);
    });

    QUnit.test("One group with three tabs, one of them not visible and another invisible entry.", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.aEntries[0].valueArgument.resolves({ value: false, displayText: "someIssue" });
        this.aEntries[2].groupingEnablement = true;
        this.aEntries[2].groupingId = "group0";
        this.aEntries[2].groupingTabTitle = "entry2 - tab";
        this.aEntries[2].groupingTabHelpId = "entry-help-id-2-tab";
        this.aEntries[2].valueArgument.resolves({ value: false, displayText: "someIssue" });
        this.aEntries[3].groupingEnablement = true;
        this.aEntries[3].groupingId = "group0";
        this.aEntries[3].groupingTabTitle = "entry3 - tab";
        this.aEntries[3].groupingTabHelpId = "entry-help-id-3-tab";
        const oExpectations = {
            mainEntryIds: [
                this.aEntries[1].id,
                this.aEntries[4].id
            ],
            itemTitles: [
                this.aEntries[1].title,
                this.aEntries[4].title
            ],
            mainEntryTabIds: [
                [this.aEntries[1].id, this.aEntries[3].id],
                [this.aEntries[4].id]
            ],
            tabTitles: [
                ["entry1 - tab", "entry3 - tab"],
                [""]
            ]
        };

        // Act
        Config.emit("/core/userPreferences/entries", this.aEntries);

        // Assert
        setTimeout(() => {
            doAssertions(assert, oExpectations, this.oView, this.oController).finally(fnDone);
        }, 300);
    });

    QUnit.test("One Group with three entries, second tab gets opened and onCancel is called correctly", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.aEntries[2].groupingEnablement = true;
        this.aEntries[2].groupingId = "group0";
        this.aEntries[2].groupingTabTitle = "entry2 - tab";
        this.aEntries[2].groupingTabHelpId = "entry-help-id-2-tab";
        this.aEntries[3].groupingEnablement = true;
        this.aEntries[3].groupingId = "group0";
        this.aEntries[3].groupingTabTitle = "entry3 - tab";
        this.aEntries[3].groupingTabHelpId = "entry-help-id-3-tab";

        // Act
        Config.emit("/core/userPreferences/entries", this.aEntries);

        // Assert
        setTimeout(() => {
            const oUserSettingEntryList = this.oView.byId("userSettingEntryList");
            const aItems = oUserSettingEntryList.getItems();
            oUserSettingEntryList.setSelectedItem(aItems[1]);
            this.oController._toDetail(aItems[1]).then(() => {
                const oDetailPage = this.oView.byId("settingsApp").getDetailPages()[1];
                const oIconTabBar = oDetailPage.getContent()[1];
                const aIconTabFilters = oIconTabBar.getItems();
                oIconTabBar.setSelectedKey(aIconTabFilters[1].getId());
                oIconTabBar.fireSelect({
                    item: aIconTabFilters[1],
                    key: aIconTabFilters[1].getId(),
                    previousKey: aIconTabFilters[0].getId()
                });
                setTimeout(() => {
                    this.oView.byId("userSettingCancelButton").firePress();
                    setTimeout(() => {
                        assert.strictEqual(this.aEntries[0].onCancel.callCount, 1);
                        assert.strictEqual(this.aEntries[1].onCancel.callCount, 1);
                        assert.strictEqual(this.aEntries[2].onCancel.callCount, 1);
                        assert.strictEqual(this.aEntries[3].onCancel.callCount, 0);
                        assert.strictEqual(this.aEntries[4].onCancel.callCount, 0);
                        fnDone();
                    }, 300);
                }, 300);
            });
        }, 300);
    });

    QUnit.test("One Group with three entries, third tab gets opened and onSave is called correctly", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.aEntries[2].groupingEnablement = true;
        this.aEntries[2].groupingId = "group0";
        this.aEntries[2].groupingTabTitle = "entry2 - tab";
        this.aEntries[2].groupingTabHelpId = "entry-help-id-2-tab";
        this.aEntries[3].groupingEnablement = true;
        this.aEntries[3].groupingId = "group0";
        this.aEntries[3].groupingTabTitle = "entry3 - tab";
        this.aEntries[3].groupingTabHelpId = "entry-help-id-3-tab";

        // Act
        Config.emit("/core/userPreferences/entries", this.aEntries);

        // Assert
        setTimeout(() => {
            const oUserSettingEntryList = this.oView.byId("userSettingEntryList");
            const aItems = oUserSettingEntryList.getItems();
            oUserSettingEntryList.setSelectedItem(aItems[1]);
            this.oController._toDetail(aItems[1]).then(() => {
                const oDetailPage = this.oView.byId("settingsApp").getDetailPages()[1];
                const oIconTabBar = oDetailPage.getContent()[1];
                const aIconTabFilters = oIconTabBar.getItems();
                oIconTabBar.setSelectedKey(aIconTabFilters[2].getId());
                oIconTabBar.fireSelect({
                    item: aIconTabFilters[2],
                    key: aIconTabFilters[2].getId(),
                    previousKey: aIconTabFilters[0].getId()
                });
                setTimeout(() => {
                    this.oView.byId("userSettingSaveButton").firePress();
                    setTimeout(() => {
                        assert.strictEqual(this.aEntries[0].onSave.callCount, 1);
                        assert.strictEqual(this.aEntries[1].onSave.callCount, 1);
                        assert.strictEqual(this.aEntries[2].onSave.callCount, 0);
                        assert.strictEqual(this.aEntries[3].onSave.callCount, 1);
                        assert.strictEqual(this.aEntries[4].onSave.callCount, 0);
                        fnDone();
                    }, 200);
                }, 200);
            });
        }, 200);
    });
});
