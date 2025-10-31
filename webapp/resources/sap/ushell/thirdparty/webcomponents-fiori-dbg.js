sap.ui.define(['require', 'sap/ushell/thirdparty/webcomponents-base', 'sap/ushell/thirdparty/webcomponents', 'sap/ushell/thirdparty/Icons'], (function (require, webcomponentsBase, webcomponents, Icons) { 'use strict';

    // @ts-nocheck
    const loadThemeProperties = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css20'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_dark-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css21'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_hcb-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css22'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_hcw-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css23'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css24'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_dark-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css25'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hcb-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css26'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hcw-parameters-bundle" */ 'sap/ushell/thirdparty/_dynamics/parameters-bundle.css27'], resolve, reject); })).default;
            default: throw "unknown theme";
        }
    };
    const loadAndCheck = async (themeName) => {
        const data = await loadThemeProperties(themeName);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw"]
        .forEach(themeName => Icons.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", themeName, loadAndCheck));

    // @ts-nocheck
    const importMessageBundle = async (localeId) => {
        switch (localeId) {
            case "ar": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ar" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ar3'], resolve, reject); })).default;
            case "bg": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-bg" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_bg3'], resolve, reject); })).default;
            case "ca": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ca" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ca3'], resolve, reject); })).default;
            case "cnr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cnr" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_cnr3'], resolve, reject); })).default;
            case "cs": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cs" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_cs3'], resolve, reject); })).default;
            case "cy": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cy" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_cy3'], resolve, reject); })).default;
            case "da": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-da" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_da3'], resolve, reject); })).default;
            case "de": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-de" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_de3'], resolve, reject); })).default;
            case "el": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-el" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_el3'], resolve, reject); })).default;
            case "en": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_en4'], resolve, reject); })).default;
            case "en_GB": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_GB" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_en_GB3'], resolve, reject); })).default;
            case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_sappsd" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_en_US_sappsd4'], resolve, reject); })).default;
            case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_saprigi" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_en_US_saprigi4'], resolve, reject); })).default;
            case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_saptrc" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_en_US_saptrc4'], resolve, reject); })).default;
            case "es": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-es" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_es3'], resolve, reject); })).default;
            case "es_MX": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-es_MX" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_es_MX3'], resolve, reject); })).default;
            case "et": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-et" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_et3'], resolve, reject); })).default;
            case "fi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fi" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_fi3'], resolve, reject); })).default;
            case "fr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fr" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_fr3'], resolve, reject); })).default;
            case "fr_CA": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fr_CA" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_fr_CA3'], resolve, reject); })).default;
            case "hi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hi" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_hi3'], resolve, reject); })).default;
            case "hr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hr" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_hr3'], resolve, reject); })).default;
            case "hu": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hu" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_hu3'], resolve, reject); })).default;
            case "id": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-id" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_id3'], resolve, reject); })).default;
            case "it": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-it" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_it3'], resolve, reject); })).default;
            case "iw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-iw" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_iw3'], resolve, reject); })).default;
            case "ja": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ja" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ja3'], resolve, reject); })).default;
            case "kk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-kk" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_kk3'], resolve, reject); })).default;
            case "ko": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ko" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ko3'], resolve, reject); })).default;
            case "lt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-lt" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_lt3'], resolve, reject); })).default;
            case "lv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-lv" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_lv3'], resolve, reject); })).default;
            case "mk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-mk" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_mk3'], resolve, reject); })).default;
            case "ms": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ms" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ms3'], resolve, reject); })).default;
            case "nl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-nl" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_nl3'], resolve, reject); })).default;
            case "no": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-no" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_no3'], resolve, reject); })).default;
            case "pl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pl" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_pl3'], resolve, reject); })).default;
            case "pt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pt" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_pt3'], resolve, reject); })).default;
            case "pt_PT": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pt_PT" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_pt_PT3'], resolve, reject); })).default;
            case "ro": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ro" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ro3'], resolve, reject); })).default;
            case "ru": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ru" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_ru3'], resolve, reject); })).default;
            case "sh": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sh" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_sh3'], resolve, reject); })).default;
            case "sk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sk" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_sk3'], resolve, reject); })).default;
            case "sl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sl" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_sl3'], resolve, reject); })).default;
            case "sr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sr" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_sr3'], resolve, reject); })).default;
            case "sv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sv" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_sv3'], resolve, reject); })).default;
            case "th": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-th" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_th3'], resolve, reject); })).default;
            case "tr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-tr" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_tr3'], resolve, reject); })).default;
            case "uk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-uk" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_uk3'], resolve, reject); })).default;
            case "vi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-vi" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_vi3'], resolve, reject); })).default;
            case "zh_CN": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-zh_CN" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_zh_CN3'], resolve, reject); })).default;
            case "zh_TW": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-zh_TW" */ 'sap/ushell/thirdparty/_dynamics/messagebundle_zh_TW3'], resolve, reject); })).default;
            default: throw "unknown locale";
        }
    };
    const importAndCheck = async (localeId) => {
        const data = await importMessageBundle(localeId);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    const localeIds = ["ar",
        "bg",
        "ca",
        "cnr",
        "cs",
        "cy",
        "da",
        "de",
        "el",
        "en",
        "en_GB",
        "en_US_sappsd",
        "en_US_saprigi",
        "en_US_saptrc",
        "es",
        "es_MX",
        "et",
        "fi",
        "fr",
        "fr_CA",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "iw",
        "ja",
        "kk",
        "ko",
        "lt",
        "lv",
        "mk",
        "ms",
        "nl",
        "no",
        "pl",
        "pt",
        "pt_PT",
        "ro",
        "ru",
        "sh",
        "sk",
        "sl",
        "sr",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh_CN",
        "zh_TW",];
    localeIds.forEach(localeId => {
        Icons.$("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", localeId, importAndCheck);
    });

}));
