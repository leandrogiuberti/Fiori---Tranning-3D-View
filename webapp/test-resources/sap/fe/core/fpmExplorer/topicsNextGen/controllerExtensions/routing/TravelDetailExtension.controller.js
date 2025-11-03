sap.ui.define(
	["sap/ui/core/mvc/ControllerExtension", "sap/ui/core/message/Message", "sap/ui/core/message/MessageType"],
	function (ControllerExtension, Message, MessageType) {
		"use strict";
		return ControllerExtension.extend("sap.fe.core.fpmExplorer.routing.TravelDetailExtension", {
			// this section allows to extend lifecycle hooks or override public methods of the base controller
			override: {
				routing: {
					onAfterBinding: function (bindingContext) {
						const extensionApi = this.base.getExtensionAPI();
						bindingContext.requestObject("TravelStatus_code").then(function (travelStatusCode) {
							if (travelStatusCode === "A") {
								const message = [
									new Message({
										message: "The flights for this travel were confirmed by the agency.",
										type: MessageType.Success
									})
								];
								extensionApi.showMessages(message);
							}
						});
					}
				}
			}
		});
	}
);
