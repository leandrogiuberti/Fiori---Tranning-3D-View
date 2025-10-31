declare module "sap/esh/search/ui/SearchModelTypes" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import MessageType from "sap/ui/core/message/MessageType";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    interface OrderBy {
        orderBy: string;
        sortOrder: "ASC" | "DESC";
    }
    interface UrlParameters {
        datasource?: string;
        searchterm?: string;
        top?: string;
        filter?: string;
        orderby?: string;
        sortorder?: "ASC" | "DESC";
    }
    interface ListItem {
        type: ListItemType;
    }
    enum ListItemType {
        footer = "footer",
        appcontainer = "appcontainer",
        resultListItem = "resultListItem"
    }
    type DataSourcesFilterFunction = (dataSources: Array<DataSource>) => Array<DataSource>;
    interface SearchQueryParameters {
        filter: Filter;
        top?: number;
        orderBy?: OrderBy;
    }
    interface SearchNavigationTargetParameters extends SearchQueryParameters {
        label?: string;
        encodeFilter?: boolean;
        updateUrl?: boolean;
    }
    interface Message {
        type: MessageType;
        name: string;
        message: string;
        details?: string;
        solution?: string;
    }
}
//# sourceMappingURL=SearchModelTypes.d.ts.map