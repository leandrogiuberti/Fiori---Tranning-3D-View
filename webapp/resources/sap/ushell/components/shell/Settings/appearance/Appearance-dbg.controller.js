// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/base/Object",
    "sap/ui/core/Component",
    "sap/ui/core/Theming",
    "sap/ui/core/EventBus",
    "sap/ui/core/message/Message",
    "sap/ui/core/message/MessageType",
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/m/GroupHeaderListItem",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/User",
    "sap/ushell/services/DarkModeSupport",
    "sap/ushell/Container",
    "sap/ushell/utils/LaunchpadError"
], (
    Log,
    BaseObject,
    Component,
    Theming,
    EventBus,
    Message,
    MessageType,
    Controller,
    Device,
    JSONModel,
    jQuery,
    GroupHeaderListItem,
    Config,
    EventHub,
    ushellResources,
    User,
    DarkModeSupport,
    Container,
    LaunchpadError
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.appearance.Appearance", {
        TILE_SIZE: {
            Small: 0,
            Responsive: 1,

            getName: function (iValue) {
                return Object.keys(this)[iValue];
            }
        },

        onInit: function () {
            const oView = this.getView();
            this.oUser = Container.getUser();
            const oViewData = oView.getViewData(); // ViewData is set in AppearanceEntry.js
            this.aThemeListFromServer = oViewData.themeList || [];
            this.aThemeSets = oViewData.themeSets || [];
            this.sThemeRoot = oViewData.themeRoot; // for avatar urls

            this.oPersonalizers = {};

            // set models
            oView.setModel(ushellResources.i18nModel, "i18n");
            oView.setModel(this.getConfigurationModel(), "config");

            this._oDarkModeModel = this.getDarkModeModel(this.aThemeListFromServer);
            oView.setModel(this._oDarkModeModel, "darkMode");

            // Model for the tab with theme list
            oView.setModel(new JSONModel({
                options: this._getThemeListData(this.oUser.getTheme()),
                ariaTexts: { headerLabel: ushellResources.i18n.getText("Appearance") },
                deprecatedThemeSelected: this.bShowDeprecationMsg
            }));

            // listener
            this._fnHandleThemeApplied = this._handleThemeApplied.bind(this);
            Theming.attachApplied(this._fnHandleThemeApplied);
        },

        onExit: function () {
            Theming.detachApplied(this._fnHandleThemeApplied);
        },

        onAvatarError: function (oError) {
            // if the avatar image has errors like 404, delete the avatar and replace it with an icon
            oError.oSource.getBindingContext()?.setProperty("avatar", "");
        },

        // Group header text for a set is a set label. Other themes not in a set are grouped under Individual Themes
        getThemeSetHeader: function (oGroup) {
            const oSet = this.aThemeSets.find((set) => oGroup.key === set.id);
            const sGroupTitle = oSet?.label || ushellResources.i18n.getText("AppearanceIndividualThemes");
            return new GroupHeaderListItem({ title: sGroupTitle });
        },

        // Return the theme set of the currently selected theme in the list.
        _getSelectedThemeData: function () {
            const oSelectedItem = this.getView().byId("themeList").getSelectedItem();
            return oSelectedItem?.getBindingContext()?.getProperty?.();
        },

        // Return the ID of the currently selected theme in the theme list.
        // If no selection, return the current user theme.
        _getSelectedTheme: function () {
            return this._getSelectedThemeData()?.id || this.oUser.getTheme();
        },

        // The main function. Builds the list of themes. Items are grouped by setId.
        _getThemeListData: function (sCurrentThemeId) {
            const aThemes = this.aThemeListFromServer || [];
            const aSets = this.aThemeSets || [];
            const aListData = [];
            const sThemeRoot = this.sThemeRoot;

            // Find all theme sets that include the theme with the given id
            function _getThemeSets (sId) {
                return aSets.filter((set) => !!set.set.themes?.find?.((theme) => theme?.id === sId));
            }

            function _getAvatarUrl (oTheme) {
                if (sThemeRoot && oTheme?.avatarRuntimeUrl) {
                    return sThemeRoot + oTheme.avatarRuntimeUrl;
                }
                return undefined;
            }

            this.bShowDeprecationMsg = false;

            // If the user is not allowed to change themes, return only the current theme
            if (!this._isThemeCofigurable() || this.oUser.isSetThemePermitted() === false) {
                const oCurrentTheme = aThemes.find((theme) => theme?.id === sCurrentThemeId);
                return [{
                    id: sCurrentThemeId,
                    name: oCurrentTheme?.name || sCurrentThemeId,
                    icon: "sap-icon://palette",
                    avatar: _getAvatarUrl(oCurrentTheme),
                    mode: "InlineSvg", // can be a combined svg
                    deprecated: false,
                    isSelected: true
                }];
            }

            // add themes from the server list
            aThemes.forEach((theme) => {
                const aThemeSets = _getThemeSets(theme?.id);
                if (aThemeSets.length === 0) {
                    aThemeSets.push({}); // a theme that doesn't belong to a set has to be added without a set id
                }
                aThemeSets.forEach((set) => {
                    const oThemeInSet = set?.set?.themes?.find?.((themeInSet) => themeInSet.id === theme?.id);
                    const oItemData = {
                        id: theme?.id,
                        name: theme?.name || theme?.id || "",
                        contrast: oThemeInSet?.contrast, // for sorting, low contrast first
                        colorScheme: oThemeInSet?.colorScheme, // for sorting, light before dark
                        icon: "sap-icon://palette",
                        avatar: _getAvatarUrl(theme),
                        mode: "Image", // specific theme svg can be displayed with an img tag
                        deprecated: theme?.deprecated === true,
                        setId: set.id,
                        isSelected: false
                    };
                    aListData.push(oItemData);
                });
            });

            // add sets from the theme list for automatic selection ("set autmatically" items)
            if (this._areSetsVisible()) {
                const sCommonText = ushellResources.i18n.getText("AppearanceAutomaticSelection");
                aSets.forEach((set) => {
                    const oItemData = {
                        id: set.id,
                        name: sCommonText,
                        icon: "sap-icon://sys-monitor",
                        avatar: _getAvatarUrl(set),
                        mode: "InlineSvg", // combined svg files can be only shown with inline decomposition
                        deprecated: set.deprecated === true,
                        setId: set.id,
                        isSelected: false
                    };
                    aListData.push(oItemData);
                });
            }

            // set selection: either the "set automatically" or individual theme
            // note that the same theme may be listed several times in different sets and
            // we need to find the correct occurence of the theme
            const sCurrentUserSet = this.oUser.getThemeSet(); // the last selected theme set as in the user profile
            let oSelectedItem;
            if (sCurrentUserSet) {
                oSelectedItem = aListData.find((theme) => theme.id === sCurrentThemeId && theme.setId === sCurrentUserSet);
            }
            if (!oSelectedItem) { // the set is unknowwn or the theme is not in the set; select the first occurence:
                oSelectedItem = aListData.find((theme) => theme.id === sCurrentThemeId);
            }

            // with the dark mode active, select the "automatic" entry instead of the individual theme
            if (this._isDarkModeActive() && oSelectedItem?.setId) {
                const oSet = aListData.find((item) => item.id === oSelectedItem.setId);
                if (oSet) {
                    oSelectedItem = oSet;
                }
            }
            if (oSelectedItem) {
                oSelectedItem.isSelected = true;
                this.bShowDeprecationMsg = oSelectedItem.deprecated;
            }

            return aListData;
        },

        _isThemeCofigurable: function () {
            return Config.last("/core/shell/model/setTheme") !== false;
        },

        getConfigurationModel: function () {
            // Content density is always cozy on phones and tablets (FLPCOREANDUX-9769)
            const bContentDensityConfigurable = Config.last("/core/shell/model/contentDensity") && (Device.system.desktop || Device.system.combi);
            const bSizeBehaviorConfigurable = Config.last("/core/home/sizeBehaviorConfigurable");
            const bShowContentProviderInfoConfigurable = Config.last("/core/contentProviders/providerInfo/enabled") &&
                Config.last("/core/contentProviders/providerInfo/userConfigurable");
            const bShowContentProviderInfoOnVisualizations = Config.last("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations");
            // don't show an empty tab
            const bDisplaySettingsTabVisible = bSizeBehaviorConfigurable || bContentDensityConfigurable || bShowContentProviderInfoConfigurable;

            const oConfigModel = new JSONModel({
                themeConfigurable: this._isThemeCofigurable(),
                sizeBehaviorConfigurable: bSizeBehaviorConfigurable,
                tileSize: this.TILE_SIZE[Config.last("/core/home/sizeBehavior")],
                contentDensityConfigurable: bContentDensityConfigurable,
                isCozyContentMode: document.body.classList.contains("sapUiSizeCozy"),
                textAlign: Device.system.phone ? "Left" : "Right",
                showContentProviderInfoOnVisualizationsConfigurable: bShowContentProviderInfoConfigurable,
                showContentProviderInfoOnVisualizationsSelected: bShowContentProviderInfoOnVisualizations,
                displaySettingsTabVisible: bDisplaySettingsTabVisible
            });

            return oConfigModel;
        },

        getDarkModeModel: function () {
            const oUrlSearch = new URLSearchParams(window.location.search);
            const bDetectionSupported = !oUrlSearch.get("sap-theme") && !oUrlSearch.get("sap-ui-theme");
            const bThemeConfigurable = this._isThemeCofigurable();

            const oDarkModeModel = new JSONModel({
                enabled: bThemeConfigurable,
                detectionSupported: bThemeConfigurable && bDetectionSupported,
                detectionEnabled: bThemeConfigurable && bDetectionSupported && this.oUser.getDetectDarkMode()
            });

            return oDarkModeModel;
        },

        onAfterRendering: function () {
            const isListSelected = this.getView().getModel("config").getProperty("/themeConfigurable");
            const oList = this.getView().byId("themeList");
            oList.toggleStyleClass("sapUshellThemeListDisabled", !isListSelected);
        },

        _handleThemeApplied: function () {
            const oConfigModel = this.getView().getModel("config");
            if (oConfigModel) {
                // readjusts the theme list after the dark mode change
                const aThemeListData = this._getThemeListData(this.oUser.getTheme());
                const oViewModel = this.getView().getModel();
                oViewModel.setProperty("/options", aThemeListData);
                oViewModel.setProperty("/deprecatedThemeSelected", this.bShowDeprecationMsg);
            }
        },

        onCancel: function () {
            const oConfigModel = this.getView().getModel("config");

            if (oConfigModel.getProperty("/themeConfigurable")) {
                const sUserTheme = this.oUser.getTheme();
                const aThemeOptions = this.getView().getModel().getProperty("/options");
                aThemeOptions.forEach((oThemeOption) => {
                    oThemeOption.isSelected = sUserTheme === oThemeOption.id;
                });
                this.getView().getModel().setProperty("/options", aThemeOptions);
            }
            if (oConfigModel.getProperty("/showContentProviderInfoOnVisualizationsConfigurable")) {
                oConfigModel.setProperty("/showContentProviderInfoOnVisualizationsSelected",
                    Config.last("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations"));
            }
            if (oConfigModel.getProperty("/contentDensityConfigurable")) {
                oConfigModel.setProperty("/isCozyContentMode", this.oUser.getContentDensity() === "cozy");
            }
            if (oConfigModel.getProperty("/sizeBehaviorConfigurable")) {
                oConfigModel.setProperty("/tileSize", this.TILE_SIZE[Config.last("/core/home/sizeBehavior")]);
            }
            if (this._oDarkModeModel && this._oDarkModeModel.getProperty("/enabled")) {
                this._oDarkModeModel.setProperty("/detectionEnabled", this.oUser.getDetectDarkMode());
                this.oUser.resetChangedProperty("detectDarkMode");
            }
        },

        /**
         * Save method for all properties of the "Appearance" tab.
         * Includes:
         *   - Preparing each property
         *   - Saving with the given function
         *   - Post processing of save with error handling
         *
         * @param {function} fnUpdateUserPreferences Function that updates the properties.
         * @returns {Promise<undefined|string[]>} Resolves without a value if no error occurs, otherwise rejects with error messages.
         */
        onSave: function (fnUpdateUserPreferences) {
            this._updateUserPreferences = fnUpdateUserPreferences;
            const oConfigModel = this.getView().getModel("config");
            const aSavePromises = [];

            // onSaveThemes may switch dark mode on and off, therefore, the order of calls is important here
            if (oConfigModel.getProperty("/themeConfigurable")) {
                aSavePromises.push(this.onSaveThemes().then(() => {
                    EventHub.emit("themeChanged", Date.now());
                }));
            }
            if (oConfigModel.getProperty("/showContentProviderInfoOnVisualizationsConfigurable")) {
                aSavePromises.push(this.onSaveShowContentProviderInfoOnVisualizations());
            }
            if (oConfigModel.getProperty("/contentDensityConfigurable")) {
                aSavePromises.push(this.onSaveContentDensity());
            }
            if (oConfigModel.getProperty("/sizeBehaviorConfigurable")) {
                aSavePromises.push(this.onSaveTileSize());
            }
            if (this._oDarkModeModel && this._oDarkModeModel.getProperty("/enabled")) {
                aSavePromises.push(this.onSaveDarkModeEnabled());
            }

            return Promise.all(aSavePromises)
                .then((aResults) => {
                    const aMessages = aResults.reduce((aMessages, vResult) => {
                        if (vResult && BaseObject.isObjectA(vResult, "sap.ui.core.message.Message")) {
                            aMessages.push(vResult);
                        }
                        return aMessages;
                    }, []);

                    if (aMessages.length > 0) {
                        return Promise.reject(aMessages);
                    }
                });
        },

        onSaveThemesSuccess: function (oUser) {
            oUser.resetChangedProperty("theme");
            oUser.resetChangedProperty("themeSet");

            return this._applyDarkMode(); // make sure that the dark mode is applied after the theme change
        },

        // If the user selects automatic entry in a set, set a theme from the set and enable dark mode automation.
        // Otherwise (if a specific theme is selected), save this specific theme and disable automation.
        onSaveThemes: function () {
            const oTheme = this._getSelectedThemeData();
            let sNewThemeId = oTheme?.id;
            const sNewSetId = oTheme?.setId;
            const oUser = this.oUser;
            const sOriginalThemeId = oUser.getTheme(User.prototype.constants.themeFormat.ORIGINAL_THEME);
            const sOriginalSetId = oUser.getThemeSet();

            // If the set entry is selected, instead of an individual theme
            const oSet = (this.aThemeSets || []).find((set) => set.id === sNewThemeId);
            if (oSet) {
                // don't use Container.getServiceAsync("DarkModeSupport") here because
                // the related specific logic in updateUserPreferences is broken with the additional promise
                const sColorScheme = DarkModeSupport.prototype.prefersDark() ? "DARK" : "LIGHT";
                const sContrast = DarkModeSupport.prototype.prefersContrast() ? "HIGH" : "LOW";
                // find the theme that corresponds to the browser preference
                // fallback: if not found, select the first theme from the set
                const oNewTheme = oSet.set.themes.find(
                    (theme) => theme.colorScheme === sColorScheme && theme.contrast === sContrast
                );
                sNewThemeId = oNewTheme?.id || oSet.set.themes[0].id;
            }
            // if a set is selected, the user has enabled detection, else disabled it
            this._oDarkModeModel.setProperty("/detectionEnabled", !!oSet);

            let bSaveSettings = false;
            if (sNewThemeId && sNewThemeId !== sOriginalThemeId) {
                Container.getServiceAsync("UserInfo").then((UserInfo) => {
                    UserInfo.updateThemeRoot(sNewThemeId);
                });
                oUser.setTheme(sNewThemeId);
                bSaveSettings = true;
            }
            if (sNewSetId !== sOriginalSetId) {
                oUser.setThemeSet(sNewSetId);
                bSaveSettings = true;
            }

            if (bSaveSettings) {
                return this._updateUserPreferences(oUser)
                    .then(() => {
                        return this.onSaveThemesSuccess(oUser);
                    })
                    .catch((oError) => {
                        if (!oError.message.includes("THEME")) {
                            return this.onSaveThemesSuccess(oUser);
                        }
                        oUser.setTheme(sOriginalThemeId);
                        oUser.resetChangedProperty("theme");
                        oUser.setThemeSet(sOriginalSetId);
                        oUser.resetChangedProperty("themeSet");
                        Log.error("Can not save selected theme", oError);
                        throw new Message({
                            type: MessageType.Error,
                            description: oError.message
                        });
                    });
            }
            return Promise.resolve();
        },

        _onSaveContentDensitySuccess: function (sNewContentDensity) {
            const oUser = this.oUser;
            oUser.resetChangedProperty("contentDensity");
            EventBus.getInstance().publish("launchpad", "toggleContentDensity", {
                contentDensity: sNewContentDensity
            });
            EventHub.emit("toggleContentDensity", {
                contentDensity: sNewContentDensity
            });
            return new Promise((resolve) => {
                // resolve the promise _after_ the event has been processed;
                // we need to do this in an event handler, as the EventHub is asynchronous.
                EventHub.once("toggleContentDensity").do(() => {
                    resolve();
                });
            });
        },

        onSaveContentDensity: function () {
            const oConfigModel = this.getView().getModel("config");
            const oUser = this.oUser;
            const sNewContentDensity = oConfigModel.getProperty("/isCozyContentMode") ? "cozy" : "compact";
            const sUserContentDensity = oUser.getContentDensity();
            Log.debug("[000] onSaveContentDensity", "Appearance.controller");
            if (sNewContentDensity !== sUserContentDensity && oConfigModel.getProperty("/contentDensityConfigurable")) {
                oUser.setContentDensity(sNewContentDensity);
                Log.debug("[000] onSaveContentDensity: sNewContentDensity", sNewContentDensity, "Appearance.controller");
                return this._updateUserPreferences(oUser)
                    .then(() => {
                        return this._onSaveContentDensitySuccess(sNewContentDensity);
                    })
                    .catch((oError) => {
                        if (!oError.message.includes("CONTENT_DENSITY")) {
                            return this._onSaveContentDensitySuccess();
                        }
                        oUser.setContentDensity(sUserContentDensity);
                        oUser.resetChangedProperty("contentDensity");
                        Log.error("Can not save content density configuration", oError);
                        throw new Message({
                            type: MessageType.Error,
                            message: oError.message
                        });
                    });
            }
            return Promise.resolve();
        },

        onSaveTileSize: function () {
            const oConfigModel = this.getView().getModel("config");
            const sNewSizeBehavior = this.TILE_SIZE.getName(oConfigModel.getProperty("/tileSize")); // take string value, not index
            const sCurrentSizeBehavior = Config.last("/core/home/sizeBehavior");
            if (sNewSizeBehavior && sNewSizeBehavior !== sCurrentSizeBehavior && oConfigModel.getProperty("/sizeBehaviorConfigurable")) {
                return new Promise((resolve, reject) => {
                    this.writeToPersonalization("flp.settings.FlpSettings", "sizeBehavior", sNewSizeBehavior)
                        .then(() => {
                            Config.emit("/core/home/sizeBehavior", sNewSizeBehavior);
                            // todo move to other place?
                            const aTiles = document.getElementsByClassName(".sapUshellTile");
                            for (let i = 0; i < aTiles.length; i++) {
                                aTiles[i].classList.toggle("sapUshellSmall", sNewSizeBehavior !== "Responsive");
                            }
                            resolve();
                        })
                        .catch((oError) => {
                            Log.error("Cannot save tile size configuration", oError);

                            let oMessage;
                            if (oError instanceof LaunchpadError) {
                                oMessage = new Message({
                                    type: MessageType.Error,
                                    description: oError.message,
                                    message: oError.details?.message.value,
                                    date: oError.details?.innererror.timestamp,
                                    httpStatus: oError.details?.httpStatus
                                });
                            } else {
                                oMessage = new Message({
                                    type: MessageType.Error,
                                    description: oError.message,
                                    message: oError.message
                                });
                            }

                            reject(oMessage);
                        });
                });
            }
            return Promise.resolve();
        },

        onSaveDarkModeEnabledSuccess: async function (oUser, sNewDarkModeEnabled) {
            oUser.resetChangedProperty("detectDarkMode");
            const oDarkModeSupport = await Container.getServiceAsync("DarkModeSupport");
            oDarkModeSupport.toggleDetection(!!sNewDarkModeEnabled);
        },

        // Save the value of the Enable Auto Dark Mode Detection switch
        onSaveDarkModeEnabled: function () {
            const sNewDarkModeEnabled = this._oDarkModeModel.getProperty("/detectionEnabled");
            const sOldDarkModeEnabled = this.oUser.getDetectDarkMode();
            const oUser = this.oUser;

            if (sNewDarkModeEnabled !== sOldDarkModeEnabled) {
                Log.debug("[000] onSaveDarkModeEnabled: setDetectDarkModeEnabled", sNewDarkModeEnabled, "Appearance.controller");
                oUser.setDetectDarkMode(sNewDarkModeEnabled);
                return this._updateUserPreferences(this.oUser)
                    .then(() => {
                        return this.onSaveDarkModeEnabledSuccess(oUser, sNewDarkModeEnabled);
                    })
                    .catch((oError) => {
                        if (!oError.message.includes("THEME_DARKMODE_AUTO_DETECTION")) {
                            return this.onSaveDarkModeEnabledSuccess(oUser, sNewDarkModeEnabled);
                        }
                        oUser.setDetectDarkMode(sOldDarkModeEnabled);
                        oUser.resetChangedProperty("detectDarkMode");
                        Log.error("Can not save dark mode configuration", oError);
                        throw new Message({
                            message: oError.message
                        });
                    });
            }
            return Promise.resolve();
        },

        onSaveShowContentProviderInfoOnVisualizations: function () {
            const bOldValue = Config.last("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations");
            const bCurrentValue = this.getView().getModel("config").getProperty("/showContentProviderInfoOnVisualizationsSelected");
            if (bCurrentValue === bOldValue) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                this.writeToPersonalization("flp.settings.FlpSettings", "showContentProviderInfoOnVisualizations", bCurrentValue)
                    .then(() => {
                        Config.emit("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations", bCurrentValue);
                        resolve();
                    })
                    .catch((oError) => {
                        Log.error("Cannot save system info on tiles configuration", oError);

                        let oMessage;
                        if (oError instanceof LaunchpadError) {
                            oMessage = new Message({
                                type: MessageType.Error,
                                description: oError.message,
                                message: oError.details?.message.value,
                                date: oError.details?.innererror.timestamp,
                                httpStatus: oError.details?.httpStatus
                            });
                        } else {
                            oMessage = new Message({
                                type: MessageType.Error,
                                description: oError.message,
                                message: oError.message
                            });
                        }

                        reject(oMessage);
                    });
            });
        },

        /**
         * Calls the Personalization service to write the given value to the backend
         * at the given place identified by the container and item name.
         *
         * @param {string} sContainer The name of the container.
         * @param {string} sItem The name of the item.
         * @param {any} vValue The value to be posted to the personalization service.
         * @returns {Promise} Resolves once the personalization data is written. Rejected if the service fails in doing so.
         */
        writeToPersonalization: function (sContainer, sItem, vValue) {
            return this.getPersonalizer(sContainer, sItem)
                .then((oPersonalizer) => {
                    return oPersonalizer.setPersData(vValue);
                })
                .catch((oError) => {
                    Log.error("Personalization service does not work:", oError);
                    throw oError;
                });
        },

        /**
         * Retrieves a Personalizer instance from the Personalization service and stores it in an internal map.
         *
         * @param {string} sContainer The container ID.
         * @param {string} sItem The item ID.
         * @returns {Promise<object>} Resolves with a new or cached Personalizer instance.
         */
        getPersonalizer: async function (sContainer, sItem) {
            const sKey = `${sContainer}-${sItem}`;

            if (!this.oPersonalizers[sKey]) {
                this.oPersonalizers[sKey] = Container.getServiceAsync("PersonalizationV2")
                    .then((oPersonalizationService) => {
                        const oComponent = Component.getOwnerComponentFor(this.getView());
                        const oScope = {
                            keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                            writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                            clientStorageAllowed: true
                        };

                        return oPersonalizationService.getPersonalizer({
                            container: sContainer,
                            item: sItem
                        }, oScope, oComponent);
                    });
            }

            return this.oPersonalizers[sKey];
        },

        // applies dark mode after the user has selected a new theme
        _applyDarkMode: async function () {
            if (this._areSetsVisible()) { // only if sets are available and enabled
                const oDarkModeSupport = await Container.getServiceAsync("DarkModeSupport");
                oDarkModeSupport.toggleDetection(this._isDarkModeActive());
            }
        },

        _isDarkModeActive: function () {
            const oModelData = this._oDarkModeModel.getProperty("/");
            return oModelData.enabled && oModelData.detectionSupported && oModelData.detectionEnabled;
        },

        _areSetsVisible: function () {
            const oModelData = this._oDarkModeModel.getProperty("/");
            return oModelData.enabled && oModelData.detectionSupported;
        },

        changeSystemModeDetection: function () {
            // update the theme list after the dark mode detection is changed by the user
            const oViewModel = this.getView().getModel();
            oViewModel.setProperty("/options", this._getThemeListData(this._getSelectedTheme()));
            oViewModel.setProperty("/deprecatedThemeSelected", this.bShowDeprecationMsg);
            this.getView().invalidate();
        }
    });
});
