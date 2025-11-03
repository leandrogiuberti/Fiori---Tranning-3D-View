sap.ui.define([
	"sap/ui/demoapps/rta/fev4/test/integration/AllJourneys"
], function() {
	"use strict";

	const oUriParameters = new URLSearchParams(window.location.search);
	const sJourney = oUriParameters.get("journey");
	const data = ["RTAJourney", "IFrameJourney", "VariantsJourney"].filter(function (name) {
		return !sJourney || sJourney === name;
	});

	const aJourneys = data.map(function (name) {
		return "sap/ui/demoapps/rta/fev4/test/integration/" + name;
	});

	return new Promise(function (resolve, reject) {
		sap.ui.require(aJourneys, resolve, reject);
	});
});