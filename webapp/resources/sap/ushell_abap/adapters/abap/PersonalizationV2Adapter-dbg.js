// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's personalization adapter for the ABAP
 *               platform.
 *               The internal data structure of the AdapterContainer corresponds to the
 *               ABAP EDM.
 *               Container header properties transported via pseudo-items are mapped to the
 *               respective header properties in setItem/getItem/delItem
 *
 * @version 1.141.0
 */
sap.ui.define([
    "./PersonalizationAdapter"
], (
    PersonalizationAdapter
) => {
    "use strict";

    return PersonalizationAdapter;
});
