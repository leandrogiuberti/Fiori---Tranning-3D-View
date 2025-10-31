// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Provide mock feature group data
 *
 * @version 1.141.1
 * @private
 */
sap.ui.define([
    "sap/ushell/resources"
], (
    ushellResources
) => {
    "use strict";

    const oFeaturedGroupConfig = {};

    function getSite () {
        const sGroupTitle = ushellResources.i18n.getText("featuredGroup.title");
        const sRecentActivity = ushellResources.i18n.getText("recentActivities");
        const sFrequentlyUsed = ushellResources.i18n.getText("frequentActivities");
        const sTop = ushellResources.i18n.getText("top", [4]);
        const oFeaturedGroupSite = {
            _version: "3.0.0",
            site: {
                identification: {
                    version: "3.0",
                    id: "c9dcc1f3-dec0-4db4-91d3-639bf38d91ce",
                    title: "Featured Group",
                    description: "Sample site for featured group cards"
                },
                payload: { groupsOrder: ["FeaturedGroupCards"] }
            },
            catalogs: {},
            vizTypes: {
                "sap.ushell.Card": {
                    "sap.app": {
                        id: "sap.ushell.Card",
                        type: "card",
                        applicationVersion: { version: "1.0.0" }
                    },
                    "sap.ui": {
                        deviceTypes: {
                            desktop: true,
                            tablet: true,
                            phone: true
                        }
                    }
                }
            },
            visualizations: {
                FrequentCard: {
                    vizType: "sap.ushell.Card",
                    businessApp: "fin.cash.bankmaster.manage.BusinessApp",
                    target: {
                        appId: "fin.cash.bankmaster.manage",
                        inboundId: "Bank-manage",
                        parameters: {}
                    },
                    vizConfig: {
                        "sap.flp": {
                            columns: "4",
                            rows: "4"
                        },
                        "sap.app": {
                            id: "FrequentCard",
                            type: "card"
                        },
                        "sap.card": {
                            extension: "module:sap/ushell/ui/cards/FrequentActivitiesExtension",
                            data: {
                                extension: {
                                    method: "getData"
                                }
                            },
                            type: "List",
                            header: {
                                title: sFrequentlyUsed,
                                status: { text: sTop },
                                actions: [{
                                    type: "Navigation",
                                    parameters: { openUI: "FrequentActivities" }
                                }]
                            },
                            content: {
                                maxItems: 4,
                                item: {
                                    title: { value: "{Name}" },
                                    description: { value: "{Description}" },
                                    highlight: "{Highlight}",
                                    icon: {
                                        src: "{Icon}",
                                        label: "icon"
                                    },
                                    actions: [{
                                        type: "Navigation",
                                        enabled: "{Enabled}",
                                        parameters: {
                                            title: "{Name}",
                                            url: "{Url}",
                                            intentSemanticObject: "{Intent/SemanticObject}",
                                            intentAction: "{Intent/Action}",
                                            intentAppRoute: "{Intent/AppSpecificRoute}",
                                            intentParameters: "{Intent/Parameters}"
                                        }
                                    }]
                                }
                            }
                        }
                    }
                },
                RecentCard: {
                    vizType: "sap.ushell.Card",
                    businessApp: "fin.cash.bankmaster.manage.BusinessApp",
                    target: {
                        appId: "fin.cash.bankmaster.manage",
                        inboundId: "Bank-manage",
                        parameters: {}
                    },
                    vizConfig: {
                        "sap.flp": {
                            columns: "4",
                            rows: "4"
                        },
                        "sap.app": {
                            id: "RecentCard",
                            type: "card"
                        },
                        "sap.card": {
                            extension: "module:sap/ushell/ui/cards/RecentActivitiesExtension",
                            type: "List",
                            data: {
                                extension: {
                                    method: "getData"
                                }
                            },
                            header: {
                                title: sRecentActivity,
                                status: { text: sTop },
                                actions: [{
                                    type: "Navigation",
                                    parameters: { openUI: "RecentActivities" }
                                }]
                            },
                            content: {
                                maxItems: 4,
                                item: {
                                    title: {
                                        label: "{{title_label}}",
                                        value: "{Name}"
                                    },
                                    description: {
                                        label: "{{description_label}}",
                                        value: "{Description}"
                                    },
                                    icon: {
                                        src: "{Icon}",
                                        label: "icon"
                                    },
                                    highlight: "{Highlight}",
                                    actions: [{
                                        type: "Navigation",
                                        enabled: "{Enabled}",
                                        parameters: {
                                            title: "{Name}",
                                            url: "{Url}",
                                            intentSemanticObject: "{Intent/SemanticObject}",
                                            intentAction: "{Intent/Action}",
                                            intentAppRoute: "{Intent/AppSpecificRoute}",
                                            intentParameters: "{Intent/Parameters}"
                                        }
                                    }]
                                }
                            }
                        }
                    }
                }
            },
            applications: {},
            groups: {
                FeaturedGroupCards: {
                    identification: {
                        id: "FeaturedGroupCards",
                        title: sGroupTitle
                    },
                    contentProvider: "featured",
                    isFeatured: true,
                    payload: {
                        locked: true,
                        tiles: [{
                            id: "frequentCard",
                            vizId: "FrequentCard",
                            contentProvider: "featured"
                        }, {
                            id: "recentCard",
                            vizId: "RecentCard",
                            contentProvider: "featured"
                        }],
                        links: [],
                        groups: []
                    }
                }
            },
            systemAliases: {}
        };
        return oFeaturedGroupSite;
    }

    oFeaturedGroupConfig.getMockAdapterConfig = function (bEnableFrequentCard, bEnableRecentCard) {
        const oFeaturedGroupSite = getSite();
        const aTiles = oFeaturedGroupSite.groups.FeaturedGroupCards.payload.tiles;
        const oVisualizations = oFeaturedGroupSite.visualizations;

        for (let i = 0; i < aTiles.length; i++) {
            const oTile = aTiles[i];
            const bSwitchOffFrequentCard = !bEnableFrequentCard && oTile.vizId === "FrequentCard";
            const bSwitchOffRecentCard = !bEnableRecentCard && oTile.vizId === "RecentCard";

            if (bSwitchOffFrequentCard || bSwitchOffRecentCard) {
                delete oVisualizations[oTile.vizId];
                aTiles.splice(i, 1);
                i--;
            }
        }

        return oFeaturedGroupSite;
    };

    return oFeaturedGroupConfig;
}, /* bExport = */ true);
