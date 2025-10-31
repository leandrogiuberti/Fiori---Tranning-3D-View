/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import SearchUrlParserInav2 from "./SearchUrlParserInav2";
import * as SearchHelper from "./SearchHelper";
import i18n from "./i18n";
import MessageBox from "sap/m/MessageBox";
import { OrderBy, UrlParameters } from "./SearchModelTypes";
import ErrorHandler from "./error/ErrorHandler";
import * as core from "./sinaNexTS/core/core";

export interface SearchUrlParserOptions {
    model: SearchModel;
    urlParserInav2?: SearchUrlParserInav2;
}
export default class SearchUrlParser {
    private model: SearchModel;
    private urlParserInav2: SearchUrlParserInav2;
    private errorHandler: ErrorHandler;

    constructor(options: SearchUrlParserOptions) {
        this.model = options.model;
        this.urlParserInav2 = new SearchUrlParserInav2(options);
        this.errorHandler = ErrorHandler.getInstance();
    }

    public async parse(fireQuery = true): Promise<void> {
        // ignore url hash change which if no search application
        try {
            if (!this.model.config.isSearchUrl(SearchHelper.getHashFromUrl())) {
                return Promise.resolve(undefined);
            }
        } catch (e) {
            this.errorHandler.onError(e);
            return Promise.resolve(undefined);
        }

        // check if hash differs from old hash. if not -> return
        if (!SearchHelper.hasher.hasChanged()) {
            return Promise.resolve(undefined);
        }

        // ensure model is initialized
        await this.model.initAsync();

        // without sina -> do nothing
        if (!this.model.sinaNext) {
            return;
        }

        // parse url parameters
        let oParametersLowerCased = SearchHelper.getUrlParameters();
        if (core.isEmptyObject(oParametersLowerCased)) {
            return undefined;
        }

        // handle old sina format
        if (oParametersLowerCased.datasource || oParametersLowerCased.searchterm) {
            if (!oParametersLowerCased.datasource || this.isJson(oParametersLowerCased.datasource)) {
                return this.urlParserInav2.parseUrlParameters(oParametersLowerCased);
            }
        }

        // parameter modification exit
        try {
            oParametersLowerCased = this.model.config.parseSearchUrlParameters(oParametersLowerCased);
        } catch (e) {
            this.errorHandler.onError(e);
            return;
        }

        if (
            oParametersLowerCased.datasource &&
            !this.isJson(oParametersLowerCased.datasource) &&
            oParametersLowerCased.searchterm
        ) {
            // parse simplified url parameters
            this.parseSimplifiedUrlParameters(oParametersLowerCased);
        } else {
            // parse new sinaNext format
            this.parseUrlParameters(oParametersLowerCased);
        }

        // update placeholder in case back button is clicked.
        this.model.setProperty("/searchTermPlaceholder", this.model.calculatePlaceholder());

        // calculate search button status
        this.model.calculateSearchButtonStatus();

        // fire query
        if (fireQuery) {
            this.model.fireSearchQuery({ deserialization: true });
        }
    }

    private isJson(data: string): boolean {
        return data.indexOf("{") >= 0 && data.indexOf("}") >= 0;
    }

    private parseSimplifiedUrlParameters(oParametersLowerCased: {
        filter?: string;
        datasource?: string;
        top?: string;
        searchterm?: string;
    }): void {
        // top
        if (oParametersLowerCased.top) {
            const top = parseInt(oParametersLowerCased.top, 10);
            this.model.setTop(top, false);
        }

        // search term
        const filter = this.model.sinaNext.createFilter();
        filter.setSearchTerm(oParametersLowerCased.searchterm);

        // datasource
        let dataSource = this.model.sinaNext.getDataSource(oParametersLowerCased.datasource);
        if (!dataSource) {
            dataSource = this.model.sinaNext.allDataSource;
        }
        filter.setDataSource(dataSource);

        // update model
        this.model.setProperty("/uiFilter", filter);
        this.model.setDataSource(filter.dataSource, false, false); // explicitely updata datasource (for categories: update ds list in model)
    }

    private parseUrlParameters(oParametersLowerCased: UrlParameters): void {
        // top
        if (oParametersLowerCased.top) {
            const top = parseInt(oParametersLowerCased.top, 10);
            this.model.setTop(top, false);
        }

        // order by
        if (oParametersLowerCased.orderby && oParametersLowerCased.sortorder) {
            const orderBy: OrderBy = {
                orderBy: oParametersLowerCased.orderby,
                sortOrder: oParametersLowerCased.sortorder,
            };
            this.model.setOrderBy(orderBy, false);
        } else {
            this.model.resetOrderBy(false);
        }

        // filter conditions
        let filter;
        if (oParametersLowerCased.filter) {
            try {
                const filterJson = JSON.parse(oParametersLowerCased.filter);
                filter = this.model.sinaNext.parseFilterFromJson(filterJson);
                this.model.setProperty("/uiFilter", filter);
                this.model.setDataSource(filter.dataSource, false, false); // explicitely updata datasource (for categories: update ds list in model)
            } catch (e) {
                // no filter taken over from url + send error message
                MessageBox.show(i18n.getText("searchUrlParsingErrorLong") + "\n(" + e.toString() + ")", {
                    icon: MessageBox.Icon.ERROR,
                    title: i18n.getText("searchUrlParsingError"),
                    actions: [MessageBox.Action.OK],
                    styleClass: "sapUshellSearchMessageBox", // selector for closePopovers
                });
            }
        }
    }
}
