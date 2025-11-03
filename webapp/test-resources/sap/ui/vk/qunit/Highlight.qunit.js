sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/vk/Highlight",
	"sap/ui/vk/View",
	"sap/ui/vk/threejs/ViewStateManager",
	"sap/ui/vk/threejs/Viewport",
	"sap/ui/vk/threejs/HighlightPlayer",
	"sap/ui/vk/HighlightDisplayState",
	"sap/ui/vk/thirdparty/three",
	"test-resources/sap/ui/vk/qunit/utils/ModuleWithContentConnector"
], function(
	nextUIUpdate,
	jQuery,
	Highlight,
	View,
	ViewStateManager,
	Viewport,
	HighlightPlayer,
	HighlightDisplayState,
	THREE,
	loader
) {
	"use strict";

	var viewStateManager = new ViewStateManager();
	var viewport = new Viewport({ viewStateManager: viewStateManager });
	viewport.placeAt("content");
	nextUIUpdate.runSync();

	QUnit.moduleWithContentConnector("Material", "media/nodes_boxes.json", "threejs.test.json", function(assert) {
		viewport.setContentConnector(this.contentConnector);
		viewStateManager.setContentConnector(this.contentConnector);
	});

	QUnit.test("Highlight", function(assert) {
		var done = assert.async();
		var scene = viewport.getScene();

		var id1 = "1";
		var param1 = {
			duration: 0.0,
			cycles: 0,
			name: "highlight1",
			type: "FadeIn",
			opacities: [0.5, 0.6],
			colours: [[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0]]
		};

		var highlight1 = scene.createHighlight(id1, param1);
		assert.deepEqual(highlight1, scene.getHighlight(id1), "scene createHighlight");

		assert.equal(highlight1._id, id1, "id of static highlight");
		assert.equal(highlight1._duration, 0.0, "duration of highlight");
		assert.equal(highlight1._cycles, 0, "cycles of highlight");
		assert.equal(highlight1._name, "highlight1", "name of highlight");
		assert.deepEqual(highlight1._opacities, [0.5, 0.6], "opacities of highlight");
		assert.deepEqual(highlight1._colours, [[1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0]], "colours of static highlight");
		assert.equal(highlight1._type, "FadeIn", "type of highlight");
		assert.ok(highlight1.isFadeInOut(), "isFadeInOut() of highlight");
		assert.notOk(highlight1.isFadeOut(), "isFadeOut() of highlight");

		highlight1._type = "FadeOut";
		assert.ok(highlight1.isFadeInOut(), "isFadeInOut() of highlight");
		assert.ok(highlight1.isFadeOut(), "isFadeOut() of highlight");

		assert.deepEqual(highlight1.evaluate(3), { isCompleted: true, opacity: 0.5, color: [1.0, 0.0, 0.0, 1.0] }, "static highlight at 3");

		var s1 = scene.removeHighlight(id1);
		assert.equal(s1.getHighlight(id1), undefined, "scene removeHighlight");

		var id2 = "2";
		var highlight2 = scene.createHighlight(id2, {
			name: "highlight2",
			duration: 2.0,
			cycles: 2,
			opacities: [0.5, 1.0],
			colours: [[1.0, 1.0, 1.0, 1.0], [0.5, 0.5, 0.5, 0.5]]
		});

		assert.equal(highlight2._duration, 2.0, "duration of highlight");
		assert.equal(highlight2._cycles, 2, "cycles of highlight");
		assert.equal(highlight2._name, "highlight2", "name of highlight");
		assert.deepEqual(highlight2._opacities, [0.5, 1.0], "opacities of highlight");
		assert.deepEqual(highlight2._colours, [[1.0, 1.0, 1.0, 1.0], [0.5, 0.5, 0.5, 0.5]], "colours  of highlight");
		assert.notOk(highlight2.isFadeInOut(), "isFadeInOut() of highlight");
		assert.notOk(highlight2.isFadeOut(), "isFadeOut() of highlight");

		assert.deepEqual(highlight2.evaluate(0), { isCompleted: false, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "highlight at 0");
		assert.deepEqual(highlight2.evaluate(0.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "highlight at 0.5");
		assert.deepEqual(highlight2.evaluate(1), { isCompleted: false, opacity: 0.5, color: [1.0, 1.0, 1.0, 1.0] }, "highlight at 1");
		assert.deepEqual(highlight2.evaluate(1.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "highlight at 1.5");
		assert.deepEqual(highlight2.evaluate(2), { isCompleted: false, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "highlight at 2");
		assert.deepEqual(highlight2.evaluate(2.25), { isCompleted: false, opacity: 0.875, color: [0.625, 0.625, 0.625, 0.625] }, "highlight at 2.25");
		assert.deepEqual(highlight2.evaluate(2.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "highlight at 2.5");
		assert.deepEqual(highlight2.evaluate(3), { isCompleted: false, opacity: 0.5, color: [1.0, 1.0, 1.0, 1.0] }, "highlight at 3");
		assert.deepEqual(highlight2.evaluate(3.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "highlight at 3.5");
		assert.deepEqual(highlight2.evaluate(4), { isCompleted: true, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "highlight at 4");
		assert.deepEqual(highlight2.evaluate(7), { isCompleted: true, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "highlight at 7");

		highlight2._cycles = 0;

		assert.deepEqual(highlight2.evaluate(0), { isCompleted: false, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "infinite highlight at 0");
		assert.deepEqual(highlight2.evaluate(0.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "infinite highlight at 0.5");
		assert.deepEqual(highlight2.evaluate(1), { isCompleted: false, opacity: 0.5, color: [1.0, 1.0, 1.0, 1.0] }, "infinite highlight at 1");
		assert.deepEqual(highlight2.evaluate(1.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "infinite highlight at 1.5");
		assert.deepEqual(highlight2.evaluate(2), { isCompleted: false, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "infinite highlight at 2");
		assert.deepEqual(highlight2.evaluate(2.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "infinite highlight at 2.5");
		assert.deepEqual(highlight2.evaluate(2.75), { isCompleted: false, opacity: 0.625, color: [0.875, 0.875, 0.875, 0.875] }, "infinite highlight at 2.75");
		assert.deepEqual(highlight2.evaluate(3), { isCompleted: false, opacity: 0.5, color: [1.0, 1.0, 1.0, 1.0] }, "infinite highlight at 3");
		assert.deepEqual(highlight2.evaluate(3.5), { isCompleted: false, opacity: 0.75, color: [0.75, 0.75, 0.75, 0.75] }, "infinite highlight at 3.5");
		assert.deepEqual(highlight2.evaluate(4), { isCompleted: false, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "infinite highlight at 4");
		assert.deepEqual(highlight2.evaluate(7), { isCompleted: false, opacity: 0.5, color: [1.0, 1.0, 1.0, 1.0] }, "infinite highlight at 7");
		assert.deepEqual(highlight2.evaluate(60), { isCompleted: false, opacity: 1.0, color: [0.5, 0.5, 0.5, 0.5] }, "infinite highlight at 60");
		assert.deepEqual(highlight2.evaluate(60.25), { isCompleted: false, opacity: 0.875, color: [0.625, 0.625, 0.625, 0.625] }, "infinite highlight at 60.25");

		highlight2._cycles = 1.5;
		highlight2._colours = [];

		assert.deepEqual(highlight2.evaluate(0), { isCompleted: false, opacity: 1.0 }, "opacity highlight at 0");
		assert.deepEqual(highlight2.evaluate(0.5), { isCompleted: false, opacity: 0.75 }, "opacity highlight at 0.5");
		assert.deepEqual(highlight2.evaluate(1), { isCompleted: false, opacity: 0.5 }, "opacity highlight at 1");
		assert.deepEqual(highlight2.evaluate(1.5), { isCompleted: false, opacity: 0.75 }, "opacity highlight at 1.5");
		assert.deepEqual(highlight2.evaluate(2), { isCompleted: false, opacity: 1.0 }, "opacity highlight at 2");
		assert.deepEqual(highlight2.evaluate(2.25), { isCompleted: false, opacity: 0.875 }, "opacity highlight at 2.25");
		assert.deepEqual(highlight2.evaluate(2.75), { isCompleted: false, opacity: 0.625 }, "opacity highlight at 2.75");
		assert.deepEqual(highlight2.evaluate(3), { isCompleted: true, opacity: 0.5 }, "opacity highlight at 3");
		assert.deepEqual(highlight2.evaluate(3.5), { isCompleted: true, opacity: 0.5 }, "opacity highlight at 3.5");
		assert.deepEqual(highlight2.evaluate(60.25), { isCompleted: true, opacity: 0.5 }, "opacity highlight at 60.25");

		var getNodesWithMeshChildren = function(parent, nodes) {
			if (parent && parent.children && parent.children.length && parent.children[0] instanceof THREE.Mesh) {
				nodes.push(parent);
			}

			if (parent && parent.children && parent.children.length > 0) {
				var oi;
				for (oi = 0; oi < parent.children.length; oi += 1) {
					getNodesWithMeshChildren(parent.children[oi], nodes);
				}
			}
		};

		var nodes = [];
		getNodesWithMeshChildren(scene.getSceneRef(), nodes);

		var view = scene.createView({});
		view.addHighlightedNodes("1", nodes[0]);
		view.addHighlightedNodes("2", nodes[1]);
		view.addHighlightedNodes("3", nodes[2]);
		assert.deepEqual(view.getHighlightIdNodesMap().get("1"), [nodes[0]], "highlighted node1 is inserted into view");
		assert.deepEqual(view.getHighlightIdNodesMap().get("2"), [nodes[1]], "highlighted node1 is inserted into view");
		assert.deepEqual(view.getHighlightIdNodesMap().get("3"), [nodes[2]], "highlighted node1 is inserted into view");

		var player = new HighlightPlayer();
		player.setViewStateManager(scene.getViewStateManager());
		player.reset(view, scene);
		assert.ok(player._highlightsNodesMap.size > 0, "highlight player is reset");

		player.start(500);
		assert.ok(player._state === HighlightDisplayState.playing && player._startTime === 500, "start playing highlight");

		assert.ok(player.play(1000) && player._timeElapsed === 500, "playing highlight");

		player.pause(1500);
		assert.ok(player._state === HighlightDisplayState.pausing && player._timeElapsed === 1000, "pause playing highlight");

		player.start(2500);
		assert.ok(player.play(2500) && player._state === HighlightDisplayState.playing && player._startTime === 1500, "resume playing highlight");

		player.stop();
		assert.ok(!player.play(2500) && player._state === HighlightDisplayState.stopped, "stopped playing highlight");


		done();
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
