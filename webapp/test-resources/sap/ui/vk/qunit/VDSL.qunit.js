sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"test-resources/sap/ui/vk/qunit/utils/ModuleWithContentConnector",
	"test-resources/sap/ui/vk/qunit/utils/MockDvl"
], function(
	jQuery,
	loader,
	MockDvl
) {
	"use strict";

	MockDvl([{
		Source: "media/nodes_boxes.vds",
		SceneId: "scene1",
		Nodes: [
			{ id: "n1", NodeName: "colorBox", Opacity: 0.3, ChildNodes: [] },
			{ id: "n2", NodeName: "smallBox", ChildNodes: [] }
		]
	}]);

	QUnit.moduleWithContentConnector("VDSL", "media/box.vdsl", "vdsl", function(assert) {
		this.nodeHierarchy = this.contentConnector.getContent().getDefaultNodeHierarchy();
	});

	/**
	 * @deprecated
	 */
	QUnit.test("VDSL", function(assert) {
		var colorBoxNodeRefs = this.nodeHierarchy.findNodesByName({ value: "colorBox" });
		var smallBoxNodeRefs = this.nodeHierarchy.findNodesByName({ value: "smallBox" });

		assert.equal(colorBoxNodeRefs.length, 1, "colorBox is found");
		assert.equal(smallBoxNodeRefs.length, 1, "smallBox is found");

		var colorBoxNodeProxy = this.nodeHierarchy.createNodeProxy(colorBoxNodeRefs[0]);
		assert.equal(colorBoxNodeProxy.getOpacity(), 0.3, "n1 opacity is 0.3");
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
