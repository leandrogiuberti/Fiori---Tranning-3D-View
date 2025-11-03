sap.ui.define([
	"sinon",
	"sap/ui/vk/ContentConnector",
	"sap/ui/vk/ContentResource",
	"sap/ui/vk/ContentType"
], function(
	sinon,
	ContentConnector,
	ContentResource,
	ContentType
) {
	"use strict";

	QUnit.module("sap.ui.vk.ContentConnector", {
	});

	QUnit.test("removeContentManagerResolver", function(assert) {

		var resolver1 = function() { };

		var resolver2 = function() { };

		var resolver3 = {
			pattern: "test"
		};

		var resolver4 = {
			pattern: new RegExp("\\w+")
		};

		var resolver5 = {
			pattern: new RegExp("\\w+")
		};

		ContentConnector.addContentManagerResolver(resolver1);
		assert.equal(ContentConnector.removeContentManagerResolver(resolver2), false, "Removing non existing function resolver.");
		assert.equal(ContentConnector.removeContentManagerResolver(resolver1), true, "Removing existing function resolver.");

		ContentConnector.addContentManagerResolver(resolver3);
		assert.equal(ContentConnector.removeContentManagerResolver(resolver4), false, "Removing non existing object resolver with RegExp pattern.");
		assert.equal(ContentConnector.removeContentManagerResolver(resolver3), true, "Removing existing object resolver with String pattern.");

		ContentConnector.addContentManagerResolver(resolver4);
		assert.equal(ContentConnector.removeContentManagerResolver(resolver3), false, "Removing non existing object resolver with String pattern.");
		assert.equal(ContentConnector.removeContentManagerResolver(resolver4), true, "Removing existing object resolver with RegExp pattern.");

		ContentConnector.addContentManagerResolver(resolver3);
		assert.equal(ContentConnector.removeContentManagerResolver("test"), true, "Removing existing object resolver with String pattern by String.");

		ContentConnector.addContentManagerResolver(resolver3);
		assert.equal(ContentConnector.removeContentManagerResolver(new RegExp("\\w+")), false, "Removing existing object resolver with String pattern by RegExp.");

		ContentConnector.addContentManagerResolver(resolver4);
		assert.equal(ContentConnector.removeContentManagerResolver("\\w+"), true, "Removing existing object resolver with RegExp pattern by String.");

		ContentConnector.addContentManagerResolver(resolver4);
		assert.equal(ContentConnector.removeContentManagerResolver(new RegExp("\\w+")), true, "Removing existing object resolver with RegExp pattern by RegExp.");

		ContentConnector.addContentManagerResolver(resolver4);
		assert.equal(ContentConnector.removeContentManagerResolver(resolver5), false, "Removing existing object resolver with RegExp pattern by identical object resolver.");

		ContentConnector.removeContentManagerResolver(resolver3);
		ContentConnector.removeContentManagerResolver(resolver4);
	});

	QUnit.test("collect content resource source type info", async function(assert) {
		const contentConnector = new ContentConnector();

		const contentResource = new ContentResource({
			sourceId: "abc",
			source: "https://example.com/api/v1",
			sourceType: "stream",
			veid: "123"
		});

		const info = await contentConnector._collectContentResourceSourceTypeInformation([contentResource]);

		assert.false(info.noSourceTypes, "There are no sources with no source type.");
		assert.false(info.unknownSourceTypes, "There are no sources with unknown source type.");
		assert.deepEqual(info.dimensions, [3], "The model dimensions are [3].");
		assert.deepEqual(info.contentManagerClassNames, ["sap.ui.vk.threejs.ContentManager"], "The content manager class names are [sap.ui.vk.threejs.ContentManager].");

		contentConnector.destroy();
	});

	QUnit.test("auto resolve content resource source type", async function(assert) {
		const SERVICE_URL = "https://example.com/api/v1";

		const PDF_CONTENT_MANAGER_CLASS_NAME = "sap.ui.vk.pdf.ContentManager";
		const SVG_CONTENT_MANAGER_CLASS_NAME = "sap.ui.vk.svg.ContentManager";
		const THREEJS_CONTENT_MANAGER_CLASS_NAME = "sap.ui.vk.threejs.ContentManager";

		const testData = [
			{ contentType: ContentType.IMAGE2D, contentManagerClassName: THREEJS_CONTENT_MANAGER_CLASS_NAME, dimensions: 3 },
			{ contentType: ContentType.IMAGE360, contentManagerClassName: THREEJS_CONTENT_MANAGER_CLASS_NAME, dimensions: 3 },
			{ contentType: ContentType.MATERIAL, contentManagerClassName: THREEJS_CONTENT_MANAGER_CLASS_NAME, dimensions: 3 },
			{ contentType: ContentType.MODEL3D, contentManagerClassName: THREEJS_CONTENT_MANAGER_CLASS_NAME, dimensions: 3 },
			{ contentType: ContentType.NAVIGATION, contentManagerClassName: THREEJS_CONTENT_MANAGER_CLASS_NAME, dimensions: 3 },
			{ contentType: ContentType.SYMBOL, contentManagerClassName: THREEJS_CONTENT_MANAGER_CLASS_NAME, dimensions: 3 },
			{ contentType: ContentType.DRAWING2D, contentManagerClassName: SVG_CONTENT_MANAGER_CLASS_NAME, dimensions: 2 },
			{ contentType: ContentType.ECAD, contentManagerClassName: SVG_CONTENT_MANAGER_CLASS_NAME, dimensions: 2 },
			{ contentType: ContentType.PDF, contentManagerClassName: PDF_CONTENT_MANAGER_CLASS_NAME, dimensions: 2 },
		];

		const fetchStub = sinon.stub(globalThis, "fetch");

		fetchStub.resolves({});

		for (const [i, { contentType }] of testData.entries()) {
			const response = sinon.createStubInstance(Response);
			response.json.resolves({ contentType });
			Object.defineProperty(response, "ok", { get: () => true });

			fetchStub.withArgs(`https://example.com/api/v1/scenes/${i}/info`).resolves(response);
		}

		const contentConnector = new ContentConnector();

		const contentResource = new ContentResource({
			sourceId: "abc",
			source: SERVICE_URL,
			sourceType: "auto"
		});

		for (const [i, { contentType, contentManagerClassName, dimensions }] of testData.entries()) {
			contentResource.setVeid(i.toString());

			const info = await contentConnector._collectContentResourceSourceTypeInformation([contentResource]);

			assert.deepEqual(info.dimensions, [dimensions], `The model dimensions are [${dimensions}].`);
			assert.deepEqual(info.contentManagerClassNames, [contentManagerClassName],
				`The content manager class names are [${contentManagerClassName}] for contentType ${contentType}.`);

			contentConnector.destroyContentResources();
		}

		const contentResources = [
			new ContentResource({
				sourceId: "abc",
				source: SERVICE_URL,
				sourceType: "auto",
				veid: "1"
			}),
			new ContentResource({
				sourceId: "def",
				source: SERVICE_URL,
				sourceType: "auto",
				veid: "2"
			})
		]

		let info = await contentConnector._collectContentResourceSourceTypeInformation(contentResources);

		assert.deepEqual(info.dimensions, [3], "The model dimensions are [3].");
		assert.deepEqual(info.contentManagerClassNames, [THREEJS_CONTENT_MANAGER_CLASS_NAME],
			"The content manager class names are [sap.ui.vk.threejs.ContentManager].");

		contentConnector.destroyContentResources();

		contentResources[1].setVeid(testData.findIndex((item) => item.contentType === ContentType.ECAD)).toString();

		info = await contentConnector._collectContentResourceSourceTypeInformation(contentResources);

		assert.deepEqual(info.dimensions.toSorted(), [2, 3], "The model dimensions are [2, 3].");
		assert.deepEqual(info.contentManagerClassNames.toSorted(), [SVG_CONTENT_MANAGER_CLASS_NAME, THREEJS_CONTENT_MANAGER_CLASS_NAME],
			"The content manager class names are [sap.ui.vk.svg.ContentManager, sap.ui.vk.threejs.ContentManager].");

		contentResources[1].setVeid("invalid_id");

		info = await contentConnector._collectContentResourceSourceTypeInformation(contentResources);

		assert.deepEqual(info.dimensions, [3], "The model dimensions are [3].");
		assert.deepEqual(info.contentManagerClassNames, [THREEJS_CONTENT_MANAGER_CLASS_NAME],
			"The content manager class names are [sap.ui.vk.threejs.ContentManager].");
		assert.ok(info.unknownSourceTypes, "There are sources with unknown source type.");

		contentConnector.destroy();
	});

	QUnit.done(function() {
		jQuery("#content").hide();
	});
});
