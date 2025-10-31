// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Button",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/appfinder/PinButtonRenderer"
], (Button, ushellLibrary, PinButtonRenderer) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.appfinder.PinButton
     * @class
     * @extends sap.m.Button
     * @private
     */
    const PinButton = Button.extend("sap.ushell.ui.appfinder.PinButton", /** @lends sap.ushell.ui.appfinder.PinButton.prototype */{
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * Defines whether the button should be highlighted or not.
                 * @since 1.42
                 */
                selected: {
                    type: "boolean",
                    group: "Appearance",
                    defaultValue: false
                }
            }
        },
        renderer: PinButtonRenderer
    });

    PinButton.prototype.onAfterRendering = function () {
        this.$("inner").toggleClass("sapUshellPinSelected", this.getSelected());
    };

    return PinButton;
});
