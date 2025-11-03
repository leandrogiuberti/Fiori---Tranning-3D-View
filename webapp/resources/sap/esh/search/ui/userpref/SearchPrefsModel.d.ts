declare module "sap/esh/search/ui/userpref/SearchPrefsModel" {
    import JSONModel from "sap/ui/model/json/JSONModel";
    export default class SearchPrefsModel extends JSONModel {
        private searchModel;
        private initializePromise;
        private userCategory;
        private userCategoryManager;
        private configuration;
        asyncInit(): Promise<void>;
        initSearchPersonalization(): Promise<void>;
        initMyFavorites(): Promise<void>;
        reload(): Promise<void>;
        initSubDataSources(): void;
        initNlq(): Promise<void>;
        saveNlq(): Promise<void>;
        getNumberSubDataSources(): number;
        getNumberSelectedSubDataSources(): number;
        saveSubDataSources(): void;
        shortStatus(): Promise<string>;
        isPersonalizedSearchActive(): Promise<boolean>;
        isSearchPrefsActive(): Promise<boolean>;
        isMultiProvider(): Promise<boolean>;
        savePreferences(): Promise<void>;
        cancelPreferences(): void;
        resetProfile(): Promise<void>;
    }
}
//# sourceMappingURL=SearchPrefsModel.d.ts.map