declare module "sap/esh/search/ui/usercategories/UserCategoryManager" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { UserCategoryDataSource } from "../sinaNexTS/sina/UserCategoryDataSource";
    import PersonalizationStorage from "sap/esh/search/ui/personalization/PersonalizationStorage";
    import { PersonalizationKeys } from "sap/esh/search/ui/personalization/PersonalizationKeys";
    interface UserCategoryManagerProperties {
        sina: Sina;
        personalizationStorage: PersonalizationStorage;
    }
    interface PersonalizationStorageItem {
        active: boolean;
        userCatgories: Array<{
            id: string;
            includeApps: boolean;
            subDataSources: Array<{
                id: string;
            }>;
        }>;
    }
    const myFavDataStore = PersonalizationKeys.myFavorites;
    export default class UserCategoryManager {
        active: boolean;
        lastActive: boolean;
        categories: Array<UserCategoryDataSource>;
        personalizationStorage: PersonalizationStorage;
        sina: Sina;
        static create(properties: UserCategoryManagerProperties): Promise<UserCategoryManager>;
        constructor(properties: UserCategoryManagerProperties);
        initAsync(): Promise<void>;
        isPersonalizationStorageItem(object: unknown): object is PersonalizationStorageItem;
        getCategory(id: string): UserCategoryDataSource;
        isFavActive(): boolean;
        setFavActive(active: boolean): void;
        isLastFavActive(): boolean;
        setLastFavActive(value: boolean): void;
        save(): void;
    }
}
//# sourceMappingURL=UserCategoryManager.d.ts.map