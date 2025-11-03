sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function(Opa5, PropertiesMatcher) {

	"use strict";
	return Opa5.extend("sap.suite.ui.commons.demo.tutorial.test.integration.arrangements.StartUp", {	

		iStartMyApp: function() {
			return this.iStartMyAppInAFrame("../index.html");
		},
		iNavigateToPageViaTileWithStateAndSize: function(state, size) {
			return this.waitFor({
				controlType: "sap.m.GenericTile",
				matchers: [
					new PropertiesMatcher({
						state: state,
						frameType: size
					})
				],
				success: function(tiles) {
					tiles[0].$().trigger("tap");
				}
			});
		}
	});
}, true);
