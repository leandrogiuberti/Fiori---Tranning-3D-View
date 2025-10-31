// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/ControlBehavior",
    "sap/ui/core/CustomData"
], (ControlBehavior, CustomData) => {
    "use strict";

    const AccessibilityCustomData = CustomData.extend("sap.ushell.ui.launchpad.AccessibilityCustomData", {
        metadata: {
            library: "sap.ushell"
        }
    });

    AccessibilityCustomData.prototype._checkWriteToDom = function () {
        if (!ControlBehavior.isAccessibilityEnabled()) {
            return null;
        }

        const sKey = this.getKey();
        const oCheckResult = CustomData.prototype._checkWriteToDom.apply(this, arguments);
        if (oCheckResult && (sKey.indexOf("aria-") === 0 || sKey === "role" || sKey === "tabindex")) {
            oCheckResult.key = oCheckResult.key.replace(/^data-/, "");
        }
        return oCheckResult;
    };

    return AccessibilityCustomData;
});
