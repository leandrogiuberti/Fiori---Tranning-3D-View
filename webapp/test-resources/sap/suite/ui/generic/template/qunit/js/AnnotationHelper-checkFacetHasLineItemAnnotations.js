sap.ui.define(
	["sap/suite/ui/generic/template/js/AnnotationHelper"],
	function (AnnotationHelper) {
		QUnit.module("AnnotationHelper.checkFacetHasLineItemAnnotations", {
			beforeEach: function () {
				sandbox = sinon.sandbox.create();
			},
			afterEach: function () {
				sandbox.restore();
			},
		});

		[
			{ annotationPath: undefined, listEntityType: undefined, result: false, },
			{ annotationPath: "", listEntityType: undefined, result: false },
			{ annotationPath: "some string", listEntityType: undefined, result: false, },
			{ annotationPath: "UI.LineItem", listEntityType: undefined, result: false, },
			{ annotationPath: "@UI.LineItem", listEntityType: undefined, result: false, },
			{ annotationPath: "com.sap.vocabularies.UI.v1.LineItem", listEntityType: undefined, result: true, },
			{ annotationPath: "@com.sap.vocabularies.UI.v1.LineItem", listEntityType: undefined, result: true, },
			{ annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.LineItem", listEntityType: undefined, result: true, },
			{ annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.LineItem#id001", listEntityType: undefined, result: true, },
			{
				annotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": {Visualizations: [{AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem"}]} },
				result: false,
			},
			{
				annotationPath: "@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": {Visualizations: [{AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem"}]} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: undefined,
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": undefined, },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: undefined} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: []} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: [{ AnnotationPath: undefined }]} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: [{}, { AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem" }]} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: [{ AnnotationPath: "some string" }]} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: [{ AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem" }]} },
				result: true,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: [{ AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem#id001" }]} },
				result: true,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant#id001",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant": { Visualizations: [{ AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem#id001" }]} },
				result: false,
			},
			{
				annotationPath: "to_Items/@com.sap.vocabularies.UI.v1.PresentationVariant#id001",
				listEntityType: { "com.sap.vocabularies.UI.v1.PresentationVariant#id001": { Visualizations: [{ AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem#id001" }]} },
				result: true,
			},
		].forEach(function (data) {
			QUnit.test(`annotationPath = '${data.annotationPath}' listEntityType = ${JSON.stringify(data.listEntityType)} -> ${data.result}`,
				function(assert) {
					assert.ok(AnnotationHelper.checkFacetHasLineItemAnnotations( data.annotationPath, data.listEntityType ) === data.result, "expected result received");
				}
			);
		});
	}
);
