// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the EnvironmentHandler class.
 *
 * Any handlers that are relevant for the environment/ framework
 * - UserInfo/ Environment (Language, Preferences, ...)
 * - Theme /ContentDensity changes
 * - HashChange handling
 * - FLP Info (Url, Platform, ...)
 * - Generic Subscribe
 * - HotKey handling
 * - UITracer
 * - shellUIBlocker
 */
sap.ui.define([
    "sap/base/i18n/Formatting",
    "sap/base/i18n/Localization",
    "sap/base/Log",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/utils"
], (
    Formatting,
    Localization,
    Log,
    hasher,
    PostMessageManager,
    Container,
    EventHub,
    ushellUtils
) => {
    "use strict";

    // todo; [FLPCOREANDUX-10024] Add tests for distribution policies
    const oDistributionPolicies = {
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.appRuntime.innerAppRouteChange": {
            onlyCurrentApplication: true,
            ignoreCapabilities: true
        },
        /**
         * @private
         */
        "sap.ushell.appRuntime.hashChange": {
            onlyCurrentApplication: true,
            ignoreCapabilities: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.appRuntime.themeChange": {
            ignoreCapabilities: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.appRuntime.uiDensityChange": {
            ignoreCapabilities: true
        }
    };

    const oServiceRequestHandlers = {
        /**
         * The request is originally documented as "sap.ushell.services.appLifeCycle.subscribe".
         * However, "sap.ushell.services.appLifeCycle.*" messages are transformed to "sap.ushell.AppLifeCycle.*" in the PostMessageHandler.
         * Therefore, the handler is registered as "sap.ushell.AppLifeCycle.setup" and supports both cases.
         * @private
         */
        "sap.ushell.services.AppLifeCycle.subscribe": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const aNewCapabilities = oMessageBody;

                if (!Array.isArray(aNewCapabilities)) {
                    Log.error("subscribe service call failed: capabilities must be an array");
                    throw new Error("subscribe service call failed: capabilities must be an array");
                }

                const aFormattedCapabilities = aNewCapabilities.map((oCapability) => {
                    return `${oCapability.service}.${oCapability.action}`;
                });

                oApplicationContainer.addCapabilities(aFormattedCapabilities);
            },
            options: {
                provideApplicationContext: true,
                allowInactive: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.appRuntime.hashChange": {
            async handler (oMessageBody, oMessageEvent) {
                const { newHash, direction } = oMessageBody;

                // FIX for internal incident #1980317281 - In general, hash structure in FLP is splitted into 3 parts:
                // A - application identification & B - Application parameters & C - Internal application area
                // Now, when an IFrame changes its hash, it sends PostMessage up to the FLP. The FLP does 2 things: Change its URL
                // and send a PostMessage back to the IFrame. This fix instruct the Shell.Controller.js to block only
                // the message back to the IFrame.
                hasher.disableBlueBoxHashChangeTrigger = true;
                hasher.replaceHash(newHash);
                hasher.disableBlueBoxHashChangeTrigger = false;

                // Getting the history direction, taken from the history object of UI5 (sent by the Iframe).
                // The direction value is used to update the direction property of the UI5 history object
                // that is running in the Iframe.
                if (direction) {
                    const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");
                    ShellNavigationInternal.hashChanger.fireEvent(
                        "hashReplaced",
                        {
                            hash: ShellNavigationInternal.hashChanger.getHash(),
                            direction: direction
                        }
                    );
                    Log.debug(`PostMessageAPI.hashChange :: Informed by the Iframe, to change the History direction property in FLP to: ${direction}`);
                }
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.getFLPUrl": {
            async handler (oMessageBody, oMessageEvent) {
                const bIncludeHash = oMessageBody.bIncludeHash;

                return Container.getFLPUrlAsync(bIncludeHash);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Container.getFLPUrl": {
            async handler (oMessageBody, oMessageEvent) {
                const bIncludeHash = oMessageBody.bIncludeHash;
                return Container.getFLPUrlAsync(bIncludeHash);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Container.getFLPConfig": {
            async handler (oMessageBody, oMessageEvent) {
                return Container.getFLPConfig();
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Container.getFLPPlatform": {
            async handler (oMessageBody, oMessageEvent) {
                return Container.getFLPPlatform();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ShellUIService.processHotKey": {
            async handler (oMessageBody, oMessageEvent) {
                const { altKey, ctrlKey, shiftKey, key, keyCode } = oMessageBody;

                const oKeyboardEvent = new KeyboardEvent("keydown", {
                    altKey,
                    ctrlKey,
                    shiftKey,
                    key,
                    keyCode
                });

                document.dispatchEvent(oKeyboardEvent);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.showShellUIBlocker": {
            async handler (oMessageBody, oMessageEvent) {
                // 'sap.ushell.services.ShellUIService.showShellUIBlocker' was discontinued with SAPUI5 1.132.
                // This functionality has some conceptual issues which caused several issues in Work Zone.
                // Once we overcome these issues, we will re-implement this functionality. (FLPCOREANDUX-10622)
                // This call will be ignored.
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.UserInfo.getThemeList": {
            async handler (oMessageBody, oMessageEvent) {
                const UserInfo = await Container.getServiceAsync("UserInfo");

                const oDeferred = UserInfo.getThemeList();

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UserInfo.getShellUserInfo": {
            async handler (oMessageBody, oMessageEvent) {
                const UserInfo = await Container.getServiceAsync("UserInfo");

                return UserInfo.getShellUserInfo();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UserInfo.getLanguageList": {
            async handler (oMessageBody, oMessageEvent) {
                const UserInfo = await Container.getServiceAsync("UserInfo");

                const oDeferred = UserInfo.getLanguageList();

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UserInfo.updateUserPreferences": {
            async handler (oMessageBody, oMessageEvent) {
                const { language } = oMessageBody;

                if (!language) {
                    return;
                }

                const oUser = Container.getUser();
                oUser.setLanguage(language);
                const UserInfo = await Container.getServiceAsync("UserInfo");

                const oDeferred = UserInfo.updateUserPreferences();
                await ushellUtils.promisify(oDeferred);

                oUser.resetChangedProperty("language");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UserInfo.openThemeManager": {
            async handler (oMessageBody, oMessageEvent) {
                EventHub.emit("openThemeManager", Date.now());
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UserInfo.getLocaleData": {
            async handler (oMessageBody, oMessageEvent) {
                const oLocaleData = {
                    // date format
                    calendarType: Formatting.getCalendarType(),
                    dateFormatShort: Formatting.getDatePattern("short"),
                    dateFormatMedium: Formatting.getDatePattern("medium"),
                    // number format
                    numberFormatGroup: Formatting.getNumberSymbol("group"),
                    numberFormatDecimal: Formatting.getNumberSymbol("decimal"),
                    // time format
                    timeFormatShort: Formatting.getTimePattern("short"),
                    timeFormatMedium: Formatting.getTimePattern("medium"),
                    // calendar customizing
                    calendarMapping: Formatting.getCustomIslamicCalendarData(),
                    // timezone
                    timeZone: Localization.getTimezone(),
                    // currency formats
                    currencyFormats: Formatting.getCustomCurrencies()
                };
                return oLocaleData;
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UITracer.trace": {
            async handler (oMessageBody, oMessageEvent) {
                const { trace } = oMessageBody;
                await Container.getServiceAsync("UITracer");

                EventHub.emit("UITracer.trace", trace);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.SearchableContent.getApps": {
            async handler (oMessageBody, oMessageEvent) {
                const oOptions = oMessageBody.oOptions || {};
                const SearchableContent = await Container.getServiceAsync("SearchableContent");

                return SearchableContent.getApps(oOptions);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.setSecondTitle": {
            async handler (oMessageBody, oMessageEvent) {
                const { title } = oMessageBody;
                const Extension = await Container.getServiceAsync("Extension");

                return Extension.setSecondTitle(title);
            }
        },
        /**
         * Update the "secondTitle"
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.setHeaderTitle": {
            async handler (oMessageBody, oMessageEvent) {
                const { sTitle } = oMessageBody;
                const Extension = await Container.getServiceAsync("Extension");

                Extension.setSecondTitle(sTitle);
            }
        }
    };

    return {
        register () {
            Object.keys(oDistributionPolicies).forEach((sServiceRequest) => {
                const oDistributionPolicy = oDistributionPolicies[sServiceRequest];
                PostMessageManager.setDistributionPolicy(sServiceRequest, oDistributionPolicy);
            });

            Object.keys(oServiceRequestHandlers).forEach((sServiceRequest) => {
                const oHandler = oServiceRequestHandlers[sServiceRequest];
                PostMessageManager.setRequestHandler(sServiceRequest, oHandler.handler, oHandler.options);
            });
        }
    };
});
