/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ObjectSuggestion } from "../ObjectSuggestion";
import { Sina } from "../Sina";
import { SuggestionResultSet } from "../SuggestionResultSet";
import { SuggestionType } from "../SuggestionType";
import { Formatter } from "./Formatter";
import { DateFormat, NumberFormat, ResultValueFormatter } from "./ResultValueFormatter";

export class SuggestionResultValueFormatter extends Formatter {
    sina: Sina;
    resultValueFormatter: ResultValueFormatter;

    initAsync(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    constructor(properties: { ui5NumberFormat?: NumberFormat; ui5DateFormat?: DateFormat }) {
        super();
        this.resultValueFormatter = new ResultValueFormatter(properties);
    }

    format(resultSet: SuggestionResultSet): SuggestionResultSet {
        for (const suggestionItem of resultSet.items) {
            if ((suggestionItem.type = SuggestionType.Object)) {
                this.resultValueFormatter._formatItemInUI5Form((suggestionItem as ObjectSuggestion).object);
            }
        }
        return resultSet;
    }

    formatAsync(resultSet: SuggestionResultSet): Promise<SuggestionResultSet> {
        resultSet = this.format(resultSet);
        return Promise.resolve(resultSet);
    }
}
