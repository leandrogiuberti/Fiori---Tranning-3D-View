declare module "sap/esh/search/ui/appsearch/AppSearch" {
    export default class AppSearch {
        private catalogSearch;
        private searchProviders;
        constructor();
        prefetch(): void;
        search(query: {
            searchTerm: string;
            top: number;
            skip: number;
        }): Promise<{
            totalCount: number;
            tiles: Array<unknown>;
        }>;
    }
}
//# sourceMappingURL=AppSearch.d.ts.map