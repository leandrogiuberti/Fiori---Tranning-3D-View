// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/m/library",
    "sap/ushell/resources",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], (
    Element,
    Controller,
    mobileLibrary,
    resources,
    Device,
    JSONModel
) => {
    "use strict";

    // shortcut for sap.m.ListMode
    const ListMode = mobileLibrary.ListMode;

    return Controller.extend("sap.ushell.components.appfinder.GroupListPopover", {
        onExit: function () {
            const oView = this.getView();

            // Manually destroy controls which might at some point be orphaned
            if (oView._oListContainer) {
                oView._oListContainer.destroy();
            }

            if (oView._oNewGroupItem) {
                oView._oNewGroupItem.destroy();
            }

            if (oView._oNewGroupNameInput) {
                oView._oNewGroupNameInput.destroy();
            }

            if (oView._oNewGroupHeader) {
                oView._oNewGroupHeader.destroy();
            }
        },

        initializeData: function (viewData) {
            this.oPopoverModel = new JSONModel({
                userGroupList: viewData.groupData
            });

            this.oPopoverModel.setSizeLimit(9999);
            this.getView().oPopover.setModel(this.oPopoverModel);
        },

        _cancelButtonPress: function () {
            this.getView().oPopover.close();
        },

        /**
         * On clicking an item in the group list.
         *
         * @param {sap.ui.base.Event} oEvent THe SAPUI5 event object.
         */
        _groupListItemClickHandler: function (oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            if (oListItem.data("newGroupItem")) {
                this._navigateToCreateNewGroupPane();
                return;
            }

            const oList = oEvent.getSource();
            if (oList.getMode() === ListMode.SingleSelectMaster) {
                const oView = this.getView();
                oView.oPopover.close();
            } else {
                oListItem.setSelected(!oListItem.getSelected());
            }
        },

        _okayCancelButtonPress: function () {
            const oView = this.getView();
            const oNewGroupInput = oView._getNewGroupInput();
            const sNewGroupName = oNewGroupInput.getValue();
            if (sNewGroupName.length > 0) {
                this.sNewGroupId = sNewGroupName;
            }
            oView.oPopover.close();
        },

        _navigateToCreateNewGroupPane: function () {
            const oView = this.getView();

            const oNewGroupHeader = oView._getNewGroupHeader();
            const oNewGroupInput = oView._getNewGroupInput();

            oView.oPopover.removeAllContent();
            oView.oPopover.addContent(oNewGroupInput);
            oView.oPopover.setCustomHeader(oNewGroupHeader);
            oView.oPopover.setContentHeight("");

            let oEndButton = oView.oPopover.getEndButton();
            if (oEndButton) {
                oEndButton.setVisible(true);
            } else {
                oEndButton = oView._getCancelButton();
                oView.oPopover.setEndButton(oEndButton);
            }
            oView.oPopover.getBeginButton().setText(resources.i18n.getText("okDialogBtn"));
            oEndButton.setText(resources.i18n.getText("cancelBtn"));

            if (oView.getViewData().singleGroupSelection) {
                this._setFooterVisibility(true);
            }

            setTimeout(() => {
                oNewGroupInput.focus();
            }, 0);
        },

        _afterCloseHandler: function () {
            const aUserGroups = this.oPopoverModel.getProperty("/userGroupList");
            const oChanges = {
                addToGroups: [],
                removeFromGroups: [],
                newGroups: this.sNewGroupId ? [this.sNewGroupId] : [],
                allGroups: aUserGroups
            };
            let oGroup;

            for (let i = 0, len = aUserGroups.length; i < len; ++i) {
                oGroup = aUserGroups[i];
                if (oGroup.selected === oGroup.initiallySelected) {
                    continue;
                }
                if (oGroup.selected) {
                    oChanges.addToGroups.push(oGroup.oGroup);
                } else {
                    oChanges.removeFromGroups.push(oGroup.oGroup);
                }
            }

            const oView = this.getView();
            oView.deferred.resolve(oChanges);
            oView.destroy();
        },

        _backButtonHandler: function () {
            const oView = this.getView();
            oView.oPopover.removeAllContent();
            if (oView.getViewData().singleGroupSelection) {
                this._setFooterVisibility(false);
            }

            if (!Device.system.phone) {
                oView.oPopover.setContentHeight("192px");
            } else {
                oView.oPopover.setContentHeight("100%");
            }

            oView.oPopover.setVerticalScrolling(true);
            oView.oPopover.setHorizontalScrolling(false);
            oView.oPopover.addContent(oView._getListContainer());
            oView.oPopover.setTitle(resources.i18n.getText("addTileToGroups_popoverTitle"));
            oView.oPopover.setCustomHeader();
            oView._getNewGroupInput().setValue("");

            oView.oPopover.getEndButton().setVisible(false);
            oView.oPopover.getBeginButton().setText(resources.i18n.getText("close"));
        },

        _setFooterVisibility: function (bVisible) {
            // as there is not public API to control the footer we get the control by its id and set its visibility
            const oFooter = Element.getElementById("groupsPopover-footer");
            if (oFooter) {
                oFooter.setVisible(bVisible);
            }
        }
    });
});
