// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview This file handles the resource bundles.
 */

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/model/resource/ResourceModel"
], (
    Localization,
    ResourceModel
) => {
    "use strict";

    const oResources = {};

    oResources.i18n = null;
    oResources.i18nModel = new ResourceModel({
        bundleUrl: sap.ui.require.toUrl("sap/ushell/renderer/resources/resources.properties"),
        bundleLocale: Localization.getLanguage(),
        async: true
    });

    oResources._pResourceBundle = oResources.i18nModel.getResourceBundle().then((oResourceBundle) => {
        oResources.i18n = oResourceBundle;
    });

    // only after the awaitResourceBundle is done i18n property is set and getText is available
    oResources.awaitResourceBundle = async function () {
        await oResources._pResourceBundle;
    };

    /**
     * The function decodes given custom JSON string with translations and returns text in a current user language.
     * If JSON data does not contain current user language, default value is returned.
     * If the provided string is not a JSON file, the input string is returned under assumption, that the given text is the same for all languages.
     * The input JSON should have the following format:
     * <pre>
     * { "en-US" : "XYZ Corporation", "de" : "Firma XYZ", "default" : "XYZ"}
     * </pre>
     * @private
     * @since 1.124
     * @param {string} sJSON JSON string containing translated texts
     * @returns {string} Translated text or the input string, when the string is not a JSON model
     */
    oResources.getTranslationFromJSON = function (sJSON) {
        if (!sJSON) {
            return "";
        }

        try {
            const oTranslationTexts = JSON.parse(sJSON);
            const sCurrentLanguage = Localization.getLanguage().toLowerCase();

            // Exact match has highest priority
            for (const [key, text] of Object.entries(oTranslationTexts)) {
                if (key.toLowerCase() === sCurrentLanguage) {
                    return text;
                }
            }
            // Current language: "en" - take text from language key: "en-GB"
            // Current language: "en-GB" - take text from language key: "en"
            for (const [key, text] of Object.entries(oTranslationTexts)) {
                const sKey = key.toLowerCase();
                if (sKey.startsWith(sCurrentLanguage) || sCurrentLanguage.startsWith(sKey)) {
                    return text;
                }
            }
            // If the current user language is not in JSON, take the text under the "default" key
            return oTranslationTexts.default || "";
        } catch {
            // A customer may provide one text for all languages instead of JSON
            return sJSON;
        }
    };

    return oResources;
}, /* bExport= */ true);
