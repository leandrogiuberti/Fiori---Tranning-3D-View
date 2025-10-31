import { defineUI5Class } from "sap/fe/base/ClassSupport";
import BaseObjectPageController from "sap/fe/templates/ObjectPage/ObjectPageController.controller";

@defineUI5Class("sap.fe.ariba.ObjectPage.ObjectPageController")
class ObjectPageController extends BaseObjectPageController {
	// Indicate that this is an extension of the base controller, this is used for the page controller to know those method need to be wrapped with the owner call
	_isExtension(): boolean {
		return true;
	}
}

export default ObjectPageController;
