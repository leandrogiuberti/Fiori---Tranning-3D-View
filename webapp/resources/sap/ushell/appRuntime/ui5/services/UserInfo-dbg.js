// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.UserInfo}.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/services/UserInfo",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/base/util/ObjectPath"
], (
    jQuery,
    UserInfo,
    AppCommunicationMgr,
    ObjectPath
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.UserInfo
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.UserInfo}.
     *
     * @param {object} oAdapter The service adapter for the NavTargetResolutionInternal service, as already provided by the container
     * @param {object} oContainerInterface The interface.
     *
     * @hideconstructor
     *
     * @private
     */
    function UserInfoProxy (oAdapter, oContainerInterface) {
        UserInfo.call(this, oAdapter, oContainerInterface);

        this.getThemeList = function () {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.UserInfo.getThemeList");
        };

        this.updateUserPreferences = function () {
            const oDeferred = new jQuery.Deferred();

            sap.ui.require(["sap/ushell/appRuntime/ui5/services/Container"], (Container) => {
                AppCommunicationMgr.postMessageToFLP("sap.ushell.services.UserInfo.updateUserPreferences", {
                    language: Container.getUser().getLanguage()
                }).then(oDeferred.resolve).catch(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        this.getLanguageList = function () {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.UserInfo.getLanguageList");
        };

        this.getShellUserInfo = function () {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.UserInfo.getShellUserInfo");
        };
    }

    ObjectPath.set("sap.ushell.services.UserInfo", UserInfoProxy);

    UserInfoProxy.prototype = UserInfo.prototype;
    UserInfoProxy.hasNoAdapter = true;

    return UserInfoProxy;
});
