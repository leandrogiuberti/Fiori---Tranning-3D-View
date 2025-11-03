/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

// Provides control sap.ui.richtexteditor.RichTextEditorFontFamily.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/base/Log",
	"./library"
], function(Element, Log, library) {
	"use strict";

	/**
	 * Constructor for a new <code>RichTextEditorFontFamily</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a font family option for <code>RichTextEditor</code>.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @public
	 * @alias sap.ui.richtexteditor.RichTextEditorFontFamily
	 */
	var RichTextEditorFontFamily = Element.extend("sap.ui.richtexteditor.RichTextEditorFontFamily", /** @lends sap.ui.richtexteditor.RichTextEditorFontFamily.prototype */ {
		metadata : {
			library : "sap.ui.richtexteditor",
			properties : {

				/**
				 * Used to identify the font in the editor.
				 * Names should be unique and descriptive.
				 */
				name : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * The text displayed in the font family dropdown.
				 */
				text : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * The value of the font family.
				 * CSS font-family value that will be applied to the text.
				 */
				value : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Used to load the font.
				 * The URL should point to a CSS file that defines the font-face.
				 */
				url : {type: "sap.ui.core.URI", group : "Data", defaultValue : null}
			}
		}
	});

	RichTextEditorFontFamily.prototype.validateProperty = function(sPropertyName, oValue) {
		if (sPropertyName === "url") {
			var sUrl = Element.prototype.validateProperty.call(this, sPropertyName, oValue);

			// Stronger validation to prevent CSS injection
			if (sUrl && /[<>()'"\\]|\/\*|\*\/|javascript:|data:/i.test(sUrl)) {
				Log.Error("RichTextEditorFontFamily: URL contains potentially dangerous characters: " + sUrl, this);
				return "";
			}

			return sUrl;
		}
		return Element.prototype.validateProperty.call(this, sPropertyName, oValue);
	};

	return RichTextEditorFontFamily;

});
