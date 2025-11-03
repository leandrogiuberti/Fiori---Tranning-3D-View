// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Personalization adapter for the CDM platform.
 *
 *
 * The CDM personalization adapter can be used to store data in the RA@ABAP platform.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/_Personalization/internals",
    "sap/ushell/utils/HttpClient"
], (oAdapterInternals, HttpClient) => {
    "use strict";

    return oAdapterInternals.PersonalizationAdapter.bind(null, HttpClient, null);
}, /* bExport = */ false);
