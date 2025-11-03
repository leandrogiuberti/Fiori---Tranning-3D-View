/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import mobileLibrary from "sap/m/library";
import coreLibrary from "sap/ui/core/library";
import Extension from "sap/ui/integration/Extension";

const ValueState = coreLibrary.ValueState;
const ValueColor = mobileLibrary.ValueColor;
const formatCriticality = (sCriticality: string, sType: string): string | undefined => {
	if (sType === "state") {
		switch (String(sCriticality)) {
			case "1":
			case "Error":
				return ValueState.Error;
			case "2":
			case "Warning":
				return ValueState.Warning;
			case "3":
			case "Success":
				return ValueState.Success;
			default:
				return ValueState.None;
		}
	}
	if (sType === "color") {
		switch (String(sCriticality)) {
			case "1":
			case "Error":
				return ValueColor.Error;
			case "2":
			case "Critical":
				return ValueColor.Critical;
			case "3":
			case "Good":
				return ValueColor.Good;
			default:
				return ValueColor.Neutral;
		}
	}
};

export default class CardExtension extends Extension {
	init(): void {
		Extension.prototype.setFormatters.apply(this, [
			{
				formatCriticality: formatCriticality
			}
		]);
	}
}
