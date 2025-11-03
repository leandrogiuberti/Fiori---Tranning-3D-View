// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * Works similar to sap/ui/test/matchers/Ancestor. This matcher checks the DOM tree
 * instead of the control tree.
*/
sap.ui.define([
    "sap/ui/test/matchers/Matcher"
], (Matcher) => {
    "use strict";

    return Matcher.extend("sap.ushell.opa.matchers.DOMAncestor", {
        metadata: {
            publicMethods: [ "isMatching" ],
            properties: {
                ancestor: {
                    type: "sap.ui.core.Control"
                }
            }
        },
        isMatching: function (oChild) {
            const oChildDomRef = oChild.getDomRef();
            const oParentDomRef = this.getAncestor().getDomRef();
            return oParentDomRef.contains(oChildDomRef);
        }
    });
}, /* bExport= */ true);
