/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";
import JSONModel from "sap/ui/model/json/JSONModel";
import SearchModel from "sap/esh/search/ui/SearchModel";
import { UserCategoryDataSource } from "../sinaNexTS/sina/UserCategoryDataSource";
import UserCategoryManager from "../usercategories/UserCategoryManager";
import { Configuration } from "../sinaNexTS/sina/Configuration";
import { PersonalizationKeys } from "../personalization/PersonalizationKeys";

// model class for search preferences view
// =======================================================================

export default class SearchPrefsModel extends JSONModel {
    private searchModel: SearchModel;
    private initializePromise: Promise<void>;
    private userCategory: UserCategoryDataSource;
    private userCategoryManager: UserCategoryManager;
    private configuration: Configuration;

    //const path = "sap.esh.search.ui.userpref.SearchPrefsModel";
    asyncInit(): Promise<void> {
        // check cache
        if (this.initializePromise) {
            return this.initializePromise;
        }
        this.initializePromise = (async () => {
            // get search model
            this.searchModel = SearchModel.getModelSingleton({}, "flp") as SearchModel;

            // ensure that search model is initialized
            await this.searchModel.initAsync();

            // if bo search is disabled -> disable search prefs + return
            if (!this.searchModel.config.searchBusinessObjects) {
                this.setProperty("/isSearchPrefsActive", false);
                this.setProperty("/isPersonalizedSearchEditable", false);
                this.setProperty("/personalizedSearch", false);
                this.setProperty("/resetButtonWasClicked", false);
                return;
            }

            // activate search entry
            this.setProperty("/isSearchPrefsActive", true);

            // init subareas
            await this.initSearchPersonalization();
            await this.initMyFavorites();
            await this.initNlq();
        })();
        return this.initializePromise;
    }

    async initSearchPersonalization(): Promise<void> {
        const sinaNext = this.searchModel.sinaNext;
        // set property for visibility of Personalized Search area (oPersSearchVBox)
        // not visible in case of cross system search
        this.setProperty("/isPersonalizedSearchAreaVisible", sinaNext.provider.id === "multi" ? false : true);
        this.configuration = await sinaNext.getConfigurationAsync();
        this.setProperty("/isPersonalizedSearchEditable", this.configuration.isPersonalizedSearchEditable);
        this.setProperty("/personalizedSearch", this.configuration.personalizedSearch);
        this.setProperty("/resetButtonWasClicked", false);
    }

    async initMyFavorites(): Promise<void> {
        this.setProperty("/isMyFavoritesAvailable", this.searchModel.isMyFavoritesAvailable());
        if (this.searchModel.isMyFavoritesAvailable()) {
            this.initSubDataSources();
        }
    }

    reload(): Promise<void> {
        return this.asyncInit();
    }

    initSubDataSources(): void {
        const newDS = [];

        this.searchModel.getUserCategoryManager().then((userCategoryManager) => {
            this.userCategoryManager = userCategoryManager;
            this.userCategory = userCategoryManager.getCategory("MyFavorites");
            // get datasources from sina
            const dataSources = this.searchModel.sinaNext.dataSources;

            dataSources
                .filter(
                    (x) =>
                        (x.type === this.searchModel.sinaNext.DataSourceType.BusinessObject ||
                            x === this.searchModel.appDataSource) &&
                        x.id !== "CD$ALL~ESH_TRANSACTION~"
                )
                .forEach((x) => {
                    if (x === this.searchModel.appDataSource) {
                        newDS.unshift({
                            id: x.id,
                            label: x.labelPlural,
                            selected: this.userCategory.isIncludeApps(),
                            undefined: false,
                        });
                    } else {
                        newDS.push({
                            id: x.id,
                            label: x.labelPlural,
                            selected: this.userCategory.hasSubDataSource(x.id),
                            undefined: false,
                        });
                    }
                });

            // add undefinedSubDataSources to the top of the list
            const undefinedSubDataSources = this.userCategory.getUndefinedSubDataSourceIds().reverse();
            for (const undefinedSubDataSource of undefinedSubDataSources) {
                newDS.unshift({
                    id: undefinedSubDataSource,
                    label: undefinedSubDataSource + " " + i18n.getText("sp.connectorNotExists"),
                    selected: true,
                    undefined: true,
                });
            }

            this.setProperty("/favActive", this.userCategoryManager.isFavActive());

            this.setProperty("/subDataSources", newDS);
            this.setProperty("/dataSourceCount", this.getNumberSubDataSources());
            this.setProperty("/selectedDataSourceCount", this.getNumberSelectedSubDataSources());
        });
    }

    async initNlq(): Promise<void> {
        // visibility of area
        const isNlqAreaVisible = !!(
            this.searchModel.config.aiNlq && this.searchModel.sinaNext.capabilities.nlq
        );
        this.setProperty("/isNlqAreaVisible", isNlqAreaVisible);
        if (!isNlqAreaVisible) {
            return;
        }

        // nlq active checkbox
        const nlqActive = this.searchModel
            .getPersonalizationStorageInstance()
            .getItem(PersonalizationKeys.nlqActive);
        this.setProperty("/nlqActive", nlqActive);

        // nlq data sources list
        if (this.searchModel.sinaNext.capabilities.nlqEnabledInfoOnDataSource) {
            const nlqDataSources = this.searchModel.sinaNext.dataSources.filter((ds) => ds.nlq);
            this.setProperty("/nlqDataSources", nlqDataSources);
            this.setProperty("/nlqEnabledInfoOnDataSource", true);
        } else {
            this.setProperty("/nlqDataSources", []);
            this.setProperty("/nlqEnabledInfoOnDataSource", false);
        }
    }

    async saveNlq(): Promise<void> {
        this.searchModel
            .getPersonalizationStorageInstance()
            .setItem(PersonalizationKeys.nlqActive, this.getProperty("/nlqActive"));
        await this.searchModel.getPersonalizationStorageInstance().save();
        this.searchModel.calculateIsNlqActive();
    }

    getNumberSubDataSources(): number {
        return this.getProperty("/subDataSources").length;
    }

    getNumberSelectedSubDataSources(): number {
        return this.getProperty("/subDataSources").filter((x) => x.selected).length; //x.selected === true)
    }

    saveSubDataSources(): void {
        const subDataSources = this.getProperty("/subDataSources");
        this.userCategory.setIncludeApps(false);
        this.userCategoryManager.setFavActive(this.getProperty("/favActive"));
        this.userCategory.clearSubDataSources();
        this.userCategory.clearUndefinedSubDataSourceIds();

        for (const subDataSource of subDataSources) {
            if (subDataSource.selected === true) {
                if (subDataSource.id === this.searchModel.appDataSource.id) {
                    this.userCategory.setIncludeApps(true);
                } else {
                    const sinaSubDataSource = this.userCategoryManager.sina.getDataSource(subDataSource.id);
                    if (sinaSubDataSource) {
                        this.userCategory.addSubDataSource(sinaSubDataSource);
                    } else {
                        this.userCategory.addUndefinedSubDataSourceId(subDataSource.id);
                    }
                }
            }
        }
        this.userCategoryManager.save();
    }

    //not used in future -> delete
    shortStatus(): Promise<string> {
        return this.asyncInit().then(() => {
            return this.getProperty("/personalizedSearch") ? i18n.getText("sp.on") : i18n.getText("sp.off");
        });
    }

    isPersonalizedSearchActive(): Promise<boolean> {
        return this.asyncInit().then(() => {
            return this.getProperty("/personalizedSearch");
        });
    }

    isSearchPrefsActive(): Promise<boolean> {
        return this.asyncInit().then(() => {
            return this.getProperty("/isSearchPrefsActive");
        });
    }

    isMultiProvider(): Promise<boolean> {
        return this.asyncInit().then(() => {
            return this.searchModel.sinaNext.provider.id === "multi";
        });
    }

    async savePreferences() {
        // nlq
        await this.saveNlq();
        // my favorites
        if (this.searchModel.isMyFavoritesAvailable()) {
            this.saveSubDataSources();
        }
        // search personaization
        if (this.configuration.isPersonalizedSearchEditable) {
            this.configuration.setPersonalizedSearch(this.getProperty("/personalizedSearch"));
            await this.configuration.saveAsync();
        }
        this.setProperty("/resetButtonWasClicked", false);
    }

    cancelPreferences(): void {
        this.setProperty("/personalizedSearch", this.configuration.personalizedSearch);
        this.setProperty("/resetButtonWasClicked", false);
        this.initNlq();
    }

    resetProfile(): Promise<void> {
        return this.configuration.resetPersonalizedSearchDataAsync().then(() => {
            this.setProperty("/resetButtonWasClicked", true);
        });
    }
}
