sap.ui.define([
	"sap/suite/ui/generic/template/js/AnnotationHelper",
	"sap/ui/model/odata/AnnotationHelper"
],
	function (AnnotationHelper, AnnotationHelperModel ) {

		QUnit.module("AnnotationHelper.getListItemCollection", {
			beforeEach: function() {
				sandbox = sinon.sandbox.create();
			},
			afterEach: function() {
				sandbox.restore();
			}
		});

		QUnit.test("target = undefined", function(assert) {
			var target = undefined;
			assert.ok(AnnotationHelper.getListItemCollection(target) === target, "expected result received");
		});

		[
			{ object: undefined },
			{ object: {} },
			{ object: {AnnotationPath: ""} },
			{ object: {AnnotationPath: "some string"} },
		].forEach(function(data) {
			QUnit.test(`target.getObject() = ${JSON.stringify(data.object)}`, function(assert) {
				var target = getTarget();

				target.getObject.returns(data.object);

				assert.ok(AnnotationHelper.getListItemCollection(target) === target, "expected result received");
				assert.ok(target.getObject.calledOnce, "target.getObject() was called");
			});
		});

		[
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem"} },
			{ object: {AnnotationPath: "@com.sap.vocabularies.UI.v1.LineItem"} },
			{ object: {AnnotationPath: "to_Items/@com.sap.vocabularies.UI.v1.LineItem"} },
			{ object: {AnnotationPath: "to_Items/@com.sap.vocabularies.UI.v1.LineItem#id001"} },
		].forEach(function(data) {
			QUnit.test(`target.getObject() = ${JSON.stringify(data.object)}`, function(assert) {
				var target = getTarget(),
					sResolvePath = "resolvePath for target";

				target.getObject.returns(data.object);
				sandbox.stub(AnnotationHelperModel, "resolvePath", function(){ return sResolvePath; });

				assert.ok(AnnotationHelper.getListItemCollection(target) === sResolvePath, "expected result received");
				assert.ok(target.getObject.calledOnce, "target.getObject() was called");
				assert.ok(AnnotationHelperModel.resolvePath.calledOnce, "AnnotationHelperModel.resolvePath() was called");
				assert.ok(AnnotationHelperModel.resolvePath.calledWithExactly(target), "AnnotationHelperModel.resolvePath() was called with correct parameters");
			});
		});

		[
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: undefined },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: undefined} },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: []} },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: [{}, {AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem"}]} },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: [{AnnotationPath: "some path"}]} },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: [{AnnotationPath: "com.sap.vocabularies.UI.v1.LineItem"}]} },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: [{AnnotationPath: "#com.sap.vocabularies.UI.v1.LineItem"}]} },
		].forEach(function(data) {
			QUnit.test(`target.getObject() = ${JSON.stringify(data.object)}, target.getProperty(PV entry path) = ${JSON.stringify(data.property)}`, function(assert) {
				var target = getTarget(),
					sResolvePath = "resolvePath for target";

				target.getObject.returns(data.object);
				sandbox.stub(AnnotationHelperModel, "resolvePath", function(){ return sResolvePath; });
				target.getProperty.withArgs(sResolvePath).returns(data.property);

				assert.ok(AnnotationHelper.getListItemCollection(target) === target, "expected result received");
				assert.ok(target.getObject.calledOnce, "target.getObject() was called");
				assert.ok(AnnotationHelperModel.resolvePath.calledOnce, "AnnotationHelperModel.resolvePath() was called");
				assert.ok(AnnotationHelperModel.resolvePath.calledWithExactly(target), "AnnotationHelperModel.resolvePath() was called with correct parameters");
				assert.ok(target.getProperty.calledOnce, "target.getProperty() was called");
				assert.ok(target.getProperty.calledWithExactly(sResolvePath), "target.getProperty() was called with correct parameters");
				assert.ok(target.getModel.notCalled, "target.getModel() was not called");
			});
		});

		[
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: [{AnnotationPath: "@com.sap.vocabularies.UI.v1.LineItem"}]} },
			{ object: {AnnotationPath: "com.sap.vocabularies.UI.v1.PresentationVariant"}, property: {Visualizations: [{AnnotationPath: "@com.sap.vocabularies.UI.v1.LineItem#id001"}]} },
		].forEach(function(data) {
			QUnit.test(`target.getObject() = ${JSON.stringify(data.object)}, target.getProperty(PV entry path) = ${JSON.stringify(data.property)}`, function(assert) {
				var target = getTarget(),
					sResolvePath = "resolvePath for target",
					sEntitySet = "entitySet",
					sEntityType = "entityType",
					sExpectedResult = target.oModel.$path + "/" + data.property.Visualizations[0].AnnotationPath.slice(1);

				target.getObject.returns(data.object);
				sandbox.stub(AnnotationHelperModel, "resolvePath", function(){ return sResolvePath; });
				sandbox.stub(AnnotationHelperModel, "gotoEntitySet", function(){ return sEntitySet; });
				target.getProperty
					.withArgs(sResolvePath).returns(data.property)
					.withArgs(sEntitySet).returns({entityType: sEntityType});
				target.oModel.getODataEntityType.withArgs(sEntityType).returns({$path: target.oModel.$path});

				assert.ok(AnnotationHelper.getListItemCollection(target) === sExpectedResult, "expected result received");
				assert.ok(target.getObject.calledOnce, "target.getObject() was called");
				assert.ok(AnnotationHelperModel.resolvePath.calledOnce, "AnnotationHelperModel.resolvePath() was called");
				assert.ok(AnnotationHelperModel.resolvePath.calledWithExactly(target), "AnnotationHelperModel.resolvePath() was called with correct parameters");
				assert.ok(target.getProperty.calledTwice, "target.getProperty() was called correct number of times");
				assert.ok(target.getProperty.calledWithExactly(sResolvePath), `target.getProperty() was called with '${sResolvePath}'`);
				assert.ok(target.getProperty.calledWithExactly(sEntitySet), `target.getProperty() was called with '${sEntitySet}'`);
				assert.ok(target.getModel.calledOnce, "target.getModel() was called");
				assert.ok(target.oModel.getODataEntityType.calledOnce, "target.getModel().getODataEntityType was called");
			});
		});

		function getTarget() {
			var oModel = getModel();
			return {
				oModel: oModel,
				getObject: sinon.stub(),
				getModel: sinon.stub().returns(oModel),
				getProperty: sinon.stub(),
			};
		}

		function getModel() {
			var $path = "$path";
			return {
				$path: $path,
				getODataEntityType: sinon.stub(),
			};
		}
});
