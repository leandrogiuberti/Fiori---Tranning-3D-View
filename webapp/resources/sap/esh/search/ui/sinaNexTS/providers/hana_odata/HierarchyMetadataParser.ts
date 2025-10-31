/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { HierarchyDisplayType } from "../../sina/HierarchyDisplayType";

export interface HierarchyDefinition {
    name: string;
    attributeName: string;
    displayType?: HierarchyDisplayType;
    isHierarchyDefinition: boolean;
    parentAttributeName: string;
    childAttributeName: string;
}

export class HierarchyMetadataParser {
    jQuery: JQueryStatic;
    constructor(jQuery: JQueryStatic) {
        this.jQuery = jQuery;
    }
    parse(entityTypeName: string, hierarchAnnotationNode: Element): { [name: string]: HierarchyDefinition } {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const hierarchyDefinitionsMap = {};
        that.jQuery(hierarchAnnotationNode)
            .find(">Collection")
            .each(function () {
                that.jQuery(this)
                    .find(">Record")
                    .each(function () {
                        const hierarchyDefinition = that.parseRecord(entityTypeName, this);
                        hierarchyDefinitionsMap[hierarchyDefinition.attributeName] = hierarchyDefinition;
                    });
            });
        return hierarchyDefinitionsMap;
    }

    parseRecord(entityTypeName: string, recordNode: Element): HierarchyDefinition {
        const hierarchyDefinition: HierarchyDefinition = {
            name: "", // name of hierarchy
            attributeName: "", // name of attribute
            displayType: HierarchyDisplayType.DynamicHierarchyFacet,
            isHierarchyDefinition: false, // entity set represents the hierarchy (self reference)
            parentAttributeName: "",
            childAttributeName: "",
        };
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        that.jQuery(recordNode)
            .find(">PropertyValue")
            .each(function () {
                switch (that.jQuery(this).attr("Property")) {
                    case "Definition":
                        hierarchyDefinition.name = that.jQuery(this).attr("String");
                        break;
                    case "Name":
                        hierarchyDefinition.attributeName = that.jQuery(this).attr("String");
                        break;
                    case "displayType":
                        switch (that.jQuery(this).attr("String")) {
                            case "TREE":
                                hierarchyDefinition.displayType = HierarchyDisplayType.StaticHierarchyFacet;
                                break;
                            case "FLAT":
                                hierarchyDefinition.displayType = HierarchyDisplayType.HierarchyResultView;
                                break;
                        }
                        break;
                    case "Recurse":
                        Object.assign(hierarchyDefinition, that.parseRecurse(this));
                }
            });
        hierarchyDefinition.isHierarchyDefinition = that.calculateIsHierarchyDefinition(
            entityTypeName,
            hierarchyDefinition.name
        );

        // this is a helper hierarchy datasource, no displayType
        // displayType is defined by the hierarchy attribute of the main datasource
        if (hierarchyDefinition.isHierarchyDefinition) {
            delete hierarchyDefinition.displayType;
        }
        return hierarchyDefinition;
    }

    calculateIsHierarchyDefinition(entityTypeName: string, name: string): boolean {
        // normalize entityTypeName
        if (entityTypeName.endsWith("Type")) {
            entityTypeName = entityTypeName.slice(0, -4);
        }
        // normalize hierarchy name
        name = name.replace(/[.:]/g, "");
        return entityTypeName === name;
    }

    parseRecurse(recurseNode: Element): { parentAttributeName: string; childAttributeName: string } {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const result = { parentAttributeName: "", childAttributeName: "" };
        that.jQuery(recurseNode)
            .find("PropertyValue")
            .each(function () {
                switch (that.jQuery(this).attr("Property")) {
                    case "Parent":
                        that.jQuery(this)
                            .find("Collection")
                            .each(function () {
                                result.parentAttributeName = that.parseCollection(this);
                            });
                        break;
                    case "Child":
                        that.jQuery(this)
                            .find(">Collection")
                            .each(function () {
                                result.childAttributeName = that.parseCollection(this);
                            });
                }
            });
        return result;
    }

    parseCollection(collectionNode: Element): string {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        let attributeName;
        that.jQuery(collectionNode)
            .find(">PropertyPath")
            .each(function () {
                attributeName = that.jQuery(this).text();
            });
        return attributeName;
    }
}
