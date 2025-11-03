// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/components/shell/Settings/ErrorMessageHelper",
    "sap/ui/core/message/Message",
    "sap/ui/core/message/MessageType",
    "sap/ui/base/Object",
    "sap/base/util/deepClone",
    "sap/ushell/Container"
], (
    Log,
    Element,
    Controller,
    Fragment,
    JSONModel,
    Device,
    Config,
    EventHub,
    resources,
    windowUtils,
    ErrorMessageHelper,
    Message,
    MessageType,
    BaseObject,
    deepClone,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.UserSettings", {
        /**
         * Initializes the user settings dialog.
         *
         * @private
         */
        onInit: function () {
            const oSettingView = this.getView();
            const oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            oSettingView.setModel(oDeviceModel, "device");

            // Contains the id of the last selected entry.
            // If it was a grouped entry, it contains all the ids of the entry inside of the group.
            this._aPreviouslySelectedItems = [];

            oSettingView.byId("userSettingEntryList").addEventDelegate({
                onAfterRendering: this._listAfterRendering.bind(this)
            });

            // stores all promises, containing just the content of an entry
            this._mLoadedEntryContent = new Map();

            // stores all promises, containing just the wrapper of an entry
            // or a wrapper for the combination of grouped entries
            this._mLoadedWrappers = new Map();

            oSettingView.setModel(new JSONModel({}));
            oSettingView.setModel(resources.i18nModel, "i18n");

            // Model which stores valueResult and contentResult
            // this helps to avoid infinite processing of entries due to async updates
            oSettingView.setModel(new JSONModel({ entries: {} }), "results");

            Device.orientation.attachHandler(this._fnOrientationChange, this);

            this._oSelectedItemOnMobile = null; // used to enable selection on mobile
            this._oConfigDoable = Config
                .on("/core/userPreferences/entries")
                .do(this._processNewEntries.bind(this));
        },

        _fnOrientationChange: function () {
            const oSplitApp = this.getView().byId("settingsApp");
            this._updateHeaderButtonVisibility(oSplitApp.isMasterShown());
        },

        /**
         * Formatter for the description of the StandardList Item
         * @param {string} sEntryId The id of the entry
         * @param {object[]} aEntryTabs The calculated tabs for the entry
         * @param {object} oEntryResults The current results of all entries
         * @returns {string} The formatted description
         *
         * @private
         * @since 1.111
         */
        _formatDescription: function (sEntryId, aEntryTabs, oEntryResults) {
            if (aEntryTabs.length > 1) {
                return "";
            }

            return oEntryResults[sEntryId].valueResult || "";
        },

        /**
         * Initializes the results model, fetches the value results,
         * calculates the grouping and stores the selected item
         * @param {object[]} aEntries The settings entries
         *
         * @private
         * @since 1.111
         */
        _processNewEntries: function (aEntries) {
            const oView = this.getView();
            const oResultsModel = oView.getModel("results");
            aEntries.forEach((oEntry) => {
                const oResult = oResultsModel.getProperty(`/entries/${oEntry.id}`);
                if (!oResult) {
                    oResultsModel.setProperty(`/entries/${oEntry.id}`, {
                        valueResult: null,
                        contentResult: null
                    });
                }

                this._setEntryValueResult(oEntry.id);
            });

            const oModel = oView.getModel();
            const oMasterEntryList = oView.byId("userSettingEntryList");
            let oSelectedItem = oMasterEntryList.getSelectedItem();

            if (!Device.system.phone && !oSelectedItem) {
                oSelectedItem = oMasterEntryList.getItems()[0];
            }

            if (oSelectedItem) {
                const oEntry = oSelectedItem.getBindingContext().getObject();
                this._aPreviouslySelectedItems = oEntry.tabs.map((oTabEntry) => {
                    return oTabEntry.id;
                });
            }

            oModel.setProperty("/entries", this._calculateEntryGroups(aEntries));
            oView.byId("userSettingEntryList").invalidate();
        },

        /**
         * Restructures the entries and groups them in to entry groups,
         * if the same groupingId property exists on several entries.
         *
         * @param {object[]} aEntries The entries from the ushell configuration.
         * @returns {object[]} The given entries grouped together by groupingId.
         * @private
         */
        _calculateEntryGroups: function (aEntries) {
            const aNewEntries = [];
            const mGroups = new Map();
            const oResultsModel = this.getView().getModel("results");

            aEntries.forEach((oEntry) => {
                // Ignore invisible entries
                if (oEntry.visible === false) {
                    // Cleanup in case entry was rendered before
                    const sDetailPageId = oResultsModel.getProperty(`/entries/${oEntry.id}/contentResult`);
                    if (sDetailPageId) {
                        this.getView().byId("settingsApp").removeDetailPage(sDetailPageId);
                        oResultsModel.setProperty(`/entries/${oEntry.id}/contentResult`, null);
                    }

                    // prevent save / cancel being called on an invisible entry
                    const oUserSettingsEntriesToSave = EventHub.last("UserSettingsOpened") || {};
                    delete oUserSettingsEntriesToSave[oEntry.id];
                    EventHub.emit("UserSettingsOpened", oUserSettingsEntriesToSave);

                    return;
                }

                if (oEntry.groupingEnablement) {
                    // always reset contentResult because the grouping might have changed
                    oResultsModel.setProperty(`/entries/${oEntry.id}/contentResult`, null);

                    const iGroupIndex = mGroups.get(oEntry.groupingId);
                    if (iGroupIndex || iGroupIndex === 0) {
                        aNewEntries[iGroupIndex].tabs.push(oEntry);
                        return;
                    }
                    mGroups.set(oEntry.groupingId, aNewEntries.length);
                }
                oEntry.tabs = [oEntry];
                aNewEntries.push(oEntry);
            });

            return aNewEntries;
        },

        /**
         * Handle focus after closing the dialog.
         * If the dialog was opened
         *  - from UserActionsMenu, should set focus to me area button, because me area popover is closed
         *  - from header button, the focus will automatically be set on the header button
         *
         * @private
         */
        _afterClose: function () {
            if (window.document.activeElement && window.document.activeElement.tagName === "BODY") {
                window.document.getElementById("userActionsMenuHeaderButton").focus();
            }
        },

        /**
         * Sets the target entry id and opens the user settings dialog.
         *
         * @param {string} sTargetEntryId The id of the target entry.
         */
        open: function (sTargetEntryId) {
            const oUserSettingsDialog = this.byId("userSettingsDialog");
            if (sTargetEntryId) {
                this.sTargetEntryId = sTargetEntryId;
            }

            oUserSettingsDialog.open();
        },

        /**
         * Handles after rendering code of the list.
         *
         * @private
         */
        _listAfterRendering: function () {
            const oView = this.getView();
            const oMasterEntryList = oView.byId("userSettingEntryList");
            const aItems = oMasterEntryList.getItems();
            let oTargetItem;
            let sSelectedTabId;

            // Update descriptions eg: when theme updates
            aItems.forEach((oItem) => {
                const oEntry = oItem.getBindingContext().getObject();
                this._setEntryValueResult(oEntry.id);
                sSelectedTabId = oEntry?.tabs?.find((oTabEntry) => oTabEntry.id === this.sTargetEntryId)?.id;
                if (oEntry.id === this.sTargetEntryId || sSelectedTabId) {
                    oTargetItem = oItem;
                    this.sTargetEntryId = null;
                }
            });

            if (!Device.system.phone) {
                // If an entry was selected before the list was rerendered,
                // this code will try to find either the main entry or any of its tabs,
                // so that the user stays on the same entry, even if a tab was removed.
                if (!oTargetItem && this._aPreviouslySelectedItems) {
                    for (let i = 0; i < this._aPreviouslySelectedItems.length; i++) {
                        for (let j = 0; j < aItems.length; j++) {
                            const oItem = aItems[j];
                            if (oItem.getBindingContext().getObject().id === this._aPreviouslySelectedItems[i]) {
                                oMasterEntryList.setSelectedItem(oItem);
                                this._toDetail(oItem, sSelectedTabId);
                                oItem.focus();
                                return;
                            }
                        }
                    }
                }

                // Use first item if no target item was provided
                oTargetItem = oTargetItem || aItems[0];
                if (oTargetItem) {
                    oMasterEntryList.setSelectedItem(oTargetItem);
                    this._toDetail(oTargetItem, sSelectedTabId);
                    // keep focus on the first item when reopen the dialog
                    oTargetItem.focus();
                }
            }
        },

        /**
         * Tries to load the information for the list item of an entry async.
         *
         * @param {string} sEntryId the id on an entry
         * @returns {Promise<undefined>} Resolves the entry value was fetched and set
         *
         * @private
         */
        _setEntryValueResult: function (sEntryId) {
            let oEntryResults;
            const oResultsModel = this.getView().getModel("results");
            let aEntries = Config.last("/core/userPreferences/entries");
            let iEntryIndex = aEntries.findIndex((oEntry) => {
                return oEntry.id === sEntryId;
            });

            if (iEntryIndex === -1) {
                return Promise.resolve();
            }

            return Promise.resolve()
                .then(() => {
                    const sEntryTitle = aEntries[iEntryIndex].title;
                    const vValueArgument = aEntries[iEntryIndex].valueArgument;

                    if (typeof vValueArgument !== "function") {
                        const sOldValueResult = oResultsModel.getProperty(`/entries/${sEntryId}/valueResult`);
                        if (sOldValueResult !== null && sOldValueResult !== undefined) {
                            return sOldValueResult;
                        }
                        return vValueArgument;
                    }

                    // Display "Loading..."
                    oEntryResults = deepClone(oResultsModel.getProperty("/entries"));
                    oEntryResults[sEntryId].valueResult = resources.i18n.getText("genericLoading");
                    oResultsModel.setProperty("/entries", oEntryResults);

                    return Promise.resolve()
                        .then(vValueArgument)
                        .then((valueResult) => {
                            if (typeof (valueResult) !== "object") {
                                return valueResult;
                            }

                            // update visibility
                            if (valueResult && valueResult.value !== undefined) {
                                aEntries = Config.last("/core/userPreferences/entries");
                                iEntryIndex = aEntries.findIndex((oEntry) => {
                                    return oEntry.id === sEntryId;
                                });
                                if (iEntryIndex > -1) {
                                    aEntries[iEntryIndex].visible = !!valueResult.value;
                                    Config.emit("/core/userPreferences/entries", aEntries);
                                }
                            }

                            return valueResult.displayText;
                        })
                        .catch((oError) => {
                            Log.error(`Can not load value for ${sEntryTitle} entry`, oError);
                            return resources.i18n.getText("loadingErrorMessage");
                        });
                })
                .then((sDisplayText) => {
                    // update entry description
                    oEntryResults = deepClone(oResultsModel.getProperty("/entries"));
                    oEntryResults[sEntryId].valueResult = sDisplayText || "";
                    oResultsModel.setProperty("/entries", oEntryResults);
                });
        },

        /**
         * Handles the Back button press
         *
         * @private
         */
        _navBackButtonPressHandler: function () {
            const oSplitApp = this.byId("settingsApp");
            oSplitApp.backDetail();
            oSplitApp.getCurrentDetailPage().setBusy(false);
            this._updateHeaderButtonVisibility(true);
        },

        /**
         * Handles the toggle button press in the header
         *
         * @private
         */
        _navToggleButtonPressHandler: function () {
            const oSplitApp = this.byId("settingsApp");
            const bIsMasterShown = oSplitApp.isMasterShown();

            if (bIsMasterShown) {
                oSplitApp.hideMaster();
            } else {
                oSplitApp.showMaster();
            }
            this._updateHeaderButtonVisibility(!bIsMasterShown);
        },

        /**
         * Update header button
         *
         * @param {boolean} bIsMasterShown If master page is shown
         *
         * @private
         */
        _updateHeaderButtonVisibility: function (bIsMasterShown) {
            if (Device.system.phone) {
                const oBackButton = this.getView().byId("userSettingsNavBackButton");
                oBackButton.setVisible(!bIsMasterShown);
            } else {
                const oMenuButton = this.getView().byId("userSettingsMenuButton");
                if (Device.orientation.portrait) {
                    oMenuButton.setVisible(true);
                    oMenuButton.setPressed(bIsMasterShown);
                    oMenuButton.setTooltip(resources.i18n.getText(bIsMasterShown ? "ToggleButtonHide" : "ToggleButtonShow"));
                } else {
                    oMenuButton.setVisible(false);
                }
            }
        },

        _afterMasterClose: function () {
            this._updateHeaderButtonVisibility(false);
        },

        /**
         * Handles the selection change in the main list.
         *
         * @param {object} oEvent the event that was fired
         * @private
         */
        _onSelectionChange: function (oEvent) {
            this.getView().byId("settingsApp").getCurrentDetailPage().setBusy(true);
            this._toDetail(oEvent.getSource().getSelectedItem());
        },

        /**
         * Navigates to the detail page that belongs to the given selected item.
         *
         * @param {sap.m.StandardListItem} oSelectedItem the StandardListItem that should be handled.
         * @param {string} sSelectedTabId The id of the selected tab.
         * @returns {Promise<undefined>} A promise which resolves when the navigation was done.
         * @private
         */
        _toDetail: function (oSelectedItem, sSelectedTabId) {
            const oView = this.getView();
            const oModel = oView.getModel();
            const oResultsModel = oView.getModel("results");

            const oSplitApp = oView.byId("settingsApp");
            const sEntryPath = oSelectedItem.getBindingContextPath();
            const oEntry = oModel.getProperty(sEntryPath);
            const sEntryId = oEntry.id;
            const sDetailPageId = oResultsModel.getProperty(`/entries/${sEntryId}/contentResult`);

            if (oEntry.tabs) {
                this._aPreviouslySelectedItems = oEntry.tabs.map((oTabEntry) => {
                    return oTabEntry.id;
                });
            } else {
                this._aPreviouslySelectedItems = [sEntryId];
            }

            if (Device.system.phone) { // Clear selection from list on mobile.
                this._oSelectedItemOnMobile = oSelectedItem;
                oSelectedItem.setSelected(false);
            }

            // Entry result was already saved
            if (sDetailPageId) {
                this._navToDetail(sDetailPageId, oView);
                const sWrapperId = oEntry.tabs.map((oTabEntry) => {
                    return oTabEntry.id;
                }).join("-");
                const oWrapperPromise = this._mLoadedWrappers.get(sWrapperId);
                // Loading of actual wrapper+entry was started
                if (oWrapperPromise) {
                    oWrapperPromise.then((oWrapper) => {
                        const oIconTabBar = oWrapper.getContent()[1];
                        if (sSelectedTabId) {
                            oIconTabBar.setSelectedKey(sSelectedTabId);
                        }
                        const sSelectedKey = oIconTabBar.getSelectedKey();
                        const aItems = oIconTabBar.getItems();
                        let iTabIndex = aItems.findIndex((oItem) => {
                            return oItem.getId() === sSelectedKey;
                        });

                        if (iTabIndex === -1) {
                            // if no tab was previously selected, register the first one.
                            // if the entry does not have multiple tabs, the first and only tab is registered.
                            iTabIndex = 0;
                        }

                        this._emitEntryOpened(oEntry.tabs[iTabIndex].id);
                    });
                    return Promise.resolve();
                }
            }

            return Promise.all([
                this._createContentWrapper(oEntry),
                this._createEntryContent(oEntry)
            ]).then((aResults) => {
                const oWrapper = aResults[0];
                const oEntryContent = aResults[1];

                const aEntries = Config.last("/core/userPreferences/entries");
                const bEntryAvailable = aEntries.some((entry) => {
                    return entry.id === sEntryId && entry.visible !== false;
                });

                const oMasterEntryList = oView.byId("userSettingEntryList");
                const oCurrentSelectedItem = oMasterEntryList.getSelectedItem() || this._oSelectedItemOnMobile;
                // Since the entry content creation is delayed, it might be that the user already selected a different settings entry.
                const bLoadedDetailMatchesSelectedEntry = oSelectedItem === oCurrentSelectedItem;

                if (!bEntryAvailable) {
                    if (bLoadedDetailMatchesSelectedEntry) {
                        if (oSplitApp.getMode() === "ShowHideMode") {
                            oSplitApp.showMaster();
                            this._updateHeaderButtonVisibility(true);
                        } else {
                            this._toDetail(oCurrentSelectedItem || oMasterEntryList.getItems()[0]);
                        }
                    }

                    // don't add entries which are not visible anymore
                    return;
                }

                oSplitApp.addDetailPage(oWrapper);

                if (oEntry.tabs.length > 1) {
                    oWrapper.getContent()[1].getItems()[0].addContent(oEntryContent);
                } else {
                    oWrapper.addContent(oEntryContent);
                }

                const sNewDetailPageId = oWrapper.getId();
                oResultsModel.setProperty(`/entries/${sEntryId}/contentResult`, sNewDetailPageId);

                if (sSelectedTabId) {
                    const oIconTabBar = oWrapper.getContent()?.[1];
                    oIconTabBar?.setSelectedKey(sSelectedTabId);
                }

                if (bLoadedDetailMatchesSelectedEntry) {
                    this._navToDetail(sNewDetailPageId, oView);
                    this._emitEntryOpened(sEntryId);
                }

                return oWrapper.getId();
            });
        },

        /**
         * Returns a promise, containing the content of the given entry.
         * If an error occurs, an error content for this entry will be created.
         *
         * @param {object} oEntry The entry, the content should be loaded from.
         * @returns {Promise<sap.ui.core.Control>} a Promise, that resolves with the created entry content.
         * @private
         */
        _createEntryContent: function (oEntry) {
            if (!this._mLoadedEntryContent.get(oEntry.id)) {
                if (typeof oEntry.contentFunc === "function") {
                    this._mLoadedEntryContent.set(oEntry.id, new Promise((resolve) => {
                        oEntry.contentFunc()
                            .then((oContentResult) => {
                                if (BaseObject.isObjectA(oContentResult, "sap.ui.core.Control")) {
                                    resolve(oContentResult);
                                } else {
                                    this._createErrorContent(resources.i18n.getText("loadingErrorMessage")).then(resolve);
                                }
                            })
                            .catch(() => {
                                this._createErrorContent(resources.i18n.getText("loadingErrorMessage")).then(resolve);
                            });
                    }));
                } else {
                    this._mLoadedEntryContent.set(oEntry.id, this._createErrorContent(resources.i18n.getText("userSettings.noContent")));
                }
            }

            return this._mLoadedEntryContent.get(oEntry.id);
        },

        /**
         * Returns a promise, containing the wrapper for the given entry.
         *
         * @param {object} oEntry The entry, the wrapper should be created for.
         * @returns {Promise<sap.ushell.components.shell.Settings.ContentWrapper>} a Promise, that resolves with the created wrapper.
         * @private
         */
        _createContentWrapper: function (oEntry) {
            const aEntryIds = oEntry.tabs.map((oTabEntry) => {
                return oTabEntry.id;
            });
            const sWrapperId = aEntryIds.join("-");

            if (!this._mLoadedWrappers.get(sWrapperId)) {
                this._mLoadedWrappers.set(sWrapperId, Fragment.load({
                    name: "sap.ushell.components.shell.Settings.ContentWrapper",
                    controller: {
                        onTabSelected: function (oEvent) {
                            const oIconTabBar = Element.getElementById(oEvent.getParameter("id"));
                            const oIconTabFilter = oEvent.getParameter("item");
                            const iTabIndex = oIconTabBar.indexOfItem(oIconTabFilter);
                            const oTabEntryContext = oEntry.tabs[iTabIndex];

                            this._emitEntryOpened(oTabEntryContext.id);
                            this._createEntryContent(oTabEntryContext).then((oEntryContent) => {
                                oIconTabFilter.addContent(oEntryContent);
                            });
                        }.bind(this)
                    }
                }).then((oContentWrapper) => {
                    oContentWrapper.setModel(new JSONModel({
                        title: oEntry.title,
                        showHeader: !oEntry.provideEmptyWrapper,
                        tabs: oEntry.tabs
                    }), "entryInfo");
                    return oContentWrapper;
                }));
            }

            return this._mLoadedWrappers.get(sWrapperId).then((oWrapper) => {
                const oIconTabBar = oWrapper.getContent()[1];
                const sSelectedKey = oIconTabBar.getSelectedKey();

                const iTabIndex = oIconTabBar.getItems().findIndex((oItem) => {
                    return oItem.getId() === sSelectedKey;
                });

                if (iTabIndex > -1) {
                    const oTabEntryContext = oEntry.tabs[iTabIndex];
                    this._emitEntryOpened(oTabEntryContext.id);
                }

                return oWrapper;
            });
        },

        /**
         * Creates and returns an error content with a given error message.
         *
         * @param {string} sMessage The error message to be displayed.
         * @returns {Promise<sap.ui.core.Control>} the error content.
         */
        _createErrorContent: function (sMessage) {
            return Fragment.load({
                name: "sap.ushell.components.shell.Settings.ErrorContent"
            }).then((oErrorContent) => {
                oErrorContent.setModel(new JSONModel({
                    errorMessage: sMessage
                }));
                return oErrorContent;
            });
        },

        /**
         * Navigates to the corresponding detail Page.
         *
         * @param {string} sId the id of the detail Page the AppSplit-Container should navigate to.
         * @param {string} oView The user settings view.
         * @private
         */
        _navToDetail: function (sId, oView) {
            const oSplitApp = oView.byId("settingsApp");

            oSplitApp.getCurrentDetailPage().setBusy(false);
            oSplitApp.toDetail(sId);
            oSplitApp.getCurrentDetailPage().setBusy(false);
            if (oSplitApp.getMode() === "ShowHideMode") {
                oSplitApp.hideMaster();
                this._updateHeaderButtonVisibility(false);
            }
        },

        /**
         * Emits an event to notify that the entry with the given entry id, needs to be saved.
         *
         * @param {string} sEntryId The id of an entry.
         * @private
         */
        _emitEntryOpened: function (sEntryId) {
            const oUserSettingsEntriesToSave = EventHub.last("UserSettingsOpened") || {};
            oUserSettingsEntriesToSave[sEntryId] = true;
            EventHub.emit("UserSettingsOpened", oUserSettingsEntriesToSave);
        },

        /**
         * Update user preferences using the UserInfo service
         *
         * @returns {Promise} A promise that resolves when
         * sendRequest method is executed centrally,
         * so the update is executed only once when preparation phase is over.
         * It bundles the requests concerning the user preferences into a batch.
         * It rejects when one update fails. That means subscribers have to check error message if they are concerned.
         * However currently it is "saved with errors" is implemented.
         * @since 1.107.0
         */
        updateUserPreferences: function () {
            Log.debug("[000] updateUserPreferences: ", "UserSettings.controller");

            if (this._updateUserPreferencesPromise) { // use one batch for several calls (theme, cozy/compact and dark mode)
                return this._updateUserPreferencesPromise;
            }

            let _resolve; let _reject;

            this._updateUserPreferencesPromise = new Promise((resolve, reject) => {
                _resolve = resolve;
                _reject = reject;
            });

            // the request is not sent immediately but when .sendRequest is called onSave
            this._updateUserPreferencesPromise.sendRequest = function () {
                Container.getServiceAsync("UserInfo").then((oUserInfo) => {
                    Log.debug("[000] updateUserPreferences: sendRequest", "UserSettings.controller");
                    oUserInfo.updateUserPreferences()
                        .done(_resolve)
                        .fail(_reject)
                        .always(() => {
                            // prepare for the next call; tests have to make sure that the previous call is always finished
                            Log.debug("[000] updateUserPreferences: sendRequest: _updateUserPreferencesPromise", "UserSettings.controller");
                            this._updateUserPreferencesPromise = null;
                        });
                });
            }.bind(this);

            return this._updateUserPreferencesPromise;
        },

        /**
         * Reloads FLP if instructions for it are found in results parameter.
         *
         * If needed the `sap-usercontext` cookie is cleared.
         *
         * @param {object[]} aResults Array that contains the results.
         * @returns {boolean} bReloaded true if FLP was reloaded
         */
        _maybeReload: function (aResults) {
            let bRefresh = false;
            let bClearSapUserContextCookie = false;
            let bNoHash = false;
            let aUrlParams = [];
            let aObsoleteUrlParams = [];
            aResults.forEach((oResult) => {
                if (oResult && oResult.clearSapUserContextCookie) {
                    bClearSapUserContextCookie = true;
                }
                if (oResult && oResult.refresh) {
                    bRefresh = true;
                }
                if (oResult && oResult.noHash) {
                    bNoHash = true;
                }
                if (oResult && oResult.urlParams && oResult.urlParams.length > 0) {
                    aUrlParams = aUrlParams.concat(oResult.urlParams);
                }
                if (oResult && oResult.obsoleteUrlParams && oResult.obsoleteUrlParams.length > 0) {
                    aObsoleteUrlParams = aObsoleteUrlParams.concat(oResult.obsoleteUrlParams);
                }
            });

            if (bRefresh) {
                Log.debug("[000]refresh browser with Parameters:", JSON.stringify(aUrlParams), "UserSettings.controller");
                if (bClearSapUserContextCookie) {
                    windowUtils.clearSapUserContextCookie();
                }
                if (bNoHash) {
                    // Remove hash, otherwise we navigate to "content" we do not want.
                    window.location = window.location.href.replace(window.location.hash, "");
                } else {
                    windowUtils.refreshBrowser(aUrlParams, aObsoleteUrlParams);
                }
                return true;
            }
        },

        /**
         * Saves and closes the User Settings Dialog.
         * May show an error message.
         * May show a success toast.
         * May reload.
         * @returns {Promise} Resolves with undefined once the function is completed except from the case that it reloads.
         * @private
         */
        _handleSaveButtonPress: function () {
            ErrorMessageHelper.removeErrorMessages();

            const oDialog = this.getView().byId("userSettingsDialog");
            const aEntries = Config.last("/core/userPreferences/entries");
            const oOpenedEntries = EventHub.last("UserSettingsOpened") || {};

            if (Object.keys(oOpenedEntries).length === 0) {
                this._handleSettingsDialogClose();
                this._showSuccessMessageToast();
                return Promise.resolve();
            }
            oDialog.setBusy(true);

            const aSavePromises = aEntries.reduce((aResult, oEntry) => {
                if (oOpenedEntries[oEntry.id]) {
                    // onSave can be native Promise or jQuery promise.
                    Log.debug("[000] _handleSaveButtonPress: oEntry.id: ", oEntry.id, "UserSettings.controller");
                    aResult.push(this._executeEntrySave(oEntry));
                }
                return aResult;
            }, []);
            Log.debug("[000] _handleSaveButtonPress:_updateUserPreferencesPromise", this._updateUserPreferencesPromise, "UserSettings.controller");
            if (this._updateUserPreferencesPromise) {
                this._updateUserPreferencesPromise.sendRequest(); // Send the combined batch request.
            }
            return Promise.all(aSavePromises).then((aResults) => {
                Log.debug("[000] _handleSaveButtonPress: then save aResults", JSON.stringify(aResults), "UserSettings.controller");
                const aFailedExecutions = ErrorMessageHelper.filterMessagesToDisplay();
                let oFirstError = {};
                let sFirstErrorMessageDescription = "";
                let sErrMessageLog = "";

                oDialog.setBusy(false);
                this._handleSettingsDialogClose();
                // Error case
                if (aFailedExecutions.length > 0) {
                    oFirstError = aFailedExecutions[0];
                    sFirstErrorMessageDescription = oFirstError.getDescription();
                    EventHub.emit("UserSettingsOpened", null);
                    aFailedExecutions.forEach((oError) => {
                        sErrMessageLog += `Entry: ${oError.getAdditionalText()} - Error message: ${oError.getDescription()}\n`;
                    });
                    Log.error("Failed to save the following entries", sErrMessageLog);
                    if (this._maybeReload(aResults)) {
                        // no message
                        return;
                    }
                    return Container.getServiceAsync("MessageInternal")
                        .then((oMessage) => {
                            oMessage.init();
                            oMessage.show(
                                oMessage.Type.ERROR,
                                resources.i18n.getText("userSettings.SavingError.SomeChanges"),
                                {
                                    details: sFirstErrorMessageDescription
                                }
                            );
                        });
                }
                this._showSuccessMessageToast();
                EventHub.emit("UserSettingsOpened", null);
                this._maybeReload(aResults);
            });
        },

        _executeEntrySave: function (oEntry) {
            let onSavePromise;
            let oResultPromise;

            function onSuccess (params) {
                return params || {};
            }

            function onError (vError) {
                Log.debug("[000] _onError: errorInformation", JSON.stringify(vError), "UserSettings.controller");
                let sMessage;
                const sEntryId = oEntry.id;
                const sEntryTitle = oEntry.title;

                if (!vError) {
                    sMessage = resources.i18n.getText("userSettings.SavingError.Undefined");
                } else if (typeof (vError) === "string") {
                    sMessage = vError;
                } else if (Array.isArray(vError)) {
                    vError.forEach((message) => {
                        message.setAdditionalText(sEntryTitle);
                        message.setTechnicalDetails({ pluginId: sEntryId });
                        ErrorMessageHelper.addMessage(message);
                    });
                    return;
                } else if (BaseObject.isObjectA(vError, "sap.ui.core.message.Message")) {
                    vError.setAdditionalText(sEntryTitle);
                    vError.setTechnicalDetails({ pluginId: sEntryId });
                    ErrorMessageHelper.addMessage(vError);
                    return;
                } else {
                    sMessage = resources.i18n.getText("userSettings.SavingError.WithMessage", [vError.message]);
                }

                ErrorMessageHelper.addMessage(new Message({
                    type: MessageType.Error,
                    additionalText: sEntryTitle,
                    technicalDetails: {
                        pluginId: sEntryId
                    },
                    description: sMessage,
                    message: sMessage
                }));
            }

            try {
                Log.debug(`[000] onSave: oEntry.id: ${oEntry.id}`, "UserSettings.controller");
                this._isExecuteEntrySavedInUserSettingsController = true;
                onSavePromise = oEntry.onSave(this.updateUserPreferences.bind(this));
            } catch (vError) {
                return onError(vError);
            }

            // jQuery promise
            if (onSavePromise) {
                if (onSavePromise.promise) {
                    Log.warning(`jQuery.promise is used to save ${oEntry.title} settings entry.\n`
                        + "The using of jQuery.promise for onSave is deprecated. Please use the native promise instead.");
                    oResultPromise = new Promise((resolve) => {
                        onSavePromise
                            .done((params) => {
                                resolve(onSuccess(params));
                            })
                            .fail((oError) => {
                                resolve(onError(oError));
                            });
                    });
                } else {
                    oResultPromise = onSavePromise
                        .then(onSuccess)
                        .catch(onError);
                }
            } else {
                oResultPromise = Promise.resolve();
                // onSave needs to return a jQuery.promise or better a native Promise.
                Log.warning(`${oEntry.title} settings might not be saved correctly, it seems like the API contract is not correctly fullfilled.\n`
                    + "Please contact the owner of the setting.");
            }

            return oResultPromise;
        },

        _showSuccessMessageToast: function () {
            sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                const sMessage = resources.i18n.getText("savedChanges");

                MessageToast.show(sMessage, {
                    offset: "0 -50"
                });
            });
        },

        /**
         * Close User Settings Dialog without saving.
         *
         * @private
         */
        _handleCancel: function () {
            const aEntries = Config.last("/core/userPreferences/entries");
            // Invoke onCancel function for opened entity
            const oInvokedEntities = EventHub.last("UserSettingsOpened") || {};
            if (oInvokedEntities) {
                aEntries.forEach((oEntry) => {
                    if (oInvokedEntities[oEntry.id] && oEntry.onCancel) {
                        try {
                            oEntry.onCancel();
                        } catch (vError) {
                            Log.error("Failed to cancel the following entries", vError);
                        }
                    }
                });
            }
            EventHub.emit("UserSettingsOpened", null);
            this._handleSettingsDialogClose();
        },

        /**
         * Close User Settings Dialog.
         *
         * @private
         */
        _handleSettingsDialogClose: function () {
            // to be sure that all user changes reset
            Container.getUser().resetChangedProperties();
            // Clear selection from list.
            if (Device.system.phone) {
                this.getView().byId("settingsApp").toMaster("settingsView--userSettingMaster");
            }
            this.getView().byId("userSettingsMessagePopoverBtn").setVisible(false);
            this.getView().byId("userSettingsDialog").close();
        },

        onExit: function () {
            this._oConfigDoable.off();

            Device.orientation.detachHandler(this._fnOrientationChange, this);
        }
    });
});
