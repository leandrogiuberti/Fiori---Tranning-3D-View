/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import { SearchResultSetItemAttribute } from "../sinaNexTS/sina/SearchResultSetItemAttribute";
import { UISinaObjectSuggestion } from "./SuggestionType";
import { NavigationTarget } from "../sinaNexTS/sina/NavigationTarget";
import { AttributeType } from "../sinaNexTS/sina/AttributeType";

export default class Formatter {
    private assembleLabel1(sinaSuggestion: UISinaObjectSuggestion): {
        label: string;
        isHighlighted: boolean;
    } {
        const title = [];
        let isHighlighted = false;
        let attribute;
        const titleAttributes = sinaSuggestion.object.titleAttributes;
        for (let i = 0; i < titleAttributes.length; ++i) {
            attribute = titleAttributes[i];
            if (attribute.metadata?.type === AttributeType.ImageUrl) {
                continue;
            }
            title.push(attribute.valueHighlighted);
            if (attribute.isHighlighted) {
                isHighlighted = true;
            }
        }
        return {
            label: title.join(" "),
            isHighlighted: isHighlighted,
        };
    }

    private assembleLabel2(label1IsHighlighted: boolean, sinaSuggestion: UISinaObjectSuggestion): string {
        const detailAttributes = sinaSuggestion.object.detailAttributes;
        let attribute;

        if (detailAttributes.length === 0) {
            return "";
        }

        if (!label1IsHighlighted) {
            attribute = this.getFirstHighlightedAttribute(detailAttributes);
            if (attribute) {
                return attribute.valueHighlighted;
            }
        }

        attribute = this.getFirstStringAttribute(detailAttributes);
        if (attribute) {
            return attribute.label + ": " + attribute.valueHighlighted;
        }

        return "";
    }

    private getFirstHighlightedAttribute(attributes) {
        for (let i = 0; i < attributes.length; ++i) {
            const attribute = attributes[i];
            if (attribute.isHighlighted) {
                return attribute;
            }
        }
    }

    private getFirstStringAttribute(attributes) {
        const sortOrder = {
            Date: 40,
            Double: 70,
            GeoJson: 130,
            ImageBlob: 120,
            ImageUrl: 110,
            Integer: 60,
            String: 10,
            Time: 50,
            Timestamp: 30,
        };
        if (attributes.length === 0) {
            return null;
        }
        attributes = attributes.slice();
        attributes.sort(function (a1, a2) {
            return sortOrder[a1.metadata.type] - sortOrder[a2.metadata.type];
        });
        const attribute = attributes[0];
        if (sortOrder[attribute.metadata.type] > 100) {
            return null;
        }
        return attribute;
    }

    private assembleNavigation(sinaSuggestion: UISinaObjectSuggestion): null | NavigationTarget {
        if (!sinaSuggestion.object.defaultNavigationTarget) {
            return null;
        }
        const navigationTarget = sinaSuggestion.object.defaultNavigationTarget;
        navigationTarget.target = "_blank"; // open in new window
        return navigationTarget;
    }

    private assembleImageUrl(sinaSuggestion: UISinaObjectSuggestion): {
        imageUrl?: string;
        imageExists?: true;
        imageIsCircular?: boolean;
        exists?: false;
    } {
        const aAttributes = sinaSuggestion.object.detailAttributes.concat(
            sinaSuggestion.object.titleAttributes
        );
        for (let i = 0; i < aAttributes.length; ++i) {
            const attribute = aAttributes[i];
            if (
                attribute instanceof SearchResultSetItemAttribute &&
                attribute.metadata.type === attribute.sina.AttributeType.ImageUrl
            ) {
                return {
                    imageUrl: attribute.value,
                    imageExists: true,
                    imageIsCircular:
                        attribute.metadata.format &&
                        attribute.metadata.format === sinaSuggestion.sina.AttributeFormatType.Round,
                };
            }
        }
        return {
            exists: false,
        };
    }

    public format(
        suggestionProvider: {
            model: SearchModel;
            addSuggestion: (
                suggestion: Partial<
                    UISinaObjectSuggestion & {
                        label1: string;
                        label2: string;
                        titleNavigation: null | NavigationTarget;
                    }
                >
            ) => void;
        },
        sinaSuggestion: UISinaObjectSuggestion
    ): void {
        // create suggestion
        const suggestion: Partial<
            UISinaObjectSuggestion & {
                label1: string;
                label2: string;
                titleNavigation: null | NavigationTarget;
            }
        > = sinaSuggestion;

        // assemble label
        const label1 = this.assembleLabel1(sinaSuggestion);
        suggestion.label1 = label1.label;

        // assemble second label (second line in UI)
        suggestion.label2 = this.assembleLabel2(label1.isHighlighted, sinaSuggestion);

        // assemble navigation target
        suggestion.titleNavigation = this.assembleNavigation(sinaSuggestion);

        // assemble image url
        const imageUrl = this.assembleImageUrl(sinaSuggestion);
        sinaSuggestion.sina.core.extend(suggestion, imageUrl);

        // position
        suggestion.position = sinaSuggestion.position;

        // add
        suggestionProvider.addSuggestion(suggestion);
    }
}
