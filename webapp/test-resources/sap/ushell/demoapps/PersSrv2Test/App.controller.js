// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// this application creates/reads/deletes multiple records in the Personalization service the used key
sap.ui.define([
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/ushell/Container"
], (
    Log,
    MessageBox,
    MessageToast,
    Component,
    Controller,
    JSONModel,
    ODataModel,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.PersSrv2Test.App", {
        onInit: function () {
            let sSrvURL;
            Container.getServiceAsync("Personalization").then((oPersonalizationService) => {
                this.oPersonalizationService = oPersonalizationService;
                sSrvURL = "/sap/opu/odata/sap/ZMF_PERSCO_SRV/";
                this.oDataModel = new ODataModel(sSrvURL, true, { "sap-client": 120 });
                this.oModel = new JSONModel({
                    ContainerName: "",
                    Time: "0s",
                    ContainerValidity: "",
                    ContainerItems: [],
                    ContainerLoaded: false,
                    NewItem: {}
                });
                this.getView().setModel(this.oModel);
            });
        },

        getMyComponent: function () {
            return Component.getOwnerComponentFor(this.getView());
        },

        /**
         * Called when "New" button in the Container life cycle test panel is pressed
         */
        onNewEmptyContainer: function () {
            const that = this;
            const sContainerName = this.oModel.getProperty("/ContainerName");

            if (!sContainerName) {
                MessageBox.alert("Enter a container name");
                return;
            }

            this.oPersonalizationService.createEmptyContainer(sContainerName, { validity: this._getContainerValidity() }, this.getMyComponent())
                .done((oContainer) => {
                    Log.info(`Created new container '${sContainerName}'`);

                    if (oContainer) {
                        that.oContainer = oContainer;
                        that.oModel.setProperty("/ContainerLoaded", true);
                        that.oModel.setProperty("/ContainerItems", []);
                    }
                }).fail((oError) => {
                    Log.error(`Failed to create container '${sContainerName}':`, oError);
                    MessageBox.alert(`Failed to create container '${sContainerName}': ${oError.message}`);
                });
        },

        successSubmitBatch: function () {
        },

        errorSubmitBatch: function () {
        },

        oObj: {
            Item1: "value1",
            Item2: "value2"
        },

        savePersCOContainer: function (sKey, fndone) {
            let a;
            const obj = {
                Containertype: "P",
                Containerid: sKey,
                Changedat: "/Date(1402911849000)/",
                Expiredat: "/Date(1401109666000)/",
                Achcomponent: "SCM-BAS-DF",
                Validity: 30,
                Changedby: "FORSTMANN",
                items: [
                    {
                        Itemvalue: `Fiori Rocks${new Date()}`,
                        Itemid: "ITEM#ITEM1",
                        Itemtype: " ",
                        Containerid: sKey,
                        Containertype: "P"
                    }, {
                        Itemvalue: `3REALLLYCLIENTDF${new Date()}`,
                        Itemid: "ITEM#ITEM2",
                        Itemtype: " ",
                        Containerid: sKey,
                        Containertype: "P"
                    }, {
                        Itemvalue: `3REALLLYCLIENTDF${new Date()}`,
                        Itemid: "ITEM#ITEM3",
                        Itemtype: " ",
                        Containerid: sKey,
                        Containertype: "P"
                    }, {
                        Itemvalue: `3REALLLYCLIENTDF${new Date()}`,
                        Itemid: "ITEM#ITEM4",
                        Itemtype: " ",
                        Containerid: sKey,
                        Containertype: "P"
                    }
                ]
            };
            for (a in this.oObj) {
                if (this.oObj.hasOwnProperty(a)) {
                    obj.items.push({
                        Itemvalue: `Fiori rocks${new Date()} ${this.oObj[a]}`,
                        Itemid: String(a),
                        Itemtype: " ",
                        Containerid: sKey,
                        Containertype: "P"
                    });
                }
            }
            // "always post", get data from model, then post it :-)
            this.oDataModel.addBatchChangeOperations([
                this.oDataModel.createBatchOperation(
                    "/containers",
                    "POST",
                    obj
                )
            ]
            );
            this.oDataModel.submitBatch(
                fndone,
                this.errorSubmitBatch,
                true
            );
        },

        // sets the Time model property
        setTime: function (currLength, initialLength, startTime) {
            this.oModel.setProperty("/Time", `${currLength} : avg:${((new Date() - startTime) / 1000) / (initialLength - currLength)} total: ${(new Date() - startTime) / 1000}s `);
        },

        generateKeys: function () {
            let noStartIndex = this.oModel.getProperty("/StartIndex");
            let noRecords = this.oModel.getProperty("/NoRecords");
            let i;
            const arr = [];
            noStartIndex = parseInt(noStartIndex, 10);
            noRecords = parseInt(noRecords, 10);
            for (i = noStartIndex; i < noStartIndex + noRecords; i = i + 1) {
                arr.push({ name: `theKey${i}` });
            }
            return arr;
        },

        readPersCOContainer: function (sKey, fndone) {
            // "always post", get data from model, then post it :-)
            this.oDataModel.addBatchReadOperations([
                this.oDataModel.createBatchOperation(
                    `/containers(Containertype='',Containerid='${encodeURI(sKey)}')?$expand=items`,
                    "GET"
                )
            ]);
            this.oDataModel.submitBatch(
                fndone,
                this.errorSubmitBatch,
                true
            );
        },

        delPersCOContainer: function (sKey, fndone) {
            // "always post", get data from model, then post it :-)
            this.oDataModel.addBatchChangeOperations([
                this.oDataModel.createBatchOperation(
                    `/containers(Containertype='',Containerid='${encodeURI(sKey)}')`,
                    "DELETE"
                )
            ]);
            this.oDataModel.submitBatch(
                fndone,
                fndone, // we also delete on fail ! this.errorSubmitBatch,
                true
            );
        },

        onLoadPers: function () {
            const that = this;
            const arr = this.generateKeys();
            const noRecords = arr.length;
            const time = new Date();
            this.fn = function () {
                if (arr.length === 0) {
                    return;
                }
                const key = arr[0].name;
                arr.splice(0, 1);
                this.oPersonalizationService.getContainer(key,
                    { validity: this._getContainerValidity() }, this.getMyComponent())
                    .done((oContainer) => {
                        Log.warning(`got container '${key}'`);
                        that.setTime(arr.length, noRecords, time);
                        that.fn();
                    }).fail((oError) => {
                        Log.error(`Failed to create container '${key}':`, oError);
                    });
            };
            that.fn();
        },

        onWritePers: function () {
            const that = this;
            const arr = this.generateKeys();
            const noRecords = arr.length;
            const time = new Date();
            this.fn = function () {
                if (arr.length === 0) {
                    return;
                }
                const key = arr[0].name;
                arr.splice(0, 1);
                this.oPersonalizationService.getContainer(key,
                    { validity: this._getContainerValidity() }, this.getMyComponent())
                    .done((oContainer) => {
                        let a;
                        Log.info(`Created new container '${key}'`);
                        for (a in that.oObj) {
                            if (that.oObj.hasOwnProperty(a)) {
                                oContainer.setItemValue(String(a), `Fiori rocks${new Date()} ${that.oObj[a]}`);
                            }
                        }
                        oContainer.setItemValue("Item2", `Fiori rocks${new Date()}`);
                        oContainer.setItemValue("Item3", `Fiori rocks${new Date()}`);
                        oContainer.setItemValue("Item4", `Fiori rocks${new Date()}`);
                        oContainer.save().done(() => {
                            that.setTime(arr.length, noRecords, time);
                            that.fn();
                        });
                    }).fail((oError) => {
                        Log.error(`Failed to create container '${key}':`, oError);
                    });
            };
            that.fn();
        },

        onDelPers: function () {
            const that = this;
            const arr = this.generateKeys();
            const noRecords = arr.length;
            const time = new Date();
            this.fn = function () {
                if (arr.length === 0) {
                    return;
                }
                const key = arr[0].name;
                arr.splice(0, 1);
                this.oPersonalizationService.delContainer(key,
                    { validity: this._getContainerValidity() }, this.getMyComponent())
                    .done((oContainer) => {
                        Log.info(`Delete container '${key}'`);
                        that.setTime(arr.length, noRecords, time);
                        that.fn();
                    }).fail((oError) => {
                        Log.error(`Failed to delete container '${key}':`, oError);
                    });
            };
            that.fn();
        },

        onWritePersCO: function () {
            const that = this;
            const arr = this.generateKeys();
            const noRecords = arr.length;
            const time = new Date();
            this.fn = function () {
                if (arr.length === 0) {
                    return;
                }
                const key = arr[0].name;
                arr.splice(0, 1);
                that.savePersCOContainer(key, () => {
                    that.setTime(arr.length, noRecords, time);
                    that.fn();
                });
            };
            that.fn();
        },

        onLoadPersCO: function () {
            const that = this;
            const arr = this.generateKeys();
            const noRecords = arr.length;
            const time = new Date();
            this.fn = function () {
                if (arr.length === 0) {
                    return;
                }
                const key = arr[0].name;
                arr.splice(0, 1);
                that.readPersCOContainer(key, () => {
                    that.setTime(arr.length, noRecords, time);
                    that.fn();
                });
            };
            that.fn();
        },

        onDelPersCO: function () {
            const that = this;
            const arr = this.generateKeys();
            const noRecords = arr.length;
            const time = new Date();
            this.fn = function () {
                if (arr.length === 0) {
                    return;
                }
                const key = arr[0].name;
                arr.splice(0, 1);
                that.delPersCOContainer(key, () => {
                    that.setTime(arr.length, noRecords, time);
                    that.fn();
                });
            };
            that.fn();
        },

        /**
         * Called when "Load" button in the Container life cycle test panel is pressed
         */
        onLoadContainer: function () {
            const that = this;
            const sContainerName = this.oModel.getProperty("/ContainerName");
            let aItemKeys;
            let sStringVal;
            let bJSONFormat;
            const aContainerItems = [];

            if (!sContainerName) {
                MessageBox.alert("Enter a container name");
                return;
            }

            this.oDataModel.addBatchReadOperations([
                this.oDataModel.createBatchOperation(
                    `/containers(Containertype='',Containerid='${encodeURI(sContainerName)}')?$expand=items`,
                    "GET"
                )
            ]);
            this.oDataModel.submitBatch(
                (oContainer) => {
                    let aContainers;
                    let i;
                    let oVal;
                    let j;
                    Log.info(`Loaded container '${sContainerName}': ${oContainer ? oContainer.toString() : oContainer}`);
                    if (oContainer) {
                        that.oContainer = oContainer;
                        that.oModel.setProperty("/ContainerLoaded", true);
                        aItemKeys = that.oDataModel.getProperty("/containers");
                        aItemKeys = that.oDataModel.getProperty("/containers(Containertype='',Containerid='ABC')");
                        aContainers = that.oDataModel.getProperty("/containers");
                        for (j = 0; j < aContainers.length; j = j + 1) {
                            if (aContainers.getProperty("Containerid") === sContainerName) {
                                for (i = 0; i < aItemKeys.length; i = i + 1) {
                                    oVal = that.oDataModel.getProperty(`/items(Containertype='',Containerid='ABC',key='${aItemKeys[i]}')`);
                                    if (typeof oVal === "string") {
                                        sStringVal = oVal;
                                        bJSONFormat = false;
                                    } else {
                                        sStringVal = JSON.stringify(oVal);
                                        bJSONFormat = true;
                                    }
                                    aContainerItems[i] = { Key: aItemKeys[i], Value: sStringVal, JSON: bJSONFormat };
                                }
                            }
                            that.oModel.setProperty("/ContainerItems", aContainerItems);
                        }
                    }
                },
                this.errorSubmitBatch,
                true
            );
        },

        /**
         * Called when "Save" button in the Container life cycle test panel is pressed
         */
        onSaveContainer: function () {
            const sContainerName = this.oModel.getProperty("/ContainerName");
            let i;
            let sItemKey;
            let oVal;
            let sStringVal;
            let bJSONFormat;
            let aContainerItems = [];

            const obj = {
                Containertype: "P",
                Containerid: "ABC",
                Changedat: "/Date(1402911849000)/",
                Expiredat: "/Date(1401109666000)/",
                Achcomponent: "SCM-BAS-DF",
                Validity: 30,
                Changedby: "FORSTMANN",
                items: [
                    {
                        Itemvalue: "11",
                        Itemid: "ITEM#ITEM1",
                        Itemtype: "",
                        Containerid: "ABC",
                        Containertype: ""
                    }, {
                        Itemvalue: "3REALLLYCLIENTDF",
                        Itemid: "ITEM#ITEM2",
                        Itemtype: "",
                        Containerid: "ABC",
                        Containertype: ""
                    }
                ]
            };
            // "always post", get data from model, then post it :-)
            this.oDataModel.addBatchChangeOperations([
                this.oDataModel.createBatchOperation(
                    "/containers",
                    "POST",
                    obj
                )
            ]);
            this.oDataModel.submitBatch(this.successSubmitBatch, this.errorSubmitBatch, true);
            // TODO: check if container name has been changed after load

            this._assertContainerExists();

            aContainerItems = this.oModel.getProperty("/ContainerItems");
            for (i = 0; i < aContainerItems.length; i = i + 1) {
                sItemKey = aContainerItems[i].Key;
                sStringVal = aContainerItems[i].Value;
                bJSONFormat = aContainerItems[i].JSON;

                if (bJSONFormat) {
                    try {
                        oVal = JSON.parse(sStringVal);
                    } catch (oError) {
                        MessageBox.alert(`Value for item '${sItemKey}' must be a valid JSON string; ${oError.message}`);
                        return;
                    }
                } else {
                    oVal = sStringVal;
                }

                this.oContainer.setItemValue(sItemKey, oVal);
            }
            this.oContainer.save().done(() => {
                // Before the next save is triggered the last one has to be finished.
                // Could be done by disabling the save button during the save.
            }).fail((oError) => {
                Log.error(`Failed to save container '${sContainerName}':`, oError);
                MessageBox.alert(`Failed to save container '${sContainerName}': ${oError.message}`);
            });
        },

        /**
          * Called when "Delete" button in the Container life cycle test panel is pressed
          */
        onDeleteContainer: function () {
            const that = this;
            const sContainerName = this.oModel.getProperty("/ContainerName");

            if (!sContainerName) {
                MessageBox.alert("Enter a container name");
                return;
            }

            MessageBox.show(`Deleting container '${sContainerName}'`, {
                icon: "sap-icon://hint",
                title: "Confirm Deletion",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        that._deleteContainer(sContainerName);
                    } else {
                        Log.debug(`Deletion of container '${sContainerName}' canceled`);
                    }
                }
            });
        },

        _deleteContainer: function (sContainerName) {
            const that = this;

            this.oPersonalizationService.delContainer(sContainerName,
                { validity: this._getContainerValidity() }, this.getMyComponent())
                .done((oContainer) => {
                    MessageToast.show(`Container '${sContainerName}' deleted`);
                    that.oModel.setProperty("/ContainerItems", []);
                }).fail((oError) => {
                    Log.error(`Failed to load container '${sContainerName}':`, oError);
                    MessageBox.alert(`Failed to load container '${sContainerName}': ${oError.message}`);
                });
        },

        onOpenAddItemDialog: function () {
            if (!this.oAddItemDialogPromise) {
                this.oAddItemDialogPromise = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/Fragment"], (Fragment) => {
                        Fragment.load({
                            name: "sap.ushell.demo.PersSrvTest.AddItemDialog",
                            type: "XML",
                            controller: this
                        }).then((dialog) => {
                            this.addItemDialog = dialog;
                            this.getView().addDependent(this.addItemDialog);
                            resolve(dialog);
                        });
                    }, reject);
                });
            }

            this.oAddItemDialogPromise.then(() => {
                this.addItemDialog.bindElement("/NewItem");
                this.addItemDialog.open();
            });
        },

        onAddItemOK: function (oEvent) {
            const oNewItem = this.oModel.getProperty("/NewItem");
            const aContainerItems = this.oModel.getProperty("/ContainerItems");

            aContainerItems.push({
                Key: oNewItem.Key,
                Value: oNewItem.Value,
                JSON: oNewItem.JSON
            });

            this.oModel.setProperty("/ContainerItems", aContainerItems);

            oEvent.getSource().getParent().close();
        },

        onRemoveAllItems: function (/* oEvent */) {
            this._assertContainerExists();

            // TODO: would expect that clear() -> save() works, but this is not the case (neither in sandbox nor in ABAP adapter)
            this.oContainer.clear();

            this.oModel.setProperty("/ContainerItems", []);
        },

        onRemoveSingleItem: function (oEvent) {
            const oBindingContext = oEvent.getSource().getBindingContext();
            const oItem = oBindingContext.getObject();
            const aContainerItems = this.oModel.getProperty("/ContainerItems");

            this._assertContainerExists();

            // get index of deleted item from binding context
            const aMatches = /\/ContainerItems\/(\d)/.exec(oBindingContext.getPath());
            if (!aMatches) {
                Log.error(`Internal error: expected binding context for table rows: ${oBindingContext.getPath()}`);
            }
            const i = parseInt(aMatches[1], 10);
            aContainerItems.splice(i, 1);
            this.oModel.setProperty("/ContainerItems", aContainerItems);

            this.oContainer.delItem(oItem.Key);
        },

        onDialogClose: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        _assertContainerExists: function () {
            if (!this.oContainer) {
                Log.error("Illegal state: save container called but no container exists");
                MessageBox.alert("Illegal state: save container called but no container exists");
                return;
            }
        },

        _clearContainerWorkaround: function () {
            let i;
            const aItemKeys = this.oContainer.getItemKeys();

            for (i = 0; i < aItemKeys.length; i = i + 1) {
                this.oContainer.delItem(aItemKeys[i]);
            }
        },

        _getContainerValidity: function () {
            let iContainerValidity = parseInt(this.oModel.getProperty("/ContainerValidity"), 10);

            if (isNaN(iContainerValidity)) {
                iContainerValidity = undefined;
            }

            return iContainerValidity;
        }
    });
});
