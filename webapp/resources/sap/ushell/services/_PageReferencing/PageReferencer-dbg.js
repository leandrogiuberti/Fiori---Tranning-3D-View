// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This module is responsible to create reference pages,
 * which are shareable JSON representations of layout and navigation targets in the specific format.
 *
 * @version 1.141.1
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container"
], (
    deepExtend,
    jQuery,
    Container
) => {
    "use strict";

    const PageReferencer = {};

    function getPermanentKeys (aPageLayout, NavTargetResolutionInternal) {
        const oResult = {};
        aPageLayout.forEach((oSection) => {
            oSection.viz.forEach((oTile) => {
                const sTarget = oTile.target;
                if (sTarget && !oResult[sTarget]) {
                    oResult[sTarget] = NavTargetResolutionInternal.resolveHashFragment(sTarget);
                }
            });
        });

        return new Promise((fnResolve, fnReject) => {
            const aPromises = [];
            Object.keys(oResult).forEach((sHash) => {
                aPromises.push(oResult[sHash]);
            });
            jQuery.when.apply(null, aPromises).then(function () {
                const aResolutionResult = arguments;
                Object.keys(oResult).forEach((sHash, index) => {
                    oResult[sHash] = aResolutionResult[index].inboundPermanentKey;
                });
                fnResolve(oResult);
            }).catch(fnReject);
        });
    }

    function _createVisualization (oPermanentKeys, oTile) {
        return {
            inboundPermanentKey: oPermanentKeys[oTile.target],
            vizId: oTile.tileCatalogId
        };
    }

    function _createSection (oPermanentKeys, oSection) {
        return {
            id: oSection.id,
            title: oSection.title,
            visualizations: oSection.viz.map(_createVisualization.bind(null, oPermanentKeys))
        };
    }

    PageReferencer.createReferencePage = function (oPageInfo, aPageGroups) {
        aPageGroups = aPageGroups || []; // TODO: remove "aPageGroups" argument and cleanup the code
        return Container.getServiceAsync("NavTargetResolutionInternal")
            .then(getPermanentKeys.bind(null, aPageGroups))
            .then((oPermanentKeys) => {
                const oResult = deepExtend({}, oPageInfo);
                oResult.sections = aPageGroups.map(_createSection.bind(null, oPermanentKeys));
                return Promise.resolve(oResult);
            });
    };

    return PageReferencer;
});
