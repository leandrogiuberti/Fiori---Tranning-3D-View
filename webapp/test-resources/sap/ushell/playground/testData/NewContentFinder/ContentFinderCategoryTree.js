// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    // every tenth catalog will have no provider
    function generateNodes (count) {
        const nodes = [];
        let oCatalog = {};
        for (let i = 1; i <= count; i++) {
            oCatalog = {
                id: i.toString(),
                title: `My Catalog ${i}`,
                contentProviderId: `providerId_${i}`,
                contentProviderLabel: `Provider Label ${i}`
            };
            if (!(i % 10)) {
                oCatalog.title = `${oCatalog.title} without provider`;
                oCatalog.contentProviderId = null;
                oCatalog.contentProviderLabel = null;
            }
            if (!(i % 11)) {
                oCatalog.title = `${oCatalog.title} with provider and a very long name aaaaaaaaaaa`;
            }
            nodes.push(oCatalog);
        }
        return nodes;
    }

    const aCategoryTree = [
        {
            id: "cat0",
            title: "All Apps",
            filterIsTitle: true,
            inactive: false,
            allowedFilters: ["tiles", "cards"]
        },
        {
            id: "cat1",
            title: "Catalogs",
            filterIsTitle: false,
            inactive: true,
            allowedFilters: ["tiles", "cards"],
            nodes: generateNodes(1000)
        }
    ];

    return aCategoryTree;
});
