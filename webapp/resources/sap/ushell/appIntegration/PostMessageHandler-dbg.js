// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the references to all "common" postMessage handlers.
 */
sap.ui.define([
    "sap/base/util/deepClone",
    "sap/ushell/appIntegration/PostMessageHandler/AppInfoHandler",
    "sap/ushell/appIntegration/PostMessageHandler/AppStateHandler",
    "sap/ushell/appIntegration/PostMessageHandler/BookmarkHandler",
    "sap/ushell/appIntegration/PostMessageHandler/EnvironmentHandler",
    "sap/ushell/appIntegration/PostMessageHandler/ExtensionHandler",
    "sap/ushell/appIntegration/PostMessageHandler/LifecycleHandler",
    "sap/ushell/appIntegration/PostMessageHandler/MessageBrokerHandler",
    "sap/ushell/appIntegration/PostMessageHandler/NavigationHandler",
    "sap/ushell/appIntegration/PostMessageHandler/NWBCHandler",
    "sap/ushell/appIntegration/PostMessageHandler/SessionHandler",
    "sap/ushell/appIntegration/PostMessageManager"
], (
    deepClone,
    AppInfoHandler,
    AppStateHandler,
    BookmarkHandler,
    EnvironmentHandler,
    ExtensionHandler,
    LifecycleHandler,
    MessageBrokerHandler,
    NavigationHandler,
    NWBCHandler,
    SessionHandler,
    PostMessageManager
) => {
    "use strict";

    const aEventPreprocessor = [
        // AppLifeCycle casing can be inconsistent in postMessage calls
        // Therefore, we sanitize all of them to a consistent casing
        (oOriginalMessageEvent, oOriginalMessage) => {
            if (oOriginalMessage.service?.startsWith("sap.ushell.services.appLifeCycle")) {
                const oMessage = deepClone(oOriginalMessage);
                oMessage.service = oMessage.service.replace(/appLifeCycle/gi, "AppLifeCycle");
                oMessage.originalMessage = oOriginalMessage;

                const oMessageEvent = new MessageEvent("message", {
                    data: JSON.stringify(oMessage),
                    origin: oOriginalMessageEvent.origin,
                    source: oOriginalMessageEvent.source
                });
                oMessageEvent.originalMessageEvent = oOriginalMessageEvent;

                return {
                    event: oMessageEvent,
                    message: oMessage
                };
            }
        }
    ];

    return {
        register () {
            aEventPreprocessor.forEach((fnEventPreprocessor) => {
                PostMessageManager.addEventPreprocessor(fnEventPreprocessor);
            });

            /**
             * Any handlers that are relevant for applications
             * - ShellUIService (setTitle, setBackNavigation, ...)
             * - ApplicationWidth
             * - AppInfo (AboutDialog)
             * - DirtyState Handling
             */
            AppInfoHandler.register();

            /**
             * AppState handling
             */
            AppStateHandler.register();

            /**
             * Bookmark handling & SendAsEmail
             */
            BookmarkHandler.register();

            /**
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
            EnvironmentHandler.register();

            /**
             * Any handlers that are relevant for extensions
             * - Head(End)Items
             * - UserActions
             */
            ExtensionHandler.register();

            /**
             * Any handlers that are relevant for the application lifecycle
             * - StatefulContainer (setup, loadFinished)
             *   + create/destroy
             *   + store/restore
             * - Generic Lifecycle Events
             *   + show/hide
             *   + reload
             *   + beforeAppClose
             */
            LifecycleHandler.register();

            /**
             * Any handlers that are relevant for the message broker
             */
            MessageBrokerHandler.register();

            /**
             * Any handlers that are relevant for navigation
             * - ushell services
             *   + Navigation
             *   + CrossApplicationNavigation
             *   + ShellNavigation(Internal)
             *   + NavTargetResolution(Internal)
             * - UserDefaults
             * - SystemAlias
             */
            NavigationHandler.register();

            /**
             * NWBC specific dirty state handling
             */
            NWBCHandler.register();

            /**
             * Any handlers that are relevant for session handling
             * - User Active / Inactive
             * - Session Timeout
             * - Session Logout
             */
            SessionHandler.register();
        }
    };
});
