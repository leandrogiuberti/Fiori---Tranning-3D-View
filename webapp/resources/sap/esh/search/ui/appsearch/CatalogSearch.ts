/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ErrorHandler from "../error/ErrorHandler";
import device from "sap/ui/Device"; // TODO
import jsSearchFactory from "./JsSearchFactory";
import JsSearch from "sap/esh/search/ui/appsearch/JsSearch";
import Log from "sap/base/Log";
import { AppSearchError, AppSearchSearchTermExceedsLimitsError, ESHUIError } from "../error/errors";
import SearchModel from "../SearchModel";

interface FLPAppVisualization {
    id: string;
    vizId: string;
    vizType: string;
    title: string;
    subtitle: string;
    icon: string;
    info: string;
    keywords: string[];
    technicalAttributes: string[];
    target: {
        type: string;
        url: string;
    };
    targetURL: string;
}

export interface FLPApp {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    info: string;
    keywords: string[];
    technicalAttributes: string[];
    target: {
        type: string;
        url: string;
    };
    visualizations: Array<FLPAppVisualization>;
}

export interface ESHApp {
    title: string;
    subtitle: string;
    keywords: string;
    icon: string;
    label: string;
    visualization: FLPAppVisualization;
    url: string;
}

export default class CatalogSearch {
    private errorHandler: ErrorHandler;
    private initPromise: Promise<void>;
    private searchEngine: JsSearch;
    private logger = Log.getLogger("sap.esh.search.ui.appsearch.catalogsearch");

    constructor() {
        this.errorHandler = ErrorHandler.getInstance({ model: SearchModel.getModelSingleton({}, "flp") });
        this.initPromise = this.initAsync();
    }

    private async initAsync(): Promise<void> {
        // check cached promise
        if (this.initPromise) {
            return this.initPromise;
        }
        try {
            const searchService = await (window.sap.ushell as any).Container.getServiceAsync(
                "SearchableContent"
            );
            const flpApps = (await searchService.getApps()) as Array<FLPApp>;

            // format
            const apps = this.formatApps(flpApps);
            // add demo apps
            // apps.push(...this.createDemoApps());

            this.logger.debug(`Adding ${apps.length} flp apps to the search index`);

            // decide whether jsSearch should do normalization
            let shouldNormalize = true;
            const isIE = (device && device.browser && (device.browser as any).msie) || false;
            if (!String.prototype.normalize || isIE) {
                shouldNormalize = false;
            }

            // create js search engine
            this.searchEngine = jsSearchFactory.createJsSearch({
                objects: apps,
                fields: ["title", "subtitle", "keywords"],
                shouldNormalize: shouldNormalize,
                algorithm: {
                    id: "contains-ranked",
                    options: [50, 49, 40, 39, 5, 4, 51],
                },
            });
        } catch (error) {
            const flpError = new ESHUIError(
                "FLP SearchableContent Service Failed - App Search won't be available."
            );
            flpError.previous = error;
            throw flpError;
        }
    }

    /*private createDemoApps(): Array<ESHApp> {
        const apps: Array<ESHApp> = [];
        for (let i = 0; i < 15; ++i) {
            apps.push({
                title: "Generic App " + i,
                subtitle: "App",
                keywords: "app",
                icon: "sap-icon://product",
                label: "rudi",
                visualization: null,
                url: "#Shell-home",
            });
        }
        return apps;
    }*/

    private formatApps(apps: Array<FLPApp>): Array<ESHApp> {
        const resultApps = [];
        apps.forEach(function (app) {
            app.visualizations.forEach(function (vis) {
                let label = vis.title;
                if (vis.subtitle) {
                    label = label + " - " + vis.subtitle;
                }
                resultApps.push({
                    title: vis.title || "",
                    subtitle: vis.subtitle || "",
                    keywords: vis.keywords ? vis.keywords.join(" ") : "",
                    icon: vis.icon || "",
                    label: label,
                    visualization: vis,
                    url: vis.targetURL,
                });
            });
        });
        return resultApps;
    }

    prefetch(): void {
        // empty
    }

    async search(query: {
        searchTerm: string;
        top: number;
        skip: number;
    }): Promise<{ totalCount: number; tiles: Array<ESHApp> }> {
        // check length limit (for long search terms jssearch may freeze the UI because of too much regexp creation...)
        const searchTermLengthLimit = 1000;
        if (query.searchTerm?.length > searchTermLengthLimit) {
            throw new AppSearchSearchTermExceedsLimitsError(searchTermLengthLimit);
        }

        try {
            await this.initAsync();

            // use js search for searching
            const searchResults = this.searchEngine.search({
                searchFor: query.searchTerm || "*",
                top: query.top,
                skip: query.skip,
            });

            // convert to result structure
            const items: ESHApp[] = [];
            for (let i = 0; i < searchResults.results.length; ++i) {
                const result = searchResults.results[i];
                const formattedResult = Object.assign({}, result.object) as ESHApp;
                let highlightedLabel = formattedResult.title;
                let hasHighlightedSubtitle = false;
                if (typeof result.highlighted === "object" && result.highlighted) {
                    if ("title" in result.highlighted && typeof result.highlighted.title === "string") {
                        highlightedLabel = result.highlighted.title;
                    }
                    if ("subtitle" in result.highlighted && typeof result.highlighted.subtitle === "string") {
                        highlightedLabel = highlightedLabel + " - " + result.highlighted.subtitle;
                        hasHighlightedSubtitle = true;
                    }
                }
                if (!hasHighlightedSubtitle && formattedResult.subtitle) {
                    highlightedLabel = highlightedLabel + " - " + formattedResult.subtitle;
                }
                formattedResult.label = highlightedLabel;
                items.push(formattedResult);
            }

            // return search result
            return {
                totalCount: searchResults.totalCount,
                tiles: items,
            };
        } catch (error) {
            const appSearchError = new AppSearchError(error);
            appSearchError.previous = error;
            this.errorHandler.onError(appSearchError);
            return {
                totalCount: 0,
                tiles: [],
            };
        }
    }
}
