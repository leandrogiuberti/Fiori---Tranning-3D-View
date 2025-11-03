sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function(Opa5, PropertiesMatcher) {
	"use strict";

	Opa5.createPageObjects({
		onTheBackNavigationPage: {
			viewName: "BackNavigation",
			assertions: {
				iShouldSeeAPageWithTitle: function(title) {
					return this.waitFor({
						controlType: "sap.m.Page",
						matchers: [
							new PropertiesMatcher({
								title: title,
								visible: true
							})
						],
						success: function() {
							Opa5.assert.ok(true, "A page with title " + title + " is shown.");
						}
					});
				}
			}
		}
	});

}, true);
