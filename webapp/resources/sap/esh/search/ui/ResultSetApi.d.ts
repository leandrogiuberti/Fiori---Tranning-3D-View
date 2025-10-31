declare module "sap/esh/search/ui/ResultSetApi" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Event from "sap/ui/base/Event";
    /**
     * Result set
     */
    interface ResultSet {
        items: Array<ResultSetItem>;
    }
    /**
     * Result set item
     */
    interface ResultSetItem {
        key: string;
        data: ResultSetItemData;
        title: string;
        selected: boolean;
        setSelected: (select: boolean) => void;
        selectionEnabled: boolean;
        setSelectionEnabled: (enable: boolean) => void;
        customItemStyleClass: string;
        setCustomItemStyleClass: (customItemStyleClass: string) => void;
    }
    interface ResultSetItemData {
        attributes: Array<ResultSetItemAttribute>;
        attributesMap: {
            [id: string]: ResultSetItemAttribute;
        };
        dataSource: DataSource;
        defaultNavigationTarget: NavigationTarget;
        detailAttributes: Array<ResultSetItemAttribute>;
        navigationTargets: Array<NavigationTarget>;
        titleAttributes: Array<ResultSetItemAttribute>;
        titleDescriptionAttributes: Array<ResultSetItemAttribute>;
    }
    interface ResultSetItemAttribute {
        defaultNavigationTarget: NavigationTarget;
        id: string;
        isHighlighted: boolean;
        metadata: AttributeMetadata;
        navigationTargets: Array<NavigationTarget>;
        value: string | number | boolean;
        valueFormatted: string;
        valueHighlighted: string;
    }
    interface DataSource {
        id: string;
        label: string;
        labelPlural: string;
    }
    interface NavigationTarget {
        text: string;
        tooltip: string;
        icon: string;
        target: string;
        targetUrl: string;
        targetFunction: (event: Event) => void;
        performNavigation: (obj: NavigationTarget) => void;
    }
    interface AttributeMetadata {
        id: string;
        isKey: boolean;
        label: string;
        type: AttributeType;
        format: string;
    }
    enum AttributeType {
        Double = "Double",
        Integer = "Integer",
        String = "String",
        ImageUrl = "ImageUrl",
        ImageBlob = "ImageBlob",
        Timestamp = "Timestamp"
    }
}
//# sourceMappingURL=ResultSetApi.d.ts.map