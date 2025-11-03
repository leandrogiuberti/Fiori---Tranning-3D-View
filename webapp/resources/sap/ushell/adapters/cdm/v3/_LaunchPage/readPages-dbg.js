// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper for accessing pages data for the 'CDM' platform.
 *
 * @version 1.141.0
 * @private
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/base/util/values"
], (
    ObjectPath,
    objectValues
) => {
    "use strict";

    const readPages = {};

    /**
     * Returns all vizReference of a single page
     * @param {object} oPage The page object of the site
     * @returns {object[]} An array of all vizReferences in the page
     *
     * @since 1.77.0
     * @private
     */
    readPages.getVisualizationReferences = function (oPage) {
        let aVizOrder;
        const aVisualizations = [];
        const oSections = ObjectPath.get("payload.sections", oPage) || {};
        objectValues(oSections).forEach((oSection) => {
            aVizOrder = ObjectPath.get("layout.vizOrder", oSection) || [];
            aVizOrder.forEach((sVizId) => {
                if (oSection.viz[sVizId]) {
                    aVisualizations.push(oSection.viz[sVizId]);
                }
            });
        });
        return aVisualizations;
    };

    return readPages;
});
