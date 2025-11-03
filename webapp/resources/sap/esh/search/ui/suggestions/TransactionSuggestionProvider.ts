/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import { DataSourceType } from "../sinaNexTS/sina/DataSourceType";
import { Filter } from "../sinaNexTS/sina/Filter";
import { Sina } from "../sinaNexTS/sina/Sina";
import { SuggestionQuery } from "../sinaNexTS/sina/SuggestionQuery";
import { SuggestionProvider } from "./SuggestionProvider";
import SuggestionType, { UISinaObjectSuggestion } from "./SuggestionType";
import { Type } from "./SuggestionType";
import CrossApplicationNavigation from "sap/ushell/services/CrossApplicationNavigation";
import SuggestionHandler from "./SuggestionHandler";
import { ObjectSuggestion } from "../sinaNexTS/sina/ObjectSuggestion";
import Formatter from "./SinaObjectSuggestionFormatter";
import BackendSystem from "../flp/BackendSystem";
import FrontendSystem from "../flp/FrontendSystem";
import Device from "sap/ui/Device";
import Container from "sap/ushell/Container";

export interface TransactionSuggestion extends UISinaObjectSuggestion {
    searchTerm: string;
    uiSuggestionType: Type.Transaction;
    position: number;
    key: string;
    url: string;
    icon: "sap-icon://generate-shortcut";
}

export default class TransactionSuggestionProvider implements SuggestionProvider {
    readonly model: SearchModel;
    private suggestionHandler: SuggestionHandler;
    private suggestionLimit: number;
    private sinaNext: Sina;
    private suggestionQuery: SuggestionQuery;
    private transactionsDS: DataSource;
    private suggestionStartingCharacters: number;
    private suggestionFormatter = new Formatter();
    public transactionSuggestions: Array<TransactionSuggestion> = [];

    constructor(params: { model: SearchModel; suggestionHandler: SuggestionHandler }) {
        this.model = params.model;
        this.suggestionHandler = params.suggestionHandler;
        this.suggestionLimit = Device.system.phone ? 5 : 7;
        this.sinaNext = this.model.sinaNext;
        this.suggestionQuery = this.sinaNext.createSuggestionQuery();
        this.transactionsDS = this.sinaNext.createDataSource({
            id: "CD$ALL~ESH_TRANSACTION~",
            label: "Transactions",
            type: DataSourceType.BusinessObject,
        });
        this.suggestionStartingCharacters = this.model.config.suggestionStartingCharacters;
    }

    abortSuggestions(): void {
        this.suggestionQuery.abort();
    }

    // openTransactionSuggestion(tcode: string, startInNewWindow: boolean): void {
    //     const transactionSuggestion = this.suggestionHandler.autoSelectTransactionSuggestion(tcode);
    //     // const url = "#Shell-startGUI?sap-ui2-tcode=" + tcode;
    //     if (!transactionSuggestion) return;
    //     if (startInNewWindow) {
    //         window.open(transactionSuggestion.url, "_blank", "noopener,noreferrer");
    //     } else {
    //         if (window.hasher) {
    //             window.hasher.setHash(transactionSuggestion.url);
    //         } else {
    //             window.location.href = transactionSuggestion.url;
    //         }
    //     }
    // }

    private getUrl(tCode: string): string {
        let tCodeStartUrl = "#Shell-startGUI?sap-ui2-tcode=" + tCode;
        const eshBackendSystemInfo = BackendSystem.getSystem(this.model);
        if (eshBackendSystemInfo && !eshBackendSystemInfo.equals(FrontendSystem.getSystem())) {
            // add sid(XYZ.123) url parameter
            tCodeStartUrl = `#Shell-startGUI?sap-system=sid(${eshBackendSystemInfo.id})&sap-ui2-tcode=${tCode}`;
        }
        return tCodeStartUrl;
    }

    async getSuggestions(filter: Filter): Promise<Array<TransactionSuggestion>> {
        // check that BO search is enabled
        if (!this.model.config.searchBusinessObjects) {
            return Promise.resolve([]);
        }
        const dataSource = this.model.getDataSource();
        const userCategoryManager = this.model.userCategoryManager;
        const favoritesIncludeApps =
            userCategoryManager?.isFavActive() &&
            userCategoryManager?.getCategory("MyFavorites")?.includeApps;
        // check that datasource is all, apps or my favorites and my favorites include apps:
        if (
            dataSource !== this.model.allDataSource &&
            dataSource !== this.model.appDataSource &&
            !(dataSource === this.model.favDataSource && favoritesIncludeApps)
        ) {
            return Promise.resolve([]);
        }
        filter = filter.clone();
        let suggestionTerm = filter.searchTerm;
        if (
            suggestionTerm.toLowerCase().indexOf("/n") === 0 ||
            suggestionTerm.toLowerCase().indexOf("/o") === 0
        ) {
            suggestionTerm = suggestionTerm.slice(2);
            filter.searchTerm = suggestionTerm;
        }
        this.transactionSuggestions = [];

        if (suggestionTerm.length < this.suggestionStartingCharacters) {
            return Promise.resolve([]);
        }

        // prepare sina suggestion query
        this.prepareSuggestionQuery(filter);

        const resultSet = await this.suggestionQuery.getResultSetAsync();
        const sinaSuggestions = resultSet.items as Array<ObjectSuggestion>;

        // const inTransactions = i18n.getText("suggestion_in_transactions", [""]);

        // set type, datasource and position
        for (const sinaSuggestion of sinaSuggestions) {
            const transactionSuggestion: TransactionSuggestion = {
                uiSuggestionType: Type.Transaction,
                dataSource: this.transactionsDS,
                position: SuggestionType.properties.Transaction.position,
                key: sinaSuggestion.object.attributesMap.TCODE.value,
                searchTerm: filter.searchTerm,
                url: this.getUrl(sinaSuggestion.object.attributesMap.TCODE.value),
                icon: "sap-icon://generate-shortcut",
                label: sinaSuggestion.object.attributesMap.TCDTEXT.valueHighlighted,
                type: sinaSuggestion.type,
                calculationMode: sinaSuggestion.calculationMode,
                object: sinaSuggestion.object,
                sina: sinaSuggestion.sina,
            };

            const can: CrossApplicationNavigation = await Container.getServiceAsync(
                "CrossApplicationNavigation"
            );

            const isSupported: Array<{
                supported: boolean;
            }> = await can.isNavigationSupported([
                {
                    target: {
                        shellHash: transactionSuggestion.url,
                    },
                },
            ]);
            if (isSupported[0].supported) {
                this.suggestionFormatter.format(this, transactionSuggestion);
            }
        }

        // limit transaction suggestions
        const transactionSuggestionLimit = this.suggestionHandler.getSuggestionLimit(Type.Transaction);
        this.transactionSuggestions = this.transactionSuggestions.slice(0, transactionSuggestionLimit);

        return this.transactionSuggestions;
    }

    addSuggestion(transactionSuggestion: TransactionSuggestion): void {
        this.transactionSuggestions.push(transactionSuggestion);
    }

    private prepareSuggestionQuery(filter: Filter): void {
        this.suggestionQuery.resetResultSet();
        this.suggestionQuery.setFilter(filter);
        this.suggestionQuery.setDataSource(this.transactionsDS);
        this.suggestionQuery.setTypes([this.sinaNext.SuggestionType.Object]);
        this.suggestionQuery.setCalculationModes([this.sinaNext.SuggestionCalculationMode.Data]);
        this.suggestionQuery.setTop(10);
    }
}
