import type { CompiledBindingToolkitExpression } from "sap/fe/base/BindingToolkit";
import BuildingBlockBase from "sap/fe/base/BuildingBlockBase";
import { defineUI5Class, implementInterface, property } from "sap/fe/base/ClassSupport";
import type Control from "sap/ui/core/Control";

/**
 * Building block to wrap a FlexBox and expose a required property.
 * @private
 */
@defineUI5Class("sap.fe.macros.controls.RequiredFlexBox")
export default class RequiredFlexBox extends BuildingBlockBase<Control> {
	@implementInterface("sap.ui.core.IFormContent")
	__implements__sap_ui_core_IFormContent = true;

	@property({ type: "string" })
	id?: string;

	@property({ type: "boolean" })
	required?: boolean | CompiledBindingToolkitExpression;
}
