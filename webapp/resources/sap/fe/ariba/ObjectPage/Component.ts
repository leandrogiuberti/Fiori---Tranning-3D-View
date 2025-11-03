import { defineUI5Class } from "sap/fe/base/ClassSupport";
import ObjectPageComponent from "sap/fe/templates/ObjectPage/Component";
import { OverflowToolbarPriority } from "sap/m/library";

@defineUI5Class("sap.fe.ariba.ObjectPage.Component", {
	library: "sap.fe.ariba",
	manifest: "json"
})
export default class Component extends ObjectPageComponent {
	init(): void {
		// Default settings for Ariba Object Page
		this.breadcrumbsHierarchyMode = this.breadcrumbsHierarchyMode ?? "fullNavigation";
		// FIORITECHP1-33762 Only for Ariba Usage, we set the share overflow priority to always overflow
		this.shareOverflowPriority = OverflowToolbarPriority.AlwaysOverflow;
		super.init();
		// Additional initializations for Ariba ObjectPage specific settings can be added here
	}

	_getControllerName(): string {
		return "sap.fe.ariba.ObjectPage.ObjectPageController";
	}
}
