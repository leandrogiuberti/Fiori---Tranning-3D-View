// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ui/core/IconPool",
    "sap/ui/core/InvisibleText",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/hasher",
    "sap/ui/Device",
    "sap/m/library",
    "sap/m/Popover",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/Container",
    "sap/ushell/state/ShellModel",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/Fragment"
], (
    Log,
    Element,
    EventBus,
    IconPool,
    InvisibleText,
    UIComponent,
    hasher,
    Device,
    mobileLibrary,
    Popover,
    Config,
    EventHub,
    ushellLibrary,
    resources,
    utils,
    ShellHeadItem,
    Container,
    ShellModel,
    XMLView,
    Fragment
) => {
    "use strict";

    // Time in seconds for the notification to be shown
    const iNotificationsAlertTimeout = 10;

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.ushell.FloatingNumberType
    const FloatingNumberType = ushellLibrary.FloatingNumberType;

    function getNotificationButton () {
        return Element.getElementById("NotificationsCountButton");
    }

    function getShellBarNotificationButton () {
        return Element.getElementById("shell-header").getNotificationsBtnDomRef();
    }

    return UIComponent.extend("sap.ushell.components.shell.Notifications.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.components.shell.Notifications",
            dependencies: {
                libs: ["sap.m"]
            }
        },

        createContent: function () {
            this._aTimeouts = [];
            this.oRenderer = Container.getRendererInternal("fiori2");
            this.oConfigModel = ShellModel.getConfigModel();
            Container.getServiceAsync("NotificationsV2").then((oNotificationsService) => {
                this.oNotificationsService = oNotificationsService;

                if (this.oNotificationsService.isEnabled() === true) {
                    EventBus.getInstance().subscribe("sap.ushell.services.Notifications", "onNewNotifications", this._handleAlerts, this);
                    this.oConfigModel.setProperty("/enableNotifications", true);
                    this.oNotificationsService.init();
                    if (this.oRenderer.getShellConfig().enableNotificationsUI === true) {
                        this.oConfigModel.setProperty("/enableNotificationsUI", true);
                        this.oNotificationsService.registerNotificationsUpdateCallback(this._updateCount.bind(this), true);
                    }
                    this._createNotificationButton(this.oConfigModel);

                    EventHub.on("showNotifications").do(this._toggleNotifications.bind(this));
                }
            });
        },

        _createNotificationButton: function (oConfigModel) {
            // The press handler is added in the Notification Component
            const oNotificationToggleButton = new ShellHeadItem({
                id: "NotificationsCountButton",
                tooltip: resources.i18n.getText("notificationsBtn_title"),
                icon: IconPool.getIconURI("bell"),
                text: resources.i18n.getText("notificationsBtn_title"),
                ariaLabel: resources.i18n.getText("notificationsBtn_title"),
                ariaHaspopup: "dialog",
                enabled: true,
                selected: false,
                visible: "{configModel>/enableNotifications}",
                floatingNumber: "{configModel>/notificationsCount}",
                floatingNumberMaxValue: Device.system.phone ? 99 : 999, // according to the UX specification
                floatingNumberType: FloatingNumberType.Notifications,
                press: function () {
                    EventHub.emit("showNotifications", Date.now());
                }
            });
            oNotificationToggleButton.setModel(oConfigModel, "configModel");
            oNotificationToggleButton.setModel(resources.i18nModel, "i18n");

            this.oRenderer.showHeaderEndItem([oNotificationToggleButton.getId()], false, ["home", "app"]);
        },

        _handleAlerts: function (sChannelId, sEventId, aNewNotifications) {
            (aNewNotifications || []).forEach(this.handleNotification.bind(this));
        },

        // Alert (badge in the UXC terminology)
        handleNotification: function (oNotification) {
            const fnItemClick = () => {
                if (hasher.getHash() !== `${oNotification.NavigationTargetObject}-${oNotification.NavigationTargetAction}`) {
                    if (oNotification.NavigationTargetObject && oNotification.NavigationTargetAction) {
                        utils.toExternalWithParameters(
                            oNotification.NavigationTargetObject,
                            oNotification.NavigationTargetAction,
                            oNotification.NavigationTargetParams
                        );
                    }
                }
                this.oNotificationsService.markRead(oNotification.Id);
            };

            // Use new notifications popover
            if (Config.last("/core/notifications/enabled")) {
                sap.ui.require([
                    "sap/ushell/gen/ui5/webcomponents/dist/Label",
                    "sap/ushell/gen/ui5/webcomponents-fiori/dist/NotificationList",
                    "sap/ushell/gen/ui5/webcomponents-fiori/dist/NotificationListItem"
                ], (Label, NotificationList, NotificationListItem) => {
                    if (!this._oNotificationsAlertList) {
                        this._oNotificationsAlertList = new NotificationList({
                            itemClick: fnItemClick
                        });
                        this._oNotificationsAlertList.addStyleClass("sapUshellNotificationsAlertList");
                        this.oRenderer.addRightFloatingContainerItem({ id: this._oNotificationsAlertList.getId() }, true, true);
                    }

                    const fnNotificationDismiss = (oNotificationItem) => {
                        oNotificationItem.destroy();
                        if (this._oNotificationsAlertList.getItems().length <= 0) {
                            this.oRenderer.showRightFloatingContainer(false);
                        }
                    };

                    const oNotificationItem = new NotificationListItem({
                        titleText: oNotification.SensitiveText ? oNotification.SensitiveText : oNotification.Text,
                        showClose: true,
                        importance: "Important",
                        text: oNotification.SubTitle,
                        read: false,
                        footnotes: [
                            new Label({ text: oNotification.NotificationTypeDesc }),
                            new Label({ text: utils.formatDate(oNotification.CreatedAt) })
                        ],
                        close: (oEvent) => {
                            fnNotificationDismiss(oEvent.getSource());
                        }
                    });
                    oNotificationItem.addStyleClass("sapUshellNotificationsAlertListItem");
                    this._oNotificationsAlertList.insertItem(oNotificationItem, 0);

                    this.oRenderer.showRightFloatingContainer(true);
                    const iTimeout = setTimeout(fnNotificationDismiss.bind(this, oNotificationItem), iNotificationsAlertTimeout * 1000);
                    this._aTimeouts.push(iTimeout);
                });
            // Use classic notifications popover
            } else {
                // create an element of RightFloatingContainer
                const oAlertEntry = this.oRenderer.addRightFloatingContainerItem({
                    press: fnItemClick,
                    close: function () {
                        this.oRenderer.removeRightFloatingContainerItem(oAlertEntry.getId(), true);
                    }.bind(this),
                    datetime: resources.i18n.getText("notification_arrival_time_now"),
                    title: oNotification.SensitiveText ? oNotification.SensitiveText : oNotification.Text,
                    description: oNotification.SubTitle,
                    unread: oNotification.IsRead,
                    priority: "High",
                    hideShowMoreButton: true
                }, true, true);
                this.oRenderer.showRightFloatingContainer(true);
                const iTimeout = setTimeout(() => {
                    this.oRenderer.removeRightFloatingContainerItem(oAlertEntry.getId(), true);
                }, iNotificationsAlertTimeout * 1000);
                this._aTimeouts.push(iTimeout);
            }
        },

        // Update the notifications count in the UI
        // The new count is also displayed when the notifications popover is already opened
        _updateCount: function () {
            this._getPopover().then((oPopover) => {
                if (!oPopover.isOpen()) {
                    this.oNotificationsService.getUnseenNotificationsCount().then((iNumberOfNotifications) => {
                        this.oConfigModel.setProperty("/notificationsCount", parseInt(iNumberOfNotifications, 10));
                    })
                        .catch((oError) => {
                            Log.error("Notifications - call to notificationsService.getCount failed: ", oError);
                        });
                }
            });
        },

        /**
         * Wraps the given view in a popover.
         *
         * @param {sap.ui.core.mvc.XMLView} oNotificationView The view to wrap.
         * @param {sap.ui.core.Fragment} [oCustomHeader] A fragment to bue used as the custom header.
         * @returns {sap.m.Popover} The popover.
         *
         * @since 1.136.0
         * @private
         */
        _wrapPopover: function (oNotificationView, oCustomHeader) {
            const oPopover = new Popover("shellNotificationsPopover", {
                showHeader: !!oCustomHeader,
                customHeader: oCustomHeader,
                placement: PlacementType.Bottom,
                showArrow: true,
                content: oNotificationView,
                horizontalScrolling: false,
                beforeOpen: () => {
                    this._resetCount();
                },
                beforeClose: (oEvent) => {
                    oEvent.getSource().getContent()[0].invalidate(); // Workaround to fix 1980098133; for some reason, still needed
                }
            });
            oPopover._oAriaLabelledByText = new InvisibleText(`${oPopover.getId()}-labelledBy`, {
                text: resources.i18n.getText("NotificationToggleButton.NoNewNotifications")
            }).toStatic();
            oPopover.addDependent(oPopover._oAriaLabelledByText);
            oPopover.addAriaLabelledBy(oPopover._oAriaLabelledByText);
            oPopover.addStyleClass("sapContrastPlus");
            return oPopover;
        },

        /**
         * Creates a popover which contains the notifications list.
         *
         * If the configuration "/core/notifications/enabled" is true, the new notification popover is used, otherwise the classic notification popover.
         *
         * @returns {Promise<sap.m.Popover>} A promise that resolves with the popover.
         *
         * @since 1.136.0
         * @private
         */
        _getPopover: function () {
            if (!this._oNotificationsPopoverPromise) {
                if (Config.last("/core/notifications/enabled")) {
                    this._oNotificationsPopoverPromise = new Promise((resolve, reject) => {
                        this.runAsOwner(() => {
                            XMLView.create({
                                id: this.createId("notificationsListContent"),
                                viewName: "sap.ushell.components.shell.Notifications.NotificationsListPopoverContent",
                                viewData: { notificationsService: this.oNotificationsService }
                            }).then(async (oView) => {
                                const oController = oView.getController();
                                const oCustomHeader = await Fragment.load({
                                    id: this.createId("notificationsListCustomHeader"),
                                    name: "sap.ushell.components.shell.Notifications.NotificationsListPopoverHeader",
                                    controller: oController
                                });
                                oCustomHeader.setModel(oView.getModel("i18n"), "i18n");
                                oCustomHeader.setModel(oView.getModel());

                                const oPopover = this._wrapPopover(oView, oCustomHeader);
                                oPopover.addStyleClass("sapUshellNotificationsListPopup");

                                // Every time the popover opens, we need to load the notifications.
                                oPopover.attachBeforeOpen(() => {
                                    this.oNotificationsService.setUnseenNotificationsCount(0);
                                    oController.getNextPage(true);
                                });

                                // Initial focus is required, otherwise the focus is lost and not set properly.
                                oPopover.setInitialFocus(oController.byId("sapUshellNotificationsList"));

                                // Update the count when the popover closes to show missed notifications
                                oPopover.attachAfterClose(this._updateCount.bind(this));

                                resolve(oPopover);
                            }).catch(reject);
                        });
                    });
                } else {
                    this._oNotificationsPopoverPromise = new Promise((resolve, reject) => {
                        XMLView.create({
                            id: "notificationsView",
                            viewName: "sap.ushell.components.shell.Notifications.Notifications",
                            viewData: { notificationsService: this.oNotificationsService }
                        }).then((oNotificationView) => {
                            const oNotificationIconTabBar = oNotificationView.byId("notificationIconTabBar");
                            oNotificationIconTabBar.setAriaTexts({
                                headerLabel: resources.i18n.getText("Notifications.Popover.IconTabBar.Header.AriaLabel")
                            });

                            const oNotificationsListDate = oNotificationView.byId("sapUshellNotificationsListDate");
                            oNotificationsListDate.enhanceAccessibilityState = function (oNLD, mAriaProps) {
                                mAriaProps.hidden = true;
                                return mAriaProps;
                            };
                            const oNotificationsListPriority = oNotificationView.byId("sapUshellNotificationsListPriority");
                            oNotificationsListPriority.enhanceAccessibilityState = function (oNLP, mAriaProps) {
                                mAriaProps.hidden = true;
                                return mAriaProps;
                            };
                            const oNotificationsListType = oNotificationView.byId("sapUshellNotificationsListType");
                            oNotificationsListType.enhanceAccessibilityState = function (oNLT, mAriaProps) {
                                mAriaProps.hidden = true;
                                return mAriaProps;
                            };

                            const oPopover = this._wrapPopover(oNotificationView);
                            oPopover.addStyleClass("sapUshellNotificationsPopup");
                            resolve(oPopover);
                        }).catch(reject);
                    });
                }
            }
            return this._oNotificationsPopoverPromise;
        },

        _toggleNotifications: function (bShow) {
            this._getPopover().then((oPopover) => {
                let oSource;
                if (Config.last("/core/shellBar/enabled")) {
                    oSource = getShellBarNotificationButton();
                } else {
                    oSource = getNotificationButton();
                    // if the button is hidden in the overflow, use the overflow button itself
                    if (!oSource.$().width()) {
                        oSource = Element.getElementById("endItemsOverflowBtn");
                    }
                }

                if (oPopover.isOpen()) {
                    oPopover.close();
                } else if (bShow !== false) { // Special case: ComponentKeysHandler may emit showNotifications:false
                    this._resetCount();
                    oPopover.openBy(oSource);
                }
            });
        },

        _resetCount: function () {
            this.oConfigModel.setProperty("/notificationsCount", 0);
            this.oNotificationsService.notificationsSeen();
        },

        exit: function () {
            EventBus.getInstance().unsubscribe("sap.ushell.services.Notifications", "onNewNotifications", this._handleAlerts, this);
            if (this.oNotificationsService && this.oNotificationsService.isEnabled() === true) {
                this.oNotificationsService.destroy();
            }
            this.oNotificationsService = null;

            const oNotificationBtn = getNotificationButton();
            if (oNotificationBtn) {
                this.oRenderer.hideHeaderEndItem(oNotificationBtn, false);
                oNotificationBtn.destroy();
            }
            this.oRenderer = null;
            let oNotificationsPopover = Element.getElementById("notificationsView");
            if (oNotificationsPopover) {
                oNotificationsPopover.destroy();
                oNotificationsPopover = null;
            }
            this._aTimeouts.forEach(window.clearTimeout); // clear pending timeouts
        }
    });
});
