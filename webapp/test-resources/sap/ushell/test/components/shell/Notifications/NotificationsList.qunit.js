// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.Notifications.NotificationsList
 */
sap.ui.define([
    "sap/m/MessageToast",
    "sap/ushell/components/shell/Notifications/NotificationsList.controller",
    "sap/ushell/Container",
    "sap/ushell/resources",
    "sap/ushell/services/NotificationsV2",
    "sap/ushell/utils",
    "sap/ushell/utils/Deferred"
], (
    MessageToast,
    NotificationsListController,
    Container,
    resources,
    NotificationsService,
    Utils,
    UtilsDeferred
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    const aNotifications = [
        {
            Id: "00505692-409C-1EE5-ABDA-8F15E3E3B020",
            CreatedAt: "2024-12-30T09:59:12Z",
            IsRead: false,
            NavigationTargetAction: "DisplayObject",
            NavigationTargetObject: "PurchaseOrder",
            Priority: "LOW",
            SensitiveText: "Purchase order #1807 for $5,000 by Gavin Gradel requires your approval",
            Text: "A purchase order requires your approval",
            SubTitle: "Purchase Order #1807 ",
            description: "description Test #1807",
            NavigationTargetParams: [
                {
                    NotificationId: "00505692-409C-1EE5-ABDA-8F15E3E3B020",
                    Key: "PurchaseOrderId",
                    Value: "236400"
                }, {
                    NotificationId: "00505692-409C-1EE5-ABDA-8F15E3E3B020",
                    Key: "PurchaseOrderVendor",
                    Value: "PARTNER_137"
                }
            ],
            Actions: [
                {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0000",
                    ActionText: "Accept",
                    GroupActionText: "Accept All",
                    Nature: "POSITIVE"
                }, {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0001",
                    ActionText: "Reject",
                    GroupActionText: "Reject All",
                    Nature: "NEGATIVE"
                }
            ]
        },
        {
            Id: "00505692-409C-1EE5-ABDA-8FA41F727019",
            OriginId: "G1Y_800",
            CreatedAt: "2024-12-30T09:01:20Z",
            IsRead: true,
            NavigationTargetAction: "display",
            NavigationTargetObject: "LeaveRequest",
            Priority: "MEDIUM",
            SensitiveText: "Leave request #1808 by Gavin Gradel requires your attention",
            Text: "A leave request requires your attention",
            SubTitle: "Purchase Order #1808",
            description: "description Test #1808",
            NavigationTargetParams: [
                {
                    NotificationId: "00505692-409C-1EE5-ABDA-8FA41F727020",
                    Key: "LeaveRequestId",
                    Value: "AA-DD0055"
                }, {
                    NotificationId: "00505692-409C-1EE5-ABDA-8FA41F727020",
                    Key: "LeaveRequestMode",
                    Value: "EditAsManager"
                }
            ],
            Actions: [
                {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0011",
                    ActionText: "Deny",
                    GroupActionText: "Deny All",
                    Nature: "NEGATIVE"
                }, {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0010",
                    ActionText: "Approve",
                    GroupActionText: "Approve All",
                    Nature: "POSITIVE"
                }
            ]
        },
        {
            Id: "00505692-409C-1EE5-ABDA-8F15E3E3B021",
            OriginId: "G1Y_800",
            CreatedAt: "2024-12-25T09:30:12Z",
            IsActionable: true,
            IsRead: false,
            NavigationTargetAction: "DisplayObject",
            NavigationTargetObject: "PurchaseOrder",
            NotificationTypeId: "00505692-5975-1EE5-A991-2706A9CB0001",
            ParentId: "00000000-0000-0000-0000-000000000000",
            Priority: "HIGH",
            SensitiveText: "Purchase order #1807 for $5,000 by Gavin Gradel requires your approval",
            Text: "A purchase order requires your approval",
            SubTitle: "Purchase order #1807",
            description: "description Test #1807 for $5,000",
            NavigationTargetParams: [
                {
                    NotificationId: "00505692-409C-1EE5-ABDA-8F15E3E3B021",
                    Key: "PurchaseOrderId",
                    Value: "236400"
                }, {
                    NotificationId: "00505692-409C-1EE5-ABDA-8F15E3E3B021",
                    Key: "PurchaseOrderVendor",
                    Value: "PARTNER_137"
                }
            ],
            Actions: [
                {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0000",
                    ActionText: "Accept",
                    GroupActionText: "Accept All",
                    Nature: "POSITIVE"
                }, {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0001",
                    ActionText: "Reject",
                    GroupActionText: "Reject All",
                    Nature: "NEGATIVE"
                }
            ]
        },
        {
            Id: "00505692-409C-1EE5-ABDA-8F15E3E3B022",
            OriginId: "G1Y_800",
            CreatedAt: "2015-12-10T09:05:19Z",
            IsActionable: true,
            IsRead: false,
            NavigationTargetAction: "DisplayObject",
            NavigationTargetObject: "PurchaseOrder",
            Priority: "HIGH",
            SensitiveText: "",
            Text: "A purchase order requires your approval",
            SubTitle: "",
            description: "description Test",
            NavigationTargetParams: [
                {
                    NotificationId: "00505692-409C-1EE5-ABDA-8F15E3E3B021",
                    Key: "PurchaseOrderId",
                    Value: "236400"
                }, {
                    NotificationId: "00505692-409C-1EE5-ABDA-8F15E3E3B021",
                    Key: "PurchaseOrderVendor",
                    Value: "PARTNER_137"
                }
            ],
            Actions: [
                {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0000",
                    ActionText: "Accept",
                    GroupActionText: "Accept All",
                    Nature: "POSITIVE"
                }, {
                    ActionId: "00505692-5975-1EE5-A991-2706A9CC0001",
                    ActionText: "Reject",
                    GroupActionText: "Reject All",
                    Nature: "NEGATIVE"
                }
            ]
        }
    ];

    function beforeEach () {
        this.oMessageToastShowStub = sandbox.stub(MessageToast, "show");
        this.oToExternalStub = sandbox.stub(Utils, "toExternalWithParameters").resolves();
        this.oFormatDateStub = sandbox.spy(Utils, "formatDate");

        this.oErrorMessageStub = sandbox.stub();
        sandbox.stub(Container, "getServiceAsync").withArgs("MessageInternal").resolves({
            error: this.oErrorMessageStub
        });

        this.oSettingsAvailabilityDeferred = new UtilsDeferred();
        this.oSettingsAvailabilityDeferredStateStub = sandbox.stub(this.oSettingsAvailabilityDeferred.promise(), "state").returns("pending");
        this.oSettingsAvailabilityDeferredThenStub = sandbox.stub(this.oSettingsAvailabilityDeferred.promise(), "then");
        this.oSettingsAvailabilityDeferredThenStub.callsFake(function (fnSuccess) {
            fnSuccess({
                settingsAvailable: true
            });
            return this;
        });
        this.oSorting = {
            NOTIFICATIONS_BY_DATE_DESCENDING: "notificationsByDateDescending",
            NOTIFICATIONS_BY_PRIORITY_DESCENDING: "notificationsByPriorityDescending"
        };
        this.oNotificationsServiceMock = {
            getOperationEnum: sandbox.stub().returns(this.oSorting),
            getNotifications: sandbox.stub(),
            getUnseenNotificationsCount: sandbox.stub(),
            getNotificationsBufferBySortingType: sandbox.stub(),
            markRead: sandbox.stub(),
            dismissNotification: sandbox.stub(),
            executeAction: sandbox.stub(),
            _userSettingInitialization: sandbox.stub(),
            _addDismissNotifications: sandbox.stub(),
            _getNotificationSettingsAvailability: sandbox.stub().returns(this.oSettingsAvailabilityDeferred.promise())
        };

        const oViewMock = {
            _oModels: {},
            getViewData: () => {
                return {
                    notificationsService: this.oNotificationsServiceMock
                };
            },
            setModel: function (oModel, sName) {
                oViewMock._oModels[sName] = oModel;
            },
            getModel: function (oModel, sName) {
                return oViewMock._oModels[sName];
            },
            setVisible: sandbox.stub()
        };
        this.oGetViewStub = sandbox.stub(NotificationsListController.prototype, "getView");
        this.oGetViewStub.returns(oViewMock);
    }

    /**
     * This method is called after each test. Add every restoration code here.
     */
    function afterEach () {
        sandbox.restore();
        this.oController.destroy();
    }

    QUnit.module("The method 'onInit'", {
        beforeEach: function () {
            beforeEach.call(this);
            this.oController = new NotificationsListController();
        },
        afterEach: function () {
            afterEach.call(this);
        }
    });

    QUnit.test("Controller was initialized with settings available", function (assert) {
        // Arrange
        const oExpectedModelData = {
            hasMoreItemsInBackend: true,
            inUpdate: false,
            listMaxReached: false,
            notifications: [],
            settingsAvailable: true
        };

        // Act
        this.oController.onInit();

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.strictEqual(this.oSettingsAvailabilityDeferredStateStub.callCount, 1, "Settings availability deferred state is called once");
        assert.strictEqual(this.oSettingsAvailabilityDeferredThenStub.callCount, 1, "Settings availability deferred then is called once");
        assert.strictEqual(this.oNotificationsServiceMock._userSettingInitialization.callCount, 1, "User setting initialization is called once");
    });

    QUnit.test("Controller was initialized without settings available", function (assert) {
        // Arrange
        this.oSettingsAvailabilityDeferredThenStub = this.oSettingsAvailabilityDeferredThenStub.callsFake(function (fnSuccess) {
            fnSuccess({
                settingsAvailable: false
            });
            return this;
        });
        const oExpectedModelData = {
            hasMoreItemsInBackend: true,
            inUpdate: false,
            listMaxReached: false,
            notifications: [],
            settingsAvailable: false
        };

        // Act
        this.oController.onInit();

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.strictEqual(this.oSettingsAvailabilityDeferredStateStub.callCount, 1, "Settings availability deferred state is called once");
        assert.strictEqual(this.oSettingsAvailabilityDeferredThenStub.callCount, 1, "Settings availability deferred then is called once");
        assert.strictEqual(this.oNotificationsServiceMock._userSettingInitialization.callCount, 1, "User setting initialization is called once");
    });

    QUnit.module("The method 'getNextPage'", {
        beforeEach: function () {
            this.oPopoverSetBusyStub = sandbox.stub();
            sandbox.stub(NotificationsListController.prototype, "getOwnerComponent").returns({
                _getPopover: () => {
                    return {
                        setBusy: this.oPopoverSetBusyStub
                    };
                }
            });
            this.oMoreButtonSetBusyStub = sandbox.stub();
            sandbox.stub(NotificationsListController.prototype, "byId").withArgs("sapUshellNotificationsListMoreButton").returns({
                setBusy: this.oMoreButtonSetBusyStub
            });

            this.oSetFocusStub = sandbox.stub(NotificationsListController.prototype, "_setFocus");

            beforeEach.call(this);

            this.oController = new NotificationsListController();
            this.oController.onInit();
        },
        afterEach: function () {
            afterEach.call(this);
        }
    });

    QUnit.test("Call getNextPage with refresh true - no data - group by date", async function (assert) {
        // Arrange
        const oExpectedModelData = {
            hasMoreItemsInBackend: false,
            inUpdate: false,
            listMaxReached: false,
            settingsAvailable: true,
            notifications: []
        };
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves([]);

        // Act
        await this.oController.getNextPage(true);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 0, "More button set busy is not called");
    });

    QUnit.test("Call getNextPage with refresh true - with data - group by date", async function (assert) {
        // Arrange
        const aGroupedNotifications = this.oController._getGroupsForTimePeriods();
        aGroupedNotifications[7].items = aNotifications; // Date group "Older"
        const oExpectedModelData = {
            hasMoreItemsInBackend: false,
            inUpdate: false,
            listMaxReached: false,
            settingsAvailable: true,
            notifications: aGroupedNotifications
        };
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves(aNotifications);

        // Act
        await this.oController.getNextPage(true);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.deepEqual(
            this.oNotificationsServiceMock.getNotificationsBufferBySortingType.getCall(0).args,
            [this.oSorting.NOTIFICATIONS_BY_DATE_DESCENDING, 0, 60 ],
            "Service was called with correct parameters"
        );
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 0, "More button set busy is not called");
        assert.strictEqual(this.oSetFocusStub.callCount, 1, "Set focus is called once");
    });

    QUnit.test("Call getNextPage with refresh true (first page) and false (second page) - with data and unseen - group by date", async function (assert) {
        // FIRST PAGE (INITIAL)
        // Arrange
        const iPageSize = 2;
        const aGroupedNotifications = this.oController._getGroupsForTimePeriods();
        aGroupedNotifications[7].items = aNotifications.slice(0, iPageSize); // Date group "Older"
        const oExpectedModelData = {
            hasMoreItemsInBackend: true,
            inUpdate: false,
            listMaxReached: false,
            settingsAvailable: true,
            notifications: aGroupedNotifications
        };

        // fetch only 2 notifications
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves(aNotifications.slice(0, iPageSize));
        sandbox.stub(this.oController, "_getNumberOfNotificationsToFetch").returns(iPageSize);

        // Act
        await this.oController.getNextPage(true);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.deepEqual(
            this.oNotificationsServiceMock.getNotificationsBufferBySortingType.getCall(0).args,
            [this.oSorting.NOTIFICATIONS_BY_DATE_DESCENDING, 0, iPageSize ],
            "Service was called with correct parameters"
        );
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 0, "More button set busy is not called");
        assert.strictEqual(this.oSetFocusStub.callCount, 1, "Set focus is called once");

        // SECOND PAGE
        // Arrange
        const iUnseen = 1;
        this.oNotificationsServiceMock.getUnseenNotificationsCount.resolves(iUnseen);
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves(aNotifications.slice(iPageSize, iPageSize + iPageSize));
        oExpectedModelData.notifications[7].items = aNotifications.slice(0, iPageSize + iPageSize);

        // Act
        await this.oController.getNextPage(false);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.deepEqual(
            this.oNotificationsServiceMock.getNotificationsBufferBySortingType.getCall(1).args,
            [this.oSorting.NOTIFICATIONS_BY_DATE_DESCENDING, iUnseen + iPageSize, iPageSize ],
            "Service was called with correct parameters"
        );
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 2, "More button set busy is not called");
        assert.strictEqual(this.oSetFocusStub.callCount, 2, "Set focus is called once");
    });

    QUnit.test("Call getNextPage with refresh true - no data - group by importance", async function (assert) {
        // Arrange
        this.oController.sCurrentSorting = this.oController.oSortingTypes.NOTIFICATIONS_BY_PRIORITY_DESCENDING;
        const oExpectedModelData = {
            hasMoreItemsInBackend: false,
            inUpdate: false,
            listMaxReached: false,
            settingsAvailable: true,
            notifications: []
        };
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves([]);

        // Act
        await this.oController.getNextPage(true);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 0, "More button set busy is not called");
    });

    QUnit.test("Call getNextPage with refresh true - with data - group by importance", async function (assert) {
        // Arrange
        this.oController.sCurrentSorting = this.oController.oSortingTypes.NOTIFICATIONS_BY_PRIORITY_DESCENDING;
        const aGroupedNotifications = this.oController._getGroupsForPriority();
        const aHighPriorityNotifications = aNotifications.filter((oNotification) => oNotification.Priority === "HIGH");
        const aNotHighPriorityNotifications = aNotifications.filter((oNotification) => oNotification.Priority !== "HIGH");
        aGroupedNotifications[0].items = aHighPriorityNotifications;
        aGroupedNotifications[1].items = aNotHighPriorityNotifications;

        const oExpectedModelData = {
            hasMoreItemsInBackend: false,
            inUpdate: false,
            listMaxReached: false,
            settingsAvailable: true,
            notifications: aGroupedNotifications
        };
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves(aNotifications);

        // Act
        await this.oController.getNextPage(true);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.deepEqual(
            this.oNotificationsServiceMock.getNotificationsBufferBySortingType.getCall(0).args,
            [this.oSorting.NOTIFICATIONS_BY_PRIORITY_DESCENDING, 0, 60 ],
            "Service was called with correct parameters"
        );
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 0, "More button set busy is not called");
        assert.strictEqual(this.oSetFocusStub.callCount, 1, "Set focus is called once");
    });

    QUnit.test("Call getNextPage with refresh true (first page) and false (second page) - with data and unseen - group by importance", async function (assert) {
        // FIRST PAGE (INITIAL)
        // Arrange
        this.oController.sCurrentSorting = this.oController.oSortingTypes.NOTIFICATIONS_BY_PRIORITY_DESCENDING;
        const aGroupedNotifications = this.oController._getGroupsForPriority();
        const iPageSize = 2;
        aGroupedNotifications[1].items = aNotifications.slice(0, iPageSize);
        const oExpectedModelData = {
            hasMoreItemsInBackend: true,
            inUpdate: false,
            listMaxReached: false,
            settingsAvailable: true,
            notifications: aGroupedNotifications
        };

        // fetch only 2 notifications
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves(aNotifications.slice(0, iPageSize));
        sandbox.stub(this.oController, "_getNumberOfNotificationsToFetch").returns(iPageSize);

        // Act
        await this.oController.getNextPage(true);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.deepEqual(
            this.oNotificationsServiceMock.getNotificationsBufferBySortingType.getCall(0).args,
            [this.oSorting.NOTIFICATIONS_BY_PRIORITY_DESCENDING, 0, iPageSize ],
            "Service was called with correct parameters"
        );
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 0, "More button set busy is not called");
        assert.strictEqual(this.oSetFocusStub.callCount, 1, "Set focus is called once");

        // SECOND PAGE
        // Arrange
        const iUnseen = 1;
        this.oNotificationsServiceMock.getUnseenNotificationsCount.resolves(iUnseen);
        this.oNotificationsServiceMock.getNotificationsBufferBySortingType.resolves(aNotifications.slice(iPageSize, iPageSize + iPageSize));
        aGroupedNotifications[0].items = aNotifications.slice(iPageSize, iPageSize + iPageSize);

        // Act
        await this.oController.getNextPage(false);

        // Assert
        assert.deepEqual(this.oController._getModel().getData(), oExpectedModelData, "Model data is set correctly");
        assert.deepEqual(
            this.oNotificationsServiceMock.getNotificationsBufferBySortingType.getCall(1).args,
            [this.oSorting.NOTIFICATIONS_BY_PRIORITY_DESCENDING, iUnseen + iPageSize, iPageSize ],
            "Service was called with correct parameters"
        );
        assert.strictEqual(this.oPopoverSetBusyStub.callCount, 2, "Popover set busy is called twice");
        assert.strictEqual(this.oMoreButtonSetBusyStub.callCount, 2, "More button set busy is not called");
        assert.strictEqual(this.oSetFocusStub.callCount, 2, "Set focus is called once");
    });

    QUnit.module("The method '_groupNotificationsByTimePeriods'", {
        beforeEach: function () {
            beforeEach.call(this);

            const oDateToday = new Date("2025-04-17T06:15:00Z");
            this.oClock = sinon.useFakeTimers(oDateToday);

            this.oController = new NotificationsListController();
            this.oController.onInit();
        },
        afterEach: function () {
            afterEach.call(this);
            this.oClock.restore();
        }
    });

    QUnit.test("Notifications are grouped into correct date groups", function (assert) {
        // Arrange
        const aNotificationsDate = [
            { CreatedAt: (new Date("2025-04-17T06:15:00Z")).toISOString() }, // TODAY
            { CreatedAt: (new Date("2025-04-16T06:15:00Z")).toISOString() }, // YESTERDAY
            { CreatedAt: (new Date("2025-04-15T06:15:00Z")).toISOString() }, // THIS_WEEK
            { CreatedAt: (new Date("2025-04-09T06:15:00Z")).toISOString() }, // LAST_WEEK
            { CreatedAt: (new Date("2025-04-02T06:15:00Z")).toISOString() }, // THIS_MONTH
            { CreatedAt: (new Date("2025-03-20T06:15:00Z")).toISOString() }, // LAST_MONTH
            { CreatedAt: (new Date("2025-02-20T06:15:00Z")).toISOString() }, // THIS_YEAR
            { CreatedAt: (new Date("2024-12-26T06:15:00Z")).toISOString() } // OLDER
        ];

        const oExpectedGroups = {
            TODAY: 1,
            YESTERDAY: 1,
            THIS_WEEK: 1,
            LAST_WEEK: 1,
            THIS_MONTH: 1,
            LAST_MONTH: 1,
            THIS_YEAR: 1,
            OLDER: 1
        };

        // Act
        const aGroupedNotifications = this.oController._groupNotificationsByTimePeriods(undefined, aNotificationsDate);

        // Assert
        const oActualGroups = aGroupedNotifications.reduce((acc, group) => {
            acc[group.key] = group.items.length;
            return acc;
        }, {});

        assert.deepEqual(oActualGroups, oExpectedGroups, "Notifications are grouped into the correct date groups");
        assert.strictEqual(aGroupedNotifications.length, 8, "Notifications are grouped into 8 date groups");
        assert.deepEqual(aGroupedNotifications[0].items[0], aNotificationsDate[0], "Notifications are grouped into the correct date group: TODAY");
        assert.deepEqual(aGroupedNotifications[1].items[0], aNotificationsDate[1], "Notifications are grouped into the correct date group: YESTERDAY");
        assert.deepEqual(aGroupedNotifications[2].items[0], aNotificationsDate[2], "Notifications are grouped into the correct date group: THIS_WEEK");
        assert.deepEqual(aGroupedNotifications[3].items[0], aNotificationsDate[3], "Notifications are grouped into the correct date group: LAST_WEEK");
        assert.deepEqual(aGroupedNotifications[4].items[0], aNotificationsDate[4], "Notifications are grouped into the correct date group: THIS_MONTH");
        assert.deepEqual(aGroupedNotifications[5].items[0], aNotificationsDate[5], "Notifications are grouped into the correct date group: LAST_MONTH");
        assert.deepEqual(aGroupedNotifications[6].items[0], aNotificationsDate[6], "Notifications are grouped into the correct date group: THIS_YEAR");
        assert.deepEqual(aGroupedNotifications[7].items[0], aNotificationsDate[7], "Notifications are grouped into the correct date group: OLDER");

        // Add new notification to the same group
        // Arrange
        const aNotificationsDateNew = [
            { CreatedAt: (new Date("2025-04-17T06:15:05Z")).toISOString() }, // TODAY
            { CreatedAt: (new Date("2025-04-16T06:15:05Z")).toISOString() }, // YESTERDAY
            { CreatedAt: (new Date("2025-04-15T06:15:05Z")).toISOString() }, // THIS_WEEK
            { CreatedAt: (new Date("2025-04-09T06:15:05Z")).toISOString() }, // LAST_WEEK
            { CreatedAt: (new Date("2025-04-02T06:15:05Z")).toISOString() }, // THIS_MONTH
            { CreatedAt: (new Date("2025-03-20T06:15:05Z")).toISOString() }, // LAST_MONTH
            { CreatedAt: (new Date("2025-02-20T06:15:05Z")).toISOString() }, // THIS_YEAR
            { CreatedAt: (new Date("2024-12-26T06:15:05Z")).toISOString() } // OLDER
        ];

        const oExpectedGroupsWithNew = {
            TODAY: 2,
            YESTERDAY: 2,
            THIS_WEEK: 2,
            LAST_WEEK: 2,
            THIS_MONTH: 2,
            LAST_MONTH: 2,
            THIS_YEAR: 2,
            OLDER: 2
        };

        // Act
        const aGroupedNotificationsWithNew = this.oController._groupNotificationsByTimePeriods(aGroupedNotifications, aNotificationsDateNew);

        // Assert
        const oActualGroupsWithNew = aGroupedNotifications.reduce((acc, group) => {
            acc[group.key] = group.items.length;
            return acc;
        }, {});

        assert.deepEqual(oActualGroupsWithNew, oExpectedGroupsWithNew, "Notifications are grouped into the correct date groups");
        assert.strictEqual(aGroupedNotificationsWithNew.length, 8, "Notifications are grouped into 8 date groups");
        assert.deepEqual(aGroupedNotificationsWithNew[0].items[0], aNotificationsDate[0], "Notifications are grouped into the correct date group: TODAY");
        assert.deepEqual(aGroupedNotificationsWithNew[0].items[1], aNotificationsDateNew[0], "Notifications are grouped into the correct date group: TODAY");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[0], aNotificationsDate[1], "Notifications are grouped into the correct date group: YESTERDAY");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[1], aNotificationsDateNew[1], "Notifications are grouped into the correct date group: YESTERDAY");
        assert.deepEqual(aGroupedNotificationsWithNew[2].items[0], aNotificationsDate[2], "Notifications are grouped into the correct date group: THIS_WEEK");
        assert.deepEqual(aGroupedNotificationsWithNew[2].items[1], aNotificationsDateNew[2], "Notifications are grouped into the correct date group: THIS_WEEK");
        assert.deepEqual(aGroupedNotificationsWithNew[3].items[0], aNotificationsDate[3], "Notifications are grouped into the correct date group: LAST_WEEK");
        assert.deepEqual(aGroupedNotificationsWithNew[3].items[1], aNotificationsDateNew[3], "Notifications are grouped into the correct date group: LAST_WEEK");
        assert.deepEqual(aGroupedNotificationsWithNew[4].items[0], aNotificationsDate[4], "Notifications are grouped into the correct date group: THIS_MONTH");
        assert.deepEqual(aGroupedNotificationsWithNew[4].items[1], aNotificationsDateNew[4], "Notifications are grouped into the correct date group: THIS_MONTH");
        assert.deepEqual(aGroupedNotificationsWithNew[5].items[0], aNotificationsDate[5], "Notifications are grouped into the correct date group: LAST_MONTH");
        assert.deepEqual(aGroupedNotificationsWithNew[5].items[1], aNotificationsDateNew[5], "Notifications are grouped into the correct date group: LAST_MONTH");
        assert.deepEqual(aGroupedNotificationsWithNew[6].items[0], aNotificationsDate[6], "Notifications are grouped into the correct date group: THIS_YEAR");
        assert.deepEqual(aGroupedNotificationsWithNew[6].items[1], aNotificationsDateNew[6], "Notifications are grouped into the correct date group: THIS_YEAR");
        assert.deepEqual(aGroupedNotificationsWithNew[7].items[0], aNotificationsDate[7], "Notifications are grouped into the correct date group: OLDER");
        assert.deepEqual(aGroupedNotificationsWithNew[7].items[1], aNotificationsDateNew[7], "Notifications are grouped into the correct date group: OLDER");
    });

    QUnit.test("Notifications are grouped into correct date groups with different years", function (assert) {
        // Arrange
        const aNotificationsDate = [
            { CreatedAt: (new Date("2024-04-17T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2024-04-16T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2024-04-15T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2024-04-09T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2024-04-02T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2024-03-20T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2024-02-20T06:15:00Z")).toISOString() }, // OLDER
            { CreatedAt: (new Date("2023-12-26T06:15:00Z")).toISOString() } // OLDER
        ];

        const oExpectedGroups = {
            TODAY: 0,
            YESTERDAY: 0,
            THIS_WEEK: 0,
            LAST_WEEK: 0,
            THIS_MONTH: 0,
            LAST_MONTH: 0,
            THIS_YEAR: 0,
            OLDER: 8
        };

        // Act
        const aGroupedNotifications = this.oController._groupNotificationsByTimePeriods(undefined, aNotificationsDate);

        // Assert
        const oActualGroups = aGroupedNotifications.reduce((acc, group) => {
            acc[group.key] = group.items.length;
            return acc;
        }, {});

        assert.deepEqual(oActualGroups, oExpectedGroups, "Notifications are grouped into the correct date groups");
        assert.strictEqual(aGroupedNotifications.length, 8, "Notifications are grouped into 8 date groups");
    });

    QUnit.module("The method '_groupNotificationsByPriority'", {
        beforeEach: function () {
            beforeEach.call(this);

            this.oController = new NotificationsListController();
            this.oController.onInit();
        },
        afterEach: function () {
            afterEach.call(this);
        }
    });

    QUnit.test("Notifications are grouped into correct priority groups", function (assert) {
        // Arrange
        const aNotificationsPriority = [
            { Priority: "HIGH" },
            { Priority: "HIGH" },
            { Priority: "MEDIUM" },
            { Priority: "LOW" },
            { Priority: "LOW" }
        ];

        const oExpectedGroups = {
            IMPORTANT: 2,
            OTHERS: 3
        };

        // Act
        const aGroupedNotifications = this.oController._groupNotificationsByPriority(undefined, aNotificationsPriority);

        // Assert
        const oActualGroups = aGroupedNotifications.reduce((acc, group) => {
            acc[group.key] = group.items.length;
            return acc;
        }, {});

        assert.deepEqual(oActualGroups, oExpectedGroups, "Notifications are grouped into the correct priority groups");
        assert.strictEqual(aGroupedNotifications.length, 2, "Notifications are grouped into 2 priority groups");
        assert.deepEqual(aGroupedNotifications[0].items[0], aNotificationsPriority[0], "Notifications are grouped into the correct priority group: HIGH");
        assert.deepEqual(aGroupedNotifications[0].items[1], aNotificationsPriority[1], "Notifications are grouped into the correct priority group: HIGH");
        assert.deepEqual(aGroupedNotifications[1].items[0], aNotificationsPriority[2], "Notifications are grouped into the correct priority group: MEDIUM");
        assert.deepEqual(aGroupedNotifications[1].items[1], aNotificationsPriority[3], "Notifications are grouped into the correct priority group: LOW");
        assert.deepEqual(aGroupedNotifications[1].items[2], aNotificationsPriority[4], "Notifications are grouped into the correct priority group: LOW");

        // Add new notification to the same group
        // Arrange
        const aNotificationsPriorityNew = [
            { Priority: "HIGH" },
            { Priority: "HIGH" },
            { Priority: "MEDIUM" },
            { Priority: "LOW" },
            { Priority: "LOW" }
        ];
        const oExpectedGroupsWithNew = {
            IMPORTANT: 4,
            OTHERS: 6
        };

        // Act
        const aGroupedNotificationsWithNew = this.oController._groupNotificationsByPriority(aGroupedNotifications, aNotificationsPriorityNew);

        // Assert
        const oActualGroupsWithNew = aGroupedNotificationsWithNew.reduce((acc, group) => {
            acc[group.key] = group.items.length;
            return acc;
        }, {});
        assert.deepEqual(oActualGroupsWithNew, oExpectedGroupsWithNew, "Notifications are grouped into the correct priority groups");
        assert.strictEqual(aGroupedNotificationsWithNew.length, 2, "Notifications are grouped into 2 priority groups");
        assert.deepEqual(aGroupedNotificationsWithNew[0].items[0], aNotificationsPriority[0], "Notifications are grouped into the correct priority group: HIGH");
        assert.deepEqual(aGroupedNotificationsWithNew[0].items[1], aNotificationsPriority[1], "Notifications are grouped into the correct priority group: HIGH");
        assert.deepEqual(aGroupedNotificationsWithNew[0].items[2], aNotificationsPriorityNew[0], "Notifications are grouped into the correct priority group: HIGH");
        assert.deepEqual(aGroupedNotificationsWithNew[0].items[3], aNotificationsPriorityNew[1], "Notifications are grouped into the correct priority group: HIGH");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[0], aNotificationsPriority[2], "Notifications are grouped into the correct priority group: MEDIUM");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[1], aNotificationsPriority[3], "Notifications are grouped into the correct priority group: LOW");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[2], aNotificationsPriority[4], "Notifications are grouped into the correct priority group: LOW");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[3], aNotificationsPriorityNew[2], "Notifications are grouped into the correct priority group: LOW");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[4], aNotificationsPriorityNew[3], "Notifications are grouped into the correct priority group: LOW");
        assert.deepEqual(aGroupedNotificationsWithNew[1].items[5], aNotificationsPriorityNew[4], "Notifications are grouped into the correct priority group: LOW");
    });

    QUnit.module("The method '_removeItemFromModel'", {
        beforeEach: function () {
            beforeEach.call(this);

            this.oPopoverSetBusyStub = sandbox.stub();
            this.oPopoverCloseStub = sandbox.stub();
            sandbox.stub(NotificationsListController.prototype, "getOwnerComponent").returns({
                _getPopover: () => {
                    return {
                        close: this.oPopoverCloseStub
                    };
                }
            });

            this.oMoreNotificationsCanBeFetchedStub = sandbox.stub(NotificationsListController.prototype, "_moreNotificationsCanBeFetched");
            this.oMoreNotificationsCanBeFetchedStub.returns(true);

            this.oController = new NotificationsListController();
            this.oController.onInit();

            this.oUpdateListMaxReachedStub = sandbox.stub(this.oController, "_updateListMaxReached");
        },
        afterEach: function () {
            afterEach.call(this);
        }
    });

    QUnit.test("Should remove a notification from the model and update the grouped notifications list", async function (assert) {
        // Arrange
        const oModel = this.oController._getModel();
        oModel.setProperty("/notifications", [
            {
                key: "TODAY",
                items: [
                    { Id: "1", Title: "Notification 1" },
                    { Id: "2", Title: "Notification 2" }
                ]
            }
        ]);
        this.oController._oItemSet = new Set(["1", "2"]);

        // Act
        await this.oController._removeItemFromModel("1", "/notifications/0");

        // Assert
        const aNotificationsInGroup = oModel.getProperty("/notifications/0/items");
        assert.strictEqual(aNotificationsInGroup.length, 1, "Notification was removed from the group");
        assert.strictEqual(aNotificationsInGroup[0].Id, "2", "Remaining notification is correct");
        assert.notOk(this.oController._oItemSet.has("1"), "Notification ID was removed from the set");
        assert.strictEqual(this.oUpdateListMaxReachedStub.callCount, 1, "List max reached was updated");
    });

    QUnit.test("Should not remove a notification from the model because it does not exist", async function (assert) {
        // Arrange
        const oModel = this.oController._getModel();
        oModel.setProperty("/notifications", [
            {
                key: "TODAY",
                items: [
                    { Id: "1", Title: "Notification 1" },
                    { Id: "2", Title: "Notification 2" }
                ]
            }
        ]);
        this.oController._oItemSet = new Set(["1", "2"]);
        // Act
        await this.oController._removeItemFromModel("1", null);

        // Assert
        const aNotificationsInGroup = oModel.getProperty("/notifications/0/items");
        assert.strictEqual(aNotificationsInGroup.length, 2, "Notification was not removed from the group");
        assert.strictEqual(this.oController._oItemSet.size, 2, "Notification ID was not removed from the set");
        assert.strictEqual(this.oUpdateListMaxReachedStub.callCount, 0, "List max reached was not updated");
    });

    QUnit.test("Should remove last notification from the model", async function (assert) {
        // Arrange
        const oModel = this.oController._getModel();
        this.oMoreNotificationsCanBeFetchedStub.returns(false);
        oModel.setProperty("/notifications", [
            {
                key: "TODAY",
                items: [
                    { Id: "1", Title: "Notification 1" }
                ]
            }
        ]);
        this.oController._oItemSet = new Set(["1"]);

        // Act
        await this.oController._removeItemFromModel("1", "/notifications/0");

        // Assert
        const aNotificationsInGroup = oModel.getProperty("/notifications/0/items");
        assert.strictEqual(aNotificationsInGroup.length, 0, "Notification was removed from the group");
        assert.strictEqual(this.oController._oItemSet.size, 0, "Notification ID was removed from the set");
        assert.strictEqual(this.oUpdateListMaxReachedStub.callCount, 1, "List max reached was updated");
        assert.strictEqual(this.oPopoverCloseStub.callCount, 1, "Popover was closed");
    });
});
