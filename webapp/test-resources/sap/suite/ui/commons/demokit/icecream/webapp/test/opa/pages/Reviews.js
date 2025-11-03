sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], function(Opa5, PropertiesMatcher) {

	"use strict";

	Opa5.createPageObjects({
		onTheReviewsPage: {
			viewName: "Reviews",
			actions: {
				iPressOnATileWithStateAndSize: function(state, size) {
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
				},
				iPressOnTheButtonWithId: function(id) {
					this.waitFor({
						controlType: "sap.m.Button",
						id: id,
						success: function(buttons) {
							Opa5.assert.equal(buttons.length, 1, "Exactly one button for back navigation found");
							buttons[0].$().trigger("tap");
						}
					});
				}
			},
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
