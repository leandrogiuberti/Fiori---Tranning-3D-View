// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Defines the interface for UserSettingsEntry.
 *
 * This interface does NOT work when called from within a iframe.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/EventHub"
], (
    EventHub
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.FrameBoundExtension.UserSettingsEntry
     * @class
     * @classdesc The UserSettingsEntry defines an entry in the user settings dialog.
     * To be instantiated by {@link sap.ushell.services.FrameBoundExtension}.
     *
     * <p><b>Restriction:</b> Does not work when called from within an iframe.
     * The calling function has to be in the 'same frame' as the launchpad itself.</p>
     *
     * @hideconstructor
     *
     * @since 1.134.0
     * @public
     */
    class UserSettingsEntry {
        #id = null;

        /**
         * The Constructor
         *
         * @param {string} sId The id of the user settings entry.
         * @since 1.134.0
         * @public
         */
        constructor (sId) {
            this.#id = sId;
        }

        /**
         * Opens the user settings entry.
         *
         * The dialog is opened and then navigated to the new entry.
         * If a group is available, the function navigates to the group and entry (tab).
         *
         * @since 1.134.0
         * @public
         */
        open () {
            EventHub.emit("openUserSettings", {
                targetEntryId: this.#id,
                time: Date.now()
            });
        }
    }

    return UserSettingsEntry;
}, true);
