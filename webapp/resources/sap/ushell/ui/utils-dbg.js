// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
//
/**
 * @fileOverview
 *
 * This is a utility module that collects common activities implemented
 * by controllers of different ui components.
 *
 * @version 1.141.1
 * @private
 */

sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ui/thirdparty/jquery"
], (EventHub, jQuery) => {
    "use strict";

    /**
     * Saves preferences a user expressed on multiple preference objects.
     *
     * @param {object[]} aEntries
     * The holders of user preferences. These are objects, with at least two
     * methods:
     * <pre>
     *    {
     *        onSave: function () { ... },
     *        title: "Title"
     *    }
     * </pre>
     * These entries might have been modified (opened) or not by the user.
     *
     * @listens UserSettingsOpened
     *
     * An object indicating the position in the array of the aPreferenceKeeper
     * that must be saved, expressed as an object like:
     * {
     *    0: true,
     *    2: false,
     *    3: true,
     *    4: true
     * }
     *
     * @fires UserSettingsOpened
     *
     * A <code>null</code> value after the user settings have been processed,
     * regardless of whether the save operation terminated successfully.
     *
     * @returns {jQuery.Promise} Resolved with no arguments when the saving
     * process is completed and rejected with an error message in case at least
     * one of the preferences is not saved.
     *
     * @private
     */
    function saveUserPreferenceEntries (aEntries) {
        const resultDeferred = new jQuery.Deferred();
        let currentPromise;
        let totalPromisesCount = 0;
        let failureCount = 0;
        let successCount = 0;
        const promiseArray = [];
        const aFailedMessages = [];
        let currEntryTitle;
        const oAfterSave = {
            refresh: false
        };

        function onSaveDone (params) {
            if (params && params.refresh === true) {
                oAfterSave.refresh = true;
            }
            successCount++;
            resultDeferred.notify();
        }

        function onSaveFail (oError) {
            aFailedMessages.push({
                entry: currEntryTitle,
                message: oError
            });
            failureCount++;
            resultDeferred.notify();
        }

        const oUserSettingsEntriesToSave = EventHub.last("UserSettingsOpened") || {};
        Object.keys(oUserSettingsEntriesToSave).forEach((sIndex) => {
            const iIndex = parseInt(sIndex, 10);
            currentPromise = aEntries[iIndex].onSave();
            currentPromise.done(onSaveDone);
            currEntryTitle = aEntries[iIndex].title;
            currentPromise.fail(onSaveFail);
            promiseArray.push(currentPromise);// save function return jQuery Promise
            totalPromisesCount++;
        });

        const whenPromise = jQuery.when.apply(null, promiseArray);

        whenPromise.done(() => {
            EventHub.emit("UserSettingsOpened", null);
            resultDeferred.resolve(oAfterSave);
        });

        resultDeferred.progress(() => {
            if (failureCount > 0 && (failureCount + successCount === totalPromisesCount)) {
                resultDeferred.reject(aFailedMessages);
            }
        });

        return resultDeferred.promise();
    }

    return {
        saveUserPreferenceEntries: saveUserPreferenceEntries
    };
});
