// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/utils"
], (
    deepExtend,
    MessageToast,
    DateFormat,
    Fragment,
    Controller,
    Device,
    JSONModel,
    Container,
    EventHub,
    resources,
    ushellUtils
) => {
    "use strict";

    async function _errorMessage (sText) {
        const oMessageService = await Container.getServiceAsync("MessageInternal");
        oMessageService.error(sText);
    }

    return Controller.extend("sap.ushell.components.shell.Notifications.Notifications", {
        /**
         * Page size configuration for the notifications list.
         */
        oPagingConfiguration: {
            MAX_NOTIFICATION_ITEMS_DESKTOP: 400,
            MAX_NOTIFICATION_ITEMS_MOBILE: 100,
            NOTIFICATIONS_COUNT_INITIAL: 60,
            NOTIFICATIONS_COUNT: 30
        },

        /**
         * Enum for the focus reason of the notification list.
         * This is used to determine the focus behavior when the content of the notification list changes.
         * For example when the list is refreshed, when the "More" button is pressed or notifications are removed.
         */
        oSetFocusReason: {
            ListRefreshed: "ListRefreshed",
            MoreButtonPressed: "MoreButtonPressed",
            NotificationRemoved: "NotificationRemoved"
        },

        /**
         * Initializes the Notifications controller.
         */
        onInit: function () {
            if (Device.system.desktop) {
                this.iMaxNotificationItemsForDevice = this.oPagingConfiguration.MAX_NOTIFICATION_ITEMS_DESKTOP;
            } else {
                this.iMaxNotificationItemsForDevice = this.oPagingConfiguration.MAX_NOTIFICATION_ITEMS_MOBILE;
            }
            const oView = this.getView();

            // Container.getService use is allowed here. The service is already loaded by the notification component.
            this.oNotificationsService = oView.getViewData().notificationsService;
            this.oSortingTypes = this.oNotificationsService.getOperationEnum();

            // Initial sorting
            this.sCurrentSorting = this.oSortingTypes.NOTIFICATIONS_BY_DATE_DESCENDING;

            // Initialize set which keeps track of duplicates and the notifications count
            this._oItemSet = new Set();

            const oModel = new JSONModel({
                // Default values which are not reset
                settingsAvailable: false
            });
            oModel.setSizeLimit(1500);
            oView.setModel(oModel);
            oView.setModel(resources.i18nModel, "i18n");

            // Call reset to initialize the model values for notifications
            this._resetModel();

            // Initialize the notification settings and check if they are available.
            const oUserSettingsDataAvailableDeferred = this.oNotificationsService._getNotificationSettingsAvailability();
            if (oUserSettingsDataAvailableDeferred.state() === "pending") {
                this.oNotificationsService._userSettingInitialization();
            }
            this.oNotificationsService._getNotificationSettingsAvailability().then((oStatus) => {
                if (oStatus.settingsAvailable) {
                    this._getModel().setProperty("/settingsAvailable", true);
                }
            });
        },

        /**
         * Called after the view has been rendered.
         */
        onAfterRendering: function () {
            this._sortUpdateSelectionState();
        },

        /**
         * The main method to fetch the initial and next page of notifications from the backend according to the current sorting type.
         *
         * Adds the loaded notification items to the model in the correct model path according to the specific sorting type.
         * The hasMoreItemsInBackend flag indicates whether the number of returned items is smaller than the size of the requested items,
         * if so, then there are no more items in the backend for this sorting type.
         *
         * @param {boolean} bRefresh Indicates whether the function was called to refresh the notifications list.
         * @returns {Promise} A promise that resolves when the notifications are fetched.
         *
         * @since 1.136.0
         * @private
         */
        getNextPage: async function (bRefresh) {
            const oModel = this._getModel();
            let oBusyControl;

            // Clear everything if the notifications should be refreshed
            if (bRefresh) {
                this.getView().setVisible(false);
                oBusyControl = await this.getOwnerComponent()._getPopover();
                this._resetModel();
            } else {
                oBusyControl = this.byId("sapUshellNotificationsListMoreButton");
            }

            if (!this._moreNotificationsCanBeFetched()) {
                return;
            }

            const iNumberOfItemsToFetch = this._getNumberOfNotificationsToFetch();
            if (iNumberOfItemsToFetch === 0) {
                return;
            }

            oBusyControl.setBusy(true);
            oModel.setProperty("/inUpdate", true);

            try {
                // Skip unseen count with the next call. This means that notifications arrived while the popover was open. They are in the backend, but not in the list.
                let iUnseenCount = 0;
                const iItemsCount = this._oItemSet.size;
                if (!bRefresh && iItemsCount > 0) {
                    await this.oNotificationsService.getNotifications(); // Needs to be called do update the unseen messages
                    iUnseenCount = parseInt(await this.oNotificationsService.getUnseenNotificationsCount(), 10);
                }
                const iSkip = iItemsCount + iUnseenCount;
                const aResult = await this.oNotificationsService.getNotificationsBufferBySortingType(this.sCurrentSorting, iSkip, iNumberOfItemsToFetch);
                if (!aResult || aResult.length === 0) {
                    oModel.setProperty("/hasMoreItemsInBackend", false);
                } else {
                    // If the number of returned items is smaller than the number that was requested -
                    // it means that there is no more data (i.e. notification items) in the backend that needs to be fetched for this sorting type
                    const bHasMoreItems = aResult.length >= this._getNumberOfNotificationsToFetch();
                    oModel.setProperty("/hasMoreItemsInBackend", bHasMoreItems);

                    // Maintain a set of the notification IDs to avoid duplicates
                    const aNewItems = aResult.filter((oNotification) => {
                        if (!this._oItemSet.has(oNotification.Id)) {
                            this._oItemSet.add(oNotification.Id);
                            return true;
                        }
                        return false;
                    });

                    // Sort new notifications into existing groups
                    const aCurrentGroupedNotifications = oModel.getProperty("/notifications");
                    const aGroupedNotifications = this._groupNotifications(aCurrentGroupedNotifications, aNewItems);

                    oModel.setProperty("/notifications", aGroupedNotifications);
                    oModel.refresh(true);
                }
            } catch (oError) {
                await _errorMessage(resources.i18n.getText("errorOccurredMsg"));
            } finally {
                this._updateListMaxReached();
                oModel.setProperty("/inUpdate", false);
                this.getView().setVisible(true);
                oBusyControl.setBusy(false);
                const sFocusReason = bRefresh ? this.oSetFocusReason.ListRefreshed : this.oSetFocusReason.MoreButtonPressed;
                await this._setFocus(sFocusReason);
            }
        },

        /**
         * Resets the initial notifications model structure.
         *
         * @since 1.136.0
         * @private
         */
        _resetModel: function () {
            const oModel = this._getModel();
            // Clear the notifications list
            oModel.setProperty("/notifications", []);
            this._oItemSet.clear();

            // Reset flags
            oModel.setProperty("/hasMoreItemsInBackend", true);
            oModel.setProperty("/listMaxReached", false);
            oModel.setProperty("/inUpdate", false);
        },

        /**
         * Groups the notifications based on the current sorting type.
         *
         * @param {Array<*>} aGroupedNotifications The current array of grouped notifications.
         * @param {Array<*>} aNotifications The array of notifications to be grouped.
         * @returns {Array<*>} The grouped notifications.
         *
         * @since 1.136.0
         * @private
         */
        _groupNotifications: function (aGroupedNotifications, aNotifications) {
            aGroupedNotifications = aGroupedNotifications.length > 0 ? aGroupedNotifications : undefined;
            if (this.sCurrentSorting === this.oSortingTypes.NOTIFICATIONS_BY_PRIORITY_DESCENDING) {
                return this._groupNotificationsByPriority(aGroupedNotifications, aNotifications);
            }
            return this._groupNotificationsByTimePeriods(aGroupedNotifications, aNotifications);
        },

        /**
         * Groups the notifications by priority.
         *
         * @param {Array<*>} aGroupedNotifications The current array of grouped notifications.
         * @param {Array<*>} aNotifications The array of notifications to be grouped.
         * @returns {Array<*>} The grouped notifications.
         *
         * @since 1.136.0
         * @private
         */
        _groupNotificationsByPriority: function (aGroupedNotifications, aNotifications) {
            const aNotificationsByPriority = aGroupedNotifications || this._getGroupsForPriority();
            for (let i = 0; i < aNotifications.length; i++) {
                const oNotification = aNotifications[i];
                if (oNotification.Priority.toUpperCase() === "HIGH") {
                    aNotificationsByPriority[0].items.push(oNotification);
                } else {
                    aNotificationsByPriority[1].items.push(oNotification);
                }
            }

            return aNotificationsByPriority;
        },

        /**
         * Groups the notifications by time periods.
         *
         * @param {Array<*>} aGroupedNotifications The current array of grouped notifications.
         * @param {Array<*>} aNotifications The array of notifications to be grouped.
         * @returns {Array<*>} The grouped notifications.
         *
         * @since 1.136.0
         * @private
         */
        _groupNotificationsByTimePeriods: function (aGroupedNotifications, aNotifications) {
            const oCurrentDate = new Date();
            const iOneDayInMilliseconds = 24 * 60 * 60 * 1000;
            const oDateFormatDay = DateFormat.getDateInstance({pattern: "dMy"});
            const sToday = oDateFormatDay.format(oCurrentDate);
            const sYesterday = oDateFormatDay.format(new Date(Date.now() - iOneDayInMilliseconds));

            const oDateFormatWeek = DateFormat.getDateInstance({pattern: "w"});
            const iThisWeek = parseInt(oDateFormatWeek.format(oCurrentDate), 10);

            const oLastWeekDate = new Date();
            oLastWeekDate.setFullYear(oLastWeekDate.getFullYear() - 1, 11, 31);
            const iLastWeek = iThisWeek - 1 || parseInt(oDateFormatWeek.format(oLastWeekDate), 10);

            const oDateFormatMonth = DateFormat.getDateInstance({pattern: "M"});
            const iThisMonth = parseInt(oDateFormatMonth.format(oCurrentDate), 10);
            const iLastMonth = iThisMonth - 1 || 12;

            const oDateFormatYear = DateFormat.getDateInstance({pattern: "y"});
            const iThisYear = parseInt(oDateFormatYear.format(oCurrentDate), 10);

            const aTimePeriods = aGroupedNotifications || this._getGroupsForTimePeriods();

            const oTimePeriodsIndex = {
                TODAY: 0,
                YESTERDAY: 1,
                THIS_WEEK: 2,
                LAST_WEEK: 3,
                THIS_MONTH: 4,
                LAST_MONTH: 5,
                THIS_YEAR: 6,
                OLDER: 7
            };

            for (let i = 0; i < aNotifications.length; i++) {
                const oNotification = aNotifications[i];
                const oDate = new Date(oNotification.CreatedAt);

                const sDay = oDateFormatDay.format(oDate);
                if (sDay === sToday) {
                    aTimePeriods[oTimePeriodsIndex.TODAY].items.push(oNotification);
                    continue;
                }

                if (sDay === sYesterday) {
                    aTimePeriods[oTimePeriodsIndex.YESTERDAY].items.push(oNotification);
                    continue;
                }

                const iYear = parseInt(oDateFormatYear.format(oDate), 10);
                const iWeek = parseInt(oDateFormatWeek.format(oDate), 10);
                if (iYear === iThisYear && iWeek === iThisWeek) {
                    aTimePeriods[oTimePeriodsIndex.THIS_WEEK].items.push(oNotification);
                    continue;
                }

                if (iYear === iThisYear && iWeek === iLastWeek) {
                    aTimePeriods[oTimePeriodsIndex.LAST_WEEK].items.push(oNotification);
                    continue;
                }

                const iMonth = parseInt(oDateFormatMonth.format(oDate), 10);
                if (iYear === iThisYear && iMonth === iThisMonth) {
                    aTimePeriods[oTimePeriodsIndex.THIS_MONTH].items.push(oNotification);
                    continue;
                }

                if ((iYear === iThisYear && iMonth === iLastMonth)
                    || (iYear === (iThisYear - 1) && iLastMonth === 12)
                ) {
                    aTimePeriods[oTimePeriodsIndex.LAST_MONTH].items.push(oNotification);
                    continue;
                }

                if (iYear === iThisYear) {
                    aTimePeriods[oTimePeriodsIndex.THIS_YEAR].items.push(oNotification);
                    continue;
                }

                aTimePeriods[oTimePeriodsIndex.OLDER].items.push(oNotification);
            }

            return aTimePeriods;
        },

        /**
         * Returns the groups for the notifications list based on priority.
         *
         * @returns {Array<*>} The groups for the notifications list.
         *
         * @since 1.136.0
         * @private
         */
        _getGroupsForPriority: function () {
            return [
                {
                    key: "IMPORTANT",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.Important"),
                    items: []
                },
                {
                    key: "OTHERS",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.Others"),
                    items: []
                }
            ];
        },

        /**
         * Returns the groups for the notifications list based on time periods.
         *
         * @returns {Array<*>} The groups for the notifications list.
         *
         * @since 1.136.0
         * @private
         */
        _getGroupsForTimePeriods: function () {
            return [
                {
                    key: "TODAY",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.Today"),
                    items: []
                },
                {
                    key: "YESTERDAY",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.Yesterday"),
                    items: []
                },
                {
                    key: "THIS_WEEK",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.ThisWeek"),
                    items: []
                },
                {
                    key: "LAST_WEEK",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.LastWeek"),
                    items: []
                },
                {
                    key: "THIS_MONTH",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.ThisMonth"),
                    items: []
                },
                {
                    key: "LAST_MONTH",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.LastMonth"),
                    items: []
                },
                {
                    key: "THIS_YEAR",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.ThisYear"),
                    items: []
                },
                {
                    key: "OLDER",
                    titleText: resources.i18n.getText("Notifications.Popover.Group.Older"),
                    items: []
                }
            ];
        },

        /**
         * Marks the notification item as read.
         *
         * @param {object} oItem The NotificationListItem to be marked as read.
         * @returns {Promise} A promise that resolves when the notification is marked as read.
         *
         * @since 1.136.0
         * @private
         */
        _markNotificationRead: async function (oItem) {
            const oNotification = oItem.getBindingContext().getObject();
            try {
                await this.oNotificationsService.markRead(oNotification.Id);
                oItem.getBindingContext().setProperty("IsRead", true);
            } catch (oError) {
                await _errorMessage(resources.i18n.getText("notificationsFailedMarkRead"));
            }
        },

        /**
         * Check if more notifications can be fetched from the backend.
         *
         * @returns {boolean} true if more notifications can be fetched, false otherwise.
         *
         * @since 1.136.0
         * @private
         */
        _moreNotificationsCanBeFetched: function () {
            const oModel = this._getModel();
            const bHasMoreItemsInBackend = oModel.getProperty("/hasMoreItemsInBackend");
            const bListMaxReached = oModel.getProperty("/listMaxReached");
            return bHasMoreItemsInBackend && !bListMaxReached;
        },

        /**
         * Update the State, if the max number of items for this device type was reached (e.g. Desktop, Phone).
         *
         * @since 1.136.0
         * @private
         */
        _updateListMaxReached: function () {
            const oModel = this._getModel();
            const bMaxReached = this._getNumberOfNotificationsToFetch() <= 0;
            oModel.setProperty("/listMaxReached", bMaxReached);
        },

        /**
         * Update the selection state and icon of the sorting menu items.
         *
         * @since 1.136.0
         * @private
         */
        _sortUpdateSelectionState: function () {
            const aItems = Fragment.byId(this.getOwnerComponent().createId("notificationsListCustomHeader"), "sortMenu").getItems();
            aItems.forEach((oItem) => {
                if (oItem.data("sortBy") === this.sCurrentSorting) {
                    oItem.setIcon("sap-icon://accept");
                    oItem.setSelected(true);
                } else {
                    oItem.setIcon("");
                    oItem.setSelected(false);
                }
            });
        },

        /**
         * Returns the model of the current view.
         *
         * @returns {sap.ui.model.json.JSONModel} the model of the current view.
         * @since 1.136.0
         * @private
         */
        _getModel: function () {
            return this.getView().getModel();
        },

        /**
         * Calculates and returns the number of items that should be requested from notification service, as part of the paging policy.
         *
         * The function performs the following:
         *   - If the model already holds the  maximum number of item (per this device) - return 0
         *   - If the number of items in the model plus buffer size is bigger that the maximum - return the biggest possible number of items to fetch
         *   - Regular use case - return default page size
         *
         *   See "oOperationEnum" from "sap/ushell/services/Notifications.js".
         * @returns {int} current page size
         *
         * @since 1.136.0
         * @private
         */
        _getNumberOfNotificationsToFetch: function () {
            const iCurrentNumberOfItems = this._oItemSet.size;
            const iPageSize = iCurrentNumberOfItems > 0 ? this.oPagingConfiguration.NOTIFICATIONS_COUNT : this.oPagingConfiguration.NOTIFICATIONS_COUNT_INITIAL;

            // Already exceeded the maximum number of items for this device
            if (iCurrentNumberOfItems >= this.iMaxNotificationItemsForDevice) {
                return 0;
            }

            // Calculate the maximum number of items to fetch if the limit would be reached with the next page
            if ((iCurrentNumberOfItems + iPageSize) > this.iMaxNotificationItemsForDevice) {
                return this.iMaxNotificationItemsForDevice - iCurrentNumberOfItems;
            }

            return iPageSize;
        },

        /**
         * Removes the item from the model, from the set of items and updates the list max reached state.
         *
         * @param {string} sNotificationId The ID of the notification to be removed.
         * @param {string} sParentContextPath The context path of the parent group.
         *
         * @since 1.136.0
         * @private
         */
        _removeItemFromModel: async function (sNotificationId, sParentContextPath) {
            const oModel = this._getModel();

            // Remove from grouped notifications list
            const aGroupItems = oModel.getObject(sParentContextPath)?.items || [];
            const iIndexInGroup = aGroupItems.findIndex((oNotification) => oNotification.Id === sNotificationId);
            if (iIndexInGroup === -1) {
                return;
            }

            aGroupItems.splice(iIndexInGroup, 1);

            // Remove from the set of items before the model is updated to be updated when the formatter is triggered
            this._oItemSet.delete(sNotificationId);

            // Remove from model
            oModel.setProperty(`${sParentContextPath}/items`, deepExtend([], aGroupItems));
            this._updateListMaxReached();

            // Refreshing the model is a workaround to keep focus and update groups correctly.
            oModel.refresh(true);

            // Close the popover if there are no notifications left
            if (this._oItemSet.size === 0 && !this._moreNotificationsCanBeFetched()) {
                (await this.getOwnerComponent()._getPopover()).close();
            }
        },

        /**
         * Sets the focus on the appropriate element based on the reason for setting the focus.
         *
         * - Removing the last item of the list focuses the no-data illustration or the more button, if available.
         * - Removing the last item of a group, focuses the last item of the previous group. If it is the first group, the first item is focused.
         *
         * @param {string} sReason The reason for setting the focus.
         * @param {object} [oItem] Optional NotificationListItem to focus on.
         *
         * @since 1.136.0
         * @private
         */
        _setFocus: async function (sReason, oItem) {
            const bHasItems = this._oItemSet.size > 0;
            const bMoreItemsCanBeFetched = this._moreNotificationsCanBeFetched();
            const oList = this.byId("sapUshellNotificationsList");

            // Change focus to the no data illustration if no notifications are available.
            const fnFocusNoData = () => {
                const oNoData = this.byId("sapUshellNotificationsListNoData");
                const oEventDelegate = {
                    onAfterRendering: () => {
                        oNoData.focus();
                        oNoData.removeEventDelegate(oEventDelegate);
                    }
                };
                oNoData.addEventDelegate(oEventDelegate);
            };

            function fnFocusItem (oFocusItem) {
                oFocusItem?.getParent()?.setCollapsed(false);
                const oEventDelegate = {
                    onAfterRendering: () => {
                        setTimeout(() => {
                            oFocusItem?.getFocusDomRef()?.focus();
                        }, 0);
                        oFocusItem.removeEventDelegate(oEventDelegate);
                    }
                };
                oFocusItem.addEventDelegate(oEventDelegate);
            }

            switch (sReason) {
                case this.oSetFocusReason.ListRefreshed:
                    if (bHasItems) {
                        const oFirstGroup = oList.getItems()[0];
                        const oFirstItem = oFirstGroup?.getItems()[0];
                        fnFocusItem(oFirstItem);
                    } else {
                        fnFocusNoData();
                    }
                    break;

                case this.oSetFocusReason.MoreButtonPressed:
                    if (bMoreItemsCanBeFetched) {
                        this.byId("sapUshellNotificationsListMoreButton")?.focus();
                    } else {
                        // If there are no more items in the backend, the "More" button is not visible anymore and the focus should be set to the last item.
                        const iLastGroupIndex = oList.getItems().length - 1;
                        const oLastGroup = oList.getItems()[iLastGroupIndex];
                        const iLastItemIndex = oLastGroup?.getItems().length - 1;
                        const oLastItem = oLastGroup?.getItems()[iLastItemIndex];
                        fnFocusItem(oLastItem);
                    }
                    break;

                case this.oSetFocusReason.NotificationRemoved:
                    if (bHasItems) {
                        if (!oItem) {
                            break;
                        }
                        fnFocusItem(oItem);
                    } else if (bMoreItemsCanBeFetched) {
                        this.byId("sapUshellNotificationsListMoreButton")?.focus();
                        // If all loaded items are removed, the load more button gets busy and loads more items if there are any.
                        await this.getNextPage(false);
                    } else {
                        fnFocusNoData();
                    }
                    break;

                default:
                    // Focus on popover
                    (await this.getOwnerComponent()._getPopover()).focus();
                    break;
            }
        },

        /**
         * Handles removing an item using an async callback function and focuses the next focusable item.
         *
         * @param {object} oItem The NotificationListItem that was removed.
         * @param {function} [fnCallback] The optional async callback function to be executed to remove the items.
         *
         * @since 1.136.0
         * @private
         */
        _handleRemove: async function (oItem, fnCallback) {
            const oGroup = oItem.getParent();
            const oList = oGroup.getParent();
            const iGroupIndexOld = oList.getItems().indexOf(oGroup);
            const iGroupIndexNew = Math.max(iGroupIndexOld - 1, 0);
            const bGroupWasFirst = (iGroupIndexOld - 1) < 0;
            const bIsLastItemInGroup = oGroup.getItems().length <= 1;

            // Set focus on popover to keep focus while the list is re-rendered
            if (bIsLastItemInGroup) {
                (await this.getOwnerComponent()._getPopover()).focus();
            }

            // Run callback before retrieving the new group
            fnCallback().then(() => {
                if (bIsLastItemInGroup) {
                    const oGroupNew = oList.getItems()[iGroupIndexNew];
                    let iItemIndex = 0; // Focus first item by default

                    // Group was before the new group, we want to focus the last item
                    if (!bGroupWasFirst) {
                        iItemIndex = oGroupNew?.getItems().length - 1;
                    }
                    const oFocusItem = oGroupNew?.getItems()[iItemIndex];
                    this._setFocus(this.oSetFocusReason.NotificationRemoved, oFocusItem);
                }
            });
        },

        //*********************************************************************************************************
        //* *************************************** Handler functions **********************************************

        /**
         * Handles the press event on the "More" button which loads more notifications.
         *
         * @returns {Promise} A promise that resolves when the next page is loaded.
         *
         * @since 1.136.0
         * @private
         */
        onLoadMorePress: async function () {
            const oModel = this._getModel();
            if (!oModel.getProperty("/inUpdate")) {
                await this.getNextPage(false);
            }
        },

        /**
         * Handles the press event on the settings button which opens the user settings for notifications.
         *
         * @returns {Promise} A promise that resolves when the settings are opened.
         *
         * @since 1.136.0
         * @private
         */
        onSettingsPress: async function () {
            EventHub.emit("openUserSettings", {
                time: Date.now(),
                targetEntryId: "notificationsEntry"
            });
            (await this.getOwnerComponent()._getPopover()).close();
        },

        /**
         * Handles the press event on the sort menu button which opens the sort menu.
         *
         * @since 1.136.0
         * @private
         */
        onSortMenuPress: function () {
            Fragment.byId(this.getOwnerComponent().createId("notificationsListCustomHeader"), "sortMenu").setOpen(true);
        },

        /**
         * Handles the press event for a specific sort menu item and changes the sorting type.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         * @returns {Promise} A promise that resolves when the sorting type is changed.
         *
         * @since 1.136.0
         * @private
         */
        onSortMenuItemPress: async function (oEvent) {
            const oSelectedItem = oEvent.getParameter("item");

            this.sCurrentSorting = oSelectedItem.data("sortBy") || this.oSortingTypes.NOTIFICATIONS_BY_DATE_DESCENDING;
            this._sortUpdateSelectionState(oSelectedItem.data("sortBy"));
            await this.getNextPage(true);
        },

        /**
         * Handles the press event on the notification item and navigates accordingly.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         * @returns {Promise} A promise that resolves when the notification press was handled.
         *
         * @since 1.136.0
         * @private
         */
        onNotificationPress: async function (oEvent) {
            const oItem = oEvent.getParameter("item");

            // Only Continue of the Item is a valid notification list item, it could be a menu list item.
            if (this._bRemoving || !oItem?.isA || !oItem.isA("sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListItem")) {
                return;
            }

            const oNotification = oItem.getBindingContext().getObject();
            const sSemanticObject = oNotification.NavigationTargetObject;
            const sAction = oNotification.NavigationTargetAction;
            const aParameters = oNotification.NavigationTargetParams;

            if (sSemanticObject && sAction) {
                ushellUtils.toExternalWithParameters(sSemanticObject, sAction, aParameters);
            }
            await this._markNotificationRead(oItem);
        },

        /**
         * Handles the remove button press on the notification item.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         * @returns {Promise} A promise that resolves when the notification is removed.
         *
         * @since 1.136.0
         * @private
         */
        onNotificationRemovePress: async function (oEvent) {
            this._bRemoving = true;
            const oItem = oEvent.getParameter("item");
            const sParentContextPath = oItem.getParent().getBindingContext().getPath();
            return this._handleRemove(oItem, async () => {
                // Remove data from backend and model
                const oNotification = oItem.getBindingContext().getObject();
                return this.oNotificationsService.dismissNotification(oNotification.Id).then(() => {
                    return this._removeItemFromModel(oNotification.Id, sParentContextPath);
                }).finally(() => {
                    this._bRemoving = false;
                });
            }).catch(async () => {
                await _errorMessage(resources.i18n.getText("notificationsFailedDismiss"));
            });
        },

        /**
         * Handles the action button press of a notification item.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         * @returns {Promise} A promise that resolves when the action is performed.
         *
         * @since 1.136.0
         * @private
         */
        onNotificationActionPress: async function (oEvent) {
            const oActionMenuItem = oEvent.getParameter("item");
            const oAction = oActionMenuItem.getBindingContext().getObject();
            const oNotificationListItem = oActionMenuItem.getParent().getParent();
            const oNotification = oNotificationListItem.getBindingContext().getObject();

            oNotificationListItem.setBusy(true);
            this._bRemoving = true;
            return this.oNotificationsService.executeAction(oNotification.Id, oAction.ActionId)
                .then(async (oResponse) => {
                    if (oResponse?.isSucessfull) {
                        if (oResponse.message && oResponse.message.length) {
                            MessageToast.show(oResponse.message, { duration: 4000 });
                        } else {
                            const sActionText = oAction.ActionText;
                            MessageToast.show(resources.i18n.getText("ActionAppliedToNotification", [sActionText]), { duration: 4000 });
                        }

                        // Notification should remain in the UI (after action executed) only if DeleteOnReturn flag exists, and equals false
                        if (oResponse.DeleteOnReturn !== false) {
                            await this._handleRemove(oNotificationListItem, async () => {
                                this.oNotificationsService._addDismissNotifications(oNotification.Id);
                                const sParentContextPath = oNotificationListItem.getParent().getBindingContext().getPath();
                                await this._removeItemFromModel(oNotification.Id, sParentContextPath);
                                oNotificationListItem.setBusy(false);
                            });
                        }
                    } else if (oResponse) {
                        await _errorMessage(oResponse.message);
                    } else {
                        await _errorMessage(resources.i18n.getText("notificationsFailedExecuteAction"));
                    }
                })
                .catch(async () => {
                    await _errorMessage(resources.i18n.getText("notificationsFailedExecuteAction"));
                })
                .finally(() => {
                    this._bRemoving = false;
                    oNotificationListItem.setBusy(false);
                });
        },

        /**
         * Formatter to determine if the no data illustration should be shown.
         *
         * @param {boolean} bHasMoreItemsInBackend True if there are more items in the backend.
         * @param {boolean} bListMaxReached  True if the maximum number of items (on the client) has been reached.
         * @returns {boolean} True if the no data illustration should be shown, false otherwise.
         */
        formatShowNoDataIllustration: function (bHasMoreItemsInBackend, bListMaxReached) {
            return this._oItemSet.size === 0 && !bHasMoreItemsInBackend && !bListMaxReached;
        }
    });
});
