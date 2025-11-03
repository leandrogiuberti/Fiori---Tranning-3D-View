// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file QUnit tests for "sap.ushell.adapters.local.PersonalizationAdapter"
 */
sap.ui.define([
    "sap/ui/util/Storage",
    "sap/ushell/adapters/local/PersonalizationAdapter",
    "sap/ushell/adapters/local/AdapterContainer"
], (
    Storage,
    PersonalizationAdapter,
    AdapterContainer
) => {
    "use strict";

    /* global QUnit */

    if (window.localStorage) {
        window.localStorage.clear();
    }

    [
        { storage: AdapterContainer.prototype.constants.storage.LOCAL_STORAGE },
        { storage: AdapterContainer.prototype.constants.storage.MEMORY }
    ].forEach((oFixture) => {
        QUnit.module(`sap.ushell.adapters.local.PersonalizationAdapter - ${oFixture.storage} - `, {
            beforeEach: function () {
                const oSystem = {};
                try {
                    Storage.clear();
                    localStorage.clear();
                } catch (oError) { /* do nothing */ }
                this.oAdapter = new PersonalizationAdapter(
                    oSystem,
                    undefined,
                    { storageType: oFixture.storage }
                );
            },
            /**
             * This method is called after each test. Add every restoration
             * code here.
             */
            afterEach: function () {
                delete this.oAdapter;
            }
        });

        QUnit.test(`load non-existent container (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();

            // Arrange
            assert.expect(1);
            const sContainerKey = new Date().toJSON();
            // Act
            const oContainer = this.oAdapter.getAdapterContainer(sContainerKey);
            oContainer.load()
                .done(() => {
                    const aKeys = oContainer.getItemKeys();
                    // Assert
                    assert.equal(aKeys.length, 0, "Success: Container is empty. No errors.");
                    fnDone();
                })
                .fail(() => {
                    assert.ok(false, "Error: Personalization data could not be read");
                    fnDone();
                });
        });

        QUnit.test(`delete non-existent container (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();

            // Arrange
            assert.expect(1);
            const sContainerKey = new Date().toJSON();
            // Act
            this.oAdapter.delAdapterContainer(sContainerKey)
                .done(() => {
                    // Assert
                    assert.ok(true, "Success: Container was deleted. No error.");
                    fnDone();
                })
                .fail(() => {
                    assert.ok(false, "Error: Personalization data could not be deleted.");
                    fnDone();
                });
        });

        QUnit.test(`get container, create item, save, load, check item, del container (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();
            const sITEM_KEY = "Test_3";
            const sITEM_VALUE = "Value_3";
            let sReadItemValue;
            let oContainer1;
            let oContainer2;
            const that = this;

            // Arrange
            assert.expect(5);
            const sContainerKey = new Date().toJSON();

            try {
                // Get container 1
                oContainer1 = this.oAdapter.getAdapterContainer(sContainerKey);
                assert.ok(true, "Success: Adapter container was loaded.");
            } catch (oError) {
                assert.ok(false, `Error: Exception '${oError.message}' raised.`);
            }
            if (!oContainer1) {
                assert.ok(false, "Error: oContainer1 is undefined.");
            }
            // Load via container 1
            oContainer1.load()
                .done(() => {
                    assert.ok(true, "Success: Container was loaded.");
                    // Set item in container 1
                    oContainer1.setItemValue(sITEM_KEY, sITEM_VALUE);
                    assert.ok(true, `Success: Item value was set to '${sITEM_VALUE}'`);
                    // Save container 1
                    oContainer1.save()
                        .done(() => {
                            // Get container 2
                            oContainer2 = that.oAdapter.getAdapterContainer(sContainerKey);
                            // Load via container 2
                            oContainer2.load()
                                .done(() => {
                                    // Check if item was actually saved
                                    sReadItemValue = oContainer2.getItemValue(sITEM_KEY);
                                    assert.equal(sITEM_VALUE, sReadItemValue,
                                        "Success: Correct item value was read after loading via a new container object. ");
                                    // Delete the container on the storage
                                    that.oAdapter.delAdapterContainer(sContainerKey)
                                        .done(() => {
                                            assert.ok(true, "Success: Container was deleted. No error.");
                                            fnDone();
                                        })
                                        .fail(() => {
                                            assert.ok(false, "Error: Personalization data could not be deleted.");
                                            fnDone();
                                        });
                                })
                                .fail(() => {
                                    assert.ok(false, "Error: Personalization adapter could not be loaded.");
                                    that.oAdapter.delAdapterContainer(sContainerKey)
                                        .done(() => {
                                            assert.ok(true, "Success: Container was deleted after an error occured.");
                                            fnDone();
                                        })
                                        .fail(() => {
                                            assert.ok(false, "Error: Personalization data could not be deleted.");
                                            fnDone();
                                        });
                                });
                        })
                        .fail(() => {
                            assert.ok(false, "Error: Personalization adapter could not be saved.");
                            that.oAdapter.delAdapterContainer(sContainerKey)
                                .done(() => {
                                    assert.ok(true, "Success: Container was deleted after an error occured.");
                                    fnDone();
                                })
                                .fail(() => {
                                    assert.ok(false, "Error: Personalization data could not be deleted.");
                                    fnDone();
                                });
                        });
                })
                .fail(() => {
                    assert.ok(false, "Error: Personalization data could not be read");
                    fnDone();
                });
        });

        QUnit.test(`create item in container 1 and delete it via container 2 (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();
            const sITEM_KEY = "Test_4";
            const sITEM_VALUE = "Value_4";
            let oContainer2;
            let aKeys;
            const that = this;

            assert.expect(13);
            const sContainerKey = new Date().toJSON();
            const oContainer1 = this.oAdapter.getAdapterContainer(sContainerKey);
            // Container 1 is used to create one item and save it
            oContainer1.load()
                .done(() => {
                    assert.ok(true, "Success: Container 1 was loaded.");
                    oContainer1.setItemValue(sITEM_KEY, sITEM_VALUE);
                    assert.deepEqual(oContainer1.getItemValue(sITEM_KEY), sITEM_VALUE,
                        `Success: Item value was set to '${sITEM_VALUE}'`);
                    aKeys = [];
                    assert.equal(aKeys.length, 0, "Success: aKeys is emptied.");
                    aKeys = oContainer1.getItemKeys();
                    assert.equal(aKeys.length, 1, "Success: Container 1 contains 1 item");
                    assert.ok(oContainer1.containsItem(sITEM_KEY), `Success: Container 1 contains item '${sITEM_KEY}'`);
                    oContainer1.save()
                        .done(() => {
                            oContainer2 = that.oAdapter.getAdapterContainer(sContainerKey);
                            // Container 2 is used to read the item saved via container 1 and delete it with an
                            // additional save.
                            oContainer2.load()
                                .done(() => {
                                    oContainer2.getItemValue(sITEM_KEY);
                                    aKeys = [];
                                    assert.equal(aKeys.length, 0, "Success: aKeys is emptied.");
                                    aKeys = oContainer2.getItemKeys();
                                    assert.equal(aKeys.length, 1, "Success: Container 2 contains 1 item");
                                    assert.ok(oContainer2.containsItem(sITEM_KEY), `Success: Container 2 contains item '${sITEM_KEY}'`);
                                    oContainer2.delItem(sITEM_KEY);
                                    aKeys = [];
                                    assert.equal(aKeys.length, 0, "Success: aKeys is emptied.");
                                    aKeys = oContainer2.getItemKeys();
                                    assert.equal(aKeys.length, 0, "Success: Container 2 contains no items");
                                    oContainer1.load()
                                        // check via container 1 if the item was deleted in the storage
                                        .done(() => {
                                            aKeys = [];
                                            assert.equal(aKeys.length, 0, "Success: aKeys is emptied.");
                                            aKeys = oContainer2.getItemKeys();
                                            assert.equal(aKeys.length, 0, "Success: Container 2 contains no items");
                                            that.oAdapter.delAdapterContainer(sContainerKey)
                                                .done(() => {
                                                    assert.ok(true, "Success: Container was deleted. No error.");
                                                    fnDone();
                                                })
                                                .fail(() => {
                                                    assert.ok(false, "Error: Personalization data could not be deleted.");
                                                    fnDone();
                                                });
                                        })
                                        .fail(() => {
                                            assert.ok(false, "Error: Personalization data could not be deleted.");
                                            fnDone();
                                        });
                                })
                                .fail(() => {
                                    assert.ok(false, "Error: Personalization adapter could not be loaded.");
                                    that.oAdapter.delAdapterContainer(sContainerKey)
                                        .done(() => {
                                            assert.ok(true, "Success: Container was deleted after an error occured.");
                                            fnDone();
                                        })
                                        .fail(() => {
                                            assert.ok(false, "Error: Personalization data could not be deleted.");
                                            fnDone();
                                        });
                                });
                        })
                        .fail(() => {
                            assert.ok(false, "Error: Personalization adapter could not be saved.");
                            that.oAdapter.delAdapterContainer(sContainerKey)
                                .done(() => {
                                    assert.ok(true, "Success: Container was deleted after an error occured.");
                                    fnDone();
                                })
                                .fail(() => {
                                    assert.ok(false, "Error: Personalization data could not be deleted.");
                                    fnDone();
                                });
                        });
                })
                .fail(() => {
                    assert.ok(false, "Error: Personalization data could not be read");
                    fnDone();
                });
        });

        QUnit.test(`delete non-existing item (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();
            const that = this;

            assert.expect(3);
            const sContainerKey = new Date().toJSON();
            const sItemKey = new Date().toJSON();
            const oContainer = this.oAdapter.getAdapterContainer(sContainerKey);
            oContainer.load()
                .done(() => {
                    const aKeys = oContainer.getItemKeys();
                    // Assert
                    assert.equal(aKeys.length, 0, "Success: Container is loaded and empty."); // 1
                    try {
                        oContainer.delItem(sItemKey);
                        assert.ok(true, "Success: Deletion of non-existent item triggered no error."); // 2
                    } catch (oError) {
                        assert.ok(false, `Error: Deletion of non-existent item triggered exception '${oError.message}'`);
                    }
                    // Clean up
                    that.oAdapter.delAdapterContainer(sContainerKey)
                        .done(() => {
                            assert.ok(true, "Success: Container was deleted. No error."); // 3
                            fnDone();
                        })
                        .fail(() => {
                            assert.ok(false, "Error: Personalization data could not be deleted.");
                            fnDone();
                        });
                })
                .fail(() => {
                    assert.ok(false, "Error: Container could not be loaded.");
                    fnDone();
                });
        });

        QUnit.test(`item manipulation (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();
            let sReadItemValue1;
            let oReadItemValue2;
            const that = this;

            // Arrange
            assert.expect(6);
            const sContainerKey = new Date().toJSON();
            const sItemKey1 = `${new Date().toJSON()}-1`;
            const sItemKey2 = `${new Date().toJSON()}-2`;
            const sItemValue1 = sItemKey1; // the key is used as value also
            const oItemValue2 = {
                Ornette: "Coleman",
                Cecil: "Taylor",
                Anthony: "Braxton",
                Number: 1
            };
            // Act
            const oContainer = this.oAdapter.getAdapterContainer(sContainerKey);
            oContainer.load()
                .done(() => {
                    // Assert
                    const aKeys = oContainer.getItemKeys();
                    assert.equal(aKeys.length, 0, "Success: Container is loaded and empty."); // 1
                    // Act - set item value 1
                    oContainer.setItemValue(sItemKey1, sItemValue1);
                    sReadItemValue1 = oContainer.getItemValue(sItemKey1);
                    // Assert
                    assert.deepEqual(sReadItemValue1, sItemValue1,
                        "Success: Item value 1 was stored locally in the container"); // 2
                    // Act - set item value 2
                    oContainer.setItemValue(sItemKey2, oItemValue2);
                    oReadItemValue2 = oContainer.getItemValue(sItemKey2);
                    // Assert
                    assert.deepEqual(oReadItemValue2, oItemValue2,
                        "Success: Item value2 was stored locally in the container"); // 3
                    // Act - delete item value 2
                    oContainer.delItem(sItemKey2);
                    oReadItemValue2 = undefined;
                    oReadItemValue2 = oContainer.getItemValue(sItemKey2);
                    // Assert
                    assert.deepEqual(oReadItemValue2, undefined,
                        "Success: Item value2 was deleted locally in the container"); // 4
                    // Act - set item value 2 again
                    oContainer.setItemValue(sItemKey2, oItemValue2);
                    oReadItemValue2 = oContainer.getItemValue(sItemKey2);
                    // Assert
                    assert.deepEqual(oReadItemValue2, oItemValue2,
                        "Success: Item value2 was stored locally in the container"); // 5
                    // Clean up
                    that.oAdapter.delAdapterContainer(sContainerKey)
                        .done(() => {
                            assert.ok(true, "Success: Container was deleted."); // 6
                            fnDone();
                        })
                        .fail(() => {
                            assert.ok(false, "Error: Personalization data could not be deleted.");
                            fnDone();
                        });
                })
                .fail(() => {
                    assert.ok(false, "Error: Container could not be loaded.");
                    fnDone();
                });
        });
    });

    [{
        storage: AdapterContainer.prototype.constants.storage.MEMORY,
        personalizationData: {
            "sap.ushell.personalization#sap.ushell.services.UserRecents": {
                "ITEM#RecentApps": [{
                    iCount: 1,
                    iTimestamp: 1378479383874,
                    oItem: {
                        semanticObject: "UI2Fiori2SampleApps",
                        action: "approvepurchaseorders",
                        sTargetHash: "#UI2Fiori2SampleApps-approvepurchaseorders",
                        title: "Approve Purchase",
                        url: "#UI2Fiori2SampleApps-approvepurchaseorders"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383895,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample",
                        sTargetHash: "#Action-toappnavsample",
                        title: "Approve Nav Sample 3",
                        url: "#Action-toappnavsample"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383896,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample2",
                        sTargetHash: "#Action-toappnavsample2",
                        title: "Approve Nav Sample 2",
                        url: "#Action-toappnavsample2"
                    }
                }, {
                    iCount: 1,
                    iTimestamp: 1378479383899,
                    oItem: {
                        semanticObject: "UI2Fiori2SampleApps",
                        action: "MyLeaveRequest",
                        sTargetHash: "#UI2Fiori2SampleApps-MyLeaveRequest",
                        title: "My Leave Request",
                        url: "#UI2Fiori2SampleApps-MyLeaveRequest"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383878,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample",
                        sTargetHash: "#Action-toappnavsample",
                        title: "Approve Nav Sample 8",
                        url: "#Action-toappnavsample"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383897,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample2",
                        sTargetHash: "#Action-toappnavsample2",
                        title: "Approve Nav Sample 1",
                        url: "#Action-toappnavsample2"
                    }
                }, {
                    iCount: 1,
                    iTimestamp: 1378479383898,
                    oItem: {
                        semanticObject: "UI2Fiori2SampleApps",
                        action: "approvepurchaseorders",
                        sTargetHash: "#UI2Fiori2SampleApps-approvepurchaseorders",
                        title: "Approve first Purchase",
                        url: "#UI2Fiori2SampleApps-approvepurchaseorders"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383863,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample",
                        sTargetHash: "#Action-toappnavsample",
                        title: "Approve Nav Sample 13",
                        url: "#Action-toappnavsample"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383862,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample2",
                        sTargetHash: "#Action-toappnavsample2",
                        title: "Approve Nav Sample 12",
                        url: "#Action-toappnavsample2"
                    }
                }, {
                    iCount: 1,
                    iTimestamp: 1378479383879,
                    oItem: {
                        semanticObject: "UI2Fiori2SampleApps",
                        action: "approvepurchaseorders",
                        sTargetHash: "#UI2Fiori2SampleApps-approvepurchaseorders",
                        title: "Approve Purchase",
                        url: "#UI2Fiori2SampleApps-approvepurchaseorders"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383894,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample",
                        sTargetHash: "#Action-toappnavsample",
                        title: "Approve Nav Sample 4",
                        url: "#UI2Fiori2SampleApps-appnavsample"
                    }
                }, {
                    iCount: 2,
                    iTimestamp: 1378479383893,
                    oItem: {
                        semanticObject: "Action",
                        action: "toappnavsample2",
                        sTargetHash: "#Action-toappnavsample2",
                        title: "Approve Nav Sample 5",
                        url: "#UI2Fiori2SampleApps-appnavsample2"
                    }
                }],
                "ITEM#RecentSearches": [
                    { iCount: 1, iTimestamp: 1378478828152, oItem: { sTerm: "Test" } },
                    { iCount: 1, iTimestamp: 1378478828151, oItem: { sTerm: "Recent search 3" } },
                    { iCount: 1, iTimestamp: 1378478828149, oItem: { sTerm: "Recent search 4", oObjectName: { label: "Business Partners", value: "Business Partners" } } },
                    { iCount: 1, iTimestamp: 1378478828153, oItem: { sTerm: "Sally", oObjectName: { label: "Employees", value: "Employees" } } },
                    { iCount: 1, iTimestamp: 1378478828148, oItem: { sTerm: "Recent search 5" } },
                    { iCount: 1, iTimestamp: 1378478828147, oItem: { sTerm: "Recent search 6" } },
                    { iCount: 1, iTimestamp: 1378478828137, oItem: { sTerm: "Recent search 16" } },
                    { iCount: 1, iTimestamp: 1378478828136, oItem: { sTerm: "Recent search 17" } },
                    { iCount: 1, iTimestamp: 1378478828133, oItem: { sTerm: "Recent search 20" } },
                    { iCount: 1, iTimestamp: 1378478828132, oItem: { sTerm: "Recent search 21" } },
                    { iCount: 1, iTimestamp: 1378478828131, oItem: { sTerm: "Recent search 22" } },
                    { iCount: 1, iTimestamp: 1378478828146, oItem: { sTerm: "Recent search 7" } },
                    { iCount: 1, iTimestamp: 1378478828145, oItem: { sTerm: "Recent search 8" } },
                    { iCount: 1, iTimestamp: 1378478828144, oItem: { sTerm: "Recent search 9" } },
                    { iCount: 1, iTimestamp: 1378478828143, oItem: { sTerm: "Recent search 10" } },
                    { iCount: 1, iTimestamp: 1378478828135, oItem: { sTerm: "Recent search 18" } },
                    { iCount: 1, iTimestamp: 1378478828134, oItem: { sTerm: "Recent search 19" } },
                    { iCount: 1, iTimestamp: 1378478828142, oItem: { sTerm: "Recent search 11" } },
                    { iCount: 1, iTimestamp: 1378478828141, oItem: { sTerm: "Recent search 12" } },
                    { iCount: 1, iTimestamp: 1378478828140, oItem: { sTerm: "Recent search 13" } },
                    { iCount: 1, iTimestamp: 1378478828139, oItem: { sTerm: "Recent search 14" } },
                    { iCount: 1, iTimestamp: 1378478828138, oItem: { sTerm: "Recent search 15" } }
                ]
            }
        }
    }].forEach((oFixture) => {
        QUnit.module(`sap.ushell.adapters.local.PersonalizationAdapter - provide initial personalization data - ${
            oFixture.storage} - `, {
            beforeEach: function () {
                const oSystem = {};

                this.oAdapter = new PersonalizationAdapter(
                    oSystem,
                    undefined,
                    {
                        config: {
                            storageType: oFixture.storage,
                            personalizationData: oFixture.personalizationData
                        }
                    }
                );
            },
            afterEach: function () {
                delete this.oAdapter;
            }
        });

        QUnit.test(`check init data (${oFixture.storage})`, function (assert) {
            const fnDone = assert.async();
            let oReadItemValue;
            const that = this;

            // Arrange
            assert.expect(3);
            const sContainerKey = "sap.ushell.personalization#sap.ushell.services.UserRecents";
            const sItemKey = "ITEM#RecentSearches";
            const oExpectedItemValue = oFixture.personalizationData &&
                oFixture.personalizationData["sap.ushell.personalization#sap.ushell.services.UserRecents"] &&
                oFixture.personalizationData["sap.ushell.personalization#sap.ushell.services.UserRecents"]["ITEM#RecentSearches"];
            if (oExpectedItemValue) {
                assert.ok(true, "Success: Initialization value contains the test item");
            } else {
                assert.ok(true, "Warning: Initialization value does not contain the test item");
            }
            // Act
            const oContainer = this.oAdapter.getAdapterContainer(sContainerKey);
            oContainer.load()
                .done(() => {
                    oReadItemValue = oContainer.getItemValue(sItemKey);
                    // Assert
                    assert.deepEqual(oReadItemValue, oExpectedItemValue,
                        `Success: Initialization value was read from the container. Value: ${JSON.stringify(oReadItemValue)}`); // 1
                    // Clean up
                    that.oAdapter.delAdapterContainer(sContainerKey)
                        .done(() => {
                            assert.ok(true, "Success: Container was deleted. No error."); // 2
                            fnDone();
                        })
                        .fail(() => {
                            assert.ok(false, "Error: Personalization data could not be deleted.");
                            fnDone();
                        });
                })
                .fail(() => {
                    assert.ok(false, "Error: Container could not be loaded.");
                    fnDone();
                });
        });
    });

    QUnit.module("sap.ushell.adapters.local.PersonalizationAdapter - adapter tests");

    QUnit.test("Get the adapter with a wrong storage type", function (assert) {
        assert.expect(1);
        try {
            new PersonalizationAdapter(
                undefined,
                undefined,
                { config: { storageType: "NoN-ExIsTiNg" } }
            );
            assert.ok(false, "Error: No exception was triggered.");
        } catch (oError) {
            assert.ok(true, "Success: Exception was triggered.");
        }
    });
});
