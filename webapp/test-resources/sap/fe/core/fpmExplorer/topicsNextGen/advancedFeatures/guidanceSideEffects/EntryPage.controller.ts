import PageController from "sap/fe/core/PageController";

export default PageController.extend("sap.fe.core.fpmExplorer.guidanceSideEffects.EntryPage", {
	onPress: function (oEvent: any) {
		(this as any).editFlow.invokeAction("sap.fe.core.Service.increaseAndCheckPrime", {
			contexts: oEvent.getSource().getBindingContext()
		});
	},

	onAddRound: function (oEvent: any) {
		(this as any).editFlow.invokeAction("sap.fe.core.Service.addRound", {
			contexts: oEvent.getSource().getBindingContext(),
			invocationGrouping: "ChangeSet"
		});
	},

	onUnBoundAction: function (oEvent: any) {
		(this as any).editFlow.invokeAction("sap.fe.core.Service.EntityContainer/unBoundAction", {
			model: oEvent.getSource().getModel(),
			invocationGrouping: "ChangeSet"
		});
	},

	onStartRound: function (oEvent: any) {
		this.onClearRounds(oEvent);
		this.onAddRound(oEvent);
	},

	onStopRound: function (oEvent: any) {
		(this as any).editFlow.invokeAction("sap.fe.core.Service.stopRound", {
			contexts: oEvent.getSource().getBindingContext()
		});
	},

	onClearRounds: function (oEvent: any) {
		(this as any).editFlow.invokeAction("sap.fe.core.Service.clearRounds", {
			contexts: oEvent.getSource().getBindingContext(),
			invocationGrouping: "ChangeSet"
		});
	},

	onDeleteBusinessPartner: function (oEvent: any) {
		(this as any).editFlow.invokeAction("sap.fe.core.Service.deleteBusinessPartner", {
			contexts: oEvent.getSource().getBindingContext()
		});
	}
});
