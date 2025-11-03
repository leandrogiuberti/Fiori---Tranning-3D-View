
/* global QUnit */
/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/comp/delegates/TextArrangement"
], function(
	MockServer,
	ODataModel,
	TextArrangement
) {
	"use strict";
	QUnit.module("Generic", {
		beforeEach: function() {
			this.oControl = {
				getModel: () => this.oModel,
				getFlexConfig: () => {return {entitySetName: "Employees"};}
			};
		},
		loadModel: function(sFile) {
			const sService = Math.round(Math.random() * 10000).toString();
			this.oMockServer = new MockServer({
				rootUri: `${sService}/`
			});
			this.oMockServer.simulate(
				`test-resources/sap/ui/comp/qunit/delegates/metadata/${sFile}`,
				"test-resources/sap/ui/comp/qunit/delegates/metadata/"
			);
			this.oMockServer.start();
			this.oModel = new ODataModel(sService);
			return this.oModel.getMetaModel().loaded();
		},
		afterEach: function() {
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
			if (this.oMockServer) {
				this.oMockServer.stop();
				this.oMockServer.destroy();
				this.oMockServer = null;
			}
		}
	});
	QUnit.test("Correct MetaPath and objectTemplateInfo is generated", async function (assert) {
		// Arrange
		const fnDone = assert.async();
		await this.loadModel("metadata2.xml");
		// Act
		const oResult = await TextArrangement.getAnnotationsChangeInfo(this.oControl);
		const oName = oResult.properties[0];
		// Assert
		assert.strictEqual(oResult.properties.length, 2, "Only visible fields are returned");
		assert.strictEqual(oName.propertyName, "Standard TextArrangement");
		assert.deepEqual(oName.currentValue, {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast"});
		assert.strictEqual(oName.annotationPath, "/dataServices/schema/0/entityType/[${name}==='Employee']/property/[${name}==='Name']/com.sap.vocabularies.Common.v1.Text/com.sap.vocabularies.UI.v1.TextArrangement");
		assert.ok(true, "No exception thrown");

		fnDone();
	});
});
