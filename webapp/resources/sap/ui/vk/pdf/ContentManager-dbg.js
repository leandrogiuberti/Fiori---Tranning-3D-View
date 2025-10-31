/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"../ContentManager",
	"../getResourceBundle",
	"../svg/Element",
	"../svg/HotspotHelper",
	"../svg/Scene",
	"../svg/SceneBuilder",
	"./Document",
	"./Utils",
	// The following modules are pulled in to avoid their synchronous loading in
	// `sap.ui.vk.Viewport` and `sap.ui.vk.ViewStateManager`. They go last in this list
	// to avoid declaration of unused parameters in the callback.
	"./Viewport",
	"./ViewStateManager"
], (
	Log,
	ContentManagerBase,
	getResourceBundle,
	Element,
	HotspotHelper,
	Scene,
	SceneBuilder,
	Document,
	Utils
) => {
	"use strict";

	/**
	 * Constructor for a new ContentManager.
	 *
	 * @class
	 * Provides a content manager object for loading PDF content.
	 *
	 * @param {string} [sId] ID for the new ContentManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ContentManager object.
	 * @private
	 * @author SAP SE
	 * @version 1.141.0
	 * @extends sap.ui.vk.ContentManager
	 * @alias sap.ui.vk.pdf.ContentManager
	 * @since 1.123.0
	 */
	const ContentManager = ContentManagerBase.extend("sap.ui.vk.pdf.ContentManager", /** @lends sap.ui.vk.pdf.ContentManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	ContentManager.prototype.loadContent = function(content, contentResources) {
		this.fireContentChangesStarted();

		if (contentResources.length !== 1) {
			// The `contentChangesFinished` event must be fired asynchronously.
			setTimeout(() => {
				this.fireContentChangesFinished({
					content: null,
					failureReason: {
						errorMessage: getResourceBundle().getText("PDFCONTENTMANAGER_ONLY_LOAD_SINGLE_PDF")
					}
				});
			}, 0);
		} else if (contentResources[0].getContentResources().length > 0) {
			// The `contentChangesFinished` event must be fired asynchronously.
			setTimeout(() => {
				this.fireContentChangesFinished({
					content: null,
					failureReason: {
						errorMessage: getResourceBundle().getText("PDFCONTENTMANAGER_CANNOT_LOAD_PDF_HIERARCHY")
					}
				});
			}, 0);
		} else {
			(async () => {
				try {
					const contentResource = contentResources[0];

					// We can load the PDF content, hotspots and extra modules in parallel.
					const [pdfjsDocument, sceneJson] = await Promise.all([
						this._loadDocument(contentResource),
						this._loadHotspots(contentResource),
						this._loadExtraModules()
					]);

					const scene = this._buildSvgScene(contentResource, sceneJson);

					const pdfDocument = new Document(pdfjsDocument, scene);

					this.fireContentChangesFinished({ content: pdfDocument });
				} catch (e) {
					Log.error("Failed to load PDF content", e);
					this.fireContentChangesFinished({
						content: null,
						failureReason: {
							errorMessage: getResourceBundle().getText("PDFCONTENTMANAGER_FAILED_TO_LOAD_PDF", [e.message])
						}
					});
				}
			})();
		}

		return this;
	};

	ContentManager.prototype.destroyContent = function(content) {
		if (content instanceof Document) {
			content.destroy();
		}
		return this;
	};

	ContentManager.prototype._loadDocument = async function(contentResource) {
		const documentInitParameters = {};

		let source = contentResource.getSource();

		if (typeof source === "string") {
			const veid = contentResource.getVeid() ?? "";
			if (veid !== "") {
				if (!source.endsWith("/")) {
					source += "/";
				}
				source += `scenes/${veid}/pdf`;
			}
			documentInitParameters.url = source;
		} else if (source instanceof File) {
			documentInitParameters.data = await new Promise((resolve, reject) => {
				const fileReader = new FileReader();
				fileReader.onload = (event) => resolve(event.target.result);
				fileReader.onerror = (event) => reject(event.target.error);
				fileReader.readAsArrayBuffer(source);
			});
		} else {
			throw new Error(getResourceBundle().getText("PDFCONTENTMANAGER_SOURCE_TYPE_NOT_SUPPORTED"));
		}

		const pdfjsLib = await Utils.loadPdfjsLib();

		return await pdfjsLib.getDocument(documentInitParameters).promise;
	};

	ContentManager.prototype._loadHotspots = async function(contentResource) {
		const source = contentResource.getSource();

		if (typeof source === "string") {
			const veid = contentResource.getVeid() ?? "";
			if (veid !== "") {
				const response = await fetch(buildGetSceneUrl(contentResource));

				if (!response.ok) {
					throw new Error(response.statusText);
				}

				return await response.json();
			}
		}

		// We can reach this point if the source is a File or if the source is a string but the veid
		// is not set which means we are not loading a PDF content from the Visualization service.
		return {
			scene: {
				id: "-1"
			},
			tree: {
				sid: "-1",
				nodes: []
			},
			parametrics: []
		};
	};

	ContentManager.prototype._loadExtraModules = async function() {
		// The following modules are pulled in to avoid their synchronous loading in
		// `sap.ui.vk.Viewport`. We assume that if PDF content is loaded it will be displayed in an
		// instance of `sap.ui.vk.Viewport`.
		return new Promise((resolve, reject) => {
			sap.ui.require(
				[
					"sap/ui/vk/pdf/Viewport"
				],
				resolve,
				reason => reject(reason)
			);
		});
	};

	/**
	 * Builds a <code>sap.ui.vk.svg.Scene</code> object from the JSON payload.
	 *
	 * @param {sap.ui.vk.contentResource} contentResource The content resource for which the scene is being built.
	 * @param {object} sceneJson The JSON payload from the `_loadHotspots` method.
	 * @returns {sap.ui.vk.svg.Scene} The scene object.
	 * @private
	 */
	ContentManager.prototype._buildSvgScene = function(contentResource, sceneJson) {
		// The sap.ui.vk.svg.Scene is expected to have the following structure:
		//
		// scene
		//   rootNode
		//     contentResourceNode
		//       hotspotNode
		//         shapeNode - this corresponds to the hotspotNode's parametric
		//         ...
		//       hotspotNode
		//         shapeNode
		//         ...
		//       ...
		//       hotspotNode
		//         shapeNode
		//         ...

		const scene = new Scene();
		const rootNode = scene.getRootElement();
		const contentResourceNode = new Element();

		contentResourceNode.name = contentResource.getName();
		contentResourceNode.sourceId = contentResource.getSourceId();

		rootNode.add(contentResourceNode);

		contentResource._shadowContentResource = {
			nodeProxy: scene.getDefaultNodeHierarchy().createNodeProxy(contentResourceNode)
		};

		const {
			scene: {
				id: sceneId
			},
			tree: {
				sid: rootNodeId,
				nodes = []
			},
			parametrics = []
		} = sceneJson;

		const sceneBuilder = new SceneBuilder(contentResourceNode, contentResource);

		sceneBuilder.setRootNode(contentResourceNode, rootNodeId, sceneId, scene);

		scene.setSceneBuilder(sceneBuilder);

		addNodesToScene(sceneBuilder, sceneId, nodes, parametrics);

		return scene;
	};

	ContentManager.prototype.updateContent = async function(contentResources, content, parameters) {
		const contentResource = contentResources[0];

		const { nodeIds } = parameters;

		const response = await fetch(buildGetSceneUrl(contentResource, { sids: nodeIds }));

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		const sceneJson = await response.json();

		const scene = content.scene;
		const sceneBuilder = scene.getSceneBuilder();
		const nodeHierarchy = scene.getDefaultNodeHierarchy();

		const {
			scene: {
				id: sceneId
			},
			tree: {
				nodes: newNodes
			},
			parametrics = []
		} = sceneJson;

		const nodeRefsToRemove = newNodes
			.map((node) => scene.persistentIdToNodeRef(node.sid))
			.filter((nodeRef) => nodeRef != null);

		nodeHierarchy.removeNode(nodeRefsToRemove);

		addNodesToScene(sceneBuilder, sceneId, newNodes, parametrics);
	};

	function addNodesToScene(sceneBuilder, sceneId, nodes, parametrics) {
		// Recursively process each tree node.
		function processNodeRecursively(treeNode) {
			const { node, children = [], parentId } = treeNode;

			// Set parent ID if parent exists. `parentId` is used by `SceneBuilder` to set up the
			// parent-child relationship when creating the node.
			if (parentId != null) {
				node.parentId = parentId;
			} else if (node.parent != null) {
				node.parentId = node.parent;
			}

			// // Handle parametric content.
			const parametric = node.parametric == null
				? null
				: parametrics[node.parametric];

			if (parametric != null) {
				node.parametricId = parametric.id;
			}

			// Create the node in the scene.
			const nodeRef = sceneBuilder.createNode(node, sceneId);

			// Set parametric content if available.
			if (parametric != null) {
				sceneBuilder.setParametricContent(node.sid, parametric, sceneId);
			}

			// Recursively process all children.
			for (const childTreeNode of children) {
				processNodeRecursively(childTreeNode);
			}

			// Initialize as hotspot.
			nodeRef._initAsHotspot();
		}

		// Convert flat array to forest (array of root trees).
		const forest = convertFlatListToForest(nodes);

		// Process each root tree in the forest.
		for (const rootTreeNode of forest) {
			processNodeRecursively(rootTreeNode);
		}
	}

	function buildGetSceneUrl(contentResource, parameters) {
		let source = contentResource.getSource();
		let veid = contentResource.getVeid() ?? "";

		if (!source.endsWith("/")) {
			source += "/";
		}
		source += `scenes/${veid}`;
		source += "?contentType=hotspot";
		source += "&$select=contentType,name,transform,visible,pageIndex";
		source += "&$expand=parametric";
		source += `&hidden=${contentResource.getIncludeHidden()}`;

		const sids = parameters?.sids;

		if (sids != null) {
			source += "&sid=" + sids.join("&sid=");
		}

		return source;
	}

	/**
	 * @typedef {object} Node
	 * @property {string} sid         The node's persistent ID.
	 * @property {string} name        The name of the node.
	 * @property {string} [parent]    The persistent ID of the node's parent.
	 * @property {int[]} [children]   The indices of the node's children in the flat list of nodes.
	 * @property {int} [parametric]   The index of the node's parametric in the <code>parametrics</code> array.
	 * @property {object} [transform] The node's transformation matrix.
	 * @property {boolean} [visible]  Whether the node is visible.
	 * @property {int} [pageIndex]    The zero-based index of the page on which the node is located.
	 * @property {string} contentType The type of content. E.g. for hotspots this is always "HOTSPOT".
	 */

	/**
	 * @typedef {object} TreeNode
	 * @property {Node} node             The node.
	 * @property {string} [parentId]     The persistent ID of the node's parent.
	 * @property {TreeNode} [parent]     The node's parent.
	 * @property {TreeNode[]} [children] The node's children.
	 */

	/**
	 * Converts a flat list of nodes received from the backend into a forest (an array of root nodes).
	 *
	 * The input nodes are not modified.
	 *
	 * @param {Node[]} nodes The flat list of nodes
	 * @returns {TreeNode[]} The forest of nodes (root nodes)
	 */
	function convertFlatListToForest(nodes) {
		// First create a TreeNode object for each node in the flat list.
		/** @type TreeNode[] */
		const treeNodes = nodes.map((node) => ({ node }));

		// Then set up parent-child relationships between the TreeNode objects.
		treeNodes
			.filter(({ node: { children } }) => children != null)
			.forEach((treeNode) => {
				const { node } = treeNode;

				treeNode.children = node.children.map((childIndex) => {
					const childNode = treeNodes[childIndex];
					childNode.parentId = node.sid;
					childNode.parent = treeNode;
					return childNode;
				});
			});

		// Finally, return the roots of the trees in the forest.
		return treeNodes.filter(({ parent }) => parent == null);
	}

	return ContentManager;
});
