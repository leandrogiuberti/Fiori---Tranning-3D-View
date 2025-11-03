// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * Mocks drag/drop functionality
 * This only works for ui5/ jquery event handler and not for addEventListener
 */
sap.ui.define([
    "sap/ui/test/actions/Action",
    "sap/ui/core/dnd/DragAndDrop",
    "sap/ui/thirdparty/jquery"
], (
    Action,
    DragAndDrop,
    jQuery
) => {
    "use strict";

    return Action.extend("sap.ushell.opa.actions.DragDropBase", {
        metadata: {
            properties: {
                eventType: {
                    type: "string",
                    defaultValue: false
                },
                triggerEventType: {
                    type: "string",
                    defaultValue: false
                }
            }
        },

        executeOn: function (oTargetControl) {
            const sEventType = this.getEventType();
            const sTriggerEventType = this.getTriggerEventType();

            // mimics the behavior of focusing the target control when starting a drag (since pressing on an element focuses it)
            if (document.activeElement && (document.activeElement !== oTargetControl.getFocusDomRef()) && (sEventType === "dragstart")) {
                oTargetControl.focus();
            }

            const oEvent = this._createJqueryEventDummy(sEventType, oTargetControl);
            DragAndDrop.preprocessEvent(oEvent);

            oTargetControl.$().trigger(sTriggerEventType || oEvent); // "sTriggerEventType" is optional

            return oEvent;
        },

        _createJqueryEventDummy (sEventType, oTargetControl) {
            const oEvent = new jQuery.Event(sEventType);
            oEvent.target = oTargetControl.getDomRef();
            oEvent.originalEvent = this._createNativeEventDummy(sEventType);
            return oEvent;
        },

        _createNativeEventDummy (sEventType) {
            const oEvent = document.createEvent("Event");
            oEvent.initEvent(sEventType, true, true); // bubbles and cancelable both set to true
            oEvent.dataTransfer = {
                types: [],
                dropEffect: "",
                setData: function () {}
            };
            return oEvent;
        }
    });
});
