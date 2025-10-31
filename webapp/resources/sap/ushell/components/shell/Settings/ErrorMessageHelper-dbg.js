// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Messaging"
], (Messaging) => {
    "use strict";
    const sUserSettingsErrorDialogTarget = "sapUshellSettingsDialog/";

    /**
     * Add a message to the MessageManager with the correct target
     *
     * @param {sap.ui.core.message.Message} message The message to be added
     * @private
     */
    function addMessage (message) {
        message.setTargets([sUserSettingsErrorDialogTarget]);
        Messaging.addMessages(message);
    }

    /**
     * Filter messages of the MessageManager based on the target
     *
     * @returns {object[]} An array of messages to be displayed
     * @private
     */
    function filterMessagesToDisplay () {
        return Messaging.getMessageModel().getData().filter((oMessage) => {
            return oMessage.getTargets() && oMessage.getTargets().indexOf(sUserSettingsErrorDialogTarget) === 0;
        });
    }

    /**
     * Remove messages from the MessageManager based on the target
     *
     * @private
     */
    function removeErrorMessages () {
        Messaging.getMessageModel().getData().forEach((oMessage) => {
            if (oMessage.getTargets() && oMessage.getTargets().indexOf(sUserSettingsErrorDialogTarget) === 0) {
                Messaging.removeMessages(oMessage);
            }
        });
    }

    return {
        addMessage: addMessage,
        filterMessagesToDisplay: filterMessagesToDisplay,
        removeErrorMessages: removeErrorMessages
    };
});
