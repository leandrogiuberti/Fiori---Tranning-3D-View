sap.ui.define([
	"sap/ui/demoapps/rta/freestyle/test/integration/AllJourneys"
], function() {
	"use strict";

	const oUriParameters = new URLSearchParams(window.location.search);
	const sJourney = oUriParameters.get("journey");
	const data = [
		"ProductMasterJourney",
		"NotFoundJourney",
		"RTAJourney",
		"ChangeVisualizationJourney",
		"IFrameJourney"
	].filter(function (name) {
		return !sJourney || sJourney === name;
	});

	const aJourneys = data.map(function (name) {
		return "sap/ui/demoapps/rta/freestyle/test/integration/journeys/" + name;
	});

	return new Promise(function (resolve, reject) {
		sap.ui.require(aJourneys, resolve, reject);
	});
});