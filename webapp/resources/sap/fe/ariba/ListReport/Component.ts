import { defineUI5Class } from "sap/fe/base/ClassSupport";
import ListReportComponent from "sap/fe/templates/ListReport/Component";
import { OverflowToolbarPriority } from "sap/m/library";

@defineUI5Class("sap.fe.ariba.ListReport.Component", {
	library: "sap.fe.ariba",
	manifest: "json"
})
export default class Component extends ListReportComponent {
	init(): void {
		// Default settings for Ariba List Report
		this.breadcrumbsHierarchyMode = this.breadcrumbsHierarchyMode ?? "fullNavigation";
		// FIORITECHP1-33762 Only for Ariba Usage, we set the share overflow priority to always overflow
		this.shareOverflowPriority = OverflowToolbarPriority.AlwaysOverflow;
		super.init();
		// Additional initializations for Ariba List Report specific settings can be added here
	}

	_getControllerName(): string {
		return "sap.fe.ariba.ListReport.ListReportController";
	}
}
