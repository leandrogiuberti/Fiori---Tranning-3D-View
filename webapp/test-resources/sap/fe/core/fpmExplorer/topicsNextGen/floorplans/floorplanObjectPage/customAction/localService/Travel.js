module.exports = {
	executeAction: async function (actionDefinition, actionData, keys, odataRequest) {
		console.log("Method is called: " + actionDefinition.name);

		if (actionDefinition.name === "CopyAction") {
			odataRequest.addMessage(0, "Copy action clicked ", 2, "");
		} else if (actionDefinition.name === "ShareAction") {
			odataRequest.addMessage(0, "Share action clicked", 2, "");
		} else if (actionDefinition.name === "CheckStatusAction") {
			odataRequest.addMessage(0, "Check Status action clicked", 2, "");
		}
		return undefined;
	}
};
