import { defineUI5Class } from "sap/fe/base/ClassSupport";
import BaseListReportController from "sap/fe/templates/ListReport/ListReportController.controller";

@defineUI5Class("sap.fe.ariba.ListReport.ListReportController")
class ListReportController extends BaseListReportController {
	// Indicate that this is an extension of the base controller, this is used for the page controller to know those method need to be wrapped with the owner call
	_isExtension(): boolean {
		return true;
	}
}

export default ListReportController;
