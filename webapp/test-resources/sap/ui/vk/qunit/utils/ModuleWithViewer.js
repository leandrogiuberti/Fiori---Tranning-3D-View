/**
 * Defines a module that creates an instance of sap.ui.vk.Viewer.
 *
 * If loading a model succeeds the module context contains field called 'viewer'.
 *
 * @example <caption>Example of usage:</caption>
 *
 * <pre>
 *     QUnit.moduleWithViewer("Module name", "a/b/c/something.vds", function(assert) {
 *         this.nodeHierarchy = this.viewer.getScene().getDefaultNodeHierarchy();
 *     });
 * </pre>
 *
 * @param {string} name                 Label for this group of tests.
 * @param {string} url                  URL to load a model from.
 * @param {string} sourceType           Source type of the model.
 * @param {function} onLoadingSucceeded A callback that is called when the model is loaded successfully.
 *                                      The callback takes one parameter 'assert'.
 *                                      The 'this' context is the same as in module hooks.
 */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/vk/dvl/ContentManager",
	"sap/ui/vk/Viewer",
	"sap/ui/vk/ContentConnector",
	"sap/ui/vk/ContentResource",
	"sap/ui/vk/thirdparty/three",
	"test-resources/sap/ui/vk/qunit/utils/MockWebGL"
], function(
	nextUIUpdate,
	DvlContentManager,
	Viewer,
	ContentConnector,
	ContentResource,
	THREE,
	MockWebGL
) {
	"use strict";

	/**
	 * @deprecated As of version 1.120
	 */
	DvlContentManager.setRuntimeSettings({ totalMemory: 16777216 });

	var testLoader = function(parentNode, contentResource) {
		return new Promise(function(resolve, reject) {
			var loader = new THREE.ObjectLoader();
			loader.load(
				contentResource.getSource(),
				function(obj) {
					parentNode.add(obj);
					resolve({
						node: parentNode,
						contentResource: contentResource
					});
				},
				function(xhr) {
				},
				function(xhr) {
					reject(new Error("Not object json"));
				}
			);
		});
	};

	ContentConnector.addContentManagerResolver({
		pattern: "threejs.test.json",
		dimension: 3,
		contentManagerClassName: "sap.ui.vk.threejs.ContentManager",
		settings: {
			loader: testLoader
		}
	});

	QUnit.moduleWithViewer = function(name, url, sourceType, onLoadingSucceeded) {

		QUnit.module(name, {
			beforeEach: async function(assert) {
				return new Promise((resolve, reject) => {
					const viewer = new Viewer({
						width: "100%",
						height: "400px",
						contentResources: [
							new ContentResource({
								source: url,
								sourceType: sourceType,
								sourceId: "abc"
							})
						],
						sceneLoadingFailed: (event) => {
							reject(new Error("Loading model failed."));
						},
						sceneLoadingSucceeded: (event) => {
							assert.ok(true, "Model loaded successfully.");
							this.viewer = viewer;
							if (onLoadingSucceeded) {
								onLoadingSucceeded.call(this, assert);
							}
							resolve();
						}
					}).placeAt("content");
					nextUIUpdate.runSync();
				});
			},

			afterEach: function(assert) {
				if (this.viewer) {
					this.viewer.destroy();
					assert.ok(this.viewer.bIsDestroyed, "Viewer destroyed.");
					delete this.viewer;
				}
			}
		});
	};
});
