sap.ui.define([
	"sap/ui/vk/ve/dvl"
], function(
	dvl
) {
	"use strict";

	let noOp = () => { };
	let mockDvl = {
		IsUsingMock: true,
		CreateCoreInstance: noOp,
		Core: {
			Init: noOp,
			SetLocale: noOp,
			CreateRenderer() { return "renderer1" },
			CreateWebGLContext: noOp,
			CreateFileFromArrayBuffer: noOp,
			LoadSceneFromVDSLAsync: () => {
				mockDvl.loadedScene = mockDvl.scenes[0];
				mockDvl._sceneLoadedHandler.call(mockDvl._graphicsCore, { sceneId: mockDvl.loadedScene.SceneId })
			},
			LoadSceneByUrl(source) {
				let scene = mockDvl.scenes.find(s => s.Source == source);
				mockDvl.loadedScene = scene;
				return scene.SceneId;
			},
			LoadSceneByUrlAsync(source) {
				mockDvl.loadedScene = mockDvl.scenes.find(s => s.Source == source);
				if (mockDvl.loadedScene.Camera && !mockDvl.Camera.cameras.has(mockDvl.loadedScene.Camera.id)) {
					mockDvl.Camera.cameras.set(mockDvl.loadedScene.Camera.id, mockDvl.loadedScene.Camera);
					mockDvl.Camera.currentCamera = mockDvl.loadedScene.Camera.id;
				}
				mockDvl._sceneLoadedHandler.call(mockDvl._graphicsCore, { sceneId: mockDvl.loadedScene.SceneId });
			},
			GetRendererPtr() { return "renderer1" },
			GetLibraryPtr() { return "lib1" },
			DeleteFileByUrl: noOp,
			DeleteRenderer: noOp,
			Release: noOp,
			GetFilename(url, location) { return "file:///viewer/" + location + '-' + url.replace('/', '-') }
		},
		Renderer: {
			SetOption: noOp,
			SetOptionF: noOp,
			SetViewStateManager: noOp,
			ActivateCamera: noOp,
			CreateTexture() {
				return {
					amount: 1, offsetU: 0, offsetV: 0, scaleU: 1, scaleV: 1, angle: 0,
					flags: { clampU: false, clampV: false, modulate: false, invert: false, colorMap: false, decal: false }
				}
			},
			_processCommandQueue: noOp,
			ShouldRenderFrame() { return false },
			AttachScene: noOp,
			SetBackgroundColor: noOp,
			ForceRenderFrame: noOp,
			SetDimensions: noOp,
			RenderFrame: noOp
		},
		Client: {
			setDecryptionHandler: noOp,
			attachSceneLoaded(handler, gCore) {
				mockDvl._graphicsCore = gCore;
				mockDvl._sceneLoadedHandler = handler;
			},
			detachSceneLoaded: noOp,
			attachSceneFailed: noOp,
			detachSceneFailed: noOp,
			attachStepEvent: noOp,
			detachStepEvent: noOp,
			attachFrameFinished: noOp,
			detachFrameFinished: noOp,
			attachUrlClicked: noOp,
			detachUrlClicked: noOp
		},
		Scene: {
			RetrieveSceneInfo(sceneRef, flags) {
				let ret = {
					ChildNodes: [mockDvl.loadedScene.Nodes[0].id ?? mockDvl.loadedScene.Nodes[0].UniqueID],
					LocalizationPrefix: "",
					SelectedNodes: []
				}
				if (mockDvl.loadedScene.Layers) {
					ret.Layers = mockDvl.loadedScene.Layers
				}
				if (mockDvl.loadedScene.SceneDimensions) {
					ret.SceneDimensions = mockDvl.loadedScene.SceneDimensions
				}
				if (mockDvl.loadedScene.Materials) {
					ret.Materials = mockDvl.loadedScene.Materials
				}
				return ret;
			},
			GetCurrentCamera(sceneRef) {
				return mockDvl.Camera.currentCamera;
			},
			RetrieveProcedures(sceneRef) {
				if (mockDvl.loadedScene.Procedures == null) {
					return null;
				}
				// StepNavigation control modifies steps, hence deep copy
				return JSON.parse(JSON.stringify(mockDvl.loadedScene.Procedures));
			},
			RetrieveThumbnail(sceneRef, stepRef) {
				let ret = mockDvl.loadedScene.Thumbnails?.find(s => s.id == stepRef);
				if (ret == null) {
					return sap.ve.dvl.DVLRESULT.NOTFOUND
				}
				return ret.thumbnail;
			},
			RetrieveNodeInfo(sceneRef, nodeRef, flags) {
				return mockDvl.loadedScene.Nodes?.find(n => n == nodeRef || (n.id ?? n.UniqueID) == nodeRef)
			},
			RetrieveMetadata(sceneRef, objRef) {
				let ret = mockDvl.loadedScene.Nodes.find(n => n.id == objRef || n == objRef);
				if (ret == null) {
					ret = mockDvl.loadedScene.Layers?.find(l => l == objRef);
				}
				return ret;
			},
			RetrieveLayerInfo(sceneRef, layerRef) { return mockDvl.loadedScene.Layers.find(l => l == layerRef) },
			RetrieveVEIDs(sceneRef, objRef) {
				let ret = mockDvl.loadedScene.Layers?.find(l => l == objRef).veid
				if (ret == null) {
					ret = mockDvl.loadedScene.Nodes?.find(n => n == objRef).veid
				}
				return ret ?? []
			},
			RetrieveOutputSettings() { return { width: 100, height: 100, dpi: 96 } },
			FindNodes(sceneRef, findType, findMode, searchString) {
				let match = mockDvl.loadedScene.Nodes.filter((n) => n.NodeName.startsWith(searchString));
				return {
					nodes: match.map(n => n.id)
				}
			},
			CreateCamera(sceneRef, projection, parent) {
				let id = 'c' + (mockDvl.Camera.cameras.size + 1)
				let camera = {
					id: id,
					name: "",
					NodeName: "camera",
					origin: [0, 0, 0],
					rotation: [0, 0, 0],
					targetDirection: [1, 0, 0],
					upDirection: [0, 1, 0],
					matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
					fov: 0,
					fovBinding: 0,
					orthoZoomFactor: 0,
					projection: projection ?? sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC,
					ParentNodes: parent ? [parent] : []
				}
				mockDvl.loadedScene.Nodes.push(camera);
				mockDvl.Camera.cameras.set(id, camera);
				return id
			},
			CreateNode: noOp,
			SetNodeLocalMatrix: noOp,
			ActivateCamera(sceneRef, cameraRef) {
				mockDvl.Camera.currentCamera = cameraRef;
				return sap.ve.dvl.DVLRESULT.OK
			},
			BuildPartsList() { return "partsList1" },
			GetNodeSelectionInfo() {
				return {
					"HiddenSelectedNodesCount": 0,
					"TotalSelectedNodesCount": 0,
					"VisibleSelectedNodesCount": 0
				}
			},
			SetNodeHighlightColor(sceneRef, nodeRef, val) {
				var node = mockDvl.loadedScene.Nodes.find(n => n.id == nodeRef || n == nodeRef);
				if (node) {
					node.HighlightColor = val;
				}
			},
			DeleteNode: noOp,
			GetMaterialByName: (sceneRef, materialName) => {
				return mockDvl.loadedScene.Materials?.find(m => m.name == materialName);
			},
			CreateNodeCopy(sceneRef, nodeRef, flags) {
				var node = mockDvl.loadedScene.Nodes.find(n => n.id == nodeRef || n == nodeRef);
				return JSON.parse(JSON.stringify(node));
			},
			SetNodeSubmeshMaterial: noOp,
			GetNodeSubmeshMaterial: noOp,
			DeinstanceContent: noOp,
			Release: noOp,
			ActivateStep: noOp
		},
		Camera: {
			cameras: new Map(),
			currentCamera: "",
			GetRotation: function(cameraRef) { return this.cameras.get(cameraRef).rotation },
			SetRotation: function(cameraRef, yaw, pitch, roll) { this.cameras.get(cameraRef).rotation = [yaw, pitch, roll] },
			GetProjection: function(cameraRef) { return this.cameras.get(cameraRef).projection },
			SetName: function(cameraRef, name) { this.cameras.get(cameraRef).name = name },
			GetName: function(cameraRef) { return this.cameras.get(cameraRef).name },
			SetOrigin: function(cameraRef, x, y, z) { this.cameras.get(cameraRef).origin = [x, y, z] },
			GetOrigin: function(cameraRef) { return this.cameras.get(cameraRef).origin },
			SetTargetDirection: function(cameraRef, x, y, z) { this.cameras.get(cameraRef).targetDirection = [x, y, z] },
			GetTargetDirection: function(cameraRef) { return this.cameras.get(cameraRef).targetDirection },
			SetUpDirection: function(cameraRef, x, y, z) { this.cameras.get(cameraRef).upDirection = [x, y, z] },
			GetUpDirection: function(cameraRef) { return this.cameras.get(cameraRef).upDirection },
			SetFOV: function(cameraRef, fov) { this.cameras.get(cameraRef).fov = fov },
			GetFOV: function(cameraRef) { return this.cameras.get(cameraRef).fov },
			SetFOVBinding: function(cameraRef, fovBinding) {
				this.cameras.get(cameraRef).fovBinding = [sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ, sap.ve.dvl.DVLCAMERAFOVBINDING.VERT, sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ, sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ].indexOf(fovBinding) != -1
					? fovBinding : sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ;

			},
			GetFOVBinding: function(cameraRef) { return this.cameras.get(cameraRef).fovBinding },
			SetOrthoZoomFactor: function(cameraRef, orthoZoomFactor) { this.cameras.get(cameraRef).orthoZoomFactor = orthoZoomFactor },
			GetOrthoZoomFactor: function(cameraRef) { return this.cameras.get(cameraRef).orthoZoomFactor },
			SetTargetNode: function(cameraRef, targetNode) { this.cameras.get(cameraRef).targetNode = targetNode },
			GetTargetNode: function(cameraRef) { return this.cameras.get(cameraRef).targetNode || "iffffffffffffffff" },
			SetMatrix: function(cameraRef, matrix) { this.cameras.get(cameraRef).matrix = matrix },
			GetMatrix: function(cameraRef) { return { matrix: this.cameras.get(cameraRef).matrix } }
		},
		Settings: {
			LastLoadedSceneId: "s1",
			CoreToken: "coreToken1",
			RendererToken: "rendererToken1"
		},
		Material: {
			GetName(materialRef) {
				return materialRef?.name
			},
			GetColorParam(materialRef, flag) {
				let ret = null;
				switch (flag) {
					case DvlEnums.DVLMATERIALCOLORPARAM.EMISSIVE:
						ret = materialRef?.emissiveColor;
						break;
					case DvlEnums.DVLMATERIALCOLORPARAM.AMBIENT:
						ret = materialRef?.ambientColor;
						break;
					case DvlEnums.DVLMATERIALCOLORPARAM.DIFFUSE:
						ret = materialRef?.diffuseColor;
						break;
					case DvlEnums.DVLMATERIALCOLORPARAM.SPECULAR:
						ret = materialRef?.specularColor;
						break;
				}
				return ret;
			},
			GetScalarParam(materialRef, flag) {
				let ret = null;
				switch (flag) {
					case DvlEnums.DVLMATERIALSCALARPARAM.OPACITY:
						ret = materialRef?.opacity;
						break;
					case DvlEnums.DVLMATERIALSCALARPARAM.GLOSSINESS:
						ret = materialRef?.glossiness;
						break;
					case DvlEnums.DVLMATERIALSCALARPARAM.SPECULAR_LEVEL:
						ret = materialRef?.specularLevel;
						break;
				}
				return ret;
			},
			SetTexture(materialRef, textureType, newTexture) {
				materialRef.textures ??= [];
				let index = materialRef.textures.findIndex(t => t.type == textureType);
				if (newTexture) {
					newTexture.type = textureType;
					if (index == -1) {
						materialRef.textures.push(newTexture); // insert
					} else {
						materialRef.textures[index] = newTexture; // replace
					}
				} else if (index > -1) {
					materialRef.textures.splice(index, 1); // remove
				}
			},
			GetTexture(materialRef, textureType) {
				return materialRef?.textures?.find(t => t.type == textureType) ?? ""
			},
			SetTextureParam(materialRef, textureType, param, value) {
				let texture = materialRef?.textures?.find(t => t.type == textureType);
				if (texture == null) {
					return;
				}
				switch (param) {
					case DvlEnums.DVLMATERIALTEXTUREPARAM.AMOUNT:
						texture.amount = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.OFFSET_U:
						texture.offsetU = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.OFFSET_V:
						texture.offsetV = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.SCALE_U:
						texture.scaleU = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.SCALE_V:
						texture.scaleV = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.ANGLE:
						texture.angle = value;
						break;
				}
			},
			GetTextureParam(materialRef, textureType, param) {
				let ret = null;
				let texture = materialRef?.textures?.find(t => t.type == textureType) ?? {};
				switch (param) {
					case DvlEnums.DVLMATERIALTEXTUREPARAM.AMOUNT:
						ret = texture.amount ?? 0;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.OFFSET_U:
						ret = texture.offsetU ?? 0;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.OFFSET_V:
						ret = texture.offsetV ?? 0;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.SCALE_U:
						ret = texture.scaleU ?? 0;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.SCALE_V:
						ret = texture.scaleV ?? 0;
						break;
					case DvlEnums.DVLMATERIALTEXTUREPARAM.ANGLE:
						ret = texture.angle ?? 0;
						break;
				}
				return ret;
			},
			SetTextureFlag(materialRef, textureType, param, value) {
				let texture = materialRef?.textures?.find(t => t.type == textureType);
				if (texture == null) {
					return;
				}
				texture.flags ??= {};
				switch (param) {
					case DvlEnums.DVLMATERIALTEXTUREFLAG.CLAMP_U:
						texture.flags.clampU = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.CLAMP_V:
						texture.flags.clampV = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.MODULATE:
						texture.flags.modulate = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.INVERT:
						texture.flags.invert = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.COLOR_MAP:
						texture.flags.colorMap = value;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.DECAL:
						texture.flags.decal = value;
						break;
				}
			},
			GetTextureFlag(materialRef, textureType, param) {
				let ret = null;
				let texture = materialRef?.textures?.find(t => t.type == textureType) ?? { flags: {} };
				switch (param) {
					case DvlEnums.DVLMATERIALTEXTUREFLAG.CLAMP_U:
						ret = texture.flags.clampU ?? false;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.CLAMP_V:
						ret = texture.flags.clampV ?? false;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.MODULATE:
						ret = texture.flags.modulate ?? false;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.INVERT:
						ret = texture.flags.invert ?? false;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.COLOR_MAP:
						ret = texture.flags.colorMap ?? false;
						break;
					case DvlEnums.DVLMATERIALTEXTUREFLAG.DECAL:
						ret = texture.flags.decal ?? false;
						break;
				}
				return ret;
			},
			Clone(materialRef) {
				return JSON.parse(JSON.stringify(materialRef));
			},
			Release() { return DvlEnums.DVLRESULT.OK }
		}
	}

	function testWebGL2() {
		try {
			const canvas = document.createElement('canvas');
			// Attempt to get a WebGL2 context
			const gl = canvas.getContext('webgl2');
			return !!gl && typeof gl.getParameter === 'function';
		} catch (e) {
			return false;
		}
	}

	if (!testWebGL2()) {
		sap.ve.dvl.createRuntime = function() {
			return Promise.resolve(mockDvl)
		}
	}

	return (scenes) => {
		mockDvl.scenes = scenes;
	};
});
