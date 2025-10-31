import { defineUI5Class, extensible, finalExtension, publicExtension } from "sap/fe/base/ClassSupport";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type PageController from "sap/fe/core/PageController";
import type SelectionVariant from "sap/fe/navigation/SelectionVariant";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";

/**
 * Controller extension providing hooks for intent-based navigation
 * {@link demo:sap/fe/core/fpmExplorer/index.html#/controllerExtensions/intentBasedNavigation Overview of Building Blocks}
 * @hideconstructor
 * @public
 * @since 1.86.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.IntentBasedNavigation")
class IntentBasedNavigation extends ControllerExtension {
	base!: PageController;

	/**
	 * Provides a hook to customize the {@link sap.fe.navigation.SelectionVariant} related to the intent-based navigation.
	 * @param _oSelectionVariant SelectionVariant provided by SAP Fiori elements.
	 * @param _oNavigationInfo Object containing intent-based navigation-related info
	 * @param _oNavigationInfo.semanticObject Semantic object related to the intent
	 * @param _oNavigationInfo.action Action related to the intent
	 * @public
	 * @since 1.86.0
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	adaptNavigationContext(_oSelectionVariant: SelectionVariant, _oNavigationInfo: { semanticObject: string; action: string }): void {
		// to be overriden by the application
	}

	/**
	 * Navigates to an intent defined by an outbound definition in the manifest.
	 * @param sOutbound Identifier to locate the outbound definition in the manifest.
	 * This provides the semantic object and action for the intent-based navigation.
	 * Additionally, the outbound definition can be used to provide parameters for intent-based navigation.
	 * See {@link topic:be0cf40f61184b358b5faedaec98b2da Descriptor for Applications, Components, and Libraries} for more information.
	 * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent.
	 * If mNavigationParameters are provided, the parameters provided in the outbound definition of the manifest are ignored.
	 * @public
	 * @since 1.86.0
	 */
	@finalExtension()
	@publicExtension()
	navigateOutbound(sOutbound: string, mNavigationParameters?: Record<string, unknown>): void {
		const oInternalModelContext = this.base?.getView().getBindingContext("internal") as InternalModelContext;
		oInternalModelContext.setProperty("externalNavigationContext", { page: false });
		this.base?._intentBasedNavigation.navigateOutbound(sOutbound, mNavigationParameters);
	}
}

export default IntentBasedNavigation;
