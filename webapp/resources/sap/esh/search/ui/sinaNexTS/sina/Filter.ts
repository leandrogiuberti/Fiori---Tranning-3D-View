/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource, DataSourceJSON } from "./DataSource";
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { SimpleCondition, SimpleConditionJSON } from "./SimpleCondition";
import { ComplexCondition, ComplexConditionJSON } from "./ComplexCondition";
import { InternalSinaError } from "../core/errors";
import { Condition } from "./Condition";
import { HierarchyDisplayType } from "./HierarchyDisplayType";
import { DataSourceSubType } from "./DataSourceType";
import { getText } from "./i18n";
import { AttributeMetadata } from "./AttributeMetadata";
export interface FilterJSON {
    dataSource: DataSourceJSON;
    searchTerm: string;
    rootCondition: ComplexConditionJSON | SimpleConditionJSON;
}
export interface FilterOptions extends SinaObjectProperties {
    dataSource?: DataSource;
    searchTerm?: string;
    rootCondition?: Condition;
}

export class Filter extends SinaObject {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.getAllDataSource();
    //             }
    //         },
    //         searchTerm: {
    //             required: false,
    //             default: '',
    //             setter: true
    //         },
    //         rootCondition: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.createComplexCondition();
    //             },
    //             setter: true
    //         }
    //     }
    // },

    dataSource: DataSource;
    searchTerm = "";
    rootCondition: Condition;

    constructor(properties: FilterOptions) {
        super(properties);
        this.dataSource = properties.dataSource ?? this.sina.getAllDataSource();
        this.searchTerm = properties.searchTerm ?? this.searchTerm;
        this.rootCondition = properties.rootCondition ?? new ComplexCondition({ sina: this.sina });
    }

    setSearchTerm(searchTerm: string): void {
        this.searchTerm = searchTerm;
    }

    setRootCondition(rootCondition: Condition): void {
        this.rootCondition = rootCondition;
        if (this.sina && !this.rootCondition.sina) {
            // pass sina recursively to condition tree
            // (rootCondition may have no sina because it was assembled by PublicSearchUtil before sina was created)
            this.rootCondition.setSina(this.sina);
        }
    }

    clone(): Filter {
        return new Filter({
            sina: this.sina,
            dataSource: this.dataSource,
            searchTerm: this.searchTerm,
            rootCondition: this.rootCondition.clone(),
        });
    }

    equals(other: Filter): boolean {
        return (
            other instanceof Filter &&
            this.dataSource === other.dataSource &&
            this.searchTerm === other.searchTerm &&
            this.rootCondition.equals(other.rootCondition)
        );
    }

    _getAttribute(condition: Condition): string {
        if (condition instanceof SimpleCondition) {
            return condition.attribute;
        }

        for (let i = 0; i < (condition as ComplexCondition).conditions.length; ++i) {
            const attribute = this._getAttribute((condition as ComplexCondition).conditions[i]);
            if (attribute) {
                return attribute;
            }
        }
    }

    setDataSource(dataSource: DataSource): void {
        if (this.dataSource === dataSource) {
            return;
        }
        this.dataSource = dataSource;
        this.resetConditions();
    }

    resetConditions(): void {
        if (this.rootCondition instanceof ComplexCondition) {
            this.rootCondition.resetConditions();
        } else {
            throw new Error("Method is not applicable for SimpleCondition");
        }
    }

    autoInsertCondition(condition: Condition): void {
        if (this.rootCondition instanceof ComplexCondition) {
            this.rootCondition.autoInsertCondition(condition);
        } else {
            throw new Error("Method is not applicable for SimpleCondition");
        }
    }

    autoRemoveCondition(condition: Condition): void {
        if (this.rootCondition instanceof ComplexCondition) {
            this.rootCondition.autoRemoveCondition(condition);
        } else {
            throw new Error("Method is not applicable for SimpleCondition");
        }
    }

    isFolderMode(): boolean {
        // 1. check feature flag
        if (!this.sina.configuration?.folderMode) {
            return false;
        }
        // 2. check metadata
        // 2.1 check for hierarchy attribute in datsource
        const hierarchyAttributes = this.dataSource.attributesMetadata.filter(
            (attribute) =>
                (attribute as AttributeMetadata).isHierarchy &&
                (attribute as AttributeMetadata).hierarchyDisplayType ===
                    HierarchyDisplayType.StaticHierarchyFacet
        );
        const hierarchyAttributeExists = hierarchyAttributes.length > 0;
        // 2.2 check whether datasource itself is a hierarchy datasource
        const isHierarchyDataSource =
            this.dataSource.isHierarchyDataSource &&
            this.dataSource.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView;
        if (!hierarchyAttributeExists && !isHierarchyDataSource) {
            return false;
        }
        // 3. check datasource type
        if (this.dataSource.subType === DataSourceSubType.Filtered) {
            return false; // search mode
        }
        // 4. check query
        // 4.1 check folder filter conditions
        const folderAttribute = this.getFolderAttribute();
        const filterAttributes = this.rootCondition.getAttributes();
        const folderFilterAttributes = filterAttributes.filter((attribute) => attribute === folderAttribute);
        const noneFolderFilterAttributes = filterAttributes.filter(
            (attribute) => attribute != folderAttribute
        );
        if (!this.sina.configuration.folderModeForInitialSearch) {
            if (folderFilterAttributes.length === 0) {
                return false;
            }
        }
        // 4.2 check search term
        if (
            (this.searchTerm.length === 0 || this.searchTerm.trim() === "*") &&
            noneFolderFilterAttributes.length === 0
        ) {
            return true; // folder mode
        } else {
            return false; // search mode
        }
    }

    getFolderAttribute(): string {
        // use case 1: we are displaying an hierarchy (helper) datasource
        if (
            this.dataSource.isHierarchyDataSource &&
            this.dataSource.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView
        ) {
            return this.dataSource.hierarchyAttribute;
        }
        // use case 2: we display a "regular" datasource with associatea hierarchy helper datasource
        const hierarchyAttributes = this.dataSource.attributesMetadata.filter(
            (attribute) =>
                (attribute as AttributeMetadata).isHierarchy &&
                (attribute as AttributeMetadata).hierarchyDisplayType ===
                    HierarchyDisplayType.StaticHierarchyFacet
        );
        if (hierarchyAttributes.length === 0) {
            throw new InternalSinaError({ message: getText("error.sina.hierarchyAttributesMissing") });
        }
        return hierarchyAttributes[0].id;
    }

    toJson(): FilterJSON {
        return {
            dataSource: this.dataSource.toJson(),
            searchTerm: this.searchTerm,
            rootCondition: this.rootCondition.toJson(),
        };
    }
}
