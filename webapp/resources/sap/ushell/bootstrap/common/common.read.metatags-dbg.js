// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Reads meta tags based on the provided Prefix.
 * Parses each value of a meta tag to an array of object by a given a parse; default is JSON parser.
 */
sap.ui.define(["sap/base/Log"], (Log) => {
    "use strict";

    function fnReadMetaTags (sMetaPrefix, fnParse) {
        const sSelector = `meta[name^='${sMetaPrefix}']:not([name=''])`;
        const oMetaNodeList = document.querySelectorAll(sSelector);
        const S_COMPONENT = "sap/ushell/bootstrap/common/common.read.metatags";

        const aItems = [];
        fnParse = fnParse || JSON.parse;

        Array.prototype.forEach.call(oMetaNodeList, (oMetaNode) => {
            try {
                aItems.push(fnParse(oMetaNode.content));
            } catch (oError) {
                Log.error("Metatag Read failed", oError, S_COMPONENT);
            }
        });

        return aItems;
    }

    return { readMetaTags: fnReadMetaTags };
});
