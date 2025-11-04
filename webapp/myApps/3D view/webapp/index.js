sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"com/example/fiorilist/localService/mockserver"
], function (ComponentContainer, mockserver) {
	"use strict";

	// Initialize the mock server before creating the component
	mockserver.init().then(() => {
		new ComponentContainer({
			name: "com.example.fiorilist",
			settings: {
				id: "fiorilist"
			},
			async: true
		}).placeAt("content");
	});
});
