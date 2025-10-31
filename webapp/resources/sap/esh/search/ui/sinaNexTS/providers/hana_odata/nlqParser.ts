/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { NlqResult } from "../../sina/NlqResult";
import { Sina } from "../../sina/Sina";
import { HANAOdataSearchResponseDataSourceNlqInfo } from "./Provider";
import { getText } from "../../sina/i18n";

export function parseNlqInfo(
    sina: Sina,
    nlqInfos: Array<HANAOdataSearchResponseDataSourceNlqInfo>
): NlqResult {
    // check for nlq infos
    if (!nlqInfos) {
        return { success: false, filterDescription: "" };
    }
    // filter for nql infos with ai activated
    nlqInfos = nlqInfos.filter((nlqInfo) => nlqInfo.ai);
    if (nlqInfos.length === 0) {
        return { success: false, filterDescription: "" };
    }
    // assemble list of filter descriptions
    const filterDescriptionsList = [];
    for (const nlqInfo of nlqInfos) {
        if (!nlqInfo.filter.natural_language) {
            continue;
        }
        if (nlqInfos.length > 1) {
            const dataSource = sina.getDataSource(nlqInfo.Name);
            filterDescriptionsList.push(
                getText("nlqDataSourceAndFilterDescription", [
                    dataSource ? dataSource.label : nlqInfo.Name,
                    nlqInfo.filter.natural_language,
                ])
            );
        } else {
            filterDescriptionsList.push(nlqInfo.filter.natural_language);
        }
    }
    // assemble filter description form filter descriptions list
    let filterDescription = "";
    if (filterDescriptionsList.length > 0) {
        filterDescription = "<code>" + filterDescriptionsList.join("<br/>") + "</code>";
    }
    // return nlq result
    return {
        success: true,
        filterDescription: filterDescription,
    };
}
