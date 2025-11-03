// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Configure the UI5Settings for Date and Time Format for the 'CDM'
 *               platform.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/i18n/Formatting",
    "sap/base/Log",
    "sap/base/util/ObjectPath"
], (Formatting, Log, ObjectPath) => {
    "use strict";

    /**
     * This function configures the UI5 settings for Date and Time Format.
     * Note: TimeZone is not taken into account.
     *
     * @param {object} oUshellConfig
     *     the Ushell Configuration Settings
     *     It shall be like oUshellConfig.services.Contaainer.adapter.config
     *     if not undefined values for date and time format is set.
     *
     * @private
     */
    function configureUI5DateTimeFormat (oUshellConfig) {
        const oUserProfileDefaults = ObjectPath.get("services.Container.adapter.config.userProfile.defaults", oUshellConfig);

        const sMessageDate = "Date Format is incorrectly set for the User";
        const sMessageTime = "Time Format is incorrectly set for the User";

        try {
            const sSapDateFormat = oUserProfileDefaults && oUserProfileDefaults.sapDateFormat;
            Formatting.setABAPDateFormat(sSapDateFormat);
        } catch (oError) {
            Log.error(sMessageDate, oError, "sap/ushell/bootstrap/common/common.configure.ui5datetimeformat");
        }

        try {
            const sSapTimeFormat = oUserProfileDefaults && oUserProfileDefaults.sapTimeFormat;
            Formatting.setABAPTimeFormat(sSapTimeFormat);
        } catch (oError) {
            Log.error(sMessageTime, oError, "sap/ushell/bootstrap/common/common.configure.ui5datetimeformat");
        }
    }

    return configureUI5DateTimeFormat;
}, /* bExport = */ false);
