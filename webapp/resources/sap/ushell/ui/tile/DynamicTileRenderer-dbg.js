// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Renderer",
    "sap/ui/core/format/NumberFormat",
    "sap/ushell/library",
    "sap/ushell/ui/tile/TileBaseRenderer",
    "sap/ushell/resources"
], (
    Renderer,
    NumberFormat,
    ushellLibrary,
    TileBaseRenderer,
    ushellResources
) => {
    "use strict";

    const State = ushellLibrary.ui.tile.State;
    const StateArrow = ushellLibrary.ui.tile.StateArrow;

    /**
     * @alias sap.ushell.ui.tile.DynamicTileRenderer.
     * @static
     * @private
     */
    const DynamicTileRenderer = Renderer.extend(TileBaseRenderer);

    // apiVersion needs to be set explicitly (it is not inherited)
    DynamicTileRenderer.apiVersion = 2;

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    DynamicTileRenderer.renderPart = function (oRm, oControl) {
        const numValue = oControl.getNumberValue();
        let numberFactor = oControl.getNumberFactor();
        let displayNumber = numValue.toString();
        // we have to crop numbers to prevent overflow.
        // max characters without icon is 5, with icon 4.
        const maxCharactersInDisplayNumber = oControl.getIcon() ? 4 : 5;
        // check if we need to process the number of digits in case of a decimal value
        const bShouldProcessDigits = this._shouldProcessDigits(displayNumber, oControl);
        if (displayNumber.length > maxCharactersInDisplayNumber || bShouldProcessDigits) {
            const oNormalizedNumberData = this._normalizeNumber(numValue, maxCharactersInDisplayNumber, numberFactor, oControl);
            numberFactor = oNormalizedNumberData.numberFactor;
            displayNumber = oNormalizedNumberData.displayNumber;
        } else if (displayNumber !== "") {
            const oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: maxCharactersInDisplayNumber });
            displayNumber = oNForm.format(numValue);
        }
        // write the HTML into the render manager
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTile");
        oRm.openEnd();

        // dynamic data
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileData");
        oRm.class(State[oControl.getNumberState()] ? `sapUshellDynamicTileData${oControl.getNumberState()}` :
            `sapUshellDynamicTileData${State.Neutral}`);
        oRm.openEnd();

        // sapUshellDynamicTileIndication that includes Arrow and number factor
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileIndication");
        oRm.openEnd();

        // state arrow
        if (StateArrow[oControl.getStateArrow()]) {
            oRm.openStart("div");
            oRm.class("sapUshellDynamicTileStateArrow");
            oRm.class(`sapUshellDynamicTileData${StateArrow[oControl.getStateArrow()]}`);
            oRm.openEnd();
            oRm.close("div");
        }

        // unit
        oRm.voidStart("br");
        oRm.voidEnd(); // br was added in order to solve the issue of all the combination of presentation options between Number - Arrow - Unit
        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileNumberFactor");
        oRm.accessibilityState(oControl, { label: ushellResources.i18n.getText("TileUnits_lable") + numberFactor });
        oRm.openEnd();
        oRm.text(numberFactor);
        oRm.close("div");

        // closeing the sapUshellDynamicTileIndication scope
        oRm.close("div");

        oRm.openStart("div");
        oRm.class("sapUshellDynamicTileNumber");
        if (displayNumber && displayNumber !== "") {
            oRm.accessibilityState(oControl, {
                label: ushellResources.i18n.getText("TileValue_lable") + displayNumber
            });
            oRm.openEnd();
            oRm.text(displayNumber);
        } else {
            // in case numberValue is a String
            oRm.openEnd();
            oRm.text(oControl.getNumberValue());
        }
        oRm.close("div");

        // end of dynamic data
        oRm.close("div");

        // span element
        oRm.close("div");
    };

    DynamicTileRenderer._normalizeNumber = function (numValue, maxCharactersInDisplayNumber, numberFactor, oControl) {
        let number;
        if (isNaN(numValue)) {
            number = numValue;
        } else {
            const oNForm = NumberFormat.getFloatInstance({ maxFractionDigits: oControl.getNumberDigits() });

            if (!numberFactor) {
                const absNumValue = Math.abs(numValue);
                if (absNumValue >= 1000000000) {
                    numberFactor = "B";
                    numValue /= 1000000000;
                } else if (absNumValue >= 1000000) {
                    numberFactor = "M";
                    numValue /= 1000000;
                } else if (absNumValue >= 1000) {
                    numberFactor = "K";
                    numValue /= 1000;
                }
            }
            number = oNForm.format(numValue);
        }

        let displayNumber = number;
        // we have to crop numbers to prevent overflow
        const cLastAllowedChar = displayNumber[maxCharactersInDisplayNumber - 1];
        // if last character is '.' or ',', we need to crop it also
        maxCharactersInDisplayNumber -= (cLastAllowedChar === "." || cLastAllowedChar === ",") ? 1 : 0;
        displayNumber = displayNumber.substring(0, maxCharactersInDisplayNumber);

        return {
            displayNumber: displayNumber,
            numberFactor: numberFactor
        };
    };

    DynamicTileRenderer._shouldProcessDigits = function (sDisplayNumber, oControl) {
        const nDigitsToDisplay = oControl.getNumberDigits(); let nNumberOfDigits;
        if (sDisplayNumber.indexOf(".") !== -1) {
            nNumberOfDigits = sDisplayNumber.split(".")[1].length;
            if (nNumberOfDigits > nDigitsToDisplay) {
                return true;
            }
        }
        return false;
    };

    DynamicTileRenderer.getInfoPrefix = function (oControl) {
        return oControl.getNumberUnit();
    };

    return DynamicTileRenderer;
});
