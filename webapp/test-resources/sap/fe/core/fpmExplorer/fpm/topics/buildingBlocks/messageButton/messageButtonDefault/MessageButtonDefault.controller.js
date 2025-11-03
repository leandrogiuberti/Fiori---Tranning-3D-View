sap.ui.define(
	[
		"sap/fe/core/PageController",
		"sap/ui/core/Messaging",
		"sap/ui/core/message/Message",
		"sap/fe/core/controllerextensions/MessageHandler",
		"sap/m/MessageToast",
		"sap/ui/core/Core"
	],
	function (PageController, Messaging, Message, MessageHandler, MessageToast, Core) {
		"use strict";
		return PageController.extend("sap.fe.core.fpmExplorer.messageButtonDefault.view.Page", {
			_boundMsgBtn: undefined,
			_unBoundMsgBtn: undefined,
			messageHandler: MessageHandler.override({
				beforeShowMessageButton: function (messageDetails) {
					let removeIndex;
					messageDetails.forEach((messageDetail, index) => {
						const message = messageDetail.message;
						if (message.getTargets()[0] === "/Products") {
							const messageStrip = Core.byId("sap.fe.core.fpmExplorer.messageButtonDefault::ProductsDetail--messageStrip");
							messageStrip.setText(message.message);
							messageStrip.setVisible(true);
							removeIndex = index;
						}
						if (message.getTargets()[0] === "/customClick") {
							messageDetail.activeTitleHandler = this.base.customMessageClick;
						}
						if (message.getTargets()[0] === "/Products(ID=2,IsActiveEntity=true)/Title") {
							messageDetail.groupName = "Form";
						}
					});
					messageDetails.splice(removeIndex, 1);
				}
			}),
			customMessageClick(message) {
				MessageToast.show(`message - ${message.getId()} succesfully clicked`);
			},
			onSelect: function (event) {
				this.clearMessages();
				this.getView().getModel("ui").setProperty("/isEditable", event.getParameter("selected"));
			},
			handleMessageButtonVisibility(event) {
				const dynamicPage = Core.byId("sap.fe.core.fpmExplorer.messageButtonDefault::ProductsDetail--Page");
				dynamicPage.setShowFooter(event.getParameter("visible"));
			},
			handleActiveTitlePress(event) {
				const item = event.getParameter("item");
				const itemTitle = item.getTitle();
				MessageToast.show(`"${itemTitle}" succesfully clicked`);
			},
			addBoundMessages(event) {
				this._boundMsgBtn = event.getSource();
				event.getSource().setEnabled(false);
				const messages = [
					new Message({
						message: "The Form has errors",
						type: "Error",
						target: ["/Products"]
					}),
					new Message({
						message: "This is another bound message",
						type: "Error",
						target: ["/Products(ID=2,IsActiveEntity=true)/Title"],
						// In a setup where the message is coming from the backend the processor does not need to be mentioned
						// We will improve this in the next commits.
						processor: this.getView().getModel()
					}),
					new Message({
						message: "Bound message for custom click handling",
						type: "Warning",
						target: ["/customClick"]
					}),
					new Message({
						message: "This is yet another bound message",
						type: "Information",
						target: ["/target1", "/target2"]
					}),
					new Message({
						message: "This is again a bound message",
						type: "Success",
						target: ["/target1", "/target2"]
					})
				];
				Messaging.addMessages(messages);
			},
			clearMessages() {
				const messageStrip = Core.byId("sap.fe.core.fpmExplorer.messageButtonDefault::ProductsDetail--messageStrip");
				messageStrip.setText("");
				messageStrip.setVisible(false);
				if (this._boundMsgBtn) {
					this._boundMsgBtn.setEnabled(true);
				}
				if (this._unBoundMsgBtn) {
					this._unBoundMsgBtn.setEnabled(true);
				}
				Messaging.removeAllMessages();
			},
			addUnBoundMessages(event) {
				this._unBoundMsgBtn = event.getSource();
				event.getSource().setEnabled(false);
				const messages = [
					new Message({
						message: "This is an unbound message",
						type: "Error"
					}),
					new Message({
						message: "This is another unbound message",
						type: "Error"
					}),
					new Message({
						message: "This is also an unbound message",
						type: "Warning"
					}),
					new Message({
						message: "This is yet another unbound message",
						type: "Information"
					}),
					new Message({
						message: "This is again an unbound message",
						type: "Success"
					})
				];
				Messaging.addMessages(messages);
			}
		});
	}
);
