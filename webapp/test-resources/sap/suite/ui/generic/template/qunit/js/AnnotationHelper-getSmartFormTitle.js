sap.ui.define(
	["sap/suite/ui/generic/template/js/AnnotationHelper"],
	function (AnnotationHelper) {
		QUnit.module("AnnotationHelper.getSmartFormTitle", {
			beforeEach: function () {
				sandbox = sinon.sandbox.create();
			},
			afterEach: function () {
				sandbox.restore();
			},
		});

		[
			{model: {}, facet: undefined, result: undefined},
			{model: {}, facet: {}, result: undefined},
			{model: {}, facet: {Target: {}}, result: undefined},
			{model: {}, facet: {Target: {AnnotationPath: ""}}, result: undefined},
			{model: {main: {}}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{model: {main: {}}, facet: {Label: {}, Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{model: {main: {}}, facet: {Label: {String: "title"}, Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{model: {main: {"com.sap.vocabularies.UI.v1.DataPoint": {}}}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{model: {main: {"com.sap.vocabularies.UI.v1.DataPoint": {Title: {}}}}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{model: {main: {"com.sap.vocabularies.UI.v1.DataPoint": {Title: {String: "title"}}}}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: "title"},
			{model: {main: {"com.sap.vocabularies.UI.v1.DataPoint#id": {Title: {String: "title"}}}}, facet: {Target: {AnnotationPath: "@com.sap.vocabularies.UI.v1.DataPoint#id"}}, result: "title"},
			{model: {main: {"com.sap.vocabularies.UI.v1.DataPoint": {Value: {}}}}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{model: {main: {"com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}}}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}}, result: undefined},
			{
				model: {main: { "com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}, property: [] }},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}},
				result: undefined
			},
			{
				model: {main: { "com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}, property: [{}] }},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}},
				result: undefined
			},
			{
				model: {main: { "com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}, property: [{name: "some_name"}] }},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}},
				result: undefined
			},
			{
				model: {main: { "com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}, property: [{name: "property_path"}] }},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}},
				result: undefined
			},
			{
				model: {main: { "com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}, property: [{name: "property_path", "sap:label": ""}] }},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}},
				result: undefined
			},
			{
				model: {main: { "com.sap.vocabularies.UI.v1.DataPoint": {Value: {Path: "property_path"}}, property: [{name: "property_path", "sap:label": "title"}] }},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.DataPoint"}},
				result: "title"
			},
			{model: {}, facet: {Label: {}}, result: undefined},
			{model: {}, facet: {Label: {String: ""}}, result: undefined},
			{model: {}, facet: {Label: {String: "title"}}, result: "title"},
			{model: {}, facet: {Label: {String: "title"}, Target: {}}, result: "title"},
			{model: {}, facet: {Label: {String: "title"}, Target: {AnnotationPath: ""}}, result: "title"},
			{model: {}, facet: {Label: {String: "title"}, Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.Identification"}}, result: "title"},
			{model: {}, facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.Identification"}}, result: undefined},
			{
				model: {main: {"com.sap.vocabularies.UI.v1.FieldGroup": {}}},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.FieldGroup"}},
				result: undefined
			},
			{
				model: {main: {"com.sap.vocabularies.UI.v1.FieldGroup": {Label: {}}}},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.FieldGroup"}},
				result: undefined
			},
			{
				model: {main: {"com.sap.vocabularies.UI.v1.FieldGroup": {Label: {String: ""}}}},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.FieldGroup"}},
				result: undefined
			},
			{
				model: {main: {"com.sap.vocabularies.UI.v1.FieldGroup": {Label: {String: "title"}}}},
				facet: {Target: {AnnotationPath: "com.sap.vocabularies.UI.v1.FieldGroup"}},
				result: "title"
			},
			{
				model: {main: {"com.sap.vocabularies.UI.v1.FieldGroup": {Label: {String: "title"}}}},
				facet: {Target: {AnnotationPath: "@com.sap.vocabularies.UI.v1.FieldGroup"}},
				result: "title"
			},
			{
				model: {main: {"com.sap.vocabularies.UI.v1.FieldGroup#id": {Label: {String: "title"}}}},
				facet: {Target: {AnnotationPath: "@com.sap.vocabularies.UI.v1.FieldGroup#id"}},
				result: "title"
			},
			{
				model: {
					main: {
						"com.sap.vocabularies.UI.v1.FieldGroup#id": {Label: {String: "title"}},
						navigation: {"to_SubEntity": {type: "subEntity"}}
					},
					subEntity: {"com.sap.vocabularies.UI.v1.FieldGroup#id": {Label: {String: "subEntity title"}}}
				},
				facet: {Target: {AnnotationPath: "to_SubEntity/@com.sap.vocabularies.UI.v1.FieldGroup#id"}},
				result: "subEntity title"
			},
			{
				model: {
					main: {
						"com.sap.vocabularies.UI.v1.FieldGroup#id": {Label: {String: "title"}},
						navigation: {"to_SubEntity": {type: "subEntity"}}
					},
					subEntity: {
						"com.sap.vocabularies.UI.v1.FieldGroup#id": {Label: {String: "subEntity title"}},
						navigation: {"to_SubSubEntity": {type: "subSubEntity"}}
					},
					subSubEntity: {"com.sap.vocabularies.UI.v1.FieldGroup#id": {Label: {String: "subSubEntity title"}}}
				},
				facet: {Target: {AnnotationPath: "to_SubEntity/to_SubSubEntity/@com.sap.vocabularies.UI.v1.FieldGroup#id"}},
				result: "subSubEntity title"
			},
			{ block: undefined, subSection: undefined, result: undefined },
			{ block: {}, subSection: undefined, result: undefined },
			{ block: {aggregations: {groups: {}}}, subSection: undefined, result: undefined },
			{ block: {aggregations: {groups: [{}]}}, subSection: undefined, result: undefined },
			{ block: {aggregations: {groups: [{targetAnnotation: {}}]}}, subSection: undefined, result: undefined },
			{ block: {aggregations: {groups: [{targetAnnotation: {Label: {}}}]}}, subSection: undefined, result: undefined },
			{ block: {aggregations: {groups: [{targetAnnotation: {Label: {String: "FieldGroup"}}}]}}, subSection: undefined, result: "FieldGroup" },
			{ block: {aggregations: {groups: [{
				annotations: {},
				targetAnnotation: {Label: {String: "FieldGroup title"}}
			}]}}, subSection: undefined, result: "FieldGroup title" },
			{ block: {aggregations: {groups: [{
				annotations: {Facet: {}},
				targetAnnotation: {Label: {String: "FieldGroup title"}}
			}]}}, subSection: undefined, result: "FieldGroup title" },
			{ block: {aggregations: {groups: [{
				annotations: {Facet: {annotation: {}}},
				targetAnnotation: {Label: {String: "FieldGroup title"}}
			}]}}, subSection: undefined, result: "FieldGroup title" },
			{ block: {aggregations: {groups: [{
				annotations: {Facet: {annotation: {Label: {}}}},
				targetAnnotation: {Label: {String: "FieldGroup title"}}
			}]}}, subSection: undefined, result: "FieldGroup title" },
			{ block: {aggregations: {groups: [{
				annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
				targetAnnotation: {Label: {String: "FieldGroup title"}}
			}]}}, subSection: undefined, result: undefined },
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {}},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {}}},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {}}}},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {Label: {}}}}},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SmartForm Title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}}},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}}},
				result: "FieldGroup title"
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {
					Facets: {},
					Label: {String: "SubSection title"},
				}}}},
				result: "FieldGroup title"
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {
					Facets: [{}],
					Label: {String: "SubSection title"},
				}}}},
				result: "FieldGroup title"
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}},
					targetAnnotation: {Label: {String: "FieldGroup title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {
					Facets: [{}, {}],
					Label: {String: "SubSection title"},
				}}}},
				result: undefined
			},
			{
				block: {aggregations: {groups: [{
					annotations: {Facet: {annotation: {Label: {String: "SubSection title"}}}},
					targetAnnotation: {Label: {String: "SubSection title"}}
				}]}},
				subSection: {annotations: {Facet: {annotation: {
					Facets: [{}],
					Label: {String: "SubSection title"},
				}}}},
				result: undefined
			},
		].forEach(function(data) {
			QUnit.test(`model = ${JSON.stringify(data.model)}, oFacet = ${JSON.stringify(data.facet)}, oBlock = ${JSON.stringify(data.block)}, oSubSectionData = ${JSON.stringify(data.subSection)}`,
				function(assert) {
					var oInterface = getInterface(data.model);
					assert.ok(AnnotationHelper.getSmartFormTitle(oInterface, data.facet, "entitySetName", data.block, data.subSection) === data.result, "expected result received");
				}
			);
		});

		function getInterface(oEntityType) {
			var oModel = getModel(oEntityType);
			return {
				getModel: sinon.stub().returns(oModel)
			};
		}

		function getModel(oModel) {
			return {
				getODataEntityType: function(type) {
					return oModel[type];
				},
				getODataAssociationEnd: function(oEntityType, sNavigationProperty) {
					return oEntityType.navigation[sNavigationProperty];
				},
				getODataEntitySet: sinon.stub().returns({entityType: "main"})
			};
		}
	}
);
