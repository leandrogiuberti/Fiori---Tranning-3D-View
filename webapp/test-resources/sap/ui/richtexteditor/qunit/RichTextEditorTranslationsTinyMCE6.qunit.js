/* global QUnit */
sap.ui.define([
	"sap/ui/richtexteditor/library",
	"sap/ui/core/Core",
	"sap/ui/richtexteditor/RichTextEditor",
	"sap/ui/richtexteditor/qunit/RichTextEditorCommonTranslationsTinyMCE6"
], function(library, Core, RichTextEditor, richTextEditorCommonTranslations) {
	"use strict";

	QUnit.config.testTimeout = 6000;

	// sap.ui.loader.config({
	// 	baseUrl: window.location.pathname.split(/\/(?:test-|)resources\//)[0] + "/resources"
	// });

	richTextEditorCommonTranslations(library.EditorType.TinyMCE6);
});
