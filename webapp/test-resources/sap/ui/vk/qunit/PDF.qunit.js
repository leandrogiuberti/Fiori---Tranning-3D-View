sap.ui.define([
	"sap/ui/vk/ContentConnector",
	"sap/ui/vk/ContentResource"
], function(
	ContentConnector,
	ContentResource
) {
	"use strict";

	QUnit.module("PDF", {
		beforeEach: function() {
			this.contentConnector = new ContentConnector();
		},

		afterEach: function() {
			this.contentConnector.destroy();
			this.contentConnector = null;
		}
	});

	QUnit.test("PDF with rotated pages", async function(assert) {
		const { promise, resolve } = Promise.withResolvers();

		const contentResource = new ContentResource({
			source: "media/RotatedPages.pdf",
			sourceType: "pdf",
			sourceId: "abc"
		});

		const { contentConnector } = this;

		contentConnector.attachContentChangesFinished((event) => {
			const pdfDocument = event.getParameter("content");
			resolve(pdfDocument);
		});

		contentConnector.addContentResource(contentResource);

		const pdfDocument = await promise;

		assert.true(pdfDocument != null, "PDF document is loaded successfully.");
		assert.strictEqual(pdfDocument.pageCount, 4, "PDF document has 4 pages.");

		const DELTA = 0.01;

		const page0 = await pdfDocument.getPage(0);

		let { pageWidth, pageHeight } = page0.rawDimensions;

		assert.closeTo(pageWidth, 595.28, DELTA, "Page 1 width is correct.");
		assert.closeTo(pageHeight, 841.89, DELTA, "Page 1 height is correct.");

		const page1 = await pdfDocument.getPage(1);

		({ pageWidth, pageHeight } = page1.rawDimensions);

		assert.closeTo(pageWidth, 841.89, DELTA, "Page 2 width is correct.");
		assert.closeTo(pageHeight, 595.28, DELTA, "Page 2 height is correct.");

		const page2 = await pdfDocument.getPage(2);

		({ pageWidth, pageHeight } = page2.rawDimensions);

		assert.closeTo(pageWidth, 595.28, DELTA, "Page 3 width is correct.");
		assert.closeTo(pageHeight, 841.89, DELTA, "Page 3 height is correct.");

		const page3 = await pdfDocument.getPage(3);

		({ pageWidth, pageHeight } = page3.rawDimensions);

		assert.closeTo(pageWidth, 841.89, DELTA, "Page 4 width is correct.");
		assert.closeTo(pageHeight, 595.28, DELTA, "Page 4 height is correct.");
	});
});
