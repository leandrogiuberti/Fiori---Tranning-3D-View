/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Filter } from "../sinaNexTS/sina/Filter";
import { Sina } from "../sinaNexTS/sina/Sina";
import { SuggestionCalculationMode } from "../sinaNexTS/sina/SuggestionCalculationMode";
import { SuggestionQuery } from "../sinaNexTS/sina/SuggestionQuery";
import { SuggestionType as SinaSuggestionType } from "../sinaNexTS/sina/SuggestionType";
import { Type as UISuggestionType } from "./SuggestionType";

export default class SinaBaseSuggestionProvider {
    protected suggestionQuery: SuggestionQuery;
    protected suggestionTypes: Array<UISuggestionType>;

    constructor(protected sinaNext: Sina) {
        this.suggestionQuery = this.sinaNext.createSuggestionQuery();
    }

    // prepare suggestions query
    // ===================================================================
    prepareSuggestionQuery(filter: Filter): void {
        this.suggestionQuery.resetResultSet();
        this.suggestionQuery.setFilter(filter);
        const sinaSuggestionTypes = this.assembleSinaSuggestionTypesAndCalcModes();
        this.suggestionQuery.setTypes(sinaSuggestionTypes.types);
        this.suggestionQuery.setCalculationModes(sinaSuggestionTypes.calculationModes);
        this.suggestionQuery.setTop(20);
    }

    // assemble suggestion types and calculation modes
    // ===================================================================
    assembleSinaSuggestionTypesAndCalcModes(): {
        types: Array<SinaSuggestionType>;
        calculationModes: Array<SuggestionCalculationMode>;
    } {
        const append = function (list, element) {
            if (list.indexOf(element) >= 0) {
                return;
            }
            list.push(element);
        };
        const result = {
            types: [],
            calculationModes: [],
        };
        for (let i = 0; i < this.suggestionTypes.length; ++i) {
            const suggestionType = this.suggestionTypes[i];
            switch (suggestionType) {
                case UISuggestionType.SearchTermHistory:
                    append(result.types, this.sinaNext.SuggestionType.SearchTerm);
                    append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.History);
                    break;
                case UISuggestionType.SearchTermData:
                    append(result.types, this.sinaNext.SuggestionType.SearchTerm);
                    append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
                    break;
                case UISuggestionType.SearchTermAI:
                    append(result.types, this.sinaNext.SuggestionType.SearchTermAI);
                    append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
                    break;
                case UISuggestionType.DataSource:
                    append(result.types, this.sinaNext.SuggestionType.DataSource);
                    append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
                    break;
                case UISuggestionType.Object:
                    append(result.types, this.sinaNext.SuggestionType.Object);
                    append(result.calculationModes, this.sinaNext.SuggestionCalculationMode.Data);
                    break;
            }
        }
        return result;
    }
}
