import { aggregation, defineUI5Class, property } from "sap/fe/base/ClassSupport";
import type Control from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";

@defineUI5Class("sap.fe.core.fpmExplorer.controls.ImplementationStep")
export default class ImplementationStep extends UI5Element {
	// The title of the implementation step
	@property({ type: "string" })
	title?: string;

	// The description of the implementation step
	@property({ type: "string" })
	text?: string;

	// As an alternative to the description text, we can use a control. Only use this if text is not enough
	@aggregation({ type: "sap.ui.core.Control" })
	textContent?: Control[];

	// Code Block showing the implementation of the step
	@aggregation({ type: "sap.ui.core.Control", isDefault: true })
	implementation?: Control[];
}
