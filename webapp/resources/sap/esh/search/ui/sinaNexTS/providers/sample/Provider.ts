/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ForcedBySearchTermTestError, NotImplementedError } from "../../core/errors";
import { escapeRegExp } from "../../core/util";
import { Capabilities } from "../../sina/Capabilities";
import { ChartQuery } from "../../sina/ChartQuery";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { FacetResultSet } from "../../sina/FacetResultSet";
import { HierarchyQuery } from "../../sina/HierarchyQuery";
import { HierarchyResultSet } from "../../sina/HierarchyResultSet";
import { SearchQuery } from "../../sina/SearchQuery";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { SearchResultSetItem } from "../../sina/SearchResultSetItem";
import { SearchResultSetItemAttribute } from "../../sina/SearchResultSetItemAttribute";
import { SimpleCondition } from "../../sina/SimpleCondition";
import { Sina } from "../../sina/Sina";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import { UserCategoryDataSource } from "../../sina/UserCategoryDataSource";
import { AbstractProvider } from "../AbstractProvider";
import { SuvAttribute } from "../tools/fiori/SuvNavTargetResolver";
import { ITemplate } from "./ITemplate";
import { createTemplate as template } from "./template";
import { createTemplate as template2 } from "./template2";

type ValueType =
    | unknown
    | Date
    | number
    | {
          type: string;
          value: string;
      };

export class Provider extends AbstractProvider {
    static readonly dataSourceIds = {
        All: "All",
        Urban_Legends: "Urban_Legends",
        Folklorists: "Folklorists",
        Publications: "Publications",
        Scientists: "Scientists",
        Mysterious_Sightings: "Mysterious_Sightings",
    };
    readonly id: string;
    searchQuery: SearchQuery;
    templateProvider: (oContext: Provider) => ITemplate;

    constructor() {
        super();
        this.id = "sample";
    }

    async initAsync(properties: { sina: Sina }): Promise<{ capabilities: Capabilities }> {
        this.sina = properties.sina;
        this.templateProvider = template; // the newer template, folklorists
        if (document.location.href.indexOf("use=sample1") > 0) {
            this.templateProvider = template2; // the original template, scientists
        }
        const demoRoot: ITemplate = this.templateProvider(this);
        demoRoot._init(demoRoot);
        const res = Promise.resolve({
            capabilities: this.sina._createCapabilities({
                fuzzy: false,
            }),
        });

        return res;
    }

    private getSuggestionList(templateData) {
        const listAsString = this._stringify(templateData);
        /* eslint no-useless-escape:0 */
        const regexp = new RegExp('"valueFormatted":"([^{/]+?)","valueHighlighted', "g");
        let matches = listAsString.match(regexp).map((m) => m.replace(regexp, "$1"));
        const singleWords = matches.toString().split(/\W/);
        matches = matches.concat(singleWords);
        // remove duplicates
        matches = matches.filter(function (item, pos) {
            if (item !== "") {
                return matches.indexOf(item) == pos;
            }
        });
        return matches;
    }

    private _stringify(o): string {
        let cache = [];
        const s = JSON.stringify(o, function (key, value) {
            if (typeof value === "object" && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // circular reference found, discard key
                    return undefined;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // enable garbage collection
        return s;
    }

    private applyFilters(
        items: Array<SearchResultSetItem>,
        searchQuery: SearchQuery
    ): Array<SearchResultSetItem> {
        const newItemsArray = [];
        if (searchQuery.filter.rootCondition instanceof SimpleCondition) {
            // quick select data source, nothing to do here
        } else {
            if (
                (searchQuery.filter.rootCondition as ComplexCondition).conditions.length === 0 ||
                (searchQuery.filter.rootCondition as ComplexCondition).conditions[0] instanceof
                    SimpleCondition ||
                ((searchQuery.filter.rootCondition as ComplexCondition).conditions[0] instanceof
                    ComplexCondition &&
                    ((searchQuery.filter.rootCondition as ComplexCondition).conditions[0] as ComplexCondition)
                        .conditions.length === 0)
            ) {
                // return only items whose dataSource Id is included in subDataSources
                if (searchQuery.filter.dataSource instanceof UserCategoryDataSource) {
                    const subDataSources = (searchQuery.filter.dataSource as UserCategoryDataSource)
                        .subDataSources;
                    if (subDataSources) {
                        return items.filter((item) =>
                            subDataSources.find((subDataSource) => subDataSource.id === item.dataSource.id)
                        );
                    }
                } /* else if ("quick select data source") {
                     ToDo
                } */
                return items;
            }
        }

        interface filterDataSimple {
            attribute: string;
            operator: ComparisonOperator;
            value: ValueType;
            fits: boolean;
        }

        const toBeDimensionValuePairsArray: Array<filterDataSimple> = [];
        const toBeDimensionsArray = [];
        if (searchQuery.filter.rootCondition instanceof SimpleCondition /* quick select data source */) {
            const condition: SimpleCondition = searchQuery.filter.rootCondition;
            toBeDimensionValuePairsArray.push({
                attribute: condition.attribute,
                operator: condition.operator,
                value: condition.value,
                fits: false,
            });
            toBeDimensionsArray.push(condition.attribute);
        } else {
            for (
                let g = 0;
                g < (searchQuery.filter.rootCondition as ComplexCondition).conditions.length;
                g++
            ) {
                const conditions = (
                    (searchQuery.filter.rootCondition as ComplexCondition).conditions[g] as ComplexCondition
                ).conditions as Array<SimpleCondition>;
                if (conditions) {
                    for (let h = 0; h < conditions.length; h++) {
                        toBeDimensionValuePairsArray.push({
                            attribute: conditions[h].attribute,
                            value: conditions[h].value,
                            operator: conditions[h].operator,
                            fits: false,
                        });
                        toBeDimensionsArray.push(conditions[h].attribute);
                    }
                }
            }
        }
        let fits = false;
        for (let i = 0; i < items.length; i++) {
            // compare items with collected to-be-valid conditions
            const item = items[i];
            const fitsArray = [];
            for (let j = 0; j < toBeDimensionValuePairsArray.length; j++) {
                fits = false;
                for (let k = 0; k < item.detailAttributes.length; k++) {
                    // loop thru all detailAttributes of item
                    const detailAttribute = item.detailAttributes[k];
                    if (detailAttribute instanceof SearchResultSetItemAttribute) {
                        if (
                            detailAttribute.id === toBeDimensionValuePairsArray[j].attribute &&
                            this.checkFilterValueMatch(
                                detailAttribute.value,
                                toBeDimensionValuePairsArray[j].value,
                                toBeDimensionValuePairsArray[j].operator
                            )
                        ) {
                            fits = true;
                        }
                    }
                }
                for (let m = 0; m < item.titleAttributes.length; m++) {
                    // loop thru all titleAttributes of item
                    const titleAttribute = item.titleAttributes[m];
                    if (titleAttribute instanceof SearchResultSetItemAttribute) {
                        if (
                            titleAttribute.id === toBeDimensionValuePairsArray[j].attribute &&
                            this.checkFilterValueMatch(
                                titleAttribute.value,
                                toBeDimensionValuePairsArray[j].value,
                                toBeDimensionValuePairsArray[j].operator
                            )
                        ) {
                            fits = true;
                        }
                    }
                }
                toBeDimensionValuePairsArray[j].fits = fits;
                fitsArray.push(fits);
            }
            if (fitsArray.toString().match(/false/) === null) {
                newItemsArray.push(item);
            } else {
                // see if there is one 'true' match for each unique dimension, if so we can still add item
                const fitsArray2 = [];
                const uniqueDimensionsArray = toBeDimensionsArray.filter(function (item, pos) {
                    return toBeDimensionsArray.indexOf(item) == pos;
                });
                for (let n = 0; n < uniqueDimensionsArray.length; n++) {
                    fits = false;
                    const dimension = uniqueDimensionsArray[n];
                    for (let p = 0; p < toBeDimensionValuePairsArray.length; p++) {
                        if (
                            toBeDimensionValuePairsArray[p].attribute === dimension &&
                            toBeDimensionValuePairsArray[p].fits === true
                        ) {
                            fits = true;
                            break;
                        }
                    }
                    fitsArray2.push(fits);
                }
                if (fitsArray2.toString().match(/false/) === null) {
                    newItemsArray.push(item);
                }
            }
        }

        return newItemsArray;
    }

    private checkFilterValueMatch(
        itemValue: ValueType,
        filterValue: ValueType,
        filterOperator: ComparisonOperator
    ): boolean {
        switch (filterOperator) {
            case ComparisonOperator.Co: {
                return (itemValue as string)
                    .toLowerCase()
                    .includes((filterValue as string).toLowerCase() as string);
            }
            case ComparisonOperator.Eq: {
                return filterValue === itemValue;
            }
            case ComparisonOperator.Ne: {
                return filterValue !== itemValue;
            }
            case ComparisonOperator.Gt: {
                return filterValue > itemValue;
            }
            case ComparisonOperator.Ge: {
                return filterValue >= itemValue;
            }
            case ComparisonOperator.Lt: {
                return filterValue < itemValue;
            }
            case ComparisonOperator.Le: {
                return filterValue <= itemValue;
            }
            default: {
                return itemValue === filterValue;
            }
        }
        return false;
    }

    private adjustHighlights(items: Array<SearchResultSetItem>, searchTerm: string): Array<unknown> {
        const newItemsArray = [];
        let attrMetadataType = "";
        for (let i = 0; i < items.length; i++) {
            const item = items[i] as any;
            let neverFound = true;
            attrMetadataType = "";
            item.titleHighlighted = this.addHighlight(item.title, searchTerm);

            if (item.titleHighlighted !== item.title) {
                neverFound = false;
            }
            for (let j = 0; j < items[i].detailAttributes.length; j++) {
                const detailAttr = items[i].detailAttributes[j] as SearchResultSetItemAttribute;
                attrMetadataType = detailAttr.metadata.type;
                if (attrMetadataType === "String" || attrMetadataType === "Integer") {
                    detailAttr.valueHighlighted = this.addHighlight(detailAttr.valueFormatted, searchTerm);
                    if (detailAttr.valueHighlighted !== detailAttr.valueFormatted) {
                        neverFound = false;
                    }
                }
            }
            for (let k = 0; k < items[i].titleAttributes.length; k++) {
                const titleAttr = items[i].titleAttributes[k] as SearchResultSetItemAttribute;
                attrMetadataType = titleAttr.metadata.type;
                if (
                    attrMetadataType === "String" ||
                    attrMetadataType === "Integer" ||
                    attrMetadataType === "ImageUrl"
                ) {
                    titleAttr.valueHighlighted = this.addHighlight(titleAttr.valueFormatted, searchTerm);
                    if (titleAttr.valueHighlighted !== titleAttr.valueFormatted) {
                        neverFound = false;
                    }
                }
            }
            if (neverFound === false || searchTerm === "*" || searchTerm === "") {
                newItemsArray.push(item);
            }
        }
        return newItemsArray;
    }

    private addHighlight(hText: string, searchTerm: string): string {
        if (typeof hText !== "string" || typeof searchTerm !== "string") {
            return hText;
        }
        const pos1 = hText.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (pos1 > -1) {
            const pos2 = pos1 + searchTerm.length;
            const newHText =
                hText.substring(0, pos1) +
                "<b>" +
                hText.substring(pos1, pos2) +
                "</b>" +
                hText.substring(pos2);
            return newHText;
        }
        return hText;
    }

    addSuvLinkToSearchResultItem(
        searchResultItem: SearchResultSetItem,
        suvPath: string,
        searchTermsArray: Array<string>
    ): void {
        const suvNavTargetResolver = this.sina._createSuvNavTargetResolver();
        if (!suvPath) {
            suvPath =
                "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/docs/folklorist_authors_and_publications.suv";
        }
        if (!searchTermsArray) {
            searchTermsArray = [];
        }
        const suvAttributes: { [key: string]: SuvAttribute } = {};
        suvAttributes.obj = {
            suvThumbnailAttribute: searchResultItem,
            suvTargetMimeTypeAttribute: {
                value: "application/vnd.sap.universal-viewer+suv",
            },
            suvTargetUrlAttribute: {
                value: suvPath,
            },
        };
        suvNavTargetResolver.resolveSuvNavTargets(null, suvAttributes, searchTermsArray);
    }

    async executeSearchQuery(searchQuery: SearchQuery): Promise<SearchResultSet> {
        this.searchQuery = searchQuery;
        return new Promise((resolve) => {
            let resultSet;

            const itemsRoot = this.templateProvider(this);
            const items1 = itemsRoot.searchResultSetItemArray;
            const items2 = itemsRoot.searchResultSetItemArray2;
            let itemsAll = items1.concat(items2);
            let items3;
            if (itemsRoot.searchResultSetItemArray3) {
                items3 = itemsRoot.searchResultSetItemArray3;
                itemsAll = itemsAll.concat(items3);
            }

            const searchTerm = searchQuery.filter.searchTerm;
            const dataSourceId = searchQuery.filter.dataSource.id;
            const dataSourceType = searchQuery.filter.dataSource.type;
            const facets1 = this.generateFacets(searchQuery);

            if (searchTerm === ForcedBySearchTermTestError.forcedBySearchTerm) {
                throw new ForcedBySearchTermTestError();
            }

            let items;

            if (
                dataSourceId === Provider.dataSourceIds.Scientists ||
                dataSourceId === Provider.dataSourceIds.Folklorists
            ) {
                items = this.adjustHighlights(items1, searchTerm);
                items = this.applyFilters(items, searchQuery);
                resultSet = this.sina._createSearchResultSet({
                    items: items,
                    facets: facets1,
                    query: searchQuery,
                    title: "",
                    totalCount: items.length,
                });
            } else if (
                dataSourceId === Provider.dataSourceIds.Mysterious_Sightings ||
                dataSourceId === Provider.dataSourceIds.Urban_Legends
            ) {
                items = this.adjustHighlights(items2, searchTerm);
                items = this.applyFilters(items, searchQuery);
                resultSet = this.sina._createSearchResultSet({
                    items: items,
                    facets: facets1,
                    query: searchQuery,
                    title: "",
                    totalCount: items.length,
                });
            } else if (dataSourceId === "Publications") {
                items = this.adjustHighlights(items3, searchTerm);
                items = this.applyFilters(items, searchQuery);
                resultSet = this.sina._createSearchResultSet({
                    items: items,
                    facets: facets1,
                    query: searchQuery,
                    title: "",
                    totalCount: items.length,
                });
            } else if (
                dataSourceId === Provider.dataSourceIds.All ||
                dataSourceType === this.sina.DataSourceType.UserCategory
            ) {
                // initalize measureValue for all facet items, necessary for filtering out superfluous items (My Favorites)
                facets1[0].items.forEach((item) => {
                    item.measureValue = 0;
                    item.measureValueFormatted = "";
                }); // calculate total counts for each sub branch of 'all'
                items = this.adjustHighlights(items1, searchTerm);
                items = this.applyFilters(items, searchQuery);
                const totalCount1 = items.length;

                items = this.adjustHighlights(items2, searchTerm);
                items = this.applyFilters(items, searchQuery);
                const totalCount2 = items.length;
                let totalCount3 = 0;
                if (items3) {
                    items = this.adjustHighlights(items3, searchTerm);
                    items = this.applyFilters(items, searchQuery);
                    totalCount3 = items.length;
                }

                facets1[0].items[0].measureValue = totalCount1; // scientists
                facets1[0].items[0].measureValueFormatted = "" + totalCount1;

                facets1[0].items[1].measureValue = totalCount2; // mysterious sightings
                facets1[0].items[1].measureValueFormatted = "" + totalCount2;

                if (items3 && facets1[0].items.length > 2) {
                    facets1[0].items[2].measureValue = totalCount3; // publications
                    facets1[0].items[2].measureValueFormatted = "" + totalCount3;
                }
                // delete facet items where measureValue <= 0 (result items were filtered out)
                facets1[0].items = facets1[0].items.filter((item) => item.measureValue > 0);

                // proceed to insert facets into resultSet
                items = this.adjustHighlights(itemsAll, searchTerm);
                items = this.applyFilters(items, searchQuery);

                // top/skip
                const finalItems = [];
                for (
                    let i = searchQuery.skip;
                    i < searchQuery.skip + searchQuery.top && i < items.length;
                    i++
                ) {
                    finalItems.push(items[i]);
                }

                // final results
                resultSet = this.sina._createSearchResultSet({
                    items: finalItems,
                    facets: facets1,
                    query: searchQuery,
                    title: "",
                    totalCount: items.length,
                });
            }

            resolve(resultSet);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet> {
        throw new NotImplementedError();
    }

    async executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        const searchTerm = query.filter.searchTerm;
        const demoRoot = this.templateProvider(this);
        const searchAbleItems = demoRoot.searchResultSetItemArray
            .concat(demoRoot.searchResultSetItemArray2)
            .concat(demoRoot.searchResultSetItemArray3);
        const suggestionTerms = this.getSuggestionList(searchAbleItems); // "Sally Spring, Galapagos, Female, Barry Williamson, Off East Cyprus, Male, Conrad Atkinson, Baalbek, Lebanon,Roger Murdoch, Wycliffe Well"
        // limit suggestion terms to what matches start of search term
        const regexp = new RegExp(`^${escapeRegExp(searchTerm)}`, "gi");
        const suggestionsMatchingSearchterm = suggestionTerms.filter((s) => s.match(regexp));
        //if (suggestionsMatchingSearchterm.length === 0) {
        //    suggestionsMatchingSearchterm = suggestionTerms;
        //}
        const suggestions = [];

        const createSuggestionItem = (term) => {
            const calculationMode = this.sina.SuggestionCalculationMode.Data;
            const filter = query.filter.clone();
            filter.setSearchTerm(term);
            return this.sina._createSearchTermSuggestion({
                searchTerm: term,
                calculationMode: calculationMode,
                filter: filter,
                label: term,
            });
        };
        for (let i = 0; i < suggestionsMatchingSearchterm.length; i++) {
            suggestions.push(createSuggestionItem(suggestionsMatchingSearchterm[i]));
        }

        const resultSet = this.sina._createSuggestionResultSet({
            title: "Suggestions",
            query: query,
            items: suggestions,
        });

        return new Promise(function (resolve) {
            resolve(resultSet);
        });
    }

    async executeChartQuery(query: ChartQuery): Promise<ChartResultSet> {
        const chartResultSetItems = this.generateFacets(query);
        let whichChart = 1; // scientists
        if (query.dimension === "LOCATION" || chartResultSetItems.length === 1) {
            whichChart = 0;
        }
        return new Promise(function (resolve) {
            resolve(chartResultSetItems[whichChart] as ChartResultSet);
        });
    }

    getChartResultSetItemsForLocations(resultSetItemsArray) {
        const chartResultSetItems = [];
        let location;
        const locations = [];
        let chartResultSetItem, i, j, k, attrs;
        for (i = 0; i < resultSetItemsArray.length; i++) {
            attrs = resultSetItemsArray[i].detailAttributes;
            for (j = 0; j < attrs.length; j++) {
                if (attrs[j].id === "LOCATION") {
                    location = attrs[j].value;
                    if (locations.indexOf(location) === -1) {
                        // new location
                        locations.push(location);
                        chartResultSetItem = this.sina._createChartResultSetItem({
                            filterCondition: this.sina.createSimpleCondition({
                                attribute: "LOCATION",
                                attributeLabel: "Location",
                                operator: this.sina.ComparisonOperator.Eq,
                                value: location,
                            }),
                            dimensionValueFormatted: location,
                            measureValue: 1,
                            measureValueFormatted: "1",
                        });

                        chartResultSetItems.push(chartResultSetItem);
                    } else {
                        // add to measureValue
                        for (k = 0; k < chartResultSetItems.length; k++) {
                            if (chartResultSetItems[k].filterCondition.value === location) {
                                chartResultSetItems[k].measureValue = chartResultSetItems[k].measureValue + 1;
                                chartResultSetItems[k].measureValueFormatted =
                                    "" + chartResultSetItems[k].measureValue;
                            }
                        }
                    }
                }
            }
        }
        return chartResultSetItems;
    }

    getChartResultSetItemsForPublications(resultSetItemsArray) {
        const chartResultSetItems = [];
        let publication;
        const publications = [];
        let chartResultSetItem, i, j, k, attrs;
        for (i = 0; i < resultSetItemsArray.length; i++) {
            attrs = resultSetItemsArray[i].detailAttributes;
            for (j = 0; j < attrs.length; j++) {
                if (attrs[j].id === "PUBLICATION") {
                    publication = attrs[j].value;
                    if (publications.indexOf(publication) === -1) {
                        // new location
                        publications.push(publication);
                        chartResultSetItem = this.sina._createChartResultSetItem({
                            filterCondition: this.sina.createSimpleCondition({
                                attribute: "PUBLICATION",
                                attributeLabel: "Publication",
                                operator: this.sina.ComparisonOperator.Eq,
                                value: publication,
                            }),
                            dimensionValueFormatted: publication,
                            measureValue: 1,
                            measureValueFormatted: "1",
                        });

                        chartResultSetItems.push(chartResultSetItem);
                    } else {
                        // add to measureValue
                        for (k = 0; k < chartResultSetItems.length; k++) {
                            if (chartResultSetItems[k].filterCondition.value === publication) {
                                chartResultSetItems[k].measureValue = chartResultSetItems[k].measureValue + 1;
                                chartResultSetItems[k].measureValueFormatted =
                                    "" + chartResultSetItems[k].measureValue;
                            }
                        }
                    }
                }
            }
        }
        return chartResultSetItems;
    }

    getSientistOrFolkloristFacet(searchQuery: SearchQuery | ChartQuery, resultSetItemsArray) {
        let scientisOrFolklorist;
        const scientisOrFolklorists = [];
        let chartResultSetItem, i, j, k, attrs, dimension;
        const chartResultSetItems = [];
        for (i = 0; i < resultSetItemsArray.length; i++) {
            attrs = resultSetItemsArray[i].titleAttributes; // for folklorists and scientists
            if (
                searchQuery.filter.dataSource.id === Provider.dataSourceIds.Mysterious_Sightings ||
                searchQuery.filter.dataSource.id === Provider.dataSourceIds.Urban_Legends ||
                searchQuery.filter.dataSource.id === Provider.dataSourceIds.Publications
            ) {
                attrs = resultSetItemsArray[i].detailAttributes;
            }
            for (j = 0; j < attrs.length; j++) {
                if (attrs[j].id === "SCIENTIST" || attrs[j].id === "FOLKLORIST") {
                    scientisOrFolklorist = attrs[j].value;
                    dimension = attrs[j].id;
                    if (scientisOrFolklorists.indexOf(scientisOrFolklorist) === -1) {
                        // this particular scientist is not listed yet
                        scientisOrFolklorists.push(scientisOrFolklorist);
                        chartResultSetItem = this.sina._createChartResultSetItem({
                            filterCondition: this.sina.createSimpleCondition({
                                attribute: attrs[j].id,
                                attributeLabel: attrs[j].label,
                                operator: this.sina.ComparisonOperator.Eq,
                                value: scientisOrFolklorist,
                            }),
                            dimensionValueFormatted: scientisOrFolklorist,
                            measureValue: 1,
                            measureValueFormatted: "1",
                        });

                        chartResultSetItems.push(chartResultSetItem);
                    } else {
                        // add to measureValue
                        for (k = 0; k < chartResultSetItems.length; k++) {
                            if (chartResultSetItems[k].filterCondition.value === scientisOrFolklorist) {
                                chartResultSetItems[k].measureValue = chartResultSetItems[k].measureValue + 1;
                                chartResultSetItems[k].measureValueFormatted =
                                    "" + chartResultSetItems[k].measureValue;
                            }
                        }
                    }
                }
            }
        }
        return [chartResultSetItems, dimension];
    }

    getTopFacetOnly(searchQuery: SearchQuery) {
        const dataSource = searchQuery.filter.sina.allDataSource;
        const dataSourceItems = [
            this.sina._createDataSourceResultSetItem({
                dataSource: searchQuery.filter.sina.dataSources[1],
                dimensionValueFormatted: dataSource.labelPlural,
                measureValue: 4,
                measureValueFormatted: "4", // 4 scientists currently
            }),
            this.sina._createDataSourceResultSetItem({
                dataSource: searchQuery.filter.sina.dataSources[2],
                dimensionValueFormatted: dataSource.labelPlural,
                measureValue: 5,
                measureValueFormatted: "5", // 5 sightings currently
            }),
        ];
        if (searchQuery.filter.sina.dataSources[3]) {
            dataSourceItems[2] = this.sina._createDataSourceResultSetItem({
                dataSource: searchQuery.filter.sina.dataSources[3],
                dimensionValueFormatted: dataSource.labelPlural,
                measureValue: 1,
                measureValueFormatted: "1", // 1 publication currently
            });
        }

        const dataSourceFacets = [
            this.sina._createDataSourceResultSet({
                title: searchQuery.filter.dataSource.label,
                items: dataSourceItems,
                query: searchQuery,
                facetTotalCount: undefined,
            }),
        ];
        return dataSourceFacets;
    }

    generateFacets(searchQuery: SearchQuery | ChartQuery): Array<FacetResultSet> {
        if (
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.All ||
            searchQuery.filter.dataSource.type === this.sina.DataSourceType.UserCategory ||
            (searchQuery instanceof SearchQuery &&
                (searchQuery.calculateFacets === undefined || searchQuery.calculateFacets === false))
        ) {
            return this.getTopFacetOnly(searchQuery as SearchQuery);
        }
        const chartResultSetArray = [];
        let chartResultSet;
        const gen = this.templateProvider(this);

        const filter = this.sina.createFilter({
            searchTerm: this.searchQuery.filter.searchTerm,
            dataSource: this.searchQuery.filter.dataSource,
            rootCondition: this.searchQuery.filter.rootCondition.clone(),
        });
        let chartResultSetItems = [];
        let resultSetItemsArray;

        // get the right resultsetitems
        if (searchQuery.filter.dataSource.id === Provider.dataSourceIds.Publications) {
            resultSetItemsArray = gen.searchResultSetItemArray3;
        } else if (
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.Scientists ||
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.Folklorists
        ) {
            resultSetItemsArray = gen.searchResultSetItemArray;
        } else if (
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.Urban_Legends ||
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.Mysterious_Sightings
        ) {
            resultSetItemsArray = gen.searchResultSetItemArray2;
        }

        //  Location Facet
        if (
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.Scientists ||
            searchQuery.filter.dataSource.id === Provider.dataSourceIds.Mysterious_Sightings
        ) {
            chartResultSetItems = this.getChartResultSetItemsForLocations(resultSetItemsArray);

            chartResultSet = this.sina._createChartResultSet({
                items: chartResultSetItems,
                query: this.sina.createChartQuery({
                    filter: filter,
                    dimension: "LOCATION",
                }),
                title: "Locations",
                facetTotalCount: undefined,
            });
            chartResultSetArray.push(chartResultSet);
        }

        // Scientist or Folklorist Facet
        const info = this.getSientistOrFolkloristFacet(searchQuery, resultSetItemsArray);
        chartResultSetItems = info[0];
        const dimension = info[1];

        chartResultSet = this.sina._createChartResultSet({
            items: chartResultSetItems,
            query: this.sina.createChartQuery({
                filter: filter,
                dimension: dimension,
            }),
            title: dimension.charAt(0).toUpperCase() + dimension.slice(1).toLowerCase() + "s",
            facetTotalCount: undefined,
        });
        chartResultSetArray.push(chartResultSet);

        return chartResultSetArray;
    }
}
