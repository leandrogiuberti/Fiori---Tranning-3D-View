declare module "sap/esh/search/ui/SearchResultFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchResultBaseFormatter from "sap/esh/search/ui/SearchResultBaseFormatter";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    interface FormattedResultItem {
        key?: string;
        keystatus?: string;
        dataSource?: DataSource;
        dataSourceName?: string;
        attributesMap?: any;
        sinaItem?: SearchResultSetItem;
        titleIconUrl?: string;
        imageUrl?: string;
        imageFormat?: string;
        imageNavigation?: NavigationTarget;
        geoJson?: {
            value: string;
            label: string;
        };
        title?: string;
        titleHighlighted?: string;
        isTitleHighlighted?: boolean;
        titleInfoIconUrl?: string;
        titleInfoIconTooltip?: string;
        titleDescription?: string;
        titleDescriptionLabel?: string;
        isTitleDescriptionHighlighted?: boolean;
        titleNavigation?: NavigationTarget;
        itemattributes?: Array<FormattedResultItemAttribute>;
        navigationObjects?: Array<NavigationTarget>;
        layoutCache?: any;
        additionalParameters?: FormattedResultItemAdditionalParameters;
        selected?: boolean;
        selectionEnabled?: boolean;
        customItemStyleClass?: string;
        expanded?: boolean;
        positionInList?: number;
        resultSetId?: string;
        cells?: Array<any>;
        hierarchyNodePath?: HierarchyNodePath;
    }
    interface FormattedResultItemAdditionalParameters {
        isDocumentConnector?: boolean;
        imageUrl?: string;
        titleUrl?: string;
        suvlink?: string;
        containsThumbnail?: boolean;
        containsSuvFile?: boolean;
    }
    interface FormattedResultItemAttribute {
        name?: string;
        valueRaw?: any;
        sinaAttribute?: SearchResultSetItemAttribute;
        value?: any;
        valueWithoutWhyfound?: string;
        key?: string;
        isTitle?: boolean;
        isSortable?: boolean;
        displayOrder?: number;
        whyfound?: boolean;
        defaultNavigationTarget?: NavigationTarget;
        hidden?: boolean;
        longtext?: string;
        iconUrl?: string;
        subAttributes?: Array<string>;
        tooltip?: string;
    }
    export default class SearchResultFormatter extends SearchResultBaseFormatter {
        constructor(model: SearchModel);
        format(searchResultSet: SearchResultSet, terms?: any, options?: any): Array<FormattedResultItem>;
        private _formatAttributeGroup;
        private _formatSingleAttribute;
        private _formatBasedOnGroupTemplate;
        private _formatResultForDocuments;
        _formatResultForNotes(resultItem: SearchResultSetItem, additionalParameters: FormattedResultItemAdditionalParameters): void;
    }
}
//# sourceMappingURL=SearchResultFormatter.d.ts.map