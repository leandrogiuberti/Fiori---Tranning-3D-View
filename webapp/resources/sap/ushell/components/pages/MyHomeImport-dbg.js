// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview MyHome migrate functionality for the PageRuntime view
 *
 * @version 1.141.1
 */

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/utils/HttpClient",
    "sap/base/util/ObjectPath",
    "sap/ushell/Container"
], (
    Localization,
    EventHub,
    Config,
    HttpClient,
    ObjectPath,
    Container
) => {
    "use strict";
    const MyHomeImport = {};
    const sDefaultGroupId = "/UI2/Fiori2LaunchpadHome";

    /**
     * Requests the classical home page personalization
     *
     * @returns {Promise} Promise with array of personalized home page groups
     * @private
     */
    MyHomeImport.getData = function () {
        if (!this.oPageSetPromise) {
            this.oPageSetPromise = new Promise((resolve, reject) => {
                const sRequestUrl = "PageSets('%2FUI2%2FFiori2LaunchpadHome')"
                    + "?$expand=Pages/PageChipInstances/ChipInstanceBags/ChipInstanceProperties,"
                    + "Pages/PageChipInstances/Chip"
                    + "&$format=json";

                const oHeaders = {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                    "Accept-Language": Localization.getLanguage() || "",
                    Accept: "application/json, text/plain"
                };
                const sSAPLogonLanguage = Container.getUser().getLanguage();
                if (sSAPLogonLanguage) {
                    oHeaders["sap-language"] = sSAPLogonLanguage;
                }
                const oLogonSystem = Container.getLogonSystem();
                const sSapClient = oLogonSystem && oLogonSystem.getClient();
                if (sSapClient) {
                    oHeaders["sap-client"] = sSapClient;
                }

                const oServiceConfig = (window["sap-ushell-config"].services && window["sap-ushell-config"].services.PageBuilding) || {};
                const sBaseUrl = (ObjectPath.get("config.services.pageBuilding.baseUrl", oServiceConfig.adapter) || "").replace(/\/?$/, "/");
                const oHttpClient = new HttpClient(sBaseUrl, {
                    headers: oHeaders
                });
                oHttpClient.get(sRequestUrl).then((result) => {
                    resolve(this.parseData.bind(this)(result));
                }).catch(reject);
            });
        }
        return this.oPageSetPromise;
    };

    /**
     * Check if the import is enabled.
     * MYHOME_IMPORT_FROM_CLASSIC is set or classical home page contains personalized data to migrate.
     * If MYHOME_IMPORT_FROM_CLASSIC is not defined yet, read classic personalisation and update the flag accordingly.
     *
     * @returns {Promise} true if the migration is possible or needed.
     * @private
     */
    MyHomeImport.isImportEnabled = function () {
        // Respect MYHOME_IMPORT_FROM_CLASSIC before calling .getData()
        return Container.getServiceAsync("UserInfo").then((oUserInfo) => {
            const oUser = oUserInfo.getUser();
            const sImportBookmarksFlag = oUser.getImportBookmarksFlag();
            switch (sImportBookmarksFlag) {
                case "done":
                case "dismissed":
                case "not_required":
                    return false; // do not need to show the "import" message strip
                case null:
                    // MYHOME_IMPORT_FROM_CLASSIC is null. Check if there is data to import.
                    return this.getData().then((aGroups) => {
                        const bImportNeeded = !!(aGroups.length);
                        const sImportFlag = bImportNeeded ? "pending" : "not_required";

                        oUser.setImportBookmarksFlag(sImportFlag);
                        oUserInfo.updateUserPreferences(); // Save MYHOME_IMPORT_FROM_CLASSIC in the back end
                        oUser.resetChangedProperty("importBookmarks");
                        return bImportNeeded;
                    });
                default:
                    return true; // show the message strip
            }
        });
    };

    /**
     * Convert response into required format. Keep only personalized groups.
     * @param {object} response HTTP response from Page Building Service
     * @returns {object[]} Array of personalized home page groups or null in case of error
     */
    MyHomeImport.parseData = function (response) {
        try {
            let oPageSetData = JSON.parse(response.responseText);

            if (oPageSetData && oPageSetData.d) {
                oPageSetData = oPageSetData.d;
            }

            const oConfiguration = oPageSetData.configuration && JSON.parse(oPageSetData.configuration) || {};
            const aHiddenGroups = oConfiguration.hiddenGroups || [];

            // only display personalized not empty not hidden groups
            const aPages = oPageSetData.Pages.results.filter((page) => {
                const bIsPersonalized = page.scope === "PERSONALIZATION";
                const bHasTiles = page.PageChipInstances.results.length > 0;
                const bIsNotHidden = aHiddenGroups.indexOf(page.id) === -1;
                return bIsPersonalized && bHasTiles && bIsNotHidden;
            });

            const aGroupOrder = oConfiguration.order || [];

            // sort groups to personalized order
            aPages.sort((x, y) => {
                if (aGroupOrder.indexOf(x.id) > aGroupOrder.indexOf(y.id)) { return 1; }
                if (aGroupOrder.indexOf(x.id) < aGroupOrder.indexOf(y.id)) { return -1; }
                return 0;
            });
            let aLockedGroups = [];
            let oDefaultGroup;
            const aNonLockedGroups = [];

            // generate group model data and sort model data into different arrays
            aPages.forEach((page) => {
                let oLayout;
                if (page.layout) {
                    oLayout = JSON.parse(page.layout);
                }

                const oModelGroup = {
                    id: page.id,
                    title: page.title,
                    isLocked: page.isPersLocked === "X",
                    isDefault: page.id === sDefaultGroupId,
                    tileOrder: oLayout && oLayout.order || [],
                    linkOrder: oLayout && oLayout.linkOrder || [],
                    chips: page.PageChipInstances.results
                };

                if (oModelGroup.isLocked) {
                    aLockedGroups.push(oModelGroup);
                } else if (oModelGroup.isDefault) {
                    oDefaultGroup = oModelGroup;
                } else {
                    aNonLockedGroups.push(oModelGroup);
                }
            });

            // sort only locked groups
            if (!Config.last("/core/home/disableSortedLockedGroups")) {
                aLockedGroups.sort((x, y) => {
                    return x.title.toLowerCase() < y.title.toLowerCase() ? -1 : 1;
                });
            }

            // only concat default group if it was personalized
            if (oDefaultGroup) {
                aLockedGroups = aLockedGroups.concat(oDefaultGroup);
            }

            // update model with group model data
            return aLockedGroups.concat(aNonLockedGroups);
        } catch {
            return null;
        }
    };

    /**
     * Set MYHOME_IMPORT_FROM_CLASSIC according to the user decision
     *
     * @param {boolean} bEnabled boolean flag.
     * @private
     */
    MyHomeImport.setImportEnabled = function (bEnabled) {
        EventHub.emit("importBookmarksFlag", !!bEnabled); // Inform MyHome view to hide the message strip
        Container.getServiceAsync("UserInfo").then((oUserInfo) => {
            const oUser = oUserInfo.getUser();
            const sImportFlag = bEnabled ? null : "dismissed";
            oUser.setImportBookmarksFlag(sImportFlag);
            oUserInfo.updateUserPreferences(); // Save MYHOME_IMPORT_FROM_CLASSIC in the back end
            oUser.resetChangedProperty("importBookmarks");
        });
    };

    return MyHomeImport;
});
