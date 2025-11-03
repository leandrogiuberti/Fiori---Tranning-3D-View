declare module "sap/esh/search/ui/appsearch/CatalogSearch" {
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
    interface FLPApp {
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
    interface ESHApp {
        title: string;
        subtitle: string;
        keywords: string;
        icon: string;
        label: string;
        visualization: FLPAppVisualization;
        url: string;
    }
    export default class CatalogSearch {
        private errorHandler;
        private initPromise;
        private searchEngine;
        private logger;
        constructor();
        private initAsync;
        private formatApps;
        prefetch(): void;
        search(query: {
            searchTerm: string;
            top: number;
            skip: number;
        }): Promise<{
            totalCount: number;
            tiles: Array<ESHApp>;
        }>;
    }
}
//# sourceMappingURL=CatalogSearch.d.ts.map