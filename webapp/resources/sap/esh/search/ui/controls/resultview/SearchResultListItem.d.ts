declare module "sap/esh/search/ui/controls/resultview/SearchResultListItem" {
    import InvisibleText from "sap/ui/core/InvisibleText";
    import RenderManager from "sap/ui/core/RenderManager";
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import CustomListItem from "sap/m/CustomListItem";
    interface $SearchResultListItemSettings extends $ControlSettings {
        dataSource: DataSource;
        itemId: string;
        title: string;
        isTitleHighlighted: boolean | PropertyBindingInfo;
        titleDescription: string;
        isTitleDescriptionHighlighted: boolean | PropertyBindingInfo;
        titleNavigation: NavigationTarget | PropertyBindingInfo;
        titleIconUrl: string | PropertyBindingInfo;
        titleInfoIconUrl: string | PropertyBindingInfo;
        geoJson: unknown;
        type: string;
        imageUrl: string;
        imageFormat: string;
        imageNavigation: NavigationTarget | PropertyBindingInfo;
        attributes: Array<unknown> | PropertyBindingInfo;
        navigationObjects: Array<NavigationTarget> | PropertyBindingInfo;
        selected: boolean | PropertyBindingInfo;
        selectionEnabled: boolean | PropertyBindingInfo;
        customItemStyleClass: string | PropertyBindingInfo;
        expanded: boolean | PropertyBindingInfo;
        parentListItem: CustomListItem;
        additionalParameters: unknown;
        positionInList: number | PropertyBindingInfo;
        resultSetId: string | PropertyBindingInfo;
        layoutCache: object | PropertyBindingInfo;
        countBreadcrumbsHiddenElement: InvisibleText;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchResultListItem extends Control {
        static readonly metadata: {
            properties: {
                dataSource: string;
                itemId: string;
                title: string;
                isTitleHighlighted: string;
                titleDescription: string;
                isTitleDescriptionHighlighted: string;
                titleNavigation: string;
                titleIconUrl: string;
                titleInfoIconUrl: string;
                titleInfoIconTooltip: string;
                geoJson: string;
                type: string;
                imageUrl: string;
                imageFormat: string;
                imageNavigation: string;
                attributes: {
                    type: string;
                    multiple: boolean;
                };
                navigationObjects: {
                    type: string;
                    multiple: boolean;
                };
                selected: string;
                selectionEnabled: string;
                customItemStyleClass: string;
                expanded: string;
                parentListItem: string;
                additionalParameters: string;
                positionInList: string;
                resultSetId: string;
                layoutCache: string;
                countBreadcrumbsHiddenElement: string;
            };
            aggregations: {
                _titleLink: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _titleText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _titleLinkDescription: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _titleInfoIcon: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _titleDelimiter: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _typeText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _typeLink: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _typeLinkAriaDescription: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _multiLineDescriptionText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _selectionCheckBox: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _expandButton: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _attributeLabels: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _attributeValues: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _attributeValuesWithoutWhyfoundHiddenTexts: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _relatedObjectActionsToolbar: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _titleLabeledByText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _attributesLabeledByText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _expandStateLabeledByText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
            };
        };
        static readonly noValue = "\u2013";
        private _visibleAttributes;
        private _detailsArea;
        private _showExpandButton;
        private _searchResultListPrefix;
        private _zoomIcon;
        constructor(sId?: string, settings?: Partial<$SearchResultListItemSettings>);
        static renderer: Record<string, unknown>;
        /**
         * override setProperty to sync selection CSS class when selected property changes
         */
        setProperty(name: string, value: unknown, suppressInvalidate?: boolean): this;
        protected _renderer(oRm: RenderManager, oControl: SearchResultListItem): void;
        private _renderContainer;
        protected _renderContentContainer(oRm: RenderManager, oControl: SearchResultListItem): void;
        private _renderExpandButtonContainer;
        protected _renderTitleContainer(oRm: RenderManager, oControl: SearchResultListItem): void;
        protected _renderCheckbox(oRm: RenderManager): void;
        protected _renderImageForPhone(oRm: RenderManager): void;
        private _renderImageForDocument;
        private _cutDescrAttributeOutOfAttributeList;
        private _renderMultiLineDescription;
        protected _renderAttributesContainer(oRm: RenderManager): void;
        protected _renderAllAttributes(oRm: RenderManager, itemAttributes: Array<unknown>): void;
        private _howManyColumnsToUseForLongTextAttribute;
        private _renderImageAttribute;
        protected _renderRelatedObjectsToolbar(oRm: RenderManager): void;
        private _renderAccessibilityInformation;
        getAccessibilityInfo(...args: unknown[]): Record<string, unknown>;
        private _renderAriaDescriptionElementForTitle;
        private _renderAriaDescriptionElementForAttributes;
        private _renderAriaDescriptionElementForCollapsedOrExpandedState;
        private _addAriaDescriptionToParentListElement;
        protected _getExpandAreaObjectInfo(): {
            resultListItem: Element;
            attributesExpandContainer: HTMLElement;
            currentHeight: number;
            expandedHeight: number;
            elementsToFadeInOrOut: Array<HTMLElement>;
            expandAnimationDuration: number;
            fadeInOrOutAnimationDuration: number;
            relatedObjectsToolbar: HTMLElement;
        };
        private _getElementsInExpandArea;
        private _syncSelectionCssClass;
        isShowingDetails(): boolean;
        showDetails(): void;
        hideDetails(): void;
        toggleDetails(): void;
        onAfterRendering(): void;
        resizeEventHappened(): void;
        private isHierarchyItem;
        private supportsDragAndDrop;
        private _getPhoneSize;
        private _resetPrecalculatedValues;
        private _showOrHideExpandButton;
        setAriaExpandedState(): boolean;
        private _registerItemPressHandler;
        private _performTitleNavigation;
        private adjustCssDragAndDrop;
    }
}
//# sourceMappingURL=SearchResultListItem.d.ts.map