/* global QUnit */
sap.ui.define([
	"sap/ui/comp/smartform/GroupElement",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/comp/smartfield/SmartField",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/thirdparty/sinon-4"
], function(
		GroupElement,
		SmartForm,
		SmartField,
		FeaturesAPI,
		Sinon
	){
	"use strict";

	const sandbox = Sinon.createSandbox();

	QUnit.module("GroupElement", {
		beforeEach: function() {
			this.oGE = new GroupElement();
			sandbox.stub(FeaturesAPI, "areAnnotationChangesEnabled").returns(true);
		},
		afterEach: function() {
			this.oGE.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("No annotation actions when no SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async();

		this.oGE.getMetadata().loadDesignTime().then((oMetadata) => {
			const oReturn = oMetadata.actions.annotation(this.oGE);

			// Assert
			assert.notOk(oReturn.hasOwnProperty("textArrangement"));
			assert.notOk(oReturn.hasOwnProperty("rename"));

			// Cleanup
			fnDone();
		});
	});

	QUnit.test("Annotation actions with SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async();
		this.oGE.addElement(new SmartField());

		this.oGE.getMetadata().loadDesignTime().then((oMetadata) => {
			const oReturn = oMetadata.actions.annotation(this.oGE);

			// Assert
			assert.ok(oReturn.hasOwnProperty("textArrangement"));
			assert.ok(oReturn.hasOwnProperty("rename"));

			// Cleanup
			fnDone();
		});
	});

	QUnit.test("Legacy rename enabled when no SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async();

		this.oGE.getMetadata().loadDesignTime().then((oMetadata) => {
			const oReturn = oMetadata.actions.rename(this.oGE);

			// Assert
			assert.ok(oReturn.hasOwnProperty("changeType"));
			assert.strictEqual(oReturn.changeType, "renameField");

			// Cleanup
			fnDone();
		});
	});

	QUnit.test("Legacy rename enabled when no SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async();
		this.oGE.addElement(new SmartField());

		this.oGE.getMetadata().loadDesignTime().then((oMetadata) => {
			const oReturn = oMetadata.actions.rename(this.oGE);

			// Assert
			assert.notOk(oReturn.hasOwnProperty("changeType"));

			// Cleanup
			fnDone();
		});
	});

	QUnit.test("SNOW: DINC0558329 Legacy rename only when multiple (combined) SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async(),
			  oGE = this.oGE;

		oGE.addElement(new SmartField()).addElement(new SmartField());

		oGE.getMetadata().loadDesignTime().then(({ actions: oActions }) => {
			// Assert
			assert.ok(oActions.rename(this.oGE).hasOwnProperty("changeType"));
			assert.notOk(oActions.annotation(this.oGE).hasOwnProperty("rename"));
			fnDone();
		});
	});

	QUnit.module("SmartForm", {
		beforeEach: function() {
			this.oSF = new SmartForm();
		},
		teardown: function() {
			this.oSF.destroy();
		}
	});

	QUnit.test("No annotation actions when no SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async();

		this.oSF.getMetadata().loadDesignTime().then((oMetadata) => {
			const oReturn = oMetadata.actions.annotation(this.oSF);

			// Assert
			assert.notOk(oReturn.hasOwnProperty("textArrangement"));
			assert.notOk(oReturn.hasOwnProperty("label"));

			// Cleanup
			fnDone();
		});
	});

	QUnit.test("Annotation actions with SmartFields", function(assert) {
		// Arrange
		const fnDone = assert.async();
		sandbox.stub(this.oSF, "getSmartFields").returns([new SmartField()]);

		this.oSF.getMetadata().loadDesignTime().then((oMetadata) => {
			const oReturn = oMetadata.actions.annotation(this.oSF);

			// Assert
			assert.ok(oReturn.hasOwnProperty("textArrangement"));
			assert.ok(oReturn.hasOwnProperty("label"));

			// Cleanup
			sandbox.restore();
			fnDone();
		});
	});

});
