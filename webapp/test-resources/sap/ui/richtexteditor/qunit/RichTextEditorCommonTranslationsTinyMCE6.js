
/* global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/richtexteditor/RichTextEditor",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Localization, RichTextEditor, Button, Device, Core, nextUIUpdate) {
	"use strict";

	// sap.ui.loader.config({
	// 	baseUrl: window.location.pathname.split(/\/(?:test-|)resources\//)[0] + "/resources"
	// });

	return function runRTECommonTranslations(sEditorType) {
		QUnit.module("Languages");

		async function setLanguage(sLang) {
			Localization.setLanguage(sLang);
			await nextUIUpdate();
		}

		var aLanguages = [
			"ar", "bg", "ca", "cs", "cy", "da", "de", "el", "en_GB", "es_MX", "es" , "fi", "fr_CA", "fr", "hi",
			"hr", "hu", "id", "it", "iw", "ja", "kk", "ko", "lt", "lv",
			/* "ms", */ // Malaysian is not supported by TinyMCE that is why we will not test it for now
			"nl", "no", "pl", "pt_PT", "pt", "ro", "ru",
			"sr", "sk", "sl", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_TW"
		];

		var fnLanguagesCheck = async function (sLang, assert) {
			var done = assert.async();

			// Some of the language codes in TinyMCE are not the same as in UI5
			if (RichTextEditor.MAPPED_LANGUAGES_TINYMCE[sLang]) {
				sLang = RichTextEditor.MAPPED_LANGUAGES_TINYMCE[sLang];
			}

			await setLanguage(sLang);

			var oRichTextEditor = new RichTextEditor("myRTELanguages-" + sLang, {
				editorType: sEditorType
			});
			var oSpy = sinon.spy(oRichTextEditor, "_getLanguageTinyMCE");

			oRichTextEditor.attachReady(function () {
				var sLangString = oSpy.returnValues[0];
				var bTinyMCE7 = sEditorType === "TinyMCE7";

				assert.strictEqual(sLangString.indexOf(sLang) === 0, true, sLang + " language should be set. " + sLangString + " is currently set.");

				assert.ok(oRichTextEditor.getNativeApi().editorManager.i18n.getData()[sLangString], sLang + " The TinyMCE language should be set." + sLangString + " is currently set.");

				sap.ui.require(["sap/ui/richtexteditor/js/" + (bTinyMCE7 ? "tiny_mce7" : "tiny_mce6") + "/langs/" + sLangString],
					function () {
						assert.ok(true, `${sEditorType}: The language file was found.`);
						oRichTextEditor.destroy();
						setTimeout(done);
					},
					function () {
						assert.notOk(true, "The language file was not found!");
						oRichTextEditor.destroy();
						setTimeout(done);
					}
				);
			});

			oRichTextEditor.placeAt("content");
			await nextUIUpdate();
		};

		for (var i = 0; i < aLanguages.length; ++i) {
			const sLang = aLanguages[i];
			QUnit.test("Language - " + sLang, async function(assert){ await fnLanguagesCheck.bind(this, sLang)(assert); });
		}
	};
});
