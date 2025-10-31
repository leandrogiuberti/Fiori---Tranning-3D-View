// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.ReferenceResolver}.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr"
], (
    AppCommunicationMgr
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.ReferenceResolver
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.ReferenceResolver}.
     *
     * @hideconstructor
     *
     * @private
     */
    function ReferenceResolverProxy () {
        this.resolveReferences = function (aReferences, oSystemContext) {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.ReferenceResolver.resolveReferences", {
                aReferences: aReferences
            });
        };
    }

    ReferenceResolverProxy.hasNoAdapter = true;

    return ReferenceResolverProxy;
});
