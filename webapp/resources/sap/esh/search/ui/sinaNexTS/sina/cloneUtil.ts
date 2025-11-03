/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { CloneService } from "../core/clone";
import { AttributeMetadata } from "./AttributeMetadata";
import { DataSource } from "./DataSource";
import { NavigationTarget } from "./NavigationTarget";
import { SearchResultSet } from "./SearchResultSet";
import { SearchResultSetItem } from "./SearchResultSetItem";
import { SearchResultSetItemAttribute } from "./SearchResultSetItemAttribute";
import { SearchResultSetItemAttributeGroup } from "./SearchResultSetItemAttributeGroup";
import { SearchResultSetItemAttributeGroupMembership } from "./SearchResultSetItemAttributeGroupMembership";

/* 
- clone service which clones sina objects
- the clone includes only public (= to be used by stakeholder developers) properties
*/

const cloneService = new CloneService({
    classes: [
        {
            class: SearchResultSet,
            properties: ["items"],
        },
        {
            class: SearchResultSetItem,
            properties: [
                "attributes",
                "attributesMap",
                "dataSource",
                "defaultNavigationTarget",
                "detailAttributes",
                "navigationTargets",
                "titleAttributes",
                "titleDescriptionAttributes",
            ],
        },
        {
            class: SearchResultSetItemAttribute,
            properties: [
                "id",
                "value",
                "valueFormatted",
                "valueHighlighted",
                "defaultNavigationTarget",
                "isHighlighted",
                "metadata",
                "navigationTargets",
            ],
        },
        {
            class: SearchResultSetItemAttributeGroup,
            properties: ["id", "metadata", "template", "attributes", "displayAttributes"],
        },
        {
            class: SearchResultSetItemAttributeGroupMembership,
            properties: ["attribute", "group", "metadata", "valueFormatted"],
        },
        { class: DataSource, properties: ["id", "label", "labelPlural"] },
        { class: AttributeMetadata, properties: ["id", "label", "type", "isKey", "format"] },
        {
            class: NavigationTarget,
            cloneFunction: (obj: NavigationTarget) => {
                const objInClosure = obj;
                return {
                    text: obj.text,
                    tooltip: obj.tooltip,
                    icon: obj.icon,
                    target: obj.target,
                    targetUrl: obj.targetUrl,
                    targetFunction:
                        typeof obj.targetFunction === "function"
                            ? obj.targetFunction.bind(objInClosure)
                            : undefined,
                    performNavigation:
                        typeof obj.performNavigation === "function"
                            ? obj.performNavigation.bind(objInClosure)
                            : undefined,
                };
            },
        },
    ],
});

export function clonePublic(obj: unknown): unknown {
    return cloneService.clone(obj);
}
