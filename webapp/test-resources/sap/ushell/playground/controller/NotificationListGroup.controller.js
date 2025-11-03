// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/playground/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/NotificationListItem",
    "sap/m/MessageToast",
    "sap/ui/core/library"
], (
    BaseController,
    JSONModel,
    NotificationListItem,
    MessageToast,
    coreLib
) => {
    "use strict";

    // shortcut for sap.ui.core.Priority
    const Priority = coreLib.Priority;

    return BaseController.extend("sap.ushell.playground.controller.NotificationListGroup", {
        onInit: function () {
            const oModel = new JSONModel({
                listItems: [],
                title: "Test Title",
                showCloseButton: false,
                busy: false,
                visible: true,
                datetime: "1 hour",
                authorName: "Jane Doe",
                counter: 1,
                autoPriority: false,
                priorities: Object.keys(Priority).map((key) => {
                    return {
                        Key: key,
                        Name: key
                    };
                }),
                priority: Priority.None,
                authorPictures: [{
                    Key: "",
                    Name: "None"
                }, {
                    Key: "sap-icon://world",
                    Name: "World"
                }, {
                    Key: "sap-icon://delete",
                    Name: "Delete"
                }, {
                    Key: "sap-icon://email",
                    Name: "Email"
                }],
                authorPicture: "sap-icon://world",
                showEmptyGroup: false
            });

            this.getView().setModel(oModel);
            this.addItem();
        },

        addItem: function () {
            const oNotificationListGroup = this.getView().byId("notificationListGroup");
            oNotificationListGroup.addItem(new NotificationListItem({
                title: "Demo Titel",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent feugiat.",
                showCloseButton: true,
                datetime: "1 hour",
                unread: true,
                priority: "None",
                close: this.onClosePressed,
                press: this.onListItemPressed
            }));
        },

        onListItemPressed: function (oEvent) {
            MessageToast.show(`Item Selected:${oEvent.getSource().getTitle()}`);
        },

        onClosePressed: function (oEvent) {
            const oItem = oEvent.getSource();
            const oList = oItem.getParent();

            oList.removeItem(oItem);
            MessageToast.show(`Item Closed: ${oItem.getTitle()}`);
        }
    });
});
