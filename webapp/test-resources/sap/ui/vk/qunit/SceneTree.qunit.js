sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"test-resources/sap/ui/vk/qunit/utils/ModuleWithViewer",
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
			{ id: "n1", NodeName: "Box #5", ChildNodes: ["n2"], Flags: sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE },
			{ id: "n2", NodeName: "Box #6", ChildNodes: [], Flags: sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE }
		]
	}]);

	QUnit.moduleWithViewer("SceneTree", "media/nodes_boxes.vds", "vds", function(assert) {
	});

	QUnit.test("Init method", function(assert) {
		var done = assert.async();

		var sceneTree = this.viewer.getSceneTree();
		var data = sceneTree.getTreeTable().getContextByIndex(0).getModel().getData();
		assert.equal(data[0].visible, true, "The root node visibility is set to true.");
		assert.equal(data[0].children[0].name, "Box #6", "The first child of root node is named 'Box #6'");
		assert.equal(data[0].children[0].visible, true, "The first child of root node is visible.");
		assert.equal(sceneTree.getTreeTable().getColumnHeaderHeight(), 32, "The initial column header height is 32.");
		assert.ok(sceneTree.getVisible(), "The scene tree should be visible");

		done();
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
