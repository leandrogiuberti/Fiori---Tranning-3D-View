// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/EventHub"
], (
    EventBus,
    EventHub
) => {
    "use strict";

    function _init (oController) {
        setTimeout(() => {
            EventBus.getInstance().publish("sap.ushell", "rendererLoaded", { rendererName: "fiori2" });
        }, 0);
        EventHub.emit("RendererLoaded", { rendererName: "fiori2" });
    }
    function _publishExternalEvent (sEventName, oData) {
        setTimeout(() => {
            EventBus.getInstance().publish("sap.ushell.renderers.fiori2.Renderer", sEventName, oData);
        }, 0);
    }

    return {
        publishExternalEvent: _publishExternalEvent,
        init: _init
    };
});
