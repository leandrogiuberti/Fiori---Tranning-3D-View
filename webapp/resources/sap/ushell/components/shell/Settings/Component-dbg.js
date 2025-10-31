// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/UIComponent",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/components/shell/Settings/userAccount/UserAccountEntry",
    "sap/ushell/components/shell/Settings/appearance/AppearanceEntry",
    "sap/ushell/components/shell/Settings/homepage/HomepageEntry",
    "sap/ushell/components/shell/Settings/spaces/SpacesEntry",
    "sap/ushell/components/shell/Settings/userActivities/UserActivitiesEntry",
    "sap/ushell/components/shell/Settings/notifications/NotificationsEntry",
    "sap/ushell/components/shell/Settings/userDefaults/UserDefaultsEntry",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/utils",
    "sap/ushell/Container",
    "sap/ushell/state/StateManager"
], (
    Element,
    XMLView,
    UIComponent,
    Config,
    EventHub,
    resources,
    UserAccountEntry,
    AppearanceEntry,
    HomepageEntry,
    SpacesEntry,
    UserActivitiesEntry,
    NotificationsEntry,
    UserDefaultsEntry,
    ShellHeadItem,
    ushellUtils,
    Container,
    StateManager
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    const aDoables = [];

    return UIComponent.extend("sap.ushell.components.shell.Settings.Component", {

        metadata: {
            version: "1.141.1",
            library: "sap.ushell",
            dependencies: {
                libs: {
                    "sap.m": {},
                    "sap.ui.layout": {
                        lazy: true
                    }
                }
            }
        },

        /**
         * Initializes the user settings and add standard entity into Config
         *
         * @private
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this._aInitPromises = [];
            const oShellConfig = Container.getRendererInternal("fiori2").getShellConfig();

            if (oShellConfig.moveUserSettingsActionToShellHeader) {
                this._aInitPromises.push(this._addUserSettingsButton().then((oUserSettingsButton) => {
                    this.oSettingsBtn = oUserSettingsButton;
                }));
            }

            this._addStandardEntityToConfig(); // Standard entities
            this._addUserLanguageAndRegionSettings(); // User language and region settings
            if (Config.last("/core/shell/model/enableNotifications")) {
                this._addNotificationSettings(); // Notifications
            }

            aDoables.push(EventHub.on("openUserSettings").do(this._openUserSettings.bind(this)));

            this._pInitPromise = Promise.all(this._aInitPromises);
        },

        _updateUserPreferencesEntries: function (aEntities) {
            if (aEntities) {
                aEntities = Container.getRendererInternal("fiori2").reorderUserPrefEntries(aEntities);
                Config.emit("/core/userPreferences/entries", aEntities);
            }
        },

        /**
         * Add the user language and region settings entry and update the shell config.
         * @private
         */
        _addUserLanguageAndRegionSettings: function () {
            const oUser = Container.getUser();

            oUser.getLanguageAndRegionSettingsEntry().then((oLanguageAndRegionEntry) => {
                const aEntities = Config.last("/core/userPreferences/entries");
                aEntities.push(oLanguageAndRegionEntry.getEntry());
                this._updateUserPreferencesEntries(aEntities);
            });
        },

        /**
         * Get all standard entity of setting dialog and update ushell Config
         * - sets the performance mark for search entry, if active
         * @private
         */
        _addStandardEntityToConfig: function () {
            let aEntities = Config.last("/core/userPreferences/entries");

            aEntities.push(UserAccountEntry.getEntry()); // User account
            aEntities.push(AppearanceEntry.getEntry()); // Appearance

            if (SpacesEntry.isRelevant()) {
                aEntities.push(SpacesEntry.getEntry()); // Spaces
            }

            if (Config.last("/core/shell/enableRecentActivity")) {
                aEntities.push(UserActivitiesEntry.getEntry()); // User Activities
            }

            // Search
            if (Config.last("/core/shell/model/searchAvailable")) {
                Container.getFLPPlatform().then((sPlatform) => {
                    if (sPlatform !== "MYHOME") {
                        sap.ui.require(["sap/ushell/components/shell/Settings/search/SearchEntry"], (SearchEntry) => {
                            SearchEntry.getEntry().then((searchEntry) => {
                                searchEntry.isActive().then((isActive) => {
                                    if (!isActive) {
                                        return;
                                    }
                                    ushellUtils.setPerformanceMark("FLP -- search setting entry is set active");
                                    aEntities = Config.last("/core/userPreferences/entries");
                                    aEntities.push(searchEntry);
                                    this._updateUserPreferencesEntries(aEntities);
                                });
                            });
                        });
                    }
                });
            }

            if (Config.last("/core/home/enableHomePageSettings") && !Config.last("/core/spaces/enabled")) {
                aEntities.push(HomepageEntry.getEntry()); // Home Page
            }

            if (Config.last("/core/shell/model/userDefaultParameters")) {
                aEntities.push(UserDefaultsEntry.getEntry()); // User Defaults
            }

            aEntities = Container.getRendererInternal("fiori2").reorderUserPrefEntries(aEntities);
            this._updateUserPreferencesEntries(aEntities);
        },

        /**
         * Add the notifications settings entry and update the shell config.
         * For this, the Notifications service has to be loaded and its settings have to be retrieved.
         *
         * @private
         */
        _addNotificationSettings: function () {
            Container.getServiceAsync("NotificationsV2").then((service) => {
                service._userSettingInitialization();
                service._getNotificationSettingsAvailability().then((status) => {
                    if (status.settingsAvailable) {
                        const aEntities = Config.last("/core/userPreferences/entries");
                        aEntities.push(NotificationsEntry.getEntry());
                        this._updateUserPreferencesEntries(aEntities);
                    }
                });
            }).catch(() => {}); // Notification settings are not available, do nothing.
        },

        /**
         * Create and open settings dialog
         * @param {object} oEvent Event contain id and time.
         * @returns {Promise<undefined>} A promise resolving when the settings dialog was opened.
         * @private
         */
        _openUserSettings: function (oEvent) {
            if (!this.oDialogPromise) {
                this.oDialogPromise = XMLView.create({
                    id: "settingsView",
                    viewName: "sap.ushell.components.shell.Settings.UserSettings"
                }).then((oSettingsView) => {
                    this.oSettingsView = oSettingsView;
                    const sControlId = oEvent.controlId || "shell-header";
                    Element.getElementById(sControlId).addDependent(oSettingsView);
                    return oSettingsView;
                });
            }

            return this.oDialogPromise.then((oSettingsView) => {
                oSettingsView.getController().open(oEvent?.targetEntryId);
            });
        },

        /**
         * Create and add the settings button to the header
         *
         * @returns {sap.ushell.ui.shell.ShellHeadItem} settings button
         */
        _addUserSettingsButton: async function () {
            let oUserSettingsButton;
            if (Config.last("/core/shellBar/enabled")) {
                const [ShellBarItem] = await ushellUtils.requireAsync(["sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem"]);
                oUserSettingsButton = new ShellBarItem({
                    id: "userSettingsBtn",
                    icon: "sap-icon://action-settings",
                    text: resources.i18n.getText("userSettings"),
                    accessibilityAttributes: {
                        hasPopup: "dialog"
                    },
                    click: this._openUserSettings.bind(this)
                });
            } else {
                oUserSettingsButton = new ShellHeadItem({
                    id: "userSettingsBtn",
                    icon: "sap-icon://action-settings",
                    text: resources.i18n.getText("userSettings"),
                    ariaHaspopup: "dialog",
                    press: this._openUserSettings.bind(this)
                });
            }

            // Add to userActions. The actual move happens within the state management
            StateManager.updateAllBaseStates("userActions.items", Operation.Add, oUserSettingsButton.getId());

            return oUserSettingsButton;
        },

        /**
         * Turns the eventlistener in this component off.
         *
         * @private
         */
        exit: function () {
            for (let i = 0; i < aDoables.length; i++) {
                aDoables[i].off();
            }
            if (this.oSettingsView) {
                this.oSettingsView.destroy();
                this.oSettingsView = null;
                this.oDialogPromise = null;
            }
            if (this.oSettingsBtn) {
                this.oSettingsBtn.destroy();
                this.oSettingsBtn = null;
            }
        }
    });
});
