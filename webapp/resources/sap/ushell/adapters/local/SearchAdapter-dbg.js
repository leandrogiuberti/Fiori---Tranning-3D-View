// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview The Search adapter for the demo platform.
 *
 * @version 1.141.0
 */
sap.ui.define([
], () => {
    "use strict";

    function SearchAdapter (oSystem, sParameter, oAdapterConfiguration) {
        this.isSearchAvailable = function () {
            return Promise.resolve(true);
        };
    }

    return SearchAdapter;
});
