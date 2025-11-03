// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/fetch",
    "sap/ushell/components/cepsearchresult/app/util/controls/Category",
    "./TestApplication",
    "sap/ui/core/ComponentSupport"
], (
    fetch,
    Category
) => {
    "use strict";

    Category.prototype._iTestFetchDelay = 100;

    // override fetchData of the category
    Category.prototype.fetchData = function (sSearchTerm, iSkip, iTop) {
        const sCategoryName = this.getKey();
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(
                    fetch(
                        sap.ui.require.toUrl(`sap/ushell/test/components/cepsearchresult/app/result_${sCategoryName}.json`)
                    ).then((oResp) => {
                        return oResp.json();
                    }).then((oJson) => {
                        oJson.results = oJson.results.concat(oJson.results);
                        oJson.results = oJson.results.filter((o) => {
                            for (const n in o) {
                                if (typeof o[n] === "string") {
                                    return o[n].toUpperCase().indexOf(sSearchTerm.toUpperCase()) > -1;
                                }
                            }
                        });
                        return {
                            count: oJson.results.length,
                            data: oJson.results.slice(iSkip, iSkip + iTop)
                        };
                    })
                );
            }, Category.prototype._iTestFetchDelay);
        });
    };

    Category.prototype.fetchCount = function (sSearchTerm, iSkip, iTop) {
        return this.fetchData(sSearchTerm, iSkip, iTop).then((oData) => {
            oData.data = [];
            return oData;
        });
    };
});
