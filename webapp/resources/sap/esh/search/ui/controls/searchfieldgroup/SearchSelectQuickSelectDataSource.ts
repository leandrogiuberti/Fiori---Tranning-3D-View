/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Select, { $SelectSettings } from "sap/m/Select";
import Item from "sap/ui/core/Item";
import SearchModel from "sap/esh/search/ui/SearchModel";
import { DataSource } from "../../sinaNexTS/sina/DataSource";
import Element from "sap/ui/core/Element";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchSelectQuickSelectDataSource extends Select {
    constructor(sId?: string, options?: Partial<$SelectSettings>) {
        super(sId, options);

        this.attachChange((event) => {
            const itemControl = event.getParameter("selectedItem");
            const item = itemControl.getBindingContext().getObject() as DataSource;
            this.handleSelectDataSource(item);
        });
        this.bindItems({
            path: "/config/quickSelectDataSources",
            template: new Item("", {
                key: "{id}",
                text: "{labelPlural}",
            }),
        });

        this.bindProperty("maxWidth", {
            parts: [{ path: "/config/optimizeForValueHelp" }],

            formatter: (optimizeForValueHelp) => {
                if (optimizeForValueHelp) {
                    this.addStyleClass("sapElisaSearchSelectQuickSelectDataSourceValueHelp");
                }
                return "100%";
            },
        });

        this.bindProperty("visible", {
            parts: [
                { path: "/config/optimizeForValueHelp" },
                { path: "/config/quickSelectDataSources" },
                { path: "/config/quickSelectDataSources/length" },
                { path: "/count" },
            ],
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            formatter: (optimizeForValueHelp, qds, qdsLength, count) => {
                if (optimizeForValueHelp) {
                    // cannot be done in constructor (searchModel n.a.), control has no custom renderer -> thus put it here
                    this.addStyleClass("sapElisaSearchSelectQuickSelectDataSourceValueHelp");
                }
                return qds?.length > 0;
            },
        });
    }

    handleSelectDataSource(dataSource: DataSource): void {
        const oModel = this.getModel() as SearchModel;
        // reset search term (even if selected item gets pressed again)
        if (oModel.config.bResetSearchTermOnQuickSelectDataSourceItemPress) {
            oModel.setSearchBoxTerm("", false);
        }
        // when filter is changed (here data source), give a callback to adjust the conditions
        if (typeof oModel.config.adjustFilters === "function") {
            oModel.config.adjustFilters(oModel);
        }
        oModel.setDataSource(dataSource, false); // true does not trigger search (example: DSP entity list) ?!?
        const searchButtonElements = window.document.querySelectorAll(
            '[id$="-searchInputHelpPageSearchFieldGroup-button"]'
        );
        searchButtonElements.forEach((searchButton) => {
            if (
                searchButton.id ===
                this.getId().replace(
                    "-searchInputHelpPageSearchFieldGroup-selectQsDs",
                    "-searchInputHelpPageSearchFieldGroup-button"
                )
            ) {
                const searchButtonUi5 = Element.getElementById(searchButton.id);
                searchButtonUi5["firePress"](); // ToDo - workaround, see above
            }
        });
    }

    static renderer = {
        apiVersion: 2,
    };
}
