// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (
    Log,
    MessageBox,
    MessageToast,
    Component,
    Controller,
    JSONModel,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.PersSrvTest.App", {
        onInit: function () {
            Container.getServiceAsync("Personalization").then((oPersonalizationService) => {
                this.oPersonalizationService = oPersonalizationService;
                this.oModel = new JSONModel({
                    ContainerName: "",
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

            this.oPersonalizationService.createEmptyContainer(sContainerName,
                { validity: this._getContainerValidity() }, this.getMyComponent())
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

        /**
         * Called when "Load" button in the Container life cycle test panel is pressed
         */
        onLoadContainer: function () {
            const that = this;
            const sContainerName = this.oModel.getProperty("/ContainerName");
            let i;
            let aItemKeys;
            let oVal;
            let sStringVal;
            let bJSONFormat;
            const aContainerItems = [];

            if (!sContainerName) {
                MessageBox.alert("Enter a container name");
                return;
            }

            this.oPersonalizationService.getContainer(sContainerName,
                { validity: this._getContainerValidity() }, this.getMyComponent())
                .done((oContainer) => {
                    Log.info(`Loaded container '${sContainerName}': ${oContainer ? oContainer.toString() : oContainer}`);

                    if (oContainer) {
                        that.oContainer = oContainer;
                        that.oModel.setProperty("/ContainerLoaded", true);

                        aItemKeys = oContainer.getItemKeys();
                        for (i = 0; i < aItemKeys.length; i = i + 1) {
                            oVal = oContainer.getItemValue(aItemKeys[i]);
                            if (typeof oVal === "string") {
                                sStringVal = oVal;
                                bJSONFormat = false;
                            } else {
                                sStringVal = JSON.stringify(oVal);
                                bJSONFormat = true;
                            }
                            aContainerItems[i] = { Key: aItemKeys[i], Value: sStringVal, JSON: bJSONFormat };
                        }

                        that.oModel.setProperty("/ContainerItems", aContainerItems);
                    }
                }).fail((oError) => {
                    Log.error(`Failed to load container '${sContainerName}':`, oError);
                    MessageBox.alert(`Failed to load container '${sContainerName}': ${oError.message}`);
                });
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
         * Called when "Save" button in the Container life cycle test panel is pressed
         */
        onLargePayload: function () {
            let i;
            let s;
            let sx = "";
            let reqSize;
            let aContainerItems = [];

            // if an item "value" exists, check that it's size corresponds to "size"
            aContainerItems = this.oModel.getProperty("/ContainerItems");
            function findIndexAssurePresent (sStr, oInitial) {
                let idx = -1;
                idx = aContainerItems.reduce((prev, arg, i) => {
                    if (aContainerItems[i].Key === sStr) {
                        return i;
                    }
                    return prev;
                }, -1);
                if (idx >= 0) {
                    return idx;
                }
                aContainerItems.push({ Key: sStr, Value: oInitial });
                return aContainerItems.length - 1;
            }
            const iSize = findIndexAssurePresent("size", 256);
            const iValue = findIndexAssurePresent("value", "");
            const iVerify = findIndexAssurePresent("verify", "false");
            try {
                reqSize = parseInt(aContainerItems[iSize].Value, 10);
            } catch (oError) {
                // empty block
            }
            if (reqSize >= 0) {
                aContainerItems[iVerify].Value = (aContainerItems[iValue].Value.length === reqSize);
            }
            if (reqSize >= 0) {
                s = "01234567890ABCDEFGHIJKLMNOPQURSTUVXYZ";
                for (i = 0; i < reqSize && sx.length <= reqSize; i = i + 1) {
                    sx = `${sx}>>>${sx.length}<<<${s}`;
                }
                sx = sx.substring(0, reqSize);
                aContainerItems[iValue].Value = sx;
            }
            this.oModel.setProperty("/ContainerItems", aContainerItems);
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
                this.addItemDiaLog.bindElement("/NewItem");
                this.addItemDiaLog.open();
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
