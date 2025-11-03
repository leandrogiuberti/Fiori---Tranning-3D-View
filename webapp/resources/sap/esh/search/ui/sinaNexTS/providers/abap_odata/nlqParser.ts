/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { getText } from "../../sina/i18n";
import { NlqResult } from "../../sina/NlqResult";
import { Sina } from "../../sina/Sina";
import { ABAPOdataSearchResponseDataSourceNlqInfo } from "./Provider";

export function parseNlqInfo(
    sina: Sina,
    nlqInfos: Array<ABAPOdataSearchResponseDataSourceNlqInfo>
): NlqResult {
    // check nlq infos
    if (!nlqInfos || nlqInfos.length === 0) {
        return { success: false, filterDescription: "" };
    }
    // assemble list of filter descriptions
    const filterDescriptionsList = [];
    for (const nlqInfo of nlqInfos) {
        if (nlqInfos.length > 1) {
            const dataSourceId = nlqInfo?.NLQConnectorQueries?.results[0]?.ConnectorID;
            const dataSource = sina.getDataSource(dataSourceId);
            filterDescriptionsList.push(
                getText("nlqDataSourceAndFilterDescription", [
                    dataSource ? dataSource.label : dataSourceId,
                    nlqInfo.Description,
                ])
            );
        } else {
            filterDescriptionsList.push(nlqInfo.Description);
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
