/* global QUnit */

sap.ui.define([
	"sap/f/library",
	"sap/ui/integration/widgets/Card",
	"./ListItemCardActionsTests"
], function(
	library,
	Card,
	listItemCardActionsTests
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const SemanticRole = library.cards.SemanticRole;

	QUnit.module("Actions when SemanticRole = ListItem", {
		beforeEach: function () {
			this.oCard = new Card({
				semanticRole: SemanticRole.ListItem,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				action: (oEvent) => {
					oEvent.preventDefault();
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	listItemCardActionsTests();
});
