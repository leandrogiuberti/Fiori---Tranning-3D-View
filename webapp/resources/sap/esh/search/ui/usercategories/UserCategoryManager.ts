/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";
import { isSearchAppActive } from "sap/esh/search/ui/SearchHelper";
import { Sina } from "../sinaNexTS/sina/Sina";
import {
    UserCategoryDataSource,
    UserCategoryDataSourceProperties,
} from "../sinaNexTS/sina/UserCategoryDataSource";
import PersonalizationStorage from "../personalization/PersonalizationStorage";
import { ProgramError } from "../error/errors";
import { PersonalizationKeys } from "../personalization/PersonalizationKeys";

export interface UserCategoryManagerProperties {
    sina: Sina;
    personalizationStorage: PersonalizationStorage;
}

interface PersonalizationStorageItem {
    active: boolean;
    userCatgories: Array<{ id: string; includeApps: boolean; subDataSources: Array<{ id: string }> }>;
}

const myFavDataStore = PersonalizationKeys.myFavorites;

export default class UserCategoryManager {
    active: boolean;
    lastActive: boolean;
    categories: Array<UserCategoryDataSource>;
    personalizationStorage: PersonalizationStorage;
    sina: Sina;

    static async create(properties: UserCategoryManagerProperties): Promise<UserCategoryManager> {
        const instance = new UserCategoryManager(properties);
        await instance.initAsync();
        return instance;
    }

    constructor(properties: UserCategoryManagerProperties) {
        this.active = false;
        this.lastActive = false;
        this.categories = [];
        this.personalizationStorage = properties.personalizationStorage;
        this.sina = properties.sina;
    }
    initAsync(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        let userCategory;
        let sinaSubDataSources;
        const undefinedSubDataSourceIds = [];

        const myFavData = this.personalizationStorage.getItem(myFavDataStore);
        if (!this.isPersonalizationStorageItem(myFavData)) {
            throw new ProgramError(null, "wrong myFavData type");
        }

        /* // example for storage
                        personalizationStorageInstance.setItem('my-fav-data', {
                            active: true,
                            userCatgories: [{
                                id: 'MyFavorites',
                                includeApps: true
                                subDataSources: [{
                                    id: 'CD$ALL~ZESH_EPM_P_DEMO~'
                                }, {
                                    id: 'CD$ALL~ZESH_EPM_S_DEMO~'
                                }]
                            }]
                        });*/

        // No FavData exists
        if (!myFavData) {
            userCategory = this.sina.createDataSource({
                id: "MyFavorites",
                label: i18n.getText("label_userFavorites"),
                labelPlural: i18n.getText("label_userFavorites"),
                type: this.sina.DataSourceType.UserCategory,
                includeApps: false,
                subDataSources: [],
                undefinedSubDataSourceIds: [],
            } as UserCategoryDataSourceProperties);
            this.categories.push(userCategory);
            return Promise.resolve();
        }

        this.setFavActive(myFavData.active);
        if (!this.isFavActive()) {
            // null or undefined
            this.setFavActive(false);
        }
        this.setLastFavActive(this.isFavActive());

        // convert subDataSources from personalizationStorage into sina datasources
        // if not possible -> add subDataSource to undefinedSubDataSourceIds

        for (const favUserCategory of myFavData.userCatgories) {
            const subDataSources = favUserCategory.subDataSources;
            if (subDataSources) {
                sinaSubDataSources = subDataSources.map(function (dataSource) {
                    const sinaSubDataSource = that.sina.getDataSource(dataSource.id);
                    if (!sinaSubDataSource) {
                        undefinedSubDataSourceIds.push(dataSource.id);
                    }
                    return sinaSubDataSource;
                });
            } else {
                sinaSubDataSources = [];
            }

            // delete all undefined entries (datasources which do not exist currently)
            sinaSubDataSources = sinaSubDataSources.filter((x) => x);

            // DataSourceType.UserCategory: switch in sina.js createDataSource depending on DataSourceType
            userCategory = this.sina.createDataSource({
                id: favUserCategory.id,
                label: i18n.getText("label_userFavorites"),
                labelPlural: i18n.getText("label_userFavorites"),
                type: this.sina.DataSourceType.UserCategory,
                includeApps: favUserCategory.includeApps || false,
                subDataSources: sinaSubDataSources,
                undefinedSubDataSourceIds: undefinedSubDataSourceIds,
            } as UserCategoryDataSourceProperties);

            this.categories.push(userCategory);
        }
        return Promise.resolve();
    }

    isPersonalizationStorageItem(object: unknown): object is PersonalizationStorageItem {
        return true;
    }

    getCategory(id: string): UserCategoryDataSource {
        for (const category of this.categories) {
            if (category.id === id) {
                return category;
            }
        }
        return null;
    }

    isFavActive(): boolean {
        return this.active;
    }

    setFavActive(active: boolean): void {
        this.active = active;
    }

    isLastFavActive(): boolean {
        return this.lastActive;
    }

    setLastFavActive(value: boolean): void {
        this.lastActive = value;
    }

    save(): void {
        const categoriesJson = [];

        // check change of subDataSources
        // convert sina -> Fav format
        for (const category of this.categories) {
            const subDataSourceList = [];
            // add subDataSources (active)
            for (const subDataSource of category.subDataSources) {
                subDataSourceList.push({
                    id: subDataSource.id,
                });
            }
            // add undefinedSubDataSources (inactive)
            for (const undefinedSubDataSourceId of category.undefinedSubDataSourceIds) {
                subDataSourceList.push({
                    id: undefinedSubDataSourceId,
                });
            }

            categoriesJson.push({
                id: category.id,
                includeApps: category.includeApps,
                subDataSources: subDataSourceList,
            });
        }

        this.personalizationStorage.setItem(myFavDataStore, {
            active: this.isFavActive(),
            userCatgories: categoriesJson,
        });
        // save must be finished before reload
        // timeout necessary for MessageToast display with success message for save
        this.personalizationStorage.saveNotDelayed().then(
            function () {
                //search used and flag for 'Use Personalized Search Scope' changed => reset to home URL required
                //refresh of search dropdown listbox
                if (isSearchAppActive() && this.isLastFavActive() !== this.isFavActive()) {
                    const result = new RegExp(/^[^#]*#/).exec(window.location.href); //new RegExp('^[^#]*') without # /
                    const sUrl = result[0];
                    setTimeout(function () {
                        window.location.assign(sUrl);
                        window.location.reload();
                    }, 2000);
                } else if (
                    //search not used and flag for 'Use Personalized Search Scope' changed --> refresh of search dropdown listbox OR
                    //when search used and flag for 'Use Personalized Search Scope' not changed --> refresh for tree update after change of My Favorites
                    (!isSearchAppActive() && this.isLastFavActive() !== this.isFavActive()) ||
                    (isSearchAppActive() && this.isLastFavActive() === this.isFavActive())
                ) {
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                }
            }.bind(this)
        );
    }
}
